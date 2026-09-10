import type { ComparativeResult, Metric, Ranking } from "../types/analysis"
import { calculateCAGR } from "./historicalTrends"
import { ParcelAnalyzer } from "./parcelAnalyzer"

/** Compares unique parcel identifiers using the same deterministic analysis contract. */
export async function compareParcels(parcelIds: string[]): Promise<ComparativeResult> {
  const unique = Array.from(new Set(parcelIds.map(id => id.trim()).filter(Boolean)))
  const results = await Promise.all(unique.map(id => new ParcelAnalyzer(id).analyze()))
  const metrics: Metric[] = results.flatMap(result => [
    { parcelId: result.parcelId, name: "riskScore", value: result.riskScore, unit: "score", status: "INDICATIVE" },
    { parcelId: result.parcelId, name: "historicalCagr", value: Number((calculateCAGR(result.trends) * 100).toFixed(2)), unit: "percent", status: "INDICATIVE" },
  ])
  const rankings: Ranking[] = [...results].sort((a, b) => a.riskScore - b.riskScore || a.parcelId.localeCompare(b.parcelId)).map((result, index) => ({ parcelId: result.parcelId, rank: index + 1, score: result.riskScore }))
  const comparison: ComparativeResult = { metrics, rankings, insights: [] }
  comparison.insights = getInsights(comparison)
  return comparison
}

/** Returns the lowest-risk parcel identifier, or an empty string for an empty comparison. */
export function findBestParcel(comparison: ComparativeResult): string { return [...comparison.rankings].sort((a, b) => a.rank - b.rank)[0]?.parcelId ?? "" }

/** Produces honesty-labelled comparison insights without converting indicative scores into advice. */
export function getInsights(comparison: ComparativeResult): string[] {
  if (!comparison.rankings.length) return ["No parcels were supplied for comparison."]
  const best = findBestParcel(comparison)
  return [`${best} has the lowest INDICATIVE composite risk score in this comparison.`, "Confirm zoning, ground conditions, hazards, title history, and valuation with qualified sources before a decision."]
}
