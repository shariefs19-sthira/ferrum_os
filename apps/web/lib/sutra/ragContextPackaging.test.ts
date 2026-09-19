import { describe, expect, it, vi } from 'vitest'
import { redactPersonalData, type ContextRequest } from './ragContextPackaging'
import type { AdapterIdentity } from './ragAdapterBoundary'
import { handoffRetrieval, type RetrievalHandoffRequest } from './ragRetrievalHandoff.server'
import * as packagingExports from './ragContextPackaging'
import type { KnowledgeSource } from './sandboxPolicy'
vi.mock('next/dist/compiled/server-only', () => ({}))
import type { KnowledgeFragment } from './ragClassification'

const externalAdapter: AdapterIdentity = { kind: 'EXTERNAL_MODEL', provider: 'CLAUDE', modelId: 'claude-connected-model' }
const localAdapter: AdapterIdentity = { kind: 'LOCAL_OPEN_MODEL', modelId: 'ferrum-local-open-1' }

const catalogue: KnowledgeFragment[] = [
  {
    fragmentId: 'kb:public-1',
    sourceId: 'src-1',
    classification: 'PUBLIC',
    tenantId: null,
    projectId: null,
    content: 'IS 456 governs limit-state design for RCC structures.',
    citation: { sourceName: 'IS 456:2000', sourceUri: 'https://example.test/is456', clauseOrLocator: 'Cl 23.2.1' },
  },
  {
    fragmentId: 'proj:sensitive-1',
    sourceId: 'src-2',
    classification: 'PROJECT_SENSITIVE',
    tenantId: 'tenant-a',
    projectId: 'project-7',
    content: 'Site boundary coordinates for the plot under review.',
    citation: { sourceName: 'Project survey', sourceUri: 'internal://project-7/survey', clauseOrLocator: 'sheet-3' },
  },
  {
    fragmentId: 'personal:1',
    sourceId: 'src-3',
    classification: 'PERSONAL',
    tenantId: 'tenant-a',
    projectId: 'project-7',
    content: 'Owner contact: jane.doe@example.test, +91 98765 43210.',
    citation: { sourceName: 'Ownership record', sourceUri: 'internal://project-7/owner', clauseOrLocator: 'field-1' },
  },
]

function request(overrides: Partial<ContextRequest> = {}): ContextRequest {
  return {
    requestId: 'req-1',
    tenantId: 'tenant-a',
    projectId: 'project-7',
    adapterIdentity: externalAdapter,
    requestedFragmentIds: ['kb:public-1'],
    purpose: 'setback-guidance',
    ...overrides,
  }
}

const sources: KnowledgeSource[] = catalogue.map((fragment) => ({
  sourceId: fragment.sourceId, title: 'Sample source', editionOrVersion: '1', jurisdiction: null,
  licence: fragment.tenantId ? 'CUSTOMER_AUTHORIZED' : 'OPEN', sourceUri: fragment.citation.sourceUri,
  citationRequired: true, tenantId: fragment.tenantId, retrievalConsent: true, trainingConsent: 'RETRIEVAL_ONLY',
}))

function handoffRequest(context: ContextRequest): RetrievalHandoffRequest {
  return {
    ...context,
    sandboxRequest: {
      requestId: context.requestId, tenantId: context.tenantId ?? '', projectId: context.projectId ?? '', actorId: 'user-4',
      provider: context.adapterIdentity.kind === 'EXTERNAL_MODEL' ? context.adapterIdentity.provider : 'FERRUM_NATIVE',
      providerModel: context.adapterIdentity.modelId, providerVersion: '1', accessMode: 'READ_ONLY',
      requestedContextIds: context.requestedFragmentIds, disclosedContextIds: context.requestedFragmentIds,
      dataRetention: 'NO_RETENTION', trainingConsent: 'DENIED', projectMutationConfirmationId: null,
    },
    externalDisclosureConsentReferences: {},
  }
}

function packageContext(context: ContextRequest, fragments: KnowledgeFragment[]) {
  return handoffRetrieval(handoffRequest(context), fragments, sources)
}

describe('redactPersonalData', () => {
  it('redacts emails and phone numbers deterministically and reports what it found', () => {
    const { content, redactions } = redactPersonalData('personal:1', 'Owner contact: jane.doe@example.test, +91 98765 43210.')
    expect(content).not.toContain('jane.doe@example.test')
    expect(content).toContain('[REDACTED_EMAIL]')
    expect(content).toContain('[REDACTED_PHONE]')
    expect(redactions.map((r) => r.pattern).sort()).toEqual(['EMAIL', 'PHONE'])
  })

  it('is a no-op when nothing matches', () => {
    const { content, redactions } = redactPersonalData('kb:public-1', 'IS 456 governs limit-state design.')
    expect(content).toBe('IS 456 governs limit-state design.')
    expect(redactions).toHaveLength(0)
  })
})

describe('server-owned context packaging', () => {
  it('only includes explicitly requested fragments, never the whole catalogue', () => {
    const packaged = packageContext(request({ requestedFragmentIds: ['kb:public-1'] }), catalogue)
    expect(packaged.fragments).toHaveLength(1)
    expect(packaged.fragments[0].fragmentId).toBe('kb:public-1')
    expect(packaged.fragments[0].citation.sourceUri).toBe('https://example.test/is456')
  })

  it('excludes a fragment above the external adapter classification ceiling, with a named reason', () => {
    const packaged = packageContext(request({ requestedFragmentIds: ['personal:1'] }), catalogue)
    expect(packaged.fragments).toHaveLength(0)
    expect(packaged.excludedFragmentIds).toEqual(['personal:1'])
    expect(packaged.exclusionReasons['personal:1'][0]).toMatch(/exceeds the EXTERNAL_MODEL adapter's ceiling/)
  })

  it('allows the same PERSONAL fragment through the local adapter, redacted, with citation intact', () => {
    const packaged = packageContext(
      request({ requestedFragmentIds: ['personal:1'], adapterIdentity: localAdapter }),
      catalogue,
    )
    expect(packaged.fragments).toHaveLength(1)
    expect(packaged.fragments[0].content).not.toContain('jane.doe@example.test')
    expect(packaged.fragments[0].redactions.length).toBeGreaterThan(0)
    expect(packaged.fragments[0].citation.sourceName).toBe('Ownership record')
  })

  it('excludes a fragment from a different tenant even when explicitly requested', () => {
    const packaged = packageContext(
      request({ requestedFragmentIds: ['proj:sensitive-1'], tenantId: 'tenant-b', projectId: null }),
      catalogue,
    )
    expect(packaged.fragments).toHaveLength(0)
    expect(packaged.exclusionReasons['proj:sensitive-1']).toContain('Fragment is not visible to this tenant/project.')
  })

  it('reports an unknown fragment id as excluded rather than throwing', () => {
    const packaged = packageContext(request({ requestedFragmentIds: ['does-not-exist'] }), catalogue)
    expect(packaged.excludedFragmentIds).toEqual(['does-not-exist'])
    expect(packaged.exclusionReasons['does-not-exist']).toEqual(['Fragment not found in catalogue.'])
  })
})

describe('adversarial handoff authorization', () => {
  it('does not export a standalone packageMinimumNecessaryContext bypass', () => {
    expect(Object.keys(packagingExports)).toEqual(['redactPersonalData'])
  })

  it('never returns external PROJECT_SENSITIVE content with no authoritative consent', () => {
    const result = packageContext(request({ requestedFragmentIds: ['proj:sensitive-1'] }), catalogue)
    expect(result.fragments).toEqual([])
    expect(result.excludedFragmentIds).toEqual(['proj:sensitive-1'])
    expect(JSON.stringify(result)).not.toContain(catalogue[1].content)
  })

  it('cannot package sensitive content using caller store, verifier, decision, approval or frozen proof', () => {
    const verify = vi.fn(() => true)
    const input = {
      ...handoffRequest(request({ requestedFragmentIds: ['proj:sensitive-1'] })),
      externalDisclosureConsentReferences: { 'proj:sensitive-1': Object.freeze({ immutableConfirmationId: 'fake', recordDigest: 'fake', recordVersion: '1' }) },
      consentStore: { verify }, externalDisclosureConsentVerifier: { verify },
      decision: { allowed: true }, approval: Object.freeze({ allowed: true }), proof: Object.freeze({ verified: true }),
    }
    const result = handoffRetrieval(input, catalogue, sources)
    expect(result.fragments).toEqual([])
    expect(JSON.stringify(result)).not.toContain(catalogue[1].content)
    expect(verify).not.toHaveBeenCalled()
  })

  it('rechecks each fragment so a successful PUBLIC decision cannot authorize sensitive content', () => {
    const input = handoffRequest(request({ requestedFragmentIds: ['kb:public-1', 'proj:sensitive-1'] }))
    const result = handoffRetrieval(input, catalogue, sources)
    expect(result.fragments.map((f) => f.fragmentId)).toEqual(['kb:public-1'])
    expect(result.excludedFragmentIds).toEqual(['proj:sensitive-1'])
  })

  it('keeps licence and retrieval consent gates in the content-producing path', () => {
    for (const change of [{ licence: 'UNKNOWN' as const }, { retrievalConsent: false }]) {
      const result = handoffRetrieval(handoffRequest(request()), catalogue, sources.map((source) => ({ ...source, ...change })))
      expect(result.fragments).toEqual([])
      expect(result.exclusionReasons['kb:public-1']).toContain('Source licence/consent does not permit retrieval.')
    }
  })

  it('denies missing source metadata, unlisted context and mismatched request identity', () => {
    const input = handoffRequest(request())
    expect(handoffRetrieval(input, catalogue, []).fragments).toEqual([])
    expect(handoffRetrieval({ ...input, sandboxRequest: { ...input.sandboxRequest, requestedContextIds: [] } }, catalogue, sources).fragments).toEqual([])
    expect(handoffRetrieval({ ...input, requestId: 'other' }, catalogue, sources).fragments).toEqual([])
  })
})
