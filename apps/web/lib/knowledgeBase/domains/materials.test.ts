import { describe, expect, it } from "vitest"
import { materialsFacts, materialsGaps } from "./materials"
import { getKbCoverageManifest } from "../manifest"

describe("W-29 KB materials domain (adapter-first seed, IS 383:2016)", () => {
  it("every fact carries real, non-empty provenance", () => {
    for (const fact of materialsFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
    }
  })

  it("the fine-aggregate grading-zone table (Table 9) has 7 real rows and discloses its one OCR correction explicitly", () => {
    const fact = materialsFacts.find((f) => f.clauseId === "IS 383:2016 Cl 6.3 (Table 9)")!
    const data = fact.data as { rows: { sieve: string; zoneII: string }[]; ocrCorrectionNote: string }
    expect(data.rows).toHaveLength(7)
    expect(data.rows[0]).toMatchObject({ sieve: "10 mm", zoneII: "100" })
    const row600micron = data.rows.find((r) => r.sieve === "600 micron")!
    expect(row600micron.zoneII).toBe("35-59")
    expect(data.ocrCorrectionNote).toMatch(/35\.59/)
  })

  it("gaps are chipped with a real reason and queued, not reconstructed from memory", () => {
    expect(materialsGaps.length).toBeGreaterThan(0)
    for (const gap of materialsGaps) {
      expect(["GAP-OCR", "GAP-NOT-CODIFIED"]).toContain(gap.reason)
      expect(gap.queuedAction).toBeTruthy()
    }
  })
})

describe("W-41 KB coverage manifest - materials domain", () => {
  it("computes real depth % against IS 383:2016's own 10-clause index", () => {
    const manifest = getKbCoverageManifest()
    const entry = manifest.find((m) => m.domain === "materials")!
    expect(entry.itemCount).toBe(materialsFacts.length)
    expect(entry.status).toBe("SEEDED")
    expect(entry.depthDenominator!.totalClauseCount).toBe(10)
    expect(entry.depthPercent).toBeCloseTo((materialsFacts.length / 10) * 100, 1)
  })
})
