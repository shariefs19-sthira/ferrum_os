import { describe, it, expect } from 'vitest'
import { computeSensitivity, SENSITIVITY_DELTAS } from '../../lib/analysis/sensitivity'
import { SAMPLE_GOVT_RATES } from '../../lib/analysis/sampleData'

describe('computeSensitivity', () => {
  const items = [{ category: 'Cement (OPC 53)', quantity: 10, unit: 'bag' }]

  it('produces exactly the 5 documented delta points in order', () => {
    const points = computeSensitivity(items, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    expect(points.map((p) => p.delta_pct)).toEqual([...SENSITIVITY_DELTAS])
    expect(points).toHaveLength(5)
  })

  it('0% delta matches computeCostBreakdown exactly for a fixed BOQ', () => {
    const points = computeSensitivity(items, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    const zero = points.find((p) => p.delta_pct === 0)
    // cement: 10 * 410 * 1.18 = 4838
    expect(zero?.grand_total).toBe(4838)
  })

  it('totals increase monotonically with delta_pct', () => {
    const points = computeSensitivity(items, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    for (let i = 1; i < points.length; i++) {
      expect(points[i].grand_total).toBeGreaterThan(points[i - 1].grand_total)
    }
  })

  it('-10% and +10% are symmetric around 0% (edge case check on the rate-shift math)', () => {
    const points = computeSensitivity(items, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    const zero = points.find((p) => p.delta_pct === 0)!.grand_total
    const minus10 = points.find((p) => p.delta_pct === -10)!.grand_total
    const plus10 = points.find((p) => p.delta_pct === 10)!.grand_total
    expect(Math.round((zero - minus10) * 100) / 100).toBe(Math.round((plus10 - zero) * 100) / 100)
  })

  it('handles an empty BOQ (edge case) — every point is 0', () => {
    const points = computeSensitivity([], SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    expect(points.every((p) => p.grand_total === 0)).toBe(true)
  })
})
