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
