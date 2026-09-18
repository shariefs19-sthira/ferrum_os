import { describe, expect, it } from 'vitest'
import { generateStudioPlan } from '../plan-gen'
import { applyOpeningEdit, withOpeningEdits } from './openings'

describe('parametric openings', () => {
  it('generates stable hosted doors and windows inside every room edge', () => {
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 2 })
    expect(plan.openings).toHaveLength(plan.rooms.length * 2)
    for (const opening of plan.openings ?? []) {
      const room = plan.rooms.find((candidate) => candidate.id === opening.roomId)!
      const edgeLength = opening.hostEdge === 'north' || opening.hostEdge === 'south' ? room.widthM : room.depthM
      expect(opening.positionM).toBeGreaterThanOrEqual(0)
      expect(opening.positionM + opening.widthM).toBeLessThanOrEqual(edgeLength)
    }
  })

  it('rejects invalid dimensions and clamps feasible edits without corrupting the plan', () => {
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 1 })
    const opening = plan.openings!.find((candidate) => candidate.kind === 'window')!
    const room = plan.rooms.find((candidate) => candidate.id === opening.roomId)!
    expect(applyOpeningEdit(opening, room, plan.floorHeightM, { widthM: 0 }).error).toMatch(/width/i)
    const clamped = applyOpeningEdit(opening, room, plan.floorHeightM, { widthM: 99, heightM: 99, sillM: 99 })
    expect(clamped.clamped).toBe(true)
    expect(clamped.opening.widthM).toBeLessThan(room.widthM)
    expect(clamped.opening.sillM + clamped.opening.heightM).toBeLessThan(plan.floorHeightM)
    const edited = withOpeningEdits(plan, { [opening.id]: { widthM: 99 } })
    expect(edited.openings!.find((candidate) => candidate.id === opening.id)!.widthM).toBeLessThan(room.widthM)
  })
})
