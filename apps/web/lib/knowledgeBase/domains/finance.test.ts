import { describe, expect, it } from "vitest"
import { financeFacts, financeGaps } from "./finance"
import { getKbCoverageManifest } from "../manifest"

describe("W-29 KB finance domain (adapter-first seed, RBI LTV circular)", () => {
  it("every fact carries real, non-empty provenance", () => {
    for (const fact of financeFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
    }
  })

  it("the LTV ratio fact has the real 3-bracket table from RBI's own page", () => {
    const fact = financeFacts.find((f) => f.clauseId === "RBI Master Circular RBI/2013-14/67 - Loan to Value (LTV) Ratio")!
    const data = fact.data as { rows: { loanAmountBracket: string; maxLtvPercent: number }[] }
    expect(data.rows).toHaveLength(3)
    expect(data.rows[0]).toEqual({ loanAmountBracket: "up to Rs 20 lakh", maxLtvPercent: 90 })
    expect(data.rows[2]).toEqual({ loanAmountBracket: "above Rs 75 lakh", maxLtvPercent: 75 })
  })

  it("the 2017 revision is chipped as a gap, not seeded from secondary-source recollection", () => {
    expect(financeGaps.length).toBeGreaterThan(0)
    for (const gap of financeGaps) {
      expect(["GAP-OCR", "GAP-NOT-CODIFIED"]).toContain(gap.reason)
      expect(gap.queuedAction).toBeTruthy()
    }
    expect(financeGaps.some((g) => /2017/.test(g.clauseId))).toBe(true)
  })
})

describe("W-41 KB coverage manifest - finance domain", () => {
  it("is SEEDED from real items but carries a null depth denominator - honest, since the source isn't clause-indexed", () => {
    const manifest = getKbCoverageManifest()
    const entry = manifest.find((m) => m.domain === "finance")!
    expect(entry.itemCount).toBe(financeFacts.length)
    expect(entry.status).toBe("SEEDED")
    expect(entry.depthDenominator).toBeNull()
    expect(entry.depthPercent).toBeNull()
  })
})
