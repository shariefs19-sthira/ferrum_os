# TASK_REPORTS.md — Task-wise reports (AGENTS.md RULE 36(3))

Append-only. One entry per docs/TASK_BOARD.md row marked DONE: seat, row
ID, landing SHA, RULE 25 live proof, friction + what-went-well, duration.
This is additive to the row's own DONE update on TASK_BOARD.md, not a
replacement for it — the conductor mines this file's friction entries
for workflow refinements per RULE 36(4).

**Reconciliation note (SCRIBE, 2026-09-04):** CRANE independently
created a `docs/TASK_REPORTS.md` on `origin/main` (commit `a0a15a5a`)
before this RULE 36 version was landed — a genuine naming collision,
not a duplicate SCRIBE created. CRANE's real entry is preserved below,
verbatim, since it documents real work (a production D1
migrations-tracking reconciliation) that predates this file's RULE
36(3) row schema. Every entry from this point forward follows RULE
36(3)'s schema: seat, row ID, landing SHA, RULE 25 live proof, friction
+ what-went-well, duration.

## Entries

### 2026-09-04 — Production D1 migration-tracking reconciliation (verified one-time) [CRANE, pre-RULE-36 format, preserved as-is]

**Scope:** `wrangler d1 migrations list --remote` showed all 13 migrations
as "pending" against production `ferrum-os-data`, despite the site being
live and in use — a migrations-*tracking-table* gap, not an empty
database (confirmed earlier: `0001_init.sql` applied as a clean
no-op via `CREATE TABLE IF NOT EXISTS`; `0002_seed.sql` failed on a real
`UNIQUE constraint failed: parcels.ulpin`, proving the seed data already
existed).

**Method (verified, not assumed):**
1. Full backup dump first: `wrangler d1 export ferrum-os-data --remote`
   → `backups/ferrum-os-data-2026-09-04-backup.sql` (421 lines,
   confirmed non-empty and containing real table/row data before
   proceeding).
2. Extracted every `CREATE TABLE` name migrations `0002`-`0012` expect
   (20 tables) and diffed against every `CREATE TABLE` name actually
   present in the backup — zero mismatches (`comm -23` empty output).
3. Checked for `ALTER TABLE` statements within `0002`-`0012` separately,
   since a table existing doesn't prove every column-adding migration on
   top of it ran: found two (`leads.state`, `leads.message`, both from
   `0009_leads_message.sql`). Confirmed both columns present in the
   live `leads` table schema per the backup.
4. Only after both checks passed clean: inserted rows into `d1_migrations`
   for `0002_seed.sql` through `0012_projects.sql` (11 rows,
   `applied_at = datetime('now')`) — matching verified reality, not
   re-running their content (which would have failed on the seed-data
   collision again).
5. Re-ran `wrangler d1 migrations list --remote` — now shows only
   `0013_artifact_provenance.sql` as pending, which is correct.

**No abort triggered — no mismatch found at any step.**

**Known follow-on, not fixed here:** `0013_artifact_provenance.sql`
itself will still fail if run via `wrangler d1 migrations apply` as-is —
its first statement (`provenance_source`) already exists on production
(added directly, out-of-band, in an earlier turn), so a straight
`ALTER TABLE ADD COLUMN provenance_source` will hit a duplicate-column
error. This is expected and tied to the still-open `provenance_freshness`
gap (blocked twice by the harness classifier, not retried a third time
per instruction) — once that column is added (manually, same as
`provenance_source` was), `0013` should be marked applied the same way
`0002`-`0012` were here, not re-run through the file as written.

**Files:** `backups/ferrum-os-data-2026-09-04-backup.sql` (local, not
committed — a production data dump does not belong in git history).

### (RULE 36(3) schema entries begin here)

### 2026-09-04 — Process friction: W2-372 UI_UX_MODERNIZATION silently removed a live tool (forensics, logged against W-16)

**Seat:** SCRIBE (forensics only — the fix itself is board row W-16,
assigned RIVET, not yet DONE).
**Row ID:** W-16 (LANDINTEL RESTORE).
**Finding, not a landing SHA:** `git log -S "ULPIN" -- apps/web/app/products/landintel/page.tsx`
followed by `git show` on each candidate commit identified
`331c1b081a06a16e851ef6969b90804c212fb542` ("feat: [land:w2-372-ui-ux-modernization] [AI: SCRIPT]",
2026-09-04 14:13:17 +0530) as the commit that replaced
`UlpinMapExplorer` (a real, D1-backed ULPIN/Bhu-Aadhaar lookup) with
`SteppedForecastModule` (a sample-data-only forecast slider) in the
LandIntel hero — not a repositioning, a removal of a working tool
presented under a "modernization" commit message that did not describe
itself as removing anything.
**Friction:** the sweep's own acceptance criteria (RATIFIED five-point
rubric per docs/WAVE_QUEUE.md's W2-372 row) checked design-direction
compliance but had no check for "does a previously-live tool still
exist after this lands" — the gap that let a real regression through a
fully-approved, gate-passing sweep. ATLAS's own audit for W2-372
evidently did not catch it either, since the removal reached
`origin/main` and stayed there until the operator's own live-site
observation surfaced it.
**What went well:** `git log -S` forensics located the exact commit and
timestamp in two commands, with no ambiguity — the append-only commit
history made the regression fully reconstructible after the fact, even
though no one had flagged it at landing time.
**Duration:** forensics only, ~10 minutes of investigation this turn.
**Refinement produced (RULE 36(4)):** AGENTS.md RULE 29 now carries a
Feature Conservation addendum, and `docs/LIVE_TOOLS_REGISTRY.md` was
created so ATLAS's audit battery has a standing regression check
against previously-live tools on every sweep/restyle row going forward
— not just rows that explicitly claim to touch a named tool.
