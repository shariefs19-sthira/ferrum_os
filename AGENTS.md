# AGENTS.md — Ferrum OS Agent Operating Rules

**Rewritten 2026-08-31 by SCRIBE (W2-217).** This voids the prior 1-19
numbered set in full — none of those rules are in force. What follows is
the complete rulebook (8 rules). Applies to every seat (Qoder CN, Jules,
Qwen Code, VS Code Agents, Claude Code).

## RULE 1 — Roster
ACTIVE: CRANE (executor + lander + REGENT), SCRIBE (docs/ledger/rules),
ATLAS (dual role — architect + executor for its assigned slice of the
queue, reactivated 2026-09-01), MASON (Codex CLI, executor, parallel
slice, activated 2026-09-02 — owns W2-346, 348, 349, 350, 353, 354;
W2-347 is explicitly carved out to CRANE — a specific reassignment
overrides the roster range), RIVET (Codex CLI, second parallel executor,
activated 2026-09-02, exclusive to `apps/mobile/**` and `docs/**` — owns
W2-356+).
Note: MASON and RIVET are seat *names* being reused here for two new
Codex CLI instances — distinct from the original Qoder-backed MASON and
RIVET that were parked 2026-08-31. The old Qoder work under those names
was already folded into CRANE (see docs/ROLE_MAP.md change log); no row
history is being reattributed.
PARKED: GIRDER (Qoder) and the older Copilot/Continue/Jules/Cline seats —
reactivatable when Cursor joins.
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
landing script depends on. Per W2-357 (landing pipeline fix): SCRIBE
rebases its docs branch onto `origin/main` before every push — shared
docs files (WAVE_QUEUE.md, ACTIVITY_LOG.md) are resolved by keeping both
additions, in chronological order — to end recurring squash-conflict
hand-reconstruction on land.

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
operator approval via conductor. Amended 2026-09-03: every seat report
must include at least one UX-improving proposal (web search and general
project experience are both encouraged as sources) OR an explicit "no
better alternative found" line — silence on this point is not an
acceptable report. A proposal must genuinely improve user experience,
not just add scope, and — as with any RULE 17 proposal — never executes
without explicit operator approval via conductor.

## RULE 18 — Self-landing, bounded (amended 2026-09-03 per RULE 23)
Amendment: direct push-to-main is NOT a fleet primitive. The Claude Code
auto-mode classifier blocks a direct push to `main` for every seat,
without exception — this was tested and confirmed, not assumed.
`scripts/land.ps1` (a targeted merge, not a raw push) is the ONLY landing
path onto `main`, including for docs self-landing. "Self-landing" in this
rule means a seat pushes its own branch and triggers/qualifies for
land.ps1's next sweep without waiting on another seat to review or
initiate that sweep — it never means the seat pushes straight to `main`
itself.

Seats self-land their own branches once past their gates (RULE 4 stage-
gate, RULE 5 quality, RULE 14 security-merge guard where applicable) —
they push to their own branch and land.ps1 picks it up, rather than
waiting on CRANE to manually review and initiate that landing. This is
mechanically blocked (not just policy) for anything touching protected
paths (RULE 6), `worker.ts`, database migrations, or `_headers` — those
stay CRANE-only to land, no exceptions. CRANE batch-reviews the landing
log once per turn rather than gating every individual self-land in real
time. ATLAS post-audits self-landed work same as everything else —
self-landing does not exempt a row from audit.

## RULE 19 — Limit handoff
When a seat hits its usage/rate limit mid-task, the active (non-limited)
seat takes over the stopped task regardless of role — resuming from the
completed state, not restarting it. No seat sits waiting for another
seat's limit to reset. When the originally-limited seat becomes available
again, it EXITS the task that was taken over (it does not reclaim
mid-stream work someone else is now carrying) and picks up the next open
row instead.

## RULE 20 — Long-run mission blocks
(1) When a domain's vision is on disk (spec + acceptance + failure gates
already written and queued), the conductor issues ONE prompt containing
multiple builds for that domain. The claiming seat self-sequences inside
the block and runs to the block's end-state, reporting per milestone
without waiting for a conductor relay between milestones.
(2) Seats coordinate directly via disk, not through the conductor: read
other seats' branches and specs, and leave handoff notes in
`docs/HANDOFFS.md`. An inter-seat fact (a dependency ready, a blocker
found, a scope clarification another seat needs) never takes a conductor
hop — write it to disk where the other seat will read it.
(3) Inside a mission block, a seat may execute self-found improvements
that stay strictly inside the envelope: no protected paths, no
`worker.ts`, no migrations, no `_headers`, no new dependencies, no
production writes, and no operator-facing change. Anything
operator-facing goes to the Approval Queue (docs/WAVE_QUEUE.md) instead
of being executed inline.
(4) The conductor intervenes only on: a red flag, an approval decision,
a RULE 19 limit handoff, or an audit failure. Everything else inside an
active mission block runs without conductor mediation.

## RULE 21 — Self-verifying tools + living resume
(1) **Batch tools self-verify.** Any script processing a batch
(`land.ps1`, sweeps, audits, migrations) emits machine-checkable counts
— processed / landed / skipped / held — and returns a nonzero exit code
or an explicit HELD state whenever work remains. "Success" reported with
zero items processed against a non-empty queue is a FAILURE, never a
pass. Expected-vs-actual counts are logged on every run, not just on
failure.
(2) **Disk-verify before reliance.** A claim that something was
"reviewed," "trusted," or "landed" is verified against the actual tree
(`git log`/`git diff`, not a status label) at the moment another seat
relies on it — this generalizes the W2-357 never-merged scar (a branch
believed landed that wasn't) from code review to tooling and process
claims generally. Trusting a label instead of checking disk is exactly
the failure mode this rule closes.
(3) **Living resume.** Every seat maintains `docs/RESUME_<SEAT>.md`,
updated every turn: done work (with SHAs), in-flight work, next planned
step, and current blockers. After any limit event or API error, the new
session reads its own resume file FIRST, before anything else, and
resumes exactly from what it says — no reconstructing state from chat
memory. Conductor resume prompts are generated from the resume file's
actual content, never from a remembered summary of the conversation.
(4) **Approval queue at turn start.** Amended 2026-09-03: every seat
reads `docs/APPROVAL_QUEUE.md` at the start of its turn and executes any
row whose OPERATOR DECISION is APPROVED, within that row's stated
envelope (RULE 20(3) bounds where a mission block applies) — approved
work sitting unexecuted because no one re-checked the queue is itself a
RULE 16 idle-time defect.

## RULE 22 — Self-contained prompts, no-stall queries
Conductor prompts attach a verification method AND a fallback
adjudication to every factual claim they carry — a seat should never
need to ask "how do I check this" or "what do I do if it's false." Seats
never stall on a query when a disk method plus a fallback already exist
for it; they run the method and act on the result.

**The squash-landing SHA-rewrite problem, and its method:** land.ps1
squashes and rewrites SHAs, so `git merge-base --is-ancestor
<branch-tip-sha> origin/main` is INVALID for DONE-verification — a
squashed commit's original tip SHA is never an ancestor of main even
when the work fully landed, producing false NOT-LANDED readings. The
correct method, in order: (1) **tree check** — confirm the expected
files/paths actually exist in `origin/main`'s tree (`git ls-tree -r
origin/main --name-only`, `git show origin/main:<path>`); (2)
**landing-marker check** — search `origin/main`'s own log for the
landing script's marker commits (`git log origin/main --grep="\[land:
<branch>\]"`) rather than branch ancestry; (3) **deployed evidence**
where applicable — the actual running edge, not just the repo tree. When
these agree work is present, record LANDED-ON-MAIN, citing the
landing-marker SHA as disk proof and the original branch-tip SHA as
authorship provenance only — never present a rewritten branch SHA as
the SHA that landed.

**Fallback, always attached:** if the checks disagree or neither
confirms presence, the claim is UNDECIDABLE from disk alone. A seat
hitting this: (a) logs the gate rather than guessing or stalling, (b)
continues any other work in its block that doesn't depend on the
undecided claim, (c) escalates the specific undecidable claim in its
report rather than burying it. Never record DONE/LANDED on an
undecidable claim, and never block all forward progress waiting for an
answer that a disk check plus this fallback can already resolve.

## RULE 23 — Every relay improves the system
Each conductor relay to a seat carries at least one workflow or quality
improvement item — a process fix, a tooling gap closed, a rule
clarified — not just task assignment. This is the conductor-side
counterpart to RULE 17's seat-side requirement (every seat report
carries a UX-improving proposal or an explicit "no better alternative
found" line): together, RULE 17 and RULE 23 mean neither side of a
relay is ever just a status update with nothing added.

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
