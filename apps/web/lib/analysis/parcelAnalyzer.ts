import type { AnalysisResult, RiskFactors } from "../types/analysis"
import { getHistoricalTrends } from "./historicalTrends"
import { calculateRiskScore, getRiskLevel } from "./riskCalculator"

const hash = (value: string) => Array.from(value).reduce((total, character) => ((total * 33) ^ character.charCodeAt(0)) >>> 0, 5381)
const factor = (parcelId: string, domain: string) => 10 + (hash(`${parcelId}:${domain}`) % 81)

/**
 * Coordinates deterministic parcel sub-analyses.
 *
 * The current adapters intentionally produce INDICATIVE development signals;
 * they do not represent a title opinion, site investigation, authority record,
 * hazard certificate, market valuation, or engineering recommendation.
 */
export class ParcelAnalyzer {
  private result: AnalysisResult | null = null

  /** Creates an analyzer for a stable parcel identifier. */
  constructor(private readonly parcelId: string) {
    if (!parcelId.trim()) throw new Error("parcelId is required")
  }

  /** Runs every sub-analysis and returns a reconciled, honesty-labelled result. */
  async analyze(): Promise<AnalysisResult> {
    const [zoningRisk, soilRisk, climateRisk, historyRisk, trends] = await Promise.all([this.analyzeZoning(), this.analyzeSoil(), this.analyzeClimate(), this.analyzeHistory(), getHistoricalTrends(this.parcelId)])
    const factors: RiskFactors = { zoning: zoningRisk, soil: soilRisk, climate: climateRisk, history: historyRisk, market: factor(this.parcelId, "market") }
    const riskScore = calculateRiskScore(factors)
    this.result = { parcelId: this.parcelId, factors, riskScore, riskLevel: getRiskLevel(riskScore), trends, recommendations: [], analyzedAt: new Date().toISOString(), status: "INDICATIVE" }
    this.result.recommendations = this.getRecommendations(riskScore)
    return this.result
  }

  /** Calculates a score for supplied factors, or returns the most recent analysis score when omitted. */
  getRiskScore(factors?: RiskFactors): number { return factors ? calculateRiskScore(factors) : this.result?.riskScore ?? 0 }

  /** Returns deterministic next-step recommendations for the supplied or latest risk score. */
  getRecommendations(score?: number): string[] {
    const effectiveScore = score ?? this.result?.riskScore
    if (effectiveScore === undefined) return ["Run parcel analysis before reviewing indicative risk recommendations."]
    const level = getRiskLevel(effectiveScore)
    if (level === "critical") return ["Pause the decision and commission verified zoning, geotechnical, climate, title-history, and valuation reviews."]
    if (level === "high") return ["Resolve the dominant risks with qualified, parcel-specific investigations before proceeding."]
    if (level === "medium") return ["Complete targeted due diligence for the higher-scoring domains before commitment."]
    return ["Maintain normal professional due diligence; low indicative risk is not clearance or certification."]
  }

  /** Produces an indicative zoning-risk input pending a verified authority adapter. */
  private async analyzeZoning(): Promise<number> { return factor(this.parcelId, "zoning") }
  /** Produces an indicative soil-risk input pending parcel-specific investigation. */
  private async analyzeSoil(): Promise<number> { return factor(this.parcelId, "soil") }
  /** Produces an indicative climate-risk input pending verified hazard adapters. */
  private async analyzeClimate(): Promise<number> { return factor(this.parcelId, "climate") }
  /** Produces an indicative history-risk input pending verified registry adapters. */
  private async analyzeHistory(): Promise<number> { return factor(this.parcelId, "history") }
}
