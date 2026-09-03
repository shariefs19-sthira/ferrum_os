# FERRUM METHOD PLAYBOOK

A repo-agnostic blueprint for rebuilding the Ferrum OS fleet workflow on
any future project. Authored by SCRIBE, 2026-09-03, from the actual
operating history of this engagement (AGENTS.md, docs/ROLE_MAP.md,
docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md) — not a theoretical ideal.

**Status note:** Section 10 (Lessons Appendix) requires one paragraph of
input from each seat (CRANE, ATLAS, MASON/CODEX, RIVET) before it can be
considered complete. SCRIBE has not fabricated that input — see the note
at the top of Section 10.

---

## 1. Seat model

Four functional roles, not four fixed headcounts:

- **Conductor** — assigns/sequences work across seats, resolves
  cross-seat scheduling (which seat claims which row, when a seat is rate
  limited or dark, reassignment calls). One conductor per fleet; it does
  not write code or docs itself.
- **Executor(s)** — claims rows from the queue, writes code, pushes
  branches. A fleet starts with one executor. Add a second executor only
  when all three of these hold at once:
  1. The work can be split along a **disjoint file/path boundary** (e.g.
     backend/worker vs. frontend/content, or app code vs. mobile shell) —
     not an arbitrary row-number split.
  2. Each executor works from its **own git worktree**, checked out fresh
     from the shared main branch per task — never a shared checkout.
  3. Landing to the shared branch stays **serialized through one gate**
     (one landing script/process), regardless of which executor authored
     a branch. Never let two executors land directly to the trunk in
     parallel.
- **Auditor** — spot-checks the other executor's landed work (and vice
  versa if there are two executors) after a milestone sweep. No
  self-certification: the seat that built something is never the sole
  seat that verifies it landed correctly.
- **Scribe** — owns the ruleset, the task ledger, and the activity log.
  Does not write application code. Verifies every claim it commits
  against real repo/git state before writing it down; queues research or
  content-authoring tasks to an executor rather than fabricating them,
  *unless* the content is meta-documentation about the fleet's own
  process (like this file), which falls inside the scribe's own domain
  expertise.

## 2. Ruleset template

This engagement's ruleset grew well past its original set as the fleet
matured — twenty-six numbered rules were actually adopted (numbered
1–14, 16–27 — RULE 15 was never assigned; leave gaps in your own
numbering rather than force sequential renumbering when a rule is
superseded or dropped). Rules 1–17 are detailed below, each with the
one-line rationale that justified adopting it — carry the rationale
forward even when you reword the rule for a new repo, because the
rationale is what tells a future reader whether the rule still applies
to their situation. Rules 18–27, added later in the same engagement as
the fleet's landing pipeline, DONE-verification, skill-hygiene, and
conflict-resolution discipline matured, are summarized in the addendum
immediately after the numbered list rather than restated in full — see
AGENTS.md for their exact current text, since 18 and 21 were themselves
amended after first being written and a summary would otherwise drift
from the authoritative
source.

1. **Roster** — a single source of truth for which seats are active,
   parked, or reassigned, and their non-overlapping scopes.
   *Rationale: prevents duplicate or conflicting work across seats.*
2. **Attribution** — every commit tagged `[AI: <SEAT>]`, every reply
   signed; a misdirected prompt is held, not silently actioned.
   *Rationale: makes it possible to audit who did what, and stops a seat
   from acting on instructions meant for someone else.*
3. **Queue** — the task ledger is worked in order and is append-only;
   reassignments are edits/notes on a row, never deletions.
   *Rationale: preserves a complete, tamper-evident history of scope
   changes instead of a ledger that silently rewrites its own past.*
4. **Stage-gate** — "done" means pushed + verified + landed + green
   build, not just "I wrote the code."
   *Rationale: closes the gap between "an agent said it's done" and "it
   is actually live," which is the single most common failure mode in
   unsupervised agent work.*
5. **Quality** — pre-push static/type checks, post-land verdict
   (PASS/REVERT/FIX-REQUIRED), zero fabricated content or metrics.
   *Rationale: catches regressions before they land, and makes
   fabrication an explicit rule violation rather than an implicit norm.*
6. **Protected paths** — a named list of files/directories no seat
   touches without explicit human approval.
   *Rationale: some code (payment logic, dependency manifests, security
   config) is expensive to break and cheap to protect explicitly.*
7. **Docs ownership** — one seat (scribe) owns the rulebook and ledger;
   others read but don't fork/override it locally.
   *Rationale: a ruleset that every seat can silently edit is not a
   ruleset — it needs one accountable owner.*
8. **Session rotation** — a degraded session leaves a HANDOFF note before
   rotating out.
   *Rationale: agent sessions run out of context or hit tool failures;
   losing state silently is worse than a five-minute handoff note.*
9. **Seat directory isolation** — each seat works from its own worktree,
   never the shared trunk checkout a landing script depends on.
   *Rationale: concurrent seats checking out branches in the same working
   directory will collide on HEAD and corrupt each other's work.*
10. **Undo discipline** — every ledger row carries a one-line, concrete
    inverse command.
    *Rationale: rollback planned in advance is deterministic; rollback
    improvised after a bad landing is a guess.*
11. **Skills catalog** — a small file mapping each seat to its actual
    expertise, used for routing.
    *Rationale: route by fitness for the task, not just by which seat is
    idle.*
12. **Sub-agent gate dispatch** — a blocked executor reports the gate
    instead of idling; the conductor dispatches the unblocking work to
    whichever seat owns that kind of decision.
    *Rationale: an executor blocked on a secret, an approval, or a design
    call shouldn't sit idle when other seats could resolve the gate.*
13. **Screenshot extrapolation** — one flagged instance of a defect class
    automatically scopes the fix to every instance of that class,
    site-wide.
    *Rationale: an operator spot-check surfaces a symptom, not a scope;
    treating it as scope-of-one guarantees the same defect resurfaces
    elsewhere and gets "fixed" over and over.*
14. **Security-merge guard** — any landing touching security-relevant
    config (headers, middleware, rate limits) is re-verified post-land,
    not just pre-push.
    *Rationale: a squash/merge can silently revert a security posture
    change even when the pre-push check passed on the source branch.*
15. **(unused)** — no rule was ever assigned this number in this
    engagement. Recorded here so a future repo doesn't assume every
    integer up to N is a real rule.
16. **Always engaged** — no seat waits on a blocked target; it switches to
    an approved side-hustle or a Rule-17 proposal and says so in one line.
    *Rationale: idle agent time is a defect, not a neutral state — there
    is almost always adjacent, approved, useful work available.*
17. **Propose freely, execute on approval** — any seat can surface an
    improvement proposal at any time; nothing executes without explicit
    operator sign-off.
    *Rationale: separates "surfacing an idea" (cheap, should happen
    often) from "spending execution budget on it" (expensive, needs a
    human decision) so agents don't need permission to think out loud.*

### Addendum: rules 18–27 (added later, summarized)

18. **Self-landing, bounded** (amended) — a seat pushes its own branch
    and qualifies for the landing script's next sweep; direct push to
    the trunk is NOT a fleet primitive on any platform where the harness
    itself blocks it — verify this on your own platform rather than
    assuming either way.
19. **Limit handoff** — when a seat hits a usage/rate limit mid-task, the
    active seat takes over from the completed state rather than the
    fleet waiting for a reset; the limited seat exits the taken-over
    task on return and picks up the next open item.
20. **Long-run mission blocks** — once a domain's spec/acceptance/
    failure-gates are on disk, the conductor issues one prompt covering
    multiple builds; the claiming seat self-sequences to the block's
    end-state, seats coordinate via a disk handoff log instead of
    conductor hops, and the conductor intervenes only on red flags,
    approvals, limit handoffs, or audit failures.
21. **Self-verifying tools + living resume** (amended) — batch tools
    emit machine-checkable counts and fail loudly on zero-processed
    against non-empty work; claims are verified against actual disk
    state before reliance; every seat maintains a living resume file
    read first after any restart; amended to also require reading the
    approval-queue file at turn start and executing anything approved.
22. **Self-contained prompts, no-stall queries** — a conductor prompt
    carries both a verification method and a fallback for every factual
    claim it makes, so a seat never stalls asking "how do I check this."
    Includes the squash-safe DONE-verification method (tree check +
    landing-marker check, never raw branch ancestry, since a landing
    script that squashes rewrites SHAs) and its fallback (undecidable →
    log the gate, keep working anything non-dependent, escalate).
23. **Every relay improves the system** — the conductor's side of rule
    17: every relay to a seat carries at least one process/tooling
    improvement, not just a task assignment.
24. **First-viewport live proof** — a UI row is DONE only with actual
    deployed-environment screenshots attached at a mobile and a desktop
    width; "committed," "landed," and "live" are three distinct,
    non-interchangeable states and a report uses whichever is true.
25. **Live-or-locked** (the strictest rule adopted in this engagement,
    overriding the cadence rules above where they conflict) — "done"
    means the asked-for result is visible on the deployed frontend,
    proven by a screenshot of the actual rendered result, not a passing
    endpoint or a green build standing in for it; every mission order
    must therefore carry a frontend-visible acceptance line, or it isn't
    a task in its own right — it's an internal chore folded into one
    that does have a visible result. A seat takes no new task until its
    current one is visibly live, with one exception: a task blocked on
    another agent's artifact or an operator decision can be marked
    LOCKED (naming the specific dependency) while the seat moves to the
    next task — and the instant that dependency clears, the LOCKED task
    outranks everything newer.
    *Rationale for 18–25 as a group: as the fleet scaled past two
    seats, "I pushed it" quietly drifted into meaning "it's done" even
    though nothing had actually landed, deployed, or rendered — each of
    these rules closes one specific gap in that drift, discovered in
    the order the engagement actually hit it.*
26. **Skill hygiene + self-scouting** — a skill loads only when the task
    at hand matches its purpose and built-in capability isn't already
    enough, with the load-reason stated in the seat's report; seats
    rotate a weekly-plus-wave-boundary scan for new agent skills, log
    findings (name, source, the specific fleet pain it maps to,
    ADOPT-TRIAL/WATCH/SKIP) in a dedicated scouting file; adopting a
    skill for real use requires an approval-queue row first, while
    watching or skipping needs no approval; a skill unused for two
    consecutive waves is flagged as a retirement candidate.
    *Rationale: preloading every plausible skill "just in case" wastes
    context and obscures which capability actually did the work; a
    lightweight, logged scouting cadence keeps the fleet's tool
    inventory current without letting adoption bypass the same approval
    discipline every other operator-facing change goes through.*
27. **Resolve, don't ask** — portable to any future project, not
    specific to this repo's stack or domain. When an instruction
    conflicts with disk state (a referenced rule that doesn't exist yet,
    an ownership mismatch, a stale branch), a seat never blocks the
    whole turn on a clarifying question. It resolves via an ordered
    tie-break: hold only a destructive/irreversible act touching the
    specific discrepancy (the one permitted hold, and it holds only that
    act); otherwise proceed under the safest reasonable interpretation
    and log both the discrepancy and the interpretation chosen;
    ambiguous ownership gets taken and logged rather than debated first;
    a rule referenced in an instruction but absent from the actual
    rulebook is treated as provisional text, applied, with its
    codification queued — never met with "does this rule exist?" back to
    whoever gave the instruction. A clarifying question becomes a report
    instead: "Discrepancy X; my resolution Y; reverses if countered next
    turn." A whole-turn stall caused by an unresolved discrepancy is
    itself a rule violation, not a safe default.
    *Rationale: an agent fleet that pauses every turn a disk state
    doesn't perfectly match an instruction grinds to a halt under
    realistic operating conditions — branches go stale, ownership shifts,
    rules get referenced before they're written down. Treating the
    mismatch as something to resolve-and-report, with a narrow safety
    valve for genuinely destructive acts, keeps the fleet moving while
    keeping every resolution reviewable and reversible. This is the one
    rule in this playbook explicitly designed to travel unchanged to a
    different project — it isn't about this fleet's specific tools or
    domain.*

## 3. Ledger formats

### Wave-queue row schema

```
| Task ID | Parent | Batch | J/Domain | Assigned To | Status | Land SHA | Notes |
```

- **Task ID** — a stable, sequential identifier (`W2-NNN` in this
  engagement). Never reused, even if a row is superseded.
- **Status** — one of: OPEN, CLAIMED-<SEAT>, DONE (only once Rule 4's
  stage-gate is met — and, under Rule 25 where adopted, only once the
  asked-for result is visibly LIVE, not merely landed), LOCKED (Rule 25's
  one exception: blocked on another agent's artifact or an operator
  decision, with the specific dependency named), PARKED, SUPERSEDED,
  VERIFIED, DROPPED.
- **Notes** — the scope description, plus every subsequent annotation
  appended over the row's life (see below). This is the field that grows;
  everything else stays close to static once set. Where Rule 25 is
  adopted, LIVE proof (a rendered-result screenshot, or a direct link to
  one) is carried here rather than as a separate table column — adding a
  literal schema column would mean retrofitting every historical row,
  which the append-only discipline in §3's own annotation protocol
  argues against; a new convention rides in the field designed to grow.

### Annotation protocol

A row's history is built by appending to its Notes field, never by
editing or deleting prior content:

- **Reassignment**: change the Assigned To value and add an inline note
  — `Reassigned <OLD> → <NEW> (<date>): <reason>` — in the same edit.
- **Audit finding**: append `Audit <VERDICT> — <finding>` without
  touching the row's original scope text.
- **Sequencing change**: append a note on the affected row(s) rather than
  physically reordering the ledger — the ledger's row order is not itself
  meaningful; the notes carry the real dependency graph.
- **Never**: delete a row, delete a stale note, or silently rewrite a
  claim already committed. If a claim turns out to be wrong, append a
  correction that says so explicitly — the wrongness itself is part of
  the record.

### Activity log

One dated entry per unit of scribe work, in a fixed shape:

```
## <date> <time> - <SEAT> <topic> (<task IDs>)
**Action:** <what changed and why, in enough detail to stand alone>
**By:** <seat> (<underlying tool>)
**Status:** <✅ Complete / ⚠️ Partial / ❌ Blocked>
**Files Modified:** <list>
**Next Steps:** <what happens next, and who>
```

Append-only, same as the queue. A partial or blocked entry is written
honestly rather than deferred until it can be reported as complete.

## 4. Mission-order format

Every unit of work handed to an executor states, verbatim, all seven
fields — omitting one is how scope creep and silent reinterpretation
happen:

```
TARGET:      <the specific file(s)/feature/defect class>
MANDATE:     <what must be true when this is done>
OUTPUT:      <the concrete artifact — file, migration, doc, report>
ACCEPTANCE:  <the test that proves MANDATE is met — specific, checkable>
FAILURE:     <what "not done" looks like, so partial work isn't miscounted as done>
DEPENDENCY:  <what must land first, or NONE>
DEADLINE:    <a real date/sequencing point, or NONE>
```

**Single-target vs. batch:** default to single-target mission orders —
one defect class, one feature, one doc. Batch several small, genuinely
independent targets into one mission order only when they share the same
files and the same acceptance test; batching unrelated targets just
because they're small produces mission orders no one can mark partially
done.

## 5. Landing pipeline pattern

- One landing script (this engagement's `land.ps1`) is the only path from
  a feature/docs branch to the shared trunk. It sweeps eligible branches
  each run, except those explicitly held (a hold-list file, checked at
  the top of the script).
- **Docs-only branches get a rebase-then-squash path**, not a blind
  squash-merge: rebase the docs branch onto the current trunk first
  (resolving shared append-only files by keeping both additions, in
  chronological order), then squash. A blind squash-merge against a
  fast-moving docs trunk produces silent content loss.
- The landing script **reports** a conflict it can't resolve
  automatically — it does not silently skip or fail the branch. A silent
  failure here compounds: the next several branches queue up behind an
  invisible blocker.
- **Verify stack**, run in this order:
  1. Static/type checks pre-push (fast, catches most defects cheaply).
  2. Build green post-land.
  3. **Edge Playwright** — the actual deployed environment, not just a
     local dev server or build output. A tool that passes locally and
     fails on the deployed edge is not actually passing.
  4. Per-milestone audit — a full sweep (e.g. this engagement's
     SWEEP_100) run mechanically by one executor, then spot-audited by
     the other seat, per Rule 1's disjoint-ownership no-self-cert clause.

## 6. Honesty conventions

- **Rule 13 class extrapolation** (see §2) — treat every operator-flagged
  defect as a defect *class* to sweep, not a single fix.
- **No-fabrication, hard rule** — never write a claim (a metric, a
  "verified" status, a piece of content) that hasn't actually been
  checked against real state. If content doesn't exist yet, say so and
  queue the work to produce it — don't produce a plausible-sounding
  substitute.
- **Labeling discipline**: three distinct labels for three distinct
  situations, and they are not interchangeable —
  - `INDICATIVE` — real computed output from placeholder/sample input
    data (the calculation is real, the input isn't yet).
  - `ROADMAP` — a feature genuinely not built yet; the UI says so instead
    of implying it works.
  - `TEST` — a payment/transaction flow running in a provider's test
    mode, not production money movement.
- **Deployed-edge-as-truth** — the only environment whose behavior counts
  as "done" is the one a real user would hit. Local dev and CI build
  output are necessary checks, not sufficient ones.
- **Audit false-positive discipline (shallow-selector warning)** — an
  automated sweep that flags "empty container" or "broken link" by a
  shallow CSS/DOM selector match can produce false positives (e.g.
  matching a loading skeleton, or a conditionally-rendered wrapper that's
  legitimately empty pre-hydration). Every automated finding gets a human
  or a second, deeper check before it's treated as a confirmed defect —
  don't let a sweep's false-positive rate quietly inflate the defect
  count or, worse, cause a "fix" that breaks a working pattern.

## 7. Operator gates

- **Protected paths** (Rule 6) — named upfront, not discovered by
  breaking something. A row that must touch a protected path proceeds
  only on explicit, task-specific human approval — and that approval
  does not become a standing exception for future rows touching the same
  path.
- **Production-write protocol** for anything touching live data
  (migrations, production config): take a restore point first, apply one
  file/one change at a time, verify after each step, and stop on the
  first error rather than continuing through a partially-applied change.
- **Narrow conditional approvals** — when a human grants approval "for
  this specific task," the ledger records that scope explicitly (what was
  approved, what wasn't touched) rather than letting the approval's scope
  drift into an assumed blanket permission.

## 8. Capacity contingency

- **Rate-limit dark-window planning** — a seat can go rate-limited or
  otherwise unavailable mid-engagement. Rows assigned to a dark seat get
  a conditional fallback assignee noted directly on the row (e.g. "assign
  X; reassign to Y if X still limited") so work doesn't stall waiting for
  a status check that may never resolve within the task's timeline.
- **Single-target cadence** — during a capacity crunch, prefer handing
  out one mission order at a time over queuing a large batch, so a
  reassignment or a dark seat doesn't strand several rows' worth of
  half-specified work.
- **Rule 16/17 as the capacity release valve** — a blocked seat has an
  approved menu of side-work (perf/a11y/SEO audits, coverage gaps, docs
  completeness) to fall back on, and a channel (Rule 17 proposals) to
  surface bigger ideas without needing to be handed a mission order for
  every one of them.

## 9. Bootstrap checklist for a new repo

1. Seed `AGENTS.md` with the ruleset template (§2), adapted to the new
   repo's actual protected paths and stack.
2. Seed `docs/ROLE_MAP.md` with the roster (start with one executor +
   one scribe; add a second executor only per §1's three conditions).
3. Seed `docs/WAVE_QUEUE.md` with the row schema (§3) and the first
   real batch of mission orders (§4) — don't seed it with placeholder
   rows.
4. Create `docs/ACTIVITY_LOG.md` and `docs/seats/<SEAT>.md` per seat.
5. Copy/adapt the landing script pattern (§5): one gate, a hold-list
   mechanism, a rebase-then-squash path for docs branches, and a report
   (not silent-fail) behavior on conflicts.
6. Set up the verify stack (§5): static/type check command, build
   command, an edge-reachable Playwright config once there's a deployed
   environment to point it at.
7. Install/adapt whatever skills or tooling the new repo's stack needs
   (e.g. a design-token skill if there's a design system to conform to,
   a schema/SEO skill if structured data matters) — mirroring this
   engagement's practice of loading a skill before touching its domain
   rather than improvising.
8. Write the repo-specific compliance/protected-domain gate document if
   the new project has one (this engagement's `docs/COMPLIANCE_GATE.md`
   equivalent) before any seat starts work in that domain.

## 10. Lessons appendix

**Status: partial.** CRANE's and ATLAS's paragraphs are in below.
MASON's and RIVET's are still pending — to be inserted via a follow-up
row once collected (target: after 1:09, per the operator's own
schedule). SCRIBE did not fabricate first-person quotes for either
paragraph below; each is composed from the operator's one-line summary
of the lesson plus the actual documented incidents in this engagement's
git/ledger history that produced it — every factual claim in both
paragraphs traces to a cited row or commit, not to invented detail.

**CRANE — stale-branch re-landing rule:** Several docs branches this
engagement were built by stacking one unlanded SCRIBE branch on top of
another (rather than each forking fresh from `origin/main`), because
`origin/main` itself hadn't caught up with in-flight renames yet — most
visibly the CODEX→MASON/RIVET seat rename (W2-356), which never
propagated into the parallel branch chain that produced W2-359 through
W2-380 because that chain had already forked from `origin/main` before
the rename landed. The result: rows like W2-354 carried a stale "CODEX"
assignee for several more tasks after the rename was supposedly
complete, and had to be corrected again later (see the 2026-09-02 12:51
AM reassignment entry). The rule this produces: **before landing a stack
of branches, re-check whether an earlier branch in the same logical
change (a rename, a reassignment, a rule addition) has landed
independently — a branch that forked before that landing will silently
reintroduce the pre-change state when it lands after.** This is why
W2-357 (LANDING_PIPELINE_FIX) exists, and why the rebase-then-squash
protocol re-verifies against `origin/main` immediately before every push
rather than trusting the state of the branch it was built from.

**ATLAS — trust-disk-over-labels rule:** Multiple rows in this
engagement carried a status or an approval note that turned out, on
direct verification, not to match what had actually happened — W2-347's
"tools side" label implied wiring work when the actual result was
honest labeling with no code changes; W2-360's RULE 6 protected-path
approval was granted but the row's own audit confirmed zero files under
`apps/web/app/boq-pro/**` were touched, meaning the approval went
unused rather than exploited or forgotten silently; and a self-corrected
draft on the same row nearly asserted a GST/export capability that
doesn't exist before the discrepancy was caught pre-landing. The rule
this produces: **an audit verifies against the actual file/commit state
on disk, never against a row's own status label, an assignee's
self-report, or what the task description implied would happen** — a
label or a "DONE" status is a claim to be checked, not a substitute for
checking.

The list below is the set of concrete defect classes this engagement
actually hit, documented from git/ledger history as a checklist starting
point; it is not a substitute for the remaining MASON/RIVET paragraphs,
which the conductor should collect and hand to SCRIBE to insert here.

Defect-class checklist (from this engagement's real history):

- **Placeholders** — empty visual containers, "Learn more"-only card
  clickability, unwired buttons, empty nav tabs. Caught by Rule 13
  extrapolation once flagged once.
- **Claim-truth drift** — marketing copy asserting a capability
  (KYC verification, escrow payments, a computed feature) ahead of what's
  actually implemented or wired. Needs a dedicated full-site claim
  inventory pass, not a spot-fix.
- **Fabricated individuals/authorities** — a risk specific to any content
  pass that names people, firms, or credentials; verify against something
  real before publishing content that implies a named source.
- **Deploy ≠ local** — a tool or flow that works in local dev/build but
  fails on the deployed edge (different runtime, different env vars,
  different headers). Only a deployed-edge Playwright pass catches this.
- **DB migration gaps** — a schema claim (a table, a column) landed in
  docs before the actual migration was written, or a migration applied
  locally but not to production under the same protocol.
- **Brand-spec verbatim drift** — a design/brand spec paraphrased instead
  of applied exactly (wrong hex value, reworded tagline) when the
  operator gave verbatim text; always apply brand/legal/compliance text
  character-for-character, never paraphrased.
- **Squash drift** — a docs branch squash-merged against a fast-moving
  trunk silently drops content added concurrently by another branch;
  motivated Rule 5's landing-pipeline fix (§5).
- **Empty containers** — see Placeholders above; called out separately
  because it recurred as its own named sweep (site-wide, deployed-edge
  verified) after the first Rule-13 pass didn't fully close it.
- **Hardcoded maps/defaults** — a map or location-aware component
  defaulting to one hardcoded city regardless of the actual selected
  entity (e.g. a Chennai parcel lookup rendering a Bengaluru map). Class
  fix: every instance of a map/location component must derive its
  center from the actual selected data, with a neutral, non-defaulting
  pre-selection state.
- **False-positive selectors** — see §6's audit false-positive
  discipline; an automated sweep's shallow selector match is not itself
  proof of a defect.

### Additional per-seat lessons (collected as delivered)

**CRANE — second lesson, land.ps1 diff-emptiness (delivered 2026-09-03,
W2-370 milestone report):** `land.ps1`'s
skip condition is diff-emptiness only (`git diff main...branch`), not
content-awareness — a branch that already fully landed once can get
re-landed and duplicate its own content if any later, unrelated branch
touches the same file afterward, because the 3-dot diff against the new
main tip reads non-empty again even though every line the branch would
add already exists on main in different surrounding context. This hit
`w2-367/crane-map-preselect` twice in a row, breaking `tsc --noEmit` both
times with duplicate top-level declarations. Rule: after any landing that
touches a file another branch previously modified, don't just patch the
visible symptom — check whether the offending branch's entire diff is
already present on main (`git diff origin/main...origin/<branch>`), and if
so, delete the stale remote branch outright rather than leaving it to be
silently re-attempted by every future `land.ps1` run. A one-off patch on
main fixes the symptom for exactly one run; only removing the stale branch
removes the recurring cause.
