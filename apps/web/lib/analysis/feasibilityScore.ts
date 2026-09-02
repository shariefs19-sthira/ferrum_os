// FeasibilityScore — M1.1 of the Ferrum Analysis Engine (W2-370).
// A 0-100 composite of five independently rule-based sub-scores. Every
// sub-score is its own exported pure function so it can be unit-tested and
// reasoned about on its own; computeFeasibilityScore only weights and sums.
import type { FeasibilityResult, LandData, RegulatoryData, SubScore } from './types'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 20%: how many of the 4 core ULPIN-lookup fields are present. */
export function landDataCompleteness(land: LandData): number {
  const fields: (keyof LandData)[] = ['ulpin', 'district', 'area_sqm', 'land_use']
  const present = fields.filter((f) => {
    const v = land[f]
    return v !== undefined && v !== null && v !== ''
  }).length
  return Math.round((present / fields.length) * 100)
}

/**
 * 25%: achieved FSI vs allowable FSI, blended with the setback pass ratio.
 * FSI at or under the allowable limit scores proportionally to how much
 * headroom is used (using exactly 100% of allowable FSI still scores 100 —
 * it's compliant, not penalized for being efficient). Exceeding allowable
 * FSI is a real regulatory failure and is penalized linearly per % over.
 */
export function regulatoryFit(reg: RegulatoryData): number {
  if (reg.allowable_fsi <= 0) return 0
  const fsiRatio = reg.achieved_fsi / reg.allowable_fsi
  const fsiScore = fsiRatio <= 1 ? fsiRatio * 100 : clamp(100 - (fsiRatio - 1) * 200, 0, 100)
  const setbackScore = reg.setbacks_total > 0 ? (reg.setbacks_pass / reg.setbacks_total) * 100 : 100
  return Math.round((fsiScore + setbackScore) / 2)
}

/** 20%: fraction of BOQ line items that resolved to a real govt-reference rate rather than an unmatched/user-guessed one. */
export function costConfidence(matchedItems: number, totalItems: number): number {
  if (totalItems <= 0) return 0
  return Math.round(clamp(matchedItems / totalItems, 0, 1) * 100)
}

/**
 * 15%: where the project's target rate sits inside the city's [p25, p75]
 * reference band. Inside the band = liquid market comparable, scores 100.
 * Outside the band, liquidity degrades linearly out to 2x the band width
 * on either side, then floors at 0 — an arbitrarily far-off number isn't
 * "half liquid," it's just not comparable.
 */
export function marketLiquidity(targetRate: number, band: { p25: number; p50: number; p75: number }): number {
  if (targetRate >= band.p25 && targetRate <= band.p75) return 100
  const width = band.p75 - band.p25
  if (width <= 0) return targetRate === band.p50 ? 100 : 0
  const distance = targetRate < band.p25 ? band.p25 - targetRate : targetRate - band.p75
  const maxDistance = width * 2
  return Math.round(clamp(100 - (distance / maxDistance) * 100, 0, 100))
}

/**
 * 20%: NPV as a fraction of total investment (the initial outlay, i.e.
 * |cashFlows[0]| when it's negative). A 30%+ margin scores 100; 0% or
 * negative NPV scores 0; linear in between. 30% is a documented, arbitrary
 * scoring ceiling, not a claimed hurdle rate — it only affects where this
 * sub-score saturates, not the NPV/IRR numbers themselves.
 */
export function investmentHeadroom(npv: number, totalInvestment: number): number {
  if (totalInvestment <= 0) return 0
  const margin = npv / totalInvestment
  const CEILING = 0.3
  return Math.round(clamp(margin / CEILING, 0, 1) * 100)
}

export type FeasibilityInputs = {
  land: LandData
  regulatory: RegulatoryData
  boq: { matchedItems: number; totalItems: number }
  market: { targetRate: number; band: { p25: number; p50: number; p75: number } }
  investment: { npv: number; totalInvestment: number }
}

export function computeFeasibilityScore(inputs: FeasibilityInputs): FeasibilityResult {
  const subScores: SubScore[] = [
    { label: 'Land-data completeness', weight: 20, score: landDataCompleteness(inputs.land), note: 'ULPIN lookup fields present (ulpin, district, area_sqm, land_use).' },
    { label: 'Regulatory fit', weight: 25, score: regulatoryFit(inputs.regulatory), note: 'Achieved vs allowable FSI, blended with setback pass ratio.' },
    { label: 'Cost confidence', weight: 20, score: costConfidence(inputs.boq.matchedItems, inputs.boq.totalItems), note: 'Share of BOQ line items matched to a govt reference rate.' },
    { label: 'Market liquidity', weight: 15, score: marketLiquidity(inputs.market.targetRate, inputs.market.band), note: "Target rate's position inside the city's p25-p75 reference band." },
    { label: 'Investment headroom', weight: 20, score: investmentHeadroom(inputs.investment.npv, inputs.investment.totalInvestment), note: 'NPV as a fraction of total investment, capped at a 30% margin.' },
  ]
  const weightedSum = subScores.reduce((sum, s) => sum + s.score * (s.weight / 100), 0)
  return { score: Math.round(clamp(weightedSum, 0, 100)), sub_scores: subScores, indicative: true }
}
