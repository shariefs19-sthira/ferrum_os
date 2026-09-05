import { describe, expect, it } from "vitest"
import { structureFacts } from "./structure"
import { getKbCoverageManifest } from "../manifest"
import { SPAN_DEPTH_BASIC_RATIO } from "../../studio/structuralLive"

describe("W-29 KB structure domain (adapter-first seed)", () => {
  it("every fact carries real, non-empty provenance - never an unsourced value", () => {
    for (const fact of structureFacts) {
      expect(fact.provenance.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.provenance.status).toBe("VERIFIED-SAMPLE")
      expect(fact.provenance.license).toBeTruthy()
    }
  })

  it("the span/depth clause fact matches structuralLive.ts's engine constant exactly - not two silently drifting copies", () => {
    const fact = structureFacts.find((f) => f.clauseId === "IS 456:2000 Cl 23.2.1")!
    const data = fact.data as { basicSpanToDepthRatio: { simplySupported: number; continuous: number; cantilever: number } }
    expect(data.basicSpanToDepthRatio.simplySupported).toBe(SPAN_DEPTH_BASIC_RATIO.simple)
    expect(data.basicSpanToDepthRatio.continuous).toBe(SPAN_DEPTH_BASIC_RATIO.continuous)
  })

  it("the nominal-cover clause fact has one cover value per named exposure, in the real extracted order", () => {
    const fact = structureFacts.find((f) => f.clauseId === "IS 456:2000 Cl 26.4.2 (Table 16)")!
    const data = fact.data as { nominalCoverMmByExposure: Record<string, number> }
    expect(data.nominalCoverMmByExposure).toEqual({ mild: 20, moderate: 30, severe: 45, verySevere: 50, extreme: 75 })
  })
})

describe("W-41 KB coverage manifest", () => {
  it("computes seeded/roadmap split from the actual arrays, not a hand-typed count", () => {
    const manifest = getKbCoverageManifest()
    const structureEntry = manifest.find((m) => m.domain === "structure")!
    expect(structureEntry.itemCount).toBe(structureFacts.length)
    expect(structureEntry.status).toBe("SEEDED")

    const roadmapEntries = manifest.filter((m) => m.domain !== "structure")
    expect(roadmapEntries.every((m) => m.status === "ROADMAP" && m.itemCount === 0)).toBe(true)
  })
})
