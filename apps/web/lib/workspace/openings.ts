import type { StudioOpening, StudioOpeningEdge, StudioPlan, StudioRoom } from '../types'

export type OpeningEdit = Partial<Pick<StudioOpening, 'widthM' | 'heightM' | 'sillM' | 'configuration'>>
export type OpeningEditResult = { opening: StudioOpening; error?: string; clamped?: boolean }
export type OpeningSegment = { x1: number; y1: number; x2: number; y2: number }

/** Symbol geometry is shared by the SVG plan and the DXF export. */
export function openingSegments(opening: StudioOpening, room: StudioRoom): OpeningSegment[] {
  const horizontal = opening.hostEdge === 'north' || opening.hostEdge === 'south'
  const base = horizontal
    ? { x1: room.xM + opening.positionM, y1: room.yM + (opening.hostEdge === 'north' ? 0 : room.depthM), x2: room.xM + opening.positionM + opening.widthM, y2: room.yM + (opening.hostEdge === 'north' ? 0 : room.depthM) }
    : { x1: room.xM + (opening.hostEdge === 'west' ? 0 : room.widthM), y1: room.yM + opening.positionM, x2: room.xM + (opening.hostEdge === 'west' ? 0 : room.widthM), y2: room.yM + opening.positionM + opening.widthM }
  const inward = opening.hostEdge === 'north' ? 1 : opening.hostEdge === 'south' ? -1 : opening.hostEdge === 'east' ? -1 : 1
  const inset = Math.min(opening.widthM / 2, 0.7)
  const midpoint = horizontal ? { x: (base.x1 + base.x2) / 2, y: base.y1 + inward * inset } : { x: base.x1 + inward * inset, y: (base.y1 + base.y2) / 2 }
  if (opening.configuration === 'fixed') return [base]
  if (opening.configuration === 'sliding') return [base, horizontal ? { ...base, y1: base.y1 + inward * 0.16, y2: base.y2 + inward * 0.16 } : { ...base, x1: base.x1 + inward * 0.16, x2: base.x2 + inward * 0.16 }]
  if (opening.configuration === 'double-swing') return [base, { x1: base.x1, y1: base.y1, x2: midpoint.x, y2: midpoint.y }, { x1: base.x2, y1: base.y2, x2: midpoint.x, y2: midpoint.y }]
  return [base, { x1: base.x1, y1: base.y1, x2: midpoint.x, y2: midpoint.y }]
}

export function getFacadeOpenings(plan: StudioPlan, facade: 'front' | 'side') {
  return (plan.openings ?? []).flatMap((opening) => {
    const room = plan.rooms.find((candidate) => candidate.id === opening.roomId)
    if (!room) return []
    const exposed = facade === 'front'
      ? opening.hostEdge === 'north' && Math.abs(room.yM) < 0.001
      : opening.hostEdge === 'east' && Math.abs(room.xM + room.widthM - plan.buildingWidthM) < 0.001
    return exposed ? [{ opening, room }] : []
  })
}

const edgeLength = (room: StudioRoom, edge: StudioOpeningEdge) => edge === 'north' || edge === 'south' ? room.widthM : room.depthM
const openingMinimum = (opening: StudioOpening) => opening.kind === 'door' ? 0.7 : 0.3

export function createDefaultOpenings(rooms: StudioRoom[], floorHeightM: number): StudioOpening[] {
  return rooms.flatMap((room) => {
    const windowWidth = Math.max(0.3, Math.min(1.5, room.widthM * 0.42))
    const doorWidth = Math.max(0.7, Math.min(1.2, room.depthM * 0.5))
    return [
      {
        id: `${room.id}-door`, kind: 'door', floor: room.floor, roomId: room.id, hostEdge: 'east',
        positionM: Math.max(0, (room.depthM - doorWidth) / 2), widthM: doorWidth,
        heightM: Math.min(2.1, Math.max(1.9, floorHeightM - 0.2)), sillM: 0, configuration: 'single-swing',
      },
      {
        id: `${room.id}-window`, kind: 'window', floor: room.floor, roomId: room.id, hostEdge: 'north',
        positionM: Math.max(0, (room.widthM - windowWidth) / 2), widthM: windowWidth,
        heightM: Math.min(1.5, Math.max(0.75, floorHeightM - 1.1)), sillM: Math.min(0.9, Math.max(0.45, floorHeightM - 1.7)), configuration: 'casement',
      },
    ]
  })
}

/** Pure guard for inspector edits. Invalid input is rejected; feasible values are clamped to the host edge. */
export function applyOpeningEdit(opening: StudioOpening, room: StudioRoom | undefined, floorHeightM: number, edit: OpeningEdit): OpeningEditResult {
  if (!room) return { opening, error: 'This opening no longer has a host room.' }
  const candidate = { ...opening, ...edit }
  const numeric = [candidate.widthM, candidate.heightM, candidate.sillM]
  if (numeric.some((value) => !Number.isFinite(value))) return { opening, error: 'Enter a finite measurement in metres.' }
  if (candidate.widthM < openingMinimum(candidate)) return { opening, error: `${candidate.kind === 'door' ? 'Door' : 'Window'} width must be at least ${openingMinimum(candidate).toFixed(1)} m.` }
  if (candidate.heightM <= 0) return { opening, error: 'Height must be greater than 0 m.' }
  if (candidate.kind === 'window' && candidate.sillM < 0) return { opening, error: 'Window sill must be 0 m or greater.' }

  const maxWidth = Math.max(openingMinimum(candidate), edgeLength(room, candidate.hostEdge) - 0.2)
  const maxHeight = Math.max(0.5, floorHeightM - 0.1)
  const maxSill = candidate.kind === 'window' ? Math.max(0, floorHeightM - candidate.heightM - 0.1) : 0
  const widthM = Math.min(candidate.widthM, maxWidth)
  const heightM = Math.min(candidate.heightM, maxHeight)
  const sillM = candidate.kind === 'window' ? Math.min(candidate.sillM, Math.max(0, floorHeightM - heightM - 0.1)) : 0
  const positionM = Math.max(0.1, Math.min(candidate.positionM, edgeLength(room, candidate.hostEdge) - widthM - 0.1))
  const next = { ...candidate, widthM, heightM, sillM, positionM }
  const clamped = widthM !== candidate.widthM || heightM !== candidate.heightM || sillM !== candidate.sillM || positionM !== candidate.positionM
  return { opening: next, clamped, error: clamped ? 'Measurement was clamped to the host edge and floor height.' : undefined }
}

export function withOpeningEdits(plan: StudioPlan, edits: Record<string, OpeningEdit>): StudioPlan {
  if (!plan.openings?.length) return plan
  const openings = plan.openings.map((opening) => {
    const edit = edits[opening.id]
    if (!edit) return opening
    return applyOpeningEdit(opening, plan.rooms.find((room) => room.id === opening.roomId), plan.floorHeightM, edit).opening
  })
  return { ...plan, openings }
}
