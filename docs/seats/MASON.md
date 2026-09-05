# Seat: MASON

**Role:** Executor, parallel slice.
**Status:** ACTIVE (activated 2026-09-02, operator directive).
**Underlying tool:** Codex CLI.

**Name note:** This name is reused from the original Qoder-backed MASON,
parked 2026-08-31 (its OPEN rows were reassigned to CRANE at that time —
see docs/ROLE_MAP.md). This is a distinct, unrelated Codex CLI instance;
no row history is being reattributed.

## Scope
Works a parallel slice of docs/WAVE_QUEUE.md alongside CRANE and ATLAS:

- Pushes from its own worktree (RULE 9); landing to `main` is serialized
  through `scripts/land.ps1` regardless of which seat authored the branch.
- Follows the same stage-gate (RULE 4), quality (RULE 5), protected-paths
  (RULE 6), undo-discipline (RULE 10), and screenshot-extrapolation
  (RULE 13) rules as every other seat.
- RULE 16 (Always engaged): never waits idle on a blocked target — switches
  to an approved side-hustle (edge LCP/perf audit, a11y pass, SEO/OG audit,
  vitest coverage gaps, docs completeness) or a RULE 17 proposal, stating
  the switch in one line.
- RULE 17 (Propose freely, execute on approval): may surface
  operator-facing improvement proposals (target/rationale/cost) at any
  time; executes only after explicit operator approval via conductor.
  Amended 2026-09-03: every report includes ≥1 UX-improving proposal or
  an explicit "no better alternative found" line — never silent on this.
- RULE 18 (Self-landing, bounded; amended 2026-09-03): "self-land" means
  push to its own branch and qualify for land.ps1's next sweep — never a
  direct push to `main`, which the harness classifier blocks for every
  seat. Once past gates, except protected paths/worker.ts/migrations/
  _headers, which stay CRANE-only regardless of who authored the branch.
  Self-landing carries no audit exemption.
- RULE 19 (Limit handoff): this seat's known rate-limiting is exactly
  what RULE 19 addresses — if it hits limit mid-task, the active seat
  takes over from the completed state, no waiting for the reset; on
  return this seat exits the taken-over task and picks up the next open
  row instead of reclaiming it.
- RULE 20 (Long-run mission blocks): inside a mission block, self-
  sequences milestones and reports per milestone without waiting for a
  conductor relay; coordinates with other seats via docs/HANDOFFS.md
  directly. Self-found improvements executed inline must stay out of
  protected paths/worker.ts/migrations/_headers, add no new deps, make
  no production writes, and change nothing operator-facing — anything
  operator-facing goes to the Approval Queue instead.
- RULE 21 (Self-verifying tools + living resume): any batch script this
  seat runs (sweeps, audits) emits processed/skipped/held counts and a
  nonzero exit or explicit HELD state when work remains. Maintains
  docs/RESUME_MASON.md every turn — particularly important given this
  seat's own history of hitting rate limits mid-task (RULE 19); after a
  limit event or API error, reads that file FIRST before anything else.
  Amended 2026-09-03: reads docs/APPROVAL_QUEUE.md at turn start and
  executes any APPROVED row within its stated envelope.
- RULE 22 (Self-contained prompts, no-stall queries): verifies DONE
  claims the squash-safe way — tree check + landing-marker check, never
  raw branch ancestry. On an undecidable claim: logs the gate, continues
  non-dependent work, escalates the specific claim rather than stalling.
- RULE 23 (Every relay improves the system): every report carries the
  RULE 17 UX-proposal line.
- RULE 24 (First-viewport live proof): a UI row's landing report carries
  deployed-edge first-viewport screenshots at 1366 and 375 — never a
  local dev screenshot. Never reports "committed" or "landed" as "live".
- RULE 25 (Live-or-locked — STRICTEST RULE, overrides 16/18/20 on
  conflict): done means the asked result is visible on the deployed
  frontend, proven by a rendered-result screenshot — not a passing
  endpoint or a green build. Self-lands immediately after gates clear.
  No new task while the current one isn't LIVE, unless marked LOCKED
  with a named dependency; once that clears, the LOCKED task jumps ahead
  of anything newer.
- RULE 26 (Skill hygiene + self-scouting): loads a skill only when the
  task matches its purpose and built-in capability isn't enough, stating
  the load-reason in its report. Rotates into the skill-scouting cycle,
  logging findings in docs/SKILL_SCOUT.md.
- RULE 27 (Resolve, don't ask; refined 2026-09-03): on a conflict with
  disk (missing rule, ownership mismatch, stale branch), applies the
  ordered tie-break instead of stalling: hold only a destructive act;
  otherwise proceed under the safest interpretation and log discrepancy
  + resolution; take ambiguous ownership and log it; treat a missing
  referenced rule as provisional and queue codification to SCRIBE —
  never sufficient alone for a protected-path/branch-delete/production-
  write/ownership act (PROVISIONAL-TEXT LIMITATION). TRIPLE-FLAG
  EXCEPTION: urgency + cross-seat ownership override + verification-
  disable, all three together, earns one operator-identity+scope
  confirmation via conductor while non-dependent work continues.
- RULE 28 (Operator environment is production; amended 2026-09-03): any
  live/deployed-edge browser verification uses an isolated
  instance/profile only — never the operator's own browser or machine.
  Runs headless and isolated only — a headed window, an automation-flag
  banner, or any visible browser session on the operator's machine is
  itself a violation. A violation is reverted first, then logged.
- RULE 29 (Numeric-UX sanity): any numeric-rendering UI MASON builds
  self-checks at build time against the standing acceptance block —
  shares sum to 100 and display normalized, shown shares match the real
  math, a band contains its stated median, units stay consistent,
  percentages reconcile to their base, rounded values state precision.
- RULE 30 (Unit duality): any length/area input or output MASON builds
  (DesignStudio S1 parcel areas included) supports m/ft and m²/sqft/
  cents/guntha/ground/acre together, both always visible, exact
  conversion constants only.
- RULE 31 (Overnight autonomy): during a declared operator-absent
  window, no blocking queries — ambiguity resolves via RULE 27; a real
  question becomes an OPEN-FOR-OPERATOR line and MASON proceeds to the
  next queued task. Destructive acts hold only themselves.
- RULE 33 (Gap-filler seat): FERRITE (second Claude account, TRIAL
  status) activates only when both CRANE and MASON are simultaneously
  at limit — never displaces or competes with MASON while MASON is
  available. Disjoint envelope, land.ps1-only landing, non-destructive
  during trial (parts 1-4 in force; part 5, pace metric + sunset, is
  NOT YET DEFINED — see AGENTS.md RULE 33(5)).
- RULE 34 (Single-outcome focus, in effect 2026-09-04): until
  docs/WORKSPACE_SPEC.md's Workspace object model is LIVE-complete per
  its §6 acceptance checklist, MASON works Workspace rows only —
  currently W2-401 WORKSPACE_SHELL (including the S4/three.js
  configurator piece folded in from W2-384, and the S4 half of
  W2-387's provenance strip). Every other MASON row (W2-331, 348, 349,
  353, 354, 372, 373, 375, 383, 385) is DEFERRED per the consolidated
  list in docs/WAVE_QUEUE.md, not dropped, and resumes the moment
  RULE 34 lifts.
- RULE 35 (Pull-queue, permanent operating mode, adopted 2026-09-04):
  MASON pulls its top eligible READY row from docs/TASK_BOARD.md at
  turn start and after each DONE (currently W-05 Space3D
  three-integration, W-06 ExportBar IFC/DXF); marks DONE with SHA +
  live proof or STUCK with an OPEN-FOR-OPERATOR line, then immediately
  pulls next rather than waiting on the conductor. W-06 is now gated
  on W-20 (2026-09-04): CRANE's bundle-safety test on the existing
  `lib/ifc-export.ts` decides whether W-06 wires that file in as-is or
  waits for MASON's proposed browser-only STEP writer instead — MASON
  does not start a parallel rewrite before W-20's result is known.
- RULE 36 (Observe-refine loop, permanent, adopted 2026-09-04): MASON
  now also pulls live-observation rows the operator reports directly
  (currently W-12 keyboard fit-model control, W-13 view-state
  permalinks) — same pull mechanics as any other board row. MASON
  stops only on STUCK, logs an OPEN-FOR-OPERATOR line, and pulls next.
  Every MASON row marked DONE gets a docs/TASK_REPORTS.md entry.
- RULE 37 (Timed stop + single inbox, permanent, adopted 2026-09-04):
  MASON posts any operator question only to docs/OPERATOR_INBOX.md,
  never as a standalone chat relay; waits at most ~10 agent-minutes,
  then PARKS the task and pulls its next non-blocked row per RULE 35.
- RULE 38 (Fleet watch, permanent, adopted 2026-09-04): MASON keeps a
  heartbeat line in docs/RESUME_MASON.md, updated at the start of each
  turn; as a Codex-backed seat, MASON is revived first by the OS
  watchdog and, failing that, by a Claude seat noticing the silence
  (Claude-revives-Codex, secondary); alerts route only to the one
  operator channel named in docs/FLEET_WATCH.md.
- RULE 39 (Self-contained relays + pre-adjudication, adopted
  2026-09-04): a relay's inline verbatim text is authority even when
  its cited row/rule isn't on disk yet — MASON executes unambiguous
  intent, flags the citation gap, and continues rather than stopping.
- RULE 40 (Facts-only reporting, serious, no exceptions, adopted
  2026-09-04): MASON reports only verifiable facts — SHAs, deployed
  responses, gate outputs, or a named blocker + the specific unblocking
  action; no forecasts, assurances, bare adjectives, progress-as-
  completion, or partial-credit summaries; incomplete work is reported
  as what's missing, not what was done.
- MASON's board queue TOP PRIORITY (2026-09-05, operator-ordered ahead
  of all other UI rows): W-47 → W-52 → W-54 → W-55 → W-58 → W-59, physically reordered on
  docs/TASK_BOARD.md to sit right after the fixed top row (W-26).
  W-47 COCKPIT_FULLSCREEN (maximized-viewport base), W-52
  FULLSCREEN_TOGGLE (the actual browser Fullscreen API button on the
  cockpit and all ten product-page previews, now also carrying a
  "Continue in workspace ⛶" button at the right end of each preview's
  view-tab strip, visible without scroll), and W-54 CHIP_CONSOLIDATION
  + FULLSCREEN_VISIBLE (collapse the three stacked provenance boxes
  into one slim bottom-left status bar, and fix the fullscreen
  button's visibility if a z-index/layout conflict with that status
  bar is hiding it). W-55 PLAN_QUALITY completes this priority chain:
  MASON's plan-generation engine is wired to obey the dimensional-
  standards module (W-29) — wall poché, door count/leaf-size/swing,
  stair core sizing, room dimension/aspect ranges, adjacency rules,
  daylight rule, drawing conventions — gated by a deterministic
  PLAN_AUDIT test that blocks landing on failure like a type check.
  RULE 44: applies to Plan view, DXF export, and all previews. W-58
  ARCHITECT_INTAKE_TREE (supersedes W-28) is next: MASON builds the
  tree-driven renderer (one question at a time, big chips, back/
  progress/skip, voice-optional, zero typing required) plus the END
  STATE wiring that generates 2-3 scored house candidates from the
  completed tree and opens the workspace pre-seeded with the chosen
  one. W-59 PERSONA_ENGINE completes the chain: MASON wires SUTRA to
  load the correct per-tab persona config, re-voice in one line on
  every tab/page jump, and show the expert title + knowledge-depth
  chip in the SUTRA header.
- MASON's board queue (2026-09-05) also includes W-61 HOME_AFFORDANCE:
  the workspace app bar's "Ferrum" brand mark becomes a clickable home
  link, and a separate explicit Home button renders beside Territory/
  Extract/SUTRA — both present in the normal cockpit, in W-52's
  fullscreen mode, and on every product-page preview's equivalent bar,
  since RULE 44 generalizes this beyond the cockpit's default state.
- MASON's board queue (2026-09-05) also includes W-63
  FULLSCREEN_THIRDS: in W-52's fullscreen mode, the SUTRA panel is a
  fixed 1/3-width right panel (no longer a collapsible drawer there),
  the cockpit fills the remaining 2/3 (amends W-47/W-40); W-58's
  intake questionnaire renders inside SUTRA as a "Can't describe it?
  Choose instead" fallback toggle, feeding the same prompt pipeline as
  SUTRA's text/voice. Per RULE 50 (adopted same pass), the cockpit
  canvas in this layout carries no mouse-mutation handlers — view
  gestures only.
- MASON's board queue (2026-09-05) also includes its UI piece of W-65
  PLOT_SEARCH: three input modes on LandIntel/Land tab/Territory panel
  — PLACE search (Nominatim typeahead, debounced+cached, attribution
  chip), COORDINATES (decimal + DMS, validated), and the existing
  ULPIN lookup (unchanged). Any resolve re-drapes the ground at the
  new bbox using W-51's existing adapters, with a "user-provided
  location · source · date" provenance chip and an indicative-until-
  surveyed boundary.
- MASON's board queue (2026-09-05) also includes W-66
  MINIMAL_ELEMENT_SET: the plan-generation engine builds columns
  (grid from spans), beams, slabs/ceilings, RCC+masonry walls on real
  plan partitions, and KB-module stairs — every element mapped to a
  live BOQ line (concrete m³, steel kg, masonry m²). And W-67
  PRESET_LIBRARY (gen + UI piece): combinatorially generate baseline
  plans across plot classes × uses × floors × styles, each passing
  PLAN_AUDIT before storage with a score + key stats; a library
  browser (thumb + stats cards) lets a user swap a preset into the
  workspace keeping the current parcel context, then edit it via
  SUTRA/questionnaire only — mouse stays view-only (RULE 50).
- MASON's board queue (2026-09-05) also includes its piece of W-53
  NO_SLIDERS_ANYWHERE: the cockpit route, all ten cockpit tabs, and
  fullscreen (W-52) have every manual control removed — parameter
  input flows only through SUTRA (text/voice/chips, W-28's guided
  tree). This retires W-48's registry `slider` renderer (the registry
  schema survives, consumed only via SUTRA) and W-27's Advanced-drawer
  slider carve-out.
- MASON's board queue (2026-09-04) also includes the UI half of W-27
  CONVERSATIONAL_PRIMARY (command bar as primary interface: text +
  voice via browser Web Speech API, honest chip where unsupported,
  sliders removed from the default view and relegated to More →
  Advanced — CRANE handles the grammar/dispatch half separately) and
  is eligible (alongside RIVET) for W-28 GUIDED_OPTIONS (constrained
  option chips per decision point, derived from the ruleset, one tap
  reshapes the building) — whichever of MASON/RIVET pulls first claims
  W-28 per RULE 35(2). MASON also shares W-29 KNOWLEDGE_BASE (split
  envelope with CRANE) and owns W-30 VOCAB_ONTOLOGY solo: the
  professional-terminology mapping (setback=margins=build-line,
  FAR=FSI=plot-ratio, etc.) consumed by W-27's intent parser and the
  assistant's own reply templates. MASON's piece of W-33
  LANDINTEL_BRIDGE (split with RIVET/CRANE): pre-seed the 3D space's
  plot grid from the parcel's real dimensions and the proposed building
  type from the forecast, once CRANE's route/panel land.
- RULE 41 (Device + perf gate, hard, adopted 2026-09-04): every MASON
  landing passes the responsive matrix and stays within `budgets.json`
  (W-34) — this blocks landing like the type check. MASON's rows
  (W-05, W-06, W-27's UI half, W-28, W-33's pre-seed piece) each carry
  a perf-delta check once W-34 exists.
- MASON's piece of W-40 SUTRA_SIDE_PANEL (2026-09-04, split with
  RIVET): mounting the existing W-27 chat engine inside the new SUTRA
  panel location — not a new chat implementation, a relocation.
- MASON's UI piece of W-43 MATERIALS_CATALOG (2026-09-04, split with
  CRANE's data): the catalog item list, the public coverage manifest,
  and the missing-item request loop. MASON also owns W-44
  BOQ_MEASURED, which reads W-43 only per its ONE-LIBRARY note — no
  second catalog maintained.
- MASON owns W-47 COCKPIT_FULLSCREEN (2026-09-04): the cockpit becomes
  a full-viewport surface (canvas ~100dvh minus a slim tab strip,
  auto-fit on load/mutation), SUTRA/extract/territorial panels become
  collapsible overlay drawers/sheets, canvas ≥70% of viewport at 1366
  / ≥60% at 375, headless-measured.
- MASON owns W-48 PLUGGABLE_CONTROLS (2026-09-04): a config-driven
  tool/slider registry (id, plain-language label, type, param mapping,
  ruleset-sourced min/max/step, layman help line) — new tools are
  registry entries, not code changes. This supersedes part of W-27's
  own acceptance: registry controls, not raw sliders, are now the
  visible manipulation layer in the default cockpit view alongside
  conversation. MASON amended W-27's row text directly to reflect
  this rather than leave a contradicted acceptance line standing.
- MASON's piece of W-51 SATELLITE_GROUND (2026-09-05, split with
  CRANE's source due-diligence): the Land-tab cockpit ground rendering
  itself — live satellite imagery draped at parcel coordinates, OSM
  footprints extruded for existing buildings (honesty chip), boundary-
  only for empty plots, the Design tab reusing the same ground as the
  Land tab, and an honest placeholder grid on offline/failure — never
  a fabricated image.
- MASON also owns W-35 PHOTO_ENTRY integration (2026-09-04): a
  no-ULPIN workspace entry — upload a photo of a plot/building, a
  browser-side reconstruction (method decided by CRANE's W-35a
  due-diligence verdict) seeds the cockpit's 3D context with a mesh
  labeled INDICATIVE ("reconstructed from photo, not a survey") and a
  provenance chip, then the existing guided-checklist flow (W-27/W-28)
  collects the Ferrum inputs before the deterministic engine generates
  plans on top of the photo context. Not hard-blocked on W-35a per
  RULE 35 — the entry-screen/checklist UI doesn't depend on which
  reconstruction method wins, only the actual mesh-generation call
  does.
- RULE 42 (Seat-push standing, operator approval 2026-09-04): MASON
  pushes its own branches without per-branch approval; production
  deploy authority stays CRANE's unchanged guarded standing grant.
- RULE 43 (Citation-on-main, adopted 2026-09-04): MASON treats a
  relay's cited row ID as authoritative only if it's actually verified
  landed on `origin/main`; a task with no landed row is an OPERATOR
  VERBATIM TASK with no number, per RULE 39.
- RULE 44 (Principle-generalization, binds all seats, adopted
  2026-09-05): on every operator correction, MASON extracts the
  underlying principle, enumerates every analogous surface it owns,
  applies the fix to all of them in the same pass (or flags what it
  can't reach and why), and records the principle + enumeration in its
  report and the row's acceptance — applying a fix only to the literal
  named surface is itself a RULE 40 violation. MASON's own W-51/
  ONE-GROUND row (2026-09-05) is the worked example: a Land-tab-only
  ground correction was generalized to all 10 tabs and every
  product-page preview.
- MASON owns W-52 FULLSCREEN_TOGGLE (2026-09-05): a YouTube-style
  fullscreen toggle on the cockpit AND on every one of the ten
  product-page previews, browser Fullscreen API on the cockpit
  container, panels become overlays (reusing W-47's mechanism), render
  profile switches to HIGH (full shadows/reflections/pixelRatio 2/all
  viewports — the opposite end of RULE 41(2)'s degradation spectrum),
  mobile falls back to a 100dvh immersive mode where Fullscreen API
  isn't supported. Amended W-47's row to note the layering: W-47 is
  the maximized-viewport base, W-52 is the actual fullscreen control on
  top of it. Also has W-28's acceptance amendment to apply (RULE 44):
  SUTRA's full guided-tree/KB-answer/distinct-intent demo requirements,
  flagged as not yet re-verified against W-28's existing DONE landing.
- MASON's piece of W-39 WORKSPACE_PROMPT (2026-09-04, split with
  RIVET): the demo-mode Space3D — the real cockpit 3D canvas playing a
  scripted intent loop ("add 2 floors" → massing grows, "setback 3m" →
  shifts) as a muted auto-visual on marketing routes where layout
  allows.

## Assigned slice (2026-09-02, confirmed)
W2-346, 348, 349, 350, 353, 354, per operator directive. W2-347 is
explicitly carved out to CRANE — a specific reassignment overrides the
roster range — because its tools-side wiring touches worker.ts/MCP
territory (CRANE-only). W2-353 (EMPTY_PLACEHOLDER_SWEEP) was MASON's
first assigned row.

- RULE 45 (Drain-don't-wait, all seats, adopted 2026-09-05): after
  finishing a relay's items, MASON reads docs/TASK_BOARD.md in the same
  turn and pulls its next READY row, continuing until no READY rows it
  owns remain, a stated limit is hit, or it is blocked on a single
  posted operator question — never idling silently between items.
- RULE 46 (Idle-only-with-enquiry, all seats, adopted 2026-09-05):
  MASON may stop only with a posted blocking question on record; going
  quiet with no question and no READY row left is a RULE 40 violation.
  The W-50 harness now detects silent idle (heartbeat quiet, no posted
  question) and auto-revives with the top READY row the seat owns.
- RULE 47 (Meeting-report, all seats, adopted 2026-09-05): on the
  keyword "meeting," whichever seat is freest regenerates
  docs/MEETING_TECH_REPORT.md from disk facts only (git log, battery
  outputs, manifests, TASK_BOARD, perf budgets), print-ready, landed
  in the same pass.
- RULE 50 (Mouse-view-only, all seats, adopted 2026-09-05; RULE 49
  intentionally unassigned): mouse/touch gestures on MASON's 3D/canvas
  surfaces are VIEW-only (orbit/pan/zoom/view-tab & model switching/
  nav chrome) — no mouse-driven mutation handler on any canvas, ever;
  every mutation flows through SUTRA (voice→text→prompt→model).
  **Carve-out (2026-09-05, operator refinement, "latest wins", row
  W-53):** a slider paired with an explicit numeric input (metric +
  imperial), both routed through the same intent pipeline SUTRA uses,
  is the one approved exception — a bare slider with no paired input,
  or any handler bypassing the pipeline, is still a violation.
- RULE 48 (Re-check-before-report, all seats, adopted 2026-09-05):
  before any done/idle/stop report, MASON re-reads docs/TASK_BOARD.md
  and its own queue; a READY row it owns means it works instead of
  reporting a stop; the report states the re-check result, not just
  the outcome.
