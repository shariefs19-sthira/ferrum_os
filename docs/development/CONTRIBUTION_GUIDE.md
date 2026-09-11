# Ferrum OS — Contribution Guide

## Branch naming (observed, not prescribed)

`git log --oneline -50` and `git branch -r` against
`D:\ferrum_os_recovered` show two real, coexisting branch-naming
patterns:

- **`w2-<number>-<description>`** — e.g. `w2-495-w02-board-reconcile`,
  `w2-493-fleet-watch-dispatch-fix`, `w2-484-worktree-permission-repair`.
- **`<seat>/w<number>-<description>`** (seat lowercase, task number
  without the leading `2`) — e.g. `mason/w16-landintel-rendered-fix`,
  `crane/widget-token-economy`, `rivet/w09-command-bar`,
  `mason/w-114-zoning-summary-v2`, `atlas/fleet-cost-survey`.

Both patterns are real and currently in use; neither has fully replaced
the other. Task IDs themselves appear in two numbering families on
`docs/TASK_BOARD.md`: `W2-<n>` (older wave numbering) and `W-<n>`
(current pull-queue numbering, per `docs/TASK_BOARD.md`'s own header:
"Seeded 2026-09-04 ... every row here is a Workspace row").

### Commit message tags

Two tags appear consistently across `git log`:

- **`[AI: <SEAT>]`** — an agent-authored commit, e.g. `[AI: MASON]
  [task:W-24] add indicative compliance engine`
  (`61faf0baf`, per `docs/TASK_BOARD.md`'s W-24 row).
- **`[land:<branch>] [AI: SCRIPT]`** — the squash-landing commit
  `scripts/land.ps1` produces, e.g. `feat: [land:mason/w24-compliance-engine]
  [AI: SCRIPT]` (`5e33b7dec`). This is literally
  `Get-LandTag`/the `git commit -m "feat: $tag [AI: SCRIPT]"` calls at
  `scripts/land.ps1:73-75,303,339`.

## Landing process

- **No PR is required.** Branches squash-land directly via
  `scripts/land.ps1` — a script, not a GitHub PR merge, produces the
  landing commit (`feat: [land:<branch>] [AI: SCRIPT]`).
- **`-Branch <name>`** (no `origin/` prefix, e.g. `-Branch
  "mason/w24-compliance-engine"`) restricts a run to landing exactly
  one branch — the way a seat self-lands its own row (RULE 18 per the
  script's own header comment) without touching anything else in
  flight.
- **No `-Branch` argument** sweeps every `origin/w2-*` remote branch:
  skips branches with no unique diff vs. `main`, respects
  `docs/LAND_HOLD.txt`, refuses (REPORTs) any branch touching a
  sensitive path, and squash-lands (or rebase-then-squash for
  docs-only branches) everything else. Full mechanics in
  `docs/architecture/COMPONENT_SPECIFICATIONS.md`.
- After landing: `pnpm --filter ./apps/web exec tsc --noEmit` must pass
  before anything is pushed; `git push origin HEAD:main` retries up to
  3 times with `git pull --rebase origin main` between attempts.

```bash
# Land one specific branch (routine self-landing):
pwsh scripts/land.ps1 -Branch "mason/w24-compliance-engine"

# Sweep every origin/w2-* branch (the catch-all mode):
pwsh scripts/land.ps1
```

## Worktree convention

**This session's worktree** (`D:\ferrum_os_recovered.worktrees\w2-496-w124-docs-suite`,
a sibling directory to `D:\ferrum_os_recovered` with `.worktrees` as a
suffix on the repo dirname) is an ad hoc choice for this task, **not**
the convention documented elsewhere in the repo. Two other worktree
roots are actually named in the codebase:

- `scripts/repair-worktree-permissions.ps1:11-13` hardcodes exactly two
  allowed worktree roots: `D:\ferrum_os.worktrees` and
  `D:\ferrum_os_recovered\.worktrees` (a hidden subdirectory *inside*
  the repo, not a sibling).
- `scripts/fleet/runner.py`'s `ensure_worktree` (lines 160-178) uses
  `D:\ferrum_os.worktrees` by default (`FERRUM_WORKTREE_ROOT` env var
  overrides it), creating paths like `<root>/<seat>-<task-id-slug>-<digest>`.
- `scripts/FLEET_WATCH.ps1:114` sets `$worktreeRoot =
  "D:\ferrum_os.worktrees"` for its own seat-worktree resolution
  (`Resolve-SeatWorktree`) and trigger-daemon recreation logic.

So the documented/coded convention is `D:\ferrum_os.worktrees\<name>`
(no dot before `worktrees`, sibling to the repo's parent, not to the
repo itself) or the in-repo hidden `.worktrees\` — this session's
`D:\ferrum_os_recovered.worktrees\<branch-name>` path matches neither
exactly. Treat this session's location as a one-off, not something to
replicate as a new standard, unless an operator says otherwise.

## Protected / sensitive paths (from `scripts/land.ps1`)

Reused verbatim from `scripts/land.ps1:104-113` — these are the exact
patterns that make `land.ps1` refuse an auto-land and REPORT for manual
review instead:

```
^apps/web/worker\.ts$
^migrations/
^apps/web/public/_headers$
^apps/web/app/boq-pro/
^package\.json$
^pnpm-lock\.yaml$
^apps/web/next\.config\.js$
^apps/web/middleware\.ts$
```

Per the script's own comment: "these are exactly the paths where a
silent auto-merge could regress security headers, corrupt a migration
sequence, or violate a protected-path approval." A branch touching any
of these needs direct manual review (per the repo's own convention,
"CRANE's direct manual review") — it is never auto-landed, even in
single-branch `-Branch` mode.

## Testing requirements

`apps/web/package.json` test scripts: `test` (`vitest`), `test:run`
(`vitest run`), `test:ui` (`vitest --ui`), `coverage` (`vitest run
--coverage`). Root `package.json`'s `pnpm test` runs `pnpm --filter
./apps/web test:run`.

A consistent gate phrase recurs across many real landing commits
(verified by grepping `git log --all` for it, not assumed from one
instance) — `git log --all --format="%H %s%n%b"` shows this exact
phrasing, with the test count varying by commit as the suite grew:

```
Gates: lint clean, type-check clean, full suite 95/95, build green.
Gates: lint clean, type-check clean, full suite 103/103, build green.
Gates: lint clean, type-check clean, full suite 109/109, build green.
Gates: lint clean, type-check clean, full suite 115/115, build green.
```

The three checks named are: `pnpm lint` (`next lint`), `pnpm type-check`
(`tsc --noEmit`), and `pnpm --filter ./apps/web exec vitest run` (the
full suite, N/N passing), plus a successful `pnpm build`. Some commits
additionally cite `scripts/verify-static.ps1` passing. Treat "Gates:
lint clean, type-check clean, full suite N/N, build green" as this
repo's standing bar for a landable change, not a one-off phrase from a
single commit.

## Recurring pitfalls (real, cited)

**1. `land.ps1`'s catch-all sweep auto-landed a held, not-ready branch
(W2-241, 2026-08-31).** `docs/ACTIVITY_LOG.md`'s postmortem entry:
`scripts/land.ps1`'s catch-all loop landed `w2-234/crane-cloudflare`
(standalone OpenNext/Wrangler dependency work touching
`apps/web/next.config.js`, `apps/web/wrangler.jsonc`, `pnpm-lock.yaml`)
onto `main` as commit `6bdbf35`, even though it wasn't ready. Fixed by
a clean revert (`26554b1`), a targeted re-land of the three branches
that had queued behind it, and — the durable fix — introducing
`docs/LAND_HOLD.txt` (a glob-per-line hold list the catch-all sweep now
respects) in the same pass, landed as `9734d4e`. The postmortem also
flags a real RULE 6 gap: the landed branch touched protected paths
(`package.json`, `pnpm-lock.yaml`) without the explicit approval RULE 6
requires — "not malicious, but a process gap the hold-list now closes."
This is the direct origin of `docs/LAND_HOLD.txt` and the sensitive-path
preflight documented above.

**2. `FLEET_WATCH.ps1`'s single-instance mutex bug — a stale process
kept reverting `docs/FLEET_SEATS.json` invisibly (2026-09-09).** A
running PowerShell process never reloads its script body from disk —
so a stale copy of `FLEET_WATCH.ps1`, still running from before a fix
landed, kept overwriting `docs/FLEET_SEATS.json` back to its pre-fix
shape "hours after the landing that removed its only writer,"
invisible to `git log` or any on-disk inspection
(`scripts/FLEET_WATCH.ps1:117-130`). Fixed with a named OS mutex
(`Global\FerrumOS_FLEET_WATCH_SingleInstance`) so a second launch can
never silently coexist with an already-running instance.

**3. `Test-RowAlreadyLanded` staleness — a dispatcher spawned a seat
21 times against already-landed work (2026-09-08).** `W-24` landed as
`mason/w24-compliance-engine` while `docs/TASK_BOARD.md` still read
READY (the board is only updated by a seat re-reading and rewriting it,
which "can genuinely lag a real landing by an unbounded amount" —
`scripts/FLEET_WATCH.ps1:591`). Before a landed-check existed, the
trigger daemon spawned CRANE against the stale row 21 times in a row,
20 of them in one respawn-cap-bounded burst — every spawn a wasted real
Claude invocation against dead work. Fixed by checking origin/main's
recent `[land:...]` commit subjects before every dispatch, wired at the
source (`Get-TopReadyRow`/`Get-SeatOwnedReadyRows`) so every caller is
protected, "rather than needing the same check bolted onto each call
site individually and risking a missed one again."

**4. Age-based dispatch ordering — a row starved for 3,281 minutes
because table order was mistaken for priority.** Table position in
`docs/TASK_BOARD.md` never changes once a row is written and carries no
real priority signal — "W-59 waited 3,281 minutes while later cycles
kept re-picking earlier rows in the same table positions"
(`scripts/FLEET_WATCH.ps1:237-248`). Fixed by tracking, per row ID, the
first time the harness observed it READY (`RowFirstSeenReady` in the
untracked `.fleet-watch-state.json`) and dispatching oldest-wait-first,
with table order surviving only as a same-cycle tiebreaker.

**5. `Save-FleetSeatsConfig` silently dropped a real top-level config
block on every write (2026-09-08).** The function used to hardcode a
`{_comment, seats}` wrapper on every save, which silently dropped any
other real top-level key already in the file — specifically the
`deployment` block, the single source of truth for the live URL, read
by `scripts/get-live-base-url.mjs` and every audit battery script.
Confirmed live: after another writer (the trigger daemon's own backoff
persistence) called this function every cycle, the real `deployment`
block vanished from the working tree. Fixed by loading the current
on-disk wrapper first and preserving every property on it except
`seats`, instead of reconstructing the wrapper from scratch with only
the two fields the function happened to know about
(`scripts/FLEET_WATCH.ps1:166-195`). The broader rule this incident
established: runtime state (backoff timers, revival schedules) now
lives only in the untracked `.fleet-watch-state.json`, never on a
git-tracked config file, "same class of bug already fixed elsewhere in
this file."

**6. A PowerShell `continue` inside a nested loop silently truncated
every landing sweep.** `scripts/land.ps1`'s docs-rebase-conflict
handler is a `while` loop nested inside a `foreach` over branches; a
bare `continue` from inside the `while` does **not** continue the outer
`foreach` in PowerShell — "it silently terminated the WHOLE foreach
instead of continuing it," meaning "every previous run of this script
silently stopped processing the branch list at the very first
docs-rebase-conflict it hit, with no error and no indication anything
was wrong — likely truncating every sweep all session" (comment at
`scripts/land.ps1:260-273`, confirmed live 2026-09-03 against a real
conflicted `docs/REUSE_MAP.md` add/add state). Fixed with a labeled
loop (`:branchLoop foreach ... continue branchLoop`) — the only
construct that reliably continues the correct loop level in
PowerShell.

## What this document does not cover

- Full RULE numbering / seat governance (`AGENTS.md`, `docs/seats/*.md`)
  — only the branch/land/test conventions those rules produce in
  practice.
- Every historical `docs/ACTIVITY_LOG.md` incident — six representative,
  independently verifiable ones are cited above; the log itself is
  thousands of lines and carries many more.
