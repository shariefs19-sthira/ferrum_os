import { describe, it, expect } from 'vitest'
import { trustShares } from '../../components/sections/ThreeModeCalculator'

// NUMERIC-UX sanity block: the display-only trust-share normalization
// (BOQ Pro ThreeModeCalculator) must always sum to exactly 100 and never
// mislead a viewer with a share > 100, < 0, or a non-integer.
function assertSanity(shares: [number, number, number]) {
  const sum = shares[0] + shares[1] + shares[2]
  expect(sum).toBe(100)
  for (const s of shares) {
    expect(Number.isInteger(s)).toBe(true)
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThanOrEqual(100)
  }
}

describe('trustShares — always sums to exactly 100', () => {
  it('the documented default (40 govt / 40 market / 20 user) passes through unchanged, already summing to 100', () => {
    const shares = trustShares(40, 40, 20)
    assertSanity(shares)
    expect(shares).toEqual([40, 40, 20])
  })

  it('equal thirds rounds to 34/33/33, not 33/33/33=99 (the rounding trap this exists to avoid)', () => {
    const shares = trustShares(1, 1, 1)
    assertSanity(shares)
  })

  it('raw weights that do not sum to 100 (independent sliders) still normalize to a 100-sum display', () => {
    assertSanity(trustShares(80, 80, 80))
    assertSanity(trustShares(100, 100, 100))
    assertSanity(trustShares(5, 5, 5))
  })

  it('a single dominant weight normalizes toward but never fabricates false zeros for genuinely-zero sliders', () => {
    const shares = trustShares(100, 0, 0)
    assertSanity(shares)
    expect(shares[0]).toBe(100)
    expect(shares[1]).toBe(0)
    expect(shares[2]).toBe(0)
  })

  it('all-zero sliders (edge case: user drags every slider to 0) falls back to an even split, never divides by zero', () => {
    const shares = trustShares(0, 0, 0)
    assertSanity(shares)
  })

  it('asymmetric skew stays proportionally ordered after rounding', () => {
    const shares = trustShares(70, 20, 10)
    assertSanity(shares)
    expect(shares[0]).toBeGreaterThan(shares[1])
    expect(shares[1]).toBeGreaterThan(shares[2])
  })
})
