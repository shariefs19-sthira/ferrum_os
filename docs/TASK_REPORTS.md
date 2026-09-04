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

### 2026-09-04 — W-20 IFC export bundle-safety gate: Step 1 (test), result FAIL

**Seat:** CRANE.
**Row ID:** W-20.
**Landing SHA:** none — this is a test result, not a code landing. No
production files were changed to run it (a throwaway entry point +
throwaway `wrangler.jsonc` outside `apps/web`, deleted after the run).
**RULE 25 live proof:** the test itself is the proof — a real
`wrangler deploy --dry-run` bundle build, not a local guess or a read
of the source. Reproducible command: point a minimal Worker entry at
only `exportMassingToIfc` (never `countIfcGeometry`/`getWebIfc`) and
run `wrangler deploy --dry-run --outdir=<dir>`.

**Result: FAIL.** The build errors before it can even attempt
tree-shaking:

```
X [ERROR] Could not resolve "module"
    apps/web/lib/ifc-export.ts:298:41:
      298 | const { createRequire } = await import('module')
The package "module" wasn't found on the file system but is built into node.
```

Confirms the row's own stated risk exactly: `getWebIfc()`'s
`createRequire`/`import('module')` call is not tree-shaken away even
though the test entry point never imports or calls it — the bundler
statically resolves dynamic `import()` expressions for every module
reachable in the same *file*, not just the same call graph, so living
in the same file as `exportMassingToIfc` is enough to break the bundle
regardless of whether `getWebIfc` is ever actually invoked.

**Per the row's own decision rule: test failed → MASON's original
browser-only-writer proposal proceeds**, the reuse premise (wire the
existing writer in as-is) is false as the file is currently structured.

**Worth flagging for whoever picks this up, not a recommendation to
skip the rewrite:** the failure is specifically caused by file
*co-location*, not by the writer path (`exportMassingToIfc`,
`StepWriter`, etc.) itself needing Node — that code is plain string
generation with zero imports beyond `TextEncoder`. A much smaller fix
than a full rewrite — splitting `getWebIfc()`/`countIfcGeometry()` into
their own file, separate from the writer functions — would likely also
pass this same test. Not verified (out of this row's envelope, which is
test-only, no production changes until the gate result was known, and
the result is now known: fail, proceed to MASON's proposal per the row
text). Surfacing it so the decision-maker has the full picture, not
just the binary pass/fail.

**Friction:** none — the row's acceptance criteria were concrete and
directly testable; no ambiguity about what "pass" or "fail" meant going
in.
**What went well:** the row anticipated the exact failure mode in
advance (SCRIBE's own disk-read of `lib/ifc-export.ts` flagged
`getWebIfc()`'s `createRequire` call as the risk to test, before any
test was run) — the test confirmed a specifically-predicted risk rather
than fishing for an unknown one.
**Duration:** ~15 minutes (test entry point + config, one `wrangler
deploy --dry-run` run, cleanup).

### 2026-09-04 — Save-path 200 verified on live edge (provenance_freshness reconciliation, W2-400/W-01)

**Seat:** CRANE.
**Row ID:** W2-400 / W-01 (save-path/migration line).
**Landing SHA:** none — this is a live-edge verification + a tracking-table
reconciliation (`d1_migrations` row insert), not a code landing. No
application code changed.
**RULE 25 live proof (real, not assumed):**
1. `PRAGMA table_info(saved_artifacts)` against remote D1 — confirmed 8
   columns, both `provenance_source` and `provenance_freshness` present.
   The operator's claim was true this time (earlier claims of the same
   shape were checked and found false — this one checked out).
2. Created a real throwaway test user via `POST /api/auth/signup`, then
   `POST /api/auth/login` to obtain a real session cookie — not a
   fabricated or assumed auth bypass (`requireUser()` is real
   cookie-session auth with no bypass; checked the code first).
3. `POST /api/workspace/artifacts` with that session cookie, body
   including `provenance_source`/`provenance_freshness` — **200 OK**,
   response echoed both fields with a real generated `id`.
4. Independently confirmed the row actually persisted by querying
   `saved_artifacts` directly by that `id` in remote D1 (not trusting the
   200 response alone) — row present, both provenance fields correct,
   real `created_at`.
5. Cleaned up all test residue from production: deleted the test
   artifact row, the session, the `verification_tokens` row (created by
   signup's email-verify flow — first delete attempt on `users` hit a
   real `FOREIGN KEY constraint failed`, traced to this table via
   `migrations/0007_auth.sql`, not guessed), then the test user itself.
   Re-verified no lingering rows.
6. `d1_migrations` tracking table still showed `0013_artifact_provenance.sql`
   as pending despite the schema already matching it exactly — the same
   tracking-table/schema gap documented in the earlier
   pre-RULE-36 reconciliation entry above, and exactly the follow-on that
   entry flagged as not-yet-fixed. Reconciled the same verified way (row
   already true in schema → insert the tracking row directly, do not
   re-run the file, which would fail on `provenance_source` already
   existing). `wrangler d1 migrations list --remote` now reports "No
   migrations to apply" — fully reconciled, 13/13.

**Result: PASS.** Save path is genuinely 200 on live edge, with a real
authenticated write verified independently in D1, not just via the API
response. ATLAS battery step 1 is unblocked on real evidence.

**Friction:** the operator's PRAGMA claim had been wrong on the two prior
checks this session and only came true on this one — worth noting for
calibration, not a criticism, since every check was still verified
independently before acting on it either way.
**What went well:** having no login/session shortcut forced a genuine
end-to-end test (real signup → real session → real write → real DB
read) instead of a shallow unauthenticated ping that would have proven
nothing about the actual code path that was previously 500ing;
cleanup left zero residue in production.
**Duration:** ~20 minutes (PRAGMA check, signup/login, write, DB
verification, cleanup, migrations reconciliation, report).
