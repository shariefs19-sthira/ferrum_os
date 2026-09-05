import type { ClauseFact } from "../types"

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
]
