import { beforeEach, describe, expect, it, vi } from "vitest"
import { ParcelAnalyzer } from "../../lib/analysis/parcelAnalyzer"
import * as historical from "../../lib/analysis/historicalTrends"
import { compareParcels, findBestParcel, getInsights } from "../../lib/analysis/comparativeAnalysis"
import { analyzeParcel, clearParcelAnalysisCache, isParcelAnalysisLoading, type ParcelContext } from "../../lib/workspace/parcelContext"

vi.mock("../../lib/analysis/historicalTrends", async importOriginal => ({ ...(await importOriginal<typeof historical>()), getHistoricalTrends: vi.fn(async () => [{ year: 2026, value: 100, changePercent: 0, category: "INDICATIVE" }]) }))

describe("ParcelAnalyzer", () => {
  beforeEach(() => { vi.clearAllMocks() })
  it("instantiates and has a safe pre-analysis state", () => { const analyzer = new ParcelAnalyzer("P-1"); expect(analyzer).toBeInstanceOf(ParcelAnalyzer); expect(analyzer.getRiskScore()).toBe(0); expect(analyzer.getRecommendations()).toHaveLength(1) })
  it("rejects an empty parcel identifier", () => expect(() => new ParcelAnalyzer(" ")).toThrow("parcelId is required"))
  it("returns a complete result", async () => { const result = await new ParcelAnalyzer("P-1").analyze(); expect(result).toMatchObject({ parcelId: "P-1", status: "INDICATIVE" }); expect(result.trends).toHaveLength(1); expect(Object.keys(result.factors)).toHaveLength(5); expect(result.recommendations.length).toBeGreaterThan(0) })
  it("returns a normalized risk score", async () => { const analyzer = new ParcelAnalyzer("P-2"); await analyzer.analyze(); expect(analyzer.getRiskScore()).toBeGreaterThanOrEqual(0); expect(analyzer.getRiskScore()).toBeLessThanOrEqual(100) })
  it("is deterministic apart from timestamps", async () => { const first = await new ParcelAnalyzer("P-3").analyze(); const second = await new ParcelAnalyzer("P-3").analyze(); expect(first.factors).toEqual(second.factors); expect(first.riskScore).toBe(second.riskScore) })
})

describe("comparative parcel analysis", () => {
  it("compares unique parcels and ranks them", async () => { const result = await compareParcels(["P-1", "P-2", "P-1"]); expect(result.rankings).toHaveLength(2); expect(result.metrics).toHaveLength(4); expect(findBestParcel(result)).toBe(result.rankings[0].parcelId); expect(result.insights).toHaveLength(2) })
  it("handles an empty comparison", async () => { const result = await compareParcels([]); expect(findBestParcel(result)).toBe(""); expect(getInsights(result)).toEqual(["No parcels were supplied for comparison."]) })
})

describe("parcel-context analysis integration", () => {
  const context: ParcelContext = { version: 1, method: "test", ulpin: "ULPIN-1", state: "Karnataka", district: "Bengaluru", area_sqm: 600, land_use: "Residential", coordinates: null, provenance: { source: "Test fixture", vintage: "2026", status: "INDICATIVE" } }
  beforeEach(() => clearParcelAnalysisCache())
  it("caches results for the active TTL and balances loading state", async () => { const loading: boolean[] = []; const first = await analyzeParcel(context, value => loading.push(value)); const second = await analyzeParcel(context, value => loading.push(value)); expect(first).toBe(second); expect(loading).toEqual([true, false]); expect(isParcelAnalysisLoading(context)).toBe(false) })
})
