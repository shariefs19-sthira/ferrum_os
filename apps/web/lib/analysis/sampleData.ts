// Sample/seed data mirrored from the real D1 migrations, for use as test
// fixtures and as the CityComparison calculator's input when no live D1
// data is passed in. These are literal copies of migrations/0003_transact.sql
// and migrations/0004_govt_reference_rates.sql — NOT a new data source, NOT
// fabricated, and NOT a substitute for the real provider classes
// (StampDutyProvider / GovtReferenceRatesProvider) that M2's API layer
// must use for live D1 reads. Kept here only so the pure calculators in
// this directory can be tested and exercised without a database.
import type { City, GovtRate } from './types'

export const SAMPLE_STAMP_DUTY: Record<string, { rate_pct: number; registration_fee_pct: number }> = {
  Karnataka: { rate_pct: 5.0, registration_fee_pct: 1.0 },
  Maharashtra: { rate_pct: 5.0, registration_fee_pct: 1.0 },
  'Tamil Nadu': { rate_pct: 7.0, registration_fee_pct: 1.0 },
}

export const SAMPLE_GOVT_RATES: GovtRate[] = [
  { category: 'Cement (OPC 53)', region: 'Bengaluru', unit: 'per bag (50kg)', rate: 410.0 },
  { category: 'Cement (OPC 53)', region: 'Pune', unit: 'per bag (50kg)', rate: 398.0 },
  { category: 'Cement (OPC 53)', region: 'Chennai', unit: 'per bag (50kg)', rate: 405.0 },
  { category: 'TMT Steel (Fe 500D)', region: 'Bengaluru', unit: 'per kg', rate: 65.0 },
  { category: 'TMT Steel (Fe 500D)', region: 'Pune', unit: 'per kg', rate: 63.5 },
  { category: 'TMT Steel (Fe 500D)', region: 'Chennai', unit: 'per kg', rate: 64.8 },
  { category: 'Skilled Mason (labor)', region: 'Bengaluru', unit: 'per day', rate: 850.0 },
  { category: 'Skilled Mason (labor)', region: 'Pune', unit: 'per day', rate: 800.0 },
  { category: 'Skilled Mason (labor)', region: 'Chennai', unit: 'per day', rate: 820.0 },
]

export const CITIES: City[] = ['Bengaluru', 'Pune', 'Chennai']

// Brand-multiplier SAMPLE table (spec item M1.2) — explicitly not a real
// vendor/brand price list; a placeholder multiplier set for the Ferrum-band
// mode's "brand tier" concept until real vendor data is sourced.
export const SAMPLE_BRAND_MULTIPLIERS: Record<string, number> = {
  economy: 0.92,
  standard: 1.0,
  premium: 1.15,
}

// No real municipal DCR/zoning data source exists anywhere in this repo
// (confirmed by inventory during W2-361) — there is no "allowable FSI" or
// "minimum setback" lookup by city/zone. These are explicitly-labeled
// SAMPLE assumptions used ONLY so regulatoryFit has something to compare
// a test-fit's achieved FSI/setback against; they are not a real
// development-control-rules figure for any city and must be surfaced with
// an INDICATIVE chip wherever shown (see riskFlags.ts).
export const SAMPLE_ALLOWABLE_FSI = 2.0
export const SAMPLE_MIN_SETBACK_M = 1.5
