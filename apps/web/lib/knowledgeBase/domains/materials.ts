import type { ClauseFact, KbGap } from "../types"

// W-29 KNOWLEDGE_BASE - materials domain, first seed pass, adapter-first
// per the standing KB_MAX_DEPTH drain order.
//
// Source: IS 383:2016 "Coarse and Fine Aggregate for Concrete -
// Specification" (Third Revision), Bureau of Indian Standards. Hosted
// on Internet Archive (item gov.in.is.383.2016), same public-domain
// BIS framing as this KB's other IS-source items. Fetched and
// extracted 2026-09-08.
const SOURCE = {
  sourceName: "IS 383:2016 Coarse and Fine Aggregate for Concrete - Specification (Third Revision)",
  sourceUrl: "https://archive.org/details/gov.in.is.383.2016",
  license: "Public-domain publication (BIS legal-document notice, same framing as this KB's other IS-source items)",
  fetchedAt: "2026-09-08",
  status: "VERIFIED-SAMPLE" as const,
}

export const materialsFacts: ClauseFact[] = [
  {
    clauseId: "IS 383:2016 Cl 6.3 (Table 9)",
    version: "Third Revision",
    domain: "materials",
    summary: "Fine aggregate (sand) grading zones I-IV: percentage passing by IS sieve size, the standard classification used to specify concrete sand quality.",
    data: {
      rows: [
        { sieve: "10 mm", zoneI: "100", zoneII: "100", zoneIII: "100", zoneIV: "100" },
        { sieve: "4.75 mm", zoneI: "90-100", zoneII: "90-100", zoneIII: "90-100", zoneIV: "95-100" },
        { sieve: "2.36 mm", zoneI: "60-95", zoneII: "75-100", zoneIII: "85-100", zoneIV: "95-100" },
        { sieve: "1.18 mm", zoneI: "30-70", zoneII: "55-90", zoneIII: "75-100", zoneIV: "90-100" },
        { sieve: "600 micron", zoneI: "15-34", zoneII: "35-59", zoneIII: "60-79", zoneIV: "80-100" },
        { sieve: "300 micron", zoneI: "5-20", zoneII: "8-30", zoneIII: "12-40", zoneIV: "15-50" },
        { sieve: "150 micron", zoneI: "0-10", zoneII: "0-10", zoneIII: "0-10", zoneIV: "0-15" },
      ],
      notes: [
        "For crushed stone sands, the permissible limit on the 150 micron sieve is increased to 20 percent.",
        "Fine aggregate complying with any grading zone in this table is suitable for concrete; the quality of concrete produced depends on other factors including mix proportions.",
        "As fine aggregate grading becomes progressively finer (Zone I to IV), the fine-to-coarse aggregate ratio should be progressively reduced.",
      ],
      ocrCorrectionNote:
        "Zone II's 600-micron row source-OCR'd as '35.59' (period instead of hyphen) - corrected to '35-59' based on unambiguous context (every other cell in this table is a hyphenated range, and 35-59 is the only value consistent with the monotonic zone progression between Zone I's 15-34 and Zone III's 60-79). Flagged here per the standing rule that any such correction must be stated, not silently applied.",
    },
    provenance: SOURCE,
  },
]

export const materialsGaps: KbGap[] = [
  {
    clauseId: "IS 383:2016 Table 2 (Limits of Deleterious Materials)",
    domain: "materials",
    reason: "GAP-OCR",
    queuedAction:
      "A real, targeted table (coal/lignite, clay lumps, and other deleterious-substance percentage-by-mass limits, separately by fine/coarse and uncrushed/crushed/manufactured aggregate - 6 data columns) - source OCR scrambled numeric values (e.g. '1.00' rendered inconsistently as 'LOO' in several cells) badly enough that column/row mapping would be a guess, not an extraction. Queue: a cleaner PDF extraction pass or a second public copy.",
  },
  {
    clauseId: "IS 383:2016 Table 7 (Coarse Aggregates, single-sized/graded nominal sizes)",
    domain: "materials",
    reason: "GAP-OCR",
    queuedAction:
      "The coarse-aggregate equivalent of Table 9 (percentage passing by sieve size, across multiple nominal sizes - 80mm/63mm/40mm/20mm/16mm/12.5mm/10mm etc.) - a real, larger, more complex multi-column table than Table 9's 4-zone layout; not attempted for extraction this pass given the added column complexity, not skipped for lack of a real target. Queue: a dedicated extraction pass, ideally cross-checked against a second copy given the table's size.",
  },
]
