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
  {
    clauseId: "MBBL 2016 Table 3.3",
    version: "Model Building Bye-Laws, 2016, TCPO",
    domain: "planning",
    summary:
      "Indian standard plot-size classes (Building control in Residential Premises): maximum ground coverage, FAR, permitted dwelling-unit count, and maximum height per plot-area bracket. Feeds W-67 PRESET_LIBRARY's plot-class x use/floor combinatorial matrix - the regulatory envelope each generated preset must respect, not the preset generation itself (MASON's piece).",
    data: {
      rows: [
        { plotAreaSqmMax: 30, maxGroundCoveragePercent: 75, farAsTabulated: 150, maxDwellingUnits: 1, maxHeightM: 8 },
        { plotAreaSqmRange: "30-50", maxGroundCoveragePercent: 75, farAsTabulated: 150, maxDwellingUnits: 2, maxHeightM: 8 },
        { plotAreaSqmRange: "50-100", maxGroundCoveragePercent: 65, farAsTabulated: 180, maxDwellingUnits: 3, maxHeightM: 12 },
        { plotAreaSqmRange: "100-250", maxGroundCoveragePercent: 65, farAsTabulated: 180, maxDwellingUnits: 3, maxHeightM: 12 },
        { plotAreaSqmRange: "250-500", maxGroundCoveragePercent: 55, farAsTabulated: 165, maxDwellingUnits: 6, maxHeightM: 15 },
        { plotAreaSqmRange: "500-1000", maxGroundCoveragePercent: 45, farAsTabulated: 120, maxDwellingUnits: 8, maxHeightM: 15 },
        { plotAreaSqmRange: "1000-1500", maxGroundCoveragePercent: 40, farAsTabulated: 100, maxDwellingUnits: 8, maxHeightM: 15 },
        { plotAreaSqmRange: "1500-3000", maxGroundCoveragePercent: 33.3, farAsTabulated: 100, maxDwellingUnits: 12, maxHeightM: 15 },
      ],
      note:
        "farAsTabulated is recorded exactly as the source table prints it (150, 180, 165...), not silently divided by 100 into a FAR ratio (1.50, 1.80...) - the source's own column header just reads 'FAR' with no unit stated, and this session did not independently confirm which convention the original table intends. Flagged, not guessed. This is a MODEL bye-law (guidance for state/ULB adoption, per the document's own stated purpose) - individual city DCRs may set different numbers; this table is the national-model baseline, not a claim that every city follows it exactly.",
    },
    provenance: {
      sourceName: "Model Building Bye-Laws, 2016 (Ministry of Urban Development, Government of India; TCPO)",
      sourceUrl: "https://smartnet.niua.org/content/498286ad-1f8b-4c41-88d8-f58e98ed20fa",
      license: "© Ministry of Urban Development, Government of India, 2016 - \"Material from this publication may be used for educational or other purposes with due credits\" (source's own stated terms).",
      fetchedAt: "2026-09-06",
      status: "VERIFIED-SAMPLE",
    },
  },
  {
    clauseId: "NBC 2016 (SP 7) Part 3 Cl 8.2.1.1",
    version: "SP 7:2016, Volume 1",
    domain: "planning",
    summary: "Minimum front open space (setback) for residential buildings up to 10 m height, by width of the abutting street.",
    data: {
      rows: [
        { streetWidthM: "up to 7.5", frontOpenSpaceMinM: 1.5, note: "applies only to buildings up to a maximum height of 7 m" },
        { streetWidthM: "7.5 to 18", frontOpenSpaceMinM: 3.0 },
        { streetWidthM: "18 to 30", frontOpenSpaceMinM: 4.5 },
        { streetWidthM: "above 30", frontOpenSpaceMinM: 6.0 },
      ],
      note: "Where a building abuts two or more streets, the value is based on the average width of streets, subject to a minimum of 1.8 m for rows 2-4. For streets under 7.5 m wide, the building line shall instead be at least 5 m from the street's centre line (Cl 8.2.1.1(b)).",
    },
    provenance: SOURCE,
  },
  {
    clauseId: "NBC 2016 (SP 7) Part 3 Cl 8.2.3.1 (Table 4)",
    version: "SP 7:2016, Volume 1",
    domain: "planning",
    summary: "Side and rear open spaces to be left around residential buildings of height above 10 m, by building height.",
    data: {
      rows: [
        { heightM: 10, sideRearOpenSpaceM: 3 },
        { heightM: 15, sideRearOpenSpaceM: 5 },
        { heightM: 18, sideRearOpenSpaceM: 6 },
        { heightM: 21, sideRearOpenSpaceM: 7 },
        { heightM: 24, sideRearOpenSpaceM: 8 },
        { heightM: 27, sideRearOpenSpaceM: 9 },
        { heightM: 30, sideRearOpenSpaceM: 10 },
        { heightM: 35, sideRearOpenSpaceM: 11 },
        { heightM: 40, sideRearOpenSpaceM: 12 },
        { heightM: 45, sideRearOpenSpaceM: 13 },
        { heightM: 50, sideRearOpenSpaceM: 14 },
        { heightM: 55, sideRearOpenSpaceM: 16 },
        { heightM: 70, sideRearOpenSpaceM: 17 },
        { heightM: 120, sideRearOpenSpaceM: 18 },
        { heightM: "above 120", sideRearOpenSpaceM: 20 },
      ],
      notes: [
        "For buildings above 24 m in height, there shall be a minimum front open space of 6 m.",
        "Where rooms do not derive light/ventilation from the exterior open space, the width in this table may be reduced by 1 m, subject to a minimum of 3 m and a maximum of 8 m.",
        "If the length or depth of the building exceeds 40 m, add 10 percent of (length or depth minus 4.0 m) to the table value, subject to a maximum requirement of 20 m.",
      ],
    },
    provenance: SOURCE,
  },
  {
    clauseId: "UDCPR 2020 (Maharashtra) Regulation 6.2.1 (Table No.6-D)",
    version: "Unified Development Control and Promotion Regulations for Maharashtra State, 2020 (as amended, compressed edition dated 2023-10 on mmrda.maharashtra.gov.in)",
    domain: "planning",
    summary:
      "Minimum plot size/width, road-side setback, and side/rear margins for residential and mixed-use buildings up to 15 m height (outside congested area), Maharashtra state-level DCR. A second real state-DCR source for this domain, alongside NBC 2016's national baseline.",
    data: {
      rows: [
        { roadWidthM: "30 and above", minPlotSizeSqm: 450, minPlotWidthM: 15, roadSideSetbackM: "6.0 (A/B/C class Municipal Corporations) or 4.5 (other areas)", sideMarginM: 3.0, rearMarginM: 3.0 },
        { roadWidthM: "18 to below 30", minPlotSizeSqm: 250, minPlotWidthM: 10, roadSideSetbackM: 4.5, sideMarginM: 2.0, rearMarginM: 2.0 },
        { roadWidthM: "15 to below 18", minPlotSizeSqm: 200, minPlotWidthM: 10, roadSideSetbackM: 3.0, sideMarginM: 1.5, rearMarginM: 1.5 },
        { roadWidthM: "below 15", minPlotSizeSqm: 80, minPlotWidthM: 6, roadSideSetbackM: 3.0, sideMarginM: 1.5, rearMarginM: 1.5, note: "semi-detached buildings: only one side margin required" },
        { roadWidthM: "12 and below (row housing)", minPlotSizeSqm: 30, roadSideSetbackM: 3.5, sideMarginM: 2.25, rearMarginM: 0.0 },
      ],
      note: "Margins in rows 1-3 apply for buildings up to their stated height (excluding parking floor up to 6 m height); rows 4-5 are for G+2/stilt+3 structures. Table No.6-D is Cl 6.2.1's own table for non-congested areas; a separate Cl 6.1/Table No.6C exists for congested areas (not seeded this pass).",
    },
    provenance: {
      sourceName: "Unified Development Control and Promotion Regulations for Maharashtra State, 2020 (UDCPR), Urban Development Department, Government of Maharashtra",
      sourceUrl: "https://www.mmrda.maharashtra.gov.in/sites/default/files/2023-10/UDCPR_compressed_2.pdf",
      license: "Government of Maharashtra official regulation document, hosted on the state's own Mumbai Metropolitan Region Development Authority (mmrda.maharashtra.gov.in) domain.",
      fetchedAt: "2026-09-07",
      status: "VERIFIED-SAMPLE" as const,
    },
  },
]

export const planningGaps: KbGap[] = [
  {
    clauseId: "Karnataka Municipal Corporations Model Building Bye-Laws, Cl 5.2.7.1 (BDA/Bengaluru numeric setback table)",
    domain: "planning",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "Fetched the Karnataka Municipal Corporations Model Building Bye-Laws (mrc.gov.in, 2017 edition, real primary-adjacent state source) and confirmed its own Cl 5.2.7.1 text: 'The open spaces/setbacks, coverage, FAR, parking requirements shall be as per Zoning regulations of the Master Plan' - i.e. this document deliberately does not tabulate numeric setback values itself, deferring to each city/authority's own Master Plan Zoning Regulations. A widely-cited secondary figure exists for Bengaluru specifically (BBMP: ~8% side/rear, ~12% front setback of plot dimensions, varying by six plot-size brackets), but this session found it only in non-primary blog/advisory sources (bricknbolt.com, studiomatrx.org, liza homes), not in a fetched primary BDA/BBMP Revised Master Plan Zoning Regulations document - so it is not seeded as a fact, per the standing rule against presenting recalled/secondary figures as code-extracted. Queue: fetch the actual Bengaluru RMP 2031 (or current) Zoning Regulations PDF from bdabangalore.org / bbmp.gov.in directly.",
  },
  {
    clauseId: "One local-body (municipal/ULB) setback sample distinct from state DCR/model bye-law level",
    domain: "planning",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "Operator asked for 'one local-body sample' in addition to the two state DCRs (Karnataka/BDA, Maharashtra DCPR). This session located only secondary reproductions of a real local-body document (Bangalore Mahanagara Palike Building Bye-Laws 2003, hosted on naredco.in - an industry-body mirror, not the municipality's own domain) and did not fetch/verify its primary text this pass. Queue: fetch and extract the naredco.in-hosted 2003 BMP bye-laws (or a current BBMP-published equivalent) directly, verify it is a genuine local-body-level document (below state DCR), and seed its setback clause once confirmed rather than guessed from the mirror's title alone.",
  },
]
