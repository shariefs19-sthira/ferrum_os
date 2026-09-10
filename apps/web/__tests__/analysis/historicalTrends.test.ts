import { describe, expect, it, vi } from "vitest"
import { calculateCAGR, getHistoricalTrends, projectFuture } from "../../lib/analysis/historicalTrends"

describe("historicalTrends", () => {
  it("returns deterministic indicative structure", async () => { vi.setSystemTime(new Date("2026-09-10T00:00:00Z")); const trends = await getHistoricalTrends("P-1", 3); expect(trends).toHaveLength(3); expect(trends[2].year).toBe(2026); expect(trends.every(item => item.category === "INDICATIVE")).toBe(true); vi.useRealTimers() })
  it("calculates known CAGR", () => expect(calculateCAGR([{ year: 2020, value: 100, changePercent: 0, category: "INDICATIVE" }, { year: 2022, value: 121, changePercent: 10, category: "INDICATIVE" }])).toBeCloseTo(0.1))
  it("projects future values", () => { const source = [{ year: 2020, value: 100, changePercent: 0, category: "INDICATIVE" as const }, { year: 2021, value: 110, changePercent: 10, category: "INDICATIVE" as const }]; expect(projectFuture(source, 2)).toEqual([{ year: 2022, value: 121, changePercent: 10, category: "PROJECTED_INDICATIVE" }, { year: 2023, value: 133.1, changePercent: 10, category: "PROJECTED_INDICATIVE" }]) })
  it("handles empty, single-year, and zero-year inputs", async () => { expect(calculateCAGR([])).toBe(0); expect(calculateCAGR([{ year: 2026, value: 100, changePercent: 0, category: "INDICATIVE" }])).toBe(0); expect(projectFuture([], 4)).toEqual([]); expect(projectFuture([{ year: 2026, value: 100, changePercent: 0, category: "INDICATIVE" }], 1)[0].value).toBe(100); expect(await getHistoricalTrends("P-1", 0)).toEqual([]) })
})
