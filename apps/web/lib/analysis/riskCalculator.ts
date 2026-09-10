import type { RiskFactors } from "../types/analysis"

const clamp = (value: number) => Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0

/** Calculates the normalized weighted risk score: zoning 30%, soil 25%, climate 20%, history 15%, market 10%. */
export function calculateRiskScore(factors: RiskFactors): number {
  const score = clamp(factors.zoningRisk) * 0.30 + clamp(factors.soilRisk) * 0.25 + clamp(factors.climateRisk) * 0.20 + clamp(factors.historyRisk) * 0.15 + clamp(factors.marketRisk) * 0.10
  return Number(clamp(score).toFixed(2))
}

/** Maps a normalized risk score to a stable operational band. */
export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  const normalized = clamp(score)
  if (normalized < 25) return "low"
  if (normalized < 50) return "medium"
  if (normalized < 75) return "high"
  return "critical"
}
