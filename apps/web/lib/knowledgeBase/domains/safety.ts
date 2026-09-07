import type { ClauseFact } from "../types"

// W-29 KNOWLEDGE_BASE - safety domain (fire and life safety), first
// seed pass, adapter-first per the standing KB_MAX_DEPTH drain order.
//
// Source: National Building Code of India 2016 (SP 7:2016), Volume 1,
// Part 4 "Fire and Life Safety", Bureau of Indian Standards. Same
// fetched item as the planning domain's NBC source (nationalbuilding01,
// born-digital PDF, public-domain BIS legal-document notice) - Part 4
// is a distinct section of the same already-fetched text, not a
// separate fetch. Fetched and extracted 2026-09-06.
const SOURCE = {
  sourceName: "National Building Code of India 2016 (SP 7:2016), Volume 1, Part 4 - Fire and Life Safety",
  sourceUrl: "https://archive.org/details/nationalbuilding01",
  license: "Public-domain publication (BIS legal-document notice, same framing as IS 456's Internet Archive item)",
  fetchedAt: "2026-09-06",
  status: "VERIFIED-SAMPLE" as const,
}

export const safetyFacts: ClauseFact[] = [
  {
    clauseId: "NBC 2016 (SP 7) Part 4 Cl 4.4.2.4.3.1",
    version: "SP 7:2016, Volume 1",
    domain: "safety",
    summary:
      "Staircase requirements: minimum staircase count per building, and stair tread/riser dimensional minima/maxima by occupancy type - resolves this KB's earlier open 'stair geometry' gap.",
    data: {
      minimumStaircasesPerBuilding: 2,
      treadMinMm: { residential: 250, other: 300 },
      riserMaxMm: { residentialA2: 190, other: 150 },
      maxRisersPerFlight: 12,
      note:
        "'Other' here covers assembly, hotels, educational, institutional, business occupancies per the clause's own wording. At least 50% of staircases must discharge directly or via an exit passageway/large lobby (same clause, not separately structured here).",
    },
    provenance: SOURCE,
  },
]

export const safetyGaps: never[] = []
