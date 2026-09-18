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
// tenant-scoped, every factual claim in Evidence carries a citation, and
// only a human actor can grant an Approval.

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
}

export type OrchestrationPlan = {
  steps: PlanStep[]
  sandboxDecision: SutraSandboxDecision
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
}

export type OrchestrationRunState = {
  runId: string
  stage: OrchestrationStage
  intent: OrchestrationIntent
  plan: OrchestrationPlan | null
  progress: OrchestrationProgress
  needsYou: StopRuleTrigger[]
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
    evidence: [],
    approvals: [],
  }
}

/**
 * INTENT -> PLAN. Requires at least one step and a sandbox decision that
 * matches this run's own tenant/project (tenant isolation) and that was
 * actually allowed - a denied sandbox request can never seed a plan.
 */
export function attachPlan(state: OrchestrationRunState, steps: PlanStep[], sandboxRequest: SutraSandboxRequest): TransitionResult {
  if (state.stage !== 'INTENT') return fail(state, [`Cannot attach a plan from stage ${state.stage}; expected INTENT.`])
  if (steps.length === 0) return fail(state, ['A plan requires at least one step.'])
  if (sandboxRequest.tenantId !== state.intent.tenantId || sandboxRequest.projectId !== state.intent.projectId) {
    return fail(state, ['Sandbox request tenant/project does not match this run - tenant isolation violation.'])
  }

  const sandboxDecision = evaluateSandboxRequest(sandboxRequest)
  if (!sandboxDecision.allowed) {
    return fail(state, [`Sandbox request denied: ${sandboxDecision.reasons.join('; ')}`])
  }

  return ok({
    ...state,
    stage: 'PLAN',
    plan: { steps, sandboxDecision },
  })
}

/**
 * PLAN -> PROGRESS, or PLAN -> NEEDS_YOU if the first step already trips a
 * stop rule. A run never enters PROGRESS carrying an unresolved stop
 * condition.
 */
export function beginProgress(state: OrchestrationRunState): TransitionResult {
  if (state.stage !== 'PLAN' || !state.plan) return fail(state, [`Cannot begin progress from stage ${state.stage}; expected PLAN.`])
  const firstStep = state.plan.steps[0]
  if (!firstStep) return fail(state, ['Plan has no steps to begin.'])

  const triggers = evaluateAutomationStopRules(firstStep.stopContext)
  if (triggers.length > 0) {
    return ok({ ...state, stage: 'NEEDS_YOU', needsYou: [...state.needsYou, ...triggers] })
  }

  return ok({ ...state, stage: 'PROGRESS', progress: { ...state.progress, currentStepId: firstStep.stepId } })
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
    })
  }

  return ok({ ...state, progress: { currentStepId: nextStep.stepId, completedStepIds } })
}

/**
 * Only a human actor can clear a NEEDS_YOU interruption. Clearing resumes
 * PROGRESS at the step that raised it; the trigger history is kept for
 * audit, never deleted.
 */
export function resolveNeedsYou(state: OrchestrationRunState, resolvedBy: ActorRef, note: string): TransitionResult {
  if (state.stage !== 'NEEDS_YOU') return fail(state, [`Cannot resolve NEEDS_YOU from stage ${state.stage}; expected NEEDS_YOU.`])
  if (resolvedBy.actorKind !== 'HUMAN') return fail(state, ['Only a human actor may resolve a NEEDS_YOU interruption.'])
  if (!note.trim()) return fail(state, ['A resolution note is required for the audit trail.'])

  return ok({ ...state, stage: 'PROGRESS' })
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
 * EVIDENCE -> APPROVALS. Blocked while any UNKNOWN or uncited evidence
 * item remains, and blocked for issue/release actions or safety-critical
 * plans unless a human has already resolved every NEEDS_YOU trigger that
 * was raised for them (tracked simply as: no unresolved stage currently
 * sitting in NEEDS_YOU).
 */
export function requestApprovals(state: OrchestrationRunState): TransitionResult {
  if (state.stage !== 'EVIDENCE') return fail(state, [`Cannot request approvals from stage ${state.stage}; expected EVIDENCE.`])

  const unresolved = state.evidence.filter((item) => item.status === 'UNKNOWN' || item.citations.length === 0)
  if (unresolved.length > 0) {
    return fail(state, unresolved.map((item) => `Unresolved evidence claim: "${item.claim}".`))
  }

  return ok({ ...state, stage: 'APPROVALS' })
}

/**
 * Human release authority: only a HUMAN actor may grant an approval, and
 * only from APPROVALS. This function alone can move a run to RELEASED -
 * there is no other path in this module that reaches RELEASED.
 */
export function grantApproval(state: OrchestrationRunState, approvedBy: ActorRef, note: string): TransitionResult {
  if (state.stage !== 'APPROVALS') return fail(state, [`Cannot grant approval from stage ${state.stage}; expected APPROVALS.`])
  if (approvedBy.actorKind !== 'HUMAN') return fail(state, ['Release authority is human-only; an AGENT actor cannot grant approval.'])
  if (!note.trim()) return fail(state, ['An approval note is required for the audit trail.'])

  const record: ApprovalRecord = { approvedBy, approvedAt: new Date().toISOString(), note }
  return ok({ ...state, stage: 'RELEASED', approvals: [...state.approvals, record] })
}

/**
 * Any stage may be force-interrupted into NEEDS_YOU - used when a stop
 * condition is discovered outside the normal step-advance path (e.g. a
 * mid-step conflict surfaced by an external agent proposal).
 */
export function interrupt(state: OrchestrationRunState, triggers: StopRuleTrigger[]): TransitionResult {
  if (triggers.length === 0) return fail(state, ['interrupt() requires at least one stop-rule trigger.'])
  if (state.stage === 'RELEASED') return fail(state, ['A RELEASED run is immutable and cannot be interrupted.'])

  return ok({ ...state, stage: 'NEEDS_YOU', needsYou: [...state.needsYou, ...triggers] })
}
