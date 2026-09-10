import { describe, expect, it } from "vitest"
import { calculateRiskScore, getRiskLevel } from "../../lib/analysis/riskCalculator"
import { calculateCAGR } from "../../lib/analysis/historicalTrends"
import { ParcelAnalyzer } from "../../lib/analysis/parcelAnalyzer"

describe("riskCalculator", () => {
  it("returns exact weighted values", () => expect(calculateRiskScore({ zoning: 100, soil: 80, climate: 60, history: 40, market: 20 })).toBe(70))
  it.each([[0, "low"], [25, "low"], [25.01, "medium"], [50, "medium"], [50.01, "high"], [75, "high"], [75.01, "critical"], [100, "critical"]] as const)("maps %s to %s", (score, level) => expect(getRiskLevel(score)).toBe(level))
  it("clamps boundary inputs", () => expect(calculateRiskScore({ zoning: -50, soil: 200, climate: 50, history: Number.NaN, market: 100 })).toBe(45))
  it.each([0, 50, 100])("preserves uniform boundary %s", value => expect(calculateRiskScore({ zoning: value, soil: value, climate: value, history: value, market: value })).toBe(value))
  it("calculates ten-year CAGR from 100 to 200", () => expect(calculateCAGR([{ year: 2016, value: 100, changePercent: 0 }, { year: 2026, value: 200, changePercent: 0 }])).toBeCloseTo(0.071773, 5))
  it("delegates ParcelAnalyzer scoring to the weighted calculator", () => expect(new ParcelAnalyzer("P-1").getRiskScore({ zoning: 100, soil: 100, climate: 100, history: 100, market: 100 })).toBe(100))
  it.each([[10, "normal professional"], [40, "targeted due diligence"], [60, "dominant risks"], [90, "Pause the decision"]] as const)("returns recommendations for score %s", (score, phrase) => expect(new ParcelAnalyzer("P-1").getRecommendations(score)[0]).toContain(phrase))
})
