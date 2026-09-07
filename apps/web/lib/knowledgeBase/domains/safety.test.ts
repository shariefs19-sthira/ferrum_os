import { describe, expect, it } from "vitest"
import { safetyFacts } from "./safety"
import { getKbCoverageManifest } from "../manifest"

describe("W-29 KB safety domain (adapter-first seed, NBC 2016 Part 4)", () => {
  it("carries real, non-empty provenance", () => {
    for (const fact of safetyFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
    }
  })

  it("stair tread/riser dimensions match the real extracted values, resolving the earlier open stair-geometry gap", () => {
    const fact = safetyFacts.find((f) => f.clauseId === "NBC 2016 (SP 7) Part 4 Cl 4.4.2.4.3.1")!
    const data = fact.data as {
      minimumStaircasesPerBuilding: number
      treadMinMm: { residential: number; other: number }
      riserMaxMm: { residentialA2: number; other: number }
      maxRisersPerFlight: number
    }
    expect(data.minimumStaircasesPerBuilding).toBe(2)
    expect(data.treadMinMm).toEqual({ residential: 250, other: 300 })
    expect(data.riserMaxMm).toEqual({ residentialA2: 190, other: 150 })
    expect(data.maxRisersPerFlight).toBe(12)
  })
})

describe("W-41 KB coverage manifest - safety domain", () => {
  it("computes real depth % against Part 4's own 6-clause index", () => {
    const manifest = getKbCoverageManifest()
    const safetyEntry = manifest.find((m) => m.domain === "safety")!
    expect(safetyEntry.itemCount).toBe(safetyFacts.length)
    expect(safetyEntry.status).toBe("SEEDED")
    expect(safetyEntry.depthDenominator!.totalClauseCount).toBe(6)
    expect(safetyEntry.depthPercent).toBeCloseTo((safetyFacts.length / 6) * 100, 1)
  })
})
