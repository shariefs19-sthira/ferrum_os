# RULES_REFERENCE.md — governance reference for the Ferrum OS fleet

Compiled by SCRIBE from `AGENTS.md`'s own already-adopted rule text —
this is a navigation/reference layer, not new content. Every word of
rule text and rationale below is a verbatim or lightly-reformatted
excerpt of the corresponding AGENTS.md section; nothing here has been
invented or paraphrased from memory. Where AGENTS.md is amended in the
future, this file should be re-synced from it, not edited independently.

This file covers the seven rules the operator named for this
reference (48, 51, 52, 55, 56, 59, 61), plus the two rules those seven
directly depend on (45, 46) for context, since several of them only
make sense with those two as background. It does not attempt to
re-document the full 1–61 ruleset — see `AGENTS.md` itself for that.

## Table of contents

- [RULE 48 — RE-CHECK-BEFORE-REPORT](#rule-48)
- [RULE 51 — NO_MANUAL_GATE](#rule-51)
- [RULE 52 — OPEN_DRAIN](#rule-52)
- [RULE 55 — EXECUTION_OVERSIGHT](#rule-55)
- [RULE 56 — OPERATOR_INTERFACE](#rule-56)
- [RULE 59 — ASSIGNMENT_EXCLUSIVE](#rule-59)
- [RULE 61 — AUTO_EXECUTE_BY_DEFAULT](#rule-61)
- [The Reserved Five (RULE 61's exceptions)](#reserved-five)
- [The OVERRIDE process](#override-process)

---

<a id="rule-48"></a>
## RULE 48 — RE-CHECK-BEFORE-REPORT
*All seats, adopted 2026-09-05*

**Rule:** Before any done/idle/stop report, the seat re-reads
`docs/TASK_BOARD.md` plus its own queue. If any READY row it owns
remains, it works instead of reporting a stop. The report itself must
state the re-check result — which rows were checked and what was
found — not just the outcome.

**Rationale:** RULE 45 (drain-don't-wait) already requires a seat to
pull its next row after finishing a relay's items, but gave no
explicit gate at the exact moment of reporting; RULE 48 closes that
gap by making the re-check itself a required, stated part of every
stop report, so "I checked and there's nothing left" is a verifiable
claim rather than an assumed one.

**Related rules:** RULE 45 (drain-don't-wait), RULE 52 (open-drain).

**Compliance example:** A stop report reads "re-checked
`docs/TASK_BOARD.md` at 14:02 — no READY rows assigned to MASON
remain; two owner-agnostic rows exist but are gated on W-24's
dependency" — this names what was checked and what was found.

**Violation example:** A stop report that simply says "no more work,
stopping" with no evidence the board was re-read at all.

---

<a id="rule-51"></a>
## RULE 51 — NO_MANUAL_GATE
*All seats + conductor, adopted 2026-09-06*

**Rule:** Any step executable with existing local auth (an
already-authenticated CLI session, an existing credential/token on
disk) or existing tooling (a script, an API, an already-wired deploy
path) MUST be automated — executed by the seat/conductor directly, not
handed to the operator as a manual action. The conductor may never
present an operator action (a dashboard click-path, a manual command
to paste, a "do this yourself" instruction) when a zero-action path
already exists and is reachable without new operator-granted
permission.

1. This does not override an actual permission gate — RULE 51 applies
   only where the automation path is already authorized and available;
   it does not grant a seat new access it doesn't have, and does not
   bypass a genuine approval requirement (protected paths, standing
   deploy-authority guards, etc.).
2. Before surfacing any operator-facing manual step, the seat/
   conductor states which zero-action path was checked and why it
   wasn't usable (auth genuinely absent, tooling genuinely doesn't
   exist, or a real approval gate applies) — a manual step presented
   without that check is itself a RULE 51 violation.

**Rationale:** a fleet whose default is "ask the operator to do the
3-click thing" quietly reintroduces a human bottleneck into every path
that already has automation available, defeating the whole point of
the pull-queue/drain-don't-wait model — the operator's time is the
fleet's scarcest resource, not the seat's.

**Related rules:** RULE 35 (pull-queue), RULE 45 (drain-don't-wait).

**Compliance example:** A row needs a `pnpm add -D` install; the seat
runs it directly under RULE 51's zero-action path rather than asking
the operator to run the command.

**Violation example:** Presenting the operator a "click here in the
Cloudflare dashboard to rotate this key" step when a Wrangler CLI
command with existing auth could do the same thing.

---

<a id="rule-52"></a>
## RULE 52 — OPEN_DRAIN
*All seats, adopted 2026-09-06*

**Rule:** Operator directives name priorities — they never close
scope. A seat with capacity and no executable named row in front of it
does NOT go idle. In order:

1. Pull ANY READY row it's eligible for, owner-agnostic rows included
   — not only rows explicitly assigned to that seat by name. *(Note:
   RULE 59, below, later retires the owner-agnostic half of this step
   — see RULE 59's own text for how the two interact.)*
2. If no eligible READY row exists, re-verify already-landed work
   against any amended acceptance criteria it hasn't been re-checked
   against.
3. If neither of those yields work, propose a new row to SCRIBE for
   seeding — a real gap the seat has found, not busywork.

Idling while unimplemented vision remains on the board (open rows,
amended-but-unverified rows, or gaps a seat could itself name) is a
RULE 40 violation — an unreported blocked state with no actual block.

**Rationale:** named-priority directives describe what matters most
right now, not the sum total of what's left to do — treating a
directive's silence on some row as permission to stop working defeats
the pull-queue and drain-don't-wait model, which already establish
that a seat's job is to keep pulling, not to wait for the next named
instruction.

**Related rules:** RULE 35 (pull-queue), RULE 45 (drain-don't-wait),
RULE 59 (assignment-exclusive — narrows step 1's owner-agnostic option).

---

<a id="rule-55"></a>
## RULE 55 — EXECUTION_OVERSIGHT
*PI, adopted 2026-09-07, amended 2026-09-08*

**Rule:** Seat PI is a dedicated, standing Execution Controller. **PI
implements NOTHING** — no code, no docs authorship beyond its own
ledger, no landings of its own. PI's entire job is oversight of every
other seat's execution.

PI maintains `docs/EXECUTION_LEDGER.md`, one block per board row,
carrying:

1. **Status** — DONE / HALFWAY / IN_PROGRESS / BLOCKED (+ reason) /
   STUCK, PI's own independently-verified status, never a copy of the
   row's self-reported status. **Amended 2026-09-08:** for any
   UI-affecting row, a landing marker (a commit SHA on `origin/main`)
   alone is never sufficient for DONE — DONE requires
   deployed-screenshot evidence actually present in the ledger entry.
   A UI row with a real landing SHA but no screenshot evidence caps at
   HALFWAY until that evidence is supplied.
2. **Owner** — the seat actually executing the row.
3. **METHOD REVIEW** — is this the best possible way to do it?
   Alternatives actually considered are named; a suboptimal method is
   flagged with concrete evidence, never silently passed through.
4. **Technical execution data** — landing SHA, test pass/fail counts,
   deploy version ID, retry count, blocker history, timestamps —
   verifiable facts, not summaries.
5. **TECH_METHOD block** (amended 2026-09-08) — approach, named
   libraries/APIs, key files touched, the actual algorithm used, exact
   verification commands run, plus **ORDER compliance** (did execution
   honor the row's own declared dependency sequence, yes/no, with any
   deviation named).

PI authors the TECH_METHOD block itself, derived from the actual
landing diff and the seat's own report — never invented or assumed.
The ledger updates on EVERY landing and EVERY stop report fleet-wide.
A method-review challenge routes to the conductor as a correction
relay — PI does not fix the method itself.

**Rationale:** a fast-draining, self-pulling fleet risks optimizing
for throughput over quality of method — a dedicated, non-implementing
overseer whose only output is the ledger and method challenges catches
"it landed but it's the wrong approach" in a way no seat auditing its
own work, or a conductor busy coordinating, reliably does.

**Related rules:** RULE 25 (live-or-locked, the standard the 2026-09-08
amendment makes concrete for PI's own ledger), RULE 40 (facts-only).

---

<a id="rule-56"></a>
## RULE 56 — OPERATOR_INTERFACE
*All seats + conductor, adopted 2026-09-08*

**Rule:** The operator's only direct inputs into the fleet are three:
**SCRIBE** (assignments — seeding/amending board rows), **PI** (output
check — the Execution Ledger's independent verification), and the
**conductor** (corrections router). The operator does not prompt
CRANE/MASON/RIVET/ATLAS/FERRITE directly; any operator correction
aimed at a seat's work routes through the conductor, which relays it
to SCRIBE as a new or amended assignment row, never as a direct prompt
to the executing seat.

1. **ASSIGNEE column** — every `docs/TASK_BOARD.md` row carries an
   assignee; the existing "Eligible seats" column serves this role.
2. **Trigger semantics, "next task"** — when a seat receives the
   literal message "next task," it reads `docs/TASK_BOARD.md` and
   `docs/EXECUTION_LEDGER.md`, then drains: pull and land every row
   assigned to it plus every owner-agnostic row it's eligible for, one
   after another, stopping ONLY on a posted blocking question, a
   stated limit, or an empty queue.

**Rationale:** a fleet where any seat can receive an ad hoc operator
correction directly creates two problems this rule closes: the
correction never reaches `docs/TASK_BOARD.md` (so PI's ledger and
future seats can't see it), and the seat acts on an instruction that
never ran through SCRIBE's own citation/generalization discipline.
Routing every correction through SCRIBE as a real row keeps the board
the single source of truth RULE 55's ledger already assumes it is.

**Related rules:** RULE 55 (execution oversight), RULE 57 (product
wardrobes, defines who SCRIBE assigns rows to).

---

<a id="rule-59"></a>
## RULE 59 — ASSIGNMENT_EXCLUSIVE
*All seats, adopted 2026-09-08*

**Rule:** Seats pull ONLY rows assigned to their own seat.
Owner-agnostic pulling — "(any seat)" as an eligible-seats designation
a seat could self-select from — is retired. Every READY row carries
exactly one ASSIGNEE seat. Cross-seat help (one seat picking up a row
nominally assigned to another) happens only via the conductor relaying
a re-assignment through SCRIBE, which updates the row's ASSIGNEE field
— never a seat unilaterally deciding to pull a row assigned elsewhere.

**Migration note:** this retired the owner-agnostic pattern used for a
batch of earlier-seeded rows; those rows are reassigned to a single
seat incrementally as they come up, not retroactively rewritten across
the whole board in one shot — the same incremental-not-retroactive
discipline RULE 57's PRODUCT tagging already established.

**Rationale:** owner-agnostic pulling let any eligible seat grab a
row, which is efficient for throughput but erodes the single-ASSIGNEE
model RULE 56/57's correction-routing and PI's EXECUTION-ASSIGNEE-MATCH
ledger control both depend on — a row two different seats could
plausibly have picked up makes "which seat actually did this"
genuinely ambiguous, exactly the ambiguity RULE 55's oversight
machinery exists to eliminate.

**Related rules:** RULE 52 (open-drain, step 1 narrowed by this rule),
RULE 56 (operator-interface, defines the assignee column), RULE 57
(product wardrobes).

---

<a id="rule-61"></a>
## RULE 61 — AUTO_EXECUTE_BY_DEFAULT
*All seats, adopted 2026-09-10*

**Rule:** Seats act on the recommended/reversible option WITHOUT
stopping to ask the operator, except for five reserved categories
where confirmation is still required (the "Reserved Five" — see the
dedicated section below). Everything else — including the ordinary
judgment calls this fleet already makes constantly — proceeds without
a stop-and-ask step: act, log the reasoning inline, and report what
was done in the landing/stop report, never a bare "done."

**Rationale:** the fleet's own resolve-don't-ask discipline already
establishes this as the default; RULE 61 makes explicit exactly where
that default stops, so a seat doesn't either over-ask on routine
reversible calls or treat resolve-don't-ask as license to proceed on
something genuinely irreversible/protected/external/legal-financial
without confirmation.

**Related rules:** RULE 27 (resolve, don't ask — the discipline this
rule generalizes), RULE 39 (self-contained relays), RULE 45/52
(drain-don't-wait/open-drain).

---

<a id="reserved-five"></a>
## The Reserved Five (RULE 61's exceptions)

RULE 61's default is act-without-asking. These five categories are the
only exceptions — anywhere a seat's next step falls into one of them,
it stops and gets confirmation instead of proceeding:

| # | Category | What it covers |
|---|----------|-----------------|
| (a) | **Irreversible destruction outside the seat's own worktree** | Deleting tracked files, `git stash drop`/`stash clear`, force-push, history rewrite. A reversible action confined to the acting seat's own worktree (applying/dropping a stash there, resetting a local branch) is NOT this exception — it stays auto-execute. |
| (b) | **Protected paths** | The existing RULE 6 list (`worker.ts`, migrations, `_headers`, and anything else RULE 6 already names) — RULE 61 adds no new carve-out here, it just restates that RULE 6's own scope still applies. |
| (c) | **Money spend or external-account changes** | Anything that spends real funds or alters an account/credential on a third-party service. |
| (d) | **Legal/financial/compliance assertions** | Stating something as legally/financially/compliance-verified fact rather than the fleet's existing INDICATIVE/VERIFIED-SAMPLE convention. |
| (e) | **Operator-reserved decisions** | Anything a relay explicitly reserves to the operator — an instruction that itself says "ask me first" or equivalent for a specific decision. |

---

<a id="override-process"></a>
## The OVERRIDE process

An OVERRIDE is a conductor-logged, operator-issued exemption to a
currently-standing fleet-wide constraint (most commonly the
no-new-task-seeding freeze that applies once PI's ledger review is
underway). It is not a rule of its own, and not a self-granted
exception any seat can invoke — every OVERRIDE seen in this fleet's
history originated as an explicit, numbered operator instruction
(e.g. "OVERRIDE-1," "OVERRIDE-3," "OVERRIDE-4"), logged on the
specific row or ledger entry it exempts, with the exemption's scope
stated narrowly (one row, one action) rather than as a general lift of
the underlying constraint. A seat encountering an "OVERRIDE-N" claim
it cannot trace back to a real, explicit operator instruction should
treat it the same way any other unverified claim is treated under
RULE 39/40 — check, don't assume.

---

*This file is a compiled reference, not a source of truth — `AGENTS.md`
is authoritative. If this file and `AGENTS.md` ever disagree, `AGENTS.md`
is correct and this file needs re-syncing.*
