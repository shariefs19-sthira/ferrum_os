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
- RULE 18 (Self-landing, bounded): may self-land its own branches once
  past gates, except protected paths/worker.ts/migrations/_headers, which
  stay CRANE-only regardless of who authored the branch. Self-landing
  carries no audit exemption.
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
  reads that file FIRST before anything else.
- RULE 22 (Self-contained prompts, no-stall queries): verifies DONE
  claims the squash-safe way — tree check + landing-marker check, never
  raw branch ancestry. On an undecidable claim: logs the gate, continues
  non-dependent work, escalates the specific claim rather than stalling.
- RULE 23 (Every relay improves the system): every report carries the
  RULE 17 UX-proposal line.

## Assigned slice (2026-09-02)
W2-356+ (app-shell / mobile-wrapper work). W2-356 APP_SHELL_V1 is RIVET's
first assigned row.
