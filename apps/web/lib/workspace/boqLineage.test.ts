import { describe, expect, it } from 'vitest'
import { generateStudioPlan } from '../plan-gen'
import { measureBoq } from './measuredBoq'
import {
  buildElementRegister,
  measureBoqLineage,
  planFingerprint,
  structuralQuantitySummary,
  UNSUPPORTED_STRUCTURAL_ELEMENT_TYPES,
} from './boqLineage'

const basePlan = () => generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })

describe('planFingerprint', () => {
  it('changes when geometry changes', () => {
    const plan = basePlan()
    const changed = generateStudioPlan({ plotWidthM: 22, plotDepthM: 30, setbackM: 2, floors: 3 })
    expect(planFingerprint(changed)).not.toBe(planFingerprint(plan))
  })

  it('is stable for the same geometry recomputed twice', () => {
    expect(planFingerprint(basePlan())).toBe(planFingerprint(basePlan()))
  })

  it('ignores cosmetic-only fields (room color)', () => {
    const plan = basePlan()
    const repainted = { ...plan, rooms: plan.rooms.map((room) => ({ ...room, color: '#000000' })) }
    expect(planFingerprint(repainted)).toBe(planFingerprint(plan))
  })
})

describe('measureBoqLineage', () => {
  it('reconciles per-floor + foundation quantities to the same aggregate measureBoq already returns', () => {
    const plan = basePlan()
    const aggregate = measureBoq(plan)
    const lineage = measureBoqLineage(plan)
    for (const line of aggregate) {
      const total = lineage.filter((entry) => entry.catalogId === line.item.id).reduce((sum, entry) => sum + entry.quantity, 0)
      expect(total).toBeCloseTo(line.quantity, 6)
    }
  })

  it('attributes every source element id to a real room or opening in the plan', () => {
    const plan = basePlan()
    const roomIds = new Set(plan.rooms.map((room) => room.id))
    const openingIds = new Set((plan.openings ?? []).map((opening) => opening.id))
    for (const entry of measureBoqLineage(plan)) {
      expect(entry.sourceElementIds.length).toBeGreaterThan(0)
      for (const id of entry.sourceElementIds) {
        expect(roomIds.has(id) || openingIds.has(id)).toBe(true)
      }
    }
  })

  it('scopes earthwork and PCC to FOUNDATION, once, not once per floor', () => {
    const plan = basePlan()
    const lineage = measureBoqLineage(plan)
    const earthwork = lineage.filter((entry) => entry.catalogId === 'earthwork')
    expect(earthwork).toHaveLength(1)
    expect(earthwork[0].scope).toBe('FOUNDATION')
    expect(earthwork[0].formulaBasis).toContain('one-time')
  })

  it('scopes doors/windows per floor using the actual openings on that floor', () => {
    const plan = basePlan()
    const lineage = measureBoqLineage(plan)
    const floor2Doors = lineage.find((entry) => entry.catalogId === 'doors' && entry.scope === 2)!
    const realFloor2Doors = (plan.openings ?? []).filter((opening) => opening.floor === 2 && opening.kind === 'door')
    expect(floor2Doors.quantity).toBe(realFloor2Doors.length)
    expect(floor2Doors.sourceElementIds.sort()).toEqual(realFloor2Doors.map((opening) => opening.id).sort())
  })

  it('never fabricates a rate — amountInr stays null wherever rateInr is null', () => {
    const lineage = measureBoqLineage(basePlan())
    expect(lineage.every((entry) => entry.rateInr !== null || entry.amountInr === null)).toBe(true)
  })
})

describe('structural quantity distinction', () => {
  it('computes concrete volume and reinforcement weight, and marks formwork UNKNOWN rather than inventing it', () => {
    const summary = structuralQuantitySummary(measureBoqLineage(basePlan()))
    const concrete = summary.find((item) => item.kind === 'CONCRETE_VOLUME')!
    const reinforcement = summary.find((item) => item.kind === 'REINFORCEMENT_WEIGHT')!
    const formwork = summary.find((item) => item.kind === 'FORMWORK_AREA')!
    expect(concrete.status).toBe('COMPUTED')
    expect(concrete.value).toBeGreaterThan(0)
    expect(reinforcement.status).toBe('COMPUTED')
    expect(reinforcement.value).toBeGreaterThan(0)
    expect(formwork.status).toBe('UNKNOWN')
    expect(formwork.value).toBeNull()
  })
})

describe('element register', () => {
  it('covers every room and opening the plan actually generated', () => {
    const plan = basePlan()
    const register = buildElementRegister(plan)
    expect(register.filter((entry) => entry.elementType === 'room')).toHaveLength(plan.rooms.length)
    expect(register.filter((entry) => entry.elementType === 'opening')).toHaveLength((plan.openings ?? []).length)
  })

  it('names foundation/column/beam/stair/wall as explicitly unsupported element types', () => {
    expect(UNSUPPORTED_STRUCTURAL_ELEMENT_TYPES).toEqual(['foundation', 'column', 'beam', 'stair', 'wall'])
  })
})
