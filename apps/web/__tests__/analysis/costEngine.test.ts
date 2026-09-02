import { describe, it, expect } from 'vitest'
import { priceLineItem, computeStampDuty, computeCostBreakdown } from '../../lib/analysis/costEngine'
import { SAMPLE_GOVT_RATES, SAMPLE_STAMP_DUTY } from '../../lib/analysis/sampleData'

const CEMENT_ITEM = { category: 'Cement (OPC 53)', quantity: 10, unit: 'per bag (50kg)' }

describe('priceLineItem', () => {
  it('govt mode uses the raw seeded govt rate for Bengaluru cement', () => {
    const priced = priceLineItem(CEMENT_ITEM, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    expect(priced.rate).toBe(410)
    expect(priced.line_total).toBe(4100)
    expect(priced.matched_govt_rate).toBe(true)
  })

  it('applies the brand multiplier in govt mode', () => {
    const priced = priceLineItem(CEMENT_ITEM, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt', 'premium')
    // priceLineItem rounds to 2dp; 410*1.15 in raw float is 471.49999999999994
    expect(priced.rate).toBe(471.5)
  })

  it('marks unmatched category as unmatched, falls back to item.rate', () => {
    const priced = priceLineItem({ category: 'Unknown Material', quantity: 1, unit: 'each', rate: 100 }, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    expect(priced.matched_govt_rate).toBe(false)
    expect(priced.rate).toBe(100)
  })

  it('unmatched category with no fallback rate prices at 0 (never fabricates a number)', () => {
    const priced = priceLineItem({ category: 'Unknown Material', quantity: 1, unit: 'each' }, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    expect(priced.rate).toBe(0)
  })

  it('ferrum mode collapses toward the govt rate when no distinct user rate is supplied', () => {
    const priced = priceLineItem(CEMENT_ITEM, SAMPLE_GOVT_RATES, 'Bengaluru', 'ferrum')
    expect(priced.rate).toBe(410)
  })

  it('hybrid mode is the mean of govt and ferrum prices', () => {
    const item = { ...CEMENT_ITEM, rate: 450 }
    const govtPrice = priceLineItem(item, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt').rate
    const ferrumPrice = priceLineItem(item, SAMPLE_GOVT_RATES, 'Bengaluru', 'ferrum').rate
    const hybridPrice = priceLineItem(item, SAMPLE_GOVT_RATES, 'Bengaluru', 'hybrid').rate
    expect(hybridPrice).toBe(Math.round(((govtPrice + ferrumPrice) / 2) * 100) / 100)
  })
})

describe('computeStampDuty', () => {
  it('computes Karnataka (Bengaluru) stamp duty + registration on a fixed consideration', () => {
    const sd = computeStampDuty('Bengaluru', 5_000_000, SAMPLE_STAMP_DUTY)
    expect(sd?.state).toBe('Karnataka')
    expect(sd?.stamp_duty_amount).toBe(250000) // 5% of 5,000,000
    expect(sd?.registration_amount).toBe(50000) // 1%
    expect(sd?.total).toBe(300000)
  })

  it('Tamil Nadu (Chennai) uses its distinct 7% rate', () => {
    const sd = computeStampDuty('Chennai', 5_000_000, SAMPLE_STAMP_DUTY)
    expect(sd?.stamp_duty_amount).toBe(350000)
  })

  it('returns undefined for a state not in the table (edge case)', () => {
    expect(computeStampDuty('Bengaluru', 100, {})).toBeUndefined()
  })
})

describe('computeCostBreakdown', () => {
  it('computes subtotal, GST (18% flat on taxable items), and grand total for a fixed 2-item BOQ', () => {
    const items = [
      { category: 'Cement (OPC 53)', quantity: 10, unit: 'bag', taxable: true },
      { category: 'TMT Steel (Fe 500D)', quantity: 100, unit: 'kg', taxable: true },
    ]
    const breakdown = computeCostBreakdown(items, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    // cement: 10*410=4100, steel: 100*65=6500, subtotal=10600
    expect(breakdown.subtotal).toBe(10600)
    expect(breakdown.gst).toBe(Math.round(10600 * 0.18 * 100) / 100)
    expect(breakdown.grand_total).toBe(breakdown.subtotal + breakdown.gst)
  })

  it('excludes non-taxable items from GST but includes them in the subtotal', () => {
    const items = [
      { category: 'Cement (OPC 53)', quantity: 10, unit: 'bag', taxable: true },
      { category: 'Skilled Mason (labor)', quantity: 5, unit: 'day', taxable: false },
    ]
    const breakdown = computeCostBreakdown(items, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    // cement 4100 taxable, mason 5*850=4250 non-taxable
    expect(breakdown.subtotal).toBe(4100 + 4250)
    expect(breakdown.gst).toBe(Math.round(4100 * 0.18 * 100) / 100)
  })

  it('handles an empty BOQ (edge case)', () => {
    const breakdown = computeCostBreakdown([], SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    expect(breakdown.subtotal).toBe(0)
    expect(breakdown.gst).toBe(0)
    expect(breakdown.grand_total).toBe(0)
    expect(breakdown.line_items).toHaveLength(0)
  })

  it('includes stamp duty only when propertyConsideration is supplied', () => {
    const items = [{ category: 'Cement (OPC 53)', quantity: 1, unit: 'bag' }]
    const withoutSd = computeCostBreakdown(items, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt')
    expect(withoutSd.stamp_duty).toBeUndefined()
    const withSd = computeCostBreakdown(items, SAMPLE_GOVT_RATES, 'Bengaluru', 'govt', { propertyConsideration: 1_000_000 })
    expect(withSd.stamp_duty?.total).toBe(60000) // 5% + 1% of 1,000,000
  })
})
