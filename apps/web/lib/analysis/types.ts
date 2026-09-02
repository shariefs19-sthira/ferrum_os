// Shared types for the Ferrum Analysis Engine (W2-370). Every calculator
// here is a pure function: no D1, no fetch, no env access. The API layer
// (M2) is responsible for loading real project/artifact data and passing
// it in. This keeps every formula independently unit-testable and keeps
// "what data did this number come from" traceable.

export type City = 'Bengaluru' | 'Pune' | 'Chennai'

export const CITY_STATE: Record<City, string> = {
  Bengaluru: 'Karnataka',
  Pune: 'Maharashtra',
  Chennai: 'Tamil Nadu',
}

export type LandData = {
  ulpin?: string
  district?: string
  area_sqm?: number
  land_use?: string
}

export type RegulatoryData = {
  achieved_fsi: number
  allowable_fsi: number
  setbacks_pass: number
  setbacks_total: number
}

export type BoqItem = {
  category: string
  quantity: number
  unit: string
  /** Optional: a user/market-supplied rate. When absent, CostEngine falls back to the govt reference rate. */
  rate?: number
  taxable?: boolean
}

export type GovtRate = { category: string; region: string; unit: string; rate: number }

export type BrandMultiplierTable = Record<string, number>

export type CashFlow = number[]

export type SubScore = {
  label: string
  weight: number
  score: number // 0-100
  note: string
}

export type FeasibilityResult = {
  score: number // 0-100, rounded
  sub_scores: SubScore[]
  indicative: true
}
