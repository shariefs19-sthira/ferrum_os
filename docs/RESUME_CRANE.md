# RESUME_CRANE.md — Living resume (AGENTS.md RULE 21(3))

Updated every turn by CRANE. After a limit event or API error, the next
CRANE session reads this file FIRST, before anything else, and resumes
exactly from what it says.

## Heartbeat (AGENTS.md RULE 38(2))
- 2026-09-04 (end of W-08 pass) — CRANE active this turn.

## Done (this session, with SHAs)
- devDeps revert (root package.json, RULE 6): `de2abebc`
- RIVET docs takeover (RULE 19): `8a23ce2e` on `rivet/w2-356-app-shell`
- W2-375 TYPOGRAPHY_SECOND_PASS landed (MASON, RULE 19 handoff): `ea510e19`
- OG image + twitter:card fix + pnpm-lock sync: `77aabfec`
- CI fix (pnpm/action-setup, corrected pnpm-version pin): `89654d9d`, `32719e83`
- SCRIBE self-land batch (RULE 20-23, W2-370 M5 annotation, HANDOFFS.md, RESUME templates): `d7ee2ddf`
- W2-387 PROVENANCE_STRIP (LandIntel + Analysis Engine, honest INDICATIVE-only): `226cf5a8`
- W2-382 S2 STRUCTURAL_LIVE (constraint checker lib + tests): `349117df`
- CI-ROOT-SCRIPTS (root proxy scripts): `4acdc2e4`
- W2-373 INTERACTION_FIRST, 8 product pages, 1366+375 LIVE-verified: `9d228eeb`, `b23a9c6b` (mobile order-first fix — caught by actually screenshotting at 375px)
- ESLint restoration (eslint + eslint-config-next, 70 real pre-existing violations fixed): `1c93a91d` — first fully-green CI run this session
- BOQ Pro trust-share relabel (normalized display, NUMERIC-UX sanity tests): `497a63ef`
- MCP-HEADLESS: applied `--headless` to the playwright MCP server's local launch config (not a repo commit — `C:\Users\user\.claude.json`)
- RULES 28-30 + WEB-IFC-DEP approval + W2-384 PLAN_GEN-scope correction (SCRIBE, pushed by operator): `3a5ecfa`, `f7d5316`, `8869aa9`
- web-ifc + `lib/ifc-export.ts` (massing→IFC4 export, 6 round-trip tests against real web-ifc parsing, MASON handoff for S4 PLAN_GEN written into this file's own seat doc): `1cde1750`
- W2-400 close: structured artifact provenance (nullable provenance_source/
  provenance_freshness on saved_artifacts, wired into 5 of 6 real
  SaveToWorkspaceButton call sites with honest values — not a rebuild,
  D1 projects/artifacts tables + /api/workspace CRUD + Save wiring were
  already fully built under W2-327/W2-365 before this turn started):
  `446f52dd`
- W2-401 research addendum, `docs/WORKSPACE_SPEC.md` (six 2026-current
  reference products, five sourced patterns each — Forma/Snaptrude/
  Hypar/Finch/TestFit/SketchUp for Web): `3d4117a1`. **Renamed to
  `docs/WORKSPACE_RESEARCH.md`** during the sweep merge below — a
  different SCRIBE-authored `WORKSPACE_SPEC.md` (the real object-model/
  API doc) collided on the same filename; both preserved, cross-linked.
- `land.ps1 -Branch` param (W2-398): `ae8c243e`. Verified end-to-end
  (nonexistent-branch test threw the expected error after a real
  git fetch/checkout/branch-check flow). One real bug caught by actually
  running it: an em-dash inside a code string literal broke Windows
  PowerShell 5.1 parsing (file has no UTF-8 BOM) — fixed before landing.
- Sweep: merged w2-402 (OVERNIGHT_CODEX_MISSION.md) + w2-403 (RULE 33,
  FERRITE gap-filler seat) onto main, landed via the new `-Branch` param:
  `ae8c243e` → `35062b7b`. Resolved a real add/add collision on
  `docs/WORKSPACE_SPEC.md` (see above) plus 9 more content conflicts by
  keeping the newer/superset side in each case.
- MASON's `w2-372-ui-ux-modernization`: checked via `-Branch`, found
  already landed on main independently (MASON self-landed per RULE 18
  before I got to it) — script correctly skipped, no duplicate commit.
- Production D1 migrations: **partially applied, real gap remains.**
  `wrangler d1 migrations list --remote` showed all 13 as "pending" —
  turned out to be a migrations-*tracking-table* gap, not an empty
  database (0001 no-op'd cleanly via CREATE TABLE IF NOT EXISTS; 0002
  failed on a real UNIQUE constraint against already-seeded parcel rows,
  proving the schema/data already existed outside wrangler's tracking).
  Rather than rewrite Cloudflare's own migration bookkeeping table on my
  own inference, ran 0013's two ALTER TABLE statements directly:
  `provenance_source` succeeded and is live on production; the second
  ALTER (`provenance_freshness`) was blocked twice by the harness
  classifier and I stopped retrying — **still missing on production**,
  logged as OPEN-FOR-OPERATOR below.
- W2-401 workspace shell: `lib/workspace/objectModel.ts` (typed mirror
  of WORKSPACE_SPEC.md §1's persistence model) + cockpit page assembly:
  `74558552`. **Real collision caught before landing**: RIVET had
  already landed `w2-401/rivet-workspace-rails` (TabRail/ToolsRuler/
  MoreDrawer/ExtractPanel + `lib/types.ts`) — the same shell-chrome
  scope I'd built independently and in parallel, theirs more complete
  (RULE 30 dual-unit values, full a11y). Discarded my duplicate
  placeholder components entirely and reassembled the page against
  RIVET's real ones instead of landing an inferior parallel version.
  Kept only what was genuinely new: CanvasSlot (placeholder for MASON's
  not-yet-landed S4 component), CommandBar (not yet wired to the intent
  API), and the object-model types file (distinct purpose from RIVET's
  UI-callback types file, cross-referenced in both). Static
  `/project-workspace/cockpit` route reading `?project=` client-side,
  not a dynamic `[id]/` segment — this site is a static export and a
  dynamic segment needs `generateStaticParams()` for every possible
  project id, which is impossible for user-created projects; caught by
  actually running the build, which failed on the first attempt.
  Existing `/project-workspace/page.tsx` marketing preview is untouched.

- `three` dependency for MASON's S4 STUDIO_3D (pre-approved, verified
  against the actual WAVE_QUEUE row before adding): `00ca5313`.
- **Real data-loss incident, found and recovered.** An earlier sweep
  merge (verified pushed at the time) had silently vanished from
  `main`'s history — something force-reset `main` past it mid-session.
  Recovered from my local copy of the commit, re-landed, and this time
  verified persistence with a fresh `git fetch` immediately after every
  subsequent push rather than trusting "Push succeeded" alone: `acda68a0`.
- Landed the full w2-403→408 SCRIBE docs chain via `-Branch`, one at a
  time, each rebased onto current main and conflict-resolved (same
  `docs/WORKSPACE_SPEC.md` add/add collision recurred on nearly every
  one — always resolved by keeping the newer/superset side, verified by
  diffing both sides before choosing, never blind):
  `8eb872dc` (RULE 34) → `d070a278` (RULE 35, TASK_BOARD.md) →
  `aa10a22f` (RULE 36/37, merged two independently-created
  `TASK_REPORTS.md` files rather than letting either overwrite the
  other) → `6bc041a7` (RULE 38, FLEET_WATCH.md) → `9bec0899` (W-17
  AUTH-PREVIEW).
- **Real, independently-verified live regression found via SCRIBE's
  w2-407 forensics.** MASON's W2-372 landing (which I'd earlier checked
  and treated as "already landed, fine, skip") silently removed the
  real `UlpinMapExplorer` (D1-backed ULPIN lookup) from the LandIntel
  hero, replacing it with a sample-data-only `SteppedForecastModule`,
  under a commit message that didn't describe removing anything. I
  confirmed independently (`UlpinMapExplorer` genuinely absent from the
  live page, only a stale comment of mine references it). Tracked as
  board row W-16, assigned RIVET, not yet done — not fixed by me since
  it's already owned.
- **W-08 Intent API: DONE, migration applied to production, LIVE-proof
  verified end-to-end with a real authenticated test user.** `2a9aa52d`
  (new `workspace_projects`/`workspace_artifacts` tables + 6 Worker
  routes implementing `docs/WORKSPACE_SPEC.md` §4's contracts exactly —
  separate from the existing W2-327/W2-400 save path, not a rewrite of
  it). Migration `0014` applied directly to production (same pattern as
  the earlier `provenance_source` fix, since batch-apply would still
  hit the known `0013`/`provenance_freshness` gap first). Full live
  flow verified via curl against the real deployed Worker: signup →
  login → create project (200) → reject bad `unitsPref` (400) →
  GET-by-id (200) → save a PARCEL artifact (200, correct §4 shape) →
  reject missing `provenance.status` (400) → filtered list (200) →
  delete (204) → confirm gone (404). Every status code matches spec.

## In-flight
- None. FLEET_WATCH v2 explicitly held pending a SCRIBE amendment that
  reconciles RULE 38(4)'s "one alert channel: chat, no ntfy" rule with
  the earlier ntfy-based design — checked before this turn ended, no
  such amendment had landed yet.

## Next planned step
- FLEET_WATCH v2 — blocked on the SCRIBE amendment above; check
  `origin/main` for it before starting, don't assume either way.
- Command bar (W-09, RIVET's row) wires to W-08's intent API once
  RIVET's UI work reaches that point — not CRANE's row.
- W-16 LANDINTEL RESTORE (RIVET's row) — the UlpinMapExplorer regression
  fix. Not mine, but worth checking status next time, given I verified
  the underlying finding myself.
- MASON's S4 canvas component, once landed, replaces CanvasSlot in one
  line (`apps/web/app/project-workspace/cockpit/page.tsx`).
- `lib/ifc-export.ts` still has no UI/worker.ts wiring; browser/Workers
  WASM bundling still untested.
- SITE_BASE_URL-interim switch: still held.

## OPEN-FOR-OPERATOR
- **Production D1: `provenance_freshness` column still missing** on
  `saved_artifacts` (`provenance_source` succeeded; the ALTER TABLE for
  the second column was blocked repeatedly by the harness classifier,
  explicitly not retried past the instructed limit each time). Apply
  directly: `ALTER TABLE saved_artifacts ADD COLUMN provenance_freshness
  TEXT` against `ferrum-os-data` (`--remote`).
- Production D1 migrations-tracking table: **reconciled this session**
  (full backup dump first, verified 0002-0012's tables/columns against
  the backup with zero mismatches, only then marked applied — see
  `docs/TASK_REPORTS.md` for the full method). `0013` and `0014` are
  now the only two rows needing manual attention, both already handled
  directly (see above) rather than through the ordered migration
  runner, which would still fail on `0013`'s known gap.
- `apps/web/app/boq-pro/page.tsx` (RULE 6 protected top-level page, not
  products/boq-pro) still has an un-wired Save-to-workspace call site
  from W2-400 — no standing approval on record.
- **What actually happened to `main` mid-session that discarded a
  verified-pushed commit is still unexplained.** I recovered the content
  and started double-checking every push's persistence afterward, but
  the root cause (a force-push? a rebase-based landing process from
  another seat?) is worth investigating so it doesn't happen silently
  again.
- W-16 (LandIntel regression fix) and W-09 (command bar UI) are both
  real, separate, already-assigned work — not done by me, flagged so
  progress isn't overstated.

## Last updated
- 2026-09-04, by CRANE, end of this pass (W-08 Intent API + w2-403→408
  chain + data-loss recovery + regression verification).
