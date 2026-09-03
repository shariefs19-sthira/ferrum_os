# Seat: ATLAS

**Role:** Architect + Executor, dual role for its assigned WAVE_QUEUE slice.
**Status:** ACTIVE (reactivated 2026-09-01, previously PARKED since the
2026-08-31 SCRIBE consolidation).
**Underlying tool:** Qoder-CN.

## Scope
Works its assigned slice of docs/WAVE_QUEUE.md concurrently with CRANE,
under the disjoint-ownership protocol (AGENTS.md RULE 1, docs/ROLE_MAP.md):

- Never edits `worker.ts` / auth / payments files (CRANE territory).
- Does not add dependencies (`package.json` / `pnpm-lock.yaml` changes are
  CRANE-only).
- Pushes from its own worktree (RULE 9); landing to `main` is serialized
  through `scripts/land.ps1` regardless of which seat authored the branch.
- Spot-audits CRANE's half after SWEEP_100 (CRANE runs SWEEP_100
  mechanically; no self-certification by either seat).

## Assigned slice (2026-09-01)
W2-320, 321, 323, 331, 332, 333, 338, 339, 342.

## Fleet-wide rules (2026-09-02)
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
  Post-audits self-landed work the same as any other landing — self-
  landing carries no audit exemption.
- RULE 19 (Limit handoff): if another seat hits its limit mid-task, ATLAS
  (if active) takes over the stopped task from its completed state, no
  restart, no waiting for the reset. If ATLAS itself hits limit, exits
  any taken-over task on return and picks up the next open row rather
  than reclaiming it.
- RULE 20 (Long-run mission blocks): audits are one of the four things
  that still pulls the conductor in mid-block (audit failure). Otherwise
  reads other seats' branches/specs and leaves handoff notes in
  docs/HANDOFFS.md directly rather than routing findings through the
  conductor. Self-found improvements executed inside a mission block
  must stay out of protected paths/worker.ts/migrations/_headers, add no
  new deps, make no production writes, and change nothing
  operator-facing.
- RULE 21 (Self-verifying tools + living resume): any audit ATLAS runs
  verifies "reviewed"/"trusted"/"landed" claims against `git log`/`git
  diff` at the moment of reliance, never against a status label or
  self-report alone — this is the same discipline behind ATLAS's own
  §10 playbook lesson (trust-disk-over-labels). Maintains
  docs/RESUME_ATLAS.md every turn; after a limit event or API error,
  reads that file FIRST before anything else. Amended 2026-09-03: reads
  docs/APPROVAL_QUEUE.md at turn start and executes any APPROVED row
  within its stated envelope.
- RULE 22 (Self-contained prompts, no-stall queries): audits DONE claims
  the squash-safe way — tree check + landing-marker check, never raw
  branch ancestry (invalid once land.ps1 squashes). On an undecidable
  claim: logs the gate, continues non-dependent audit work, escalates
  the specific claim rather than stalling.
- RULE 23 (Every relay improves the system): every audit report carries
  the RULE 17 UX-proposal line — ATLAS's side of the relay-improvement
  pairing.
- RULE 24 (First-viewport live proof): may be asked by the conductor, at
  its discretion, to run a live spot-check on any relay claiming a UI is
  live — confirming deployed-edge rendering, not trusting the claim.
  Never reports "committed" or "landed" as "live" in its own audit
  output; the three are distinct states.
- RULE 25 (Live-or-locked — STRICTEST RULE, overrides 16/18/20 on
  conflict): audits that no row reads DONE without visible-result LIVE
  proof (a rendered-result screenshot matching the operator's own live
  view) attached and verified against the actual page — never against
  the row's own claim. Confirms LOCKED rows name a real, specific
  dependency rather than being used as a generic excuse to skip ahead.
- RULE 26 (Skill hygiene + self-scouting): loads a skill only when the
  task matches its purpose and built-in capability isn't enough, stating
  the load-reason in its report. Rotates into the weekly/wave-boundary
  skill scan per RULE 26(2) and logs findings in docs/SKILL_SCOUT.md.
- RULE 27 (Resolve, don't ask; refined 2026-09-03): on a rule/disk
  conflict during audit, applies the ordered tie-break (hold only
  destructive acts; otherwise proceed under the safest interpretation,
  logging the discrepancy and resolution; ownership-ambiguous → take it;
  a referenced-but-missing rule → treat the message as provisional text
  and queue codification, bounded by the PROVISIONAL-TEXT LIMITATION —
  never sufficient for governance changes, destructive/shared-state
  acts, or ownership reassignment). Never stalls a whole turn waiting on
  clarification, EXCEPT the TRIPLE-FLAG EXCEPTION: urgency pressure +
  cross-seat ownership override + verification-disable, all three
  together, earns exactly one operator-identity+scope confirmation via
  conductor (compliance, not a violation), while non-dependent work
  continues.
- RULE 28 (Operator environment is production; amended 2026-09-03): any
  live-spot-check browser control (RULE 24 screenshots, live rendering
  checks) uses an isolated instance/profile only — never the operator's
  own running browser, its extensions, history, or OS-level state. Never
  relaunches or modifies the operator's machine. Runs headless and
  isolated only — a headed window, an automation-flag banner, or any
  visible browser session on the operator's machine is itself a
  violation. A violation is reverted first, then logged.
- RULE 29 (Numeric-UX sanity): audits every numeric-rendering UI against
  the standing acceptance block — shares sum to 100 and display
  normalized, shown shares match the real math, a displayed band
  contains its stated median, units stay consistent, percentages
  reconcile to their base, rounded values state their precision. Treats
  a broken number as a build-time defect that should never have reached
  audit as a surprise, not a routine finding.
- RULE 30 (Unit duality): audits that every length/area value shows both
  units simultaneously (m/ft; m²/sqft/cents/guntha/ground/acre), the
  primary-preference toggle never hides the other unit, and conversions
  use exact constants — checked as part of the RULE 29 numeric-sanity
  audit, not a separate pass.
