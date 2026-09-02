// InvestmentCase — M1.4. Reuses the real IRR/NPV math from
// lib/finance/irrNpv.ts (the same functions the InvestFlow REST route and
// MCP tool call) rather than re-deriving it. Builds a cash-flow curve from
// a phasing schedule, then computes base/bull/bear scenarios by shifting
// the exit revenue and total cost by a documented rate-band delta.
import { computeNpv, estimateIrr } from '../finance/irrNpv'

export type PhaseSpend = { month: number; pct_of_total: number }

export type InvestmentScenarioResult = {
  scenario: 'base' | 'bull' | 'bear'
  cash_flows: number[]
  irr: number | null
  npv: number
}

export type InvestmentCaseResult = {
  scenarios: InvestmentScenarioResult[]
  discount_rate: number
  indicative: true
}

/**
 * Builds a month-indexed cash-flow array: negative spend per phase (from
 * `phasing`, which must sum to 1.0 across `pct_of_total`), one positive
 * exit/sale cash flow at `exitMonth`.
 */
export function buildCashFlowCurve(totalCost: number, phasing: PhaseSpend[], exitMonth: number, exitRevenue: number): number[] {
  const lastMonth = Math.max(exitMonth, ...phasing.map((p) => p.month))
  const flows = new Array(lastMonth + 1).fill(0)
  for (const phase of phasing) {
    flows[phase.month] -= totalCost * phase.pct_of_total
  }
  flows[exitMonth] += exitRevenue
  return flows.map((v) => Math.round(v * 100) / 100)
}

/**
 * base/bull/bear via a single rate-band delta (default 10%): bull raises
 * exit revenue and lowers total cost by `deltaPct`; bear does the
 * opposite; base is unshifted. This is the same kind of ±% scenario
 * framing as Sensitivity, applied to the investment case instead of the
 * cost breakdown.
 */
export function computeInvestmentCase(
  totalCost: number,
  phasing: PhaseSpend[],
  exitMonth: number,
  exitRevenue: number,
  discountRate: number,
  deltaPct = 10,
): InvestmentCaseResult {
  const shift = deltaPct / 100
  const scenarioInputs: { scenario: InvestmentScenarioResult['scenario']; costMultiplier: number; revenueMultiplier: number }[] = [
    { scenario: 'bear', costMultiplier: 1 + shift, revenueMultiplier: 1 - shift },
    { scenario: 'base', costMultiplier: 1, revenueMultiplier: 1 },
    { scenario: 'bull', costMultiplier: 1 - shift, revenueMultiplier: 1 + shift },
  ]

  const scenarios = scenarioInputs.map(({ scenario, costMultiplier, revenueMultiplier }) => {
    const cash_flows = buildCashFlowCurve(totalCost * costMultiplier, phasing, exitMonth, exitRevenue * revenueMultiplier)
    return {
      scenario,
      cash_flows,
      irr: estimateIrr(cash_flows),
      npv: Math.round(computeNpv(cash_flows, discountRate) * 100) / 100,
    }
  })

  return { scenarios, discount_rate: discountRate, indicative: true }
}
