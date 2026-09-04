"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import type { StudioPlan } from "../../lib/types"

const concrete = 0xf4f2ec
const glass = 0x93bac2
const metal = 0x202a30

export default function Space3D({ plan }: { plan: StudioPlan }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState("Podium")

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const mobile = matchMedia("(max-width: 767px)").matches
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe7ecec)

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, powerPreference: "high-performance" })
    const gl = renderer.getContext()
    const rendererInfo = gl.getExtension("WEBGL_debug_renderer_info")
    const rendererName = rendererInfo ? String(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)) : ""
    const softwareRenderer = /swiftshader|software/i.test(rendererName)
    const lowPower = mobile || softwareRenderer
    renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1 : 2))
    renderer.shadowMap.enabled = !lowPower
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.autoClear = false
    host.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const roomEnvironment = new RoomEnvironment()
    const environment = pmrem.fromScene(roomEnvironment, 0.04).texture
    scene.environment = environment
    roomEnvironment.dispose()

    const sun = new THREE.DirectionalLight(0xfff2dc, 3.2)
    sun.position.set(28, 44, 22)
    sun.castShadow = !lowPower
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x67757b, 1.45))

    const concreteMaterial = new THREE.MeshPhysicalMaterial({ color: concrete, roughness: 0.9, metalness: 0.02 })
    const glassMaterial = new THREE.MeshPhysicalMaterial({ color: glass, roughness: 0.1, metalness: 0, transmission: lowPower ? 0 : 0.42, transparent: true, opacity: lowPower ? 0.7 : 0.82, envMapIntensity: 1 })
    const metalMaterial = new THREE.MeshPhysicalMaterial({ color: metal, metalness: 0.9, roughness: 0.3 })
    const selectedMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd59a43, roughness: 0.5, emissive: 0x5c2d00, emissiveIntensity: 0.16 })
    const groundMaterial = new THREE.MeshPhysicalMaterial({ color: 0x9bacaa, roughness: lowPower ? 0.48 : 0.1, metalness: 0.08, envMapIntensity: 1 })

    const model = new THREE.Group()
    const pickables: THREE.Mesh[] = []
    const baseMaterials = new Map<THREE.Mesh, THREE.Material>()
    const podium = new THREE.Mesh(new THREE.BoxGeometry(plan.plotWidthM * 0.82, 0.5, plan.plotDepthM * 0.82), concreteMaterial)
    podium.position.y = 0.25
    podium.castShadow = !lowPower
    podium.receiveShadow = !lowPower
    podium.userData.label = "Podium"
    pickables.push(podium)
    baseMaterials.set(podium, concreteMaterial)
    model.add(podium)

    const floorHeight = plan.floorHeightM
    for (let floor = 0; floor < plan.floors; floor += 1) {
      const taper = Math.max(0.62, 1 - floor * 0.025)
      const width = plan.buildingWidthM * taper
      const depth = plan.buildingDepthM * taper
      const y = 0.58 + floor * floorHeight
      const glazing = new THREE.Mesh(new THREE.BoxGeometry(width * 0.985, floorHeight * 0.82, depth * 0.985), glassMaterial)
      glazing.position.y = y + floorHeight * 0.45
      glazing.castShadow = !lowPower
      glazing.userData.label = `Level ${floor + 1}`
      pickables.push(glazing)
      baseMaterials.set(glazing, glassMaterial)
      model.add(glazing)

      const slab = new THREE.Mesh(new THREE.BoxGeometry(width + 0.7, 0.18, depth + 0.7), concreteMaterial)
      slab.position.y = y
      slab.castShadow = !lowPower
      slab.receiveShadow = !lowPower
      slab.userData.label = `Level ${floor + 1} slab`
      pickables.push(slab)
      baseMaterials.set(slab, concreteMaterial)
      model.add(slab)

      const balcony = new THREE.Mesh(new THREE.BoxGeometry(width * 0.54, 0.13, 1.45), concreteMaterial)
      balcony.position.set(0, y + floorHeight * 0.32, depth / 2 + 0.72)
      balcony.castShadow = !lowPower
      model.add(balcony)

      for (const x of [-width / 2, width / 2]) {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.13, floorHeight * 0.84, 0.13), metalMaterial)
        mullion.position.set(x * 0.96, y + floorHeight * 0.44, depth / 2 + 0.02)
        model.add(mullion)
      }
    }
    scene.add(model)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(plan.plotWidthM * 2.1, plan.plotDepthM * 1.7), groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.02
    ground.receiveShadow = !lowPower
    scene.add(ground)
    const grid = new THREE.GridHelper(Math.max(plan.plotWidthM, plan.plotDepthM) * 1.7, 32, 0x6f7d80, 0xb4bfbe)
    grid.position.y = 0.015
    ;(grid.material as THREE.Material).transparent = true
    ;(grid.material as THREE.Material).opacity = 0.38
    scene.add(grid)

    const treeCount = mobile ? 5 : 10
    const treeGeometry = new THREE.ConeGeometry(0.72, 2.5, 7)
    const treeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x496b53, roughness: 0.92 })
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
    scene.add(trees)

    const perspective = new THREE.PerspectiveCamera(34, 1, 0.1, 1200)
    const top = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 1200)
    const axon = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 1200)
    const controls = new OrbitControls(perspective, renderer.domElement)
    controls.enableDamping = !reducedMotion
    controls.dampingFactor = 0.075
    controls.screenSpacePanning = true
    controls.maxPolarAngle = Math.PI * 0.49

    const fit = () => {
      const height = Math.max(3, plan.floors * floorHeight)
      const radius = Math.max(plan.plotWidthM, plan.plotDepthM, height)
      controls.target.set(0, height * 0.42, 0)
      perspective.position.set(radius * 0.92, radius * 0.72, radius * 1.08)
      perspective.near = Math.max(0.1, radius / 100)
      perspective.far = radius * 20
      perspective.updateProjectionMatrix()
      controls.update()
    }
    fit()

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
    const draw = (now: number) => {
      const width = host.clientWidth
      const height = host.clientHeight
      controls.update()
      renderer.clear()
      renderViewport(perspective, 0, 0, width, height)
      if (!mobile) {
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
    const select = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1)
      raycaster.setFromCamera(pointer, perspective)
      const hit = raycaster.intersectObjects(pickables, false)[0]?.object as THREE.Mesh | undefined
      pickables.forEach((mesh) => { mesh.material = mesh === hit ? selectedMaterial : baseMaterials.get(mesh) ?? concreteMaterial })
      if (hit) setSelected(String(hit.userData.label))
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "0") { fit(); event.preventDefault() }
    }
    renderer.domElement.addEventListener("pointerup", select)
    renderer.domElement.addEventListener("keydown", keydown)
    renderer.domElement.tabIndex = 0
    renderer.domElement.setAttribute("aria-label", "Architectural model. Drag to orbit, shift-drag to pan, scroll to zoom, press zero to fit model, and click geometry to select it across all views.")
    host.dataset.renderer = softwareRenderer ? "software" : "gpu"
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener("pointerup", select)
      renderer.domElement.removeEventListener("keydown", keydown)
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh) object.geometry.dispose()
      })
      ;[concreteMaterial, glassMaterial, metalMaterial, selectedMaterial, groundMaterial, treeMaterial].forEach((material) => material.dispose())
      environment.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [plan])

  return (
    <div ref={hostRef} className="relative h-full min-h-[24rem] overflow-hidden bg-[#e7ecec]" data-space-3d data-selected={selected}>
      <div className="pointer-events-none absolute right-3 top-3 z-10 max-w-[13rem] rounded bg-relume-command/90 px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg">
        <span className="block text-relume-accent">INDICATIVE</span>
        Presentation shading · deterministic geometry
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded bg-white/90 px-3 py-2 text-xs text-relume-command shadow">
        Selected: <strong>{selected}</strong><br />Drag orbit · Shift-drag pan · Scroll zoom · 0 fit
      </div>
      <div className="pointer-events-none absolute left-5 top-5 z-10 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-white drop-shadow md:block">Top plan</div>
      <div className="pointer-events-none absolute bottom-5 left-5 z-10 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-white drop-shadow md:block">Axonometric</div>
    </div>
  )
}
