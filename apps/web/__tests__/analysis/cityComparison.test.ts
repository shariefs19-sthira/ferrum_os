import { describe, it, expect } from 'vitest'
import { computeCityComparison } from '../../lib/analysis/cityComparison'
import { SAMPLE_GOVT_RATES } from '../../lib/analysis/sampleData'
import type { City } from '../../lib/analysis/types'

const items = [{ category: 'Cement (OPC 53)', quantity: 10, unit: 'bag' }]

function feasibilityInputsFor(city: City) {
  return {
    land: { ulpin: 'X', district: city, area_sqm: 1000, land_use: 'Residential' },
    regulatory: { achieved_fsi: 1.5, allowable_fsi: 2.0, setbacks_pass: 4, setbacks_total: 4 },
    boq: { matchedItems: 1, totalItems: 1 },
    market: { targetRate: 410, band: { p25: 400, p50: 420, p75: 440 } },
    investment: { npv: 150, totalInvestment: 1000 },
  }
}

describe('computeCityComparison', () => {
  it('returns exactly the 3 cities in order', () => {
    const rows = computeCityComparison(items, SAMPLE_GOVT_RATES, 'govt', () => feasibilityInputsFor('Bengaluru'))
    expect(rows.map((r) => r.city)).toEqual(['Bengaluru', 'Pune', 'Chennai'])
  })

  it('reflects each city\'s distinct govt rate in cost, not one shared number', () => {
    const rows = computeCityComparison(items, SAMPLE_GOVT_RATES, 'govt', () => feasibilityInputsFor('Bengaluru'))
    const byCity = Object.fromEntries(rows.map((r) => [r.city, r.cost.subtotal]))
    // cement: Bengaluru 410, Pune 398, Chennai 405 (per migrations/0004 seed)
    expect(byCity.Bengaluru).toBe(4100)
    expect(byCity.Pune).toBe(3980)
    expect(byCity.Chennai).toBe(4050)
  })

  it('computes a feasibility score per city using that city\'s own inputs', () => {
    const rows = computeCityComparison(items, SAMPLE_GOVT_RATES, 'govt', (city) => feasibilityInputsFor(city))
    expect(rows.every((r) => typeof r.feasibility_score === 'number')).toBe(true)
  })

  it('handles an empty BOQ across all cities (edge case)', () => {
    const rows = computeCityComparison([], SAMPLE_GOVT_RATES, 'govt', () => feasibilityInputsFor('Bengaluru'))
    expect(rows.every((r) => r.cost.subtotal === 0)).toBe(true)
  })
})
