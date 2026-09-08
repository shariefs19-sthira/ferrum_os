import type { ClauseFact, KbGap } from "../types"

// W-29 KNOWLEDGE_BASE - soil-foundation domain, first seed pass.
// Priority #2 on docs/ARCHITECT_PREDESIGN_FACTS.md's own "Proposed new
// KB rows" list ("IS 1904 presumptive SBC table by soil type - directly
// extends the existing structural-check engine"). The classic
// numeric presumptive-bearing-capacity-by-soil-type table that
// engineering references commonly attribute to IS 1904 was searched
// for directly in this session's fetched IS 1904:2021 text and NOT
// found there (its own Table 1 is a permissible-SETTLEMENT table, not
// a bearing-capacity-by-soil-type one) - chipped as a gap below rather
// than assumed present or reconstructed from memory of what other
// sources commonly cite. What IS seeded here are three real, cleanly
// extracted, non-tabular clauses from the same fetched source.
//
// Source: IS 1904:2021 "General Requirements for Design and
// Construction of Foundations in Soils - Code of Practice" (Third
// Revision, Draft), Bureau of Indian Standards. Hosted on Internet
// Archive (item gov.in.is.1904.2021), same public-domain framing as
// this KB's other BIS sources (IS 456, already seeded): "this legal
// document is hereby made available on a noncommercial basis, as it
// is the right of all humans to know and speak the laws that govern
// them." Fetched and extracted 2026-09-08.
const SOURCE = {
  sourceName: "IS 1904:2021 General Requirements for Design and Construction of Foundations in Soils - Code of Practice (Third Revision)",
  sourceUrl: "https://archive.org/details/gov.in.is.1904.2021",
  license: "Public-domain publication (BIS legal-document notice, same framing as this KB's other IS-source items)",
  fetchedAt: "2026-09-08",
  status: "VERIFIED-SAMPLE" as const,
}

export const soilFoundationFacts: ClauseFact[] = [
  {
    clauseId: "IS 1904:2021 Cl 7.2",
    version: "Third Revision (Draft)",
    domain: "soil-foundation",
    summary: "Absolute minimum foundation depth below natural ground level, regardless of soil type.",
    data: {
      minimumDepthMm: 500,
      note: "On rock or similarly weather-resisting ground, only removal of top soil (cleaned/stepped as needed) may be required instead of this depth. This is a floor, not a design depth - Cl 7.1 separately lists the factors (bearing capacity, clay shrink/swell zone, frost penetration in fine sand/silt, scour depth) that typically push the actual required depth well below this minimum.",
    },
    provenance: SOURCE,
  },
  {
    clauseId: "IS 1904:2021 Cl 8.1",
    version: "Third Revision (Draft)",
    domain: "soil-foundation",
    summary: "Maximum permitted step/slope between adjacent footings at different levels, by soil type - governs stepped-foundation layouts on sloping sites or beside existing structures.",
    data: {
      slopingGroundAdjacentToFooting: {
        frustumAngleFromHorizontalDeg: 30,
        minHorizontalDistanceToSlopeMm: { rock: 600, soil: 900 },
      },
      adjacentFootingsGranularSoil: { maxSlope: "1 vertical : 2 horizontal", measuredBetween: "lower adjacent edges of the two footings" },
      adjacentFootingsClayeySoil: { maxSlope: "1 vertical : 2 horizontal", measuredBetween: "lower edge of the upper footing and upper edge of the lower footing" },
      exception: "Cl 8.2: does not apply where adequate lateral support (e.g. a retaining wall) is provided for the material supporting the higher footing.",
    },
    provenance: SOURCE,
  },
  {
    clauseId: "IS 1904:2021 Cl 18",
    version: "Third Revision (Draft)",
    domain: "soil-foundation",
    summary: "Cross-reference clause: net safe bearing capacity for shallow foundations must be computed per IS 6403, not per this code directly - a routing fact, not a numeric one.",
    data: {
      shallowFoundationSbcMethod: "IS 6403",
      note: "IS 1904:2021 itself does not restate IS 6403's computation method or any bearing-capacity value table - it points to that separate standard by reference (Cl 18, and again in Annex A's referenced-standards list). Confirms this domain's real next fetch target is IS 6403 itself, not a table expected to live inside IS 1904.",
    },
    provenance: SOURCE,
  },
]

export const soilFoundationGaps: KbGap[] = [
  {
    clauseId: "Presumptive safe bearing capacity by soil type (commonly cited as \"IS 1904 Table 1\")",
    domain: "soil-foundation",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "Many secondary engineering references (textbooks, blogs, W-93's own predesign-facts scoping table) cite a presumptive-SBC-by-soil-type table (rock/dense gravel/loose sand/soft clay etc., in kN/m2 or t/m2) as \"IS 1904's own table.\" This session fetched IS 1904:2021's real text directly and confirmed its own Table 1 is a permissible-SETTLEMENT table (Cl 16.3.4), not a bearing-capacity table, and Cl 18 explicitly routes bearing-capacity computation to IS 6403 instead of tabulating it in IS 1904 itself. Rather than seed the commonly-cited figures from secondary-source memory (which this session cannot verify traces back to IS 1904 specifically, given what was actually found in the primary text), this is chipped as a real gap. Queue: fetch IS 6403 directly (the standard IS 1904 itself cites for this) and extract its real presumptive/computed bearing-capacity content, or the classic table's actual origin standard if IS 6403 does not contain a simple presumptive lookup either.",
  },
  {
    clauseId: "IS 1904:2021 Table 1 (permissible settlement values, Cl 16.3.4)",
    domain: "soil-foundation",
    reason: "GAP-OCR",
    queuedAction:
      "Cl 16.3.4 explicitly states 'the permissible value of settlement for different types of structures are given in Table 1,' but this table's actual row/column values did not extract as readable text from the fetched source (a table-structure extraction failure, not a missing table - the same class of gap already chipped elsewhere in this KB, e.g. structure domain's IS 456 Table 5). Queue: a cleaner PDF extraction pass or a second public copy of IS 1904:2021.",
  },
]
