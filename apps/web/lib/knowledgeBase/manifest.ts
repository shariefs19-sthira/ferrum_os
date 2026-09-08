import { kbDomains, type DepthDenominatorProvenance, type KbDomainManifestEntry, type KbGap } from "./types"
import { structureFacts, structureGaps } from "./domains/structure"
import { planningFacts, planningGaps } from "./domains/planning"
import { safetyFacts, safetyGaps } from "./domains/safety"
import { approvalsNocsFacts, approvalsNocsGaps } from "./domains/approvalsNocs"
import { sustainabilityFacts, sustainabilityGaps } from "./domains/sustainability"
import { soilFoundationFacts, soilFoundationGaps } from "./domains/soilFoundation"
import { materialsFacts, materialsGaps } from "./domains/materials"

// W-41 KB_EXHAUSTIVE's coverage manifest. Computed from the actual
// seeded arrays, never hand-typed - a domain with zero facts shows as
// ROADMAP here automatically, it can't silently drift out of sync with
// what's really seeded.
const seededByDomain: Partial<Record<(typeof kbDomains)[number], { length: number }>> = {
  structure: structureFacts,
  planning: planningFacts,
  safety: safetyFacts,
  "approvals-nocs": approvalsNocsFacts,
  sustainability: sustainabilityFacts,
  "soil-foundation": soilFoundationFacts,
  materials: materialsFacts,
}

const gapsByDomain: Partial<Record<(typeof kbDomains)[number], KbGap[]>> = {
  structure: structureGaps,
  planning: planningGaps,
  safety: safetyGaps,
  "approvals-nocs": approvalsNocsGaps,
  sustainability: sustainabilityGaps,
  "soil-foundation": soilFoundationGaps,
  materials: materialsGaps,
}

// Depth-% denominator per the operator's standing rule: the source's
// own clause index/TOC, cited with its own provenance - never a bare
// number. This domain now draws on two real sources (IS 456:2000 and
// NBC 2016 Part 6 Section 1); DepthDenominatorProvenance only carries
// one sourceName/method string, so both are folded into a single
// combined description below and the two sources' own clause counts
// are summed (43 + 9 = 52) rather than restructuring the type for a
// single occurrence - grows again if a third structure-domain source
// (IS 875, IS 1893, a masonry code) is added.
const depthDenominatorsByDomain: Partial<Record<(typeof kbDomains)[number], DepthDenominatorProvenance>> = {
  structure: {
    sourceName:
      "IS 456:2000 Plain and Reinforced Concrete - Code of Practice (Fourth Revision) + NBC 2016 (SP 7:2016) Volume 1 Part 6 Section 1 'Loads, Forces and Effects'",
    sourceUrl: "https://archive.org/details/gov.in.is.456.2000 ; https://archive.org/details/nationalbuilding01",
    method:
      "IS 456:2000: counted distinct top-level clause numbers (pattern ^N.N at the start of a line) appearing as section headers across the full fetched text - found Clauses 1 through 43 present (Clause 27 not independently confirmed as a header in this OCR pass, included in the range regardless since IS 456's own clause numbering is sequential and undisputed). NBC 2016 Part 6 Section 1: counted its own top-level clause numbers directly from its Table of Contents - Clauses 1 through 9 listed (Scope, Dead Load, Imposed Load, Wind Load, Seismic Force, Snow Load, Special Loads, Load Combinations, Multi-Hazard Risk). Combined total: 43 + 9 = 52.",
    totalClauseCount: 52,
  },
  planning: {
    sourceName:
      "NBC 2016 (SP 7:2016), Volume 1, Part 3 - Development Control Rules and General Building Requirements + UDCPR 2020 (Maharashtra state DCR)",
    sourceUrl: "https://archive.org/details/nationalbuilding01 ; https://www.mmrda.maharashtra.gov.in/sites/default/files/2023-10/UDCPR_compressed_2.pdf",
    method:
      "NBC 2016 Part 3: counted its own top-level clause numbers directly from its own Table of Contents in the fetched born-digital text - Clauses 1 through 29 listed (Scope through Asset and Facility Management). UDCPR 2020: counted its own top-level Chapter numbers directly from its own document structure - Chapters 1 through 15. Combined total: 29 + 15 = 44. (MBBL 2016 is also seeded in this domain as a third, national-model-level source, but its own clause/table index was not counted into this denominator this pass - a known gap, not a silent omission.)",
    totalClauseCount: 44,
  },
  safety: {
    sourceName: "NBC 2016 (SP 7:2016), Volume 1, Part 4 - Fire and Life Safety",
    sourceUrl: "https://archive.org/details/nationalbuilding01",
    method:
      "Counted Part 4's own top-level clause numbers directly from its own Table of Contents - Clauses 1 through 6 listed (Scope, Terminology, Fire Prevention, Life Safety, Fire Protection, Additional Occupancy-wise Requirements); 7 Annexes (A-G) exist but are not counted as numbered clauses in this denominator.",
    totalClauseCount: 6,
  },
  "approvals-nocs": {
    sourceName: "Ancient Monuments and Archaeological Sites and Remains (Amendment and Validation) Act, 2010",
    sourceUrl: "https://prsindia.org/files/bills_acts/acts_parliament/2010/ancient-monuments-and-archaeological-sites-and-remains-act-2010.pdf",
    method:
      "Counted this Amendment Act's own top-level Sections directly from its own text - Sections 1 through 13 (Short title/commencement through Repeal and savings). This is the denominator for facts drawn from this specific Amendment Act; a future second approvals-nocs source (e.g. an environmental clearance or fire-NOC statute) would need its own count folded in, same pattern as structure/planning.",
    totalClauseCount: 13,
  },
  sustainability: {
    sourceName: "Eco-Niwas Samhita 2021 (Code Compliance and Part II: Electro-Mechanical and Renewable Energy Systems), Bureau of Energy Efficiency",
    sourceUrl: "https://www.beeindia.gov.in/WriteReadData/RTF1984/1772176104.pdf",
    method:
      "Counted this document's own top-level Table-of-Contents entries - 7 numbered chapters (Introduction, Scope, Code Compliance, Mandatory Requirements, Prescriptive Requirements, Point System Method, Terminology & Definitions) plus 5 lettered Annexes (A-E) = 12. This covers only the ENS Part II edition actually fetched; ENS Part I (Building Envelope) and ECBC 2017 are real, separate documents chipped as gaps, not yet folded into this denominator.",
    totalClauseCount: 12,
  },
  "soil-foundation": {
    sourceName: "IS 1904:2021 General Requirements for Design and Construction of Foundations in Soils - Code of Practice (Third Revision, Draft)",
    sourceUrl: "https://archive.org/details/gov.in.is.1904.2021",
    method:
      "Counted distinct top-level clause numbers (pattern ^N TITLE at the start of a line) appearing as section headers across the full fetched text - found Clauses 1 through 20 present (Scope through Protection of Excavation).",
    totalClauseCount: 20,
  },
  materials: {
    sourceName: "IS 383:2016 Coarse and Fine Aggregate for Concrete - Specification (Third Revision)",
    sourceUrl: "https://archive.org/details/gov.in.is.383.2016",
    method:
      "Counted distinct top-level clause numbers (pattern ^N TITLE at the start of a line) appearing as section headers across the full fetched text - found Clauses 1 through 10 present (Scope through Marking).",
    totalClauseCount: 10,
  },
}

export function getKbCoverageManifest(): KbDomainManifestEntry[] {
  return kbDomains.map((domain) => {
    const count = seededByDomain[domain]?.length ?? 0
    const gapCount = gapsByDomain[domain]?.length ?? 0
    const denominator = depthDenominatorsByDomain[domain] ?? null
    const depthPercent = denominator ? Math.round((count / denominator.totalClauseCount) * 1000) / 10 : null
    return {
      domain,
      itemCount: count,
      gapCount,
      status: count > 0 ? "SEEDED" : "ROADMAP",
      depthDenominator: denominator,
      depthPercent,
    }
  })
}
