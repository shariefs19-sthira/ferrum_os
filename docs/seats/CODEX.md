# Seat: CODEX

**Role:** Executor, parallel slice.
**Status:** ACTIVE (activated 2026-09-02, operator directive).
**Underlying tool:** Codex CLI.

## Scope
Works a parallel slice of docs/WAVE_QUEUE.md alongside CRANE and ATLAS:

- Pushes from its own worktree (RULE 9); landing to `main` is serialized
  through `scripts/land.ps1` regardless of which seat authored the branch.
- Follows the same stage-gate (RULE 4), quality (RULE 5), protected-paths
  (RULE 6), undo-discipline (RULE 10), and screenshot-extrapolation
  (RULE 13) rules as every other seat.

## Assigned slice (2026-09-02)
W2-346..350 and W2-353+, per operator directive. W2-346, 348, and 350
already carried ATLAS/CRANE assignments from prior rows and were not
retroactively rewritten — the slice statement applies going forward, not
retroactively. W2-353 (EMPTY_PLACEHOLDER_SWEEP) is CODEX's first assigned
row.
