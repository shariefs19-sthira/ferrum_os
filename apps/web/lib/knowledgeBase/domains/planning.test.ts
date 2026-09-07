import { describe, expect, it } from "vitest"
import { planningFacts, planningGaps } from "./planning"
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

  it("the MBBL plot-class matrix (Table 3.3) has 8 real rows and discloses the unresolved FAR-unit ambiguity, not a silent guess", () => {
    const fact = planningFacts.find((f) => f.clauseId === "MBBL 2016 Table 3.3")!
    expect(fact.provenance.sourceUrl).toMatch(/niua\.org/)
    const data = fact.data as { rows: { farAsTabulated: number; maxDwellingUnits: number }[]; note: string }
    expect(data.rows).toHaveLength(8)
    expect(data.rows[0].farAsTabulated).toBe(150)
    expect(data.rows[0].maxDwellingUnits).toBe(1)
    expect(data.note).toMatch(/not silently divided by 100/)
  })

  it("the front open space table (Cl 8.2.1.1) has 4 real rows keyed to street width", () => {
    const fact = planningFacts.find((f) => f.clauseId === "NBC 2016 (SP 7) Part 3 Cl 8.2.1.1")!
    const data = fact.data as { rows: { streetWidthM: string; frontOpenSpaceMinM: number }[] }
    expect(data.rows).toHaveLength(4)
    expect(data.rows[0]).toMatchObject({ streetWidthM: "up to 7.5", frontOpenSpaceMinM: 1.5 })
    expect(data.rows[3]).toMatchObject({ streetWidthM: "above 30", frontOpenSpaceMinM: 6.0 })
  })

  it("the side/rear open space table (Table 4, Cl 8.2.3.1) has 15 real rows in ascending height order", () => {
    const fact = planningFacts.find((f) => f.clauseId === "NBC 2016 (SP 7) Part 3 Cl 8.2.3.1 (Table 4)")!
    const data = fact.data as { rows: { heightM: number | string; sideRearOpenSpaceM: number }[] }
    expect(data.rows).toHaveLength(15)
    expect(data.rows[0]).toEqual({ heightM: 10, sideRearOpenSpaceM: 3 })
    expect(data.rows[14]).toEqual({ heightM: "above 120", sideRearOpenSpaceM: 20 })
  })

  it("the UDCPR 2020 marginal-distance table (Table No.6-D) has 5 real rows and its own real government provenance", () => {
    const fact = planningFacts.find((f) => f.clauseId === "UDCPR 2020 (Maharashtra) Regulation 6.2.1 (Table No.6-D)")!
    expect(fact.provenance.sourceUrl).toMatch(/maharashtra\.gov\.in/)
    const data = fact.data as { rows: { minPlotSizeSqm: number }[] }
    expect(data.rows).toHaveLength(5)
    expect(data.rows[0].minPlotSizeSqm).toBe(450)
  })

  it("gaps are chipped with a real reason and queued, not silently dropped", () => {
    expect(planningGaps.length).toBeGreaterThan(0)
    for (const gap of planningGaps) {
      expect(["GAP-OCR", "GAP-NOT-CODIFIED"]).toContain(gap.reason)
      expect(gap.queuedAction).toBeTruthy()
    }
  })
})

describe("W-41 KB coverage manifest - planning domain", () => {
  it("computes real depth % against the combined NBC Part 3 + UDCPR 2020 clause/chapter index (29 + 15 = 44)", () => {
    const manifest = getKbCoverageManifest()
    const planningEntry = manifest.find((m) => m.domain === "planning")!
    expect(planningEntry.itemCount).toBe(planningFacts.length)
    expect(planningEntry.status).toBe("SEEDED")
    expect(planningEntry.depthDenominator!.totalClauseCount).toBe(44)
    expect(planningEntry.depthPercent).toBeCloseTo((planningFacts.length / 44) * 100, 1)
  })
})
