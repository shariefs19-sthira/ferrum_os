import { describe, it, expect } from 'vitest'
import { buildCashFlowCurve, computeInvestmentCase, scenariosFromCashFlows } from '../../lib/analysis/investmentCase'

describe('buildCashFlowCurve', () => {
  it('builds a fixed curve from a 2-phase spend and a final exit', () => {
    const flows = buildCashFlowCurve(1000, [{ month: 0, pct_of_total: 0.6 }, { month: 3, pct_of_total: 0.4 }], 12, 1500)
    expect(flows[0]).toBe(-600)
    expect(flows[3]).toBe(-400)
    expect(flows[12]).toBe(1500)
    expect(flows).toHaveLength(13)
  })

  it('handles a single-phase, immediate-exit curve (edge case)', () => {
    const flows = buildCashFlowCurve(100, [{ month: 0, pct_of_total: 1 }], 0, 120)
    expect(flows).toEqual([20]) // -100 spend + 120 exit, same month
  })

  it('handles zero total cost (edge case)', () => {
    const flows = buildCashFlowCurve(0, [{ month: 0, pct_of_total: 1 }], 5, 100)
    expect(flows[0]).toBe(0)
    expect(flows[5]).toBe(100)
  })
})

describe('computeInvestmentCase', () => {
  it('produces exactly base/bear/bull scenarios with bull > base > bear NPV for a profitable project', () => {
    const result = computeInvestmentCase(1000, [{ month: 0, pct_of_total: 1 }], 12, 1500, 0.1)
    expect(result.scenarios.map((s) => s.scenario).sort()).toEqual(['base', 'bear', 'bull'])
    const byName = Object.fromEntries(result.scenarios.map((s) => [s.scenario, s]))
    expect(byName.bull.npv).toBeGreaterThan(byName.base.npv)
    expect(byName.base.npv).toBeGreaterThan(byName.bear.npv)
  })

  it('reuses the real estimateIrr/computeNpv functions — IRR is null when it cannot converge (edge case: all-negative flows)', () => {
    const result = computeInvestmentCase(1000, [{ month: 0, pct_of_total: 1 }], 12, 0, 0.1)
    const base = result.scenarios.find((s) => s.scenario === 'base')!
    expect(base.irr).toBeNull()
  })

  it('carries the discount rate through unchanged', () => {
    const result = computeInvestmentCase(500, [{ month: 0, pct_of_total: 1 }], 6, 700, 0.08)
    expect(result.discount_rate).toBe(0.08)
    expect(result.indicative).toBe(true)
  })
})

describe('scenariosFromCashFlows', () => {
  it('scales revenue up and spend down for bull, using the real user-entered cash flows directly', () => {
    const cashFlows = [-1000, 300, 400, 500, 600]
    const result = scenariosFromCashFlows(cashFlows, 0.1, 10)
    const byName = Object.fromEntries(result.scenarios.map((s) => [s.scenario, s]))
    expect(byName.base.cash_flows).toEqual(cashFlows)
    expect(byName.bull.cash_flows[0]).toBe(-900) // spend reduced 10%
    expect(byName.bull.cash_flows[1]).toBe(330) // revenue increased 10%
    expect(byName.bear.cash_flows[0]).toBe(-1100)
    expect(byName.bear.cash_flows[1]).toBe(270)
  })

  it('bull NPV exceeds bear NPV for a fixed profitable curve', () => {
    const result = scenariosFromCashFlows([-1000, 300, 400, 500, 600], 0.1, 10)
    const byName = Object.fromEntries(result.scenarios.map((s) => [s.scenario, s]))
    expect(byName.bull.npv).toBeGreaterThan(byName.bear.npv)
  })

  it('handles an all-zero cash flow array (edge case)', () => {
    const result = scenariosFromCashFlows([0, 0, 0], 0.1)
    expect(result.scenarios.every((s) => s.cash_flows.every((v) => v === 0))).toBe(true)
  })
})
