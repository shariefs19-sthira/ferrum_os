# RESUME_CRANE.md — Living resume (AGENTS.md RULE 21(3))

Updated every turn by CRANE. After a limit event or API error, the next
CRANE session reads this file FIRST, before anything else, and resumes
exactly from what it says.

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

## In-flight
- None landed yet this turn beyond W2-400. The rest of the "overnight
  order" (research addendum, assistant intent API, W2-401 shell v1,
  conditional 372-sweep takeover) has NOT been started — see OPEN-FOR-
  OPERATOR below for why, rather than silently claiming partial/fake
  progress on it.

## Next planned step
- Research addendum (SketchUp Web/Forma/TestFit/Finch/Hypar/Snaptrude,
  five patterns each) — not started.
- Assistant intent API design (add-floor/set-setback/show-BOQ/
  check-structura/save/switch-tab/units) — not started.
- W2-401 shell v1 per the operator sketch — not started. This is a large,
  multi-surface UI build (3D space, tab rail, TOOLS ruler, MORE drawer,
  DATA-EXTRACT panel, command bar, autosave, exports) — treating it
  honestly as several turns of real work, not one.
- W2-354/W2-372 status: `origin/main` moved to MASON's W2-354 landing
  (`8e35756d`) mid-session without my involvement — worth checking
  W2-372's actual landing status before any "sweep takeover ONLY if not
  on main" decision, rather than assuming either way.
- `lib/ifc-export.ts` still has no UI/worker.ts wiring; browser/Workers
  WASM bundling still untested.
- SITE_BASE_URL-interim switch: still held.

## OPEN-FOR-OPERATOR
- `apps/web/app/boq-pro/page.tsx` (RULE 6 protected top-level page, not
  products/boq-pro) has a Save-to-workspace call site W2-400 deliberately
  did not touch — no standing approval on record for this session to
  modify that path. Needs an explicit yes/no if provenance wiring there
  matters.
- `RULE 31` cited as "ACTIVE tonight" was not found on `origin/main` when
  checked (same as RULE 25/27/28/29 earlier this session, all of which
  later turned out to be real but not-yet-landed at the time of citation)
  — proceeding on its substance (log opens, don't block) regardless,
  since that's reasonable for unattended work either way, but flagging
  per the standing "disk-check first" discipline.
- The full overnight scope (research addendum + intent API + W2-401
  shell v1) is multiple turns of real work, not completable in one. This
  turn delivered W2-400 only. Confirm whether to continue immediately
  into the research addendum next, or reprioritize.

## Last updated
- 2026-09-03, mid-overnight-window, by CRANE (W2-400 turn).
