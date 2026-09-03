// web-ifc IFC4 export — massing model -> IFC walls/slabs/openings/spaces.
//
// web-ifc 0.0.77's typed schema classes (IfcCartesianPoint, IfcWallStandardCase,
// etc., documented in ifc-schema.d.ts) are NOT constructable at runtime in this
// build - only IfcAPI, Handle, and the numeric IFC*/type-ID constants are
// actually exported (confirmed directly: `typeof WebIFC.IfcCartesianPoint`
// is `undefined`). The .d.ts attribute ORDER is still correct per the IFC4
// spec, so this writes plain STEP/SPFF text (the standard .ifc file format)
// directly, using that same attribute order, and parses it back for the
// round-trip via IfcAPI.OpenModel + GetLineIDsWithType, which ARE real,
// working runtime methods (verified directly against a hand-written file).
//
// Geometry is intentionally minimal - a coarse envelope, not a real
// architectural model: no existing "draggable element" data model exists in
// this repo yet (DesignStudio's test-fit tool only emits
// plot_width_m/plot_depth_m/floors, no per-wall/per-room breakdown - see
// apps/web/components/sections/TestFitCalculator.tsx). Per floor: four
// perimeter walls (a rectangle from plot_width_m x plot_depth_m), one slab,
// one space, and one door-sized opening in the south wall (via
// IfcRelVoidsElement, no boolean CSG - openings are related, not subtracted).

type IfcAPIType = import('web-ifc').IfcAPI

export type MassingModel = {
  plot_width_m: number
  plot_depth_m: number
  floors: number
  floor_height_m?: number
  wall_thickness_m?: number
  slab_thickness_m?: number
}

export type GeometryCounts = {
  walls: number
  slabs: number
  spaces: number
  openings: number
}

const GUID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'

/** Not a spec-correct compressed IFC GUID encoding - just a 22-char unique
 * token from the IFC GUID alphabet. web-ifc's parser reads GlobalId as an
 * opaque string; it does not validate the base64-like compression. */
function fakeGuid(seed: number): string {
  let n = seed * 2654435761 + 0x9e3779b9
  let out = ''
  for (let i = 0; i < 22; i++) {
    n = (n * 1103515245 + 12345) >>> 0
    out += GUID_CHARS[n % GUID_CHARS.length]
  }
  return out
}

class StepWriter {
  private lines: string[] = []
  private nextId = 1

  /** Writes one entity, returns its #N reference for use by later lines. */
  add(entity: string): number {
    const id = this.nextId++
    this.lines.push(`#${id}=${entity};`)
    return id
  }

  ref(id: number): string {
    return `#${id}`
  }

  toStepText(): string {
    return [
      'ISO-10303-21;',
      'HEADER;',
      "FILE_DESCRIPTION((''),'2;1');",
      "FILE_NAME('ferrum-os-massing.ifc','',(''),(''),'ferrum-os web-ifc export','','');",
      "FILE_SCHEMA(('IFC4'));",
      'ENDSEC;',
      'DATA;',
      ...this.lines,
      'ENDSEC;',
      'END-ISO-10303-21;',
      '',
    ].join('\n')
  }
}

function point(w: StepWriter, x: number, y: number, z: number): number {
  return w.add(`IFCCARTESIANPOINT((${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}))`)
}

function direction(w: StepWriter, x: number, y: number, z: number): number {
  return w.add(`IFCDIRECTION((${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}))`)
}

function axis3d(w: StepWriter, originId: number, axisId: number, refDirId: number): number {
  return w.add(`IFCAXIS2PLACEMENT3D(${w.ref(originId)},${w.ref(axisId)},${w.ref(refDirId)})`)
}

function localPlacement(w: StepWriter, relTo: number | null, axisId: number): number {
  return w.add(`IFCLOCALPLACEMENT(${relTo === null ? '$' : w.ref(relTo)},${w.ref(axisId)})`)
}

/** Extruded-rectangle box shape (used for both walls and slabs): a footprint
 * width x depth, extruded `height` up the Z axis from `originId`. */
function extrudedBoxShape(
  w: StepWriter,
  contextId: number,
  originId: number,
  zAxisId: number,
  xAxisId: number,
  width: number,
  depth: number,
  height: number,
): number {
  // Profile is defined in its own local 2D origin (0,0) - the global
  // position/orientation comes from the IfcAxis2Placement3D below, not
  // from this profile placement, so a plain local origin is correct here
  // (reusing the 3D point would be a coordinate-dimension mismatch).
  const profileOrigin2d = w.add('IFCCARTESIANPOINT((0.,0.))')
  const profilePlacement = w.add(
    `IFCAXIS2PLACEMENT2D(${w.ref(profileOrigin2d)},$)`,
  )
  const profile = w.add(
    `IFCRECTANGLEPROFILEDEF(.AREA.,$,${w.ref(profilePlacement)},${width.toFixed(4)},${depth.toFixed(4)})`,
  )
  const placement = axis3d(w, originId, zAxisId, xAxisId)
  const solid = w.add(
    `IFCEXTRUDEDAREASOLID(${w.ref(profile)},${w.ref(placement)},${w.ref(zAxisId)},${height.toFixed(4)})`,
  )
  const shapeRep = w.add(
    `IFCSHAPEREPRESENTATION(${w.ref(contextId)},'Body','SweptSolid',(${w.ref(solid)}))`,
  )
  return w.add(`IFCPRODUCTDEFINITIONSHAPE($,$,(${w.ref(shapeRep)}))`)
}

/**
 * Builds an IFC4 STEP file for the given massing model: one storey per
 * floor, four perimeter walls + one slab + one space + one door opening per
 * storey. Returns the raw .ifc file bytes.
 */
export function exportMassingToIfc(model: MassingModel): Uint8Array {
  const floorHeight = model.floor_height_m ?? 3
  const wallThickness = model.wall_thickness_m ?? 0.23
  const slabThickness = model.slab_thickness_m ?? 0.15
  const w = model.plot_width_m
  const d = model.plot_depth_m

  const s = new StepWriter()
  let seed = 1

  const person = s.add("IFCPERSON($,'Ferrum',$,$,$,$,$,$)")
  const org = s.add("IFCORGANIZATION($,'Ferrum OS',$,$,$)")
  const personOrg = s.add(`IFCPERSONANDORGANIZATION(${s.ref(person)},${s.ref(org)},$)`)
  const application = s.add(`IFCAPPLICATION(${s.ref(org)},'0.1','Ferrum OS DesignStudio IFC export','FERRUM_IFC_EXPORT')`)
  const ownerHistory = s.add(
    `IFCOWNERHISTORY(${s.ref(personOrg)},${s.ref(application)},$,.ADDED.,$,$,$,0)`,
  )

  const origin = point(s, 0, 0, 0)
  const zDir = direction(s, 0, 0, 1)
  const xDir = direction(s, 1, 0, 0)
  const worldAxis = axis3d(s, origin, zDir, xDir)
  const context = s.add(
    `IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,${s.ref(worldAxis)},$)`,
  )

  const unitLen = s.add('IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)')
  const unitArea = s.add('IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)')
  const unitVol = s.add('IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)')
  const units = s.add(`IFCUNITASSIGNMENT((${s.ref(unitLen)},${s.ref(unitArea)},${s.ref(unitVol)}))`)

  const project = s.add(
    `IFCPROJECT('${fakeGuid(seed++)}',${s.ref(ownerHistory)},'Ferrum OS massing export',$,$,$,$,(${s.ref(context)}),${s.ref(units)})`,
  )

  const sitePlacement = localPlacement(s, null, worldAxis)
  const site = s.add(
    `IFCSITE('${fakeGuid(seed++)}',${s.ref(ownerHistory)},'Site',$,$,${s.ref(sitePlacement)},$,$,.ELEMENT.,$,$,$,$,$)`,
  )
  s.add(`IFCRELAGGREGATES('${fakeGuid(seed++)}',${s.ref(ownerHistory)},$,$,${s.ref(project)},(${s.ref(site)}))`)

  const buildingPlacement = localPlacement(s, sitePlacement, worldAxis)
  const building = s.add(
    `IFCBUILDING('${fakeGuid(seed++)}',${s.ref(ownerHistory)},'Building',$,$,${s.ref(buildingPlacement)},$,$,.ELEMENT.,$,$,$)`,
  )
  s.add(`IFCRELAGGREGATES('${fakeGuid(seed++)}',${s.ref(ownerHistory)},$,$,${s.ref(site)},(${s.ref(building)}))`)

  const storeyIds: number[] = []
  const floors = Math.max(1, Math.round(model.floors))

  for (let f = 0; f < floors; f++) {
    const elevation = f * floorHeight
    const storeyOrigin = point(s, 0, 0, elevation)
    const storeyAxis = axis3d(s, storeyOrigin, zDir, xDir)
    const storeyPlacement = localPlacement(s, buildingPlacement, storeyAxis)
    const storey = s.add(
      `IFCBUILDINGSTOREY('${fakeGuid(seed++)}',${s.ref(ownerHistory)},'Storey ${f + 1}',$,$,${s.ref(storeyPlacement)},$,$,.ELEMENT.,${elevation.toFixed(4)})`,
    )
    storeyIds.push(storey)

    const relatedOnFloor: number[] = []

    // Slab: full footprint, thin extrusion at floor level.
    const slabShape = extrudedBoxShape(s, context, storeyOrigin, zDir, xDir, w, d, slabThickness)
    const slab = s.add(
      `IFCSLAB('${fakeGuid(seed++)}',${s.ref(ownerHistory)},'Slab ${f + 1}',$,$,${s.ref(storeyPlacement)},${s.ref(slabShape)},$,.FLOOR.)`,
    )
    relatedOnFloor.push(slab)

    // Space: interior volume above the slab.
    const spaceShape = extrudedBoxShape(s, context, storeyOrigin, zDir, xDir, w, d, floorHeight)
    const space = s.add(
      `IFCSPACE('${fakeGuid(seed++)}',${s.ref(ownerHistory)},'Space ${f + 1}',$,$,${s.ref(storeyPlacement)},${s.ref(spaceShape)},$,.ELEMENT.,.INTERNAL.,$)`,
    )
    relatedOnFloor.push(space)

    // Four perimeter walls: north/south (running along X, thickness in Y)
    // and east/west (running along Y, thickness in X).
    const wallSpecs = [
      { name: 'North', x: 0, y: d - wallThickness, len: w, alongX: true },
      { name: 'South', x: 0, y: 0, len: w, alongX: true },
      { name: 'East', x: w - wallThickness, y: 0, len: d, alongX: false },
      { name: 'West', x: 0, y: 0, len: d, alongX: false },
    ]

    let southWallId = -1
    for (const spec of wallSpecs) {
      const wallOrigin = point(s, spec.x, spec.y, elevation)
      const wallAxis = axis3d(s, wallOrigin, zDir, xDir)
      const wallPlacement = localPlacement(s, storeyPlacement, wallAxis)
      const footprintW = spec.alongX ? spec.len : wallThickness
      const footprintD = spec.alongX ? wallThickness : spec.len
      const wallShape = extrudedBoxShape(s, context, wallOrigin, zDir, xDir, footprintW, footprintD, floorHeight)
      const wall = s.add(
        `IFCWALLSTANDARDCASE('${fakeGuid(seed++)}',${s.ref(ownerHistory)},'Wall ${spec.name} ${f + 1}',$,$,${s.ref(wallPlacement)},${s.ref(wallShape)},$)`,
      )
      relatedOnFloor.push(wall)
      if (spec.name === 'South') southWallId = wall
    }

    // One door-sized opening in the south wall per floor.
    const openingOrigin = point(s, w / 2 - 0.45, 0, elevation)
    const openingAxis = axis3d(s, openingOrigin, zDir, xDir)
    const openingPlacement = localPlacement(s, storeyPlacement, openingAxis)
    const openingShape = extrudedBoxShape(s, context, openingOrigin, zDir, xDir, 0.9, wallThickness, 2.1)
    const opening = s.add(
      `IFCOPENINGELEMENT('${fakeGuid(seed++)}',${s.ref(ownerHistory)},'Door opening ${f + 1}',$,$,${s.ref(openingPlacement)},${s.ref(openingShape)},$)`,
    )
    s.add(
      `IFCRELVOIDSELEMENT('${fakeGuid(seed++)}',${s.ref(ownerHistory)},$,$,${s.ref(southWallId)},${s.ref(opening)})`,
    )
    relatedOnFloor.push(opening)

    s.add(
      `IFCRELCONTAINEDINSPATIALSTRUCTURE('${fakeGuid(seed++)}',${s.ref(ownerHistory)},$,$,(${relatedOnFloor.map((id) => s.ref(id)).join(',')}),${s.ref(storey)})`,
    )
  }

  s.add(
    `IFCRELAGGREGATES('${fakeGuid(seed++)}',${s.ref(ownerHistory)},$,$,${s.ref(building)},(${storeyIds.map((id) => s.ref(id)).join(',')}))`,
  )

  return new TextEncoder().encode(s.toStepText())
}

/**
 * Parses IFC bytes back via web-ifc and counts the four element types the
 * export produces. Used by the round-trip test; also usable as a general
 * "does this look like a real IFC file" sanity check.
 */
export async function countIfcGeometry(bytes: Uint8Array): Promise<GeometryCounts> {
  const { IfcAPI, IFCWALLSTANDARDCASE, IFCSLAB, IFCSPACE, IFCOPENINGELEMENT } = await getWebIfc()
  const api: IfcAPIType = new IfcAPI()
  await api.Init()
  try {
    const modelID = api.OpenModel(bytes)
    if (modelID < 0) throw new Error('web-ifc failed to open the exported model')
    const counts: GeometryCounts = {
      walls: api.GetLineIDsWithType(modelID, IFCWALLSTANDARDCASE).size(),
      slabs: api.GetLineIDsWithType(modelID, IFCSLAB).size(),
      spaces: api.GetLineIDsWithType(modelID, IFCSPACE).size(),
      openings: api.GetLineIDsWithType(modelID, IFCOPENINGELEMENT).size(),
    }
    api.CloseModel(modelID)
    return counts
  } finally {
    api.Dispose?.()
  }
}

// web-ifc ships separate node/browser entry points behind package.json's
// "exports" map (require -> web-ifc-api-node.js, import -> the browser
// build, which tries to fetch its .wasm by URL and does not work under
// plain Node/Workers). Force the "require" condition via createRequire so
// this resolves to the Node build regardless of how this module itself
// was imported (CJS test runner or ESM).
async function getWebIfc() {
  const { createRequire } = await import('module')
  const require = createRequire(import.meta.url)
  return require('web-ifc') as typeof import('web-ifc')
}
