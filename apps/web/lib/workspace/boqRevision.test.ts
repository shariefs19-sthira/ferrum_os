import { describe, expect, it } from 'vitest'
import { generateStudioPlan } from '../plan-gen'
import { computeRevisionDelta, createBoqRevision, effectiveCheckerStatus, isRevisionStale } from './boqRevision'

const plan3Floors = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })
const plan4Floors = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 4 })
const planNarrower = generateStudioPlan({ plotWidthM: 18, plotDepthM: 30, setbackM: 2, floors: 3 })

describe('createBoqRevision', () => {
  it('creates revision 1 with no parent from a fresh plan', () => {
    const revision = createBoqRevision(plan3Floors, null)
    expect(revision.revisionId).toBe(1)
    expect(revision.parentRevisionId).toBeNull()
    expect(revision.checkerStatus).toBe('DRAFT')
    expect(revision.lines.length).toBeGreaterThan(0)
  })

  it('is idempotent against unchanged geometry — recomputing returns the same revision object, not a duplicate', () => {
    const first = createBoqRevision(plan3Floors, null)
    const second = createBoqRevision(generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 }), first)
    expect(second).toBe(first)
    expect(second.revisionId).toBe(1)
  })

  it('advances the revision and records lineage when geometry actually changes', () => {
    const first = createBoqRevision(plan3Floors, null)
    const second = createBoqRevision(plan4Floors, first)
    expect(second.revisionId).toBe(2)
    expect(second.parentRevisionId).toBe(1)
    expect(second.fingerprint).not.toBe(first.fingerprint)
  })
})

describe('stale-upstream-data detection', () => {
  it('flags a held revision stale once the plan it was measured from has moved on', () => {
    const revision = createBoqRevision(plan3Floors, null)
    expect(isRevisionStale(revision, plan3Floors)).toBe(false)
    expect(isRevisionStale(revision, plan4Floors)).toBe(true)
  })

  it('overrides a CHECKED status with STALE UPSTREAM DATA once geometry has moved on, never silently keeping the old status', () => {
    const revision = { ...createBoqRevision(plan3Floors, null), checkerStatus: 'CHECKED' as const }
    expect(effectiveCheckerStatus(revision, plan3Floors)).toBe('CHECKED')
    expect(effectiveCheckerStatus(revision, plan4Floors)).toBe('STALE UPSTREAM DATA')
  })
})

describe('revision delta', () => {
  it('shows zero delta for unaffected floors and a fresh line (no previous) for a newly added floor', () => {
    const first = createBoqRevision(plan3Floors, null)
    const second = createBoqRevision(plan4Floors, first)
    const delta = computeRevisionDelta(first, second)
    const floor2Doors = delta.find((line) => line.catalogId === 'doors' && line.scope === 2)!
    expect(floor2Doors.deltaQuantity).toBe(0)
    const floor4Doors = delta.find((line) => line.catalogId === 'doors' && line.scope === 4)!
    expect(floor4Doors.previousQuantity).toBeNull()
    expect(floor4Doors.nextQuantity).toBeGreaterThan(0)
    expect(floor4Doors.deltaQuantity).toBeNull()
  })

  it('shows a nonzero delta on every scoped line when footprint-affecting geometry changes', () => {
    const first = createBoqRevision(plan3Floors, null)
    const second = createBoqRevision(planNarrower, first)
    const delta = computeRevisionDelta(first, second)
    const rccSlabLines = delta.filter((line) => line.catalogId === 'rcc-slab')
    expect(rccSlabLines.length).toBeGreaterThan(0)
    expect(rccSlabLines.every((line) => line.deltaQuantity !== null && line.deltaQuantity < 0)).toBe(true)
  })
})
