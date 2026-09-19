// Investment-fit: shared types. Deterministic modules supply NUMBERS; the judge only JUDGES (never invents figures).
export type IntendedUse = 'residential' | 'commercial' | 'agricultural' | 'industrial' | 'mixed' | 'hold'
export type RiskTolerance = 'low' | 'medium' | 'high'

/** User requirement. null = not stated (rendered UNKNOWN, never filled). */
export type FitRequirement = {
  intendedUse: IntendedUse | null
  budgetMinCr: number | null // INR crore
  budgetMaxCr: number | null
  targetReturnPct: number | null // annual, indicative
  holdYears: number | null
  risk: RiskTolerance | null
  minAreaSqm: number | null
  preferredZone: string
  requireVerifiedRecord: boolean
}

export type FitFacts = {
  ulpin: string | null
  state: string | null
  district: string | null
  areaSqm: number | null
  landUse: string | null
  zone: string | null
  askingValueCr: number | null // current value in INR crore, from the deterministic value module
  feasibilityScore: number | null // 0-100, computeFeasibilityScore output
  growthPct: number | null // user growth assumption used by projectLandValue
  provenance: { status: 'INDICATIVE' | 'VERIFIED' | 'GAP'; source: string; vintage: string } | null
}

export type Threshold = { high: number; low: number }
export type Citation = { label: string; value: string }

export type NoulJudgment = { kind: 'noul'; id: string; question: string; probability: number; confidence: number; why: string; cited: Citation[] }
export type ScoreJudgment = { kind: 'score'; id: string; question: string; score: number; levels: number; confidence: number; why: string; cited: Citation[] }
export type Verdict = 'proceed' | 'proceed-with-conditions' | 'do-not-proceed' | 'insufficient-information'
export type ChoiceJudgment = { kind: 'choice'; id: string; question: string; choice: Verdict; probabilities: Record<Verdict, number>; confidence: number; why: string; cited: Citation[] }

export type Band = 'strong' | 'moderate' | 'weak'
export type ScoreBreakdown = { suitPct: number; budgetPct: number; returnPct: number; weights: { suit: number; budget: number; ret: number }; formula: string }
export type Versions = { model: string; questionSet: string; registry: string; thresholds: string }

export type FitResult = {
  source: 'SAMPLE' | 'JEV'
  /** The single headline number. null = "Not enough information" (never a number when the state is too UNKNOWN). */
  score: number | null
  band: Band | null
  breakdown: ScoreBreakdown | null
  versions: Versions
  requirementUsed: { id: string; label: string; value: string; consumedBy: string }[]
  suit: NoulJudgment
  budget: ScoreJudgment
  ret: ScoreJudgment
  verdict: ChoiceJudgment
  unknowns: string[]
  feasibilityScore: number | null // always shown alongside; fallback if model unavailable
  projection: { years: number; growthPct: number; futureValueCr: number; gainCr: number } | null
}
