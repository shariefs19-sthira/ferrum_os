// W-29 KNOWLEDGE_BASE schema. A versioned, structured code corpus -
// our own fields/tables, never copied source prose - covering the
// topics named in W-29/W-41: design theory, planning, RCC/steel/
// masonry structure, soil & foundation, MEP, materials, quantities &
// rates, contracts & tendering, approvals/NOCs, finance,
// sustainability, safety, and Vaastu (explicitly traditional practice,
// never presented as code).
//
// Every fact carries its own clause ID, a version tag, and a status
// chip per RULE 5/29 - no fact reads as more authoritative than its
// actual sourcing. VERIFIED-SAMPLE means the value was extracted
// directly from a real fetched source document this session (not
// recalled from memory) and can be traced back to that source's exact
// text; INDICATIVE means derived/approximate, not a direct quote;
// ROADMAP means the topic is named but has no seeded facts yet.
export type FactStatus = "VERIFIED-SAMPLE" | "INDICATIVE" | "ROADMAP"

export type FactProvenance = {
  sourceName: string
  sourceUrl: string
  license: string
  fetchedAt: string
  status: FactStatus
}

export type ClauseFact = {
  clauseId: string // e.g. "IS 456:2000 Cl 23.2.1"
  version: string // e.g. "Fourth Revision, Tenth Reprint, April 2007 (incl. Amendments 1 & 2)"
  domain: KbDomain
  summary: string // our own structured description of what the clause governs, not copied prose
  data: Record<string, unknown> // the structured fact itself (fields we author)
  provenance: FactProvenance
}

export const kbDomains = [
  "design-theory",
  "planning",
  "structure",
  "soil-foundation",
  "mep",
  "materials",
  "quantities-rates",
  "contracts-tendering",
  "approvals-nocs",
  "finance",
  "sustainability",
  "safety",
  "vaastu",
] as const
export type KbDomain = (typeof kbDomains)[number]

export type KbDomainManifestEntry = {
  domain: KbDomain
  itemCount: number
  status: "SEEDED" | "ROADMAP" // a domain with itemCount 0 is always ROADMAP - never silently absent or falsely implied complete
}
