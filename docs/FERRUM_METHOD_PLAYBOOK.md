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
matured — forty-five numbered rules were actually adopted (numbered
1–14, 16–31, 33–47 — RULE 15 and RULE 32 were never assigned; leave
gaps in your own numbering rather than force sequential renumbering
when a rule is superseded or dropped). Rules 1–17 are detailed below,
each with the one-line rationale that justified adopting it — carry the
rationale forward even when you reword the rule for a new repo, because
the rationale is what tells a future reader whether the rule still
applies to their situation. Rules 18–31 and 33–47, added later in the
same engagement as the fleet's landing pipeline, DONE-verification,
skill-hygiene, conflict-resolution, operator-safety, numeric-correctness,
gap-filler-seat, single-outcome-focus, pull-queue, observe-refine,
timed-stop-single-inbox, fleet-watch, relay-discipline, honesty-
reporting, device/perf-gate, push-authority, citation-sequencing, and
principle-generalization discipline matured, are summarized in the
addendum immediately after
the numbered list rather
than restated in full — see
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

### Addendum: rules 18–31, 33–47 (added later, summarized)

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
27. **Resolve, don't ask** (refined after a real exemplar incident in
    this engagement — see below) — portable to any future project, not
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
    whoever gave the instruction, and bounded by the provisional-text
    limitation below. A clarifying question becomes a report instead:
    "Discrepancy X; my resolution Y; reverses if countered next turn." A
    whole-turn stall caused by an unresolved discrepancy is itself a
    rule violation, not a safe default.

    **The triple-flag exception.** The one condition under which asking
    a single confirming question IS the compliant move, not a violation:
    an instruction combining all three of (a) urgency pressure ("watched
    live," "drop everything," "immediately"), (b) a cross-seat ownership
    override (reassigning something another seat/role owns), and (c) an
    explicit instruction to disable verification ("no questions," "don't
    check"). All three together earns exactly one identity-and-scope
    confirmation through the normal reporting channel, while every
    non-dependent piece of work continues in the meantime. Any one or
    two of the three flags alone do NOT trigger this — ordinary resolve-
    and-report handles them. The exception exists because that specific
    combination is the one shape of instruction indistinguishable, on
    the seat's side, from a compromised or spoofed channel — the other
    tie-breaks in this rule assume good-faith ambiguity, not that.

    **The provisional-text limitation.** A citation to a rule, row, or
    identifier that isn't actually on disk only ever grants provisional
    authority for process acts — work that is non-destructive, fully
    reversible, and inside the seat's existing scope. It never
    authorizes: changing the rulebook itself, a destructive or
    shared-state action (deleting a branch, touching a protected path,
    writing to production), or reassigning ownership of something
    another seat holds. Those four kinds of action require either real
    evidence already on disk, or an explicit, quoted attestation from
    the human operator — provisional treatment of a missing reference is
    never sufficient on its own for any of them.

    **Exemplar incident:** the first draft of this rule authorized
    resolving essentially any instruction-vs-disk conflict without
    asking. Applied literally, it would also have covered an urgent-
    sounding, ownership-reassigning, "don't verify this" instruction —
    exactly the shape a compromised or impersonated instruction would
    take. The refinement above was written specifically to close that
    gap: add back exactly one narrow, auditable check for that one
    combination, and put a hard ceiling on what a merely-cited-but-
    unverified reference can authorize. Record your own project's first
    real near-miss the same way, rather than only the rule's final text.
    *Rationale: an agent fleet that pauses every turn a disk state
    doesn't perfectly match an instruction grinds to a halt under
    realistic operating conditions — branches go stale, ownership shifts,
    rules get referenced before they're written down. Treating the
    mismatch as something to resolve-and-report, with a narrow safety
    valve for genuinely destructive acts and an even narrower one for
    the specific pressure/override/no-verify combination, keeps the
    fleet moving while keeping every resolution reviewable, reversible,
    and resistant to exactly the kind of instruction a bad actor would
    send. This is the one rule in this playbook explicitly designed to
    travel unchanged to a different project — it isn't about this
    fleet's specific tools or domain.*
28. **Operator environment is production** (amended after adoption —
    see below) — a seat never relaunches, flags, or modifies the human
    operator's own browser or machine. Every piece of browser-control
    work (live-view checks, deployed-edge screenshot capture for a
    DONE/LIVE verification) runs against an isolated instance or
    profile, never the operator's actual running session — its
    extensions, history, bookmarks, or OS-level state are all
    off-limits. Any operator-visible side effect outside the actual
    deployed artifact under test — a browser banner, a changed
    extension/profile setting, a stray notification — is a violation
    regardless of intent, and gets reverted first, logged second.
    **Amendment:** a headed (visible) browser window, an automation-flag
    banner ("this browser is being controlled by automated test
    software" or equivalent), or any browser session visibly appearing
    on the operator's machine at all is itself a violation — not only a
    side effect occurring inside that window. Verification work runs
    headless and isolated only; a tool whose default behavior would
    surface a visible window or banner on the operator's own machine is
    not used for this purpose without first being configured headless.
    *Rationale: agent-driven browser automation is powerful enough to
    accidentally treat the operator's own daily-use environment as a
    disposable test fixture; drawing this line explicitly, before any
    live-verification rule (like this playbook's rule 24 or 25) gets
    exercised for real, prevents a genuinely embarrassing and trust-
    damaging class of incident rather than discovering the boundary
    after crossing it. The amendment closes a gap in the original
    wording: a headed window with no other side effect could otherwise
    read as compliant, when the visible appearance on the operator's
    machine is itself the harm this rule exists to prevent.*
29. **Numeric-UX sanity** — portable. Any UI that renders numbers
    carries a standing acceptance block, self-checked at build time and
    audited independently: weights/shares sum to 100 with display
    normalized (rounding never silently produces 99 or 101 on screen);
    a shown share equals the math actually used to compute it, never a
    display-only figure that's drifted from the real calculation; a
    displayed band or range contains its own stated median; units stay
    consistent throughout a view; a percentage reconciles to its stated
    base; a rounded display value states its precision where that
    precision matters to the reader's decision.
    *Rationale: "the math on screen doesn't add up" is one of the most
    embarrassing classes of defect a shipped product can have, and one
    of the cheapest to catch mechanically before shipping — treating it
    as a build-time acceptance check rather than something an operator
    or user has to notice and report keeps a fleet's credibility intact
    on exactly the kind of error that's hardest to explain away
    afterward.*
    **Feature Conservation addendum (added 2026-09-04, exemplar
    incident below):** no restyle or sweep may remove or demote a
    genuinely live tool — moving it is fine, disappearing it under a
    redesign commit message is a regression. The audit role's checklist
    gains a standing check against a registry of previously-live tools,
    run on every sweep/restyle row, not only rows that explicitly claim
    to touch a named tool. *Exemplar incident:* a UI-modernization sweep
    in this engagement replaced a real, backend-backed lookup tool with
    a sample-data-only slider under a commit message that described
    itself as a redesign, not a removal — passed the sweep's own
    approval rubric and the independent audit both, and was only
    discovered when the human operator looked at the live page
    themselves. This addendum, and the companion tool registry, exist
    specifically so that class of regression can't repeat silently.
30. **Unit duality** — portable, for any product with a global or
    multi-region audience. Every length and area input and output
    supports both common unit systems side by side (e.g. metric/
    imperial, or a domain-specific set like the cents/guntha/ground/acre
    land-measurement units used regionally in this engagement) — both
    units are always visible together, never one hidden behind a toggle.
    A persisted, global primary-unit preference controls display order
    or emphasis, never which units exist. Conversions use exact
    constants, never rounded-off approximations that drift under repeat
    conversion. This rule's conversions are covered by rule 29's
    numeric-sanity vectors, not a separate check.
    *Rationale: a product built assuming one unit system silently
    excludes or confuses a real fraction of its actual users the moment
    it's used across a region or audience that doesn't share that
    assumption; treating dual-unit display as a first-class requirement
    from the start is far cheaper than retrofitting it once every
    numeric surface already assumes a single unit.*
31. **Overnight autonomy** — portable. During a declared operator-absent
    window: no blocking queries — any ambiguity resolves via rule 27's
    tie-breaks, exactly as it would with the operator present. A
    genuine question for the operator becomes a logged
    OPEN-FOR-OPERATOR line in both the report and the relevant ledger
    row, and the seat immediately moves to the next queued task rather
    than waiting on it. A destructive/irreversible act still holds — the
    safety exception doesn't relax overnight — but the hold covers only
    that one act, never the rest of the queue behind it. Any queue
    worked overnight carries at least 3 sequenced tasks, so a "next"
    always exists when the current one hits an OPEN-FOR-OPERATOR line or
    a LOCKED dependency. By default, treat every operator rest window
    (roughly 8 hours) as a build window — this doesn't need a fresh
    declaration each time, only a queue deep enough to fill it.
    *Rationale: an unattended window is exactly when "stall and wait for
    an answer" is most expensive — hours of idle time instead of minutes.
    Converting a would-be question into a logged, resolvable line and
    moving on keeps the fleet productive through the gap, while the
    unchanged destructive-act safety valve and the OPEN-FOR-OPERATOR
    trail mean nothing risky happens unsupervised and nothing gets lost
    for the operator to review at the start of the next session.*
33. **Gap-filler seat** (protocol partial — see below) — portable to any
    fleet running two or more primary executors. A gap-filler seat
    activates only when every primary executor is simultaneously at
    limit — it never displaces or competes with a primary that's
    actually available. Once active it works a disjoint file/path
    envelope, never overlapping a primary's current scope; lands
    exclusively through the fleet's normal landing path, with no
    seat-specific shortcut for being a gap-filler; and stays
    non-destructive for the length of its trial — no protected paths,
    no schema/infra changes, no exception to any other seat's bounds.
    **Known gap:** this engagement's adoption of the rule referenced a
    pace-metric and sunset provision ("as above") that was never
    actually supplied in any message the docs seat received, checked
    twice. Rather than inventing numbers or a formula, the docs seat
    left that fifth part explicitly marked NOT YET DEFINED and logged
    the gap in the seat's own doc and the fleet ledger. Treat this as
    the template for handling any adopted rule whose text partially
    fails to arrive: land the parts you actually have, mark the missing
    part as a named TODO rather than filling it in, and never let an
    incomplete rule block adopting the parts that are real.
    *Rationale: as a fleet's primary executors approach capacity limits
    more often, an idle-until-needed extra seat recovers throughput
    without adding a standing competitor for work a primary would
    otherwise claim — but only if its activation condition, scope, and
    landing discipline are as strict as any other seat's, and only if
    a fleet's docs discipline holds even when an instruction adopting a
    new rule arrives incomplete.*
34. **Single-outcome focus** — portable, for any fleet with more than
    one active seat and a milestone big enough to justify pausing
    everything else. Declares one outcome (in this engagement, a
    cross-product Workspace object model) as the sole claimable work
    until it clears its own written acceptance checklist against the
    deployed edge (rule 25's standard, not "landed"). Every other
    open ledger row is marked DEFERRED, not dropped or superseded, as
    one consolidated ledger declaration listing every affected row by
    ID rather than mutating each row's own status field — safer at
    scale than dozens of individual edits, and just as auditable. The
    docs seat's own ledger/rules maintenance is explicitly exempt: it
    is the mechanism enforcing the focus, not competing work outside
    it. The focus lifts only when the acceptance checklist is fully
    satisfied live, logged as its own ledger row and activity-log
    entry, at which point every deferred row returns to its prior
    status.
    *Rationale: a fleet running several parallel seats can ship a lot
    of small, real progress while the one outcome that actually matters
    stalls indefinitely in the gaps between everyone's other work;
    naming the single outcome, writing its own acceptance bar down
    before starting, and explicitly parking everything else (with a
    clear, auditable resume path) is the direct fix once a milestone
    is judged important enough to justify it — the cost is real
    (everything else visibly stops), so this rule is meant to be
    invoked deliberately and lifted promptly, not left standing by
    default.*
35. **Pull-queue** — portable, an alternative permanent operating mode
    to conductor-assigned tasking (compatible with rule 34's scope
    lock, since it just governs how rows *within* the locked scope get
    claimed). A dedicated task-board file lists rows with an explicit
    file/path envelope, eligible seats, acceptance criteria, and
    dependencies. A seat pulls its own next row — at turn start and
    immediately after finishing one — rather than waiting for the
    conductor to assign it, as long as the row's dependencies are DONE
    and its envelope doesn't overlap any row currently claimed by
    another seat. A row can only go STUCK for an operator decision, a
    hard dependency on another seat's still-in-flight artifact, or a
    safety hold — logged as an open question on the row, with the seat
    immediately pulling its next unblocked row rather than idling. A
    seat updates the board only when a row finishes or goes STUCK, not
    on every intermediate step. A shared contract file that multiple
    seats would otherwise edit concurrently becomes its own row with
    its own envelope, so exactly one seat holds edit rights to it at a
    time.
    *Rationale: conductor-mediated tasking adds a round-trip before
    every single task a seat picks up, which is pure latency once a
    fleet has enough seats and a well-specified enough set of rows that
    each seat can safely self-select its own next unit of work; the
    STUCK/pull discipline keeps the fleet from stalling on any one
    blocked row, and treating a shared contract file as a claimable row
    in its own right is what actually prevents two seats from editing
    the same interface definition out from under each other — the
    concrete failure mode this rule was adopted to close.*
36. **Observe-refine loop** — portable, and meant to run permanently
    once adopted (unlike rule 34, which is a temporary lock lifted on
    completion). The human operator watches the live, deployed product
    and reports what they see directly — a missing feature, a rough
    edge, a correction — in plain conversation. Those reports become
    pull-queue rows (rule 35) with a real envelope and acceptance
    criteria, written by the docs seat, with no seat-to-seat relay
    step in between observation and claimable row. Work never stops
    for lack of a next task: a seat halts only on the same STUCK
    conditions rule 35 already defines, logs the open question, and
    pulls its next unblocked row. Every finished row appends a short,
    structured report — who did it, the landing proof, what went
    wrong and what went well, how long it took — to a dedicated
    report log, additive to the row's own status update. Periodically,
    the friction recorded across those reports gets mined for real,
    recurring patterns and turned into concrete refinements to the
    fleet's own rules or ledger formats — and the loop's own rule is
    itself inside that refinement scope, not a fixed point exempt from
    the process it defines.
    *Rationale: a fleet that only reacts to pre-planned milestones
    misses the fastest, cheapest signal available once something is
    actually live — a human looking at the real product and noticing
    what's wrong or missing right now; routing that signal straight
    into the same claim-and-work mechanism the fleet already uses
    (rather than a separate, slower planning pass) keeps the loop from
    the observation to a landed fix as short as the pull-queue itself
    allows, and logging friction as a first-class, structured artifact
    (not just landing SHAs) is what actually lets the fleet's own
    process improve over time instead of repeating the same friction
    silently on every wave.*
37. **Timed stop + single inbox** — portable. Every question a seat
    needs the human operator to answer goes to exactly one place — a
    single, append-only inbox file, never scattered across chat
    replies or individual ledger rows. A seat needing an answer waits
    only a short, fixed window (roughly one turn boundary) before
    parking the blocked task, with a timestamp and a resume pointer,
    and pulling its next unblocked row — it never idles waiting for a
    reply. An answered parked task re-enters the claimable queue in the
    order its answer arrived. The operator, in turn, clears the whole
    inbox in one pass rather than fielding questions one at a time
    mid-stream, and the conductor surfaces the full open inbox at the
    start of every session where the operator is present.
    *Rationale: scattering questions across chat and ledger rows makes
    it easy for a seat's blocking question to go unnoticed while other
    work quietly stalls behind it, and it costs the operator constant
    context-switching to find and answer each one; a single inbox plus
    a hard timeout turns "wait indefinitely for an answer" into "park,
    keep moving, resume the instant it's answered" — the fleet's
    throughput no longer depends on how quickly the operator happens to
    notice a question.*
38. **Fleet watch** — portable, for any fleet mixing native and
    externally-hosted (e.g. CLI-wrapped) agent processes. An OS-level
    process watchdog is the primary reviver for any seat that dies or
    hangs; a same-family agent noticing a different-family agent has
    gone silent (here, Claude noticing a Codex-backed seat is down) is
    the secondary path, tried only after the primary has had its
    chance. Every seat keeps a simple heartbeat timestamp in its own
    living-resume file, updated every turn, so liveness is checkable
    from disk alone. The fleet's watch schedule — who's expected active
    in which window — is logged once a day rather than re-derived from
    memory, and every alert of any kind (a seat down, a revival fired,
    a schedule gap) goes to exactly one named operator channel, never
    an improvised second one.
    *Rationale: a mixed fleet has two different failure surfaces — a
    process that just crashes, and a process that's technically alive
    but has gone unresponsive in a way only another agent watching its
    output would notice — so a single revival mechanism isn't enough;
    layering a cheap, general OS watchdog under a smarter but slower
    same-family fallback gets both failure modes covered without
    over-engineering the common case. A disk-visible heartbeat and one
    alert channel exist for the same reason rule 37's single inbox
    does: multiple places to look for "is everything actually OK"
    is worse than one place, checked reliably.*
39. **Self-contained relays + pre-adjudication** — portable, and the
    conductor-side complement to a seat's own resolve-don't-ask
    discipline (rule 27). Every relay to a seat carries the full,
    verbatim task text — a row or ticket ID is a cross-reference
    annotation, never the actual authority for what to do. A relay also
    states, in advance, how its own foreseeable blockers resolve: a
    citation to a row that isn't actually on the board yet means the
    relay's own inline text still governs, with the gap flagged, not a
    reason to stop; a missing or unmet dependency that wasn't meant to
    block means move to the next task; genuine scope ambiguity resolves
    to the narrowest reading of the literal text; a step that would
    require an unauthorized production write gets held and flagged,
    never silently skipped or silently executed. Doc-dependent relays
    (ones that need a rule or board change the docs seat just made) are
    sequenced after that seat's own landing proof, not before. On the
    receiving side, a seat treats unambiguous inline intent as
    executable even when the citation behind it is absent — execute,
    flag the gap, continue, rather than stalling on a missing reference
    that doesn't actually block understanding the instruction.
    *Rationale: this engagement hit the same shape of problem
    repeatedly — an instruction citing a row, rule, or file that turned
    out not to exist on disk yet — and each time the correct move
    turned out to be the same: treat the actually-given inline content
    as authoritative, flag the gap for the record, and keep moving,
    never invent the missing reference and never stall the whole task
    waiting for it. Writing that pattern down as a standing rule, with
    the specific foreseeable-blocker cases named in advance, turns a
    recurring judgment call into a pre-agreed default — faster for the
    seat, and no less safe, since the flag still happens every time.*
40. **Facts-only reporting** — portable, and applied to every role
    without exception, including the conductor. A report states only
    what's verifiable: a landing SHA, a deployed SHA with its actual
    live-edge response, a real gate/test output, or a blocked state
    named together with the one specific action that clears it. Banned
    outright: forecasts, unearned assurances, adjectives standing in
    for a measurement, progress described as completion, and partial-
    credit summaries that don't name which specific criteria are met
    and how. Incomplete work is reported as what's missing, not as
    what was attempted. An independent audit role logs violations as
    their own class of incident, separate from ordinary findings, with
    a standing consequence (repeated violations trigger a full
    re-onboarding pass) rather than a single silent correction.
    *Rationale: a fleet that runs on written reports rather than a
    human watching every action live is only as trustworthy as those
    reports are literal — the moment "in progress" quietly starts
    meaning "attempted" or "nearly there" starts meaning "there," every
    downstream decision built on that report inherits the same
    unearned confidence. Banning the vocabulary that makes that drift
    possible, not just discouraging it, and giving violations their own
    tracked consequence, is what keeps a large, mostly-autonomous fleet
    safe to actually rely on.*
41. **Device + perf gate** — portable, and hard: a failure here blocks
    landing exactly the way a failing type check does, regardless of
    how correct the feature's own logic is. A responsive matrix runs at
    a fixed set of widths plus a landscape phone case, checking zero
    horizontal overflow and real interaction, with touch targets sized
    for touch and a documented reflow rule for how a complex layout
    collapses below a tablet breakpoint. A floor device (a real,
    named mid-range phone and a real, named older laptop, on a
    named-speed mobile network) sets the actual performance bar, not an
    idealized one — and a capability-gated degradation profile (for a
    graphics feature) keeps low-end hardware functional and honestly
    labeled rather than either broken or silently claiming full
    fidelity it can't deliver. Concrete, CI-enforced budgets (bundle
    size, paint/interaction timing, layout stability, main-thread
    responsiveness, draw calls, frame rate on both the floor device and
    desktop-class hardware) live in one versioned file, and every
    feature-carrying row gets its own before/after perf comparison — a
    regression blocks that row specifically. An audit role's checklist
    carries this matrix and these budgets as a standing check on every
    landing, not only landings that explicitly claim to touch
    performance.
    *Rationale: "works on my machine" and "works on the desktop I
    tested" are two different, both-incomplete claims, and a feature
    that quietly degrades to unusable on the actual floor device a real
    user carries is exactly the kind of regression a fleet running on
    reports rather than constant human spot-checks will not otherwise
    catch — making the floor device, the budgets, and the check
    frequency explicit and CI-enforced (not just documented) is what
    turns "should perform fine" into something actually verified before
    it ships.*
42. **Seat-push standing** — portable. Once a fleet has run long enough
    to trust its seats' branch discipline, a standing grant lets every
    seat push its own work branches without asking per branch — a
    narrow, specific loosening, not a general relaxation of oversight.
    It covers pushing a branch for review/landing only; the separate,
    higher-stakes authority to actually deploy to production stays
    exactly as guarded as it already was, unaffected by this grant.
    Landing itself still runs through the fleet's existing landing
    pipeline and its gates — this rule only removes the approval step
    that used to precede a push, not any step after it.
    *Rationale: requiring a human approval on every single branch push,
    once a fleet's landing pipeline and its actual gates (build, audit,
    perf) are doing the real safety work, is friction without a
    matching safety benefit — the push itself is reversible and gated
    downstream. Keeping deploy authority separately guarded is what
    makes this a safe loosening rather than a blanket one: the
    irreversible, high-stakes action stays exactly as protected as
    before.*
43. **Citation-on-main** — portable, and the direct fix for a specific
    failure mode a fast-moving fleet's docs seat will hit: a conductor
    relay cites a row ID before that row's own seeding has actually
    landed on the shared branch, because the docs seat's landing was
    still queued behind other seats' faster-moving work. The fix: a
    relay may cite a row ID only once that row is verified landed on
    the shared main branch — not merely committed, not merely pushed,
    not merely described earlier in conversation. A task handed down
    before its row has landed travels with the full instruction text
    and no row number at all, so the seat executing it never has to
    resolve a citation that doesn't yet point anywhere real. The docs
    seat's own responsibility under this rule is symmetric: land its
    row seedings before the conductor sequences any relay that cites
    them, rather than treating its own docs work as exempt from the
    same landing discipline everyone else follows.
    *Rationale: discovered directly, in this engagement, in real time:
    the docs seat kept several branches deep in its own unlanded stack
    while other seats landed faster and more often, so several row
    citations went out to seats before the cited row actually existed
    on the shared branch. Every one of those rows turned out fine once
    it landed — the content wasn't the problem — but the citation
    timing was, and it's exactly the kind of gap that's invisible until
    a seat tries to look up a row that isn't there yet. Naming the rule
    after the fix (cite only what's actually on main) makes the
    discipline checkable in one glance at any relay, rather than
    something that has to be remembered.*
44. **Principle-generalization** — portable, and binding on every role
    including the conductor. When the operator corrects one concrete
    surface, the fix scope is not that surface alone — it's every
    analogous surface the correction's underlying principle actually
    reaches, unless the operator explicitly limits it. A mandatory,
    four-part checklist runs on every such correction: state the
    principle in one sentence; enumerate every analogous surface the
    responding role actually owns or knows about; apply the fix to all
    of them in the same pass, flagging by name and reason any it
    genuinely can't reach yet; and record both the principle and the
    enumeration in the report and in the affected ledger rows'
    acceptance criteria, so the generalization step is itself visible
    and auditable, not just its result. Treating a correction as
    scoped to only its literal named surface — skipping the
    enumeration and generalization step — is itself a quality-rule
    violation (an incomplete report), not a smaller, acceptable version
    of compliance.
    *Rationale: an operator correcting one visible instance of a defect
    is very rarely reporting a defect that exists in exactly one place
    — screenshot-extrapolation (rule 13) already established this for
    defect classes; this rule generalizes the same insight to positive
    principles and design corrections, not just defects, and makes the
    generalization step itself a checked, recorded part of the
    response rather than something left to the responding role's
    individual initiative. A fleet that only ever fixes the literal
    named instance re-teaches the same lesson on every analogous
    surface, one operator correction at a time, which is exactly the
    kind of repeated cost this rule exists to close in one pass
    instead.*
45. **Drain-don't-wait** — a seat that finishes a relay's items reads the
    pull-queue in the same turn and pulls its own next eligible row,
    continuing until it runs out of eligible rows, hits a stated limit,
    or is genuinely blocked on a single, explicitly posted operator
    question. Reporting happens per item as work lands, but never ends
    the turn early on its own. Relays shift from single-item dispatches
    to complete work orders.
    *Rationale: a pull-queue (rule 35-equivalent) only pays off if seats
    actually keep pulling from it; without this rule, seats idled
    between relay messages even when eligible work was sitting ready,
    turning a self-service queue back into a dispatch-and-wait loop.*
46. **Idle-only-with-enquiry** — a seat may stop only with a posted
    blocking question on record. Going silent with nothing posted and
    no eligible work left is treated the same as any other incomplete,
    unverifiable report. The harness that revives seats after a rate
    limit or crash is extended to also detect this silent-idle case —
    heartbeat quiet with no question on record — and respond by
    flagging it and dispatching the seat's own next eligible item. The
    conductor's relay role narrows to operator corrections and posted
    enquiries; the drain (rule 45) is expected to self-run in between.
    *Rationale: rule 45 covers a seat that keeps pulling work; this
    rule covers the remaining gap — a seat that neither pulls work nor
    asks a question, just goes quiet — which a conductor otherwise
    cannot distinguish from "still working" without manually polling
    every seat.*
47. **Meeting-report regeneration** — a single named report file is the
    operator's carry-in technical report; on a fixed trigger keyword,
    whichever seat is free regenerates it from disk facts only (commit
    history, test/battery output, manifest/config files, the task
    ledger, perf budgets) — never from memory or assumption — as
    print-ready output, and lands it in the same pass.
    *Rationale: a status report drafted from a seat's recollection goes
    stale or drifts from what's actually on disk the moment any other
    seat lands something; grounding regeneration in the same disk facts
    every seat already uses for DONE/SHA verification keeps the report
    trustworthy without needing its own separate maintenance discipline.*

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
