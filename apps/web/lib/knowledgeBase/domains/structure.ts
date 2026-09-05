import type { ClauseFact, KbGap } from "../types"

// W-29 KNOWLEDGE_BASE - structure domain (RCC/steel/masonry), first
// seed pass. Adapter-first per the standing KB_MAX_DEPTH drain order:
// fetched the actual primary source, extracted these facts directly
// from that text, then cross-checked against this codebase's own
// existing structuralLive.ts (which already cited IS 456 Cl 23.2.1) -
// found it already correct, not fabricated, which this fact's
// provenance now backs with a real source rather than an unsourced
// hardcoded value.
//
// Source: IS 456:2000 "Plain and Reinforced Concrete - Code of
// Practice" (Fourth Revision, Tenth Reprint April 2007, incl.
// Amendments 1 & 2), Bureau of Indian Standards. Hosted on Internet
// Archive (item gov.in.is.456.2000) under CC0 1.0 Universal, published
// per India's Right to Information Act 2005 - "this legal document is
// hereby made available on a noncommercial basis, as it is the right
// of all humans to know and speak the laws that govern them" (the
// item's own stated license text). Fetched and extracted 2026-09-05.
const SOURCE = {
  sourceName: "IS 456:2000 Plain and Reinforced Concrete - Code of Practice (Fourth Revision)",
  sourceUrl: "https://archive.org/details/gov.in.is.456.2000",
  license: "CC0 1.0 Universal (India RTI Act 2005 public-domain publication)",
  fetchedAt: "2026-09-05",
  status: "VERIFIED-SAMPLE" as const,
}

export const structureFacts: ClauseFact[] = [
  {
    clauseId: "IS 456:2000 Cl 23.2.1",
    version: "Fourth Revision, Tenth Reprint, April 2007 (incl. Amendments 1 & 2)",
    domain: "structure",
    summary:
      "Basic span-to-effective-depth ratios for deflection control (spans up to 10 m, before modification factors for tension/compression reinforcement per Fig. 4/5).",
    data: {
      basicSpanToDepthRatio: { cantilever: 7, simplySupported: 20, continuous: 26 },
      spanRangeM: { max: 10 },
      note: "For spans above 10 m, multiply by 10/span in metres, except cantilever (deflection calculation required instead).",
    },
    provenance: SOURCE,
  },
  {
    clauseId: "IS 456:2000 Cl 26.4.2 (Table 16)",
    version: "Fourth Revision, Tenth Reprint, April 2007 (incl. Amendments 1 & 2)",
    domain: "structure",
    summary: "Nominal concrete cover to reinforcement to meet durability requirements, by exposure condition.",
    data: {
      nominalCoverMmByExposure: { mild: 20, moderate: 30, severe: 45, verySevere: 50, extreme: 75 },
      notes: [
        "Main reinforcement up to 12mm diameter bar, mild exposure: cover may be reduced by 5mm.",
        "Actual concrete cover should not deviate from the required nominal cover by more than +10mm unless specified otherwise.",
        "Severe/very severe exposure: 5mm reduction allowed where concrete grade is M35 and above.",
      ],
    },
    provenance: SOURCE,
  },
  {
    clauseId: "IS 456:2000 Cl 31.2.1",
    version: "Fourth Revision, Tenth Reprint, April 2007 (incl. Amendments 1 & 2)",
    domain: "structure",
    summary: "Minimum thickness of a flat slab (thickness otherwise governed by the Cl 23.2 span/effective-depth ratios).",
    data: {
      minimumThicknessMm: 125,
      note:
        "Governed primarily by Cl 23.2's span/effective-depth ratios (applied directly for slabs with drops per 31.2.2, or multiplied by 0.9 otherwise, using the longer span) - this 125mm figure is an absolute floor, not the typical design value.",
      ocrCorrectionNote:
        "Source OCR rendered this as '12S mm' (scanning artifact, S/5 glyph confusion) - corrected to 125mm based on unambiguous sentence context ('The minimum thickness of slab shall be ___ mm'), not reconstructed from memory. Flagged here per the standing rule that any such correction must be stated, not silently applied.",
    },
    provenance: SOURCE,
  },
]

// Targeted from IS 456:2000's own clause index but not safely
// extractable this pass - the source PDF's OCR scrambled these
// specific tables/formulas into fragments where column/row mapping
// would be a guess, not an extraction. Chipped GAP-OCR per the
// standing rule: never reconstructed from memory, never holding the
// domain - queued for a second public copy or an operator-supplied
// clean PDF.
export const structureGaps: KbGap[] = [
  {
    clauseId: "IS 456:2000 Cl 26.5.1.1",
    domain: "structure",
    reason: "GAP-OCR",
    queuedAction:
      "Minimum/maximum tension reinforcement in beams - source OCR collapsed the formula (As,min expression) into unreadable fragments. Queue: re-fetch from a second public mirror (e.g. a different Internet Archive scan, or a state PWD technical-manual reproduction) or accept an operator-supplied clean PDF/text extract.",
  },
  {
    clauseId: "IS 456:2000 Table 5",
    domain: "structure",
    reason: "GAP-OCR",
    queuedAction:
      "Minimum cement content / max water-cement ratio / minimum grade of concrete by exposure - source OCR scrambled the table's row/column structure (values and exposure labels no longer line up unambiguously, unlike Table 16 which did). Queue: same as Cl 26.5.1.1 - a second copy or operator-supplied clean extract, not a memory reconstruction.",
  },
]
