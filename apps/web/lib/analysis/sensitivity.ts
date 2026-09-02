// Sensitivity — M1.3. Recomputes the full cost breakdown at
// -10/-5/0/+5/+10% rate deltas, reusing computeCostBreakdown so the
// sensitivity numbers can never drift from the base CostEngine formula.
import { computeCostBreakdown, type CostBreakdown, type CostMode } from './costEngine'
import type { BoqItem, City, GovtRate } from './types'
import { SAMPLE_BRAND_MULTIPLIERS, SAMPLE_STAMP_DUTY } from './sampleData'
import type { Role } from '../rateEngine/ferrumRateEngine'

export const SENSITIVITY_DELTAS = [-10, -5, 0, 5, 10] as const

export type SensitivityPoint = {
  delta_pct: number
  grand_total: number
}

export function computeSensitivity(
  items: BoqItem[],
  govtRates: GovtRate[],
  city: City,
  mode: CostMode,
  options: { brandTier?: keyof typeof SAMPLE_BRAND_MULTIPLIERS; role?: Role; propertyConsideration?: number; stampDutyTable?: typeof SAMPLE_STAMP_DUTY } = {},
): SensitivityPoint[] {
  return SENSITIVITY_DELTAS.map((delta_pct) => {
    const shiftedRates: GovtRate[] = govtRates.map((r) => ({ ...r, rate: r.rate * (1 + delta_pct / 100) }))
    const shiftedItems: BoqItem[] = items.map((item) =>
      item.rate !== undefined ? { ...item, rate: item.rate * (1 + delta_pct / 100) } : item,
    )
    const breakdown: CostBreakdown = computeCostBreakdown(shiftedItems, shiftedRates, city, mode, options)
    return { delta_pct, grand_total: breakdown.grand_total }
  })
}
