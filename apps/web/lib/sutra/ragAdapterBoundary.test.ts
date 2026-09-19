import { describe, expect, it, vi } from 'vitest'
import {
  EXTERNAL_ADAPTER_PERMISSION_ENVELOPE,
  isClassificationEligibleForAdapter,
  type AdapterDecisionRequest,
  type AdapterIdentity,
  type ExternalDisclosureConsentReference,
} from './ragAdapterBoundary'
import { resolveAdapterDecision } from './ragRetrievalHandoff.server'
import * as boundaryExports from './ragAdapterBoundary'
import * as handoffExports from './ragRetrievalHandoff.server'
vi.mock('next/dist/compiled/server-only', () => ({}))
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

const localAdapter: AdapterIdentity = { kind: 'LOCAL_OPEN_MODEL', modelId: 'ferrum-local-open-1' }
const externalAdapter: AdapterIdentity = { kind: 'EXTERNAL_MODEL', provider: 'CLAUDE', modelId: 'claude-connected-model' }

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
    const decision = resolveAdapterDecision(decisionRequest())
    expect(decision.allowed).toBe(true)
    expect(decision.reasons).toHaveLength(0)
    expect(decision.permissionEnvelope).toBe(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE)
  })

  it('allows a visible, eligible RESTRICTED fragment to reach the local adapter with no permission envelope attached', () => {
    const decision = resolveAdapterDecision(
      decisionRequest({
        fragment: fragment({ classification: 'RESTRICTED', tenantId: 'tenant-a' }),
        identity: localAdapter,
        sandboxRequest: sandboxRequest({ provider: 'FERRUM_NATIVE', providerModel: localAdapter.modelId }),
      }),
    )
    expect(decision.allowed).toBe(true)
    expect(decision.permissionEnvelope).toBeNull()
  })


})

describe('resolveAdapterDecision - denial paths', () => {
  it('denies and attaches no envelope when tenant-invisible', () => {
    const decision = resolveAdapterDecision(
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
    const decision = resolveAdapterDecision(
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
    const decision = resolveAdapterDecision(decisionRequest({ sandboxRequest: sandboxRequest({ provider: 'CODEX' }) }))
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Sandbox request provider does not match the adapter identity presented for this retrieval.')
  })

  it('denies when the existing SUTRA sandbox policy itself denies the request (excess context disclosure)', () => {
    const decision = resolveAdapterDecision(
      decisionRequest({
        sandboxRequest: sandboxRequest({ disclosedContextIds: ['frag-1', 'tenant-secret:other-project'] }),
      }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons.some((r) => r.startsWith('SUTRA sandbox policy denied this request'))).toBe(true)
  })

  it('denies when the knowledge source does not match the fragment', () => {
    const decision = resolveAdapterDecision(decisionRequest({ knowledgeSource: knowledgeSource({ sourceId: 'src-mismatch' }) }))
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Knowledge source does not match the fragment being retrieved.')
  })

  it('denies when the source licence/consent does not permit retrieval', () => {
    const decision = resolveAdapterDecision(decisionRequest({ knowledgeSource: knowledgeSource({ retrievalConsent: false }) }))
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Source licence/consent does not permit retrieval.')
  })

  it('denies when a CUSTOMER_AUTHORIZED source is scoped to a different tenant than the request', () => {
    const decision = resolveAdapterDecision(
      decisionRequest({ knowledgeSource: knowledgeSource({ licence: 'CUSTOMER_AUTHORIZED', tenantId: 'tenant-b' }) }),
    )
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toContain('Source licence/consent does not permit retrieval.')
  })

  it('has no public composition factory, consent authority or proof minting API', () => {
    expect(Object.keys(boundaryExports).sort()).toEqual(['EXTERNAL_ADAPTER_PERMISSION_ENVELOPE', 'isClassificationEligibleForAdapter'])
    expect(Object.keys(handoffExports).sort()).toEqual(['handoffRetrieval', 'resolveAdapterDecision'])
  })

  it.each([null, consentReference(), consentReference({ recordDigest: 'forged' })])(
    'denies external PROJECT_SENSITIVE content with absent or caller-forged reference %j', (reference) => {
      const decision = resolveAdapterDecision(decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        externalDisclosureConsentReference: reference,
      }))
      expect(decision.allowed).toBe(false)
      expect(decision.permissionEnvelope).toBeNull()
      expect(decision.reasons.join(' ')).toMatch(/authoritative/i)
    },
  )

  it('ignores caller-injected store, verifier and frozen proof', () => {
    const verify = vi.fn(() => Object.freeze({ verified: true, allowed: true }))
    const decision = resolveAdapterDecision({
      ...decisionRequest({
        fragment: fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }),
        externalDisclosureConsentReference: consentReference(),
      }),
      ...{ consentStore: { verify }, externalDisclosureConsentVerifier: { verify }, proof: Object.freeze({ verified: true }) },
    })
    expect(decision.allowed).toBe(false)
    expect(decision.permissionEnvelope).toBeNull()
    expect(verify).not.toHaveBeenCalled()
  })

  it.each([
    { providerModel: 'different-model' },
    { tenantId: 'different-tenant' },
    { projectId: 'different-project' },
    { requestedContextIds: [] },
    { disclosedContextIds: [] },
    { accessMode: 'PROPOSE_ONLY' as const },
    { dataRetention: 'PROVIDER_DEFAULT' as const },
    { trainingConsent: 'EXPLICIT_TRAINING_OPT_IN' as const },
  ])('denies a mismatched or unsafe sandbox request %j', (overrides) => {
    expect(resolveAdapterDecision(decisionRequest({ sandboxRequest: sandboxRequest(overrides) })).allowed).toBe(false)
  })

  it('reports every applicable denial reason together rather than masking one with another', () => {
    const decision = resolveAdapterDecision(
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
