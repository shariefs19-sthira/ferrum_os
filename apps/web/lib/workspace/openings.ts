import type { StudioOpening, StudioOpeningEdge, StudioPlan, StudioRoom } from '../types'

export type OpeningEdit = Partial<Pick<StudioOpening, 'widthM' | 'heightM' | 'sillM' | 'configuration'>>
export type OpeningEditResult = { opening: StudioOpening; error?: string; clamped?: boolean }

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
