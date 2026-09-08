import { describe, expect, it } from "vitest"
import { soilFoundationFacts, soilFoundationGaps } from "./soilFoundation"
import { getKbCoverageManifest } from "../manifest"

describe("W-29 KB soil-foundation domain (adapter-first seed, IS 1904:2021)", () => {
  it("every fact carries real, non-empty provenance", () => {
    for (const fact of soilFoundationFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
    }
  })

  it("the minimum-depth fact (Cl 7.2) has the real 500mm floor", () => {
    const fact = soilFoundationFacts.find((f) => f.clauseId === "IS 1904:2021 Cl 7.2")!
    const data = fact.data as { minimumDepthMm: number }
    expect(data.minimumDepthMm).toBe(500)
  })

  it("the stepped-footing fact (Cl 8.1) has the real slope/angle limits by soil type", () => {
    const fact = soilFoundationFacts.find((f) => f.clauseId === "IS 1904:2021 Cl 8.1")!
    const data = fact.data as {
      slopingGroundAdjacentToFooting: { frustumAngleFromHorizontalDeg: number; minHorizontalDistanceToSlopeMm: { rock: number; soil: number } }
      adjacentFootingsGranularSoil: { maxSlope: string }
    }
    expect(data.slopingGroundAdjacentToFooting.frustumAngleFromHorizontalDeg).toBe(30)
    expect(data.slopingGroundAdjacentToFooting.minHorizontalDistanceToSlopeMm).toEqual({ rock: 600, soil: 900 })
    expect(data.adjacentFootingsGranularSoil.maxSlope).toBe("1 vertical : 2 horizontal")
  })

  it("the bearing-capacity cross-reference fact (Cl 18) honestly routes to IS 6403 rather than fabricating a value", () => {
    const fact = soilFoundationFacts.find((f) => f.clauseId === "IS 1904:2021 Cl 18")!
    const data = fact.data as { shallowFoundationSbcMethod: string }
    expect(data.shallowFoundationSbcMethod).toBe("IS 6403")
  })

  it("the commonly-cited presumptive-SBC-by-soil-type table is chipped as a real gap, not seeded from secondary-source memory", () => {
    expect(soilFoundationGaps.length).toBeGreaterThan(0)
    for (const gap of soilFoundationGaps) {
      expect(["GAP-OCR", "GAP-NOT-CODIFIED"]).toContain(gap.reason)
      expect(gap.queuedAction).toBeTruthy()
    }
    expect(soilFoundationGaps.some((g) => g.reason === "GAP-NOT-CODIFIED" && /presumptive/i.test(g.clauseId))).toBe(true)
  })
})

describe("W-41 KB coverage manifest - soil-foundation domain", () => {
  it("computes real depth % against IS 1904:2021's own 20-clause index", () => {
    const manifest = getKbCoverageManifest()
    const entry = manifest.find((m) => m.domain === "soil-foundation")!
    expect(entry.itemCount).toBe(soilFoundationFacts.length)
    expect(entry.status).toBe("SEEDED")
    expect(entry.depthDenominator!.totalClauseCount).toBe(20)
    expect(entry.depthPercent).toBeCloseTo((soilFoundationFacts.length / 20) * 100, 1)
  })
})
