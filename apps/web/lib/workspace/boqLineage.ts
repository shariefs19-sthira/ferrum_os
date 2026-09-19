import type { CatalogItem } from '../rateEngine/catalogTypes'
import type { StudioOpening, StudioPlan, StudioRoom } from '../types'
import { workspaceBoqCatalog } from './measuredBoq'
import { defaultWallThicknessM } from './walls'

// Model-linked take-off lineage: decomposes the same formulas
// `measuredBoq.ts` already uses down to a per-floor (or, for substructure
// items, a one-time "FOUNDATION" scope) grain, and records exactly which
// generated rooms/openings each line was measured from. This is the
// traceability layer the CRANE mission asks for — it does not invent a
// new quantity model, it exposes the existing one's per-element lineage.

// --- Fingerprint --------------------------------------------------------

/** FNV-1a 32-bit. Deterministic, dependency-free, good enough for a
 * change-detection fingerprint — this is not a security hash. */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const roundGeo = (value: number) => Math.round(value * 1000) / 1000

function canonicalRoom(room: StudioRoom): string {
  return [room.id, room.floor, roundGeo(room.xM), roundGeo(room.yM), roundGeo(room.widthM), roundGeo(room.depthM)].join(':')
}

function canonicalOpening(opening: StudioOpening): string {
  return [
    opening.id, opening.kind, opening.floor, opening.roomId, opening.hostEdge,
    roundGeo(opening.positionM), roundGeo(opening.widthM), roundGeo(opening.heightM), roundGeo(opening.sillM),
    opening.configuration,
  ].join(':')
}

/**
 * Deterministic fingerprint of every geometry input that can change a
 * measured quantity. Cosmetic fields (room.color, elevation labels) are
 * excluded on purpose — a repaint must never mark BOQ lines stale.
 */
export function planFingerprint(plan: StudioPlan): string {
  // Walls are derived from the rooms, so their coordinates are already covered
  // above. Only a wall whose thickness/height departs from the assumed default
  // adds a term — which keeps every default plan's fingerprint (and any stored
  // BOQ revision) identical to what it was before the wall model existed.
  const customisedWalls = (plan.walls ?? [])
    .filter((wall) => Math.abs(wall.thicknessM - defaultWallThicknessM(wall.kind)) > 1e-6 || Math.abs(wall.heightM - plan.floorHeightM) > 1e-6)
    .map((wall) => [wall.id, roundGeo(wall.thicknessM), roundGeo(wall.heightM)].join(':'))
    .sort()
    .join('|')
  const canonical = [
    plan.schema,
    roundGeo(plan.plotWidthM), roundGeo(plan.plotDepthM), roundGeo(plan.setbackM),
    roundGeo(plan.buildingWidthM), roundGeo(plan.buildingDepthM),
    plan.floors, roundGeo(plan.floorHeightM),
    plan.rooms.map(canonicalRoom).sort().join('|'),
    (plan.openings ?? []).map(canonicalOpening).sort().join('|'),
    ...(customisedWalls ? [customisedWalls] : []),
  ].join('#')
  return fnv1a(canonical)
}

// --- Element register -----------------------------------------------------

export type ElementKind = 'room' | 'opening'

export type ElementRegisterEntry = {
  elementId: string
  elementType: ElementKind
  floor: number
  label: string
  detail: string
}

/**
 * Structural element types the mission calls out (foundation, column,
 * beam, stair, wall-as-a-distinct-member) that this deterministic
 * rectangular-room generator does NOT model as discrete elements —
 * "Stair / circulation" is a room label, not a structural stair; the
 * building envelope is a perimeter formula, not discrete wall members.
 * Listed explicitly so the register never implies coverage it doesn't have.
 */
export const UNSUPPORTED_STRUCTURAL_ELEMENT_TYPES = ['foundation', 'column', 'beam', 'stair', 'wall'] as const

export function buildElementRegister(plan: StudioPlan): ElementRegisterEntry[] {
  const rooms: ElementRegisterEntry[] = plan.rooms.map((room) => ({
    elementId: room.id,
    elementType: 'room',
    floor: room.floor,
    label: room.name,
    detail: `${room.widthM.toFixed(2)} m × ${room.depthM.toFixed(2)} m · ${room.areaSqm.toFixed(2)} m²`,
  }))
  const openings: ElementRegisterEntry[] = (plan.openings ?? []).map((opening) => ({
    elementId: opening.id,
    elementType: 'opening',
    floor: opening.floor,
    label: `${opening.kind === 'door' ? 'Door' : 'Window'} ${opening.id}`,
    detail: `${opening.hostEdge} edge · ${opening.widthM.toFixed(2)} m × ${opening.heightM.toFixed(2)} m`,
  }))
  return [...rooms, ...openings].sort((a, b) =>
    a.floor - b.floor || a.elementType.localeCompare(b.elementType) || a.elementId.localeCompare(b.elementId))
}

// --- Per-element BOQ lineage -----------------------------------------------

export type BoqScope = number | 'FOUNDATION'

export type BoqLineageEntry = {
  lineId: string
  catalogId: string
  itemName: string
  unit: string
  /** Floor number the quantity belongs to, or 'FOUNDATION' for a
   * one-time substructure scope that isn't repeated per floor. */
  scope: BoqScope
  quantity: number
  rateInr: number | null
  amountInr: number | null
  formulaBasis: string
  /** plan.rooms / plan.openings ids this quantity was measured from. */
  sourceElementIds: string[]
  assumptions: string[]
  exclusions: string[]
}

const FOUNDATION_IDS = new Set(['earthwork', 'pcc'])
const PER_FLOOR_FOOTPRINT_IDS = new Set(['rcc-slab', 'rebar', 'flooring'])
const PER_FLOOR_ENVELOPE_IDS = new Set(['blockwork', 'plaster', 'paint'])
const PER_FLOOR_OPENING_IDS = new Set(['doors', 'windows'])

function lineageEntry(
  item: CatalogItem, scope: BoqScope, quantity: number, rateInr: number | null,
  formulaBasis: string, sourceElementIds: string[], assumptions: string[], exclusions: string[],
): BoqLineageEntry {
  return {
    lineId: `${item.id}:${scope}`,
    catalogId: item.id,
    itemName: item.name,
    unit: item.hooks.unit,
    scope,
    quantity,
    rateInr,
    amountInr: rateInr === null ? null : quantity * rateInr,
    formulaBasis,
    sourceElementIds,
    assumptions,
    exclusions,
  }
}

/**
 * The same 10 catalog lines `measureBoq` computes in aggregate, split by
 * floor (or, for the two substructure items, into a single 'FOUNDATION'
 * scope) with the actual room/opening ids each quantity was measured
 * from. Summing every entry for a given catalogId reconciles exactly to
 * `measureBoq`'s aggregate quantity for that item — see boqLineage.test.ts.
 */
export function measureBoqLineage(plan: StudioPlan, catalog: CatalogItem[] = workspaceBoqCatalog): BoqLineageEntry[] {
  const perimeterM = 2 * (plan.buildingWidthM + plan.buildingDepthM)
  const openings = plan.openings ?? []
  const entries: BoqLineageEntry[] = []

  for (const item of catalog.slice(0, 10)) {
    const rate = item.price?.provenance.status === 'VERIFIED-PUBLIC' ? item.price.amountInr : null

    if (FOUNDATION_IDS.has(item.id)) {
      const groundFloorRooms = plan.rooms.filter((room) => room.floor === 1)
      const footprint = groundFloorRooms.reduce((sum, room) => sum + room.areaSqm, 0)
      const isEarthwork = item.id === 'earthwork'
      const quantity = isEarthwork ? footprint * 0.45 : footprint * 0.075
      entries.push(lineageEntry(
        item, 'FOUNDATION', quantity, rate,
        isEarthwork
          ? 'ground-floor footprint × 0.45 m, substructure scope (one-time, not repeated per floor)'
          : 'ground-floor footprint × 0.075 m blinding, substructure scope (one-time, not repeated per floor)',
        groundFloorRooms.map((room) => room.id),
        ['Footprint assumed constant across all floors (deterministic rectangular envelope).'],
        ['Foundation type, soil-bearing capacity, and excavation depth are not modeled — this is a footprint-derived quantity, not a geotechnical design output.'],
      ))
      continue
    }

    for (let floor = 1; floor <= plan.floors; floor += 1) {
      const floorRooms = plan.rooms.filter((room) => room.floor === floor)
      const footprint = floorRooms.reduce((sum, room) => sum + room.areaSqm, 0)
      const wallFace = perimeterM * plan.floorHeightM

      if (PER_FLOOR_FOOTPRINT_IDS.has(item.id)) {
        const quantity = item.id === 'rcc-slab' ? footprint * 0.125 : item.id === 'rebar' ? footprint * 0.125 * 95 : footprint
        entries.push(lineageEntry(
          item, floor, quantity, rate,
          item.id === 'rcc-slab' ? `floor ${floor} footprint × 0.125 m slab depth`
            : item.id === 'rebar' ? `floor ${floor} RCC volume × 95 kg/m³`
              : `floor ${floor} footprint (finish area)`,
          floorRooms.map((room) => room.id),
          ['Slab depth assumed uniform at 0.125 m across the floor plate.'],
          item.id === 'rebar' ? ['Reinforcement ratio is a single indicative 95 kg/m³ average, not a per-member bar-bending schedule.'] : [],
        ))
      } else if (PER_FLOOR_ENVELOPE_IDS.has(item.id)) {
        const quantity = item.id === 'blockwork' ? wallFace * 0.85 : item.id === 'plaster' ? wallFace * 1.7 : wallFace * 1.7 + footprint
        entries.push(lineageEntry(
          item, floor, quantity, rate,
          item.id === 'blockwork' ? `floor ${floor} perimeter wall face × 85%`
            : item.id === 'plaster' ? `floor ${floor} perimeter wall face × 1.7 faces`
              : `floor ${floor} plaster area + ceiling`,
          floorRooms.map((room) => room.id),
          ["Wall face is attributed to the floor's full envelope — a floor-level quantity, not a per-room wall-by-wall takeoff."],
          ['Internal partition walls between rooms on the same floor are not separately quantified; only the exterior envelope is measured.'],
        ))
      } else if (PER_FLOOR_OPENING_IDS.has(item.id)) {
        const kind = item.id === 'doors' ? 'door' : 'window'
        const floorOpenings = openings.filter((opening) => opening.floor === floor && opening.kind === kind)
        const quantity = openings.length ? floorOpenings.length : floorRooms.length
        entries.push(lineageEntry(
          item, floor, quantity, rate,
          openings.length ? `count of plan.openings on floor ${floor} where kind = ${kind}` : `legacy plan fallback: one per generated room on floor ${floor}`,
          openings.length ? floorOpenings.map((opening) => opening.id) : floorRooms.map((room) => room.id),
          [], [],
        ))
      }
    }
  }

  return entries
}

export function groupEntriesByScope(entries: BoqLineageEntry[]) {
  const scopes = Array.from(new Set(entries.map((entry) => entry.scope)))
  return scopes
    .sort((a, b) => (a === 'FOUNDATION' ? -1 : b === 'FOUNDATION' ? 1 : (a as number) - (b as number)))
    .map((scope) => {
      const lines = entries.filter((entry) => entry.scope === scope)
      const amounts = lines.map((line) => line.amountInr)
      const totalAmountInr = amounts.some((amount) => amount === null) ? null : amounts.reduce<number>((sum, amount) => sum + (amount as number), 0)
      return { scope, lines, totalAmountInr }
    })
}

// --- Structural quantity distinction (concrete / reinforcement / formwork) --

export type StructuralQuantityKind = 'CONCRETE_VOLUME' | 'REINFORCEMENT_WEIGHT' | 'FORMWORK_AREA'

export type StructuralQuantitySummary = {
  kind: StructuralQuantityKind
  unit: string
  value: number | null
  status: 'COMPUTED' | 'UNKNOWN'
  basis: string
}

/**
 * Splits structural quantities per the mission's requirement 3: concrete
 * volume, reinforcement weight, and formwork area, each shown separately
 * where the model provides a defensible basis. Formwork is explicitly
 * UNKNOWN — this generator has no soffit/edge geometry to derive a
 * shuttering contact area from, and inventing one would violate the
 * "never invent engineering quantities" rule.
 */
export function structuralQuantitySummary(entries: BoqLineageEntry[]): StructuralQuantitySummary[] {
  const concreteVolume = entries
    .filter((entry) => entry.catalogId === 'pcc' || entry.catalogId === 'rcc-slab')
    .reduce((sum, entry) => sum + entry.quantity, 0)
  const reinforcementWeight = entries
    .filter((entry) => entry.catalogId === 'rebar')
    .reduce((sum, entry) => sum + entry.quantity, 0)
  return [
    { kind: 'CONCRETE_VOLUME', unit: 'm3', value: concreteVolume, status: 'COMPUTED', basis: 'Sum of PCC blinding + RCC slab volumes across every scoped line.' },
    { kind: 'REINFORCEMENT_WEIGHT', unit: 'kg', value: reinforcementWeight, status: 'COMPUTED', basis: 'RCC volume × 95 kg/m³ indicative reinforcement ratio.' },
    { kind: 'FORMWORK_AREA', unit: 'm2', value: null, status: 'UNKNOWN', basis: 'Formwork/shuttering contact area requires soffit and edge geometry this deterministic rectangular-room generator does not model. Not computed — do not treat as zero.' },
  ]
}
