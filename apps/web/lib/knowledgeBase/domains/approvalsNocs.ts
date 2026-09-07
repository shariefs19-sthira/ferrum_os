import type { ClauseFact, KbGap } from "../types"

// W-29 KNOWLEDGE_BASE - approvals-nocs domain, first seed pass.
// Drained from docs/ARCHITECT_PREDESIGN_FACTS.md's "Regulatory" slice
// (§2, "Heritage restrictions" row) per operator instruction - that
// doc itself is a scoping table, not a primary source, so the actual
// clause fact below was independently fetched and extracted from the
// real statute it named, not copied from the scoping table's summary.
//
// Source: The Ancient Monuments and Archaeological Sites and Remains
// (Amendment and Validation) Act, 2010 (amending the principal 1958
// Act), Sections 4-6 (inserting/amending Sections 20A and 20B).
// Fetched as the real Act text hosted by PRS Legislative Research
// (prsindia.org), a non-profit legislative-research body that mirrors
// the actual Gazette-notified Act text (the Ministry's own
// indiacode.nic.in copy returned a server error this pass - PRS is
// used as the working copy, not a paraphrase or summary site).
// Fetched and extracted 2026-09-07.
const SOURCE = {
  sourceName: "The Ancient Monuments and Archaeological Sites and Remains (Amendment and Validation) Act, 2010, Sections 4-6 (inserting Sections 20A/20B into the 1958 Act)",
  sourceUrl: "https://prsindia.org/files/bills_acts/acts_parliament/2010/ancient-monuments-and-archaeological-sites-and-remains-act-2010.pdf",
  license: "Act of Parliament of India - public legislative text, mirrored by PRS Legislative Research (a non-profit research institution) from the Gazette-notified original.",
  fetchedAt: "2026-09-07",
  status: "VERIFIED-SAMPLE" as const,
}

export const approvalsNocsFacts: ClauseFact[] = [
  {
    clauseId: "AMASR (Amendment and Validation) Act 2010, Sec 20A",
    version: "Ancient Monuments and Archaeological Sites and Remains Act, 1958, as amended 2010",
    domain: "approvals-nocs",
    summary: "Prohibited area around a protected monument/protected area: no construction (other than by an archaeological officer) is permitted within this radius, subject to narrow exceptions.",
    data: {
      prohibitedAreaRadiusM: 100,
      radiusMeasuredFrom: "the limit of the protected area or protected monument, in all directions",
      note: "The Central Government may, on the Authority's recommendation, notify a larger prohibited-area radius for a specific monument having regard to its classification (Sec 20A proviso). No permission for construction may be granted within the prohibited area on or after the 2010 Amendment's assent date, except the narrow public-work/essential-project exception in Sec 20A(3).",
    },
    provenance: SOURCE,
  },
  {
    clauseId: "AMASR (Amendment and Validation) Act 2010, Sec 20B",
    version: "Ancient Monuments and Archaeological Sites and Remains Act, 1958, as amended 2010",
    domain: "approvals-nocs",
    summary: "Regulated area beyond the prohibited area around a nationally-important protected monument: construction requires permission of the competent authority (National Monuments Authority), rather than being outright barred.",
    data: {
      regulatedAreaRadiusM: 200,
      radiusMeasuredFrom: "the outer limit of the prohibited area (i.e. 100m to 300m from the monument by default), in all directions",
      note: "Applies to monuments/sites declared of national importance under Sections 3 and 4 of the principal Act. The Central Government may notify a larger regulated-area radius by Gazette notification, having regard to the monument's classification (Sec 20B proviso). Construction permission within this zone is granted by the competent authority under Sec 20D, not automatically.",
    },
    provenance: SOURCE,
  },
]

export const approvalsNocsGaps: KbGap[] = [
  {
    clauseId: "Heritage monument location dataset (for computing the 100m/200m buffers against a real parcel)",
    domain: "approvals-nocs",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "The buffer-distance rule itself (100m prohibited / 200m regulated) is now seeded as a real fact, per docs/ARCHITECT_PREDESIGN_FACTS.md's own framing ('the rule itself is computable once a monument-location dataset exists; the dataset itself doesn't yet exist in Ferrum'). This gap tracks that missing dataset specifically - a geocoded list of ASI-protected monuments/sites, which this pass did not source (ASI's own public monument list would be the next fetch target, not a memory reconstruction).",
  },
]
