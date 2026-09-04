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
  pulls next rather than waiting on the conductor.
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

## Assigned slice (2026-09-02, confirmed)
W2-346, 348, 349, 350, 353, 354, per operator directive. W2-347 is
explicitly carved out to CRANE — a specific reassignment overrides the
roster range — because its tools-side wiring touches worker.ts/MCP
territory (CRANE-only). W2-353 (EMPTY_PLACEHOLDER_SWEEP) was MASON's
first assigned row.
