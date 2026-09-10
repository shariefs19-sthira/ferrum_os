/** Normalized risk inputs. Each named domain is constrained to the inclusive 0–100 range. */
export interface RiskFactors { zoning: number; soil: number; climate: number; history: number; market: number }

/** One annual observation in an indicative parcel-value series. */
export interface TrendData { year: number; value: number; changePercent: number; category?: "INDICATIVE" | "PROJECTED_INDICATIVE" }

/** Complete deterministic parcel-analysis result. */
export interface AnalysisResult {
  parcelId: string
  factors: RiskFactors
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  trends: TrendData[]
  recommendations: string[]
  analyzedAt: string
  status: "INDICATIVE"
}

/** A comparable numeric measure for one parcel. */
export interface Metric { parcelId: string; name: "riskScore" | "historicalCagr"; value: number; unit: "score" | "percent"; status: "INDICATIVE" }

/** Risk-based ordinal position; lower risk ranks first. */
export interface Ranking { parcelId: string; rank: number; score: number }

/** Multi-parcel comparison assembled from the same analysis engine. */
export interface ComparativeResult { metrics: Metric[]; rankings: Ranking[]; insights: string[] }
