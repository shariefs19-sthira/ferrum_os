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
- Branch `w2-401-cockpit`, worktree `D:\ferrum_os.worktrees\mason-w401`.
- W-21/W-22 cockpit canvas is implemented on `w2-401-cockpit`: one Three.js renderer with perspective/top-plan/axonometric scissor views, synchronized selection, PLAN_GEN massing, 10-product rail, plan/elevation toggles, IS 456 indicative gate, and live DXF export.

## Next planned step
- Complete the post-optimization headless FPS/screenshot proof, commit, push, self-land with `land.ps1 -Branch w2-401-cockpit`, then verify the deployed edge at 1366/375.

## Current blockers
- IFC export is LOCKED: importing `lib/ifc-export.ts` into the client bundle fails with `Module not found: Can't resolve 'module'`. The cockpit exposes no dead IFC control; it labels IFC queued and keeps DXF real.

## Last updated
- 2026-09-04 by MASON during W2-401.
