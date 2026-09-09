import { describe, expect, it } from 'vitest'
import { NORMALIZED_LAND_INDEX, projectLandValue } from './investForecast'

describe('normalized land-value forecast', () => {
  it('computes from inputs rather than a fixed output', () => {
    const result = projectLandValue(1_000_000, 10, 2)
    expect(result.futureValue).toBeCloseTo(1_210_000, 6)
    expect(result.gain).toBeCloseTo(210_000, 6)
    expect(result.normalizedIndex).toBeCloseTo(121, 10)
    expect(result.indicative).toBe(true)
    expect(projectLandValue(2_000_000, 10, 2).futureValue).toBeCloseTo(2_420_000, 6)
  })
  it('names the base-100 methodology', () => expect(NORMALIZED_LAND_INDEX.method).toContain('100 ×'))
})
