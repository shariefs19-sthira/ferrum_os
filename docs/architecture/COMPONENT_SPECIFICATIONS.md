# Ferrum OS — Component Specifications: Fleet Automation

Covers the two dispatcher generations and the landing script, all read
in full in this worktree: `scripts/FLEET_WATCH.ps1` (1,562 lines),
`scripts/land.ps1` (393 lines), and `scripts/fleet/**` (Python:
`runner.py`, `queue.py`, `adapters.py`, `evidence.py`, plus the
`Invoke-FleetRunner.ps1` entrypoint).

## Relationship between the two systems

`docs/fleet/AUTOMATION_RUNBOOK.md` (the newer system's own governing
doc) states this relationship directly, so it's quoted rather than
paraphrased:

> "Keep `docs/FLEET_WATCH_STOP` present while the replacement is being
> tested. The stop file is the fail-closed control for
> `scripts/FLEET_WATCH.ps1`. Remove it only after the operational canary
> described below passes and the operator or current conductor
> authorizes cutover." (`docs/fleet/AUTOMATION_RUNBOOK.md:19-22`)

> "Only after all ten checks pass should the conductor authorize removal
> of `docs/FLEET_WATCH_STOP` and one controlled live dispatch."
> (`docs/fleet/AUTOMATION_RUNBOOK.md:148-149`)

So: **`scripts/FLEET_WATCH.ps1` is the older, legacy dispatcher**,
gated shut by the presence of `docs/FLEET_WATCH_STOP`; **`scripts/fleet/**`
is the newer, guarded replacement**, currently under an operator-run
canary (ten specific checks listed in the runbook, §"Operational canary
and cutover") before `docs/FLEET_WATCH_STOP` is removed and legacy
dispatch is retired for good. `docs/fleet/AUTOMATION_RUNBOOK.md:152`
names `scripts/fleet/Invoke-FleetRunner.ps1` as "the reviewable
entrypoint," defaulting to `-Mode plan` (compiles the board, launches
nothing).

**Note on this worktree:** `docs/FLEET_WATCH_STOP` does not exist at
`D:\ferrum_os_recovered.worktrees\w2-496-w124-docs-suite\docs\` at the
time of writing (confirmed by direct file-glob search) — i.e. the
kill-switch is not currently present in this particular worktree's
checkout. Its presence/absence is runtime state, not something this doc
can assert as globally true; `docs/fleet/AUTOMATION_RUNBOOK.md` is the
authoritative statement of intent (keep it present during canary), and
both `FLEET_WATCH.ps1` and `scripts/fleet/runner.py` check for the file
at their own respective run time (`scripts/FLEET_WATCH.ps1:107`,
`scripts/fleet/runner.py:21,35-36`).

## `scripts/FLEET_WATCH.ps1` (legacy, still partially active)

### Kill-switch

`Test-KillSwitch` (`scripts/FLEET_WATCH.ps1:891-897`) checks for
`docs/FLEET_WATCH_STOP` (`$killSwitchPath`, line 107) and halts
immediately if present — checked at the top of `Invoke-WatchCycle`
(line 1371) and again inside `Invoke-SeatTriggerDaemon` (line 675), "not
just once at startup" (header comment, lines 50-54). A **separate**
kill-switch, `docs/DEPLOY_STOP` (`$deployStopPath`, line 110, checked by
`Test-DeployKillSwitch` at lines 924-930), halts only the auto-deploy
function without stopping the rest of the watch loop — "a human can stop
deploys specifically without stopping the whole watch loop" (line
921-923).

### Single-instance mutex

A named OS mutex (`Global\FerrumOS_FLEET_WATCH_SingleInstance`, line
131) prevents two copies of the script running concurrently. The
header comment (lines 117-130) documents the real bug this fixed: a
stale process from before a fix landed kept running with the old
in-memory script body, silently reverting `docs/FLEET_SEATS.json`
"hours after the landing that removed its only writer" — invisible to
`git log` or any on-disk inspection, because the running process never
reloads its script body from disk. An `AbandonedMutexException` (a
prior holder that exited without releasing) still grants ownership
rather than permanently locking out future launches (lines 136-143).

### Seat/dispatch mechanics

- **Seats:** `$seats = @('CRANE', 'MASON', 'RIVET', 'ATLAS', 'SCRIBE',
  'FERRITE', 'PI')` (line 150); `$codexBackedSeats = @('MASON', 'RIVET')`
  (line 151), the rest are Claude-backed.
- **`Get-TopReadyRow`** (lines 301-324): parses `docs/TASK_BOARD.md`
  line-by-line with a regex (`^\|\s*(W-\d+[a-z]?)\s*\|`, line 306),
  collects rows whose Status cell matches `^READY`, then returns the
  first one from `Sort-ReadyRowsByWait` that `Test-RowAlreadyLanded`
  doesn't reject.
- **Age-based dispatch ordering:** `Sort-ReadyRowsByWait` /
  `Register-RowFirstSeenReady` / `Get-RowWaitEpoch` (lines 249-288).
  Table order in `TASK_BOARD.md` is explicitly *not* used as a priority
  signal — the header comment (lines 237-248) documents a real,
  confirmed incident: "W-59 waited 3,281 minutes while later cycles
  kept re-picking earlier rows in the same table positions." The fix
  persists, per row ID, the timestamp this harness first observed it as
  READY (`RowFirstSeenReady` in `.fleet-watch-state.json`, an untracked
  state file) and sorts READY candidates oldest-wait-first; table order
  is now only the tiebreaker for two rows first seen in the same cycle.
- **`Test-RowAlreadyLanded`** (lines 597-618): greps
  `git log origin/main --oneline -200 --grep='\[land:'` for a
  `[land:...w<N>...]` marker matching the row's numeric ID, so the
  daemon never dispatches against a row the board still shows READY but
  that has actually landed. The header comment documents the incident
  this fixed: "W-24 landed ... while the board still read READY, and
  the daemon spawned CRANE against it 21 times in a row ... before this
  check existed."
- **`Get-SeatOwnedReadyRows`** (lines 333-358) and
  **`Get-SeatDispatchableRow`** (lines 366-398): a seat's own READY rows
  first, falling back to owner-agnostic rows, both filtered through
  `Test-RowAlreadyLanded` and ordered via `Sort-ReadyRowsByWait`.

### Validation / evidence

Landing evidence for the trigger daemon and the codex-probe/adapter
paths is **not** exit-code trust: `Test-SeatLandedSince`
(lines 628-638) checks whether a real `[land:<seat>/...]` commit
appeared on `origin/main` between the SHA recorded before and after a
spawn. The header comment documents why: "a plain `exit 0 -> reset
backoff, respawn` policy spun CRANE 20 times in ~5-second intervals
against an already-landed row with zero real work happening each time —
exit 0 only proves the spawned CLI process itself didn't crash, never
that it accomplished anything" (lines 620-627).

### Landing (this script does not land)

`FLEET_WATCH.ps1` itself never calls `scripts/land.ps1` — landing is
outside its scope. It dispatches seats to *execute* rows (via Codex/
Claude CLI invocations) and separately runs `Invoke-AutoDeployIfAdvanced`
to deploy whatever is already on `origin/main`.

### Rollback / error handling

- **`Invoke-AutoDeployIfAdvanced`** (lines 985-1090): fires once per
  cycle, comparing `origin/main` to the last SHA this harness actually
  deployed (`.fleet-deploy-state.json`). Only a clean fast-forward
  (`git merge --ff-only origin/main`) is attempted — never a reset or
  rebase, so it "never discards uncommitted work in the shared
  checkout"; a dirty working tree or real divergence aborts with an
  alert instead of forcing anything (lines 978-984, 1008-1016). On
  success it runs `pnpm type-check`, `pnpm build`, then
  `pnpm exec wrangler deploy` with `WRANGLER_OUTPUT_FILE_PATH` set to a
  temp NDJSON file so `Get-WranglerDeployVersionId`
  (lines 963-976) can read the real Workers version ID from wrangler's
  own structured output rather than regex-parsing human-readable stdout.
  The comment at lines 1054-1065 states the failure-safety invariant
  explicitly: the `if ($LASTEXITCODE -ne 0) { throw ... }` after
  `wrangler deploy` is "the ENTIRE mechanism that keeps a failed deploy
  from being recorded as deployed" — a failure jumps to the catch block,
  which never touches deploy state, so the next cycle retries
  automatically. This is regression-tested by
  `scripts/tests/deploy-state-no-write-on-failure.test.ps1` per the same
  comment.
- **Failure → alert:** `Send-NtfyAlert` (lines 899-909) posts to
  `https://ntfy.sh/$env:FLEET_NTFY_TOPIC` (default placeholder
  `ferrum-fleet-local`, line 901) on auto-deploy failure, stalled-fleet
  detection, silent-idle detection, and trigger-daemon spawn failures. A
  failed alert itself is caught and logged, never crashes the loop
  (lines 905-908).
- **Backoff:** `Invoke-SeatTriggerDaemon`'s per-seat backoff
  (`Get-SeatTriggerBackoff`/`Set-SeatTriggerBackoff`, lines 1290-1310)
  doubles on a no-op or failed spawn (capped at
  `$TriggerDaemonMaxBackoffSeconds`, default 14400s/4h) and resets to
  base only on a real observed landing (lines 850-882).

### Stop-control summary

| Control | File | Scope |
|---|---|---|
| `docs/FLEET_WATCH_STOP` | kill-switch | halts the entire watch loop (checked every cycle, every trigger-daemon call) |
| `docs/DEPLOY_STOP` | deploy kill-switch | halts only `Invoke-AutoDeployIfAdvanced`, independent of the watch loop |

### Gated/inert-by-default features

- **`-EnableClaudeAdapter`**: `Start-ClaudeSeat` (lines 564-585) builds
  the real `claude` command but only executes it
  (`Start-Process`) when this switch is passed; otherwise it logs the
  command and returns. "Wired now, used after operator flip" (line 22).
- **`-EnableTriggerDaemon`**: `Invoke-SeatTriggerDaemon`
  (lines 640-889) is defined but returns immediately with a log line
  if this switch isn't passed (lines 676-679) — "ships INERT" (line
  644). Passing it implies persistent looping even without `-Loop`
  (lines 1527-1537).
- Both follow the same documented pattern: "built now, fired after an
  explicit operator flip" (line 641-642) — landing the code that defines
  these functions does not, by itself, start any autonomous behavior.

## `scripts/land.ps1`

Squash-lands `origin/w2-*` branches onto `main` (or one specific branch
via `-Branch`).

### Core algorithm (per-branch, in the `:branchLoop foreach` at lines 213-349)

1. **Hold check** (`Test-OnHold`, lines 87-94): skip if the branch's
   short name matches a glob in `docs/LAND_HOLD.txt`
   (`Get-HoldGlobs`, lines 77-85, ignoring blank lines and `#` comments).
2. **Skip-if-already-landed**: `git diff "main...$branch" --name-only`
   — if empty, the branch has no unique changes left vs. `main` and is
   skipped (lines 224-236). The header comment is explicit that this,
   not a `[land:<branch>]` tag grep, is the *only* skip condition: "A
   tag grep only proves *some* commit on the branch landed at some point
   — it false-positives on a multi-commit branch where a later push
   added real content after an earlier commit already landed" (lines
   25-31).
3. **Sensitive-path preflight** (`Get-SensitivePathMatches`, lines
   115-120): any unique path matching the fixed pattern list below
   refuses the auto-land outright (no rebase/merge attempt at all) and
   emits a `REPORT` for manual review.
4. **Docs-only branches**: rebased onto current `main` from a detached
   checkout (`git checkout --detach $branch; git rebase main`), with
   `Resolve-AppendOnlyDocsRebaseConflicts` (lines 147-175) auto-resolving
   conflicts *only* when both sides' edits to the same file are
   strictly append-only (each side's text starts with the common base
   text) — anything else reports and aborts.
5. **Non-docs branches**: `git merge --squash $branch` directly onto
   `main`.
6. On success, commits with `feat: [land:<branch>] [AI: SCRIPT]`
   (`Get-LandTag`, lines 73-75).
7. After the loop: `pnpm --filter ./apps/web exec tsc --noEmit`
   (throws, does not push, if it fails — lines 366-371), then
   `git push origin HEAD:main` with up to 3 rebase-retry attempts
   (lines 373-388).

### Sensitive-path list (verbatim, `scripts/land.ps1:104-113`)

```powershell
$script:SensitivePathPatterns = @(
    '^apps/web/worker\.ts$',
    '^migrations/',
    '^apps/web/public/_headers$',
    '^apps/web/app/boq-pro/',
    '^package\.json$',
    '^pnpm-lock\.yaml$',
    '^apps/web/next\.config\.js$',
    '^apps/web/middleware\.ts$'
)
```

A match on any of these "REFUSES the auto-land outright (no rebase
attempt, no squash attempt) and REPORTs it as needing CRANE's direct
manual review — these are exactly the paths where a silent auto-merge
could regress security headers, corrupt a migration sequence, or
violate a protected-path approval" (lines 14-19).

### `docs/LAND_HOLD.txt` timing quirk

The header comment documents a real, accepted quirk (lines 33-42): the
hold file is read once at the start of a run, before the branch loop
begins. If a commit landed *earlier in the same run* adds a new hold
pattern, that pattern doesn't apply until the *next* invocation — it
was hit for real on 2026-09-01, when landing a hold-list update mid-run
didn't stop three already-in-flight legacy branches from landing again
in that same run (they were reverted and the hold applied cleanly next
run).

### `-Branch <name>` (W2-398)

Restricts the run to one named branch (no `origin/` prefix) instead of
sweeping every `origin/w2-*` branch. Every other check (hold list,
sensitive-path preflight, docs-vs-non-docs handling, skip-if-landed)
applies identically — it only narrows which branch(es) enter the loop
(lines 45-53). Errors immediately if the branch doesn't exist on
`origin` (lines 191-198).

### Self-landing envelope

The header comment names this "Self-landing envelope pre-flight" (line
10) — the same sensitive-path check above lets a seat safely self-land
its own single row via `-Branch` "without touching anything else in
flight" (lines 49-51), rather than needing the catch-all sweep for
routine self-landing.

## `scripts/fleet/**` (newer, guarded runner)

Entrypoint: `scripts/fleet/Invoke-FleetRunner.ps1` — a thin wrapper that
sets `PYTHONPATH` and calls `python -m fleet.runner <Mode> --repo-root
<repo>` with `-Mode` one of `plan` (default), `canary`, `cycle`,
`daemon`; `-Execute` required for worker execution, `-Land` for the
separate landing gate (lines 1-22).

### Board compiler (`scripts/fleet/queue.py`)

`compile_board_result` (lines 250-365) parses `docs/TASK_BOARD.md` as a
strict pipe table (7 columns: ID, Title, Envelope/scope, Eligible
seats/Assignee, Acceptance, Deps, Status). Unlike `FLEET_WATCH.ps1`'s
regex scrape, this is a real validating compiler:

- `normalize_task_id` requires `W(?:2)?-\d+[A-Z]?` (line 151-155).
- `_assignee` (lines 219-227) requires **exactly one** recognized seat
  name in the assignee cell — "owner-agnostic or unassigned" is
  explicitly forbidden here (unlike `FLEET_WATCH.ps1`'s
  `Get-SeatDispatchableRow`, which *does* fall back to owner-agnostic
  rows).
- `_scope_paths` (lines 230-247) requires at least one explicit
  repository-relative path in backticks in the scope cell — a row with
  no concrete path scope is rejected.
- Missing acceptance criteria, malformed dependencies, or an unknown
  status all produce a `RejectedRow` (`BoardCompileError` if compiled
  strictly).
- **Dependency gating**: a dependency must appear in `landed_task_ids`
  (parsed from `[land:...]` markers in `origin/main`'s log, `runner.py:57-60`)
  or have a known COMPLETE status (`DONE`/`SUPERSEDED`/`ABANDONED`) to
  count as proven (lines 318-326); otherwise the row gets a hold reason
  and `dispatchable=False`.
- **Scope-overlap reservation** (lines 351-365): among tasks otherwise
  dispatchable, any whose `allowed_paths` overlaps an already-reserved
  CLAIMED/IN_PROGRESS/HALFWAY task's paths (`paths_overlap`, lines
  174-200 — exact match, prefix match, or conservative glob overlap) is
  held with an explicit "scope overlaps earlier or active task(s)"
  reason.
- A READY row whose status text references an existing `origin/...`
  branch is explicitly held ("existing remote branch is referenced;
  reconcile it before creating a new task worktree", lines 330-332) —
  a check `FLEET_WATCH.ps1` has no equivalent for.

### Lease store (`scripts/fleet/queue.py:415-569`)

SQLite-backed (`fleet.sqlite3`), WAL mode, with unique partial indexes
enforcing at most one ACTIVE lease per `task_id`, per `seat`, per
`worktree`, and per `branch` simultaneously (lines 453-456). `claim()`
runs inside `BEGIN IMMEDIATE` and checks both dimension conflicts (same
task/seat/worktree/branch) and scope conflicts (`paths_overlap` against
every other active lease's paths) before inserting — an expired lease
whose owner process is confirmed dead is auto-expired and retried; an
expired lease with a live or unknown-liveness owner raises `LeaseBusy`
(lines 500-517), never silently overwritten.

### Runner (`scripts/fleet/runner.py`)

- **`plan(repo)`** (lines 420-425): the default, read-only mode. Loads
  the queue, returns `{execution_enabled: False, kill_switch,
  ready, held}` — never dispatches anything. This is the mode named in
  `docs/fleet/AUTOMATION_RUNBOOK.md:152-153` as the reviewable default.
- **`run_canary(repo)`** (lines 428-462): exercises the installed Codex
  adapter read-only (`--sandbox read-only`), asserting the model returns
  exactly the scripted no-op result — proves the adapter plumbing works
  without granting any filesystem write.
- **`ensure_worktree`** (lines 160-178): creates
  `D:\ferrum_os.worktrees\<seat>-<task-id-slug>-<digest>` (or
  `$FERRUM_WORKTREE_ROOT` if set) via `git worktree add ... -b <branch>
  origin/main`, first checking `manual_session_conflicts` (lines
  133-157) — an existing running managed session for that seat, or a
  same-seat worktree with uncommitted changes touched in the last 6
  hours, blocks creation rather than silently reusing/clobbering it.
- **`_execute_unprotected`** (lines 267-381): claims a lease, builds a
  fully self-contained prompt (`build_prompt`, lines 181-214 — states
  the dispatch contract, allowed paths, dependencies, and the explicit
  operating rule "Do not run scripts/land.ps1, deploy, edit main, or
  start another agent; the runner owns landing and deployment"),
  invokes the seat's configured adapter (`build_invocation` from
  `adapters.py`), and heartbeats the lease every 30s while the
  subprocess runs.
- **`validate_worker_result`** (lines 242-264): the worker's
  self-reported `task_id`, `status`, `commit_sha`, and `changed_paths`
  are all independently cross-checked against real `git` state (branch
  HEAD, `git diff --name-only`) — a mismatch on any of them raises, so
  a worker cannot self-report success/paths it didn't actually produce.
  A dirty worktree after the run also raises.
- **Landing gate**: only if `allow_land` (the `-Land`/`--land` flag)
  *and* the worker exited 0 *and* evidence shows the branch was pushed
  does the runner invoke `scripts/land.ps1 -Branch <branch>` itself,
  serialized under an exclusive file lock (`exclusive_lock` class,
  lines 400-417, `landing.lock`) — comment: "Worker land/deploy is
  forbidden in the prompt. These explicit runner flags are reviewed
  activation gates and serialize the only mutating control path" (lines
  360-361).
- **Deploy**: `allow_deploy` only *records intent*
  (`metadata["deploy_held"]`) — "deployment remains held until landed
  evidence is true and a reviewed deploy adapter is invoked"
  (lines 372-374). No deploy adapter is actually invoked by this runner
  as written.

### Evidence (`scripts/fleet/evidence.py`)

`verify_evidence` computes five independent boolean states —
`authored`, `pushed`, `landed`, `deployed`, `live` — each derived from
real git/filesystem checks, not from the worker's self-report:

- `authored`: branch HEAD differs from `base_sha` and a real diff exists.
- `pushed`: the remote branch's SHA matches the local branch SHA.
- `landed`: `authored` is true, a `[land:<branch>]` commit exists on
  `origin/main`, and every expected path's diff between the branch and
  `origin/main` is empty (i.e. the change is actually present on main).
- `deployed`: `landed` is true and `.fleet-deploy-state.json`'s
  `LastDeployedSha` equals `origin/main`'s current SHA.
- `live`: only computed if `deployed` and both `task_id` and
  `live_evidence_paths` are supplied — reads a per-task attestation
  file (`.fleet-runtime/live-attestations/<task_id>.json`) and verifies
  each named evidence file's SHA-256 hash matches what the attestation
  recorded, at the recorded `deployed_sha`/`landing_sha`. If deployed
  but no live-evidence requirement was supplied, a note is added rather
  than the state being silently assumed true.

### Adapters (`scripts/fleet/adapters.py`)

`build_invocation` builds `codex exec` or `claude --print` argv, with a
comment noting the flags were "verified against local CLI help on
2026-09-10" (line 34). `classify_failure` (lines 102-109) pattern-matches
exit code/stdout/stderr into one of `adapter_configuration`,
`provider_limit`, `authentication`, `network`, `governance_hold`,
`test_failure`, or `agent_failure`, each with its own retry budget in
`RETRY_LIMITS` (lines 112-120) — `provider_limit`, `authentication`,
`governance_hold`, and `adapter_configuration` all get **zero** retries;
`network` gets 2; `test_failure`/`agent_failure` get 1.
