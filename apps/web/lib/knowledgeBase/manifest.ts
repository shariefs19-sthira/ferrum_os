import { kbDomains, type DepthDenominatorProvenance, type KbDomainManifestEntry, type KbGap } from "./types"
import { structureFacts, structureGaps } from "./domains/structure"
import { planningFacts, planningGaps } from "./domains/planning"
import { safetyFacts, safetyGaps } from "./domains/safety"

// W-41 KB_EXHAUSTIVE's coverage manifest. Computed from the actual
// seeded arrays, never hand-typed - a domain with zero facts shows as
// ROADMAP here automatically, it can't silently drift out of sync with
// what's really seeded.
const seededByDomain: Partial<Record<(typeof kbDomains)[number], { length: number }>> = {
  structure: structureFacts,
  planning: planningFacts,
  safety: safetyFacts,
}

const gapsByDomain: Partial<Record<(typeof kbDomains)[number], KbGap[]>> = {
  structure: structureGaps,
  planning: planningGaps,
  safety: safetyGaps,
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
