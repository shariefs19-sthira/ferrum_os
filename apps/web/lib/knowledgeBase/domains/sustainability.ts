import type { ClauseFact, KbGap } from "../types"

// W-29 KNOWLEDGE_BASE - sustainability domain, first seed pass.
// Drained from docs/ARCHITECT_PREDESIGN_FACTS.md's "Climate /
// sustainability" slice (§5, ECBC/Eco Niwas Samhita row) per operator
// instruction - that doc named ECBC 2017/Eco Niwas Samhita 2018 but
// gave no clause-level citation, so this pass independently fetched
// and extracted a real, current ENS edition directly.
//
// Source: Eco-Niwas Samhita 2021 (Code Compliance and Part II:
// Electro-Mechanical and Renewable Energy Systems), Bureau of Energy
// Efficiency (BEE), Ministry of Power, Government of India. Fetched as
// the real 64-page PDF from BEE's own domain (beeindia.gov.in). Note
// on licensing, unlike this KB's other sources (IS 456/NBC/UDCPR,
// which are public-domain or government-open publications): this
// document's own front matter states "No portion (graphics or text) of
// this Code may be reproduced, translated, or transmitted in any form
// ... without explicit written consent from Bureau of Energy
// Efficiency" - copyrighted text. What is seeded below is this domain's
// own restated data (clause numbers, thresholds, cross-referenced IS
// standards) per W-29's schema design ("our own fields/tables, never
// copied source prose"), not a reproduction of the Code's protected
// text - the same non-copying posture already used for every other
// seeded source in this KB, made explicit here because the license
// itself is materially different (all-rights-reserved, not
// public-domain). Fetched and extracted 2026-09-07.
const SOURCE = {
  sourceName: "Eco-Niwas Samhita 2021 (Code Compliance and Part II: Electro-Mechanical and Renewable Energy Systems), Bureau of Energy Efficiency",
  sourceUrl: "https://www.beeindia.gov.in/WriteReadData/RTF1984/1772176104.pdf",
  license: "© 2021 Bureau of Energy Efficiency (Ministry of Power, Government of India) - all rights reserved for the Code's own text/graphics; this KB stores only restated clause numbers/thresholds/cross-references as structured data, not reproduced Code text.",
  fetchedAt: "2026-09-07",
  status: "VERIFIED-SAMPLE" as const,
}

export const sustainabilityFacts: ClauseFact[] = [
  {
    clauseId: "Eco-Niwas Samhita 2021 Cl 6.7.1 (Table 22)",
    version: "Eco-Niwas Samhita 2021, Code Compliance and Part II",
    domain: "sustainability",
    summary: "Solar water heating (SWH) system point-scoring for ENS compliance under the Point System Method - minimum-to-qualify threshold and additional-points tiers by share of building height served.",
    data: {
      maxPoints: 10,
      minimumToOptIn: {
        pointsAwarded: 5,
        requirement: "SWH system of minimum BEE 3-Star label, capable of meeting 100% of the annual hot-water demand of the top 4 floors of the residential building (or the same 100%/top-4-floors demand met via heat recovery instead).",
      },
      additionalTiers: [
        { coverageFloorsFromTop: 6, additionalPoints: 2 },
        { coverageFloorsFromTop: 8, additionalPoints: 5 },
      ],
      referencedStandards: {
        collectorEfficiency: "IS 13129 Part 1 & 2",
        evacuatedTubeCollectorTanks: "IS 16542:2016",
        evacuatedTubes: "IS 16543:2016 and IS 16544:2016",
      },
    },
    provenance: SOURCE,
  },
  {
    clauseId: "Eco-Niwas Samhita 2021 Cl 6.7.2 (Table 23)",
    version: "Eco-Niwas Samhita 2021, Code Compliance and Part II",
    domain: "sustainability",
    summary: "Solar photovoltaic (Renewable Energy Generation Zone) point-scoring for ENS compliance under the Point System Method - minimum-to-qualify threshold and additional-points tiers by generation/roof-area coverage.",
    data: {
      maxPoints: 10,
      minimumToOptIn: {
        pointsAwarded: 5,
        requirement: "A dedicated, obstruction-free Renewable Energy Generation Zone (REGZ) equivalent to at least 2 kWh/m2.year of electricity, or at least 20% of roof area.",
      },
      additionalTiers: [
        { thresholdKwhPerM2Year: 3, orRoofAreaPercent: 30, additionalPoints: 2 },
        { thresholdKwhPerM2Year: 4, orRoofAreaPercent: 40, additionalPoints: 5 },
      ],
    },
    provenance: SOURCE,
  },
]

export const sustainabilityGaps: KbGap[] = [
  {
    clauseId: "Eco-Niwas Samhita Part I (Building Envelope) - WWR / daylighting / U-factor requirements",
    domain: "sustainability",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "docs/ARCHITECT_PREDESIGN_FACTS.md's climate row specifically named daylight/passive-design requirements (e.g. the commonly-cited 'auto-dimming controls for daylit areas above 25 sqm' figure) - those live in ENS Part I (Building Envelope), a different document from the Part II (Electro-Mechanical and Renewable Energy) edition actually fetched and seeded this pass. This pass located only a 2-page third-party summary PDF for Part I (drishtiias.com), not BEE's own primary Part I document, so no Part I facts are seeded rather than risk citing the summary as if it were the code text. Queue: fetch BEE's own Part I PDF directly (beeindia.gov.in) and extract its WWR/U-factor/daylighting clauses with real clause numbers.",
  },
  {
    clauseId: "ECBC 2017 (commercial-building code) - separate from Eco-Niwas Samhita (residential)",
    domain: "sustainability",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "ARCHITECT_PREDESIGN_FACTS.md names ECBC 2017 (voluntary, commercial-building) alongside Eco-Niwas Samhita (residential) as two distinct codes. This pass fetched and seeded only the residential ENS 2021 edition; ECBC 2017 itself was not fetched. Queue: source BEE's own ECBC 2017 PDF and seed its mandatory/point-based requirements separately, since it governs a different building class under different terms (voluntary, state-adoptable) than ENS.",
  },
]
