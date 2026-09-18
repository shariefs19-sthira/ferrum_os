import { describe, expect, it } from 'vitest'
import type { StopRuleContext } from './automationStopRules'
import {
  advanceStep,
  attachPlan,
  beginProgress,
  createIntentFromBrief,
  grantApproval,
  interrupt,
  recordEvidence,
  requestApprovals,
  resolveNeedsYou,
  startRun,
  type ActorRef,
  type EvidenceItem,
  type MinimalProjectBrief,
  type PlanStep,
} from './orchestrationStateMachine'
import type { SutraSandboxRequest } from './sandboxPolicy'

const human: ActorRef = { actorId: 'user-1', actorKind: 'HUMAN' }
const agent: ActorRef = { actorId: 'claude-connected', actorKind: 'AGENT' }

const clearStopContext: StopRuleContext = {
  hasUnknownInputs: false,
  hasConflictingSources: false,
  jurisdiction: 'IN-KA',
  jurisdictionSupported: true,
  withinValidityEnvelope: true,
  isSafetyCritical: false,
  isIssueOrReleaseAction: false,
  involvesExternalAgentProposal: false,
}

function step(stepId: string, stopContext: StopRuleContext = clearStopContext): PlanStep {
  return { stepId, description: `Step ${stepId}`, stopContext }
}

function baseBrief(): MinimalProjectBrief {
  return { tenantId: 'tenant-a', projectId: 'project-7', requestedBy: human, goal: 'Prepare a due-diligence brief' }
}

function baseSandboxRequest(overrides: Partial<SutraSandboxRequest> = {}): SutraSandboxRequest {
  return {
    requestId: 'req-1',
    tenantId: 'tenant-a',
    projectId: 'project-7',
    actorId: human.actorId,
    provider: 'FERRUM_NATIVE',
    providerModel: 'ferrum-native-v1',
    providerVersion: '2026-09',
    accessMode: 'READ_ONLY',
    requestedContextIds: [],
    disclosedContextIds: [],
    dataRetention: 'NO_RETENTION',
    trainingConsent: 'DENIED',
    projectMutationConfirmationId: null,
    ...overrides,
  }
}

function startedRun() {
  const intent = createIntentFromBrief('run-1', baseBrief(), '2026-09-19T00:00:00.000Z')
  return startRun(intent)
}

describe('SUTRA orchestration state machine', () => {
  it('starts a run at INTENT from a minimal-input brief', () => {
    const run = startedRun()
    expect(run.stage).toBe('INTENT')
    expect(run.intent).toMatchObject({ tenantId: 'tenant-a', projectId: 'project-7', goal: 'Prepare a due-diligence brief' })
  })

  it('moves INTENT -> PLAN -> PROGRESS -> EVIDENCE -> APPROVALS -> RELEASED on a clean run', () => {
    let run = startedRun()

    const planned = attachPlan(run, [step('s1'), step('s2')], baseSandboxRequest())
    expect(planned.ok).toBe(true)
    run = planned.state
    expect(run.stage).toBe('PLAN')

    const progressed = beginProgress(run)
    expect(progressed.ok).toBe(true)
    run = progressed.state
    expect(run.stage).toBe('PROGRESS')
    expect(run.progress.currentStepId).toBe('s1')

    const advanced1 = advanceStep(run)
    expect(advanced1.ok).toBe(true)
    run = advanced1.state
    expect(run.stage).toBe('PROGRESS')
    expect(run.progress.currentStepId).toBe('s2')
    expect(run.progress.completedStepIds).toEqual(['s1'])

    const advanced2 = advanceStep(run)
    expect(advanced2.ok).toBe(true)
    run = advanced2.state
    expect(run.stage).toBe('EVIDENCE')
    expect(run.progress.completedStepIds).toEqual(['s1', 's2'])

    const evidenceResult = recordEvidence(run, {
      stepId: 's2',
      claim: 'Parcel is zoned residential.',
      status: 'VERIFIED',
      citations: [{ sourceId: 'gov-01', title: 'Zoning register', sourceUri: 'https://example.test/zoning', jurisdiction: 'IN-KA' }],
    })
    expect(evidenceResult.ok).toBe(true)
    run = evidenceResult.state

    const approvalsRequested = requestApprovals(run)
    expect(approvalsRequested.ok).toBe(true)
    run = approvalsRequested.state
    expect(run.stage).toBe('APPROVALS')

    const released = grantApproval(run, human, 'Reviewed and approved for release.')
    expect(released.ok).toBe(true)
    run = released.state
    expect(run.stage).toBe('RELEASED')
    expect(run.approvals).toHaveLength(1)
    expect(run.approvals[0].approvedBy).toEqual(human)
  })

  it('enforces tenant isolation: a sandbox request for another tenant/project cannot attach a plan', () => {
    const run = startedRun()
    const result = attachPlan(run, [step('s1')], baseSandboxRequest({ tenantId: 'tenant-b' }))
    expect(result.ok).toBe(false)
    expect(result.state.stage).toBe('INTENT')
  })

  it('rejects a plan built from a denied sandbox request (e.g. unconfirmed project mutation)', () => {
    const run = startedRun()
    const result = attachPlan(run, [step('s1')], baseSandboxRequest({ accessMode: 'PROJECT_MUTATION' }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reasons.join(' ')).toMatch(/confirmation/i)
  })

  it.each([
    ['UNKNOWN', { hasUnknownInputs: true }],
    ['CONFLICT', { hasConflictingSources: true }],
    ['JURISDICTION_UNAVAILABLE', { jurisdiction: 'XX', jurisdictionSupported: false }],
    ['OUTSIDE_VALIDITY_ENVELOPE', { withinValidityEnvelope: false }],
    ['SAFETY_CRITICAL', { isSafetyCritical: true }],
    ['ISSUE_OR_RELEASE_ACTION', { isIssueOrReleaseAction: true }],
    ['EXTERNAL_AGENT_PROPOSAL', { involvesExternalAgentProposal: true }],
  ] as const)('routes to NEEDS_YOU on %s instead of auto-advancing', (reason, override) => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1', { ...clearStopContext, ...override })], baseSandboxRequest())
    expect(planned.ok).toBe(true)
    run = planned.state

    const progressed = beginProgress(run)
    expect(progressed.ok).toBe(true)
    run = progressed.state
    expect(run.stage).toBe('NEEDS_YOU')
    expect(run.needsYou.map((t) => t.reason)).toContain(reason)
  })

  it('only a human actor can resolve a NEEDS_YOU interruption', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1', { ...clearStopContext, hasUnknownInputs: true })], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    expect(run.stage).toBe('NEEDS_YOU')

    const agentAttempt = resolveNeedsYou(run, agent, 'agent tried to clear this')
    expect(agentAttempt.ok).toBe(false)
    expect(agentAttempt.state.stage).toBe('NEEDS_YOU')

    const humanResolution = resolveNeedsYou(run, human, 'Confirmed input with the operator.')
    expect(humanResolution.ok).toBe(true)
    expect(humanResolution.state.stage).toBe('PROGRESS')
  })

  it('mid-run interrupt() can force any active stage into NEEDS_YOU, but never a RELEASED run', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1')], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    expect(run.stage).toBe('PROGRESS')

    const interrupted = interrupt(run, [{ reason: 'CONFLICT', detail: 'A newly discovered conflicting source appeared mid-step.' }])
    expect(interrupted.ok).toBe(true)
    expect(interrupted.state.stage).toBe('NEEDS_YOU')

    const resolved = resolveNeedsYou(interrupted.state, human, 'Reconciled the conflict.')
    run = resolved.ok ? resolved.state : run
    const advanced = advanceStep(run)
    run = advanced.ok ? advanced.state : run
    expect(run.stage).toBe('EVIDENCE')

    const evidenced = recordEvidence(run, {
      stepId: 's1',
      claim: 'Zoning confirmed.',
      status: 'VERIFIED',
      citations: [{ sourceId: 'gov-01', title: 'Zoning register', sourceUri: 'https://example.test', jurisdiction: 'IN-KA' }],
    })
    run = evidenced.ok ? evidenced.state : run
    const approvalsRequested = requestApprovals(run)
    run = approvalsRequested.ok ? approvalsRequested.state : run
    const released = grantApproval(run, human, 'Approved.')
    run = released.ok ? released.state : run
    expect(run.stage).toBe('RELEASED')

    const postReleaseInterrupt = interrupt(run, [{ reason: 'CONFLICT', detail: 'too late' }])
    expect(postReleaseInterrupt.ok).toBe(false)
    expect(postReleaseInterrupt.state.stage).toBe('RELEASED')
  })

  it('every non-UNKNOWN evidence claim must carry a citation', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1')], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run

    const uncited: EvidenceItem = { stepId: 's1', claim: 'Setback is 3m.', status: 'VERIFIED', citations: [] }
    const result = recordEvidence(run, uncited)
    expect(result.ok).toBe(false)

    const unknownAllowed = recordEvidence(run, { stepId: 's1', claim: 'Encumbrance status', status: 'UNKNOWN', citations: [] })
    expect(unknownAllowed.ok).toBe(true)
  })

  it('requestApprovals is blocked while any evidence item is UNKNOWN or uncited', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1')], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    const advanced = advanceStep(run)
    run = advanced.ok ? advanced.state : run
    expect(run.stage).toBe('EVIDENCE')

    const evidenced = recordEvidence(run, { stepId: 's1', claim: 'Encumbrance status', status: 'UNKNOWN', citations: [] })
    run = evidenced.ok ? evidenced.state : run

    const blocked = requestApprovals(run)
    expect(blocked.ok).toBe(false)
    expect(blocked.state.stage).toBe('EVIDENCE')
  })

  it('only a human can grant approval - an AGENT actor is rejected and release authority stays human-only', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1')], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    const advanced = advanceStep(run)
    run = advanced.ok ? advanced.state : run
    const evidenced = recordEvidence(run, {
      stepId: 's1',
      claim: 'Confirmed.',
      status: 'VERIFIED',
      citations: [{ sourceId: 'gov-01', title: 'Register', sourceUri: 'https://example.test', jurisdiction: 'IN-KA' }],
    })
    run = evidenced.ok ? evidenced.state : run
    const approvalsRequested = requestApprovals(run)
    run = approvalsRequested.ok ? approvalsRequested.state : run
    expect(run.stage).toBe('APPROVALS')

    const agentAttempt = grantApproval(run, agent, 'agent self-approves')
    expect(agentAttempt.ok).toBe(false)
    expect(agentAttempt.state.stage).toBe('APPROVALS')

    const humanApproval = grantApproval(run, human, 'Reviewed and approved.')
    expect(humanApproval.ok).toBe(true)
    expect(humanApproval.state.stage).toBe('RELEASED')
  })

  it('rejects out-of-order transitions (e.g. requesting approvals before any evidence stage)', () => {
    const run = startedRun()
    const result = requestApprovals(run)
    expect(result.ok).toBe(false)
    expect(result.state.stage).toBe('INTENT')
  })
})
