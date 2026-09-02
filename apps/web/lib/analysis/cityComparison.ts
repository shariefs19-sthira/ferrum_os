// CityComparison — M1.6. Runs the same BOQ + stamp-duty computation
// (CostEngine) across Bengaluru/Pune/Chennai for one project, so the UI
// can show a side-by-side. Feasibility score is included per city too,
// reusing FeasibilityScore with each city's own market band.
import { computeCostBreakdown, type CostBreakdown, type CostMode } from './costEngine'
import { computeFeasibilityScore, type FeasibilityInputs } from './feasibilityScore'
import { CITIES, SAMPLE_BRAND_MULTIPLIERS, SAMPLE_STAMP_DUTY } from './sampleData'
import type { BoqItem, City, GovtRate } from './types'
import type { Role } from '../rateEngine/ferrumRateEngine'

export type CityComparisonRow = {
  city: City
  cost: CostBreakdown
  feasibility_score: number
}

export function computeCityComparison(
  items: BoqItem[],
  govtRates: GovtRate[],
  mode: CostMode,
  feasibilityInputsByCity: (city: City, cost: CostBreakdown) => FeasibilityInputs,
  options: { brandTier?: keyof typeof SAMPLE_BRAND_MULTIPLIERS; role?: Role; propertyConsideration?: number; stampDutyTable?: typeof SAMPLE_STAMP_DUTY } = {},
): CityComparisonRow[] {
  return CITIES.map((city) => {
    const cost = computeCostBreakdown(items, govtRates, city, mode, options)
    const feasibility = computeFeasibilityScore(feasibilityInputsByCity(city, cost))
    return { city, cost, feasibility_score: feasibility.score }
  })
}
