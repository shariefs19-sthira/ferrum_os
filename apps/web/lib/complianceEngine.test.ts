import { describe, expect, it } from 'vitest'
import { evaluateCompliance } from './complianceEngine'

describe('evaluateCompliance', () => {
  it('returns an honest, complete sample workflow for a known-good parcel', () => {
    const result = evaluateCompliance({ state: 'Karnataka', areaSqm: 500, proposedHeightM: 12, proposedCoveragePct: 60, proposedFar: 1.8 }, 'Residential')
    expect(result.ok).toBe(true)
    expect(result.permissions).toHaveLength(2)
    expect(result.permissions.every((item) => item.status === 'INDICATIVE' && item.rulesetVersion === '2026.1-SAMPLE')).toBe(true)
    expect(result.permissions.every((item) => item.authority && item.timelineDays.min <= item.timelineDays.max && item.feeEstimateInr.min <= item.feeEstimateInr.max && item.documents.length > 0)).toBe(true)
    expect(result.permissions.map((item) => item.stage)).toEqual(['BUY', 'BUILD'])
  })

  it('flags a known-bad proposal against the selected sample ruleset', () => {
    const result = evaluateCompliance({ state: 'Maharashtra', areaSqm: 300, proposedHeightM: 30, proposedCoveragePct: 80, proposedFar: 4 }, 'Commercial')
    expect(result.ok).toBe(false)
    expect(result.violations).toHaveLength(3)
    expect(result.permissions).toHaveLength(3)
  })

  it('returns no permissions when a ruleset is unavailable', () => {
    const result = evaluateCompliance({ state: 'Kerala', areaSqm: 300, proposedHeightM: 10, proposedCoveragePct: 50, proposedFar: 1 }, 'Residential')
    expect(result).toMatchObject({ ok: false, permissions: [], rulesetVersion: null, status: 'INDICATIVE' })
  })
})
