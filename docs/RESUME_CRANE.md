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

## In-flight
- None. `-Branches` param explicitly skipped this window per CRANE's
  instruction (W2-398 queued for it instead).

## Next planned step
- W2-398 (branches param — deferred, not started)
- CI lint is green, but the full `pnpm lint`/`type-check`/`test`/`build`
  chain has never been re-verified after the web-ifc landing — worth a
  CI status check on `1cde1750` before building further on top of it.
- `lib/ifc-export.ts` has no UI/worker.ts wiring yet and browser/Workers
  WASM bundling is explicitly untested (see the handoff note above in
  this same file) — whoever wires it in next should check that first.
- SITE_BASE_URL-interim switch: still held, per standing operator instruction.

## Current blockers
- None open. ESLint CI gap (this session's long-running blocker) is
  resolved as of `1c93a91d`.

## Last updated
- 2026-09-03, end of this CRANE session (pre-dark), by CRANE.
