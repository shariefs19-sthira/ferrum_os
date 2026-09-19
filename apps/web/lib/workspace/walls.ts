import type { StudioOpening, StudioPlan, StudioRoom, StudioWall } from '../types'
import { openingSegments } from './openings'

// Canonical wall geometry for the deterministic plan. Walls are a pure
// function of the generated rooms (+ the assumed thickness/height defaults
// below): nothing here is surveyed or structurally designed, and every value
// stays INDICATIVE. Plans created before this model existed have no
// `plan.walls`; `getPlanWalls` derives them on demand so old saved state
// keeps working unchanged.

export const EXTERIOR_WALL_THICKNESS_M = 0.23
export const INTERIOR_WALL_THICKNESS_M = 0.115
export const MIN_ROOM_DIMENSION_M = 1.5
export const WALL_STEP_M = 0.05

const EPS = 1e-4
const round = (value: number) => Math.round(value * 1e6) / 1e6
const near = (a: number, b: number) => Math.abs(a - b) < 1e-3

export const defaultWallThicknessM = (kind: StudioWall['kind']) => kind === 'exterior' ? EXTERIOR_WALL_THICKNESS_M : INTERIOR_WALL_THICKNESS_M

// --- Movable partitions ------------------------------------------------------

export type PartitionKey = 'int-h0' | 'int-v0' | 'int-v1' | 'int-v2'
export type WallOffsets = Record<string, number>
export type Partitions = { splitY: number; frontX: number; rearX1: number; rearX2: number }

const PARTITION_KEYS: PartitionKey[] = ['int-h0', 'int-v0', 'int-v1', 'int-v2']
export const isPartitionKey = (key: string): key is PartitionKey => (PARTITION_KEYS as string[]).includes(key)

export function defaultPartitions(buildingWidthM: number, buildingDepthM: number): Partitions {
  return {
    splitY: buildingDepthM * 0.55,
    frontX: buildingWidthM * 0.62,
    rearX1: buildingWidthM * 0.36,
    rearX2: buildingWidthM * 0.36 + buildingWidthM * 0.28,
  }
}

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(value, Math.max(low, high)))

/** Default partition lines plus the user's per-wall offsets, clamped so no room
 * drops below the minimum dimension and the two rear walls never cross. */
export function resolvePartitions(buildingWidthM: number, buildingDepthM: number, offsets: WallOffsets = {}): Partitions {
  const base = defaultPartitions(buildingWidthM, buildingDepthM)
  const offset = (key: PartitionKey) => Number.isFinite(offsets[key]) ? offsets[key] : 0
  const mx = Math.min(MIN_ROOM_DIMENSION_M, buildingWidthM / 3)
  const my = Math.min(MIN_ROOM_DIMENSION_M, buildingDepthM / 2)
  const splitY = clamp(base.splitY + offset('int-h0'), my, buildingDepthM - my)
  const frontX = clamp(base.frontX + offset('int-v0'), mx, buildingWidthM - mx)
  const rearX1 = clamp(base.rearX1 + offset('int-v1'), mx, buildingWidthM - 2 * mx)
  const rearX2 = clamp(base.rearX2 + offset('int-v2'), rearX1 + mx, buildingWidthM - mx)
  return { splitY, frontX, rearX1, rearX2 }
}

export type WallMoveResult = { offsets: WallOffsets; positionM: number; clamped: boolean; changed: boolean }

/** Pure edit: place the partition at `targetPositionM` (building frame). The
 * move is snapped to 5 cm steps from the generated position (so nudges are
 * always exactly one step and a move back lands exactly on the default) and
 * clamped. Returns the next offsets map; the input is never mutated. A move
 * back to the default removes the offset entry. */
export function moveWall(offsets: WallOffsets, key: string, targetPositionM: number, buildingWidthM: number, buildingDepthM: number): WallMoveResult {
  if (!isPartitionKey(key) || !Number.isFinite(targetPositionM)) return { offsets, positionM: Number.NaN, clamped: false, changed: false }
  const base = defaultPartitions(buildingWidthM, buildingDepthM)
  const field = ({ 'int-h0': 'splitY', 'int-v0': 'frontX', 'int-v1': 'rearX1', 'int-v2': 'rearX2' } as const)[key]
  const snappedOffset = Math.round((targetPositionM - base[field]) / WALL_STEP_M) * WALL_STEP_M
  const snapped = base[field] + snappedOffset
  const trial = { ...offsets, [key]: snappedOffset }
  const resolved = resolvePartitions(buildingWidthM, buildingDepthM, trial)[field]
  const finalOffset = round(resolved - base[field])
  const next = { ...offsets }
  if (Math.abs(finalOffset) < EPS) delete next[key]
  else next[key] = finalOffset
  const clamped = Math.abs(resolved - snapped) > EPS
  const changed = JSON.stringify(sortedEntries(next)) !== JSON.stringify(sortedEntries(offsets))
  return { offsets: changed ? next : offsets, positionM: resolved, clamped, changed }
}

/** Removes a wall's offset so it returns to the generated default position. */
export function resetWall(offsets: WallOffsets, key: string): WallOffsets {
  if (!(key in offsets)) return offsets
  const next = { ...offsets }
  delete next[key]
  return next
}

const sortedEntries = (record: Record<string, number>) => Object.entries(record).sort(([a], [b]) => a.localeCompare(b))

export function partitionPosition(plan: Pick<StudioPlan, 'buildingWidthM' | 'buildingDepthM'>, key: string, offsets: WallOffsets = {}): number | undefined {
  if (!isPartitionKey(key)) return undefined
  const resolved = resolvePartitions(plan.buildingWidthM, plan.buildingDepthM, offsets)
  return ({ 'int-h0': resolved.splitY, 'int-v0': resolved.frontX, 'int-v1': resolved.rearX1, 'int-v2': resolved.rearX2 } as const)[key]
}

// --- Wall derivation ---------------------------------------------------------

type EdgeSegment = { orientation: 'horizontal' | 'vertical'; coord: number; from: number; to: number; roomId: string }

function roomEdges(room: StudioRoom): EdgeSegment[] {
  return [
    { orientation: 'horizontal', coord: room.yM, from: room.xM, to: room.xM + room.widthM, roomId: room.id },
    { orientation: 'horizontal', coord: room.yM + room.depthM, from: room.xM, to: room.xM + room.widthM, roomId: room.id },
    { orientation: 'vertical', coord: room.xM, from: room.yM, to: room.yM + room.depthM, roomId: room.id },
    { orientation: 'vertical', coord: room.xM + room.widthM, from: room.yM, to: room.yM + room.depthM, roomId: room.id },
  ]
}

type Piece = { orientation: 'horizontal' | 'vertical'; coord: number; from: number; to: number; kind: StudioWall['kind']; roomIds: string[] }

/** Splits every coincident room edge into elementary intervals, classifies each
 * (one room + building boundary = exterior, shared/free = interior) and merges
 * contiguous same-class intervals into one wall per line. */
function wallPieces(rooms: StudioRoom[], buildingWidthM: number, buildingDepthM: number): Piece[] {
  const lines = new Map<string, EdgeSegment[]>()
  for (const edge of rooms.flatMap(roomEdges)) {
    const key = `${edge.orientation}:${round(edge.coord)}`
    lines.set(key, [...(lines.get(key) ?? []), edge])
  }
  const pieces: Piece[] = []
  lines.forEach((edges) => {
    const { orientation, coord } = edges[0]
    const stops = Array.from(new Set(edges.flatMap((edge) => [round(edge.from), round(edge.to)]))).sort((a, b) => a - b)
    const boundary = orientation === 'horizontal'
      ? near(coord, 0) || near(coord, buildingDepthM)
      : near(coord, 0) || near(coord, buildingWidthM)
    let open: Piece | undefined
    for (let index = 0; index < stops.length - 1; index += 1) {
      const from = stops[index]
      const to = stops[index + 1]
      const covering = edges.filter((edge) => edge.from <= from + EPS && edge.to >= to - EPS)
      if (!covering.length) { open = undefined; continue }
      const kind: StudioWall['kind'] = boundary && covering.length === 1 ? 'exterior' : 'interior'
      const roomIds = covering.map((edge) => edge.roomId)
      if (open && open.kind === kind && near(open.to, from)) {
        open.to = to
        open.roomIds = Array.from(new Set([...open.roomIds, ...roomIds]))
      } else {
        open = { orientation, coord, from, to, kind, roomIds }
        pieces.push(open)
      }
    }
  })
  return pieces
}

/** Canonical walls for a set of rooms. Ids are stable under partition moves:
 * exterior walls are named by side, interior walls by their sorted ordinal
 * (horizontals by position, then verticals by start then position). */
export function deriveWalls(rooms: StudioRoom[], floorHeightM: number, buildingWidthM: number, buildingDepthM: number): StudioWall[] {
  const floors = Array.from(new Set(rooms.map((room) => room.floor))).sort((a, b) => a - b)
  return floors.flatMap((floor) => {
    const pieces = wallPieces(rooms.filter((room) => room.floor === floor), buildingWidthM, buildingDepthM)
    const toWall = (piece: Piece, id: string, partitionKey?: string): StudioWall => ({
      id: `f${floor}-${id}`,
      floor,
      kind: piece.kind,
      orientation: piece.orientation,
      x1: piece.orientation === 'horizontal' ? piece.from : piece.coord,
      y1: piece.orientation === 'horizontal' ? piece.coord : piece.from,
      x2: piece.orientation === 'horizontal' ? piece.to : piece.coord,
      y2: piece.orientation === 'horizontal' ? piece.coord : piece.to,
      thicknessM: defaultWallThicknessM(piece.kind),
      heightM: floorHeightM,
      partitionKey,
      roomIds: piece.roomIds,
    })
    const exterior = pieces.filter((piece) => piece.kind === 'exterior').map((piece) => {
      const side = piece.orientation === 'horizontal' ? (near(piece.coord, 0) ? 'north' : 'south') : (near(piece.coord, 0) ? 'west' : 'east')
      return toWall(piece, `ext-${side}`)
    })
    const interior = pieces.filter((piece) => piece.kind === 'interior')
    const horizontal = interior.filter((piece) => piece.orientation === 'horizontal').sort((a, b) => a.coord - b.coord || a.from - b.from)
    const vertical = interior.filter((piece) => piece.orientation === 'vertical').sort((a, b) => a.from - b.from || a.coord - b.coord)
    return [
      ...exterior,
      ...horizontal.map((piece, index) => toWall(piece, `int-h${index}`, `int-h${index}`)),
      ...vertical.map((piece, index) => toWall(piece, `int-v${index}`, `int-v${index}`)),
    ]
  })
}

/** Walls carried by the plan, or derived from its rooms for plans that predate
 * the wall model (migration-safe: never requires `plan.walls`). */
export function getPlanWalls(plan: StudioPlan): StudioWall[] {
  return plan.walls ?? deriveWalls(plan.rooms, plan.floorHeightM, plan.buildingWidthM, plan.buildingDepthM)
}

export const wallLengthM = (wall: StudioWall) => Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1)

/** Position of a movable partition line (x for verticals, y for horizontals). */
export const wallCoordinateM = (wall: StudioWall) => wall.orientation === 'horizontal' ? wall.y1 : wall.x1

// --- Openings attached to walls ---------------------------------------------

/** Host wall for every opening, found geometrically from the opening's own
 * edge segment (not from the room id), so it stays right after a wall move. */
export function attachOpeningsToWalls(plan: StudioPlan, walls: StudioWall[] = getPlanWalls(plan)): Record<string, string> {
  const hosts: Record<string, string> = {}
  for (const opening of plan.openings ?? []) {
    const room = plan.rooms.find((candidate) => candidate.id === opening.roomId)
    if (!room) continue
    const [base] = openingSegments(opening, room)
    const horizontal = near(base.y1, base.y2)
    const from = Math.min(horizontal ? base.x1 : base.y1, horizontal ? base.x2 : base.y2)
    const to = Math.max(horizontal ? base.x1 : base.y1, horizontal ? base.x2 : base.y2)
    const coord = horizontal ? base.y1 : base.x1
    const host = walls.find((wall) => {
      if (wall.floor !== opening.floor || (wall.orientation === 'horizontal') !== horizontal) return false
      const wallFrom = horizontal ? Math.min(wall.x1, wall.x2) : Math.min(wall.y1, wall.y2)
      const wallTo = horizontal ? Math.max(wall.x1, wall.x2) : Math.max(wall.y1, wall.y2)
      return near(wallCoordinateM(wall), coord) && wallFrom <= from + 1e-3 && wallTo >= to - 1e-3
    })
    if (host) hosts[opening.id] = host.id
  }
  return hosts
}

/** Openings whose geometry could not be attached to any wall — a model
 * consistency check surfaced as data (an empty list is the healthy state). */
export function unattachedOpenings(plan: StudioPlan): StudioOpening[] {
  const hosts = attachOpeningsToWalls(plan)
  return (plan.openings ?? []).filter((opening) => !hosts[opening.id])
}

// --- Solid geometry shared by 3D and tests -----------------------------------

export type WallSolid = {
  part: 'wall' | 'glass'
  /** Box centre in the building frame: x east, y up from the floor level, z south (= plan y). */
  cx: number
  cy: number
  cz: number
  sx: number
  sy: number
  sz: number
  wallId: string
  openingId?: string
}

/** Solid boxes for one wall with its hosted openings cut out: full-height
 * runs between openings, sill/head pieces around each, and a thin glazing
 * pane per window. Doors are left as clear openings. */
export function wallSolids(wall: StudioWall, hostedOpenings: StudioOpening[], hostRoom?: (opening: StudioOpening) => StudioRoom | undefined): WallSolid[] {
  const horizontal = wall.orientation === 'horizontal'
  const start = horizontal ? Math.min(wall.x1, wall.x2) : Math.min(wall.y1, wall.y2)
  const end = horizontal ? Math.max(wall.x1, wall.x2) : Math.max(wall.y1, wall.y2)
  const coord = horizontal ? wall.y1 : wall.x1
  const box = (a: number, b: number, y0: number, y1: number, part: WallSolid['part'], thickness: number, openingId?: string): WallSolid => {
    const along = (a + b) / 2
    return {
      part,
      cx: horizontal ? along : coord,
      cz: horizontal ? coord : along,
      cy: (y0 + y1) / 2,
      sx: horizontal ? b - a : thickness,
      sz: horizontal ? thickness : b - a,
      sy: y1 - y0,
      wallId: wall.id,
      openingId,
    }
  }
  const spans = hostedOpenings.flatMap((opening) => {
    const room = hostRoom?.(opening)
    if (!room) return []
    const [base] = openingSegments(opening, room)
    const a = Math.min(horizontal ? base.x1 : base.y1, horizontal ? base.x2 : base.y2)
    const b = Math.max(horizontal ? base.x1 : base.y1, horizontal ? base.x2 : base.y2)
    const sill = opening.kind === 'window' ? opening.sillM : 0
    const head = Math.min(wall.heightM, sill + opening.heightM)
    return [{ opening, a: Math.max(start, a), b: Math.min(end, b), sill: Math.max(0, sill), head }]
  }).filter((span) => span.b - span.a > EPS).sort((left, right) => left.a - right.a)
  const solids: WallSolid[] = []
  let cursor = start
  for (const span of spans) {
    if (span.a - cursor > EPS) solids.push(box(cursor, span.a, 0, wall.heightM, 'wall', wall.thicknessM))
    if (span.sill > EPS) solids.push(box(span.a, span.b, 0, span.sill, 'wall', wall.thicknessM, span.opening.id))
    if (wall.heightM - span.head > EPS) solids.push(box(span.a, span.b, span.head, wall.heightM, 'wall', wall.thicknessM, span.opening.id))
    if (span.opening.kind === 'window') solids.push(box(span.a, span.b, span.sill, span.head, 'glass', Math.max(0.02, wall.thicknessM * 0.25), span.opening.id))
    cursor = Math.max(cursor, span.b)
  }
  if (end - cursor > EPS) solids.push(box(cursor, end, 0, wall.heightM, 'wall', wall.thicknessM))
  return solids
}

/** Stable digest of a set of solids (rounded to 1 mm): lets a renderer publish
 * exactly which geometry it built, so tests and evidence can prove the 3D scene
 * matches the plan model without comparing pixels. FNV-1a, not a security hash. */
export function wallSolidsDigest(solids: WallSolid[]): string {
  const canonical = solids.map((solid) => [solid.part, solid.wallId, solid.openingId ?? '', solid.cx, solid.cy, solid.cz, solid.sx, solid.sy, solid.sz].map((value) => typeof value === 'number' ? Math.round(value * 1000) : value).join(':')).sort().join('|')
  let hash = 0x811c9dc5
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** Every wall solid of a plan, hosted openings resolved geometrically. */
export function planWallSolids(plan: StudioPlan): WallSolid[] {
  const walls = getPlanWalls(plan)
  const hosts = attachOpeningsToWalls(plan, walls)
  const roomById = new Map(plan.rooms.map((room) => [room.id, room]))
  return walls.flatMap((wall) => wallSolids(
    wall,
    (plan.openings ?? []).filter((opening) => hosts[opening.id] === wall.id),
    (opening) => roomById.get(opening.roomId),
  ))
}
