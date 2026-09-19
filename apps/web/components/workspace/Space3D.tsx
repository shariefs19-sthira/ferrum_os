"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import type { StudioPlan } from "../../lib/types"
import { getPlanWalls, planWallSolids, wallSolidsDigest } from "../../lib/workspace/walls"
import { planFingerprint } from "../../lib/workspace/boqLineage"
import { sampleSiteContext } from "../../lib/workspace/sampleSiteContext"
import { useFullscreenState } from "./FullscreenController"
import { decodeWorkspaceView } from "../../lib/workspace/viewPermalink"
import type { BuildingShell } from "../../lib/designstudio/shellCatalog"
import { WebGLPathTracer } from "three-gpu-pathtracer"
import { designStudioRenderStack } from "../../lib/designstudio/renderStack"
import { cameraPathWaypoints, describeManifest, generateCameraPath, sampleCameraPath, type CameraPath } from "../../lib/designstudio/cameraPath"
import WalkthroughControl, { type RecordingState, type WalkthroughView } from "./WalkthroughControl"

const concrete = 0xf4f2ec
const glass = 0x93bac2
const metal = 0x202a30

export type RenderQualityChoice = "auto" | "reduced" | "high"
export type RenderQualityReason = "demo" | "user-reduced" | "user-high" | "auto-fallback" | "url-reduced" | "url-full" | "fullscreen-high" | "mobile-default" | "software-renderer" | "device-default"

// One place decides full vs reduced so the status line can only ever report
// what the renderer actually did. Explicit user choice outranks device
// heuristics; only the demo and a measured low-fps fallback outrank the user.
export function resolveRenderQuality(input: { choice: RenderQualityChoice; demoMode: boolean; mobile: boolean; softwareRenderer: boolean; urlProfile: string | null; fullscreenHigh: boolean; fellBack: boolean }): { lowPower: boolean; reason: RenderQualityReason } {
  if (input.demoMode) return { lowPower: true, reason: "demo" }
  if (input.fellBack) return { lowPower: true, reason: "auto-fallback" }
  if (input.choice === "reduced") return { lowPower: true, reason: "user-reduced" }
  if (input.choice === "high") return { lowPower: false, reason: "user-high" }
  if (input.fullscreenHigh) return { lowPower: false, reason: "fullscreen-high" }
  if (input.urlProfile === "full") return { lowPower: false, reason: "url-full" }
  if (input.urlProfile === "reduced") return { lowPower: true, reason: "url-reduced" }
  if (input.mobile) return { lowPower: true, reason: "mobile-default" }
  if (input.softwareRenderer) return { lowPower: true, reason: "software-renderer" }
  return { lowPower: false, reason: "device-default" }
}

const qualityReasonLabel: Record<RenderQualityReason, string> = {
  demo: "demo", "user-reduced": "your choice", "user-high": "your choice", "auto-fallback": "auto-fallback, low fps",
  "url-reduced": "link setting", "url-full": "link setting", "fullscreen-high": "fullscreen", "mobile-default": "mobile default",
  "software-renderer": "software GL", "device-default": "auto",
}
const qualityOptions: { value: RenderQualityChoice; label: string; hint: string }[] = [
  { value: "auto", label: "Auto", hint: "Device-appropriate default with automatic fallback" },
  { value: "reduced", label: "Reduced", hint: "Flat shading, no shadows or reflections" },
  { value: "high", label: "High", hint: "Shadows, reflections and PBR materials; may be slow on some phones" },
]
// The browser view is Three.js only. V-Ray is an optional user-installed export
// plugin (see renderStack.ts) and is never run or bundled here.
const vrayBoundary = designStudioRenderStack.find((item) => item.id === "vray-plugin")
const rendererBoundaryNote = `Rendered in-browser with Three.js (${designStudioRenderStack.find((item) => item.id === "three")?.license ?? "MIT"}). ${vrayBoundary?.name ?? "V-Ray export plugin"} is an ${vrayBoundary?.status.toLowerCase() ?? "plugin only"} handoff and does not run in this view.`

const STEP_SECONDS = 3
const idleWalk = (durationS = 24): WalkthroughView => ({ status: "idle", progress: 0, elapsedS: 0, durationS, stepped: false })
type WalkthroughApi = { play: () => void; pause: () => void; restart: () => void; path: CameraPath; engine: string; stepped: () => boolean }

export default function Space3D({ plan, demoMode = false, contextLabel = "SAMPLE LOCATION Bengaluru, Karnataka", shell }: { plan: StudioPlan; demoMode?: boolean; contextLabel?: string; shell?: BuildingShell }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState("Podium")
  const [profile, setProfile] = useState<"full" | "reduced" | "diagram">("full")
  const [quality, setQuality] = useState<RenderQualityChoice>("auto")
  const [qualityReason, setQualityReason] = useState<RenderQualityReason>("device-default")
  const [fellBack, setFellBack] = useState(false)
  const [beautyMode, setBeautyMode] = useState(false)
  // Wall model: swaps the glazed massing block for the canonical walls, openings
  // and room floors of the plan, so a 2D wall edit is visible here immediately.
  const [wallModel, setWallModelState] = useState(false)
  useEffect(() => {
    try { if (window.sessionStorage.getItem("ferrum-3d-wall-model") === "on") setWallModelState(true) } catch { /* storage unavailable: default off */ }
  }, [])
  const setWallModel = (update: (current: boolean) => boolean) => setWallModelState((current) => {
    const next = update(current)
    try { window.sessionStorage.setItem("ferrum-3d-wall-model", next ? "on" : "off") } catch { /* preference stays in memory */ }
    return next
  })
  const [contextLost, setContextLost] = useState(false)
  const fullscreen = useFullscreenState()
  const walkApi = useRef<WalkthroughApi | null>(null)
  const recorder = useRef<{ media: MediaRecorder; chunks: Blob[]; canvas: HTMLCanvasElement } | null>(null)
  const [walk, setWalk] = useState<WalkthroughView>(idleWalk())
  const [recordingSupported, setRecordingSupported] = useState(false)
  const [recording, setRecording] = useState<RecordingState>("off")
  const [exportNote, setExportNote] = useState("")
  const recordingRef = useRef<RecordingState>("off")
  recordingRef.current = recording

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const mobile = matchMedia("(max-width: 767px)").matches
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches
    const requestedProfile = new URLSearchParams(location.search).get("renderProfile")
    const supportsWebGl2 = Boolean(document.createElement("canvas").getContext("webgl2"))
    if (!supportsWebGl2) {
      setProfile("diagram")
      host.dataset.renderProfile = "diagram"
      return
    }
    setContextLost(false) // clear any prior lost-context state on a fresh mount
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe7ecec)

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile || quality === "high", powerPreference: "high-performance" })
    const gl = renderer.getContext()
    const rendererInfo = gl.getExtension("WEBGL_debug_renderer_info")
    const rendererName = rendererInfo ? String(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)) : ""
    const softwareRenderer = /swiftshader|software/i.test(rendererName)
    const { lowPower, reason } = resolveRenderQuality({ choice: quality, demoMode, mobile, softwareRenderer, urlProfile: requestedProfile, fullscreenHigh: fullscreen.profile === "high", fellBack })
    setProfile(lowPower ? "reduced" : "full")
    setQualityReason(reason)
    const pixelRatio = Math.min(devicePixelRatio, lowPower ? 1 : mobile ? 1.5 : 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.shadowMap.enabled = !lowPower
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.autoClear = false
    // setSize(..., false) leaves the canvas at its backing-store size, which is
    // pixelRatio x the host; pin the CSS box to the host so high-DPR screens
    // (phones especially) show the whole scene instead of a cropped corner.
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" })
    host.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const environment = lowPower ? null : (() => {
      const roomEnvironment = new RoomEnvironment()
      const texture = pmrem.fromScene(roomEnvironment, 0.04).texture
      roomEnvironment.dispose()
      return texture
    })()
    scene.environment = environment

    const sun = new THREE.DirectionalLight(0xfff2dc, 3.2)
    sun.position.set(28, 44, 22)
    sun.castShadow = !lowPower
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x67757b, 1.45))

    const wallColor = shell?.geometry.wallColor ?? concrete
    const roofColor = shell?.geometry.roofColor ?? metal
    const accentColor = shell?.geometry.accentColor ?? 0xd59a43
    // Catalogue wall colour is the only shell datum visible on the glazed
    // facade, so blend it in (35%) rather than replace the glass: real data,
    // bounded shift. No shell selected leaves the original glass colour.
    const facadeColor = shell ? new THREE.Color(glass).lerp(new THREE.Color(wallColor), 0.35) : new THREE.Color(glass)
    const concreteMaterial = lowPower ? new THREE.MeshLambertMaterial({ color: wallColor }) : new THREE.MeshPhysicalMaterial({ color: wallColor, roughness: 0.9, metalness: 0.02 })
    const glassMaterial = lowPower ? new THREE.MeshLambertMaterial({ color: facadeColor, transparent: false, opacity: 1 }) : new THREE.MeshPhysicalMaterial({ color: facadeColor, roughness: 0.42, metalness: 0.04, transmission: 0, transparent: false, opacity: 1, envMapIntensity: 0.65 })
    const metalMaterial = lowPower ? new THREE.MeshLambertMaterial({ color: metal }) : new THREE.MeshPhysicalMaterial({ color: metal, metalness: 0.9, roughness: 0.3 })
    const selectedMaterial = lowPower ? new THREE.MeshLambertMaterial({ color: accentColor }) : new THREE.MeshPhysicalMaterial({ color: accentColor, roughness: 0.5, emissive: 0x5c2d00, emissiveIntensity: 0.16 })
    const roofMaterial = lowPower ? new THREE.MeshLambertMaterial({ color: roofColor }) : new THREE.MeshPhysicalMaterial({ color: roofColor, roughness: 0.82, metalness: 0.03 })
    const metresLon=111320*Math.cos(sampleSiteContext.center.lat*Math.PI/180)
    const groundMaterial = lowPower ? new THREE.MeshLambertMaterial({ color: 0xb8c5bc }) : new THREE.MeshPhysicalMaterial({ color: 0xb8c5bc, roughness: 0.72, metalness: 0, envMapIntensity: 0.25 })

    const model = new THREE.Group()
    const extraMaterials: THREE.Material[] = []
    const planModel = wallModel && !demoMode
    let wallModelDigest = ""
    const pickables: THREE.Mesh[] = []
    const baseMaterials = new Map<THREE.Mesh, THREE.Material>()
    const podium = new THREE.Mesh(new THREE.BoxGeometry(plan.plotWidthM * 0.82, 0.5, plan.plotDepthM * 0.82), concreteMaterial)
    podium.name = "proposed-podium"
    podium.position.y = 0.25
    podium.castShadow = !lowPower
    podium.receiveShadow = !lowPower
    podium.userData.label = "Podium"
    pickables.push(podium)
    baseMaterials.set(podium, concreteMaterial)
    model.add(podium)

    const floorHeight = plan.floorHeightM
    for (let floor = 0; floor < plan.floors; floor += 1) {
      const taper = planModel ? 1 : Math.max(0.62, 1 - floor * (shell?.geometry.taperPerFloor ?? 0.025))
      const width = plan.buildingWidthM * taper
      const depth = plan.buildingDepthM * taper
      const y = 0.58 + floor * floorHeight
      if (!planModel) {
      const glazing = new THREE.Mesh(new THREE.BoxGeometry(width * 0.985, floorHeight * 0.82, depth * 0.985), glassMaterial)
      glazing.name = `proposed-opaque-level-${floor + 1}`
      glazing.position.y = y + floorHeight * 0.45
      glazing.castShadow = !lowPower
      glazing.userData.label = `Level ${floor + 1}`
      pickables.push(glazing)
      baseMaterials.set(glazing, glassMaterial)
      model.add(glazing)
      }

      const slab = new THREE.Mesh(new THREE.BoxGeometry(width + 0.7, 0.18, depth + 0.7), concreteMaterial)
      slab.position.y = y
      slab.castShadow = !lowPower
      slab.receiveShadow = !lowPower
      slab.userData.label = `Level ${floor + 1} slab`
      pickables.push(slab)
      baseMaterials.set(slab, concreteMaterial)
      model.add(slab)

      if (!planModel && !lowPower && (shell?.geometry.balconyDepthM ?? 1.45) > 0) {
        const balconyDepth = shell?.geometry.balconyDepthM ?? 1.45
        const balcony = new THREE.Mesh(new THREE.BoxGeometry(width * 0.54, 0.13, balconyDepth), concreteMaterial)
        balcony.position.set(0, y + floorHeight * 0.32, depth / 2 + balconyDepth / 2)
        balcony.castShadow = true
        model.add(balcony)

        for (const x of [-width / 2, width / 2]) {
          const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.13, floorHeight * 0.84, 0.13), metalMaterial)
          mullion.position.set(x * 0.96, y + floorHeight * 0.44, depth / 2 + 0.02)
          model.add(mullion)
        }
      }
    }
    const topTaper = Math.max(0.62, 1 - Math.max(0, plan.floors - 1) * (shell?.geometry.taperPerFloor ?? 0.025))
    const roofWidth = plan.buildingWidthM * topTaper + (shell?.geometry.overhangM ?? 0.6) * 2
    const roofDepth = plan.buildingDepthM * topTaper + (shell?.geometry.overhangM ?? 0.6) * 2
    const roofBaseY = 0.58 + plan.floors * floorHeight
    let roof: THREE.Mesh
    if (shell && shell.geometry.roof !== 'flat') {
      const roofHeight = Math.max(1, Math.tan(shell.geometry.roofPitchDeg * Math.PI / 180) * Math.min(roofWidth, roofDepth) * 0.34)
      const geometry = new THREE.ConeGeometry(Math.max(roofWidth, roofDepth) * 0.72, roofHeight, 4)
      geometry.rotateY(Math.PI / 4)
      geometry.scale(roofWidth / Math.max(roofWidth, roofDepth), 1, roofDepth / Math.max(roofWidth, roofDepth))
      roof = new THREE.Mesh(geometry, roofMaterial)
      roof.position.y = roofBaseY + roofHeight / 2
    } else {
      roof = new THREE.Mesh(new THREE.BoxGeometry(roofWidth, 0.24, roofDepth), roofMaterial)
      roof.position.y = roofBaseY + 0.12
    }
    roof.name = `shell-roof-${shell?.geometry.roof ?? 'flat'}`
    roof.userData.label = `${shell?.name ?? 'Building'} roof`
    roof.castShadow = !lowPower
    if (!planModel) {
      pickables.push(roof)
      baseMaterials.set(roof, roofMaterial)
      model.add(roof)
    } else {
      roof.geometry.dispose()
    }
    if (planModel) {
      // Walls, hosted openings and room floors straight from the canonical plan
      // geometry (lib/workspace/walls.ts). Building frame -> scene: x - W/2, z - D/2.
      const halfW = plan.buildingWidthM / 2
      const halfD = plan.buildingDepthM / 2
      const interiorWallMaterial = lowPower ? new THREE.MeshLambertMaterial({ color: 0xc3ccd1 }) : new THREE.MeshPhysicalMaterial({ color: 0xc3ccd1, roughness: 0.85, metalness: 0 })
      const paneMaterial = new THREE.MeshLambertMaterial({ color: 0x8fb9d1, transparent: true, opacity: 0.55 })
      extraMaterials.push(interiorWallMaterial, paneMaterial)
      const wallById = new Map(getPlanWalls(plan).map((wall) => [wall.id, wall]))
      const floorTop = (floor: number) => 0.58 + (floor - 1) * floorHeight + 0.09
      const solids = planWallSolids(plan)
      wallModelDigest = wallSolidsDigest(solids)
      for (const solid of solids) {
        const wall = wallById.get(solid.wallId)
        if (!wall) continue
        const material = solid.part === 'glass' ? paneMaterial : wall.kind === 'exterior' ? concreteMaterial : interiorWallMaterial
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(solid.sx, solid.sy, solid.sz), material)
        mesh.position.set(solid.cx - halfW, floorTop(wall.floor) + solid.cy, solid.cz - halfD)
        mesh.name = `plan-${solid.part}-${solid.wallId}`
        mesh.castShadow = !lowPower && solid.part === 'wall'
        mesh.receiveShadow = !lowPower
        if (solid.part === 'wall') {
          mesh.userData.label = `${wall.kind === 'exterior' ? 'Exterior' : 'Interior'} wall ${wall.id}`
          pickables.push(mesh)
          baseMaterials.set(mesh, material)
        }
        model.add(mesh)
      }
      for (const room of plan.rooms) {
        const material = new THREE.MeshLambertMaterial({ color: room.color })
        extraMaterials.push(material)
        const plate = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.1, room.widthM - 0.02), 0.05, Math.max(0.1, room.depthM - 0.02)), material)
        plate.position.set(room.xM + room.widthM / 2 - halfW, floorTop(room.floor) + 0.025, room.yM + room.depthM / 2 - halfD)
        plate.name = `plan-room-floor-${room.id}`
        plate.receiveShadow = !lowPower
        model.add(plate)
      }
    }

    if (shell && shell.geometry.courtyardRatio > 0.12) {
      const court = new THREE.Mesh(new THREE.BoxGeometry(plan.buildingWidthM * Math.sqrt(shell.geometry.courtyardRatio), 0.08, plan.buildingDepthM * Math.sqrt(shell.geometry.courtyardRatio)), groundMaterial)
      court.position.y = 0.54
      court.name = 'indicative-courtyard-void-marker'
      court.userData.label = 'Indicative courtyard'
      model.add(court)
    }
    scene.add(model)
    const selectionOutline = new THREE.BoxHelper(podium, 0xff8c2a)
    selectionOutline.name = "selection-outline"
    scene.add(selectionOutline)

    const groundSize=180
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(groundSize,groundSize), groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    ground.name = "ground-plane-y0"
    ground.receiveShadow = !lowPower
    scene.add(ground)
    const boundaryPoints=[[-plan.plotWidthM/2,-plan.plotDepthM/2],[plan.plotWidthM/2,-plan.plotDepthM/2],[plan.plotWidthM/2,plan.plotDepthM/2],[-plan.plotWidthM/2,plan.plotDepthM/2]].map(([x,z])=>new THREE.Vector3(x,.01,z))
    const boundaryMaterial=new THREE.LineBasicMaterial({color:0xff8c2a})
    const boundary=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(boundaryPoints),boundaryMaterial);boundary.name="plot-boundary-outline-y001";scene.add(boundary)

    const existingMaterial=lowPower?new THREE.MeshLambertMaterial({color:0x8b9692}):new THREE.MeshPhysicalMaterial({color:0x8b9692,roughness:.88,metalness:.02})
    const drapeMaterial=new THREE.MeshBasicMaterial({color:0x667670,side:THREE.DoubleSide})
    for(const building of sampleSiteContext.buildings){const shape=new THREE.Shape();building.points.forEach(([lat,lon],index)=>{const x=(lon-sampleSiteContext.center.lon)*metresLon;const z=-(lat-sampleSiteContext.center.lat)*111320;if(index===0)shape.moveTo(x,z);else shape.lineTo(x,z)});const drape=new THREE.Mesh(new THREE.ShapeGeometry(shape),drapeMaterial);drape.rotation.x=-Math.PI/2;drape.position.y=-.01;drape.name=`osm-drape-below-${building.osmWayId}`;scene.add(drape);const geometry=new THREE.ExtrudeGeometry(shape,{depth:building.heightM,bevelEnabled:false});geometry.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geometry,existingMaterial);mesh.position.y=0;mesh.name=`osm-building-seated-${building.osmWayId}`;mesh.userData.label=`OSM way ${building.osmWayId}`;scene.add(mesh)}

    model.updateMatrixWorld(true)
    const buildingBounds=new THREE.Box3().setFromObject(model)
    const roofY=buildingBounds.max.y
    const unintendedAboveRoof=scene.children.filter(object=>object instanceof THREE.Mesh&&!object.name.startsWith('osm-building')&&new THREE.Box3().setFromObject(object).max.y>roofY+.1).map(object=>object.name||object.type)
    host.dataset.buildingMinY=buildingBounds.min.y.toFixed(3)
    host.dataset.groundY=ground.position.y.toFixed(3)
    host.dataset.buildingOpacity=String(glassMaterial.opacity)
    host.dataset.meshesAboveRoof=String(unintendedAboveRoof.length)
    host.dataset.sceneObjects=[ground.name,boundary.name,...sampleSiteContext.buildings.flatMap(item=>[`osm-drape-below-${item.osmWayId}`,`osm-building-seated-${item.osmWayId}`])].join('|')
    host.dataset.shellId = shell?.id ?? 'default-massing'
    host.dataset.shellStatus = shell?.provenance.status ?? 'INDICATIVE'

    const treeCount = mobile ? 5 : 10
    const treeGeometry = new THREE.ConeGeometry(0.72, 2.5, 7)
    const treeMaterial = lowPower ? new THREE.MeshLambertMaterial({ color: 0x496b53 }) : new THREE.MeshPhysicalMaterial({ color: 0x496b53, roughness: 0.92 })
    const trees = new THREE.InstancedMesh(treeGeometry, treeMaterial, treeCount)
    const transform = new THREE.Object3D()
    for (let i = 0; i < treeCount; i += 1) {
      const side = i % 2 === 0 ? -1 : 1
      transform.position.set(side * (plan.plotWidthM * 0.55 + (i % 3)), 1.25, -plan.plotDepthM * 0.42 + i * (plan.plotDepthM * 0.84 / treeCount))
      transform.rotation.y = i * 0.71
      transform.scale.setScalar(0.82 + (i % 3) * 0.14)
      transform.updateMatrix()
      trees.setMatrixAt(i, transform.matrix)
    }
    trees.castShadow = !lowPower
    if (!lowPower && !beautyMode) scene.add(trees)
    // Phone-sized viewports keep the whole canvas for the model: the plan and
    // axonometric insets only draw where they would not cover it.
    const showInsets = !mobile

    const perspective = new THREE.PerspectiveCamera(34, 1, 0.1, 1200)
    const top = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 1200)
    const axon = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 1200)
    const controls = new OrbitControls(perspective, renderer.domElement)
    controls.enableDamping = !reducedMotion
    controls.dampingFactor = 0.075
    controls.screenSpacePanning = true
    controls.maxPolarAngle = Math.PI * 0.49

    // Portrait viewports (phones) see a narrower horizontal field, so pull the
    // camera back in proportion to keep the whole massing in frame.
    const framingDistance = () => {
      const aspect = host.clientHeight > 0 ? host.clientWidth / host.clientHeight : 1
      return aspect > 0 && aspect < 1.5 ? Math.min(1.8, 1.5 / Math.max(aspect, 0.8)) : 1
    }
    const fit = () => {
      const height = Math.max(3, plan.floors * floorHeight)
      const radius = Math.max(plan.plotWidthM, plan.plotDepthM, height)
      controls.target.set(0, height * 0.42, 0)
      const distance = framingDistance()
      perspective.position.set(radius * 0.92 * distance, radius * 0.72 * distance, radius * 1.08 * distance)
      perspective.near = Math.max(0.1, radius / 100)
      perspective.far = radius * 20
      perspective.updateProjectionMatrix()
      controls.update()
      perspective.lookAt(controls.target)
      perspective.updateMatrixWorld()
    }
    fit()
    const pathTracer = beautyMode && !lowPower && !mobile ? new WebGLPathTracer(renderer) : null
    if (pathTracer) {
      pathTracer.bounces = 5
      pathTracer.tiles.set(2, 2)
      pathTracer.dynamicLowRes = true
      pathTracer.lowResScale = 0.35
      pathTracer.setScene(scene, perspective)
      host.dataset.renderEngine = 'three-gpu-pathtracer'
    } else {
      host.dataset.renderEngine = lowPower ? 'three-webgl-reduced' : 'three-webgl-pbr'
    }

    // Walkthrough: replays the deterministic camera path (lib/designstudio/
    // cameraPath) through the SAME perspective camera and OrbitControls the
    // user orbits with, so it shows exactly the authored geometry. Only ever
    // started by a user click/keypress; any manual orbit pauses it.
    const walkPath = generateCameraPath({ plotWidthM: plan.plotWidthM, plotDepthM: plan.plotDepthM, floors: plan.floors, floorHeightM: floorHeight }, framingDistance())
    const waypoints = cameraPathWaypoints(walkPath)
    const walkState = { status: "idle" as WalkthroughView["status"], elapsed: 0, last: 0, stepped: false, lastPublish: 0 }
    const publishWalk = (force = false) => {
      const nowMs = performance.now()
      if (!force && nowMs - walkState.lastPublish < 250) return
      walkState.lastPublish = nowMs
      publishCamera() // keep data-camera-state (permalink/evidence) truthful while the path moves the camera
      const total = walkState.stepped ? waypoints.length * STEP_SECONDS : walkPath.durationS
      setWalk({ status: walkState.status, progress: Math.min(1, walkState.elapsed / total), elapsedS: Math.min(walkState.elapsed, total), durationS: total, stepped: walkState.stepped })
    }
    const applyPose = (pose: { position: [number, number, number]; target: [number, number, number] }) => {
      perspective.position.fromArray(pose.position)
      controls.target.fromArray(pose.target)
      controls.update()
      perspective.lookAt(controls.target)
      pathTracer?.updateCamera()
    }
    const walkPlay = () => {
      if (walkState.status === "ended") walkState.elapsed = 0
      if (walkState.elapsed === 0) walkState.stepped = matchMedia("(prefers-reduced-motion: reduce)").matches
      walkState.status = "playing"
      walkState.last = 0
      publishWalk(true)
    }
    const walkPause = () => {
      if (walkState.status !== "playing") return
      walkState.status = "paused"
      publishWalk(true)
      publishCamera()
    }
    const walkRestart = () => {
      walkState.elapsed = 0
      walkState.stepped = matchMedia("(prefers-reduced-motion: reduce)").matches
      walkState.status = "playing"
      walkState.last = 0
      applyPose(waypoints[0])
      publishWalk(true)
    }
    const tickWalk = (now: number) => {
      if (walkState.status !== "playing") return
      if (walkState.last) walkState.elapsed += Math.min(0.1, (now - walkState.last) / 1000)
      walkState.last = now
      if (walkState.stepped) {
        const total = waypoints.length * STEP_SECONDS
        applyPose(waypoints[Math.min(waypoints.length - 1, Math.floor(walkState.elapsed / STEP_SECONDS))])
        if (walkState.elapsed >= total) { walkState.status = "ended"; publishWalk(true); publishCamera() } else publishWalk()
        return
      }
      if (walkState.elapsed >= walkPath.durationS) {
        walkState.elapsed = walkPath.durationS
        applyPose(sampleCameraPath(walkPath, walkPath.durationS))
        walkState.status = "ended"
        publishWalk(true)
        publishCamera()
        return
      }
      applyPose(sampleCameraPath(walkPath, walkState.elapsed))
      publishWalk()
    }
    controls.addEventListener("start", walkPause)
    walkApi.current = { play: walkPlay, pause: walkPause, restart: walkRestart, path: walkPath, engine: "", stepped: () => walkState.stepped }
    host.dataset.walkthroughPathSchema = walkPath.schema
    setWalk(idleWalk(walkPath.durationS))

    const frameCamera = (camera: THREE.OrthographicCamera, width: number, height: number) => {
      const radius = Math.max(plan.plotWidthM, plan.plotDepthM, plan.floors * floorHeight) * 0.7
      const aspect = width / Math.max(height, 1)
      camera.left = -radius * aspect
      camera.right = radius * aspect
      camera.top = radius
      camera.bottom = -radius
      camera.updateProjectionMatrix()
    }

    const renderViewport = (camera: THREE.Camera, x: number, y: number, width: number, height: number) => {
      renderer.setViewport(x, y, width, height)
      renderer.setScissor(x, y, width, height)
      renderer.setScissorTest(true)
      renderer.render(scene, camera)
    }

    let frames = 0
    let fpsStart = performance.now()
    let raf = 0
    let secondsSampled = 0
    let lowFpsSeconds = 0
    // WHITE-SCREEN INSURANCE: a lost GPU context (driver reset, tab
    // backgrounding on some WebKit builds, etc.) is a real runtime event,
    // not just a load-time capability check - without this guard the
    // render loop keeps calling into a dead context every frame, which
    // can throw uncaught inside requestAnimationFrame. glContextLost
    // gates every draw() call; the listener below is what flips it.
    let glContextLost = false
    const draw = (now: number) => {
      if (glContextLost) return
      const width = host.clientWidth
      const height = host.clientHeight
      tickWalk(now)
      controls.update()
      renderer.clear()
      if (pathTracer) {
        renderer.setScissorTest(false)
        pathTracer.renderSample()
      } else {
        renderViewport(perspective, 0, 0, width, height)
      }
      if (!lowPower && !pathTracer && showInsets) {
        const insetW = Math.min(230, width * 0.3)
        const insetH = Math.min(155, height * 0.29)
        frameCamera(top, insetW, insetH)
        top.position.set(0, 180, 0.01)
        top.lookAt(0, 0, 0)
        renderViewport(top, 16, height - insetH - 16, insetW, insetH)
        frameCamera(axon, insetW, insetH)
        axon.position.set(90, 75, 90)
        axon.lookAt(0, plan.floors * floorHeight * 0.35, 0)
        renderViewport(axon, 16, 16, insetW, insetH)
      }
      frames += 1
      if (now - fpsStart >= 1000) {
        host.dataset.fps = String(Math.round(frames * 1000 / (now - fpsStart)))
        host.dataset.drawCalls = String(renderer.info.render.calls)
        // Measured fallback: a "full" profile that cannot hold the floor-device
        // rate for three consecutive seconds (after warm-up) drops to reduced.
        // The path tracer is progressive by design, so it is exempt.
        secondsSampled += 1
        if (!lowPower && !pathTracer && secondsSampled > 2) {
          lowFpsSeconds = frames * 1000 / (now - fpsStart) < 24 ? lowFpsSeconds + 1 : 0
          if (lowFpsSeconds >= 3) { glContextLost = true; cancelAnimationFrame(raf); setFellBack(true); return }
        }
        frames = 0
        fpsStart = now
      }
      raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      const width = Math.max(1, host.clientWidth)
      const height = Math.max(1, host.clientHeight)
      renderer.setSize(width, height, false)
      perspective.aspect = width / height
      perspective.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let selectedIndex = 0
    const applySelection = (mesh: THREE.Mesh) => {
      selectedIndex = pickables.indexOf(mesh)
      pickables.forEach((candidate) => { candidate.material = candidate === mesh ? selectedMaterial : baseMaterials.get(candidate) ?? concreteMaterial })
      selectionOutline.setFromObject(mesh)
      const label = String(mesh.userData.label)
      setSelected(label)
      host.dataset.selectionPattern = "outline-handles"
      host.dataset.selectionTarget = label
    }
    const publishCamera = () => { host.dataset.cameraState = JSON.stringify({ position: perspective.position.toArray(), target: controls.target.toArray() }) }
    const restoreView = (event: Event) => {
      const state = (event as CustomEvent<{camera?:{position:[number,number,number];target:[number,number,number]};selection?:string}>).detail
      if (state?.camera) { perspective.position.fromArray(state.camera.position); controls.target.fromArray(state.camera.target); controls.update() }
      if (state?.selection) { const match=pickables.find(mesh=>mesh.userData.label===state.selection); if(match)applySelection(match) }
      publishCamera()
    }
    const select = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1)
      raycaster.setFromCamera(pointer, perspective)
      const hit = raycaster.intersectObjects(pickables, false)[0]?.object as THREE.Mesh | undefined
      if (hit) applySelection(hit)
    }
    const indicateSelectable = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1)
      raycaster.setFromCamera(pointer, perspective)
      renderer.domElement.style.cursor = raycaster.intersectObjects(pickables, false).length > 0 ? "pointer" : "grab"
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "0") { fit(); event.preventDefault() }
      if (event.key === "p" || event.key === "P") { if (walkState.status === "playing") walkPause(); else walkPlay(); event.preventDefault() }
      if (event.key === "]" || event.key === "[") {
        const direction = event.key === "]" ? 1 : -1
        selectedIndex = (selectedIndex + direction + pickables.length) % pickables.length
        applySelection(pickables[selectedIndex])
        event.preventDefault()
      }
    }
    renderer.domElement.addEventListener("pointerup", select)
    renderer.domElement.addEventListener("pointermove", indicateSelectable)
    renderer.domElement.addEventListener("keydown", keydown)
    const finishCameraMove = () => { publishCamera(); pathTracer?.updateCamera() }
    controls.addEventListener("end", finishCameraMove)
    window.addEventListener("ferrum:restore-view", restoreView)
    const restoredView=decodeWorkspaceView(new URLSearchParams(location.search).get("workspaceView"));if(restoredView)restoreView(new CustomEvent("ferrum:restore-view",{detail:restoredView}))
    // preventDefault() on context-lost is required by the WebGL spec for
    // the browser to even attempt eventual restoration; this handler's
    // real job is just stopping the render loop before it throws into a
    // dead context - restoration (if it happens) is treated as "reload
    // to get a fresh scene" via the diagram fallback, not a live rebuild.
    const onContextLost = (event: Event) => {
      event.preventDefault()
      glContextLost = true
      cancelAnimationFrame(raf)
      setProfile("diagram")
      setContextLost(true)
      host.dataset.renderProfile = "diagram"
      host.dataset.contextLost = "true"
    }
    renderer.domElement.addEventListener("webglcontextlost", onContextLost, false)
    renderer.domElement.tabIndex = 0
    renderer.domElement.setAttribute("aria-label", "Architectural model. Drag to orbit, shift-drag to pan, scroll to zoom, press zero to fit model, press P to play or pause the camera walkthrough, click geometry to select it, or use left and right bracket keys to cycle selection across all views.")
    host.dataset.renderer = softwareRenderer ? "software" : "gpu"
    host.dataset.renderProfile = lowPower ? "reduced" : "full"
    host.dataset.planModel = planModel ? "on" : "off"
    host.dataset.geometryRevision = planFingerprint(plan)
    host.dataset.wallCount = String(getPlanWalls(plan).length)
    host.dataset.planModelDigest = wallModelDigest
    host.dataset.renderQuality = quality
    host.dataset.renderQualityReason = reason
    host.dataset.renderPixelRatio = String(pixelRatio)
    host.dataset.renderViewport = mobile ? "mobile" : "desktop"
    if (walkApi.current) walkApi.current.engine = host.dataset.renderEngine ?? ""
    publishCamera()
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener("pointerup", select)
      renderer.domElement.removeEventListener("pointermove", indicateSelectable)
      renderer.domElement.removeEventListener("keydown", keydown)
      controls.removeEventListener("end", finishCameraMove)
      controls.removeEventListener("start", walkPause)
      walkApi.current = null
      window.removeEventListener("ferrum:restore-view", restoreView)
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost)
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh) object.geometry.dispose()
      })
      ;[concreteMaterial, glassMaterial, metalMaterial, selectedMaterial, roofMaterial, groundMaterial, treeMaterial,existingMaterial,drapeMaterial,boundaryMaterial, ...extraMaterials].forEach((material) => material.dispose())
      environment?.dispose()
      pmrem.dispose()
      selectionOutline.geometry.dispose()
      selectionOutline.material.dispose()
      pathTracer?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [plan, demoMode, fullscreen.profile, shell, beautyMode, quality, fellBack, wallModel])

  useEffect(() => {
    setRecordingSupported(typeof MediaRecorder !== "undefined" && typeof HTMLCanvasElement !== "undefined" && typeof HTMLCanvasElement.prototype.captureStream === "function")
    return () => { const active = recorder.current; recorder.current = null; if (active && active.media.state !== "inactive") { active.media.onstop = null; active.media.stop() } }
  }, [])

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // Optional, local-only capture of the live canvas: no upload, no dependency.
  // Any failure degrades to "failed"; the walkthrough itself never depends on it.
  const startRecording = () => {
    try {
      const canvas = hostRef.current?.querySelector("canvas")
      if (!canvas) throw new Error("no canvas")
      const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type))
      if (!mimeType) throw new Error("no webm")
      const media = new MediaRecorder(canvas.captureStream(30), { mimeType })
      const chunks: Blob[] = []
      media.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data) }
      media.onerror = () => { recorder.current = null; setRecording("failed") }
      media.onstop = () => {
        recorder.current = null
        if (chunks.length === 0) { setRecording("failed"); return }
        downloadBlob(new Blob(chunks, { type: mimeType }), "ferrum-walkthrough-indicative.webm")
        setRecording("saved")
      }
      media.start(250)
      recorder.current = { media, chunks, canvas }
      setRecording("recording")
    } catch {
      recorder.current = null
      setRecording("failed")
    }
  }
  const stopRecording = useCallback(() => {
    const active = recorder.current
    if (active && active.media.state !== "inactive") active.media.stop()
  }, [])
  useEffect(() => {
    if (recording === "recording" && (walk.status === "ended" || walk.status === "paused")) stopRecording()
  }, [walk.status, recording, stopRecording])

  const handlePlay = () => { if (recordingRef.current === "armed") startRecording(); walkApi.current?.play() }
  const handleRestart = () => { if (recordingRef.current === "armed") startRecording(); walkApi.current?.restart() }
  const toggleRecording = () => {
    if (recording === "recording") { stopRecording(); return }
    setRecording(recording === "armed" ? "off" : "armed")
  }

  const exportManifest = async () => {
    const api = walkApi.current
    if (!api) return
    const stepped = walk.stepped || matchMedia("(prefers-reduced-motion: reduce)").matches
    const manifest = await describeManifest({
      plan,
      shell: shell ? { id: shell.id, name: shell.name, provenance: shell.provenance } : undefined,
      path: api.path,
      rendererVersion: { three: `r${THREE.REVISION}`, profile, engine: api.engine },
      contextLabel,
      siteContext: { source: sampleSiteContext.source, attribution: sampleSiteContext.tile.attribution },
      motion: stepped ? "stepped-reduced-motion" : "continuous",
      recording: {
        requested: recording !== "off",
        supported: recordingSupported,
        result: recording === "saved" ? "recorded" : recording === "failed" ? "failed" : !recordingSupported ? "unsupported" : recording === "off" ? "not-requested" : "pending",
      },
      generatedAt: new Date().toISOString(),
    })
    downloadBlob(new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }), `ferrum-walkthrough-manifest-${manifest.pathHash.replace(/^[a-z0-9]+:/, "").slice(0, 12)}.json`)
    setExportNote(`Manifest exported · path ${manifest.pathHash.slice(0, 19)}… · INDICATIVE, NOT A SURVEY.`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#e7ecec]" data-space-3d-frame>
    <div ref={hostRef} className="relative min-h-0 flex-1 overflow-hidden bg-[#e7ecec]" data-space-3d data-space-demo={demoMode || undefined} data-selected={selected} data-profile-label={profile}>
      {profile === 'diagram' && <div className="absolute inset-0 grid place-items-center bg-relume-surface-secondary p-8 text-center text-sm text-relume-command"><p><strong>Reduced diagram mode</strong><br />{contextLost ? 'The 3D graphics context was lost mid-session (a device/driver event, not an app error).' : 'WebGL2 is unavailable.'} Use Plan or Elevation for the same deterministic geometry.</p></div>}
      <div className="hidden" data-canvas-status-bar>
        <p className="truncate"><span className="text-relume-accent">INDICATIVE</span> · {shell?.name ?? 'Deterministic massing'} · {profile === 'full' ? 'Three.js PBR' : profile === 'reduced' ? 'Reduced rendering' : 'Diagram'}{profile !== 'diagram' && ` (${qualityReasonLabel[qualityReason]})`} · {contextLabel} · OSM context 2026-09-05 · © OpenStreetMap contributors · not a survey</p>
      </div>
      <div className="hidden">
        Selected: <strong>{selected}</strong><br />Click or [ ] select · Drag orbit · Shift-drag pan · Scroll zoom · 0 fit
      </div>
      {shell && profile === 'full' && <button type="button" onClick={() => setBeautyMode((value) => !value)} aria-pressed={beautyMode} className="hidden" data-beauty-preview>{beautyMode ? 'Return to interactive PBR' : 'Render beauty preview'}</button>}
      <div className="pointer-events-none absolute left-5 top-5 z-10 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-white drop-shadow md:block">Top plan</div>
      <div className="pointer-events-none absolute bottom-5 left-5 z-10 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-white drop-shadow md:block">Axonometric</div>
    </div>
    <div className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 border-t border-relume-border bg-white px-3 py-1" data-mobile-canvas-status>
      <p className="min-w-0 flex-1 basis-40 whitespace-normal break-words text-[9px] font-semibold uppercase leading-4 tracking-[0.08em] text-relume-muted" data-canvas-evidence title={rendererBoundaryNote}>
        <span className="text-relume-command">INDICATIVE</span> · {shell?.name ?? 'Deterministic massing'} · {profile === 'full' ? 'Three.js PBR' : profile === 'reduced' ? 'Three.js reduced' : 'Diagram'}{profile !== 'diagram' && ` (${qualityReasonLabel[qualityReason]})`} · <span className="text-relume-command">NOT A SURVEY</span>
      </p>
      {profile !== 'diagram' && !demoMode && <button type="button" onClick={() => setWallModel((value) => !value)} aria-pressed={wallModel} title="Show the plan's walls, openings and room floors (roof hidden). INDICATIVE geometry, not a structural model." className={`min-h-11 min-w-11 shrink-0 rounded-full border border-relume-border px-3 text-[10px] font-semibold ${wallModel ? 'bg-relume-command text-white' : 'bg-white text-relume-command'}`} data-wall-model-toggle>Wall model</button>}
      {profile !== 'diagram' && !demoMode && <div role="radiogroup" aria-label="Render quality" className="flex shrink-0 overflow-hidden rounded-full border border-relume-border" data-render-quality-control>
        {qualityOptions.map((option) => <button key={option.value} type="button" role="radio" aria-checked={quality === option.value} title={option.hint} onClick={() => { setFellBack(false); setQuality(option.value) }} className={`min-h-11 min-w-11 px-3 text-[10px] font-semibold ${quality === option.value ? 'bg-relume-command text-white' : 'bg-white text-relume-command'}`} data-render-quality={option.value}>{option.label}</button>)}
      </div>}
      {shell && profile === 'full' && <button type="button" onClick={() => setBeautyMode((value) => !value)} aria-pressed={beautyMode} className="hidden min-h-11 shrink-0 rounded-full border border-relume-border bg-white px-3 text-[10px] font-semibold text-relume-command md:inline-flex md:items-center" data-mobile-beauty-preview>{beautyMode ? 'Interactive' : 'Beauty'}</button>}
      {profile !== 'diagram' && !demoMode && <WalkthroughControl view={walk} recordingSupported={recordingSupported} recording={recording} onPlay={handlePlay} onPause={() => walkApi.current?.pause()} onRestart={handleRestart} onExport={() => { void exportManifest() }} onToggleRecording={toggleRecording} exportNote={exportNote} />}
    </div>
    </div>
  )
}
