import { describe, expect, it } from "vitest"
import { approvalsNocsFacts, approvalsNocsGaps } from "./approvalsNocs"
import { getKbCoverageManifest } from "../manifest"

describe("W-29 KB approvals-nocs domain (adapter-first seed, AMASR Act)", () => {
  it("every fact carries real, non-empty provenance", () => {
    for (const fact of approvalsNocsFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
    }
  })

  it("the prohibited-area fact (Sec 20A) has the real 100m radius", () => {
    const fact = approvalsNocsFacts.find((f) => f.clauseId === "AMASR (Amendment and Validation) Act 2010, Sec 20A")!
    const data = fact.data as { prohibitedAreaRadiusM: number }
    expect(data.prohibitedAreaRadiusM).toBe(100)
  })

  it("the regulated-area fact (Sec 20B) has the real 200m radius, measured beyond the prohibited area", () => {
    const fact = approvalsNocsFacts.find((f) => f.clauseId === "AMASR (Amendment and Validation) Act 2010, Sec 20B")!
    const data = fact.data as { regulatedAreaRadiusM: number }
    expect(data.regulatedAreaRadiusM).toBe(200)
  })

  it("gaps are chipped with a real reason and queued, not silently dropped", () => {
    expect(approvalsNocsGaps.length).toBeGreaterThan(0)
    for (const gap of approvalsNocsGaps) {
      expect(["GAP-OCR", "GAP-NOT-CODIFIED"]).toContain(gap.reason)
      expect(gap.queuedAction).toBeTruthy()
    }
  })
})

describe("W-41 KB coverage manifest - approvals-nocs domain", () => {
  it("computes real depth % against the AMASR Amendment Act's own 13-section index", () => {
    const manifest = getKbCoverageManifest()
    const entry = manifest.find((m) => m.domain === "approvals-nocs")!
    expect(entry.itemCount).toBe(approvalsNocsFacts.length)
    expect(entry.status).toBe("SEEDED")
    expect(entry.depthDenominator!.totalClauseCount).toBe(13)
    expect(entry.depthPercent).toBeCloseTo((approvalsNocsFacts.length / 13) * 100, 1)
  })
})
