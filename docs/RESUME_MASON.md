# RESUME_MASON.md — Living resume (AGENTS.md RULE 21(3))

Updated every turn by MASON. After a limit event or API error — the
scenario this seat has actually hit this session — the next session
reads this file FIRST, before anything else, and resumes exactly from
what it says.

## Heartbeat (AGENTS.md RULE 38(2))
- 2026-09-04 — seeded by SCRIBE at RULE 38's adoption; MASON updates
  this line at the start of each of its own turns going forward.

## Done (this session, with SHAs)
- W2-354 responsive matrix landed at `8e35756d` with deployed responsive canaries verified.
- W2-372 landed via targeted marker `331c1b08`; branch provenance `4118c121`. Local gates were green, but the first deployed-edge check remained stale (`data-forecast-module` absent at 1366 and 375), so LIVE proof is still pending.
- W2-401 deterministic PLAN_GEN core has 3/3 unit vectors green: footprint area reconciliation, setback clamping, and elevation geometry.
- W-17 AUTH-PREVIEW authored at `7e4fe6fa`, landed at `ef2f0440`, and verified live at 375/1366 with 6/6 headless checks.

## In-flight
- Branch `w2-401-w27-w28`, worktree `D:\ferrum_os.worktrees\mason-w27`.
- W-27/W-28 command-first UI and five-stage ruleset-derived option flow are implemented and locally gated. Default sliders are absent; More → Advanced restores all four controls.

## Next planned step
- Commit, push, self-land W-27/W-28, then verify deployed screenshots and state handoff before W-36 product-page remount wiring.

## Current blockers
- IFC export is LOCKED: importing `lib/ifc-export.ts` into the client bundle fails with `Module not found: Can't resolve 'module'`. The cockpit exposes no dead IFC control; it labels IFC queued and keeps DXF real.
- W-34 `budgets.json` is not yet present on `origin/main`; RULE 41 numeric limits were applied directly for this row. Local probes: reduced software profile 60 FPS / 9 draw calls; full D3D11 GPU profile 60 FPS / 42 draw calls.

## Last updated
- 2026-09-04 by MASON during W2-401.
