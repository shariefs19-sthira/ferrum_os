import { describe, expect, it } from "vitest"
import { sustainabilityFacts, sustainabilityGaps } from "./sustainability"
import { getKbCoverageManifest } from "../manifest"

describe("W-29 KB sustainability domain (adapter-first seed, Eco-Niwas Samhita 2021 Part II)", () => {
  it("every fact carries real, non-empty provenance and discloses the all-rights-reserved license honestly", () => {
    for (const fact of sustainabilityFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
      expect(fact.provenance.license).toMatch(/all rights reserved/i)
    }
  })

  it("the solar water heating fact (Cl 6.7.1, Table 22) has the real minimum threshold and tiers", () => {
    const fact = sustainabilityFacts.find((f) => f.clauseId === "Eco-Niwas Samhita 2021 Cl 6.7.1 (Table 22)")!
    const data = fact.data as { maxPoints: number; minimumToOptIn: { pointsAwarded: number }; additionalTiers: { additionalPoints: number }[] }
    expect(data.maxPoints).toBe(10)
    expect(data.minimumToOptIn.pointsAwarded).toBe(5)
    expect(data.additionalTiers).toHaveLength(2)
  })

  it("the solar PV fact (Cl 6.7.2, Table 23) has the real REGZ minimum threshold", () => {
    const fact = sustainabilityFacts.find((f) => f.clauseId === "Eco-Niwas Samhita 2021 Cl 6.7.2 (Table 23)")!
    const data = fact.data as { minimumToOptIn: { pointsAwarded: number; requirement: string } }
    expect(data.minimumToOptIn.pointsAwarded).toBe(5)
    expect(data.minimumToOptIn.requirement).toMatch(/2 kWh\/m2\.year|20% of roof area/)
  })

  it("gaps are chipped with a real reason and queued, not silently dropped", () => {
    expect(sustainabilityGaps.length).toBeGreaterThan(0)
    for (const gap of sustainabilityGaps) {
      expect(["GAP-OCR", "GAP-NOT-CODIFIED"]).toContain(gap.reason)
      expect(gap.queuedAction).toBeTruthy()
    }
  })
})

describe("W-41 KB coverage manifest - sustainability domain", () => {
  it("computes real depth % against ENS 2021 Part II's own 12-entry index (7 chapters + 5 annexes)", () => {
    const manifest = getKbCoverageManifest()
    const entry = manifest.find((m) => m.domain === "sustainability")!
    expect(entry.itemCount).toBe(sustainabilityFacts.length)
    expect(entry.status).toBe("SEEDED")
    expect(entry.depthDenominator!.totalClauseCount).toBe(12)
    expect(entry.depthPercent).toBeCloseTo((sustainabilityFacts.length / 12) * 100, 1)
  })
})
