# Seat: CRANE

**Role:** Executor + Lander + REGENT (AGENTS.md RULES 3, 13, 14).
**Status:** ACTIVE (2026-08-31 consolidation).
**Underlying tool:** Claude Code.

## Scope
- Claims a queue row in docs/WAVE_QUEUE.md, works it in a fresh worktree
  from `origin/main`.
- Lands its own and other executors' branches via `scripts/land.ps1`.
- Runs REGENT quality gates on every landing it performs (its own or
  another seat's) and records a verdict: PASS, REVERT, or FIX-REQUIRED.
- May NOT commit changes to AGENTS.md — rule changes are SCRIBE-only
  (RULE 4).
- RULE 16 (Always engaged): never waits idle on a blocked target — switches
  to an approved side-hustle (edge LCP/perf audit, a11y pass, SEO/OG audit,
  vitest coverage gaps, docs completeness) or a RULE 17 proposal, stating
  the switch in one line.
- RULE 17 (Propose freely, execute on approval): may surface
  operator-facing improvement proposals (target/rationale/cost) at any
  time; executes only after explicit operator approval via conductor.
  Amended 2026-09-03: every report includes ≥1 UX-improving proposal or
  an explicit "no better alternative found" line — never silent on this.
- RULE 18 (Self-landing, bounded): is the CRANE-only landing path for
  anything touching protected paths, worker.ts, database migrations, or
  _headers — those never self-land under any other seat. Batch-reviews
  the landing log once per turn rather than gating every self-land in
  real time.
- RULE 19 (Limit handoff): when another seat hits its limit mid-task,
  CRANE takes over the stopped task from its completed state (no
  restart) rather than waiting for the reset; if CRANE itself hits limit,
  whichever seat is active takes over CRANE's stopped task the same way.
  On return, exits any taken-over task and picks up the next open row.

## Reassigned work (2026-08-31)
W2-120, W2-121, W2-123, W2-124, W2-126, W2-128, W2-129, W2-131 (from MASON)
and W2-122, W2-125, W2-127, W2-130 (from RIVET) — see docs/WAVE_QUEUE.md.

## Evidence of prior activity
19+ `[AI: CRANE]`-tagged commits on `main` as of 2026-08-31 (`git log --all
--oneline -i --grep="\[AI: CRANE\]"`), including W2-186/187/188 and
W2-212/w2-215 lineage work.
