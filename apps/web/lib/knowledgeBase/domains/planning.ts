import type { ClauseFact, KbGap } from "../types"

// W-29 KNOWLEDGE_BASE - planning domain (development control / FAR /
// habitable-room requirements), first seed pass, adapter-first per the
// standing KB_MAX_DEPTH drain order.
//
// Source: National Building Code of India 2016 (SP 7 : 2016), Volume 1,
// Part 3 "Development Control Rules and General Building Requirements",
// Bureau of Indian Standards. Hosted on Internet Archive (item
// nationalbuilding01, born-digital PDF - "in.gov.nbc.2016.vol1.digital"
// - not a scanned-and-OCR'd copy, so extraction quality here is high).
// Same public-domain framing as the IS 456 source already seeded:
// "this legal document is hereby made available on a noncommercial
// basis, as it is the right of all humans to know and speak the laws
// that govern them" (the item's own stated rights text). Fetched and
// extracted 2026-09-06.
//
// Note: this single source also satisfies W-29's separate "SP 7"
// citation - the National Building Code IS legally designated SP 7:2016
// by BIS, confirmed directly on the item page ("Legally Binding
// Document Designator: SP 7") - not two separate sourcing efforts.
const SOURCE = {
  sourceName: "National Building Code of India 2016 (SP 7:2016), Volume 1, Part 3 - Development Control Rules and General Building Requirements",
  sourceUrl: "https://archive.org/details/nationalbuilding01",
  license: "Public-domain publication (BIS legal-document notice, same framing as IS 456's Internet Archive item)",
  fetchedAt: "2026-09-06",
  status: "VERIFIED-SAMPLE" as const,
}

export const planningFacts: ClauseFact[] = [
  {
    clauseId: "NBC 2016 (SP 7) Part 3 Cl 2.39",
    version: "SP 7:2016, Volume 1",
    domain: "planning",
    summary: "Definition of Floor Area Ratio (FAR) - the quotient of total covered (plinth) area on all floors to plot area.",
    data: {
      formula: "FAR = (Total covered area of all floors) / (Plot area)",
    },
    provenance: SOURCE,
  },
  {
    clauseId: "NBC 2016 (SP 7) Part 3 Cl 9.6.2 (Table 6)",
    version: "SP 7:2016, Volume 1",
    domain: "planning",
    summary: "Floor Area Ratio and maximum ground coverage for Group Housing, by net residential density.",
    data: {
      rows: [
        { densityDwellingUnitsPerHectare: 25, maxCoveragePercent: 25, far: 0.5 },
        { densityDwellingUnitsPerHectare: 50, maxCoveragePercent: 30, far: 0.75 },
        { densityDwellingUnitsPerHectare: 75, maxCoveragePercent: 33, far: 0.9 },
        { densityDwellingUnitsPerHectare: 100, maxCoveragePercent: 35, far: 1.0 },
        { densityDwellingUnitsPerHectare: 125, maxCoveragePercent: 35, far: 1.25 },
        { densityDwellingUnitsPerHectare: 150, maxCoveragePercent: 35, far: 1.5 },
        { densityDwellingUnitsPerHectare: 175, maxCoveragePercent: 35, far: 1.75 },
        { densityDwellingUnitsPerHectare: 200, maxCoveragePercent: 35, far: 2.0 },
        { densityDwellingUnitsPerHectare: 225, maxCoveragePercent: 35, far: 2.25 },
        { densityDwellingUnitsPerHectare: 250, maxCoveragePercent: 35, far: 2.5 },
      ],
      note: "Table applies specifically to Group Housing; not a general/universal FAR table for every occupancy type (Table 5 in the same part covers comparative FAR by occupancy facing a public street - not seeded this pass).",
    },
    provenance: SOURCE,
  },
  {
    clauseId: "NBC 2016 (SP 7) Part 3 Cl 12.2.1",
    version: "SP 7:2016, Volume 1",
    domain: "planning",
    summary: "Minimum ceiling height for habitable rooms, with exceptions for air-conditioned rooms, educational, and industrial buildings.",
    data: {
      minHeightM: { general: 2.75, pitchedRoofAverage: 2.75, minClearHeadroomUnderBeam: 2.4, airConditionedToDuctOrFalseCeiling: 2.4 },
      exceptions: {
        educationalBuildings: { generalRegionsM: 3.6, coldRegionsM: 3.0 },
        industrialBuildings: { unconditionedM: 3.6, conditionedM: 3.0, note: "Factory Act 1948 and its rules govern such heights where applicable." },
      },
    },
    provenance: SOURCE,
  },
  {
    clauseId: "NBC 2016 (SP 7) Part 3 Cl 12.2.2",
    version: "SP 7:2016, Volume 1",
    domain: "planning",
    summary: "Minimum floor area and width for habitable rooms.",
    data: {
      singleRoom: { minAreaSqm: 9.5, minWidthM: 2.4 },
      twoRooms: { firstRoomMinAreaSqm: 9.5, secondRoomMinAreaSqm: 7.5, minWidthM: 2.1 },
    },
    provenance: SOURCE,
  },
  {
    clauseId: "NBC 2016 (SP 7) Part 3 Cl 12.3.1-12.3.2",
    version: "SP 7:2016, Volume 1",
    domain: "planning",
    summary: "Kitchen minimum ceiling height and floor area/width, including the reduced-area allowance with a separate store and the combined kitchen-cum-dining case.",
    data: {
      minHeightM: 2.75,
      withSeparateDining: { minAreaSqm: 5.0, minWidthM: 1.8 },
      withSeparateStore: { minAreaSqm: 4.5 },
      kitchenCumDining: { minAreaSqm: 7.5, minWidthM: 2.1 },
    },
    provenance: SOURCE,
  },
]

export const planningGaps: KbGap[] = []
