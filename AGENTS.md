# AGENTS.md — Ferrum OS Agent Operating Rules

**Rewritten 2026-08-31 by SCRIBE (W2-217).** This voids the prior 1-19
numbered set in full — none of those rules are in force. What follows is
the complete rulebook (8 rules). Applies to every seat (Qoder CN, Jules,
Qwen Code, VS Code Agents, Claude Code).

## RULE 1 — Roster
ACTIVE: CRANE (executor + lander + REGENT), SCRIBE (docs/ledger/rules),
ATLAS (dual role — architect + executor for its assigned slice of the
queue, reactivated 2026-09-01), CODEX (executor, parallel slice, activated
2026-09-02 — owns W2-346..350 and W2-353+).
PARKED: MASON, RIVET, GIRDER (Qoder) and the older Copilot/Continue/
Jules/Cline seats — reactivatable when Cursor joins.
CONDUCTOR: Qwen-Web. OPERATOR: human. Full detail in docs/ROLE_MAP.md.

**ATLAS/CRANE disjoint-ownership protocol (2026-09-01):** ATLAS and CRANE
work separate slices of docs/WAVE_QUEUE.md concurrently, not overlapping
files: ATLAS never edits worker.ts / auth / payments files; CRANE never
edits sitemap / nav / footer / legal / resources files. Dependency
additions (package.json/pnpm-lock.yaml changes) are CRANE-only — ATLAS
does not add deps. Both seats push from their own worktree (RULE 9);
landing to main is serialized through `scripts/land.ps1` regardless of
which seat authored the branch. SWEEP_100 (final certification) is run
mechanically by CRANE, then each seat spot-audits the other's half — no
self-certification of either seat's own work.

## RULE 2 — Attribution
Every commit is tagged `[AI: <SEAT>]` in the subject line. Every chat
reply ends `-- <SEAT>`. If a prompt is addressed to a different seat (or
to none), just say so and hold — no MISDIRECTED ritual, no scripted
reply format required.

## RULE 3 — Queue
CRANE works docs/WAVE_QUEUE.md rows in order. Rows are append-only —
reassignments and status changes are edits/notes on the row, never
deletions. A row reads DONE only once it is LIVE (RULE 4).

## RULE 4 — Stage-gate
LIVE = pushed (verified with `git ls-remote origin <branch>`, SHA
pasted as proof) + landed via `scripts/land.ps1` + build green.
Anything short of all three stays OPEN/CLAIMED/IN-PROGRESS.

## RULE 5 — Quality
Pre-push: `scripts/verify-static.ps1` and `pnpm --filter ./apps/web exec
tsc --noEmit`. Post-land: REGENT runs its checklist and records one
verdict — PASS, REVERT, or FIX-REQUIRED. No fabricated content or
metrics. No placeholder or empty commits.

## RULE 6 — Protected paths
Never modify without explicit human approval: `apps/web/app/boq-pro/**`,
`package.json`, `pnpm-lock.yaml`, `next.config.js`, `middleware.ts`.

## RULE 7 — Docs ownership
Only SCRIBE edits AGENTS.md, docs/WAVE_QUEUE.md, and role/seat docs.
Other seats read the rules from `main`; they don't fork or locally
override them.

## RULE 8 — Session rotation
If a session is degraded (context exhausted, tool failures, stuck), stop
and leave a HANDOFF note in the seat's docs/seats/<SEAT>.md — current
branch, last claimed row, what's left — before rotating to the next
session.

## RULE 9 — Seat directory isolation
Each seat commits only from its own git worktree, checked out from
`origin/main` (e.g. SCRIBE works from `D:\ferrum_os.worktrees\scribe-docs`).
The shared main checkout at `D:\ferrum_os_recovered` is `scripts/land.ps1`
territory only — no seat runs `git checkout`/`git switch` there. This
keeps concurrent seats from colliding on HEAD in the one checkout CRANE's
landing script depends on.

## RULE 10 — Undo discipline
Every docs/WAVE_QUEUE.md row includes an `UNDO:` field — a one-line
inverse command for that row's change (e.g. `UNDO: git revert <sha>`, or
`UNDO: delete apps/web/app/X/page.tsx + npm uninstall Y`). Rollback must
be deterministic, not reconstructed after the fact. Applies going
forward to new rows; existing rows are not being retrofitted.

## RULE 11 — Skills catalog
docs/SKILLS.md lists each seat's expert skills. The conductor (Qwen-Web)
uses it to route sub-tasks to the seat best suited, rather than by
availability alone.

## RULE 12 — Sub-agent gate dispatch
When CRANE hits an operator gate (a secret, an approval, a design
decision it can't make itself), it does not sit blocked. It reports the
gate to the conductor, which dispatches the unblocking sub-task to the
seat that owns that kind of work — ATLAS for research/design questions,
SCRIBE for docs/queue questions — instead of CRANE idling on its own row.

## RULE 13 — Screenshot extrapolation
When the operator flags one instance of a defect (a placeholder, a fake
claim, an unwired feature) from a screenshot or spot-check, the fix scope
is automatically all similar instances site-wide, not just the flagged
one. The seat doing the fix inventories every occurrence of that defect
class across the site before claiming the row done.

## RULE 14 — Security-merge guard
Any landing that touches `_headers`, middleware, or rate-limit code must
re-verify post-land that security posture didn't silently regress: grep
`apps/web/out/_headers` for CSP and confirm the Report-Only count is 0
(fully enforced, not report-only), and confirm rate-limit code is still
present. A silent revert of either one is a REVERT verdict in the REGENT
post-land checklist (RULE 5), not a PASS.

## RULE 16 — Always engaged
No seat waits on another seat; blocked target → immediate side-hustle from
approved menu (edge LCP/perf audit, a11y pass, SEO/OG audit, vitest
coverage gaps, docs completeness) or a RULE 17 proposal; state the switch
in one line; idle = defect.

## RULE 17 — Propose freely, execute on approval
Any seat may surface operator-facing improvements as proposals
(target/rationale/cost); nothing proposed executes without explicit
operator approval via conductor.

## Reuse policy — stopped ferrum project
Content and config may be extracted, read-only, from the stopped ferrum
project for reuse here. The two repos are never merged. Anything ported
in enters this repo only as a normal W2 task, subject to the same gates
as any other task (RULE 4 stage-gate, RULE 5 quality, RULE 6 protected
paths) — no bulk import, no bypassing the queue.

**Brand decision (2026-08-31, operator):** Ferrum OS retains its current
identity per Relume. ferrumgroup.in design tokens (bronze #B8873B et al.)
are NOT adopted — reference-only. Post-Relume design-polish derives its
tokens from the Relume wireframe, not from ferrumgroup.in. The BOQ port
(W2-235) is logic-only and carries no brand coupling. Full verdict table
in docs/REUSE_MAP.md.
