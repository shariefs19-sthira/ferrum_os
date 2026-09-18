# SUTRA orchestration state machine (domain slice)

New, isolated domain contract - no existing UI component, route, or other
lib module was modified to add it. Implementation:
`apps/web/lib/sutra/orchestrationStateMachine.ts` and
`apps/web/lib/sutra/automationStopRules.ts`; tests alongside each file.

## The six stages

Every SUTRA orchestration run is one of: **Intent**, **Plan**, **Progress**,
**Needs You**, **Evidence**, **Approvals** (plus a terminal **Released**
state reached only through a human-granted approval). A run starts from a
`MinimalProjectBrief` - tenant, project, requesting actor and a one-line
goal - deliberately small so intake never blocks on optional detail.

```
INTENT -> PLAN -> PROGRESS -> EVIDENCE -> APPROVALS -> RELEASED
              \        |                       ^
               \       v                       |
                -> NEEDS_YOU -------------------
```

Any active stage can be force-interrupted into `NEEDS_YOU`; `RELEASED` is
immutable and cannot be interrupted. `beginProgress`/`advanceStep`/
`interrupt` always set `progress.currentStepId` to the step that raised
the interruption *before* the stage flips to `NEEDS_YOU` - including when
the very first planned step is the one that stops - so `resolveNeedsYou`
always resumes at a real, runnable step rather than one pointing at
`null`.

## Automation stop rules

`automationStopRules.ts` evaluates a plan step's context and returns every
triggered reason (a step can trip more than one at once): `UNKNOWN`,
`CONFLICT`, `JURISDICTION_UNAVAILABLE`, `OUTSIDE_VALIDITY_ENVELOPE`,
`SAFETY_CRITICAL`, `ISSUE_OR_RELEASE_ACTION`, `EXTERNAL_AGENT_PROPOSAL`.
Any non-empty result forces the run into `NEEDS_YOU` rather than
auto-advancing - `beginProgress`/`advanceStep` in the state machine check
this on every step transition, not only at plan creation.

## Invariants enforced by the module itself

- **Tenant isolation** - `attachPlan` rejects a sandbox request whose
  `tenantId`/`projectId` doesn't match the run's own intent, and reuses
  `sandboxPolicy.ts`'s `evaluateSandboxRequest` rather than re-implementing
  sandbox policy.
- **Citations** - `recordEvidence` rejects any non-`UNKNOWN` claim with no
  citation; `requestApprovals` is blocked while any evidence item is still
  `UNKNOWN` or uncited.
- **Explicit evidence before approval** - `requestApprovals` also rejects
  an empty evidence array outright: approval/release must be backed by at
  least one recorded evidence item, not silently permitted by a run that
  recorded nothing. The one documented exception is
  `plan.noEvidenceRequiredReason` - a non-null string on the
  `OrchestrationPlan` the plan was attached with, set only when every step
  is read-only/diagnostic and asserts no fact needing a citation. That
  reason travels with the plan for audit; there is no other bypass.
- **Propose-only external agents** - an `EXTERNAL_AGENT_PROPOSAL` stop
  trigger always routes to `NEEDS_YOU`; the state machine has no path that
  lets an agent-originated step reach `APPROVALS` unattended.
- **Human release authority** - `grantApproval` is the only function that
  can reach `RELEASED`, and it rejects any `ActorRef` whose `actorKind` is
  not `HUMAN`.
- **NEEDS_YOU resolution audit trail** - `resolveNeedsYou` appends a
  `NeedsYouResolution` record (`resolvedBy`, `note`, `resolvedAt`,
  `resolvedTriggers`, `resumedStepId`) to `state.needsYouResolutions` on
  every successful call; a rejected call (non-human actor, empty note,
  wrong stage) appends nothing. `state.needsYou` keeps the full,
  never-cleared history of every trigger ever raised; `state.pendingNeedsYou`
  holds only the currently-unresolved subset and is emptied on resolution.

## What this slice does not do

It does not wire into `SutraPanel`, `WorkspaceCockpit`, `Concierge`, or any
route - it is a standalone, unit-tested domain contract a future wiring
pass can consume. No existing file was edited to add it.
