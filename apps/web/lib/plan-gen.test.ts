import { describe, expect, it } from 'vitest'
import { generateStudioPlan } from './plan-gen'

describe('generateStudioPlan', () => {
  it('fills the buildable footprint without inventing area', () => {
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })
    const footprint = plan.buildingWidthM * plan.buildingDepthM

    expect(plan.rooms).toHaveLength(15)
    for (let floor = 1; floor <= plan.floors; floor += 1) {
      const plannedArea = plan.rooms
        .filter((candidate) => candidate.floor === floor)
        .reduce((sum, candidate) => sum + candidate.areaSqm, 0)
      expect(plannedArea).toBeCloseTo(footprint, 8)
    }
  })

  it('clamps setbacks so a usable footprint survives', () => {
    const plan = generateStudioPlan({ plotWidthM: 6, plotDepthM: 8, setbackM: 20, floors: 1 })
    expect(plan.buildingWidthM).toBeGreaterThanOrEqual(4)
    expect(plan.buildingDepthM).toBeGreaterThanOrEqual(6)
  })

  it('emits reconciled elevation heights and floor lines', () => {
    const plan = generateStudioPlan({ plotWidthM: 18, plotDepthM: 24, setbackM: 1.5, floors: 4, floorHeightM: 3.2 })
    expect(plan.elevations).toHaveLength(2)
    expect(plan.elevations[0].heightM).toBeCloseTo(12.8)
    expect(plan.elevations[0].floorLinesM).toEqual([3.2, 6.4, 9.600000000000001])
  })
})
