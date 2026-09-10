import { describe, expect, it } from "vitest"
import { calculateRiskScore, getRiskLevel } from "../../lib/analysis/riskCalculator"

describe("riskCalculator", () => {
  it("returns exact weighted values", () => expect(calculateRiskScore({ zoningRisk: 100, soilRisk: 80, climateRisk: 60, historyRisk: 40, marketRisk: 20 })).toBe(70))
  it.each([[0, "low"], [24.99, "low"], [25, "medium"], [49.99, "medium"], [50, "high"], [74.99, "high"], [75, "critical"], [100, "critical"]] as const)("maps %s to %s", (score, level) => expect(getRiskLevel(score)).toBe(level))
  it("clamps boundary inputs", () => expect(calculateRiskScore({ zoningRisk: -50, soilRisk: 200, climateRisk: 50, historyRisk: Number.NaN, marketRisk: 100 })).toBe(45))
  it.each([0, 50, 100])("preserves uniform boundary %s", value => expect(calculateRiskScore({ zoningRisk: value, soilRisk: value, climateRisk: value, historyRisk: value, marketRisk: value })).toBe(value))
})
