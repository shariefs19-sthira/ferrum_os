# Ferrum OS — Technical Meeting Report

Authored by ATLAS, per RULE 40 (facts-only reporting). Every claim below
cites a SHA on `origin/main`, a file path, a live-edge response, or an
actual command output. Anything not found on disk is marked **UNKNOWN**
rather than inferred or assumed. Snapshot taken at `origin/main` commit
`689c0377` (2026-09-05 10:18:41 +0530).

RULE 47 was cited as the authority for this report's format; it does not
exist in `AGENTS.md` as of this snapshot (checked: `grep -n "RULE 47"
AGENTS.md` — no match). Proceeding on the report's own explicit content
spec instead of that citation.

---

## 1. Executive Summary

Ferrum OS is an India-first, AI-native construction platform spanning
land intelligence, design, structural checks, BOQ estimation, procurement,
and project finance — deployed as a static Next.js export served from a
Cloudflare Worker, backed by D1 (SQLite at the edge). It is built and
operated by a multi-seat AI agent fleet (CRANE, MASON, RIVET, SCRIBE,
ATLAS, FERRITE, PI) coordinating through a git-branch pull-queue and a
set of 47 written operating rules (`AGENTS.md`), landing continuously to
a single production Worker.

The current center of build effort is the **Project Workspace cockpit** —
a command-first, 3D-canvas interface (SUTRA conversational panel, tab
rail across 10 products, tools ruler, data-extract panel) intended to
replace slider-driven forms with a conversational/guided-option flow
over deterministic engines (never an LLM inventing a number).

---

## 2. LIVE NOW

Deployed edge: `https://ferrum-os.shariefsatyala.workers.dev`

| Capability | Status | Evidence |
|---|---|---|
| ULPIN lookup + provenance chips | **LIVE** | `apps/web/components/sections/UlpinMapExplorer.tsx`; provenance strip wired W2-387 (`226cf5a8`) |
| Cockpit — 10-product tab rail | **LIVE (route)** | `apps/web/components/workspace/TabRail.tsx`; route flip landed `86ef5791` ("W-26 ROUTING_FLIP") |
| three.js canvas, 3 synced viewports | **UNKNOWN — "3 synced viewports" not verified** | `three` dep present (`apps/web/package.json`, `^0.185.1`); MASON's `RESUME_MASON.md` logs FPS/draw-call probes but does not describe a 3-viewport sync; not independently confirmed live by ATLAS this pass |
| Command bar + voice | **LIVE (component), voice = Web Speech API with fallback** | `SutraPanel.tsx`: `SpeechRecognition`/`webkitSpeechRecognition` with an honest "Voice input is unavailable here" fallback message when absent |
| Option chips (guided flow) | **NOT CONFIRMED LIVE** — `docs/TASK_BOARD.md` row W-28 GUIDED_OPTIONS status: READY (not DONE) as of this snapshot |
| Data extract, dual units | **PARTIAL** — `ExtractPanel` component exists and is wired (`cockpit/page.tsx`); RULE 30 dual-unit requirement not independently re-verified live this pass |
| DXF export | **LIVE per MASON's log**; **IFC export LOCKED** — `RESUME_MASON.md`: "IFC export is LOCKED: importing `lib/ifc-export.ts` into the client bundle fails with `Module not found: Can't resolve 'module'`. The cockpit exposes no dead IFC control; it labels IFC queued and keeps DXF real." |
| Artifact save/share/rename/delete | **Save/Share: LIVE, independently verified by ATLAS** (this session, prior turn): `POST /api/workspace/artifacts` → 200; Share button on `/project-workspace/projects` generates a `/shared?token=` link that resolves with no auth. **Rename/delete: NOT independently verified this pass.** |
| Product-page cockpit previews | **10 of 10 product pages carry `ProductHeroPreview` or a real tool in-hero** (landintel, structura, boq-pro, promarket, investflow, communitybuild, designstudio, transact have a real tool per W2-373 `9d228eeb`; buildos, procurehub correctly show `ProductHeroPreview`'s honest "Roadmap" state, no real backend) |
| SUTRA panel | **LIVE, component confirmed on disk** (`apps/web/components/workspace/SutraPanel.tsx`, mounted in `cockpit/page.tsx`) — carries a visible **"DEMO · INDICATIVE"** chip; routes every input through a deterministic-engine placeholder (`answer()` function — canned responses + citations), not an LLM; idle auto-demo pauses under `prefers-reduced-motion` |
| Preview-mode banner (W-17 AUTH-PREVIEW) | **LIVE, independently verified by ATLAS** (prior session): `/signup` and `/login` — zero `type="password"` fields, preview-gate copy "Accounts arrive with the live release — explore everything now in preview" confirmed present |

---

## 3. Implementation % per Module

Computed as `DONE rows / (DONE + OPEN/READY/ROADMAP rows)` for rows
identifiably belonging to each module in `docs/WAVE_QUEUE.md` (270 total
`W2-` rows, 169 marked `DONE` — **62.6% of all logged rows**, platform-wide)
and `docs/TASK_BOARD.md` (Workspace-focus rows, RULE 34). This is a
row-count proxy, not a weighted/LOC measure — flagged as such.

| Module | DONE | Open/Roadmap | % | Basis |
|---|---|---|---|---|
| Cockpit UI (Workspace board) | 5 (W-08, W-17, W2-354, W2-373 landed rows, W-26 per commit fact) | ~24 READY rows (W-27/28/29/30/33/34/etc.) | **~17%** | `docs/TASK_BOARD.md` row count |
| Agent (SUTRA / Concierge) | 2 (W2-307 Concierge, SUTRA component landed per disk) | W-27 (conversational-primary), W-31 (LLM layer, ROADMAP-LABEL) | **UNKNOWN precise %** — SUTRA is a demo/indicative shell, not the "grounded" agent W-31 specifies | `docs/TASK_BOARD.md`, `SutraPanel.tsx` |
| Knowledge base / rates | 1 real engine live (`lib/rateEngine/ferrumRateEngine.ts`, W2-312) | W-29 KNOWLEDGE_BASE (READY, not started) | **UNKNOWN %** | `docs/TASK_BOARD.md` W-29 |
| Compliance | 0 confirmed landed under this name | W-24 COMPLIANCE_ENGINE referenced as a dependency by W-27/28/33, no landed-SHA row found for W-24 itself in this snapshot | **0% or UNKNOWN** — W-24's own row text not located in `docs/TASK_BOARD.md` as printed (only referenced as a Deps entry) |
| Geospatial | Real: `UlpinMapExplorer` (Leaflet/OSM), `lib/tileSources/eoxTileAdapter.ts` (stub, license-gated) | EOX satellite imagery: **NOT LIVE** — `REQUIRES_PAID_LICENSE`, `fetchFootprints` always returns `null` | **Partial** |
| Exports | DXF live (per MASON log); IFC locked | W-06 ExportBar row: READY | **Partial (DXF only)** |
| Auth | Backend DONE (W2-326, `4ef78791`, PBKDF2/WebCrypto); frontend hidden by design (W-17) | W2-409 REAL_AUTH_RELIVE: `ROADMAP-LABEL` | **Backend 100%, frontend intentionally 0% (by directive, not a gap)** |

---

## 4. Tech Stack

| Layer | Value | Source |
|---|---|---|
| Framework | Next.js `^14.1.0`, static export (`output: 'export'`) | `apps/web/package.json`, `apps/web/next.config.js` |
| Hosting | Cloudflare Workers (thin Worker serving the static export + API routes) | `apps/web/worker.ts` (1,100+ lines, 60 route handlers by literal `app.get/post/patch/delete` count) |
| UI | React `18.2.0` | `apps/web/package.json` |
| Language | TypeScript `^5.3.3` | `apps/web/package.json` |
| 3D | `three` `^0.185.1` | `apps/web/package.json` |
| BIM export | `web-ifc` `^0.0.77` (writer path only; round-trip verification path is Node-only and excluded from the browser bundle per `lib/ifc-export.ts`'s own comments) | `apps/web/package.json`, `apps/web/lib/ifc-export.ts` |
| Database | D1 (SQLite at the edge), **14 migration files** on disk (`migrations/0001`–`0014`), reconciled 13/13 applied against production per `docs/TASK_REPORTS.md`'s 2026-09-04 entry (`0013`/`0014` applied directly, tracking table reconciled) | `migrations/*.sql`, `docs/TASK_REPORTS.md` |
| Maps | Leaflet `1.9.4` + OpenStreetMap tiles | `apps/web/package.json` |
| Voice | Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`), browser-native, no external service | `apps/web/components/workspace/SutraPanel.tsx` |
| Test harness | Vitest (unit) + Playwright (E2E/live-edge) | `apps/web/__tests__/**`, prior-session live Playwright runs against the deployed edge |
| Deploy tool | `wrangler` | referenced throughout `docs/RESUME_CRANE.md`, `docs/TASK_REPORTS.md` |
| Package manager | pnpm (workspace monorepo) | root `package.json` scripts (`pnpm --filter ./apps/web ...`) |
| Dev process | Multi-worktree git fleet — **70 active `git worktree` entries** at time of writing (one per in-flight seat task), coordinating through `origin/main` and a pull-queue board | `git worktree list` output, this session |

---

## 5. Architecture

- **Deterministic engines, not LLM-driven numbers.** Every computed
  figure (rate bands, IRR/NPV, structural checks, feasibility score,
  IFC/DXF geometry) comes from a pure-function engine in `apps/web/lib/`
  (`rateEngine/`, `analysis/`, `studio/structuralLive.ts`,
  `ifc-export.ts`), independent of any conversational layer.
- **Intent API.** `apps/web/worker.ts` implements `docs/WORKSPACE_SPEC.md`
  §4/§5's contracts: `POST/GET/PATCH/DELETE /api/workspace/projects`,
  `POST/GET /api/workspace/projects/:id/artifacts` — landed at `2a9aa52d`
  ("W-08 Intent API"), independently verified live by ATLAS this session
  (full 8-call sequence, every status code matched spec).
- **ONE-LIBRARY catalog** — **NOT FOUND** under this name anywhere in
  the repo (`grep -rin "one.library" apps/web docs` — zero hits). The
  closest existing artifact is `apps/web/lib/rateEngine/catalogTypes.ts`,
  which is a materials/rate catalog type file, not confirmed to be the
  same thing this term refers to. **Marked UNKNOWN.**
- **RATE_ENGINE adapters** — the real engine is
  `apps/web/lib/rateEngine/ferrumRateEngine.ts` (W2-312, govt/market/user
  weighted P25/P50/P75 band); "adapters" plural is not a confirmed
  architectural pattern on disk under that name — **UNKNOWN** beyond the
  single engine file's existence.
- **SUTRA 3-layer agent** — **UNKNOWN as a documented 3-layer
  architecture.** What exists on disk is a single-file UI component
  (`SutraPanel.tsx`) that pattern-matches keywords (`setback`,
  `span`/`load`/`struct`) to canned responses with citations, explicitly
  labeled "DEMO · INDICATIVE." No 3-layer design doc was found in
  `docs/` under a SUTRA-specific filename.
- **Region-law layout.** `docs/TASK_BOARD.md`'s notes describe an
  evolving "region law" for the cockpit: originally top-strip tabs +
  right tools ruler + center 3D space + bottom-left drawer + bottom-wide
  extract panel (5 regions, per W-26); W-33 adds a 6th region, a
  left-edge side panel, present only when a project has a source parcel.
  RULE 41(1) additionally specifies a responsive reflow below 768px:
  side panel → drawer, tools ruler → bottom sheet, extract panel → swipe
  cards.
- **Fullscreen** — a `mason/w47-cockpit-fullscreen` worktree/branch
  exists (`git worktree list`), implying fullscreen work was done under
  a W-47 row; **the row's own text was not located in the current
  `docs/TASK_BOARD.md` printout** (only rows through W-34 plus W-01–W-20
  are listed there) — **status UNKNOWN**, flagged rather than assumed
  done or pending.
- **Honesty rules cited (29/30/40):**
  - **RULE 29 — Numeric-UX sanity:** any UI rendering numbers/shares
    must sum correctly and display exactly what was computed, self-checked
    at build time, audited by ATLAS. Verified in practice this session
    against BOQ Pro's trust-share sliders (`497a63ef`) — 6/6 unit tests
    green, live drag-tested, always summed to 100.
  - **RULE 30 — Unit duality:** every length/area value shows both
    metric and local units simultaneously (m/ft; sqm/sqft/cents/guntha/
    ground/acre), never single-unit-with-toggle.
  - **RULE 40 — Facts-only reporting:** a report may only cite a SHA on
    `origin/main`, a deployed SHA + live response, an actual gate/test
    output, or a named blocker — nothing else counts as fact. This
    report is written under that rule.

---

## 6. Work-Done Ledger (condensed, W-rows → SHAs)

| Row | Title | SHA | Note |
|---|---|---|---|
| W2-326 | AUTH_COMPLETE (backend) | `4ef78791` | PBKDF2/WebCrypto, sessions, verify/reset |
| W2-373 | INTERACTION_FIRST (8 product pages) | `9d228eeb` | Live-verified 1366+375 |
| W2-387 | PROVENANCE_STRIP | `226cf5a8` | LandIntel + Analysis Engine |
| W2-400 | Structured artifact provenance | `446f52dd` | Migration `0013`, wired 5/6 call sites |
| W-08 | Intent API | `2a9aa52d` | Independently verified live, this session |
| — | web-ifc + `lib/ifc-export.ts` | `1cde1750` | 6/6 round-trip tests, verified live-run by ATLAS |
| — | BOQ Pro trust-share relabel | `497a63ef` | 6/6 tests, verified live-drag by ATLAS |
| W-26 | ROUTING_FLIP (cockpit becomes default) | `86ef5791` | Commit-fact confirmed; SCRIBE/CRANE flagged live-edge check as not independently done at seed time |
| W-17 | AUTH-PREVIEW | `ef2f0440` (per `RESUME_MASON.md`; authored `7e4fe6fa`) | Verified live 375/1366, 6/6 headless checks per MASON |
| W2-354 | RESPONSIVE_SWEEP | `8e35756d` | Deployed responsive canaries verified per MASON |
| Task B | Battery-fail fixes (artifact-appears, share) | `668321b5` | Independently re-verified by ATLAS this session (corrected route, both PASS) |
| W2-401/W-27/W-28 | Cockpit route flip + W27/28 in-flight | `525430b2`, `56aa85fd`, `4ad714ed`, `a3518cef` (w36 product-page work) | W-27/28 command-first UI per `RESUME_MASON.md`: "implemented and locally gated," not yet independently live-verified by ATLAS |
| W-16 | LANDINTEL RESTORE | **NOT YET LANDED** | `docs/TASK_BOARD.md` status: READY. ATLAS confirmed live as of last check: `ulpin-map-input` absent from `/products/landintel` |

Full ledger of record: `docs/WAVE_QUEUE.md` (270 rows, 169 `DONE`) and
`docs/TASK_BOARD.md` (Workspace-focus board, RULE 35).

---

## 7. Work-To-Do

**Current priority (from `docs/TASK_BOARD.md`, READY rows not yet DONE):**
1. W-16 LandIntel restore (RIVET) — real ULPIN lookup still missing from
   live hero as primary tool.
2. W-27/28 command-first UI + guided options — in-flight per MASON,
   not yet landed/live-verified.
3. W-32a/b/c — battery-fail fixes for artifact-appears, extract-updates,
   share-opens (partially re-verified fixed by ATLAS this session —
   artifact-appears and share now PASS on the correct route;
   extract-updates still FAIL as of last battery run).
4. W-34 PERF_INFRA — `budgets.json` + Lighthouse CI: **NOT YET ON DISK**
   (`find . -iname budgets.json` — no match at this snapshot); RULE 41's
   numeric budgets exist only as text in `AGENTS.md`, not as an enforced
   CI gate yet. MASON's log confirms budgets were "applied directly" by
   hand for W-27/28 pending this file's landing.
5. W-06 ExportBar (IFC) — blocked on W-20's bundle-safety gate, which
   **FAILED** (`getWebIfc()`'s Node-only `createRequire` call is pulled
   into the client bundle); MASON's browser-only rewrite proceeds per
   that row's own decision rule.

**Roadmap (explicitly deferred, not scheduled):**
- W-31 GROUNDED_LLM_LAYER — retrieval-augmented language layer over the
  deterministic engine, gated on a not-yet-approved LLM-seat trial.
  Status: `ROADMAP-LABEL`.
- Vendor price APIs — **not found as a named row or module on disk**;
  UNKNOWN scope/status.
- EOX satellite imagery — schema/contract stub only
  (`REQUIRES_PAID_LICENSE`); becomes live only if the operator purchases
  EOX's "Commercial Attribution-RestrictedUse 1.1" license.
- Real ULPIN data (replacing the current sample/indicative parcel set) —
  no landed row found under this name; tracked implicitly by every
  "INDICATIVE" / "sample" label across LandIntel components.
- Real auth frontend re-exposure — W2-409 REAL_AUTH_RELIVE,
  `ROADMAP-LABEL`, deferred until an operator-set "live release"
  milestone.

---

## 8. QA

**8-step cockpit battery (ATLAS, most recent full run this session,
against `origin/main` HEAD at the time, post Task-B fix, corrected
route):**

| Step | Result |
|---|---|
| Matrix @375/768/1024/1366/1920 no-overflow | PASS (5/5) |
| Budget — cockpit route first-load JS ≤600kB gz (RULE 41(3)) | **PASS — 104 kB**, per `next build`'s own route table (authoritative; supersedes an earlier same-session Playwright network-sum measurement of 974.7kB, which double-counted shared chunks across repeated navigations in that script rather than reflecting one real first load) |
| Budget — nav/LCP-proxy <2500ms | PASS (1480ms) |
| 1. Save → 200 | PASS |
| 2. Artifact appears | PASS (corrected to `/project-workspace/projects`) |
| 3. Tab switch | PASS |
| 4. Tool mutate | PASS |
| 5. Extract updates | **FAIL** |
| 6. Command bar executes | PASS |
| 7. Exports download | PASS |
| 8. Share opens / link generated | PASS |
| 8b. Shared link resolves, no-auth | PASS |

**RULE 41 matrix/budgets (as written in `AGENTS.md`, not yet CI-enforced
— `budgets.json` absent):** widths 320/375/414/768/1024/1366/1920 +
landscape 375; touch targets ≥44px; initial JS ≤350KB gz (cockpit route
≤600KB gz, `three` lazy-loaded); LCP ≤2.5s on 4G floor; CLS ≤0.1; INP
≤200ms; main-thread task ≤50ms; draw calls ≤200; FPS ≥30 floor-device/
degradation-profile, ≥60 desktop-class.

**FPS / draw-call numbers (MASON, local probes, `docs/RESUME_MASON.md`,
not yet independently re-verified by ATLAS):**
- Reduced/software rendering profile: **60 FPS / 9 draw calls**
- Full D3D11 GPU profile: **60 FPS / 42 draw calls**

**ATLAS's own headless FPS probe (prior session, cockpit page, Playwright
on a virtualized/no-GPU sandbox — explicitly not representative of real
device FPS):**
- 1366×900: 11.0 fps (22 frames / 2005ms)
- 375×667: 19.3 fps (39 frames / 2024ms)

**Test counts:** 15 test files under `apps/web/__tests__/**`
(`find apps/web/__tests__ -name "*.test.ts*" | wc -l`). Individually
verified this session by direct run: `trustShares.test.ts` (6/6 pass),
`ifcExport.test.ts` (6/6 pass, real `web-ifc` parse round-trip,
211ms). Total test count across all 15 files not re-run in full this
pass — CRANE's logs cite "103/103" and later "115/115" and "109/109" at
different points in session history; **exact current total: UNKNOWN**
without a fresh full run.

---

## 9. Known Gaps + Legal Constraints

- **Sample data status.** Every parcel/rate/rule figure surfaced today is
  explicitly labeled INDICATIVE, TEST MODE, or ROADMAP where it isn't
  backed by a real registry — this is a standing, audited convention
  (RULE 5/29), not an oversight. SUTRA's own citations carry the same
  discipline verbatim: `"2026.1-SAMPLE · Indicative Karnataka DCR/FAR
  structure; not published authority text."`
- **EOX satellite imagery license.** Recent Sentinel-2 cloudless
  vintages are CC BY-NC-SA 4.0 (non-commercial only); commercial use on
  Ferrum OS requires EOX's paid "Commercial Attribution-RestrictedUse
  1.1" license, **not currently purchased**. The adapter is a stub that
  always returns `null` rather than fetching under a license not held.
- **No-fabrication policy.** Enforced by RULE 40 (this report) and RULE
  29 (numeric UI); demonstrated in practice multiple times this session
  — e.g. BOQ Pro's page copy explicitly distinguishes what its own
  ThreeModeCalculator does vs. what a separate, disconnected legacy tool
  does, rather than making a platform-wide claim.
- **Production D1 migration tracking** — reconciled 13/13 per
  `docs/TASK_REPORTS.md`'s 2026-09-04 entry, but the **root cause of an
  earlier "verified-pushed commit vanished from `main`'s history" data-loss
  incident is still unexplained** per `docs/RESUME_CRANE.md`'s own
  OPEN-FOR-OPERATOR note.
- **IFC export is currently non-functional in the browser bundle**
  (Node-only `module` resolution error) — DXF is the only real, working
  export format right now.
- **`budgets.json` (RULE 41's CI enforcement mechanism) does not exist
  on disk yet** — the perf gate is currently honor-system/manual, not
  CI-blocking.

---

## 10. Fleet & Process

- **Seats:** ATLAS (architect/auditor), CRANE (executor/lander), MASON
  (UI/UX + 3D), RIVET (mobile + docs, exclusive `apps/mobile/**`/`docs/**`),
  SCRIBE (docs/queue), FERRITE and PI (seat doc files present:
  `docs/seats/FERRITE.md`, `docs/seats/PI.md` — scope of each **UNKNOWN**
  to this report; not read this pass).
- **Rules 22–47 cited in this engagement's history** (existence checked
  against `AGENTS.md` this pass): RULE 29 (numeric-UX), RULE 30 (unit
  duality), RULE 34 (single-outcome focus), RULE 35 (pull-queue claim
  rule), RULE 36 (observe-refine loop), RULE 37, RULE 38 (heartbeat/
  fleet-watch), RULE 40 (facts-only reporting), RULE 41 (device+perf
  gate) — **all confirmed present in `AGENTS.md` at this snapshot.**
  RULE 47, cited as this report's own authority, is **NOT PRESENT** —
  flagged rather than silently complied with as if it existed.
- **24/7 harness.** `docs/WAVE_QUEUE.md`/`docs/TASK_BOARD.md` describe a
  continuously-running multi-agent fleet landing to `origin/main` via
  `scripts/land.ps1` and direct self-land patterns (RULE 18); this
  report's own gathering observed `origin/main` HEAD advance three times
  (`613b0ca8` → `689c0377`, mid-session) during the ~30 minutes spent
  authoring it — direct evidence the fleet is active and landing
  concurrently with this report's own authorship.
- **Worktree fleet size at time of writing: 70 active `git worktree`
  entries** (`git worktree list`, this session), one per in-flight or
  recently-completed seat task.

---

*End of report. Authored by ATLAS under RULE 40; snapshot SHA `689c0377`.
Any figure marked UNKNOWN should be re-derived from disk before being
repeated as fact in a future report — per this same rule.*
