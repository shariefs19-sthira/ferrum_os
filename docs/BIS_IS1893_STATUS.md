# BIS_IS1893_STATUS.md — resolves the W-122 MASON/ATLAS conflict

Seeded 2026-09-10 by SCRIBE, per direct RULE 54-adjacent live web
verification (not delegated to ATLAS this once, since the conflict was
already narrow, urgent, and SCRIBE had the search tool in hand — flagged
here rather than silently exceeding normal scope). Every claim below is
sourced to a real, independently found article, not asserted from
memory or from either seat's prior text.

## The conflict this resolves

- **W-122's landed code** (`apps/web/lib/checks/seismicStandard.ts`,
  commit `3bc6533`) asserts: `governingEdition: 'IS 1893 (Part 1):2016'`,
  and marks `IS 1893 (Part 1):2025` as `withdrawnEdition`,
  `operative: false`, `withdrawnOn: '2026-03-05'`.
- **W-120's landed research** (`docs/OPEN_GEO_DATA_SURVEY.md`, commit
  `c076883`, dated 2026-09-08) asserts the opposite: "India's earthquake
  design code was updated in 2025 — IS 1893:2025 introduces a new,
  highest-risk Seismic Zone VI."
- These directly contradict each other. `docs/TASK_BOARD.md`'s W-122
  row flagged this as unresolved on 2026-09-10, declining to mark
  either seat's work as authoritative without a real source check.

## Verified finding

**MASON's landed code is correct. ATLAS's W-120 finding is now stale.**

The Bureau of Indian Standards (BIS) did publish a revised IS 1893
(Part 1) in November 2025 introducing a new, highest-risk Seismic
Zone VI. However, following concerns raised by the Ministry of Housing
and Urban Affairs (MoHUA) — principally construction-cost escalation
estimated at 10–15% in Zones V/VI for buildings and up to 50% for
infrastructure projects, plus inadequate stakeholder consultation
before finalization — BIS withdrew that November 2025 notification via
a gazette notification in early March 2026 (sources below give the
date as March 3; the landed code's own `withdrawnOn: '2026-03-05'` is
close but not an exact match to the primary date reported — flagged as
a minor discrepancy, not independently reconciled further here).

**Current governing standard, as of this writing:** IS 1893 (Part 1):2016
— the pre-2025 four/five-zone system (II–V), no Zone VI. The 2025
revision is withdrawn, not merely superseded-but-still-referenceable.

## Sources (independently found via live web search, 2026-09-10)

- [Rollback of Seismic Code of 2025](https://www.drishtiias.com/daily-updates/daily-news-analysis/rollback-of-seismic-code-of-2025) — Drishti IAS
- [BIS Revokes New Seismic Map with High-risk Zone VI](https://visionias.in/current-affairs/upsc-daily-news-summary/article/2026-03-07/the-economic-times/environment/bis-revokes-new-seismic-map-with-high-risk-zone-vi) — Vision IAS
- [A Bold Policy Reversed: The Withdrawal Of India's 2025 Seismic Code](https://www.etvbharat.com/en/opinion/a-bold-policy-reversed-the-withdrawal-of-indias-2025-seismic-code-enn26031103638) — ETV Bharat
- [BIS Restores 2016 Seismic Code in India](https://utkarsh.com/current-affairs/national/government-scheme/bis-withdraws-draft-seismic-code-2025-restores-2016-standard) — Utkarsh
- [New Seismic Zonation Map of India](https://www.clearias.com/new-seismic-zonation-map-of-india/) — ClearIAS
- [NBC Diluted, IS 1893:2025 (Parts 1 & 5) Withdrawn](https://www.manojmittal.in/post/nbc-diluted-is-1893-2025-parts-1-5-withdrawn-a-wake-up-call-for-all-stakeholders) — Manoj Mittal

## Follow-up needed (not done in this pass)

`docs/OPEN_GEO_DATA_SURVEY.md`'s W-120 flagship finding is now stale
and should carry a dated correction note pointing here — not rewritten
or deleted (RULE 3 append-only). This document does not itself amend
W-120's file; that edit belongs to ATLAS or CRANE, per RULE 59's
single-assignee model, not SCRIBE overreaching into another seat's
research file.
