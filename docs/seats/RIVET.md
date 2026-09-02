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

## Assigned slice (2026-09-02)
W2-356+ (app-shell / mobile-wrapper work). W2-356 APP_SHELL_V1 is RIVET's
first assigned row.
