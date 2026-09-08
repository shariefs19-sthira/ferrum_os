import { describe, expect, it } from "vitest"
import { vaastuFacts, vaastuGaps } from "./vaastu"
import { getKbCoverageManifest } from "../manifest"

describe("W-29 KB vaastu domain (adapter-first seed, traditional practice - never a code requirement)", () => {
  it("every fact carries real, non-empty provenance", () => {
    for (const fact of vaastuFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(["VERIFIED-SAMPLE", "INDICATIVE"]).toContain(fact.provenance.status)
    }
  })

  it("the mandala-framework fact is VERIFIED-SAMPLE, cited from a real academic paper", () => {
    const fact = vaastuFacts.find((f) => f.clauseId === "Vastu Purusha Mandala - grid structure and cardinal-direction framework")!
    expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
    expect(fact.provenance.sourceName).toMatch(/Singh.*Sharma/)
    const data = fact.data as { gridSubdivisions: string[] }
    expect(data.gridSubdivisions).toEqual(["8x8 (64 squares)", "9x9 (81 squares)"])
  })

  it("the residential room-placement fact is honestly labeled INDICATIVE, never presented as a regulatory requirement", () => {
    const fact = vaastuFacts.find((f) => f.clauseId === "Common residential room-placement conventions (traditional practice)")!
    expect(fact.provenance.status).toBe("INDICATIVE")
    const data = fact.data as { rows: { room: string; direction: string }[]; note: string }
    expect(data.rows.find((r) => r.room === "Kitchen")?.direction).toBe("Southeast (Agni disha)")
    expect(data.rows.find((r) => r.room === "Master bedroom")?.direction).toBe("Southwest (Nyruthi/Yama disha)")
    expect(data.note).toMatch(/never merge/i)
  })

  it("gaps are chipped with a real reason and queued, not silently dropped", () => {
    expect(vaastuGaps.length).toBeGreaterThan(0)
    for (const gap of vaastuGaps) {
      expect(["GAP-OCR", "GAP-NOT-CODIFIED"]).toContain(gap.reason)
      expect(gap.queuedAction).toBeTruthy()
    }
  })
})

describe("W-41 KB coverage manifest - vaastu domain", () => {
  it("is SEEDED from real items but carries a null depth denominator - honest, since neither source is clause-indexed", () => {
    const manifest = getKbCoverageManifest()
    const entry = manifest.find((m) => m.domain === "vaastu")!
    expect(entry.itemCount).toBe(vaastuFacts.length)
    expect(entry.status).toBe("SEEDED")
    expect(entry.depthDenominator).toBeNull()
    expect(entry.depthPercent).toBeNull()
  })
})
