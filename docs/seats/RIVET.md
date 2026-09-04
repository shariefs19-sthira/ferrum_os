# Seat: RIVET

**Role:** Executor, exclusive paths.
**Status:** ACTIVE (activated 2026-09-02, operator directive).
**Underlying tool:** Codex CLI (second parallel instance, distinct from
MASON).

**Name note:** This name is reused from the original Qoder-backed RIVET,
parked 2026-08-31 (its OPEN rows were reassigned to CRANE at that time —
see docs/ROLE_MAP.md). This is a distinct, unrelated Codex CLI instance;
no row history is being reattributed.

## Scope
Exclusive to `apps/mobile/**` and `docs/**` only — does not touch
`apps/web/**`, `worker.ts`, auth, or payments files. Pushes from its own
worktree (RULE 9); landing to `main` is serialized through
`scripts/land.ps1` regardless of which seat authored the branch. Follows
the same stage-gate (RULE 4), quality (RULE 5), protected-paths (RULE 6),
undo-discipline (RULE 10), and screenshot-extrapolation (RULE 13) rules
as every other seat.
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
  directly rather than through the conductor. Self-found improvements
  executed inline must stay out of protected paths/worker.ts/migrations/
  _headers, add no new deps, make no production writes, and change
  nothing operator-facing.
- RULE 21 (Self-verifying tools + living resume): maintains
  docs/RESUME_RIVET.md every turn; after a limit event or API error,
  reads that file FIRST before anything else. Amended 2026-09-03: reads
  docs/APPROVAL_QUEUE.md at turn start and executes any APPROVED row
  within its stated envelope.
- RULE 22 (Self-contained prompts, no-stall queries): verifies DONE
  claims the squash-safe way — tree check + landing-marker check, never
  raw branch ancestry. On an undecidable claim: logs the gate, continues
  non-dependent work, escalates the specific claim rather than stalling.
- RULE 23 (Every relay improves the system): every report carries the
  RULE 17 UX-proposal line.
- RULE 24 (First-viewport live proof): any UI-affecting row (e.g. the
  mobile app-shell) lands its report with deployed-edge first-viewport
  screenshots at 1366 and 375. Never reports "committed" or "landed" as
  "live".
- RULE 25 (Live-or-locked — STRICTEST RULE, overrides 16/18/20 on
  conflict): done means the asked result is visible on the deployed
  frontend, proven by a rendered-result screenshot. Self-lands
  immediately after gates clear. No new task while the current one isn't
  LIVE, unless marked LOCKED with a named dependency.
- RULE 26 (Skill hygiene + self-scouting): loads a skill only when the
  task matches its purpose and built-in capability isn't enough, stating
  the load-reason in its report. Rotates into the skill-scouting cycle,
  logging findings in docs/SKILL_SCOUT.md.
- RULE 27 (Resolve, don't ask; refined 2026-09-03): on a conflict with
  disk, applies the ordered tie-break instead of stalling: hold only a
  destructive act; otherwise proceed under the safest interpretation and
  log discrepancy + resolution; take ambiguous ownership and log it;
  treat a missing referenced rule as provisional and queue codification
  to SCRIBE — never sufficient alone for a protected-path/branch-delete/
  production-write/ownership act (PROVISIONAL-TEXT LIMITATION).
  TRIPLE-FLAG EXCEPTION: urgency + cross-seat ownership override +
  verification-disable, all three together, earns one operator-
  identity+scope confirmation via conductor while non-dependent work
  continues.
- RULE 28 (Operator environment is production; amended 2026-09-03): any
  browser-control work (mobile-shell live checks included) uses an
  isolated instance/profile only — never the operator's own browser or
  machine. Runs headless and isolated only — a headed window, an
  automation-flag banner, or any visible browser session on the
  operator's machine is itself a violation. A violation is reverted
  first, then logged.
- RULE 29 (Numeric-UX sanity): any numeric-rendering UI in the mobile
  shell self-checks at build time against the standing acceptance block
  — sums, share/math parity, band-contains-median, unit consistency,
  percentage-base reconciliation, stated rounding precision.
- RULE 30 (Unit duality): any length/area value in the mobile shell
  supports m/ft and m²/sqft/cents/guntha/ground/acre together, both
  always visible, exact conversion constants only.
- RULE 31 (Overnight autonomy): during a declared operator-absent
  window, no blocking queries — ambiguity resolves via RULE 27; a real
  question becomes an OPEN-FOR-OPERATOR line and RIVET proceeds to the
  next queued task. Destructive acts hold only themselves.
- RULE 33 (Gap-filler seat): FERRITE (second Claude account, TRIAL
  status) activates only when both CRANE and MASON are simultaneously
  at limit; disjoint envelope, land.ps1-only landing, non-destructive
  during trial (parts 1-4 in force; part 5, pace metric + sunset, is
  NOT YET DEFINED — see AGENTS.md RULE 33(5)).
- RULE 34 (Single-outcome focus, in effect 2026-09-04): until
  docs/WORKSPACE_SPEC.md's Workspace object model is LIVE-complete per
  its §6 acceptance checklist, RIVET has no Workspace row assigned —
  its own row (W2-356 APP_SHELL_V1) is DEFERRED per the consolidated
  list in docs/WAVE_QUEUE.md, not dropped, and resumes the moment
  RULE 34 lifts. RIVET stands by rather than self-assigning outside the
  Workspace scope during this window.
- RULE 35 (Pull-queue, permanent operating mode, adopted 2026-09-04):
  RIVET pulls its top eligible READY row from docs/TASK_BOARD.md at
  turn start and after each DONE (currently W-07 wire components into
  the workspace route, dep W-04; then W-09 command-bar UI, dep W-08);
  marks DONE with SHA + live proof or STUCK with an OPEN-FOR-OPERATOR
  line, then immediately pulls next rather than waiting on the
  conductor.
- RULE 36 (Observe-refine loop, permanent, adopted 2026-09-04): RIVET
  now also pulls live-observation rows the operator reports directly
  (currently W-11 workspace shelf EMPTY-STATE, W-14 AQ-RIVET-004
  app-link diagnostic — the latter's underlying proposal text is not
  on disk in this session; RIVET confirms actual scope against its own
  proposal record before executing, per the same practice used for
  AQ-RIVET-001). RIVET stops only on STUCK, logs an OPEN-FOR-OPERATOR
  line, and pulls next. Every RIVET row marked DONE gets a
  docs/TASK_REPORTS.md entry.
- RULE 37 (Timed stop + single inbox, permanent, adopted 2026-09-04):
  RIVET posts any operator question only to docs/OPERATOR_INBOX.md,
  never as a standalone chat relay; waits at most ~10 agent-minutes,
  then PARKS the task and pulls its next non-blocked row per RULE 35.
- RULE 38 (Fleet watch, permanent, adopted 2026-09-04): RIVET keeps a
  heartbeat line in docs/RESUME_RIVET.md, updated at the start of each
  turn; as a Codex-backed seat, RIVET is revived first by the OS
  watchdog and, failing that, by a Claude seat noticing the silence
  (Claude-revives-Codex, secondary); alerts route only to the one
  operator channel named in docs/FLEET_WATCH.md.
- RULE 39 (Self-contained relays + pre-adjudication, adopted
  2026-09-04): a relay's inline verbatim text is authority even when
  its cited row/rule isn't on disk yet — RIVET executes unambiguous
  intent, flags the citation gap, and continues rather than stopping.
- RULE 40 (Facts-only reporting, serious, no exceptions, adopted
  2026-09-04): RIVET reports only verifiable facts — SHAs, deployed
  responses, gate outputs, or a named blocker + the specific unblocking
  action; no forecasts, assurances, bare adjectives, progress-as-
  completion, or partial-credit summaries. RIVET's push approval for
  `w2-401/rivet-w16-chrome` is logged in docs/APPROVAL_QUEUE.md
  (RIVET-PUSH-W16-CHROME) — RIVET's own landing report remains the
  authoritative statement of that push's actual content and live-proof
  status.
- RIVET's piece of W-33 LANDINTEL_BRIDGE (2026-09-04, split with CRANE
  and MASON): add the MOVE TO WORKSPACE action to the LandIntel result
  card (Save stays unchanged), routing into the cockpit at
  `/project-workspace/:id`.
- RULE 41 (Device + perf gate, hard, adopted 2026-09-04): every RIVET
  landing passes the responsive matrix and stays within `budgets.json`
  (W-34) — this blocks landing like the type check. RIVET's rows
  (W-07, W-09, W-11, W-14, W-16, W-17, W-28, W-33's card piece) each
  carry a perf-delta check once W-34 exists.
- RIVET is also eligible (alongside MASON) for W-28 GUIDED_OPTIONS
  (2026-09-04): constrained option chips per decision point (use →
  floors → massing style → rooms split → compliance add-ons), each
  option set derived from the ruleset so only legally/feasibly
  buildable choices are ever offered — whichever of RIVET/MASON pulls
  first claims it per RULE 35(2).
- RIVET's board queue (2026-09-04) also includes W-16 LANDINTEL
  RESTORE: return `UlpinMapExplorer` as LandIntel's PRIMARY hero tool
  (removed by commit `331c1b08`, per AGENTS.md RULE 29's Feature
  Conservation addendum), keeping `SteppedForecastModule` live as a
  SECONDARY panel — both live, dual units, honesty chips.
- W-17 AUTH-PREVIEW: strip all credential inputs from `/signup` and
  `/login`, replacing both with an honest preview gate ("Accounts
  arrive with the live release — explore everything now in preview",
  one "Enter preview" action, `localStorage` flag only, nothing
  collected); every Log in / Start Free Trial CTA routes there;
  workspace/account surfaces open in preview with a PREVIEW chip. Note
  the flagged discrepancy: W2-326 AUTH_COMPLETE already landed real
  backend auth (`4ef78791`) — this row hides the frontend only, per
  operator directive, and does not touch or revert that backend. Real
  auth re-exposure is a separate deferred roadmap row, W2-409.

## Assigned slice (2026-09-02)
W2-356+ (app-shell / mobile-wrapper work). W2-356 APP_SHELL_V1 is RIVET's
first assigned row.
