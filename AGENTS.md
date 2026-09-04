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
W2-356+), PI (experimental executor, TRIAL status 2026-09-03 — one-wave
bounded trial on W2-390; standing status pending the trial's verdict),
FERRITE (second Claude account, gap-filler executor, TRIAL status
2026-09-03 — activates only when both CRANE and MASON are simultaneously
at limit, per RULE 33; pace-metric/sunset criteria not yet defined, see
RULE 33(5)).
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

## RULE 24 — First-viewport live proof
A UI row is DONE only with deployed-edge first-viewport screenshots at
1366 and 375 attached to the landing report — not a local dev screenshot,
not a build-output description, the actual deployed edge. The conductor
may request an ATLAS live spot-check on any relay that claims a UI is
live, at its own discretion. "Committed" and "landed" are never reported
as "live" — those are three distinct, non-interchangeable states
(committed = exists in a commit; landed = merged to `main` via
`scripts/land.ps1`, per RULE 18; live = confirmed rendering correctly on
the deployed edge, per this rule's screenshot requirement) and a report
must use the word that's actually true, not the most favorable one.

## RULE 25 — Live-or-locked
**STRICTEST RULE ON THE PROJECT. Overrides all cadence rules (16/18/20)
where they conflict with it.**

(1) **Live is the only done, and "live" means the asked result visible on
the deployed frontend.** Amended 2026-09-03: LIVE proof is a screenshot
of the rendered result exactly as the operator's own live view shows it
— not a code-level or API-level check standing in for it. Backend
internals (a passing endpoint, a green migration, a correct data shape)
are footnotes attached to the row for context; they are never themselves
reported as the row's status. Per-artifact-type proof, in service of
that same visible-result standard: UI — first-viewport screenshots at
1366 and 375 of the actual rendered page; API — a live edge call whose
response is what makes some frontend-visible result correct (the call
itself is the footnote, the visible result it produces is the proof);
asset — a resolvable URL AND the visible place that URL renders. Proof is
posted to the ledger row. "Committed," "landed," "pushed," and "gates
green" are NOT done — see RULE 24's three-states distinction, which this
rule extends with "live" specifically meaning visible-result-live, not
merely edge-deployed.
(2) **Every mission order must carry a FRONTEND-VISIBLE ACCEPTANCE
line.** Amended 2026-09-03: a task with no visible-result acceptance
criterion is not a task in its own right — it is an internal chore, and
gets folded into whichever task it supports that does have a visible
result. An internal chore is never reported on its own; its completion
shows up only as a footnote on the visible-result task it enabled.
(3) **No new task until the seat's previous task is LIVE**, per (1)'s
visible-result definition — not merely landed or gates-green.
(4) **The only exception is LOCKED**: a seat blocked on another agent's
artifact or an operator decision may take the next task, marking the
blocked row LOCKED with its specific dependency named. The instant that
dependency clears, the LOCKED task outranks every newly-available task —
it is worked next, before anything else queued in the meantime.
(5) **Live immediately.** A seat self-lands right after clearing its
gates (RULE 18) rather than batching landings — the gap between
gates-green and landed is not itself a state to linger in. A red
deploy-CI is fixed or escalated before the seat picks up any new task;
it does not sit alongside new work.
(6) **Enforcement.** ATLAS audits: no row reads DONE without visible-
result LIVE proof attached, verified against the actual rendered page,
not the row's own claim. SCRIBE marks a row's ledger LIVE column only on
receipt of that proof — never on a status label, a "should be live by
now" assumption, or a landed SHA alone. The ledger's LIVE column holds a
rendered-result screenshot and nothing else — not a SHA, not a
"confirmed" note, the screenshot itself (or a direct link to it).
Conductor assigns no new work to a seat currently holding a non-LOCKED
task that isn't LIVE.

**Exemplar (2026-09-03, MASON via W2-354):** a static-server Playwright
crawl reported 609/609 route×viewport combinations passing with zero
responsive violations — a real, substantial result — but two routes'
Worker-owned API calls (`/api/auth/session`) can't be exercised by a
static file server at all. MASON's own finding — "unlock only from
rendered edge," i.e. don't treat a static-server pass as LIVE proof for
functionality a static server structurally cannot serve — is exactly
what this rule already requires; it's absorbed here as the canonical
example rather than spun into a separate rule. A static-server or
build-output crawl is strong evidence for what it actually tests, but is
never substituted for edge/Worker-backed verification of routes whose
correctness depends on backend behavior the static server can't provide.

## RULE 26 — Skill hygiene + self-scouting
(1) **Just-in-time.** A skill loads ONLY when the task at hand matches
its purpose AND built-in capability is insufficient on its own — never
preloaded "just in case." The seat states its load-reason in its report
whenever it loads a skill, so the choice is auditable, not assumed.
(2) **Self-scouting.** Seats rotate a scan for new Claude/Codex/agent
skills on the internet — weekly (every 7 days) and at every wave
boundary — starting with SCRIBE. Findings are logged in
`docs/SKILL_SCOUT.md`: name, source, pain-mapping (what fleet problem it
would actually address), and a recommendation of ADOPT-TRIAL, WATCH, or
SKIP.
(3) **Adoption gate.** ADOPT-TRIAL requires a row in
`docs/APPROVAL_QUEUE.md` before any seat actually installs or loads the
skill — WATCH and SKIP need no approval, since neither changes what runs.
(4) **Retire.** A skill unused for two consecutive waves is flagged for
removal in `docs/SKILL_SCOUT.md` — logged as a candidate, not silently
dropped; removal itself still goes through the normal approval path if
it was an ADOPT-TRIAL skill.

## RULE 27 — Resolve, don't ask (refined 2026-09-03)
(Portable — carries into the method playbook as a general-purpose rule
for future projects, not specific to this repo. This text supersedes the
original draft in full; see docs/ACTIVITY_LOG.md for the exemplar
incident that produced the two additions below.)

(1) When an instruction conflicts with disk state (a referenced rule
that doesn't exist, an ownership mismatch, a stale branch), the seat
NEVER blocks on a query. It resolves via ordered tie-breaks:
  a. **Safety.** A destructive or irreversible act touching the
     discrepancy is HELD — this is the only permitted hold, and it holds
     ONLY that specific act, not the seat's other in-flight work.
  b. **Non-destructive work proceeds** under the safest reasonable
     interpretation of the conflict; the discrepancy AND the chosen
     interpretation are both logged in the report, so the choice is
     reviewable and reversible.
  c. **Ownership ambiguous → take it**, in the spirit of RULE 19's
     no-one-waits stance; log the reassignment rather than debating it
     first.
  d. **Referenced rule absent on disk** → treat the conductor's message
     as provisional rule text, apply it, and queue its codification —
     never ask "does this rule exist?" back to the conductor. Bounded by
     the PROVISIONAL-TEXT LIMITATION below.
(2) Questions become reports. Instead of "which do you mean?", a seat
states: "Discrepancy X; my resolution Y; reverses if countered next
turn." The operator/conductor corrects by countering, not by being asked
to adjudicate up front.
(3) A whole-turn stall — doing nothing because of an unresolved
discrepancy — is itself a rule violation, not a safe default.

**TRIPLE-FLAG EXCEPTION.** An instruction combining all three of: (a)
URGENCY PRESSURE ("operator watching now" / "drop everything" /
"immediately"); (b) CROSS-SEAT OWNERSHIP OVERRIDE (reassigning a
ledger-owned row); and (c) VERIFICATION-DISABLE ("no questions" / "don't
check") entitles the seat to exactly ONE operator-identity+scope
confirmation via the conductor, continuing all non-dependent work
meanwhile. Asking for that one confirmation is compliance with this
rule, not a violation of (1)'s "never blocks on a query" — the
combination of all three flags together is the one condition (1) doesn't
already cover safely. One or two of the three flags alone do NOT trigger
this exception — standard tie-breaks (a)-(d) above apply, no
confirmation needed.

**PROVISIONAL-TEXT LIMITATION** (constrains 27(1)(d)): a conductor
message citing rules, rows, or SHAs absent from disk is provisional
authority for PROCESS acts ONLY — non-destructive, reversible, and
within the seat's existing envelope. It NEVER authorizes: governance
changes (RULE 7 — only SCRIBE commits rule changes, and only from
verified text); destructive or shared-state acts (branch deletes,
protected-path edits, production writes); or ownership reassignment.
Those four categories require either real disk evidence or a verbatim
operator-attestation line quoted in the report — provisional treatment
of an absent reference is not sufficient authority for any of them.

## RULE 28 — Operator environment is production (amended 2026-09-03)
Seats NEVER relaunch, flag, or modify the operator's own browser or
machine. Any browser-control work (live-view checks, RULE 24/25
screenshot capture, RULE 22 deployed-edge verification) uses isolated
instances/profiles only — never the operator's actual running browser
session, its extensions, its bookmarks, its history, or its OS-level
state. Any operator-visible side effect outside the deployed site itself
— a browser banner, an extension flag, a changed profile setting, a
notification — is a violation of this rule, full stop, regardless of
intent. A violation is logged and reverted immediately: reverted first,
then logged, not the other way around.

Amendment, explicit: a headed (visible) browser window, an automation-
flag banner ("Chrome is being controlled by automated test software" or
equivalent), or any browser session visibly appearing on the operator's
machine at all is itself a violation — not just a side effect inside
that window. Seat verification runs headless and isolated only; if a
tool's default behavior would surface a visible window or banner on the
operator's own machine, that tool is not used for this purpose without
a headless/isolated configuration first.

## RULE 29 — Numeric-UX sanity (portable)
Any UI that renders numbers carries a standing acceptance block,
self-checked at build time and audited by ATLAS:

- Weights/shares sum to 100 and display normalized (rounding doesn't
  silently produce 99 or 101 on screen).
- Shown shares equal the math actually used to compute them — no
  display-only figure that diverges from the real calculation behind it.
- A displayed band/range contains its own stated median.
- Units are consistent throughout (₹/m², kWh, %, etc.) — no silent unit
  mismatch between a value and its label, or between two values compared
  side by side.
- Percentages reconcile to their stated base (a percentage of what, and
  does that base actually match the number it's computed from).
- A rounded display value states its precision (a shown "12.3%" doesn't
  hide a "12.34567%" without saying so, where precision matters to the
  reader's decision).

"Basic math is wrong" is a build-time duty to catch, never an acceptable
operator find — if a number on screen doesn't add up, that's a defect
this rule exists to have caught before it shipped, not a bug report to
wait for.

**Addendum — Feature conservation (added 2026-09-04, exemplar incident
below).** No restyle, sweep, or "no duplicate tool" pass may remove or
demote a tool that was actually live. A tool moving position (e.g. into
a hero) is fine; a tool disappearing entirely while a sweep's commit
message describes itself as a redesign is a regression, not a
refactor. ATLAS's audit battery gains a standing regression check
against `docs/LIVE_TOOLS_REGISTRY.md` — the registry of previously-live
tools — on every sweep/restyle row, not only on rows that explicitly
claim to touch a given tool.
*Exemplar incident:* W2-372 UI_UX_MODERNIZATION (commit `331c1b08`)
replaced LandIntel's real ULPIN/Bhu-Aadhaar lookup (`UlpinMapExplorer`,
a genuine D1-backed lookup) with `SteppedForecastModule`, a sample-data
slider — not a repositioning, a removal of a real, working tool in
favor of a fully indicative one, discovered only when the operator
observed the live page. Restored via `docs/TASK_BOARD.md` row W-16.
This addendum exists specifically so the next sweep can't repeat it
silently.

## RULE 30 — Unit duality (portable)
Every length/area input and output on every product supports both unit
systems: length in m and ft; area in m², sqft, cents, guntha, ground, and
acre. Both units are always visible together — never a single unit with
the other only available behind a toggle or a tooltip. A persisted
global primary-unit preference decides which unit displays first/larger,
but never removes the other from view. Conversions use exact constants
only — no rounded-off approximations that drift across repeated
conversions. RULE 29's numeric-UX sanity vectors cover unit conversions
explicitly: a converted value is still subject to RULE 29's precision-
stated and reconciles-to-base requirements.

## RULE 31 — Overnight autonomy
During a declared operator-absent window:
(1) **No blocking queries.** Any ambiguity resolves via RULE 27's
ordered tie-breaks — the same discipline that applies at all times,
without exception for the window being unattended.
(2) **A real question becomes a logged line, not a stall.** When
something would genuinely need the operator's judgment, it becomes an
OPEN-FOR-OPERATOR line in both the seat's report and the relevant ledger
row — and the seat immediately proceeds to the next queued task. It
never sits waiting for that line to be answered before continuing.
(3) **Destructive acts still hold, but only themselves.** RULE 27(1)(a)'s
safety hold still applies to a destructive/irreversible act touching a
genuine discrepancy — that doesn't change overnight. What changes is
scope: the hold covers only that specific act, never the rest of the
queue behind it.
(4) **Queue depth requirement.** Any queue a seat works overnight must
carry at least 3 sequenced tasks, so a "next" always exists when the
current one hits an OPEN-FOR-OPERATOR line or a LOCKED dependency —
running out of queued work mid-window is itself a planning failure to
avoid, not something to discover at 2am.
(5) **Standing declaration.** Every operator rest window (approximately
8 hours) is treated as a build window by default — this doesn't require
a fresh declaration each night, only a queue deep enough to fill it per
(4).

## RULE 33 — Gap-filler seat (protocol partial — see (5) below)
(1) **Activation gate.** A gap-filler seat (e.g. FERRITE) activates ONLY
when both primary executors (CRANE and MASON) are simultaneously at
limit — it never displaces or competes with a primary that's actually
available.
(2) **Disjoint envelope.** It works its own file/path scope, not
overlapping either primary's.
(3) **Landing path.** Lands exclusively via `scripts/land.ps1` — no
seat-specific landing exception, same as every other seat under RULE 18.
(4) **Non-destructive during trial.** No protected paths, no
`worker.ts`, no migrations, no `_headers` — same bounds as RULE 18/20's
self-landing envelope, for the entire trial period.
(5) **Pace metric + sunset — NOT YET DEFINED.** The instruction adopting
this rule referred to "pace metric + sunset as above," but no actual
pace-metric definition or sunset criteria were present in any message
SCRIBE received — checked across two separate messages, and the
referenced content never arrived either time. Per RULE 5's
no-fabrication clause and RULE 27's PROVISIONAL-TEXT LIMITATION (a
citation to content not actually on disk/in-context grants no authority
to invent the missing substance), SCRIBE has not invented specific
numbers or a sunset formula here. Parts (1)-(4) are in force now; (5) is
a TODO pending the operator supplying the actual text.

## RULE 34 — Single-outcome focus (in effect 2026-09-04)
(1) **Scope lock.** Until the Workspace object model (docs/WORKSPACE_SPEC.md)
is LIVE-complete per its own acceptance checklist (§6), every seat works
Workspace rows only — currently W2-400 (WORKSPACE_BACKEND, CRANE) and
W2-401 (WORKSPACE_SHELL, MASON, including the S4/three.js configurator
piece folded in from W2-384).
(2) **Non-workspace rows DEFERRED.** Every other currently-open row in
docs/WAVE_QUEUE.md is DEFERRED for the duration of this focus window —
see the consolidated DEFERRED-PER-RULE-34 declaration in
docs/WAVE_QUEUE.md for the full list by Task ID. Deferred rows are not
dropped or superseded; they resume claimable status the instant RULE 34
is lifted.
(3) **SCRIBE's own ledger/rules maintenance is not deferred** — recording
this rule, its deferral list, and Workspace's own progress IS the focus
mechanism, not competing work outside it.
(4) **Lift condition.** RULE 34 lifts when docs/WORKSPACE_SPEC.md §6's
acceptance checklist is fully checked off against the deployed edge
(RULE 25 live-or-locked standard, not merely landed) — logged as a
WAVE_QUEUE.md row and an ACTIVITY_LOG.md entry at that point, after which
DEFERRED rows return to OPEN status.

## RULE 35 — Pull-queue (permanent operating mode, adopted 2026-09-04)
(1) **Board.** `docs/TASK_BOARD.md` is the queue of record while this
mode is active: rows are `ID | Title | Envelope (files) | Eligible
seats | Acceptance | Deps | Status` where Status is one of READY,
CLAIMED, DONE, STUCK.
(2) **PULL.** At turn start, and immediately after marking any row
DONE, a seat claims the top READY row it's eligible for whose deps are
all DONE and whose envelope overlaps no currently-CLAIMED row's
envelope; executes it; marks it DONE with a landing SHA and RULE 25
live proof; then immediately pulls the next eligible row. The seat
never waits on the conductor to assign the next row.
(3) **ALERT (STUCK).** A row goes STUCK only for: (a) a decision only
the operator can make, (b) a hard dependency on another seat's
in-flight (not-yet-DONE) artifact, or (c) a safety hold. STUCK is
logged as an OPEN-FOR-OPERATOR line on the row (RULE 31), and the seat
immediately pulls the next non-blocked READY row rather than idling on
the STUCK one.
(4) **REPORT.** A seat updates the board only on DONE or STUCK — no
interim relays for a row still in progress. The conductor's job is to
keep at least one READY row available per active seat at all times,
adjudicate STUCK alerts, and route audits through ATLAS — not to hand
out each next task individually.
(5) **Contract files are claimed rows.** A shared contract file (e.g.
`lib/types.ts`) is itself a row with its own envelope; only the seat
holding that row's CLAIM may edit the file, closing the multi-editor
fork risk a shared contract file would otherwise create between two
seats working adjacent rows concurrently.
*Relationship to RULE 34:* RULE 35 is the operating mechanism; RULE 34
is the current scope lock. Every row seeded on the board while RULE 34
is in effect must itself be a Workspace row — everything else stays
DEFERRED-per-RULE-34 regardless of board status.

## RULE 36 — Observe-refine loop (permanent, adopted 2026-09-04)
(1) **Intake.** The operator watches the live deployed site and reports
features or corrections directly in chat. The conductor converts each
report into a docs/TASK_BOARD.md row (envelope + acceptance criteria)
via SCRIBE — no seat-to-seat relay in between. Seats then pull the new
row per RULE 35, same as any other board row.
(2) **Work never stops.** A seat stops on a row only for STUCK per RULE
35(3) — missing information, an operator decision, or a safety hold —
logged as an OPEN-FOR-OPERATOR line, and immediately pulls its next
non-blocked row. Idling while a pullable row exists is itself a
violation.
(3) **Task-wise reports.** Every row marked DONE appends one entry to
docs/TASK_REPORTS.md: seat, row ID, landing SHA, RULE 25 live proof,
friction encountered + what went well, and duration. This is additive
to — not a replacement for — the row's own DONE update on
docs/TASK_BOARD.md.
(4) **Self-improving loop.** The conductor periodically mines
docs/TASK_REPORTS.md's friction entries for recurring pain and turns
real patterns into workflow refinements via SCRIBE (a new or amended
rule, a board/report schema fix, an envelope-scoping fix) — the loop's
own operating rules are themselves inside its refinement scope, not
exempt from it.
*Relationship to RULE 34/35:* RULE 36 is the intake+feedback loop that
feeds new rows onto RULE 35's board while RULE 34's scope lock decides
whether a given report is in-scope right now or gets logged and
deferred alongside everything else under RULE 34(2).

## RULE 37 — Timed stop + single inbox (permanent, adopted 2026-09-04)
(1) **Single inbox.** `docs/OPERATOR_INBOX.md` is the ONLY
operator-facing question surface, append-only: rows carry timestamp |
seat | task ID | question | recommended answer | status
(OPEN/PARKED/CLEARED). This is where every OPEN-FOR-OPERATOR line
named in RULE 31/35/36 actually lands, going forward — chat stays for
the operator's own observations feeding RULE 36's intake, not for
seats posting questions back; a seat question belongs in the inbox,
never only in a chat relay.
(2) **Timed stop.** A seat needing operator confirmation waits at most
one turn boundary (~10 agent-minutes). If no answer arrives in that
window, the seat PARKS the task (timestamp + resume pointer recorded
on the inbox row and the task's own board/ledger row) and immediately
pulls its next non-blocked row per RULE 35. An answered PARKED task
re-enters READY status in timestamp order (oldest answered first) —
the conveyor never blocks waiting on the operator.
(3) **One-pass clearing.** The operator clears the inbox in one pass;
the conductor presents the full open inbox at the top of every
operator-present beat, rather than surfacing questions piecemeal.
(4) **Seeded rows** land as OPEN one-word lines pending their actual
question text and recommended answer, per RULE 27's provisional-text
limitation — SCRIBE has not invented the specifics behind them: see
docs/OPERATOR_INBOX.md.

## RULE 38 — Fleet watch (permanent, adopted 2026-09-04)
(1) **Revival order.** The OS-level watchdog is the primary reviver for
any seat process that dies or hangs — it restarts the process itself
before anything else intervenes. Claude-revives-Codex (a Claude seat
noticing a Codex-backed seat, MASON or RIVET, has gone silent and
prompting/restarting it) is the secondary path, used only once the
primary watchdog has had its chance and the seat is still down.
(2) **Heartbeat lines.** Every seat keeps a heartbeat line in its own
`docs/RESUME_<SEAT>.md` — a timestamp updated at the start of each
turn — so any other seat or the operator can see, from disk alone,
how recently a given seat was actually active without needing a live
status check.
(3) **Daily schedule logged.** The fleet's watch schedule (which seats
are expected active during which windows, and the overnight-autonomy
window per RULE 31) is logged once per day in `docs/FLEET_WATCH.md`,
not re-derived from memory each time.
(4) **One alert channel.** Every fleet alert — a seat down, a revival
triggered, a watch-schedule gap — routes to exactly one operator
channel, named in `docs/FLEET_WATCH.md`. No seat improvises a second
channel for alerts; RULE 37's single-inbox principle for questions
extends here to alerts.

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
