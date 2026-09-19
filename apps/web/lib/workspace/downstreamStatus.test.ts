import { describe, expect, it } from 'vitest'
import { generateStudioPlan } from '../plan-gen'
import { anyDownstreamStale, downstreamStatus, recordRevision } from './downstreamStatus'

const base = { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 2 }
const snapshot = { governingSpanM: 7.4, structuralPass: true }

describe('downstream STALE UPSTREAM DATA', () => {
  it('reports nothing when no outputs have been recorded', () => {
    expect(downstreamStatus(generateStudioPlan(base), undefined)).toEqual([])
  })

  it('BOQ and structural are CURRENT for the recorded geometry and stay CURRENT on cosmetic edits', () => {
    const plan = generateStudioPlan(base)
    const record = recordRevision(plan, snapshot, () => '2026-09-19T00:00:00.000Z')
    const cosmetic = { ...plan, rooms: plan.rooms.map((room) => ({ ...room, color: '#123456' })) }
    for (const candidate of [plan, cosmetic]) {
      const statuses = downstreamStatus(candidate, record)
      expect(statuses.map((status) => status.id)).toEqual(['BOQ', 'STRUCTURAL'])
      expect(anyDownstreamStale(statuses)).toBe(false)
    }
  })

  it('both become STALE UPSTREAM DATA once a wall moves, and clear after moving it back', () => {
    const record = recordRevision(generateStudioPlan(base), snapshot)
    const moved = generateStudioPlan({ ...base, wallOffsets: { 'int-v0': 1.2 } })
    const statuses = downstreamStatus(moved, record)
    expect(statuses.every((status) => status.state === 'STALE UPSTREAM DATA')).toBe(true)
    expect(statuses[0].recordedRevision).not.toBe(statuses[0].currentRevision)
    expect(anyDownstreamStale(downstreamStatus(generateStudioPlan({ ...base, wallOffsets: {} }), record))).toBe(false)
  })

  it('keeps the recorded structural result labelled INDICATIVE, never a design certainty', () => {
    const plan = generateStudioPlan(base)
    const [, structural] = downstreamStatus(plan, recordRevision(plan, snapshot))
    expect(structural.detail).toMatch(/INDICATIVE/)
  })
})
