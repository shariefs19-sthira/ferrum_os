import { describe, expect, it } from "vitest"
import { planningFacts } from "./planning"
import { getKbCoverageManifest } from "../manifest"

describe("W-29 KB planning domain (adapter-first seed, NBC 2016/SP 7)", () => {
  it("every fact carries real, non-empty provenance", () => {
    for (const fact of planningFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
    }
  })

  it("the FAR/coverage table (Cl 9.6.2, Table 6) has 10 real rows in ascending density order", () => {
    const fact = planningFacts.find((f) => f.clauseId === "NBC 2016 (SP 7) Part 3 Cl 9.6.2 (Table 6)")!
    const data = fact.data as { rows: { densityDwellingUnitsPerHectare: number; far: number }[] }
    expect(data.rows).toHaveLength(10)
    expect(data.rows[0]).toEqual({ densityDwellingUnitsPerHectare: 25, maxCoveragePercent: 25, far: 0.5 })
    expect(data.rows[9]).toEqual({ densityDwellingUnitsPerHectare: 250, maxCoveragePercent: 35, far: 2.5 })
    for (let i = 1; i < data.rows.length; i += 1) {
      expect(data.rows[i].densityDwellingUnitsPerHectare).toBeGreaterThan(data.rows[i - 1].densityDwellingUnitsPerHectare)
    }
  })

  it("habitable room minima (Cl 12.2.2) match the real extracted values, not rounded/assumed ones", () => {
    const fact = planningFacts.find((f) => f.clauseId === "NBC 2016 (SP 7) Part 3 Cl 12.2.2")!
    const data = fact.data as { singleRoom: { minAreaSqm: number; minWidthM: number } }
    expect(data.singleRoom.minAreaSqm).toBe(9.5)
    expect(data.singleRoom.minWidthM).toBe(2.4)
  })
})

describe("W-41 KB coverage manifest - planning domain", () => {
  it("computes real depth % against Part 3's own 29-clause index", () => {
    const manifest = getKbCoverageManifest()
    const planningEntry = manifest.find((m) => m.domain === "planning")!
    expect(planningEntry.itemCount).toBe(planningFacts.length)
    expect(planningEntry.status).toBe("SEEDED")
    expect(planningEntry.depthDenominator!.totalClauseCount).toBe(29)
    expect(planningEntry.depthPercent).toBeCloseTo((planningFacts.length / 29) * 100, 1)
  })
})
