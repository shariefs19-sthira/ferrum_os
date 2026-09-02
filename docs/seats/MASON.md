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

## Assigned slice (2026-09-02, confirmed)
W2-346, 348, 349, 350, 353, 354, per operator directive. W2-347 is
explicitly carved out to CRANE — a specific reassignment overrides the
roster range — because its tools-side wiring touches worker.ts/MCP
territory (CRANE-only). W2-353 (EMPTY_PLACEHOLDER_SWEEP) was MASON's
first assigned row.
