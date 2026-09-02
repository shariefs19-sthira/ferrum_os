import { describe, it, expect } from 'vitest'
import {
  landDataCompleteness,
  regulatoryFit,
  costConfidence,
  marketLiquidity,
  investmentHeadroom,
  computeFeasibilityScore,
} from '../../lib/analysis/feasibilityScore'

describe('landDataCompleteness', () => {
  it('scores 100 when all 4 fields present', () => {
    expect(landDataCompleteness({ ulpin: 'X', district: 'Y', area_sqm: 100, land_use: 'Residential' })).toBe(100)
  })
  it('scores 0 when nothing present', () => {
    expect(landDataCompleteness({})).toBe(0)
  })
  it('scores 50 with 2 of 4 present', () => {
    expect(landDataCompleteness({ ulpin: 'X', district: 'Y' })).toBe(50)
  })
  it('treats area_sqm=0 as absent (falsy edge case)', () => {
    // area_sqm: 0 is a valid falsy number but not "missing" per the !== undefined/null/'' check
    expect(landDataCompleteness({ ulpin: 'X', district: 'Y', area_sqm: 0, land_use: 'Residential' })).toBe(100)
  })
})

describe('regulatoryFit', () => {
  it('scores 100 when FSI exactly at allowable and all setbacks pass', () => {
    expect(regulatoryFit({ achieved_fsi: 2.0, allowable_fsi: 2.0, setbacks_pass: 4, setbacks_total: 4 })).toBe(100)
  })
  it('scores 50 when FSI at 50% of allowable and all setbacks pass', () => {
    expect(regulatoryFit({ achieved_fsi: 1.0, allowable_fsi: 2.0, setbacks_pass: 4, setbacks_total: 4 })).toBe(75)
  })
  it('penalizes exceeding allowable FSI', () => {
    // fsiRatio = 1.5 -> fsiScore = 100 - 0.5*200 = 0; setbackScore = 100 -> avg 50
    expect(regulatoryFit({ achieved_fsi: 3.0, allowable_fsi: 2.0, setbacks_pass: 4, setbacks_total: 4 })).toBe(50)
  })
  it('returns 0 when allowable_fsi is 0 (edge case, avoids divide by zero)', () => {
    expect(regulatoryFit({ achieved_fsi: 1.0, allowable_fsi: 0, setbacks_pass: 0, setbacks_total: 0 })).toBe(0)
  })
  it('treats setbacks_total=0 as fully passing (no setback data means nothing failed)', () => {
    expect(regulatoryFit({ achieved_fsi: 2.0, allowable_fsi: 2.0, setbacks_pass: 0, setbacks_total: 0 })).toBe(100)
  })
})

describe('costConfidence', () => {
  it('scores 100 when all items matched', () => {
    expect(costConfidence(5, 5)).toBe(100)
  })
  it('scores 0 with zero total items (edge case)', () => {
    expect(costConfidence(0, 0)).toBe(0)
  })
  it('scores 60 with 3 of 5 matched', () => {
    expect(costConfidence(3, 5)).toBe(60)
  })
})

describe('marketLiquidity', () => {
  const band = { p25: 400, p50: 420, p75: 440 }
  it('scores 100 inside the band', () => {
    expect(marketLiquidity(420, band)).toBe(100)
  })
  it('scores 100 exactly at band edges', () => {
    expect(marketLiquidity(400, band)).toBe(100)
    expect(marketLiquidity(440, band)).toBe(100)
  })
  it('degrades linearly below the band', () => {
    // width=40, maxDistance=80, distance=20 -> 100 - 25 = 75
    expect(marketLiquidity(380, band)).toBe(75)
  })
  it('floors at 0 far outside the band', () => {
    expect(marketLiquidity(1000, band)).toBe(0)
  })
  it('handles a zero-width band (edge case)', () => {
    const flatBand = { p25: 100, p50: 100, p75: 100 }
    expect(marketLiquidity(100, flatBand)).toBe(100)
    expect(marketLiquidity(50, flatBand)).toBe(0)
  })
})

describe('investmentHeadroom', () => {
  it('scores 100 at or above the 30% margin ceiling', () => {
    expect(investmentHeadroom(300, 1000)).toBe(100)
    expect(investmentHeadroom(600, 1000)).toBe(100)
  })
  it('scores 0 for zero or negative NPV', () => {
    expect(investmentHeadroom(0, 1000)).toBe(0)
    expect(investmentHeadroom(-50, 1000)).toBe(0)
  })
  it('scores 50 at a 15% margin (half the 30% ceiling)', () => {
    expect(investmentHeadroom(150, 1000)).toBe(50)
  })
  it('returns 0 for zero total investment (edge case, avoids divide by zero)', () => {
    expect(investmentHeadroom(100, 0)).toBe(0)
  })
})

describe('computeFeasibilityScore composite', () => {
  it('produces a fixed vector for a fully-complete, mid-quality project', () => {
    const result = computeFeasibilityScore({
      land: { ulpin: 'KA-BLR-0001-2024', district: 'Bengaluru Urban', area_sqm: 1200.5, land_use: 'Residential' },
      regulatory: { achieved_fsi: 1.0, allowable_fsi: 2.0, setbacks_pass: 4, setbacks_total: 4 },
      boq: { matchedItems: 3, totalItems: 5 },
      market: { targetRate: 420, band: { p25: 400, p50: 420, p75: 440 } },
      investment: { npv: 150, totalInvestment: 1000 },
    })
    // land=100*0.20=20, regulatory=75*0.25=18.75, cost=60*0.20=12, market=100*0.15=15, investment=50*0.20=10 -> sum=75.75 -> round 76
    expect(result.score).toBe(76)
    expect(result.sub_scores).toHaveLength(5)
    expect(result.indicative).toBe(true)
  })

  it('scores 0 for an entirely empty project (edge case)', () => {
    // targetRate deliberately != band.p50 so the zero-width-band branch in
    // marketLiquidity also floors at 0, keeping this a true all-zero vector.
    const result = computeFeasibilityScore({
      land: {},
      regulatory: { achieved_fsi: 0, allowable_fsi: 0, setbacks_pass: 0, setbacks_total: 0 },
      boq: { matchedItems: 0, totalItems: 0 },
      market: { targetRate: 500, band: { p25: 0, p50: 0, p75: 0 } },
      investment: { npv: 0, totalInvestment: 0 },
    })
    expect(result.score).toBe(0)
  })
})
