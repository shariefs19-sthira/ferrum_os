import { kbDomains, type DepthDenominatorProvenance, type KbDomainManifestEntry, type KbGap } from "./types"
import { structureFacts, structureGaps } from "./domains/structure"

// W-41 KB_EXHAUSTIVE's coverage manifest. Computed from the actual
// seeded arrays, never hand-typed - a domain with zero facts shows as
// ROADMAP here automatically, it can't silently drift out of sync with
// what's really seeded.
const seededByDomain: Partial<Record<(typeof kbDomains)[number], { length: number }>> = {
  structure: structureFacts,
}

const gapsByDomain: Partial<Record<(typeof kbDomains)[number], KbGap[]>> = {
  structure: structureGaps,
}

// Depth-% denominator per the operator's standing rule: the source's
// own clause index/TOC, cited with its own provenance - never a bare
// number. IS 456:2000's own top-level clause numbering runs from
// Clause 1 through Clause 43 (verified by counting distinct top-level
// "N." section headers in the fetched source text itself, not assumed
// from a table of contents that OCR'd poorly) - 43 is this domain's
// real scope target until a second structure-domain source (IS 875,
// IS 1893, a masonry code) is added, at which point this denominator
// must grow to match, not stay pinned to one source's count forever.
const depthDenominatorsByDomain: Partial<Record<(typeof kbDomains)[number], DepthDenominatorProvenance>> = {
  structure: {
    sourceName: "IS 456:2000 Plain and Reinforced Concrete - Code of Practice (Fourth Revision)",
    sourceUrl: "https://archive.org/details/gov.in.is.456.2000",
    method:
      "Counted distinct top-level clause numbers (pattern ^N.N at the start of a line) appearing as section headers across the full fetched text - found Clauses 1 through 43 present (Clause 27 not independently confirmed as a header in this OCR pass, included in the range regardless since IS 456's own clause numbering is sequential and undisputed).",
    totalClauseCount: 43,
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
