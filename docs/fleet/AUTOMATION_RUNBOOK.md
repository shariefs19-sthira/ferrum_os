# Fleet automation runbook

## Purpose and authority

This runbook defines the operator-approved continuation of W-98 for a local,
auditable fleet dispatcher. The approved implementation envelope covers new
files under `scripts/fleet/**`, the minimum reviewed integration needed to
invoke that runner, quarantine of obsolete dispatcher entrypoints, and this
documentation. This record does not claim that W-98 is complete, landed,
deployed, or live.

Repository rules and operator decisions remain authoritative. `docs/TASK_BOARD.md`
defines desired work and seat assignment. Runtime ownership is established only
by the fleet queue lease; prose, a prompt file, a process name, or a model's
self-report cannot establish ownership.

## Current containment

Keep `docs/FLEET_WATCH_STOP` present while the replacement is being tested. The
stop file is the fail-closed control for `scripts/FLEET_WATCH.ps1`. Remove it
only after the operational canary described below passes and the operator or
current conductor authorizes cutover.

The following legacy entrypoints are retired and must never be used:

- `.github/workflows/conductor.yml` is manual-only and informational. It has no
  checkout, write token, scheduled trigger, or dispatcher invocation.
- `scripts/batch-conductor.mjs` exits with status 2 before its historical queue
  mutation and direct-push behavior can run.
- `scripts/spawn-operator.mjs` exits with status 2 before it can create a second
  agent process or mutate its historical board.

The scripts remain in the tree as migration evidence. Do not delete or re-enable
them during the W-98 canary.

## Sources of truth

| Concern | Authoritative source |
| --- | --- |
| Task intent and current assignee | Parsed fields in `docs/TASK_BOARD.md` |
| Repository policy | `AGENTS.md` and applicable operator decisions |
| Seat contract | `docs/seats/<SEAT>.md` |
| Active execution | Queue lease in `.fleet-runtime/` |
| Thread continuity | Persisted runner session/thread identifier |
| Authored change | Commit on the task branch |
| Landed change | Tree evidence plus `[land:<branch>]` marker on `origin/main` |
| Deployment | Deployment record tied to the landed SHA |
| User-visible acceptance | Required rendered-edge evidence |
| Architectural impact | Graphify output, advisory only |
| Browser observation and reference leads | `docs/fleet/WIDGET_OBSERVER_PROTOCOL.md` packets, advisory until verified |

The runtime directory is local and ignored by Git. A restart reconstructs
durable task facts from Git and the board, then reconciles unexpired leases; it
does not infer completion from old prompts or chat summaries.

## Widget observer intake

The appointed browser observers are CLAUDE-LOOKOUT for deployed-edge inspection
and primary-source reference discovery, and CODEX-SENTINEL for requirement
normalization and semantic-clash detection. Their mandates, persistent prompts,
and mandatory evidence-packet schema are defined in
`docs/fleet/WIDGET_OBSERVER_PROTOCOL.md`.

Widgets report to the CONDUCTOR through the operator. They do not write task
folders, self-assign board rows, or prompt execution seats. CONDUCTOR verifies
each packet against current Git and live evidence, deduplicates it against
existing work, resolves governance conflicts, and only then generates the
one-task prompt consumed by a VS Code execution seat. This intake gate applies
even when a widget expresses high confidence.

All participants follow the protocol's skill-currency and token-economy rules:
select the latest materially applicable host skill, reuse SHA/deployment/packet
evidence, inspect the exact diff and task paths first, and avoid repeated broad
research or unchanged test matrices. Required state-transition evidence remains
mandatory and is cached for reuse rather than recomputed without cause.

## Dispatch lifecycle

1. Read repository rules, stop controls, task board, seat contract, and current
   remote `main`.
2. Parse the task row structurally. Match the current assignee field exactly;
   do not search historical prose for a seat name.
3. Reject work already verified in the `origin/main` tree and landing log.
4. Compute the declared path scope and advisory Graphify impact set. Hold tasks
   whose write scopes overlap an active lease or protected path without the
   required approval.
5. Atomically claim one task for one seat. Record a unique lease token, expiry,
   attempt number, base SHA, branch, worktree, and runner session identifier.
6. Generate the prompt from current disk state and execute it through the
   configured Codex or Claude adapter. Prompt files may be retained for audit,
   but agents do not acquire work by scanning folders.
7. Renew the lease while the agent is active. A completion or heartbeat carrying
   an old lease token is stale and cannot change task state.
8. Validate the structured result against Git, tests, and the required acceptance
   evidence. Agent text alone cannot advance the task to landed or live.
9. Release the lease only after recording the outcome. Retry eligible failures
   with the same task identity and an incremented attempt; resume the recorded
   session when the adapter supports it.

## Failure classes

| Class | Default action |
| --- | --- |
| Rate limit, overload, transient network failure | Back off, preserve lease/session, retry within policy |
| Authentication or missing required integration | Hold with a specific operator gate |
| Permission or protected-path denial | Hold; never broaden access automatically |
| Test or implementation failure | Resume the same execution with evidence |
| Lease loss or stale token | Stop accepting writes/results; reconcile before retry |
| Dirty tracked worktree outside task scope | Fail closed and report exact paths |
| Untracked operator evidence | Preserve and exclude from staging; do not delete or blanket-ignore it |
| Conflicting landing or changed remote base | Rebase/reconcile in the task worktree and rerun gates |

Retries must be bounded and recorded. Repeated failures transition to a visible
held state with the last error and recovery action; they do not silently loop.

## Graphify boundary

Graphify may identify likely file relationships, architectural hubs, and paths
affected by a proposed change. Its output is derived and may lag the repository.
It cannot assign tasks, acquire leases, prove that a process is alive, establish
that a commit landed, or prove deployment/live acceptance. Every Graphify-based
conflict signal is advisory and is reconciled against current Git and declared
write scopes before dispatch.

The W-98 canary uses a code-only index of the new automation package. Rebuild it
after the package stabilizes; do not run expensive semantic extraction across
the full repository for dispatch decisions.

## Operational canary and cutover

Run the replacement in audit-only mode first. A passing canary must demonstrate:

1. One eligible task is selected by exact assignee and dependency state.
2. Two concurrent claim attempts yield exactly one lease owner.
3. A second task with overlapping write scope is held before any agent starts.
4. A stale heartbeat and stale completion token are rejected.
5. A retryable simulated failure preserves identity and resumes within the
   configured attempt limit.
6. A non-retryable or exhausted failure becomes visibly held.
7. Dirty tracked files fail closed; unrelated untracked evidence is neither
   staged nor deleted.
8. The generated prompt contains the observed base SHA, allowed paths, acceptance
   criteria, and fallback behavior.
9. The runner reports machine-readable processed, dispatched, skipped, held,
   succeeded, and failed counts.
10. No legacy workflow or script creates a second dispatcher.

Only after all ten checks pass should the conductor authorize removal of
`docs/FLEET_WATCH_STOP` and one controlled live dispatch. Keep landing and
deployment serialized independently from task execution.

The reviewable entrypoint is `scripts/fleet/Invoke-FleetRunner.ps1`. It defaults
to `-Mode plan`, which compiles the board and launches nothing. Worker execution
requires both `-Mode cycle` (or `daemon`) and `-Execute`; targeted landing also
requires the separate `-Land` switch. No scheduled task is installed by this
change.

## Recovery

If the new runner behaves unexpectedly, recreate or retain
`docs/FLEET_WATCH_STOP`, stop the runner through its documented process-control
path, and preserve `.fleet-runtime/` plus structured event logs for diagnosis.
Do not invoke either retired Node script as a fallback. Manual work may continue
in isolated seat worktrees after confirming that no active lease owns the same
task or write scope.
