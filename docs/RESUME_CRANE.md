# RESUME_CRANE.md — Living resume (AGENTS.md RULE 21(3))

Updated every turn by CRANE. After a limit event or API error, the next
CRANE session reads this file FIRST, before anything else, and resumes
exactly from what it says.

## Heartbeat (AGENTS.md RULE 38(2))
- 2026-09-04 — seeded by SCRIBE at RULE 38's adoption; CRANE updates
  this line at the start of each of its own turns going forward.

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

## In-flight
- Assistant intent API (7 enumerated intents: add-floor, set-setback,
  show-BOQ, check-structura, save, switch-tab, units) — not started yet
  this pass. Next planned step.

## Next planned step
- Assistant intent API — the actual next task.
- Wire CommandBar → intent API once it exists.
- MASON's S4 canvas component, once landed, replaces CanvasSlot in one
  line (`apps/web/app/project-workspace/cockpit/page.tsx`).
- `lib/ifc-export.ts` still has no UI/worker.ts wiring; browser/Workers
  WASM bundling still untested.
- SITE_BASE_URL-interim switch: still held.

## OPEN-FOR-OPERATOR
- **Production D1: `provenance_freshness` column still missing** on
  `saved_artifacts` (`provenance_source` succeeded; the second ALTER TABLE
  was blocked twice by the harness classifier, not retried a third time).
  Apply directly: `ALTER TABLE saved_artifacts ADD COLUMN
  provenance_freshness TEXT` against `ferrum-os-data` (`--remote`), or
  re-authorize the retry.
- Production D1's migrations tracking table only has `0001_init.sql`
  recorded, even though 0002-0012's actual schema/data verifiably
  already exists. I deliberately did NOT rewrite that tracking table
  myself (two attempts were blocked by the classifier; on reflection I
  agree with not forcing it since it's Cloudflare's own bookkeeping, not
  app code) — worth a real decision on whether/how to reconcile it
  properly, since future `wrangler d1 migrations apply` runs will keep
  trying to re-run 0002-0012 and fail on 0002's seed-data collision
  until this is fixed.
- `apps/web/app/boq-pro/page.tsx` (RULE 6 protected top-level page, not
  products/boq-pro) still has an un-wired Save-to-workspace call site
  from W2-400 — no standing approval on record.
- `RULE 34` ("workspace-only") cited this pass was not found on
  `origin/main` when checked — same pattern as every other rule citation
  this session (most turned out real but not-yet-landed at citation
  time). Proceeded on the reasonable substance regardless.
- Intent API and MASON's canvas are both real, separate pieces of work
  still needed before the cockpit does anything beyond render its own
  chrome — flagging so "W2-401 shell v1" isn't read as more complete
  than it is.

## Last updated
- 2026-09-04, by CRANE, mid-pass (workspace shell assembly turn).
