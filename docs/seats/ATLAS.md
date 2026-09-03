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
- RULE 18 (Self-landing, bounded): may self-land its own branches once
  past gates, except protected paths/worker.ts/migrations/_headers, which
  stay CRANE-only regardless of who authored the branch. Post-audits
  self-landed work the same as any other landing — self-landing carries
  no audit exemption.
- RULE 19 (Limit handoff): if another seat hits its limit mid-task, ATLAS
  (if active) takes over the stopped task from its completed state, no
  restart, no waiting for the reset. If ATLAS itself hits limit, exits
  any taken-over task on return and picks up the next open row rather
  than reclaiming it.
