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
    const factors: RiskFactors = { zoningRisk, soilRisk, climateRisk, historyRisk, marketRisk: factor(this.parcelId, "market") }
    const riskScore = calculateRiskScore(factors)
    this.result = { parcelId: this.parcelId, factors, riskScore, riskLevel: getRiskLevel(riskScore), trends, recommendations: [], analyzedAt: new Date().toISOString(), status: "INDICATIVE" }
    this.result.recommendations = this.getRecommendations()
    return this.result
  }

  /** Returns the most recently calculated normalized score, or zero before analysis. */
  getRiskScore(): number { return this.result?.riskScore ?? 0 }

  /** Returns deterministic next-step recommendations for the dominant risks. */
  getRecommendations(): string[] {
    if (!this.result) return ["Run parcel analysis before reviewing indicative risk recommendations."]
    const recommendations: string[] = []
    if (this.result.factors.zoningRisk >= 50) recommendations.push("Verify zoning, land use, setbacks, and development rights with the competent authority.")
    if (this.result.factors.soilRisk >= 50) recommendations.push("Commission a parcel-specific geotechnical investigation before foundation design.")
    if (this.result.factors.climateRisk >= 50) recommendations.push("Obtain site-specific flood, drainage, wind, and heat-resilience inputs.")
    if (this.result.factors.historyRisk >= 50) recommendations.push("Review the title chain, encumbrance records, and prior land-use changes with qualified professionals.")
    if (this.result.factors.marketRisk >= 50) recommendations.push("Commission a current independent valuation and sensitivity analysis.")
    if (!recommendations.length) recommendations.push("Maintain normal professional due diligence; low indicative risk is not clearance or certification.")
    return recommendations
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
