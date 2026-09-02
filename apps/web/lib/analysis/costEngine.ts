// CostEngine — M1.2 of the Ferrum Analysis Engine (W2-370).
// Reuses the real BOQ/rate-engine logic rather than re-deriving it:
// - item-class × govt-reference-rate lookup (mirrors ThreeModeCalculator's
//   govt mode and apps/web/app/boq-pro/page.tsx's material-row pattern)
// - the real weighted-percentile Ferrum-band engine
//   (lib/rateEngine/ferrumRateEngine.ts) for the "ferrum" mode
// - GST at a flat 18%, mirroring apps/web/app/boq-pro/page.tsx's existing
//   `subtotal * 0.18` line — not a new tax rule, the same one already
//   shipped
// - stamp duty + registration from the same stamp_duty_rates shape as
//   StampDutyProvider (state-scoped, not city-scoped — CITY_STATE maps
//   between the two)
import { computeFerrumRate, type Role } from '../rateEngine/ferrumRateEngine'
import { CITY_STATE, type BoqItem, type City, type GovtRate } from './types'
import { SAMPLE_BRAND_MULTIPLIERS, SAMPLE_STAMP_DUTY } from './sampleData'

export type CostMode = 'govt' | 'ferrum' | 'hybrid'

export type PricedLineItem = {
  category: string
  quantity: number
  unit: string
  rate: number
  line_total: number
  matched_govt_rate: boolean
  taxable: boolean
}

export type CostBreakdown = {
  mode: CostMode
  line_items: PricedLineItem[]
  subtotal: number
  gst: number
  grand_total: number
  stamp_duty?: { state: string; rate_pct: number; registration_fee_pct: number; stamp_duty_amount: number; registration_amount: number; total: number }
  indicative: true
}

const GST_RATE = 0.18

function findGovtRate(rates: GovtRate[], category: string, region: string): GovtRate | undefined {
  return rates.find((r) => r.category === category && r.region === region)
}

/**
 * Prices one BOQ line item under the given mode.
 * - govt: the raw govt reference rate × an optional brand multiplier.
 * - ferrum: the real weighted-band engine's p50, fed (govtRate, govtRate,
 *   userRate ?? govtRate) as the three sources — when the caller hasn't
 *   supplied a distinct market/user rate, the band naturally collapses
 *   toward the govt rate rather than fabricating a market number.
 * - hybrid: the arithmetic mean of the govt and ferrum prices for this
 *   line — a documented blend, not a third independently-sourced rate.
 */
export function priceLineItem(
  item: BoqItem,
  govtRates: GovtRate[],
  region: string,
  mode: CostMode,
  brandTier: keyof typeof SAMPLE_BRAND_MULTIPLIERS = 'standard',
  role: Role = 'buyer',
): PricedLineItem {
  const govtRow = findGovtRate(govtRates, item.category, region)
  const multiplier = SAMPLE_BRAND_MULTIPLIERS[brandTier] ?? 1
  const govtRate = (govtRow?.rate ?? item.rate ?? 0) * multiplier
  const matched = Boolean(govtRow)

  let rate = govtRate
  if (mode === 'ferrum' || mode === 'hybrid') {
    const userRate = item.rate ?? govtRate
    const ferrumRate = computeFerrumRate(govtRate, govtRate, userRate, role).band.p50
    rate = mode === 'ferrum' ? ferrumRate : (govtRate + ferrumRate) / 2
  }

  const roundedRate = Math.round(rate * 100) / 100
  return {
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    rate: roundedRate,
    line_total: Math.round(roundedRate * item.quantity * 100) / 100,
    matched_govt_rate: matched,
    taxable: item.taxable !== false,
  }
}

export function computeStampDuty(
  city: City,
  propertyConsideration: number,
  stampDutyTable: Record<string, { rate_pct: number; registration_fee_pct: number }> = SAMPLE_STAMP_DUTY,
): CostBreakdown['stamp_duty'] {
  const state = CITY_STATE[city]
  const row = stampDutyTable[state]
  if (!row) return undefined
  const stamp_duty_amount = Math.round(propertyConsideration * (row.rate_pct / 100) * 100) / 100
  const registration_amount = Math.round(propertyConsideration * (row.registration_fee_pct / 100) * 100) / 100
  return {
    state,
    rate_pct: row.rate_pct,
    registration_fee_pct: row.registration_fee_pct,
    stamp_duty_amount,
    registration_amount,
    total: Math.round((stamp_duty_amount + registration_amount) * 100) / 100,
  }
}

export function computeCostBreakdown(
  items: BoqItem[],
  govtRates: GovtRate[],
  city: City,
  mode: CostMode,
  options: { brandTier?: keyof typeof SAMPLE_BRAND_MULTIPLIERS; role?: Role; propertyConsideration?: number; stampDutyTable?: typeof SAMPLE_STAMP_DUTY } = {},
): CostBreakdown {
  const line_items = items.map((item) =>
    priceLineItem(item, govtRates, city, mode, options.brandTier ?? 'standard', options.role ?? 'buyer'),
  )
  const subtotal = Math.round(line_items.reduce((sum, li) => sum + li.line_total, 0) * 100) / 100
  const taxableSubtotal = line_items.filter((li) => li.taxable).reduce((sum, li) => sum + li.line_total, 0)
  const gst = Math.round(taxableSubtotal * GST_RATE * 100) / 100
  const grand_total = Math.round((subtotal + gst) * 100) / 100
  const stamp_duty =
    options.propertyConsideration !== undefined
      ? computeStampDuty(city, options.propertyConsideration, options.stampDutyTable)
      : undefined

  return { mode, line_items, subtotal, gst, grand_total, stamp_duty, indicative: true }
}
