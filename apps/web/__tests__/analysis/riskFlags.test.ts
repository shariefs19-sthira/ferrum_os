import { describe, it, expect } from 'vitest'
import { computeRiskFlags } from '../../lib/analysis/riskFlags'

const COMPLETE_LAND = { ulpin: 'KA-BLR-0001-2024', district: 'Bengaluru Urban', area_sqm: 1200, land_use: 'Residential' }
const VALID_REGULATORY = { achieved_fsi: 1.5, allowable_fsi: 2.0, setbacks_pass: 4, setbacks_total: 4 }

describe('computeRiskFlags', () => {
  it('produces zero flags for a fully complete, non-sample project (edge case: clean run)', () => {
    const flags = computeRiskFlags({
      land: COMPLETE_LAND,
      regulatory: VALID_REGULATORY,
      boq: { matchedItems: 3, totalItems: 3 },
      usesSampleGovtRates: false,
      usesSampleStampDuty: false,
      gatedFeatures: [],
    })
    expect(flags).toHaveLength(0)
  })

  it('flags missing zoning when regulatory is null', () => {
    const flags = computeRiskFlags({
      land: COMPLETE_LAND,
      regulatory: null,
      boq: { matchedItems: 1, totalItems: 1 },
      usesSampleGovtRates: false,
      usesSampleStampDuty: false,
      gatedFeatures: [],
    })
    expect(flags.some((f) => f.id === 'missing-zoning')).toBe(true)
  })

  it('flags missing ULPIN separately from missing zoning', () => {
    const flags = computeRiskFlags({
      land: {},
      regulatory: VALID_REGULATORY,
      boq: { matchedItems: 1, totalItems: 1 },
      usesSampleGovtRates: false,
      usesSampleStampDuty: false,
      gatedFeatures: [],
    })
    expect(flags.map((f) => f.id)).toEqual(['missing-ulpin'])
  })

  it('flags an empty BOQ distinctly from a partially-unmatched one', () => {
    const empty = computeRiskFlags({ land: COMPLETE_LAND, regulatory: VALID_REGULATORY, boq: { matchedItems: 0, totalItems: 0 }, usesSampleGovtRates: false, usesSampleStampDuty: false, gatedFeatures: [] })
    expect(empty.map((f) => f.id)).toEqual(['empty-boq'])

    const partial = computeRiskFlags({ land: COMPLETE_LAND, regulatory: VALID_REGULATORY, boq: { matchedItems: 2, totalItems: 5 }, usesSampleGovtRates: false, usesSampleStampDuty: false, gatedFeatures: [] })
    expect(partial.map((f) => f.id)).toEqual(['unmatched-boq-items'])
    expect(partial[0].message).toContain('3 of 5')
  })

  it('attaches an INDICATIVE chip for sample-derived data sources', () => {
    const flags = computeRiskFlags({
      land: COMPLETE_LAND,
      regulatory: VALID_REGULATORY,
      boq: { matchedItems: 1, totalItems: 1 },
      usesSampleGovtRates: true,
      usesSampleStampDuty: true,
      gatedFeatures: [],
    })
    expect(flags.filter((f) => f.chip === 'INDICATIVE')).toHaveLength(2)
  })

  it('attaches a ROADMAP chip per gated feature, never fabricating availability', () => {
    const flags = computeRiskFlags({
      land: COMPLETE_LAND,
      regulatory: VALID_REGULATORY,
      boq: { matchedItems: 1, totalItems: 1 },
      usesSampleGovtRates: false,
      usesSampleStampDuty: false,
      gatedFeatures: ['Auto take-off', 'GST computation'],
    })
    const roadmapFlags = flags.filter((f) => f.chip === 'ROADMAP')
    expect(roadmapFlags).toHaveLength(2)
    expect(roadmapFlags[0].id).toBe('gated-auto-take-off')
  })
})
