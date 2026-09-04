# TASK_BOARD.md — Pull-queue (AGENTS.md RULE 35)

Seeded 2026-09-04. While AGENTS.md RULE 34 (single-outcome focus) is in
effect, every row here is a Workspace row — everything else stays
DEFERRED-per-RULE-34 in docs/WAVE_QUEUE.md, not on this board at all.

Per RULE 35(2): a seat claims the top READY row it's eligible for whose
deps are DONE and whose envelope overlaps no CLAIMED row, executes,
marks DONE with SHA + live proof, then immediately pulls next. Per
RULE 35(4): seats update this board only on DONE or STUCK.

| ID | Title | Envelope (files) | Eligible seats | Acceptance | Deps | Status |
|----|-------|-------------------|-----------------|------------|------|--------|
| W-01 | Migration + save200 | D1 migration file(s), the workspace save/persist endpoint | CRANE | Migration applies clean on the deployed D1 instance; a save call returns 200 against the deployed edge, verified by an actual request, not a local smoke test | — | CLAIMED (CRANE) |
| W-02 | Add `three` dependency | `apps/web/package.json`, `pnpm-lock.yaml` | CRANE | `three` installed as the single approved new dependency (per W2-380's operator approval, RULE 1 dependency-addition rule — CRANE-only); build stays green | — | READY |
| W-03 | `lib/types.ts` integration merge | `apps/web/lib/types.ts` | CRANE | Workspace object-model types (WorkspaceProject/Artifact per WORKSPACE_SPEC.md §1) merged into the shared contract file with no breaking change to existing consumers; typecheck green | W-02 | READY |
| W-04 | page.tsx assembly — mount RIVET comps + MASON canvas | the workspace route's `page.tsx` | CRANE | RIVET's rail components and MASON's 3D canvas both mount without collision on the deployed edge; first-viewport screenshot at 1366 + 375 per RULE 24 | W-03 | READY |
| W-05 | Space3D three-integration + gates + proofs | the 3D configurator component(s) (MASON's S4/three.js piece, folded from W2-384 into W2-401) | MASON | Plot-anchored 3D view renders on the deployed edge; RULE 2 structural pass/fail gate wired live; RULE 29/30 numeric/unit obligations verified on-screen; live proof attached | W-02 | READY |
| W-06 | ExportBar — IFC/DXF | export UI component + wiring to `lib/ifc-export.ts` | MASON | Export control produces a real IFC and DXF file from a live workspace artifact, not a stub; verified against the deployed edge | — | READY |
| W-07 | Wire components into workspace route | workspace route wiring (RIVET's rails + CRANE's page.tsx assembly) | RIVET | RIVET's components are live-reachable through the assembled route on the deployed edge; no dead mounts | W-04 | READY |
| W-08 | Intent API | new Worker route implementing WORKSPACE_SPEC.md §5's intent-phrase routing onto §4's contracts | CRANE | Each §5 intent phrase's mapped contract call succeeds against the deployed Worker; 400s behave per §4 | — | READY |
| W-09 | Command bar UI | command-bar component consuming W-08's intent API | RIVET | A typed phrase from §5's list resolves to the correct §4 action, verified live; first-viewport screenshot per RULE 24 | W-08 | READY |
| W-10 | ATLAS 8-step battery | none (audit only — no source envelope claimed) | ATLAS | Independent audit of W-07 and W-09 against WORKSPACE_SPEC.md §6's acceptance checklist; 8-step battery results logged on this row, no self-certification by CRANE/MASON/RIVET | W-07, W-09 | READY |

## Notes

- Envelopes are deliberately scoped to avoid overlap per RULE 35(2)'s
  claim rule; CRANE holds `lib/types.ts` (W-03) as the sole editor of
  that shared contract file until it marks W-03 DONE, per RULE 35(5) —
  RIVET and MASON's rows do not touch it.
- W-01 was already CLAIMED (CRANE) at seeding time per the operator's
  instruction — not a claim SCRIBE made on CRANE's behalf beyond
  recording what was stated.
- No row here supersedes docs/WAVE_QUEUE.md; it remains the permanent
  ledger of record. This board is the pull-queue mechanism RULE 35
  layers on top of it while RULE 34's Workspace focus is in effect.
