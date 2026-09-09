# MASTER_TASK_LIST.md — SCRIBE reconciliation view (2026-09-08)

**Purpose:** a single read of every ask that has ever reached
`docs/TASK_BOARD.md` (rows W-10..W-98 and their sub-rows), every landed
ATLAS/CRANE spec doc, and every operator instruction recorded in
`docs/ACTIVITY_LOG.md`, reconciled into one list with a consistent
schema, genuinely-overlapping asks merged with their mapping shown, and
a separate section for operator asks that currently have no board row
at all.

**This document supersedes nothing.** `docs/TASK_BOARD.md` remains the
authoritative RULE 35 pull-queue; `docs/EXECUTION_LEDGER.md` remains
PI's authoritative independent-verification record; `docs/WAVE_QUEUE.md`
remains the permanent ledger of record. This is a reconciliation/index
view for operator review only — nothing here is pull-eligible, and
nothing here overrides a status recorded in those files.

**Method:** every row W-10..W-98 (and sub-rows) in `docs/TASK_BOARD.md`
as it stands on this worktree was read in full, along with the whole
of `docs/EXECUTION_LEDGER.md`, and the 2026-09-04-onward portion of
`docs/ACTIVITY_LOG.md` (each entry there is SCRIBE's own seeding log,
one entry per row, cross-checked against the board). STATUS below cites
PI's Execution Ledger where that row was reviewed there (PI's Cycle 1,
dated 2026-09-07 — **before** the board's 2026-09-08 W-22/23/24/25/
37/38/39/50/90/93 recovery pass, so a ledger STUCK/BLOCKED verdict on
a since-restored row is cited as-is, with the board's newer text noted
alongside, per the operator's instruction not to re-judge status
myself). Where PI's ledger does not cover a row (W-01..W-34 range,
W-79a..g individually, W-97, W-98 — all seeded/landed after or outside
PI's Cycle 1 review), STATUS falls back to the board's own Status
column.

---

## How to read an entry

- **ID** — lowest/primary original board ID; merged IDs (if any) noted.
- **ASK-SOURCE** — the operator instruction this satisfies, paraphrased
  from the row's own citation or `docs/ACTIVITY_LOG.md`'s seeding entry.
- **ASSIGNEE** — single seat, per RULE 59's model applied to this board
  retroactively (MASON=logic/engine, RIVET=chrome/styling/mobile,
  CRANE=KB/Worker/infra, ATLAS=research, SCRIBE=docs/ledger, PI=audit).
  Rows the board itself split across seats are noted with the split.
- **PRODUCT** — the board's own `[PRODUCT: X]` tag where present. Per
  the board's own Notes (RULE 57 tagging is incremental, ~70 rows
  untagged as of 2026-09-08), an untagged row is marked **UNTAGGED**
  here rather than guessed.
- **STATUS** — see Method above.
- **Acceptance** — condensed from the row's real acceptance text.

---

## A. Foundational workspace build (W-01..W-20)

*Ledger note: none of W-01..W-20 were reviewed in PI's Cycle 1 — all
STATUS values below are the board's own.*

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-01 | Operator's original 10-row workspace seed (RULE 35 seeding, 2026-09-04): "Migration + save200" | CRANE | UNTAGGED | CLAIMED (CRANE) — board | D1 migration applies clean; save call returns 200 on the deployed edge, verified by real request. |
| W-02 | Same seed: add `three` as the W2-380-approved dependency | CRANE | UNTAGGED | READY — board | `three` installed as the sole approved new dependency; build stays green. |
| W-03 | Same seed: merge workspace types into `lib/types.ts` | CRANE | UNTAGGED | READY — board | WorkspaceProject/Artifact types merged with no breaking change; typecheck green. |
| W-04 | Same seed: assemble `page.tsx` mounting RIVET+MASON pieces | CRANE | UNTAGGED | READY — board | Both sets of components mount without collision; 1366/375 screenshot per RULE 24. |
| W-05 | Same seed: Space3D three-integration + gates + proofs (folded from W2-384) | MASON | UNTAGGED | READY — board | Plot-anchored 3D view renders live; RULE 2 gate wired; RULE 29/30 obligations verified on-screen. |
| W-06 | Same seed: ExportBar IFC/DXF | MASON | UNTAGGED | READY — board | Export produces a real IFC/DXF from a live artifact; gated on W-20's bundle-safety result. |
| W-07 | Same seed: wire RIVET rails + CRANE page.tsx into the workspace route | RIVET | UNTAGGED | READY — board | Components live-reachable through the assembled route; no dead mounts. |
| W-08 | Same seed: Intent API (WORKSPACE_SPEC.md §5→§4) | CRANE | UNTAGGED | DONE — board (`525430b2` era, 2026-09-04 reconciliation) | Each §5 intent phrase resolves to the correct §4 contract call; 400s per §4. |
| W-09 | Same seed: command bar UI consuming W-08 | RIVET | UNTAGGED | READY — board | Typed phrase resolves to correct action live; 1366/375 screenshot. |
| W-10 | Same seed: ATLAS independent 8-step battery against WORKSPACE_SPEC.md §6 | ATLAS | UNTAGGED | READY — board (no full battery run logged on disk as of this writing, per W-32's own flag) | Independent audit of W-07/W-09, no self-certification. |
| W-11 | Operator live-site observation, RULE 36 (2026-09-04): signed-out workspace shelf showed a bare empty box | RIVET | UNTAGGED | READY — board | Signed-out shelf shows a real empty-state + sample-artifact CTA on the deployed edge. |
| W-12 | Same RULE 36 batch: keyboard fit-to-model control missing | MASON | UNTAGGED | READY — board | Keyboard shortcut fits model view in the 3D configurator, verified live. |
| W-13 | Same RULE 36 batch: view state should be shareable | MASON | UNTAGGED | READY — board | Camera/selection/artifact state round-trips through a shareable permalink URL. |
| W-14 | Same RULE 36 batch: AQ-RIVET-004 app-link diagnostic (proposal text itself not on disk — flagged, not fabricated) | RIVET | UNTAGGED | READY — board | Diagnose/fix per AQ-RIVET-004; RIVET confirms scope against its own proposal record first. |
| W-16 | Operator live-site observation (2026-09-04): ULPIN lookup tool disappeared from LandIntel (forensically traced to commit `331c1b08`) | RIVET | UNTAGGED | READY — board | `UlpinMapExplorer` restored as PRIMARY hero tool; forecast module stays as SECONDARY; both live+dual-unit. |
| W-17 | Operator instruction (2026-09-04): no credential collection pre-launch, but Log in/Start Free Trial CTAs must still work | RIVET | UNTAGGED | READY — board | Zero credential inputs on `/signup`/`/login`; honest preview-gate copy; every CTA sitewide routes there; W2-326 backend auth untouched. |
| W-20 | MASON/CRANE build-vs-reuse disagreement on IFC export, seeded by SCRIBE to resolve before either side writes more code | CRANE | UNTAGGED | Step 1 DONE, result FAIL — board | Bundle-safety test of the existing STEP writer; FAIL means MASON's browser-only rewrite proposal proceeds (see `docs/TASK_REPORTS.md`). |

## B. Conversational core, KB, and vocabulary

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-27 | Operator instruction (2026-09-04): command bar becomes THE primary interface, text+voice, sliders demoted | MASON (UI) + CRANE (grammar) | UNTAGGED | DONE — board `525430b2`; ledger not reviewed | Typed and spoken instances of the same intent produce the same reshaped result; visible sliders (post W-53 reversal) carry paired numeric inputs. Perf-delta gate (RULE 41(4)) applies. |
| **W-58 (merged: W-28, W-58)** | Operator instruction (2026-09-04) for guided option chips when no text/voice given, later re-specified 2026-09-05 as a full branching architect-intake tree replacing the chip flow | CRANE (content) + MASON (renderer) | UNTAGGED | W-28: DONE (pre-amendment scope only) — board. W-58 itself: BLOCKED — PI ledger Cycle 1 (no landing) | **Mapping:** W-28 GUIDED_OPTIONS's ruleset-constrained option-chip mechanism is explicitly superseded by, and carries forward into, W-58 ARCHITECT_INTAKE_TREE — the board's own text calls W-58 "the new authoritative row for this interaction going forward." Full 8-branch intake tree (site/family/program/budget/style/interior/culture/future), one question at a time, ends in 2-3 scored candidates; renders as SUTRA's fallback ("Can't describe it? Choose instead") per W-63's amendment. |
| W-29 (merged: W-29, W-41, W-60) | Operator instruction (2026-09-04): versioned, cited code corpus (NBC/IS/SP7/DCR/dimensional tables), later extended 2026-09-05 to full public-coverage manifest (W-41), then to continuous max-depth adapter pipeline + REFINE slot (W-60, 2026-09-05) | CRANE + MASON | UNTAGGED | W-29/W-41: READY — board; not in PI ledger for W-29, W-41 BLOCKED — PI ledger (no audited coverage-manifest landing); W-60 IN_PROGRESS — PI ledger (partial domain commits, no audited manifest) | **Mapping:** W-41 KB_EXHAUSTIVE and W-60 KB_MAX_DEPTH are both explicit in-place scope amendments of W-29 KNOWLEDGE_BASE, not independent deliverables — same module, three successive depth commitments (seed corpus → full-subject coverage manifest → continuous adapter pipeline/operator REFINE slot/honest per-domain %). Every fact carries clause ID + status chip (VERIFIED-SAMPLE/INDICATIVE); zero facts from memory, all traced to a cited public source or REFINE entry (spot-checked, per W-60). |
| W-30 | Operator instruction (2026-09-04): professional-vocabulary ontology so the site speaks each stage's own language | MASON | UNTAGGED | READY — board; not in PI ledger | Intent parser + replies resolve equivalent terms (setback=margins=build-line, FAR=FSI=plot-ratio, etc.) through one ontology. |
| W-31 | Operator instruction (2026-09-04): future grounded-LLM layer, explicitly gated on a not-yet-made LLM-seat approval | (unassigned) | UNTAGGED | ROADMAP-LABEL — board; not in PI ledger | Not pull-eligible until the LLM-seat approval exists; RAG-with-citations only, never a source of a number on its own. |
| W-32 | Operator-cited ATLAS 8-step battery failures (checks 2, 5, 8) — umbrella, no independent envelope | (per sub-row) | UNTAGGED | (see sub-rows) — board; not in PI ledger | Umbrella only; W-10's full battery results not yet logged on disk (flagged on the row itself). |
| W-32a | Battery check (2): artifact-save→readback | (board-pull, any eligible seat) | UNTAGGED | READY — board; not in PI ledger | A saved artifact appears on GET immediately after POST, verified on the deployed edge. |
| W-32b | Battery check (5): extract panel doesn't update on mutate | (board-pull, any eligible seat) | UNTAGGED | READY — board; not in PI ledger | Extract panel updates on state mutation with no manual refresh. |
| W-32c | Battery check (8): share link doesn't open | (board-pull, any eligible seat) | UNTAGGED | READY — board; not in PI ledger | A share action's link actually opens the shared content when followed. |

## C. Cockpit shell, fullscreen, and region layout

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-26 | Operator instruction (2026-09-04): "nothing outranks it" — `/project-workspace` must render the cockpit by default, project list demoted | CRANE | UNTAGGED | DONE — board `86ef5791`; not in PI ledger | Opening `/project-workspace` shows tabs+ruler+3D+extract+command bar in one viewport at 1366/375; project list moves to `/project-workspace/projects`. |
| W-47 (merged: W-47, W-52, W-63) | Operator priority insert (2026-09-05): cockpit becomes a full-viewport app surface; a YouTube-style fullscreen toggle on cockpit + all ten product previews (W-52); fullscreen SUTRA-vs-cockpit fixed at 1/3–2/3 (W-63) | MASON | UNTAGGED | W-47: BLOCKED — PI ledger (W-40 incomplete, no landing); W-52: DONE `2deb09dd` — PI ledger HALFWAY (landed/tree-verified, viewport proof absent); W-63: BLOCKED — PI ledger (dependencies) | **Mapping:** W-52 FULLSCREEN_TOGGLE and W-63 FULLSCREEN_THIRDS are both successive amendments to W-47 COCKPIT_FULLSCREEN's own fullscreen behavior (base maximized-viewport layout → the actual Fullscreen-API toggle+HIGH render profile → the fixed 1/3-cockpit/2/3-SUTRA split), not separate features. Canvas fills ≥70%/≥60% of viewport (normal) at 1366/375; fullscreen toggle shows tab strip + HIGH-profile canvas + "Continue in workspace ⛶" button; fullscreen split measures 1/3 SUTRA / 2/3 cockpit, canvas carries no mouse-mutation handlers (RULE 50 cross-check). |
| W-54 | Priority-block instruction (2026-09-05): three stacked provenance chip boxes should collapse to one status bar; fullscreen button visibility/z-index fix | MASON | UNTAGGED | DONE — board `0d2d850d`; PI ledger HALFWAY (landed/tree-verified, edge proof absent) | One slim status-bar line (not three boxes) on cockpit + all previews; fullscreen button visibly clickable, verified on deployed edge. |
| W-61 | Operator instruction (2026-09-05): app bar needs an explicit way back to the main site from any app surface, including fullscreen | MASON | UNTAGGED | DONE — board `3653c8bb`; PI ledger HALFWAY (landed, three-context proof absent) | Clickable brand mark + explicit Home button on normal/fullscreen/all previews; click-through verified on deployed edge. |
| W-40 | Operator instruction (2026-09-04): agent becomes a persistent full-height right-side chat panel (desktop) / bottom sheet (mobile) | MASON + RIVET | UNTAGGED | READY — board; PI ledger BLOCKED (W-27/33/34 unverified, no landing) | SUTRA panel open by default at 1366, bottom sheet at 375; tools ruler relocates to canvas-left slim strip; W-27 engine reused unmodified inside new panel. |
| W-33 | Operator instruction (2026-09-04): LandIntel results need a path into the workspace with the parcel's context preloaded | RIVET + CRANE + MASON | UNTAGGED | READY — board; PI ledger BLOCKED (W-40 incomplete, no landing) | "Open in workspace ⛶" beside every "Save" surface; left side panel shows territorial detail; 3D space pre-seeds from parcel dims/forecast; one click also enters fullscreen (per W-52 amendment). |
| W-34 | Operator instruction (2026-09-04): make RULE 41's perf/device budgets a real CI gate, not a documented aspiration | CRANE | UNTAGGED | READY — board; not in PI ledger | `budgets.json` wired into CI, a deliberately oversized bundle actually fails CI; degradation-profile toggle demonstrably switches on a WebGL1-forced test. |
| W-80 | Operator instruction (2026-09-06): SUTRA must be the ONE assistant entry point everywhere — remove the separate "Ferrum Concierge" surface | (any seat, owner-agnostic) | CROSS | READY — board; PI ledger BLOCKED (no removal/replacement landing) | Zero "concierge" strings/entry points sitewide (headless DOM scan); SUTRA present+functional on every route; two product pages show contrasting persona voicing. |
| W-81 | Operator instruction (2026-09-06): each cockpit tab needs a distinct premium visual skin over the same underlying model | (any seat, owner-agnostic) | UNTAGGED | READY — board; PI ledger IN_PROGRESS (author work off-main, ten-skin acceptance absent) | Switching tabs changes color-coding/tags/overlays while geometry stays identical (headless geometry diff = zero); skin+persona voice change together. |
| W-82 | Operator instruction (2026-09-06): every product page/preview must recompute live from one shared project state, not stale snapshots | (any seat, owner-agnostic) | UNTAGGED | READY — board; PI ledger IN_PROGRESS (author work off-main, no cross-product edge proof) | A Design-tab mutation shows the correct updated delta on Cost/Structure without manual refresh, screenshotted across every named route. |

## D. Controls, sliders, and precision-input class

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-53 (merged: W-53, W-88, W-91) | Operator's own "no sliders anywhere" instruction (2026-09-05), reversed same day to "every slider gets a paired numeric input" ("latest wins"); extended 2026-09-07 to a full instrument-grade composite control (W-88) and to the specific "How much open ground?" panel replacement (W-91) | RIVET + MASON | CROSS (W-88, W-91 board-tagged; W-53 itself untagged) | W-53: READY — board; PI ledger HALFWAY (paired-input policy settled, fleet proof absent). W-88: READY — board; PI ledger BLOCKED (W-53 incomplete). W-91: READY — board; PI ledger BLOCKED (W-87/W-88/sources incomplete) | **Mapping — the operator's own worked example:** W-91 OFFSETS_PANEL (deletes the "How much open ground?" slider for a three-authority-tab panel with exact-entry inputs) and W-88 PRECISION_CONTROLS (the numeric-field+unit-toggle+stepper+detented-slider composite, fleet-wide) are both concrete instances of W-53 NO_SLIDERS_ANYWHERE's underlying ask — one control philosophy (every mutation path pairs a slider with an exact, keyboard-adjustable, ruleset-bound numeric entry, feeding the same intent pipeline as SUTRA), not three separate asks. W-91's panel and W-88's composite control are the two concrete surfaces that ask produces. Acceptance: headless scan finds paired inputs on every slider fleet-wide; W-91's three authority tabs (NBC/State DCR/Local body) each show live, cited minimums with a below-minimum warning (never blocking); W-88's composite is keyboard-adjustable and dead-binding-audited. |
| W-48 | Operator instruction (2026-09-04): a config-driven tool/slider registry so adding a control means a config entry, not a code change | MASON | UNTAGGED | READY — board; PI ledger BLOCKED (W-24/W-27, amended slider acceptance unverified) | Adding a control is demonstrated via registry-entry-only change; renders as slider+paired-input, also reachable via SUTRA's guided tree; min/max/step verified against W-24's ruleset output. *(Distinct from the W-53/W-88/W-91 class above: this is the pluggable-registry mechanism those controls can be rendered through, not itself a control redesign.)* |
| W-85 | Operator instruction (2026-09-07): extend location-detection to all six real-world methods; same-pass cleanup of categorical-vs-slider misuse on Land/Territory surfaces | (any seat, owner-agnostic) | LandIntel | READY — board; PI ledger BLOCKED (W-65/53/51 unverified) | Pin drop, GPS coords, place search, use-my-location, ULPIN all resolve with a provenance chip; survey/khasra mode stays roadmap-labeled; categorical choices render as chips not sliders on these surfaces; default map centers on a disclosed sample (Bengaluru). |

## E. Plan generation, elements, presets, BOQ

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-24 | PI's 2026-09-08 reconciliation, recovering the operator's original compliance-engine ask (heavily depended-on by ~a dozen other rows) | CRANE or MASON | UNTAGGED | READY — board; not in PI ledger (recovered after Cycle 1) | Deterministic parcel+building-type → permissions ruleset (authority/stage/timeline/documents), unit-tested, every item INDICATIVE-labeled per the 2026.1-SAMPLE ruleset. |
| W-25 | Same 2026-09-08 recovery | RIVET or MASON | UNTAGGED | READY (scope conflict flagged) — board; not in PI ledger | Compliance-table content surfaces per stage (BUY/BUILD); real, unresolved conflict between the row's original two-new-tab assumption and the now-fixed ten-tab structure — flagged, not pre-decided. |
| W-93 | PI's 2026-09-08 recovery of ATLAS's real, landed `docs/ARCHITECT_PREDESIGN_FACTS.md` (`363fc14f4`), which had no board row | CRANE | UNTAGGED | READY — board; PI ledger BLOCKED (author spec off-main, no board row at ledger time) | Upgrades W-24's SAMPLE-labeled bands toward real, cited NBC Part 3/state Bye-Law figures; heritage-buffer rule (100m/200m) implemented as real logic even where the monument-location dataset itself stays a separate gap. |
| W-55 | Priority-block instruction (2026-09-05): the dimensional-standards module must actually gate plan generation, with a deterministic audit test | MASON (engine) + CRANE (data) | UNTAGGED | READY — board; PI ledger BLOCKED (no landed deterministic audit result) | PLAN_AUDIT fails a deliberately non-compliant test plan for real; a compliant plan passes with citations; Plan view/DXF export/previews all reflect the same audited plan. |
| W-66 | Operator instruction: the model must build the bare-minimum real element set with live BOQ mapping | MASON | CROSS | READY — board; PI ledger BLOCKED (no landed element pipeline/BOQ mapping) | Element toggles present/functional; changing an element produces a correct live BOQ delta on the deployed edge. |
| W-67 | Operator instruction: a large combinatorially-generated preset library, audit-scored, browsable | MASON (gen+UI) + CRANE (seed) | CROSS | READY — board; PI ledger BLOCKED (no evidence) | ≥24 seeded presets, each PLAN_AUDIT-passed with real stats; picking one swaps into the workspace keeping parcel context; a post-swap SUTRA edit is proven to work. |
| W-43 | Operator instruction (2026-09-04): a single-library materials catalog (commercial+technical+parametric), one source of truth for Design/Structure/BOQ | CRANE (data) + MASON (UI) | UNTAGGED | READY — board; PI ledger BLOCKED (no one-library catalog landing) | Coverage manifest matches actual seeded item count; every item carries all three data layers or is explicitly marked incomplete; ~500-1000 item DSR/CPWD-taxonomy seed. |
| W-44 | Same seed: BOQ must read W-43 only, never a second catalog | MASON | UNTAGGED | READY — board; PI ledger BLOCKED (W-43 unverified) | Every BOQ line traces to a specific W-43 catalog entry; GST computed and shown per line. |
| W-45 | Same seed: vendor-live-pricing adapter contract, defined now, live later | (unassigned, post-launch) | UNTAGGED | ROADMAP-LABEL — board; not in PI ledger | `price_source: SAMPLE|VENDOR_API` field defined in W-43's schema now, so no later migration is needed. |
| W-46 | Operator instruction (2026-09-04): a pluggable rate-source-adapter pipeline, zero hardcoded sources | CRANE | UNTAGGED | DONE — board `22f78aa5`+`76dcb42f`; PI ledger HALFWAY (landed/tree-verified, no operational proof) | At least one adapter (PDF/API/manual) demonstrably pluggable against a real fixture; engine refuses/labels a rate with no adapter, never fabricates one. |
| W-42 | Operator instruction (2026-09-04): the LandIntel result card should show its full shape before any lookup runs | RIVET | UNTAGGED | READY — board; PI ledger BLOCKED (no preview-to-real-result artifact) | Pre-lookup card renders every field marked PREVIEW/sample; a real lookup swaps in real values, same layout. |
| W-87 | ATLAS-supplied real content backfilling a numbering gap (2026-09-07): coastal/hill/courtyard aesthetic-recommendation KB, distinct from hard regulatory minimums | CRANE | CROSS | READY — board; PI ledger BLOCKED (W-41 provenance/coverage incomplete) | At least coastal wind gaps, hill terracing, and courtyard ratios seeded with real content + status chip; consumed by W-91 as advisory, never merged with regulatory figures. |

## F. Rendering, ground truth, product cockpit visuals

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-51 | Operator correction (2026-09-05), generalized under RULE 44 from a single-tab fix to all ten tabs + previews: real satellite/OSM ground as the shared base layer everywhere | MASON (3D) + CRANE (sources) | UNTAGGED | READY — board; PI ledger HALFWAY (author work off-main, all-surface proof absent) | Ground (imagery/boundary/OSM buildings/attribution/date chips) identical across all 10 tabs + previews; only the lens overlay differs; a tab showing the generic grid instead is a FAIL. |
| W-92 (merged: W-22, W-92) | Original ARCHVIZ_GRAPHICS ask (PBR/IBL/podium/greenery per `docs/UX_FLOW.md` phase 3, recovered 2026-09-08), explicitly superseded by the operator's fuller 2026-09-07 photoreal-viewport ask | MASON | CROSS | W-22: SUPERSEDED — board (no independent work remains); W-92: READY — board; PI ledger BLOCKED (no landing/device-tier evidence) | **Mapping:** W-22 ARCHVIZ_GRAPHICS's scope (PBR materials, IBL sun, reflective podium, instanced greenery, fps budget) is a strict subset of W-92 PHOTOREAL_VIEWPORT's scope (adds ACES tone mapping, SSAO, sun computed from real lat/lon, device-tiered quality with fps guard) — one row now, W-92. Acceptance: before/after screenshots show an unambiguous upgrade; shadow direction computed-verified against real site lat/lon/time; fps assertion passes green on RULE 41's mid-tier floor device. |
| W-59 | Priority-block instruction (2026-09-05): each cockpit tab needs a distinct, KB-bound expert persona | CRANE (configs) + MASON (wiring) | UNTAGGED | CRANE's config piece DONE (2026-09-07) — board; PI ledger IN_PROGRESS (config off-main, wiring unstarted) | Ten persona configs bound only to real KB modules/canonical terms; MASON's load/re-voice-on-jump wiring is the remaining gate before full DONE. |

## G. Site-wide UX, marketing, mobile

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-37 | PI's 2026-09-08 recovery of a real, previously-dropped RIVET row (commits `84bacef8`/`3bf36fbed`) | RIVET | UNTAGGED | READY — board (restored 2026-09-08). PI ledger Cycle 1 (2026-09-07, pre-restoration): STUCK — row absent at review time | Every interactive element sitewide gets `cursor:pointer` + real hover/`:focus-visible` states, verified by headless computed-style check across the RULE 41 responsive matrix. |
| W-38 | PI's 2026-09-08 recovery of a real, previously-dropped RIVET row | RIVET | UNTAGGED | READY — board (restored). PI ledger Cycle 1: STUCK — row absent at review time | Modern nav/hero/cockpit-chrome polish pass (hover elevation, underline-slide, 8pt rhythm, skeleton states); before/after screenshots; CLS ≤0.1 and full RULE 41 budget pass. |
| W-39 | PI's 2026-09-08 recovery of a real, previously-dropped split row (RIVET UI + MASON demo-mode) | RIVET + MASON | UNTAGGED | READY — board (restored). PI ledger Cycle 1: STUCK — row absent; author SHA `890a8d22` in history | First-viewport narrative hero line + CTA into cockpit on every named route; scripted demo-mode 3D loop must stay RULE 50/W-89-compliant (camera/highlight only, or a labelled DEMO scratch model); ATLAS honesty-checks the copy before DONE. |
| W-69 | Operator instruction (2026-09-06): the marketing site should demonstrate the product live, not describe it | RIVET | CROSS | READY — board; PI ledger BLOCKED (no landing or measured UI evidence) | Hero replaced with a live embedded cockpit teaser; ten product cards each get one honest live micro-preview; RULE 41 budget/fps floor still pass post-change. |
| W-83 | SCRIBE's own stewardship-pass finding (2026-09-06/07): the Android Capacitor shell is hardcoded to a dead worker URL, so the shipped app cannot reach the live edge at all | RIVET | CROSS | READY — board; PI ledger BLOCKED (dead-host defect remains) | All three mobile config files reference the current live URL (read from `docs/FLEET_SEATS.json`), none reference the dead one; a real Android build/emulator run reaches live content. |
| W-84 | Operator instruction, top-of-queue (2026-09-07): cockpit/preview canvases must be full-bleed, zero dead gutter | (any seat, owner-agnostic) | UNTAGGED | READY — board; PI ledger IN_PROGRESS (author commit off-main, eleven-route proof absent) | Headless check: canvas `clientWidth` exactly equals its section's `clientWidth` on all ten product pages + the workspace route; ≥70vh height; zero dead left gutter at 1366/1920. |

## H. Third-party integration rows (from `docs/TECH_SCOUT.md`)

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-68 | Operator instruction (2026-09-06), provisionally scoped by ATLAS itself absent further detail | ATLAS | UNTAGGED | DONE — board `a5ac86ed`; PI ledger DONE (static, tree-verified) | 13 targets researched live via `gh api`/LICENSE reads, each with a real adopt/watch/skip verdict, seeding the entire W-70..W-79g queue. |
| W-70 | `docs/TECH_SCOUT.md` #1 (openai/whisper, MIT): fixes SUTRA's real Safari voice-input gap | (any seat, owner-agnostic) | CROSS | READY — board; PI ledger BLOCKED (no Worker transcription/fallback evidence) | Voice input on a browser lacking native `SpeechRecognition` transcribes via the new server-side path; existing native path unaffected. |
| W-71 | `docs/TECH_SCOUT.md` #12 (cal.com/cal.diy, MIT): a real "Book a consult" CTA | (any seat, owner-agnostic) | UNTAGGED | READY — board; PI ledger HALFWAY (health-gated code off-main, public host absent) | Live CTA on a marketing surface; a real booking completes end-to-end against the hosted widget. |
| W-72 | `docs/TECH_SCOUT.md` #9 (ag-ui-protocol, MIT): replace the bespoke SUTRA callback with a structured event schema | (any seat, owner-agnostic) | UNTAGGED | READY — board; PI ledger BLOCKED (no event-protocol refactor) | At least one real interaction round-trips through the new schema end-to-end; existing text/voice path unaffected. |
| W-73 | `docs/TECH_SCOUT.md` #6/#7 (diagram-design / archify, MIT): self-contained HTML+SVG diagram generation | (any seat, owner-agnostic) | CROSS | DONE — board `d73f881a`; PI ledger HALFWAY (landed/tree-verified, no visible-edge diagram proof) | At least one real, data-driven diagram (compliance chain) renders from actual project data, not a placeholder. |
| W-74 | `docs/TECH_SCOUT.md` #4 (n8n-io/n8n, Sustainable Use License): self-hosted job-runner for KB/rate-refresh and fleet automation | (any seat, owner-agnostic) | CROSS | License confirmation DONE, workflows authored, not import-verified — board; PI ledger HALFWAY (license/workflow evidence, no hosted run) | License confirmed real (internal-use only, no resale/competing SaaS); at least one real Ferrum-specific workflow runs end-to-end on a self-hosted instance. |
| W-75 | `docs/TECH_SCOUT.md` #2 (plausible/analytics, AGPL-3.0): the site currently has no analytics at all | (any seat, owner-agnostic) | UNTAGGED | STUCK — board (public host absent, operator question posted `docs/OPERATOR_INBOX.md` 2026-09-06); PI ledger STUCK (same) | Self-hosted instance live; tracking snippet confirmed recording real pageviews, verified directly. |
| W-76 | `docs/TECH_SCOUT.md` #3 (penpot/penpot, MPL-2.0): concept-only pattern study for Plan/Front/Side tab interaction | (any seat, owner-agnostic) | UNTAGGED | DONE — board `fc792c466`; PI ledger HALFWAY (landed/tree, PI hasn't reproduced deployed interaction) | Concept spec (`docs/PENPOT_INTERACTION_SPEC.md`) names the adapted patterns; one minimal pattern (BoxHelper selection + bracket-key cycling) demonstrably working, no Penpot code embedded. |
| W-77 | `docs/TECH_SCOUT.md` #5 (bitwarden/clients, GPLv3 lineage): concept-only zero-knowledge architecture spec | ATLAS | UNTAGGED | DONE — board `d9f18959`; PI ledger DONE (static, tree-verified) | `docs/CONCEPT_SPEC_BITWARDEN.md` names the reusable pattern (client-side encryption before upload) and explicitly states no Bitwarden code is adapted. |
| W-78 | `docs/TECH_SCOUT.md` #8 (PrimeIntellect protocol/prime-diloco, Apache-2.0): concept-only, gated on W-31's still-unmet LLM-seat approval | (any seat, once W-31 clears) | UNTAGGED | READY (deps unmet, not pull-eligible) — board; PI ledger BLOCKED (W-31 gate unmet) | Concept spec names how PrimeIntellect's distributed-inference pattern would apply to W-31's grounded layer, once unblocked. |
| W-79a | Operator's re-specification (2026-09-06) after "enviz" itself couldn't be verified as a real reference — first-person walk mode | (any seat, owner-agnostic) | UNTAGGED | READY — board; not in PI ledger individually (umbrella W-79 BLOCKED in ledger) | Eye-height camera, pointer-lock look, door-aware room-to-room movement without wall clipping. |
| W-79b | Same re-specification: open-format 3D ingestion (IFC/Speckle) | (any seat, owner-agnostic) | CROSS | READY — board; not in PI ledger individually | IFC upload renders correctly; ≥1 Speckle-bridged format round-trips; Ferrum-native plan generation unaffected. |
| W-79c | Same re-specification: on-site AR (WebXR + USDZ/Quick-Look fallback) | (any seat, owner-agnostic) | UNTAGGED | READY — board; not in PI ledger individually | 1:1-scale AR projection on WebXR-capable devices; USDZ/Quick Look fallback on iOS; honest capability chip elsewhere. |
| W-79d | Same re-specification: in-space measurement/notes with D1 persistence and revision history | (any seat, owner-agnostic) | CROSS | READY — board; not in PI ledger individually | Measurement/note persists across reload from D1; edited note keeps retrievable revision history. |
| W-79e | Same re-specification: real-time guided tours via Workers WebSocket | (any seat, owner-agnostic) | CROSS | READY — board; not in PI ledger individually | A second client's camera visibly follows the host live; host voice note heard by connected viewers, ≥2 real concurrent clients. |
| W-79f | Same re-specification: live material/finish swap extending the existing chip mechanism | (any seat, owner-agnostic) | UNTAGGED | READY — board; not in PI ledger individually | Selecting a material option visibly changes the surface in real time, routed through the same chip/intent pipeline. |
| W-79g | Same re-specification: automated camera-path flythrough export | (any seat, owner-agnostic) | CROSS | READY — board; not in PI ledger individually | Automated path plays through the model; `MediaRecorder` export produces a real, playable video file. |

## I. Data/model layer for self-improvement (DPDP class)

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-94 (merged: W-94, W-95) | Operator instruction (2026-09-07): consent-first, DPDP-compliant telemetry capture, later amended per ATLAS's real `docs/FERRUM_AI_ARCHITECTURE.md` finding that DPDP consent is purpose-specific; feeds a learning loop that aggregates the captured events into cohort priors and a quality dashboard | MASON | CROSS | Both READY — board. PI ledger: W-94 BLOCKED (dependencies/no artifact), W-95 BLOCKED (W-94/W-55 incomplete) | **Mapping:** W-94 PREFERENCE_TELEMETRY (opt-in consent UI, on-device cohort-bucket anonymization, labelled-event capture) and W-95 LEARNING_LOOP (aggregates those same labelled events into cohort priors + a quality dashboard, volume-gated) are one capture-then-learn pipeline over one consent contract — W-95 explicitly does not re-verify consent scope, it only consumes what W-94 already gated. Consent copy must name "improving generation models" explicitly (not a generic "help us improve" line); declining consent leaves every other surface fully functional; a sensitive field never reaches D1 as raw PII, only its cohort bucket; every cohort-prior statement anywhere carries an unverified/indicative label until actually derived from real data at or above the volume gate. |
| W-96 | ATLAS research instruction (2026-09-07): a two-head (technical+preference) self-learning architecture with a staged, gated rollout | ATLAS | UNTAGGED | DONE — board `6a26e60d9`; PI ledger BLOCKED (author off-main; ledger predates the landing) | Spec names both heads' real data sources and all four rollout stages with real gates (stage 3 explicitly gated on W-31's unapproved LLM-seat trial). |

## J. Research / land-data rows

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-90 | PI's 2026-09-08 recovery of ATLAS's real, landed `docs/PLOT_TRUTH_ENGINE_SPEC.md` (`4e905227b`), which had no board row | CRANE | LandIntel | READY — board; PI ledger BLOCKED (document evidence only, no board row at ledger time) | Newly-integrated land-data sources carry a real, checked ToS clearance; a RoR-complete-but-not-geo-referenced parcel surfaces that honest state, never a silent failure. |
| W-97 | Operator-cited research continuation (2026-09-08) closing a gap ATLAS's own `docs/LANDEED_DEEP_DIVE.md` flagged (SPA timeout on the live search walkthrough) | ATLAS | LandIntel | DONE — board (this pass); not in PI ledger (seeded after Cycle 1) | Live search walked to real in-app content (per-state document-count table, AP catalog); ≥1 per-state count independently confirmed, not company-claimed; fed into W-90's source-map table. |

## K. Fleet/infra automation rows

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-50 | PI's 2026-09-08 recovery of real, landed CRANE harness work (`fcfc892f`) never seeded through the board | CRANE | UNTAGGED | DONE — board `fcfc892f`; PI ledger BLOCKED (author evidence only, no board row/ landing tracked at ledger time) | Seat-agnostic revival harness; `docs/FLEET_SEATS.json` enumerates all seven seats with real worktree globs; `Get-TopReadyRow` confirmed reading this board's own table order. |
| W-98 | RULE 58 instruction (2026-09-08): a per-seat headless drain loop so seats don't require a human to type "next task" | CRANE | CROSS | READY — board; not in PI ledger (seeded after Cycle 1) | A full cycle with no human input into any seat's chat, where PI's ledger shows a real triggered→landed→verified chain for at least one row. |

## L. Superseded / roadmap-only / no-independent-work rows

| ID | ASK-SOURCE | ASSIGNEE | PRODUCT | STATUS | Acceptance |
|---|---|---|---|---|---|
| W-23 | Recovered 2026-09-08 alongside W-22/24/25 | (unassigned) | UNTAGGED | ROADMAP-LABEL — board; not in PI ledger | Dynamo-style visual parametrics node panel — real, un-superseded roadmap concept, not pull-eligible. |
| W-64 | Amendment instruction (2026-09-05) citing "W-64 BOOTSTRAP_LAUNCH," whose own original scope was never found on disk | (unassigned pending scope) | UNTAGGED | STUCK (BOOTSTRAP_LAUNCH scope only) — board; PI ledger STUCK (original scope missing, only URL consolidation documented) | Amendment text ("bootstrap = zero investor dependency, not reduced features") preserved verbatim; the row's own live-URL single-source-of-truth recording (`docs/FLEET_SEATS.json`) is independently complete regardless of the scope gap. See also Flagged Gaps below. |

---

## Merge mapping summary (Part 2)

| Merged entry | Folded original IDs | Why genuinely one ask |
|---|---|---|
| W-53 | W-53, W-88, W-91 | Operator's own worked example: one "replace sliders with paired exact-entry controls" ask, expressed as the fleet-wide composite control (W-88) and as the specific open-space/offsets panel (W-91). |
| W-29 | W-29, W-41, W-60 | Three successive, explicit in-place scope amendments of the same KB module (seed corpus → full coverage manifest → continuous max-depth pipeline), never independent deliverables. |
| W-47 | W-47, W-52, W-63 | One fullscreen-behavior ask, layered: base maximized viewport → the actual Fullscreen API toggle → the fixed 1/3–2/3 split, each row's own text names the layering explicitly. |
| W-94 | W-94, W-95 | One consent-then-learn pipeline over one consent contract; W-95 explicitly consumes W-94's gate rather than re-deriving it. |
| W-58 | W-28, W-58 | W-28's own row text states W-58 "is the new authoritative row for this interaction going forward" — the guided-chip mechanism carries forward into W-58's tree, not a separate deliverable. |
| W-92 | W-22, W-92 | W-22's own row text states W-92 is "a strict superset... no independent work remains under W-22's own name." |

Rows explicitly checked and found **not** to be redundant despite
surface similarity, and kept separate: W-48 (pluggable control
*registry* mechanism — distinct from the W-53/88/91 control-redesign
class it can render); W-81 vs. W-82 (visual skin vs. data-correctness
— two different failure modes on the same tab system); W-33 vs. W-52
(W-33's "Open in workspace" button is amended by, not merged into,
W-52 — W-33 is the pre-seeding/panel mechanism, W-52 is the fullscreen
control it also triggers); W-87 vs. W-93 vs. W-24 (three distinct KB
deliverables — advisory aesthetic data, real cited regulatory
baselines, and the compliance-engine logic itself — that reference
each other but do not overlap in content).

---

## Flagged Gaps — candidate new rows for operator review

Listed here only because a real, verified search of `docs/TASK_BOARD.md`
(current table, all 97 rows read in full) and `docs/EXECUTION_LEDGER.md`
found no row — under this ID or any other name — covering the ask.
None of these are seeded onto `docs/TASK_BOARD.md` by this document.

1. **W-35 / W-35a (PHOTO_ENTRY / IMG2THREEJS_DUE_DILIGENCE).**
   `docs/ACTIVITY_LOG.md`'s own 2026-09-04 entry records "SCRIBE seeded
   W-35a IMG2THREEJS_DUE_DILIGENCE + W-35 PHOTO_ENTRY," and the board's
   own Notes section (row ~275) still describes their split scope
   (W-35a = ATLAS-verified adopt/pattern/reject verdict on
   `img2threejs/img2threejs`; W-35 = MASON's photo-entry-screen UI +
   guided checklist, deliberately not blocked on W-35a's verdict). But
   neither row exists in the current `docs/TASK_BOARD.md` table, and
   neither is referenced in `docs/EXECUTION_LEDGER.md` — unlike
   W-37/W-38/W-39/W-50/W-90/W-93, which suffered the same
   branch-rebuild loss but were explicitly recovered by PI's or
   SCRIBE's 2026-09-08 reconciliation passes. This looks like the same
   class of loss, simply not yet caught. Real ask, real prior seeding,
   currently no row.

2. **W-18, W-19, W-21 — CLOSED 2026-09-09 (PI reconciliation
   dispositions pass), no longer an open gap.** Multiple later
   instructions reference these IDs directly (W-22's original
   dependency list named W-21; `docs/UX_FLOW.md` was asked to cite
   W-19 and W-21 as acceptance references), but no real ask was ever
   captured for any of the three despite being flagged three separate
   times over five days (2026-09-04 seeding entry, TASK_BOARD.md's own
   Notes, `docs/UX_FLOW.md`'s Notes) — the operator/conductor never
   supplied the missing scope. Per the operator's disposition
   instruction ("capture the referenced asks as real rows, or mark
   formally ABANDONED with reason — references without rows are
   debt"), formally closed on `docs/TASK_BOARD.md` as ABANDONED rather
   than left open indefinitely or fabricated: reason recorded is "no
   real scope ever supplied despite repeated flags," not invented
   content standing in for a real ask.

3. **W-86 — RESOLVED 2026-09-09 (PI reconciliation dispositions
   pass), no longer an open gap.** Named as a live step in the
   operator's own MASON assignment sequence (2026-09-08), but no W-86
   row, seeding commit, or authored deliverable ever existed anywhere
   on disk under any branch name, and no real ask was ever supplied
   for it despite being flagged since it first appeared. Per the
   operator's disposition instruction ("either seed with owner and
   deliverable or strike every reference"), struck from
   `docs/seats/MASON.md`'s assignment sequence rather than seeded as a
   fabricated row. The number itself remains an intentionally-unused
   gap in the operator's own numbering (same convention as
   W-107/W-108) — not a debt item.

4. **W-64 BOOTSTRAP_LAUNCH's original scope.** Only a later amendment
   ("bootstrap = zero investor dependency, not reduced features; the
   full roadmap ships on free tiers; premium data sources are upgrades,
   not gates") is on disk. The row it amends — its envelope, eligible
   seat, and original acceptance criteria — was never found. Listed
   here in addition to its entry in section L above because the
   amendment text alone cannot substitute for a real scoped ask; the
   operator (or whoever holds the original instruction) is the only
   source that can close this.

5. **`docs/OPERATOR_INBOX.md` open question on W-79's original
   reference** was resolved (the re-spec that produced W-79a..g) —
   checked and confirmed covered, not listed as a gap. **The W-75
   Plausible public-host question** remains open but already has a
   real board row (W-75, STUCK) recording it — not a gap, listed here
   only to confirm it was checked and correctly excluded.

No other operator instruction found in the 2026-09-04-onward portion of
`docs/ACTIVITY_LOG.md` (each entry there is SCRIBE's own seeding log,
one per board row) was found to lack board coverage — every other
seeding entry maps directly to a row already in section A-L above.

## M. 2026-09-08 additions — dedupe-first mapping, then new rows

Four operator instructions arrived in sequence, each explicitly
requiring the dedupe/mapping check to run BEFORE any new row is
created, "so nothing doubles." Mapping shown first, new rows after.

**Dedupe mapping (no new rows created for these):**

| Operator ask | Maps to (existing) | Why no new row |
|---|---|---|
| "actual 3D V-Ray render" | W-92 PHOTOREAL_VIEWPORT | W-92's acceptance already demands PBR materials, sun-by-location, ACES tone mapping, SSAO — "no grey boxes" is that row's own stated goal, not a new ask. |
| "interdependent products update live" | W-82 LIVE_CROSS_PRODUCT | W-82's own acceptance is exactly this: a mutation on one product page live-recomputes on every other. |
| "plan quality" (pre-draw data consideration, real drawing output) | extends W-55 PLAN_QUALITY / PLAN_AUDIT (still READY) | W-55 already wires dimensional standards into generation with a deterministic audit gate; W-104 (new, below) is the drawing-fidelity extension of the same generation pipeline, not a competing row. |
| "vector-editing concept" | W-76 CONCEPT_SPEC_PENPOT (DONE) | W-76 is the concept-source spec this pattern already traces to; W-105 (new, below) is the full editor built on that concept, not a duplicate of the concept-spec ask itself. |
| "analysis [recomputes on edit]" | extends W-102 (new, below, itself a W-82 instance) | Kept as one row, not split. |
| "3D editing" | touches W-105 (plan-vector editing) but is a distinct ask — 3D direct-modeling (push/pull, SketchUp-class) is NOT the same surface as 2D plan-vector editing | New row W-110, not merged into W-105. |
| "BOQ/QS [Procore-class]" | extends the existing BOQPro-tagged row family (no single existing row covers Procore-class QA/QS specifically) | New row W-111, not a duplicate — nearest existing rows (W-24 COMPLIANCE_ENGINE, W-82) are dependencies, not the same ask. |

**New rows seeded on `docs/TASK_BOARD.md` (full text there, summarized here with ASK-SOURCE):**

| ID | ASSIGNEE | PRODUCT | ASK-SOURCE | Status |
|----|----------|---------|------------|--------|
| W-99 PLAN_FIRST_GEN | MASON | CROSS | Operator 2026-09-08: "engine generates the 2D plan ON the plot ground first...plan is source of truth for every downstream product." | READY |
| W-100 BUILD_REEL | MASON (logic) + RIVET (staging) | CROSS | Operator 2026-09-08: "scrubbable construction-sequence animation...the 'small animation reel' of the overall build." | READY |
| W-101 VIEW_MODES | MASON + RIVET | CROSS | Operator 2026-09-08: "level-by-level isolate, iso, side, four elevations, and BELOW-GROUND view." | READY |
| W-102 LIVE_STRUCTURAL | MASON | Structura | Operator 2026-09-08: "every element move/alter recomputes structural analysis live...propagates per W-82." Amended same day per W-109: STAAD/Tekla-class acceptance (IS 1893/875/800/456, calc report). | READY |
| W-103 PLAN_ENGINE_OPEN_SOURCE | ATLAS | DesignStudio (research) | Operator 2026-09-08: "survey every open source for the in-house plan engine, licenses verified." | READY |
| W-104 PLAN_QUALITY_GEN | MASON | CROSS | Operator 2026-09-08: "engine considers ALL architectural data BEFORE drawing...produces a real drawing...DXF export on named layers." | READY |
| W-105 PLAN_EDITOR | MASON (logic) + RIVET (UI) | CROSS | Operator 2026-09-08: "user-editable lines — drag walls/vertices/openings, dimension-driven edits, grid + endpoint snaps, undo/redo." | READY |
| W-106 LAYOUT_REGRESSION | RIVET | LandIntel then CROSS sweep | Operator 2026-09-08 correction: live-verified overflow/overlap/placeholder/chat-bubble defects on deployed `/products/landintel`. Also amends W-84 and W-69 to HALFWAY pending screenshot proof. | READY |
| W-109 BENCHMARK_TECH_SURVEY | ATLAS | CROSS (research) | Operator 2026-09-08: "deep feature + open-source survey...SketchUp modeling logic...Tekla Structures + STAAD.Pro...Procore QA/QS." | READY |
| W-110 DIRECT_MODELING_UX | MASON (logic) + RIVET (UX) | CROSS | Operator 2026-09-08: "SketchUp-class 3D editing — push/pull on faces, inference snaps...component reuse." | READY |
| W-111 QAQS_PROCORE_CLASS | MASON (logic) + RIVET (UI) | BOQPro+BuildOS | Operator 2026-09-08: "Procore-class QA/QS — IS 1200 measurement sheets, rate analysis, budget vs actual, RFIs, submittals, punch lists, progress tracking." | READY |

Row numbers W-107/W-108 were not used by the operator's own
numbering — an intentional gap consistent with the existing
RULE 15/32/49/86-87 gap convention on this board, not an omission
introduced by SCRIBE.

**Note on scope:** these four instructions were explicitly "push +
proof, NO triggers" — the new rows and W-84/W-69 status amendments are
landed onto `docs/TASK_BOARD.md` itself. This is distinct from, and
does not lift, the separate LIST-BUILDING PHASE halt on RULE 58's
automated drain/trigger spawning, which remains in force until the
operator confirms this master list is complete.

## N. 2026-09-08 correction rows — W-113 + W-85 amendment

| Operator ask | Maps to | Disposition |
|---|---|---|
| "one parcel-context object...ALL ten products read ONLY from it" | No existing row owns a single shared parcel-context binding (W-82 governs live *recompute* propagation once state changes; W-85 governs *detection/resolution* of a location; neither owns the single-object contract across all consuming surfaces) | New row: **W-113 PARCEL_CONTEXT_BINDING** (MASON, CROSS). Row number W-112 intentionally unused (operator numbering gap). |
| "every internet land-finding option present...categorical Land-use stepper replaced by chips" | W-85 LAND_DETECT_IN — this is a live-defect confirmation of requirements W-85 already states (six detection modes; chips-not-sliders cleanup clause), not a new ask | **No new row.** W-85 amended in place: flagged as operator repetition #2, bumped to absolute top of queue, and the specific undiscovered defect (Land-use numeric stepper 0..4 instead of chips) named explicitly for the first time on this row. |

Both land on `docs/TASK_BOARD.md` under the same "push + proof, NO
triggers" scope as §M — board/docs landing only, RULE 58 drain loop
still not invoked.

## O. 2026-09-08 additions — LandIntel deal-context suite (W-114..W-120)

No existing row covers zoning summaries, soil/hazard exposure,
climate-normal profiles, a 100-year history panel, a feasibility
report, an investment-return projection, or the open-geo-data survey
that sources them — all seven are new rows, not merges. All six
non-research rows explicitly read parcel context from **W-113 only**
(no independent sample defaults), consistent with W-113's own
single-source-of-truth contract seeded in §N.

| ID | ASSIGNEE | PRODUCT | ASK-SOURCE | Feeds/depends on |
|----|----------|---------|------------|-------------------|
| W-114 ZONING_SUMMARY | MASON (logic) + CRANE (KB) | LandIntel | Operator 2026-09-08: "zoning per parcel context — codified master-plan regs where sourced, explicit GAP label where not." | W-113, W-24, W-93 |
| W-115 SOIL_HAZARD | MASON (UI) + CRANE (adapters) | LandIntel | Operator 2026-09-08: "soil class + bearing capacity, water-table depth, flood/seismic/cyclone exposure...source + vintage chip." | W-113, W-90, W-120 |
| W-116 CLIMATE_YEAR | MASON (wiring) + CRANE (adapter) | LandIntel+DesignStudio | Operator 2026-09-08: "month-by-month weather profile...design implications wired into W-87 typology." | W-113, W-87, W-120 |
| W-117 HISTORY_100Y | MASON (UI) + CRANE (adapters) | LandIntel | Operator 2026-09-08: "century panel — rainfall extremes, flood/seismic events, land-use change timeline; every item provenance-dated." | W-113, W-120 |
| W-118 FEASIBILITY_REPORT | MASON (logic) + RIVET (layout) | LandIntel | Operator 2026-09-08: "shareable report aggregating lookup + zoning + soil/hazard + climate + history + deal sizing, honesty-labelled throughout." | W-113, W-114, W-115, W-116, W-117 |
| W-119 INVEST_FORECAST | MASON | InvestFlow | Operator 2026-09-08: "land-value + returns projection on normalized index (indicative, per standing honesty rules)." | W-113 |
| W-120 OPEN_GEO_DATA_SURVEY | ATLAS | CROSS (research) | Operator 2026-09-08: "exhaustive open-source survey, per dimension, licenses + access modes verified" across weather/water/soil/hazard/history. | Feeds W-115, W-116, W-117 |

Board/docs landing only, per the operator's own "NO triggers"
instruction — same scope as §M/§N.

## P. 2026-09-08 addition — W-121 HERO_JOURNEY_REIMAGINED

| Operator ask | Maps to | Disposition |
|---|---|---|
| "the five-step 'plot to profit' journey becomes the FIRST module after login...each step shows a REAL live visual clue" | W-69 UX_OVERHAUL's JOURNEY STRIP element (an "interactive animated stepper" with hover-preview, no live embeds, not the first post-login module) | **New row: W-121** (RIVET UI + MASON live embeds, CROSS). W-69's journey-strip text amended in place with a pointer to W-121 — struck through, not deleted, per RULE 3; the rest of W-69's scope (hero teaser, product cards, design-system tokens) is unaffected and still governed by W-69 itself. |

Depends on W-85 (Land step's live mini-map+lookup), W-100 (Build
step's progress/sequence data), W-119 (Invest step's indicative IRR/NPV
figure), and W-52 (workspace-entry prompt on step click) — reuses each
rather than building a parallel path. Board/docs landing only, same
"NO triggers" scope as §M/§N/§O.

## Q. 2026-09-09 — PI reconciliation dispositions (W-35/35a restored,
W-18/19/21 closed, W-86 struck, W-122 override, W-07/09 flagged)

| Item | Ask-source | Disposition |
|---|---|---|
| W-35a/W-35 | Operator 2026-09-09: "re-seed if scope still live in ACTIVITY_LOG/Board Notes, else close formally with reason." | **Restored, not merged/new.** Real content recovered from `docs/ACTIVITY_LOG.md`'s 2026-09-04 seeding entry — genuinely dropped from a later board rewrite, scope confirmed never executed (no landing found in ACTIVITY_LOG or EXECUTION_LEDGER), so restored as still-live READY rows rather than closed. |
| W-18, W-19, W-21 | Operator 2026-09-09: "capture the referenced asks as real rows or mark formally ABANDONED with reason." | **Closed ABANDONED**, each its own row on `docs/TASK_BOARD.md` — no real scope was ever supplied for any of the three despite three flags over five days; not fabricated to fill the gap. |
| W-86 | Operator 2026-09-09: "either seed with owner+deliverable or strike every reference to it from MASON's sequence docs." | **Struck** from `docs/seats/MASON.md`'s assignment sequence — no row/commit/deliverable/ask exists anywhere; not seeded as a fabricated row. |
| W-122 STRUCTURA_SEISMIC_IS1893_2025 | Operator 2026-09-09 (OVERRIDE-1, conductor-logged safety exemption): "update all Structura seismic zone citations/KB to IS 1893:2025 (new Zone VI), verify every dependent output path, headless proof of changed constants." | **New row, explicit override to the current no-new-seeding freeze** — the operator's own exemption, not a resumption of general seeding. MASON (engine/KB) + CRANE (adapters); CRANE verifies actual IS 1893:2025 clause specifics on pull, not asserted here. |
| W-07, W-09 | Operator 2026-09-09: "confirm owners... and flag them priority-next so ATLAS's blocked W-10 can clear in the following drain cycle." | **No reassignment needed** — both already RIVET-owned; flagged PRIORITY-NEXT in place on `docs/TASK_BOARD.md`. |

This is the only new-row seeding under the current freeze — the
explicit OVERRIDE-1 exemption (W-122), not a lift of the freeze
itself. SCRIBE otherwise continues to hold on new task seeding until
PI's next full register shows zero open rows, per the operator's own
standing instruction.
