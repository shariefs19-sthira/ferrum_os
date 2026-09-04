# TASK_REPORTS.md

Task-wise reports, one section per discrete task, newest first. Append-only.

## 2026-09-04 — Production D1 migration-tracking reconciliation (verified one-time)

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
