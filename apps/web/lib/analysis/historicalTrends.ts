import type { TrendData } from "../types/analysis"

const hash = (value: string) => Array.from(value).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 2166136261)

/** Returns deterministic development data. Every observation is explicitly INDICATIVE, never a market valuation. */
export async function getHistoricalTrends(parcelId: string, years = 10): Promise<TrendData[]> {
  const count = Math.max(0, Math.min(100, Math.floor(years)))
  if (!count) return []
  const seed = hash(parcelId)
  const endYear = new Date().getUTCFullYear()
  const base = 100 + (seed % 200)
  const annualRate = 0.02 + ((seed >>> 8) % 600) / 10000
  return Array.from({ length: count }, (_, index) => {
    const variation = ((((seed >>> (index % 16)) & 7) - 3) / 1000)
    const rate = annualRate + variation
    const value = Number((base * Math.pow(1 + annualRate, index)).toFixed(2))
    return { year: endYear - count + index + 1, value, changePercent: index ? Number((rate * 100).toFixed(2)) : 0, category: "INDICATIVE" }
  })
}

/** Calculates compound annual growth from the first and last observations. */
export function calculateCAGR(trends: TrendData[]): number {
  if (trends.length < 2 || trends[0].value <= 0 || trends.at(-1)!.value < 0) return 0
  const elapsedYears = trends.at(-1)!.year - trends[0].year
  if (elapsedYears <= 0) return 0
  return Math.pow(trends.at(-1)!.value / trends[0].value, 1 / elapsedYears) - 1
}

/** Extends a trend with deterministic CAGR projections, labelled PROJECTED_INDICATIVE. */
export function projectFuture(trends: TrendData[], years: number): TrendData[] {
  const count = Math.max(0, Math.min(100, Math.floor(years)))
  if (!trends.length || !count) return []
  const last = trends.at(-1)!
  const rate = calculateCAGR(trends)
  return Array.from({ length: count }, (_, index) => ({ year: last.year + index + 1, value: Number((last.value * Math.pow(1 + rate, index + 1)).toFixed(2)), changePercent: Number((rate * 100).toFixed(2)), category: "PROJECTED_INDICATIVE" }))
}
