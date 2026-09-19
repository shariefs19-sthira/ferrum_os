import { describe, expect, it } from 'vitest'
import {
  EXTERNAL_ADAPTER_PERMISSION_ENVELOPE,
  AdapterDecisionService,
  isClassificationEligibleForAdapter,
  type AdapterDecisionRequest,
  type AdapterIdentity,
  type ConsentStoreVerificationResult,
  type ExternalDisclosureConsentReference,
  type ExternalDisclosureConsentStore,
  type VerifiedExternalDisclosureBinding,
} from './ragAdapterBoundary'
import type { KnowledgeFragment } from './ragClassification'
import type { KnowledgeSource, SutraSandboxRequest } from './sandboxPolicy'

function fragment(overrides: Partial<KnowledgeFragment> = {}): KnowledgeFragment {
  return {
    fragmentId: 'frag-1',
    sourceId: 'src-1',
    classification: 'PUBLIC',
    tenantId: null,
    projectId: null,
    content: 'General setback guidance.',
    citation: { sourceName: 'Sample code', sourceUri: 'https://example.test/code', clauseOrLocator: 'Cl 1.1' },
    ...overrides,
  }
}

function knowledgeSource(overrides: Partial<KnowledgeSource> = {}): KnowledgeSource {
  return {
    sourceId: 'src-1',
    title: 'Sample code',
    editionOrVersion: '2026.1',
    jurisdiction: 'GLOBAL',
    licence: 'OPEN',
    sourceUri: 'https://example.test/code',
    citationRequired: true,
    tenantId: null,
    retrievalConsent: true,
    trainingConsent: 'RETRIEVAL_ONLY',
    ...overrides,
  }
}

function sandboxRequest(overrides: Partial<SutraSandboxRequest> = {}): SutraSandboxRequest {
  return {
    requestId: 'req-1',
    tenantId: 'tenant-a',
    projectId: 'project-7',
    actorId: 'user-4',
    provider: 'CLAUDE',
    providerModel: 'claude-connected-model',
    providerVersion: '2026-09',
    accessMode: 'READ_ONLY',
    requestedContextIds: ['frag-1'],
    disclosedContextIds: ['frag-1'],
    dataRetention: 'NO_RETENTION',
    trainingConsent: 'DENIED',
    projectMutationConfirmationId: null,
    ...overrides,
  }
}

function consentReference(overrides: Partial<ExternalDisclosureConsentReference> = {}): ExternalDisclosureConsentReference {
  return Object.freeze({
    immutableConfirmationId: 'consent-9',
    recordDigest: 'sha256:consent-record-9',
    recordVersion: '7',
    ...overrides,
  })
}

function verifiedBinding(overrides: Partial<VerifiedExternalDisclosureBinding> = {}): VerifiedExternalDisclosureBinding {
  return Object.freeze({
    projectId: 'project-7', provider: 'CLAUDE' as const, providerModel: 'claude-connected-model',
    classification: 'PROJECT_SENSITIVE' as const, fragmentId: 'frag-1', purpose: 'SUTRA_READONLY_RETRIEVAL' as const,
    ...overrides,
  })
}

function trustedConsentStore(resultOverrides: Partial<ConsentStoreVerificationResult> = {}): ExternalDisclosureConsentStore {
  return Object.freeze({
    verify: (reference, expected) => Object.freeze({
      verified: true,
      immutableConfirmationId: reference.immutableConfirmationId,
      recordDigest: reference.recordDigest,
      recordVersion: reference.recordVersion,
      binding: Object.freeze({ ...expected }),
      ...resultOverrides,
    }),
  })
}

const localAdapter: AdapterIdentity = { kind: 'LOCAL_OPEN_MODEL', modelId: 'ferrum-local-open-1' }
const externalAdapter: AdapterIdentity = { kind: 'EXTERNAL_MODEL', provider: 'CLAUDE', modelId: 'claude-connected-model' }
const trustedService = AdapterDecisionService.compose(trustedConsentStore())

function decisionRequest(overrides: Partial<AdapterDecisionRequest> = {}): AdapterDecisionRequest {
  return {
    fragment: fragment(),
    identity: externalAdapter,
    tenantId: 'tenant-a',
    projectId: 'project-7',
    sandboxRequest: sandboxRequest(),
    knowledgeSource: knowledgeSource(),
    externalDisclosureConsentReference: null,
    ...overrides,
  }
}

describe('external adapter permission envelope', () => {
  it('is frozen and never grants write, deploy or website authority', () => {
    expect(Object.isFrozen(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE)).toBe(true)
    expect(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE.canWriteProjectData).toBe(false)
    expect(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE.canWriteRepository).toBe(false)
    expect(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE.canModifyWebsite).toBe(false)
    expect(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE.canDeploy).toBe(false)
    expect(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE.canDeleteData).toBe(false)
    expect(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE.canTrainOnDisclosedData).toBe(false)
    expect(() => {
      // @ts-expect-error - intentionally attempting a runtime mutation of a frozen object
      EXTERNAL_ADAPTER_PERMISSION_ENVELOPE.canModifyWebsite = true
    }).toThrow()
    expect(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE.canModifyWebsite).toBe(false)
  })
})

describe('classification ceilings per adapter', () => {
  it('the local/open-model adapter may receive every classification', () => {
    expect(isClassificationEligibleForAdapter('PUBLIC', 'LOCAL_OPEN_MODEL')).toBe(true)
    expect(isClassificationEligibleForAdapter('RESTRICTED', 'LOCAL_OPEN_MODEL')).toBe(true)
  })

  it('the external-model adapter tops out at PROJECT_SENSITIVE', () => {
    expect(isClassificationEligibleForAdapter('PUBLIC', 'EXTERNAL_MODEL')).toBe(true)
    expect(isClassificationEligibleForAdapter('PROJECT_SENSITIVE', 'EXTERNAL_MODEL')).toBe(true)
    expect(isClassificationEligibleForAdapter('PERSONAL', 'EXTERNAL_MODEL')).toBe(false)
    expect(isClassificationEligibleForAdapter('RESTRICTED', 'EXTERNAL_MODEL')).toBe(false)
  })
})

describe('resolveAdapterDecision - permitted minimal-context case', () => {
  it('allows a PUBLIC fragment through the external adapter once every gate passes, envelope attached', () => {
    const decision = trustedService.resolve(decisionRequest())
    expect(decision.allowed).toBe(true)
    expect(decision.reasons).toHaveLength(0)
    expect(decision.permissionEnvelope).toBe(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE)
  })

  it('allows a visible, eligible RESTRICTED fragment to reach the local adapter with no permission envelope attached', () => {
    const decision = trustedService.resolve(
      decisionRequest({
        fragment: fragment({ classification: 'RESTRICTED', tenantId: 'tenant-a' }),
        identity: localAdapter,
        sandboxRequest: sandboxRequest({ provider: 'FERRUM_NATIVE' }),
      }),
    )
    expect(decision.allowed).toBe(true)
    expect(decision.permissionEnvelope).toBeNull()
  })

  it('allows PROJECT_SENSITIVE data to the external adapter only with matching consent-store verification evidence', () => {
    const decision = trustedService.resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-a' }),
        sandboxRequest: sandboxRequest({ dataRetention: 'FERRUM_MANAGED' }),
        externalDisclosureConsentReference: consentReference(),
      }),
    )
    expect(decision.allowed).toBe(true)
    expect(decision.permissionEnvelope).toBe(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE)
  })
})

describe('resolveAdapterDecision - denial paths', () => {
  it('denies and attaches no envelope when tenant-invisible', () => {
    const decision = trustedService.resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-b' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-b' }),
      }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Fragment is not visible to this tenant/project.')
    expect(decision.permissionEnvelope).toBeNull()
  })

  it('denies PERSONAL data reaching the external adapter on classification ceiling, no envelope attached', () => {
    const decision = trustedService.resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PERSONAL', tenantId: 'tenant-a' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-a' }),
      }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons.some((r) => r.includes("exceeds the EXTERNAL_MODEL adapter's ceiling"))).toBe(true)
    expect(decision.permissionEnvelope).toBeNull()
  })

  it('denies when the sandbox request identity does not match the adapter presented', () => {
    const decision = trustedService.resolve(decisionRequest({ sandboxRequest: sandboxRequest({ provider: 'CODEX' }) }))
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Sandbox request provider does not match the adapter identity presented for this retrieval.')
  })

  it('denies when the existing SUTRA sandbox policy itself denies the request (excess context disclosure)', () => {
    const decision = trustedService.resolve(
      decisionRequest({
        sandboxRequest: sandboxRequest({ disclosedContextIds: ['frag-1', 'tenant-secret:other-project'] }),
      }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons.some((r) => r.startsWith('SUTRA sandbox policy denied this request'))).toBe(true)
  })

  it('denies when the knowledge source does not match the fragment', () => {
    const decision = trustedService.resolve(decisionRequest({ knowledgeSource: knowledgeSource({ sourceId: 'src-mismatch' }) }))
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Knowledge source does not match the fragment being retrieved.')
  })

  it('denies when the source licence/consent does not permit retrieval', () => {
    const decision = trustedService.resolve(decisionRequest({ knowledgeSource: knowledgeSource({ retrievalConsent: false }) }))
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Source licence/consent does not permit retrieval.')
  })

  it('denies when a CUSTOMER_AUTHORIZED source is scoped to a different tenant than the request', () => {
    const decision = trustedService.resolve(
      decisionRequest({ knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-b' }) }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Source licence/consent does not permit retrieval.')
  })

  it('does not accept an always-true verifier injected through caller request data', () => {
    const callerSuppliedAlwaysTrueVerifier = Object.freeze({
      verify: () => Object.freeze({ verified: true }),
    })
    const decision = AdapterDecisionService.compose(trustedConsentStore({ verified: false })).resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-a' }),
        externalDisclosureConsentReference: consentReference(),
        // An untyped network payload may carry this legacy field, but the
        // request type excludes it and the service never reads it.
        ...({ externalDisclosureConsentVerifier: callerSuppliedAlwaysTrueVerifier } as unknown as Partial<AdapterDecisionRequest>),
      }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Consent-store verifier did not verify this disclosure consent.')
    expect(decision.permissionEnvelope).toBeNull()
  })

  it('denies verification evidence bound to a different provider/model, fragment or project', () => {
    const decision = AdapterDecisionService.compose(
      trustedConsentStore({ binding: verifiedBinding({ projectId: 'project-other', providerModel: 'other-model', fragmentId: 'frag-other' }) }),
    ).resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-a' }),
        externalDisclosureConsentReference: consentReference(),
      }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Consent-store verification evidence is not bound to this exact disclosure.')
    expect(decision.permissionEnvelope).toBeNull()
  })

  it('denies an absent reference, forged record or mismatched consent-store evidence', () => {
    const absentDecision = trustedService.resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-a' }),
        externalDisclosureConsentReference: null,
      }),
    )
    expect(absentDecision.allowed).toBe(false)
    expect(absentDecision.reasons).toContain('External PROJECT_SENSITIVE disclosure requires consent-store verification evidence.')

    const forgedDecision = AdapterDecisionService.compose(trustedConsentStore({ verified: false })).resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-a' }),
        externalDisclosureConsentReference: consentReference(),
      }),
    )
    expect(forgedDecision.allowed).toBe(false)
    expect(forgedDecision.reasons).toContain('Consent-store verifier did not verify this disclosure consent.')

    const mismatchedProofDecision = AdapterDecisionService.compose(trustedConsentStore({ recordDigest: 'sha256:other-record' })).resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-a' }),
        externalDisclosureConsentReference: consentReference(),
      }),
    )
    expect(mismatchedProofDecision.allowed).toBe(false)
    expect(mismatchedProofDecision.reasons).toContain('Consent-store verification evidence does not match the immutable consent id, digest and version.')

    const trustedStoreWithOneRecord: ExternalDisclosureConsentStore = Object.freeze({
      verify: (reference, expected) => Object.freeze({
        verified: reference.recordDigest === 'sha256:consent-record-9',
        immutableConfirmationId: reference.immutableConfirmationId,
        recordDigest: reference.recordDigest,
        recordVersion: reference.recordVersion,
        binding: Object.freeze({ ...expected }),
      }),
    })
    const forgedReferenceDecision = AdapterDecisionService.compose(trustedStoreWithOneRecord).resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-a' }),
        externalDisclosureConsentReference: consentReference({ recordDigest: 'sha256:forged-record' }),
      }),
    )
    expect(forgedReferenceDecision.allowed).toBe(false)
    expect(forgedReferenceDecision.reasons).toContain('Consent-store verifier did not verify this disclosure consent.')
  })

  it('reports every applicable denial reason together rather than masking one with another', () => {
    const decision = trustedService.resolve(
      decisionRequest({
        fragment: fragment({ classification: 'PERSONAL', tenantId: 'tenant-b' }),
        knowledgeSource: knowledgeSource({ sourceId: 'src-mismatch' }),
        sandboxRequest: sandboxRequest({ provider: 'CODEX', disclosedContextIds: ['frag-1', 'tenant-secret:other-project'] }),
      }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons.length).toBeGreaterThanOrEqual(4)
  })
})
