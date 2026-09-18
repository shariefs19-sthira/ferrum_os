import { describe, expect, it } from 'vitest'
import { canPromoteLearning, canUseForRetrieval, evaluateSandboxRequest, SUTRA_SANDBOX_POLICY, type KnowledgeSource, type SutraSandboxRequest } from './sandboxPolicy'

const request: SutraSandboxRequest = {
  requestId: 'req-01',
  tenantId: 'tenant-a',
  projectId: 'project-7',
  actorId: 'user-4',
  provider: 'CLAUDE',
  providerModel: 'claude-connected-model',
  providerVersion: '2026-09',
  accessMode: 'PROPOSE_ONLY',
  requestedContextIds: ['plan:PM-003', 'code:local-2026'],
  disclosedContextIds: ['plan:PM-003'],
  dataRetention: 'NO_RETENTION',
  trainingConsent: 'DENIED',
  projectMutationConfirmationId: null,
}

describe('SUTRA specialist-agent sandbox', () => {
  it('keeps external providers proposed-only with least-context audit metadata', () => {
    const decision = evaluateSandboxRequest(request)
    expect(decision.allowed).toBe(true)
    expect(decision.effectiveAccess).toBe('PROPOSE_ONLY')
    expect(decision.audit).toMatchObject({ tenantId: 'tenant-a', provider: 'CLAUDE', dataRetention: 'NO_RETENTION' })
    expect(SUTRA_SANDBOX_POLICY.deploymentAuthority).toBe(false)
    expect(SUTRA_SANDBOX_POLICY.releaseAuthority).toBe(false)
  })

  it('denies unconfirmed mutation and excess context disclosure', () => {
    const decision = evaluateSandboxRequest({
      ...request,
      provider: 'CODEX',
      accessMode: 'PROJECT_MUTATION',
      disclosedContextIds: ['plan:PM-003', 'tenant-secret:other-project'],
    })
    expect(decision.allowed).toBe(false)
    expect(decision.effectiveAccess).toBe('DENIED')
    expect(decision.reasons).toHaveLength(2)
  })

  it('allows a confirmed project mutation while withholding release authority', () => {
    const decision = evaluateSandboxRequest({ ...request, provider: 'FERRUM_NATIVE', accessMode: 'PROJECT_MUTATION', projectMutationConfirmationId: 'confirm-99' })
    expect(decision.effectiveAccess).toBe('CONFIRMED_PROJECT_MUTATION')
    expect(SUTRA_SANDBOX_POLICY.websiteAdministration).toBe(false)
  })
})

describe('lawful SUTRA knowledge promotion', () => {
  const source: KnowledgeSource = {
    sourceId: 'kb-01',
    title: 'Open building-science handbook',
    editionOrVersion: '2026.1',
    jurisdiction: 'GLOBAL',
    licence: 'OPEN',
    sourceUri: 'https://example.test/open-handbook',
    citationRequired: true,
    tenantId: null,
    retrievalConsent: true,
    trainingConsent: 'RETRIEVAL_ONLY',
  }

  it('permits cited retrieval from lawful global sources and isolates customer sources by tenant', () => {
    expect(canUseForRetrieval(source, null)).toBe(true)
    const customer = { ...source, licence: 'CUSTOMER_AUTHORIZED' as const, tenantId: 'tenant-a' }
    expect(canUseForRetrieval(customer, 'tenant-a')).toBe(true)
    expect(canUseForRetrieval(customer, 'tenant-b')).toBe(false)
  })

  it('requires explicit customer opt-in plus review, evaluation and versioned release before learning promotion', () => {
    const customer = { ...source, licence: 'CUSTOMER_AUTHORIZED' as const, tenantId: 'tenant-a' }
    const blocked = canPromoteLearning(customer, { sourceId: 'kb-01', candidateVersion: 'sutra-kb-12', reviewerIds: ['reviewer-1'], evaluationId: 'eval-4', approvedReleaseId: 'release-5' })
    expect(blocked.allowed).toBe(false)
    expect(blocked.reasons).toContain('Customer material requires explicit training opt-in.')
    const allowed = canPromoteLearning({ ...customer, trainingConsent: 'EXPLICIT_TRAINING_OPT_IN' }, { sourceId: 'kb-01', candidateVersion: 'sutra-kb-12', reviewerIds: ['reviewer-1'], evaluationId: 'eval-4', approvedReleaseId: 'release-5' })
    expect(allowed.allowed).toBe(true)
  })
})
