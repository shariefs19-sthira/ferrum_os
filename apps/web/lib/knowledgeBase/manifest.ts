import { kbDomains, type KbDomainManifestEntry } from "./types"
import { structureFacts } from "./domains/structure"

// W-41 KB_EXHAUSTIVE's coverage manifest. Computed from the actual
// seeded arrays, never hand-typed - a domain with zero facts shows as
// ROADMAP here automatically, it can't silently drift out of sync with
// what's really seeded.
const seededByDomain: Partial<Record<(typeof kbDomains)[number], { length: number }>> = {
  structure: structureFacts,
}

export function getKbCoverageManifest(): KbDomainManifestEntry[] {
  return kbDomains.map((domain) => {
    const count = seededByDomain[domain]?.length ?? 0
    return { domain, itemCount: count, status: count > 0 ? "SEEDED" : "ROADMAP" }
  })
}
