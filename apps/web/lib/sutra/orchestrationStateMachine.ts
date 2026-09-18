// SUTRA orchestration state machine.
//
// A single run moves through six operator-visible stages: Intent, Plan,
// Progress, Needs You, Evidence and Approvals. This module is pure state
// + pure transition functions - no I/O, no timers, no side effects - so it
// can be unit tested exhaustively and reused by whatever surface (chat
// panel, cockpit, worker route) actually drives a run.
//
// It composes with, and does not duplicate, sandboxPolicy.ts (tenant
// isolation + propose-only external agents) and automationStopRules.ts
// (the UNKNOWN/CONFLICT/... stop conditions). This module owns only the
// stage graph and the invariants that hold across stages: every run stays
// tenant-scoped, every factual claim in Evidence carries a citation,
// every plan step that asserts fact (PlanStep.assertsFact, a typed
// per-step declaration - never free text) must have cited evidence
// before Approvals, every NEEDS_YOU resolution is persisted with its
// resolving actor/note/step (not just validated-and-discarded), a run
// can only be interrupted into NEEDS_YOU from an active PROGRESS stage
// (so resolving it always lands back on a real, non-null current step),
// and only a human actor can grant an Approval.

import { evaluateAutomationStopRules, type StopRuleContext, type StopRuleTrigger } from './automationStopRules'
import { evaluateSandboxRequest, type SutraSandboxDecision, type SutraSandboxRequest } from './sandboxPolicy'

export type OrchestrationStage = 'INTENT' | 'PLAN' | 'PROGRESS' | 'NEEDS_YOU' | 'EVIDENCE' | 'APPROVALS' | 'RELEASED'

export type ActorKind = 'HUMAN' | 'AGENT'

export type ActorRef = {
  actorId: string
  actorKind: ActorKind
}

/** The minimal input required to start a run - deliberately small so intake never blocks on optional detail. */
export type MinimalProjectBrief = {
  tenantId: string
  projectId: string
  requestedBy: ActorRef
  goal: string
}

export type OrchestrationIntent = {
  runId: string
  tenantId: string
  projectId: string
  requestedBy: ActorRef
  goal: string
  submittedAt: string
}

export type PlanStep = {
  stepId: string
  description: string
  stopContext: StopRuleContext
  /**
   * True when this step's output asserts something as fact (a zoning
   * conclusion, a measured setback, a computed rate) that a human relying
   * on the released run would need cited evidence for. False ONLY for a
   * step that is read-only/diagnostic and asserts nothing - e.g. "list
   * the artifacts already attached to this project." This is a typed,
   * per-step declaration the plan author makes when building the step,
   * not a free-text excuse attached after the fact - `requestApprovals`
   * derives its evidence requirement directly from this field, per step,
   * so a plan cannot mark itself "no evidence needed" while still
   * containing a factual step.
   */
  assertsFact: boolean
}

export type OrchestrationPlan = {
  steps: PlanStep[]
  sandboxDecision: SutraSandboxDecision
  /**
   * Optional operator-facing explanation of why this entirely read-only
   * plan has no evidence. It is audit context only: it never waives an
   * evidence requirement. `attachPlan` rejects it when any step asserts
   * a fact, and the approval gate derives eligibility solely from
   * `steps[].assertsFact`.
   */
  noEvidenceRequiredReason: string | null
}

export type OrchestrationProgress = {
  currentStepId: string | null
  completedStepIds: string[]
}

export type Citation = {
  sourceId: string
  title: string
  sourceUri: string
  jurisdiction: string | null
}

export type EvidenceStatus = 'VERIFIED' | 'INDICATIVE' | 'UNKNOWN'

export type EvidenceItem = {
  stepId: string
  claim: string
  status: EvidenceStatus
  citations: Citation[]
}

export type ApprovalRecord = {
  approvedBy: ActorRef
  approvedAt: string
  note: string
  /**
   * The structural, derived basis on which `requestApprovals` allowed this
   * run to reach APPROVALS - never free text, always computed from
   * `plan.steps[].assertsFact`: `FACTUAL_EVIDENCE_RECORDED` when the plan
   * had at least one factual step and every one has cited evidence, or
   * `NO_FACTUAL_STEPS_IN_PLAN` when no step in the plan asserted any fact
   * at all. This is the rationale `grantApproval` persists into the
   * audit record.
   */
  evidenceBasis: 'FACTUAL_EVIDENCE_RECORDED' | 'NO_FACTUAL_STEPS_IN_PLAN'
  /** The documented read-only rationale, when the plan supplied one. */
  noEvidenceRequiredReason: string | null
}

/**
 * The audit record for a single NEEDS_YOU interruption being cleared:
 * who cleared it, when, on what note, which triggers it answered, and
 * which step PROGRESS resumed at. `resolveNeedsYou` appends exactly one
 * of these per call - this is the only place `resolvedBy`/`note` are
 * persisted, so the audit trail this module claims to keep is real, not
 * just validated-and-discarded input.
 */
export type NeedsYouResolution = {
  resolvedBy: ActorRef
  note: string
  resolvedAt: string
  resolvedTriggers: StopRuleTrigger[]
  resumedStepId: string | null
}

export type OrchestrationRunState = {
  runId: string
  stage: OrchestrationStage
  intent: OrchestrationIntent
  plan: OrchestrationPlan | null
  progress: OrchestrationProgress
  /** Full history of every stop-rule trigger ever raised on this run - append-only, never cleared. */
  needsYou: StopRuleTrigger[]
  /** The subset of `needsYou` still unresolved right now. Non-empty only while `stage === 'NEEDS_YOU'`; `resolveNeedsYou` empties it. */
  pendingNeedsYou: StopRuleTrigger[]
  needsYouResolutions: NeedsYouResolution[]
  evidence: EvidenceItem[]
  approvals: ApprovalRecord[]
}

export type TransitionResult =
  | { ok: true; state: OrchestrationRunState }
  | { ok: false; state: OrchestrationRunState; reasons: string[] }

function fail(state: OrchestrationRunState, reasons: string[]): TransitionResult {
  return { ok: false, state, reasons }
}

function ok(state: OrchestrationRunState): TransitionResult {
  return { ok: true, state }
}

/**
 * The evidence invariant is shared by entry to APPROVALS and the final
 * release transition. Keeping it in one pure check prevents a serialized
 * or otherwise externally constructed APPROVALS state from bypassing the
 * factual-plan gate.
 */
function approvalEvidenceFailures(plan: OrchestrationPlan, evidence: EvidenceItem[]): string[] {
  const factualStepIds = plan.steps.filter((step) => step.assertsFact).map((step) => step.stepId)
  const citedStepIds = new Set(
    evidence.filter((item) => item.status !== 'UNKNOWN' && item.citations.length > 0).map((item) => item.stepId),
  )
  const missingEvidence = factualStepIds
    .filter((stepId) => !citedStepIds.has(stepId))
    .map((stepId) => `Factual step "${stepId}" has no cited evidence recorded.`)
  const unresolved = evidence
    .filter((item) => item.status === 'UNKNOWN' || item.citations.length === 0)
    .map((item) => `Unresolved evidence claim: "${item.claim}".`)

  return [...missingEvidence, ...unresolved]
}

export function createIntentFromBrief(runId: string, brief: MinimalProjectBrief, submittedAt: string): OrchestrationIntent {
  return {
    runId,
    tenantId: brief.tenantId,
    projectId: brief.projectId,
    requestedBy: brief.requestedBy,
    goal: brief.goal,
    submittedAt,
  }
}

export function startRun(intent: OrchestrationIntent): OrchestrationRunState {
  return {
    runId: intent.runId,
    stage: 'INTENT',
    intent,
    plan: null,
    progress: { currentStepId: null, completedStepIds: [] },
    needsYou: [],
    pendingNeedsYou: [],
    needsYouResolutions: [],
    evidence: [],
    approvals: [],
  }
}

/**
 * INTENT -> PLAN. Requires at least one step and a sandbox decision that
 * matches this run's own tenant/project (tenant isolation) and that was
 * actually allowed - a denied sandbox request can never seed a plan.
 */
export function attachPlan(
  state: OrchestrationRunState,
  steps: PlanStep[],
  sandboxRequest: SutraSandboxRequest,
  noEvidenceRequiredReason: string | null = null,
): TransitionResult {
  if (state.stage !== 'INTENT') return fail(state, [`Cannot attach a plan from stage ${state.stage}; expected INTENT.`])
  if (steps.length === 0) return fail(state, ['A plan requires at least one step.'])
  if (sandboxRequest.tenantId !== state.intent.tenantId || sandboxRequest.projectId !== state.intent.projectId) {
    return fail(state, ['Sandbox request tenant/project does not match this run - tenant isolation violation.'])
  }

  const sandboxDecision = evaluateSandboxRequest(sandboxRequest)
  if (!sandboxDecision.allowed) {
    return fail(state, [`Sandbox request denied: ${sandboxDecision.reasons.join('; ')}`])
  }

  const documentedReason = noEvidenceRequiredReason?.trim() || null
  if (documentedReason && steps.some((step) => step.assertsFact)) {
    return fail(state, ['A no-evidence rationale is valid only for an entirely read-only plan; factual steps require cited evidence.'])
  }

  return ok({
    ...state,
    stage: 'PLAN',
    plan: { steps, sandboxDecision, noEvidenceRequiredReason: documentedReason },
  })
}

/**
 * PLAN -> PROGRESS, or PLAN -> NEEDS_YOU if the first step already trips a
 * stop rule. Either way `progress.currentStepId` is set to the first
 * step before the stage transition - a NEEDS_YOU interruption raised
 * here still leaves the run pointing at a real step, so `resolveNeedsYou`
 * returns to a runnable PROGRESS state instead of one with no current
 * step to advance from.
 */
export function beginProgress(state: OrchestrationRunState): TransitionResult {
  if (state.stage !== 'PLAN' || !state.plan) return fail(state, [`Cannot begin progress from stage ${state.stage}; expected PLAN.`])
  const firstStep = state.plan.steps[0]
  if (!firstStep) return fail(state, ['Plan has no steps to begin.'])

  const progress: OrchestrationProgress = { ...state.progress, currentStepId: firstStep.stepId }
  const triggers = evaluateAutomationStopRules(firstStep.stopContext)
  if (triggers.length > 0) {
    return ok({
      ...state,
      stage: 'NEEDS_YOU',
      progress,
      needsYou: [...state.needsYou, ...triggers],
      pendingNeedsYou: [...state.pendingNeedsYou, ...triggers],
    })
  }

  return ok({ ...state, stage: 'PROGRESS', progress })
}

/**
 * Advance from the current step to the next. Any stage may be interrupted
 * into NEEDS_YOU by this call if the next step trips a stop rule - the
 * interruption is unconditional, not opt-in.
 */
export function advanceStep(state: OrchestrationRunState): TransitionResult {
  if (state.stage !== 'PROGRESS' || !state.plan) return fail(state, [`Cannot advance a step from stage ${state.stage}; expected PROGRESS.`])
  const { currentStepId } = state.progress
  if (!currentStepId) return fail(state, ['No current step to advance from.'])

  const currentIndex = state.plan.steps.findIndex((step) => step.stepId === currentStepId)
  if (currentIndex === -1) return fail(state, [`Current step ${currentStepId} is not part of this run's plan.`])

  const completedStepIds = [...state.progress.completedStepIds, currentStepId]
  const nextStep = state.plan.steps[currentIndex + 1]

  if (!nextStep) {
    return ok({ ...state, stage: 'EVIDENCE', progress: { currentStepId: null, completedStepIds } })
  }

  const triggers = evaluateAutomationStopRules(nextStep.stopContext)
  if (triggers.length > 0) {
    return ok({
      ...state,
      stage: 'NEEDS_YOU',
      progress: { currentStepId: nextStep.stepId, completedStepIds },
      needsYou: [...state.needsYou, ...triggers],
      pendingNeedsYou: [...state.pendingNeedsYou, ...triggers],
    })
  }

  return ok({ ...state, progress: { currentStepId: nextStep.stepId, completedStepIds } })
}

/**
 * Only a human actor can clear a NEEDS_YOU interruption. Clearing resumes
 * PROGRESS at `progress.currentStepId`, which `beginProgress`/`advanceStep`
 * /`interrupt` always set before entering NEEDS_YOU - so the resumed state
 * is runnable, never stuck with no current step. `resolvedBy`/`note` are
 * persisted into `needsYouResolutions` alongside the specific triggers
 * being cleared and the step resumed at; `needsYou` (full history) is
 * kept for audit, never deleted, and `pendingNeedsYou` is emptied since
 * every outstanding trigger was just resolved.
 */
export function resolveNeedsYou(state: OrchestrationRunState, resolvedBy: ActorRef, note: string): TransitionResult {
  if (state.stage !== 'NEEDS_YOU') return fail(state, [`Cannot resolve NEEDS_YOU from stage ${state.stage}; expected NEEDS_YOU.`])
  if (resolvedBy.actorKind !== 'HUMAN') return fail(state, ['Only a human actor may resolve a NEEDS_YOU interruption.'])
  if (!note.trim()) return fail(state, ['A resolution note is required for the audit trail.'])

  const record: NeedsYouResolution = {
    resolvedBy,
    note,
    resolvedAt: new Date().toISOString(),
    resolvedTriggers: state.pendingNeedsYou,
    resumedStepId: state.progress.currentStepId,
  }

  return ok({
    ...state,
    stage: 'PROGRESS',
    pendingNeedsYou: [],
    needsYouResolutions: [...state.needsYouResolutions, record],
  })
}

/**
 * Every evidence claim must carry at least one citation unless its own
 * status is UNKNOWN (an UNKNOWN claim is honestly labeled, not backed by
 * a citation it doesn't have).
 */
export function recordEvidence(state: OrchestrationRunState, item: EvidenceItem): TransitionResult {
  if (state.stage !== 'PROGRESS' && state.stage !== 'EVIDENCE') {
    return fail(state, [`Cannot record evidence from stage ${state.stage}; expected PROGRESS or EVIDENCE.`])
  }
  if (item.status !== 'UNKNOWN' && item.citations.length === 0) {
    return fail(state, [`Evidence claim "${item.claim}" is ${item.status} but carries no citation.`])
  }

  return ok({ ...state, evidence: [...state.evidence, item] })
}

/**
 * EVIDENCE -> APPROVALS. Every step with `assertsFact: true` in the
 * attached plan must have at least one recorded evidence item for that
 * exact `stepId` that is non-UNKNOWN and cited - this is a structural
 * requirement derived from the plan's own typed step declarations, not a
 * free-text excuse a plan can write its way around. A plan whose steps
 * are all `assertsFact: false` requires no evidence at all, because
 * there is nothing in it asserted as fact to back. Also blocked, on any
 * plan, while any recorded evidence item is itself UNKNOWN or uncited.
 */
export function requestApprovals(state: OrchestrationRunState): TransitionResult {
  if (state.stage !== 'EVIDENCE') return fail(state, [`Cannot request approvals from stage ${state.stage}; expected EVIDENCE.`])
  if (!state.plan) return fail(state, ['No plan is attached to this run.'])

  const failures = approvalEvidenceFailures(state.plan, state.evidence)
  if (failures.length > 0) return fail(state, failures)

  return ok({ ...state, stage: 'APPROVALS' })
}

/**
 * Human release authority: only a HUMAN actor may grant an approval, and
 * only from APPROVALS. This function alone can move a run to RELEASED -
 * there is no other path in this module that reaches RELEASED. The
 * approval record's `evidenceBasis` is recomputed here (not trusted from
 * an earlier stage) directly from `plan.steps[].assertsFact` and
 * `state.evidence`, so the persisted rationale always matches the plan
 * that was actually approved.
 */
export function grantApproval(state: OrchestrationRunState, approvedBy: ActorRef, note: string): TransitionResult {
  if (state.stage !== 'APPROVALS') return fail(state, [`Cannot grant approval from stage ${state.stage}; expected APPROVALS.`])
  if (approvedBy.actorKind !== 'HUMAN') return fail(state, ['Release authority is human-only; an AGENT actor cannot grant approval.'])
  if (!note.trim()) return fail(state, ['An approval note is required for the audit trail.'])
  if (!state.plan) return fail(state, ['No plan is attached to this run.'])

  // Recheck at the release boundary. A persisted or externally constructed
  // APPROVALS state cannot turn a factual plan into a release without the
  // same exact-step, cited-evidence guarantee used to enter APPROVALS.
  const failures = approvalEvidenceFailures(state.plan, state.evidence)
  if (failures.length > 0) return fail(state, failures)

  const hasFactualSteps = state.plan.steps.some((s) => s.assertsFact)
  const evidenceBasis: ApprovalRecord['evidenceBasis'] = hasFactualSteps ? 'FACTUAL_EVIDENCE_RECORDED' : 'NO_FACTUAL_STEPS_IN_PLAN'

  const record: ApprovalRecord = {
    approvedBy,
    approvedAt: new Date().toISOString(),
    note,
    evidenceBasis,
    noEvidenceRequiredReason: state.plan.noEvidenceRequiredReason,
  }
  return ok({ ...state, stage: 'RELEASED', approvals: [...state.approvals, record] })
}

/**
 * Interrupts an active PROGRESS run into NEEDS_YOU - used when a stop
 * condition is discovered outside the normal step-advance path (e.g. a
 * mid-step conflict surfaced by an external agent proposal). Restricted
 * to PROGRESS ONLY: `resolveNeedsYou` always resumes into PROGRESS at
 * `progress.currentStepId`, and PROGRESS is the only stage where that
 * field is guaranteed non-null (`beginProgress`/`advanceStep` always set
 * it before entering PROGRESS). Interrupting from INTENT, PLAN, EVIDENCE,
 * APPROVALS or RELEASED - where `currentStepId` can be null - would let a
 * resolution manufacture a PROGRESS state with no current step to
 * advance from, exactly the bug already fixed for the first-step-stop
 * case; rejecting the call here closes that same failure mode for every
 * other stage instead of re-opening it through this path.
 */
export function interrupt(state: OrchestrationRunState, triggers: StopRuleTrigger[]): TransitionResult {
  if (triggers.length === 0) return fail(state, ['interrupt() requires at least one stop-rule trigger.'])
  if (state.stage !== 'PROGRESS') {
    return fail(state, [
      `interrupt() can only interrupt an active PROGRESS run (current stage: ${state.stage}); resolving would otherwise resume PROGRESS with no current step.`,
    ])
  }

  return ok({
    ...state,
    stage: 'NEEDS_YOU',
    needsYou: [...state.needsYou, ...triggers],
    pendingNeedsYou: [...state.pendingNeedsYou, ...triggers],
  })
}
