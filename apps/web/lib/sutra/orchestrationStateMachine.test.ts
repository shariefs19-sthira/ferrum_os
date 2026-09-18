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

function step(stepId: string, stopContext: StopRuleContext = clearStopContext, assertsFact = true): PlanStep {
  return { stepId, description: `Step ${stepId}`, stopContext, assertsFact }
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

    const evidenceForS1 = recordEvidence(run, {
      stepId: 's1',
      claim: 'Parcel boundary confirmed.',
      status: 'VERIFIED',
      citations: [{ sourceId: 'gov-00', title: 'Survey record', sourceUri: 'https://example.test/survey', jurisdiction: 'IN-KA' }],
    })
    expect(evidenceForS1.ok).toBe(true)
    run = evidenceForS1.state

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
    expect(run.approvals[0].evidenceBasis).toBe('FACTUAL_EVIDENCE_RECORDED')
    expect(run.approvals[0].noEvidenceRequiredReason).toBeNull()
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

  it('interrupt() can force an active PROGRESS run into NEEDS_YOU, and resolving it resumes a runnable PROGRESS', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1')], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    expect(run.stage).toBe('PROGRESS')

    const interrupted = interrupt(run, [{ reason: 'CONFLICT', detail: 'A newly discovered conflicting source appeared mid-step.' }])
    expect(interrupted.ok).toBe(true)
    expect(interrupted.state.stage).toBe('NEEDS_YOU')
    expect(interrupted.state.progress.currentStepId).toBe('s1')

    const resolved = resolveNeedsYou(interrupted.state, human, 'Reconciled the conflict.')
    expect(resolved.ok).toBe(true)
    run = resolved.state
    expect(run.stage).toBe('PROGRESS')
    expect(run.progress.currentStepId).toBe('s1')

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

  it.each(['INTENT', 'PLAN', 'EVIDENCE', 'APPROVALS'] as const)(
    'interrupt() rejects a call from %s - only PROGRESS may be interrupted, so a resolution can never manufacture a null-step PROGRESS',
    (targetStage) => {
      let run = startedRun()

      if (targetStage === 'INTENT') {
        expect(run.stage).toBe('INTENT')
      } else {
        const planned = attachPlan(run, [step('s1')], baseSandboxRequest())
        run = planned.ok ? planned.state : run
        if (targetStage === 'PLAN') {
          expect(run.stage).toBe('PLAN')
        } else {
          const progressed = beginProgress(run)
          run = progressed.ok ? progressed.state : run
          const advanced = advanceStep(run)
          run = advanced.ok ? advanced.state : run
          expect(run.stage).toBe('EVIDENCE')
          // EVIDENCE's own progress.currentStepId is already null (regression fixture for this bug).
          expect(run.progress.currentStepId).toBeNull()

          if (targetStage === 'APPROVALS') {
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
          }
        }
      }

      const result = interrupt(run, [{ reason: 'CONFLICT', detail: 'discovered mid-flight' }])
      expect(result.ok).toBe(false)
      expect(result.state.stage).toBe(targetStage)
      // Rejected: no NEEDS_YOU was ever entered, so there is nothing a subsequent
      // resolveNeedsYou could resume into with a null current step.
      expect(resolveNeedsYou(result.state, human, 'attempt').ok).toBe(false)
    },
  )

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

  it('end-to-end: a first-step stop resumes at that same step and can then advance normally', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1', { ...clearStopContext, hasUnknownInputs: true }), step('s2')], baseSandboxRequest())
    expect(planned.ok).toBe(true)
    run = planned.state

    const progressed = beginProgress(run)
    expect(progressed.ok).toBe(true)
    run = progressed.state
    expect(run.stage).toBe('NEEDS_YOU')
    // The blocker fixed here: the run must still point at the step that raised it, not null.
    expect(run.progress.currentStepId).toBe('s1')
    expect(run.pendingNeedsYou.map((t) => t.reason)).toEqual(['UNKNOWN'])

    const resolved = resolveNeedsYou(run, human, 'Confirmed the missing input with the operator.')
    expect(resolved.ok).toBe(true)
    run = resolved.state
    expect(run.stage).toBe('PROGRESS')
    expect(run.progress.currentStepId).toBe('s1')
    expect(run.pendingNeedsYou).toEqual([])

    const advanced = advanceStep(run)
    expect(advanced.ok).toBe(true)
    run = advanced.state
    expect(run.stage).toBe('PROGRESS')
    expect(run.progress.currentStepId).toBe('s2')
    expect(run.progress.completedStepIds).toEqual(['s1'])
  })

  it('resolveNeedsYou persists an audit record of the resolving actor, note, resolved triggers and resumed step', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1', { ...clearStopContext, isSafetyCritical: true })], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    expect(run.stage).toBe('NEEDS_YOU')
    expect(run.needsYouResolutions).toEqual([])

    const resolved = resolveNeedsYou(run, human, 'Reviewed the safety-critical step and confirmed it may proceed.')
    expect(resolved.ok).toBe(true)
    run = resolved.state

    expect(run.needsYouResolutions).toHaveLength(1)
    expect(run.needsYouResolutions[0]).toMatchObject({
      resolvedBy: human,
      note: 'Reviewed the safety-critical step and confirmed it may proceed.',
      resumedStepId: 's1',
    })
    expect(run.needsYouResolutions[0].resolvedTriggers.map((t) => t.reason)).toEqual(['SAFETY_CRITICAL'])
    expect(typeof run.needsYouResolutions[0].resolvedAt).toBe('string')
    // Full history is never deleted, unlike the now-cleared pending set.
    expect(run.needsYou.map((t) => t.reason)).toEqual(['SAFETY_CRITICAL'])
    expect(run.pendingNeedsYou).toEqual([])

    const rejectedAgent = resolveNeedsYou(interrupt(run, [{ reason: 'CONFLICT', detail: 'later conflict' }]).state, agent, 'agent tries')
    expect(rejectedAgent.ok).toBe(false)
    // A rejected resolution never appends an audit record.
    expect(rejectedAgent.state.needsYouResolutions).toHaveLength(1)
  })

  it('requestApprovals is blocked when a plan step is marked assertsFact but has no cited evidence for its exact stepId', () => {
    let run = startedRun()
    // s1 asserts fact (default); s2 explicitly does not - only s1 needs evidence.
    const planned = attachPlan(run, [step('s1'), step('s2', clearStopContext, false)], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    const advanced1 = advanceStep(run)
    run = advanced1.ok ? advanced1.state : run
    const advanced2 = advanceStep(run)
    run = advanced2.ok ? advanced2.state : run
    expect(run.stage).toBe('EVIDENCE')
    expect(run.evidence).toEqual([])

    const blocked = requestApprovals(run)
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.reasons.join(' ')).toMatch(/Factual step "s1" has no cited evidence recorded/)
    expect(blocked.state.stage).toBe('EVIDENCE')

    // Evidence recorded for the wrong step (s2, non-factual) still doesn't satisfy s1's requirement.
    const wrongStepEvidence = recordEvidence(run, {
      stepId: 's2',
      claim: 'Unrelated to s1.',
      status: 'VERIFIED',
      citations: [{ sourceId: 'gov-01', title: 'Register', sourceUri: 'https://example.test', jurisdiction: 'IN-KA' }],
    })
    const stillBlocked = requestApprovals(wrongStepEvidence.ok ? wrongStepEvidence.state : run)
    expect(stillBlocked.ok).toBe(false)
  })

  it('requestApprovals proceeds with zero evidence only when every plan step is structurally non-factual (assertsFact: false)', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1', clearStopContext, false)], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    const advanced = advanceStep(run)
    run = advanced.ok ? advanced.state : run
    expect(run.stage).toBe('EVIDENCE')
    expect(run.evidence).toEqual([])

    const approvalsRequested = requestApprovals(run)
    expect(approvalsRequested.ok).toBe(true)
    run = approvalsRequested.state
    expect(run.stage).toBe('APPROVALS')

    const released = grantApproval(run, human, 'No factual claims in this plan; nothing to cite.')
    expect(released.ok).toBe(true)
    if (released.ok) {
      expect(released.state.approvals[0].evidenceBasis).toBe('NO_FACTUAL_STEPS_IN_PLAN')
      expect(released.state.approvals[0].noEvidenceRequiredReason).toBeNull()
    }
  })

  it('persists a documented read-only rationale in the approval audit without allowing it to waive factual evidence', () => {
    let run = startedRun()
    const rationale = 'Read-only inventory of project artifacts; this plan asserts no factual conclusion.'
    const planned = attachPlan(run, [step('s1', clearStopContext, false)], baseSandboxRequest(), rationale)
    expect(planned.ok).toBe(true)
    run = planned.ok ? planned.state : run
    expect(run.plan?.noEvidenceRequiredReason).toBe(rationale)

    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    const advanced = advanceStep(run)
    run = advanced.ok ? advanced.state : run
    const approvalsRequested = requestApprovals(run)
    run = approvalsRequested.ok ? approvalsRequested.state : run
    const released = grantApproval(run, human, 'Reviewed the read-only inventory.')
    expect(released.ok).toBe(true)
    if (released.ok) {
      expect(released.state.approvals[0].evidenceBasis).toBe('NO_FACTUAL_STEPS_IN_PLAN')
      expect(released.state.approvals[0].noEvidenceRequiredReason).toBe(rationale)
    }

    const factualRun = startRun(createIntentFromBrief('run-factual-rationale', baseBrief(), '2026-09-18T10:00:00.000Z'))
    const rejected = attachPlan(factualRun, [step('f1')], baseSandboxRequest(), rationale)
    expect(rejected.ok).toBe(false)
    if (!rejected.ok) expect(rejected.reasons.join(' ')).toMatch(/factual steps require cited evidence/i)
  })

  it('rechecks the factual evidence gate at release even if an external caller supplies an APPROVALS-shaped state', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1')], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    const advanced = advanceStep(run)
    run = advanced.ok ? advanced.state : run
    expect(run.stage).toBe('EVIDENCE')

    const forgedApprovalsState = { ...run, stage: 'APPROVALS' as const }
    const rejected = grantApproval(forgedApprovalsState, human, 'Attempted bypass.')
    expect(rejected.ok).toBe(false)
    expect(rejected.state.stage).toBe('APPROVALS')
    if (!rejected.ok) expect(rejected.reasons.join(' ')).toMatch(/Factual step "s1" has no cited evidence/i)
  })

  it('a plan cannot bypass evidence for a factual step by mixing in a non-factual one', () => {
    let run = startedRun()
    const planned = attachPlan(run, [step('s1', clearStopContext, true), step('s2', clearStopContext, false)], baseSandboxRequest())
    run = planned.ok ? planned.state : run
    const progressed = beginProgress(run)
    run = progressed.ok ? progressed.state : run
    const advanced1 = advanceStep(run)
    run = advanced1.ok ? advanced1.state : run
    const advanced2 = advanceStep(run)
    run = advanced2.ok ? advanced2.state : run
    expect(run.stage).toBe('EVIDENCE')

    // Cite s1 properly - now approvals should succeed and the audit basis reflects real evidence, not the exemption.
    const evidenced = recordEvidence(run, {
      stepId: 's1',
      claim: 'Zoning confirmed for s1.',
      status: 'VERIFIED',
      citations: [{ sourceId: 'gov-01', title: 'Register', sourceUri: 'https://example.test', jurisdiction: 'IN-KA' }],
    })
    run = evidenced.ok ? evidenced.state : run
    const approvalsRequested = requestApprovals(run)
    expect(approvalsRequested.ok).toBe(true)
    run = approvalsRequested.state

    const released = grantApproval(run, human, 'Factual step cited; approved.')
    expect(released.ok).toBe(true)
    if (released.ok) {
      expect(released.state.approvals[0].evidenceBasis).toBe('FACTUAL_EVIDENCE_RECORDED')
    }
  })
})
