import { describe, expect, it } from 'vitest'
import { packageMinimumNecessaryContext, redactPersonalData, type ContextRequest } from './ragContextPackaging'
import type { AdapterIdentity } from './ragAdapterBoundary'
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

describe('packageMinimumNecessaryContext', () => {
  it('only includes explicitly requested fragments, never the whole catalogue', () => {
    const packaged = packageMinimumNecessaryContext(request({ requestedFragmentIds: ['kb:public-1'] }), catalogue)
    expect(packaged.fragments).toHaveLength(1)
    expect(packaged.fragments[0].fragmentId).toBe('kb:public-1')
    expect(packaged.fragments[0].citation.sourceUri).toBe('https://example.test/is456')
  })

  it('excludes a fragment above the external adapter classification ceiling, with a named reason', () => {
    const packaged = packageMinimumNecessaryContext(request({ requestedFragmentIds: ['personal:1'] }), catalogue)
    expect(packaged.fragments).toHaveLength(0)
    expect(packaged.excludedFragmentIds).toEqual(['personal:1'])
    expect(packaged.exclusionReasons['personal:1'][0]).toMatch(/exceeds the EXTERNAL_MODEL adapter's ceiling/)
  })

  it('allows the same PERSONAL fragment through the local adapter, redacted, with citation intact', () => {
    const packaged = packageMinimumNecessaryContext(
      request({ requestedFragmentIds: ['personal:1'], adapterIdentity: localAdapter }),
      catalogue,
    )
    expect(packaged.fragments).toHaveLength(1)
    expect(packaged.fragments[0].content).not.toContain('jane.doe@example.test')
    expect(packaged.fragments[0].redactions.length).toBeGreaterThan(0)
    expect(packaged.fragments[0].citation.sourceName).toBe('Ownership record')
  })

  it('excludes a fragment from a different tenant even when explicitly requested', () => {
    const packaged = packageMinimumNecessaryContext(
      request({ requestedFragmentIds: ['proj:sensitive-1'], tenantId: 'tenant-b', projectId: null }),
      catalogue,
    )
    expect(packaged.fragments).toHaveLength(0)
    expect(packaged.exclusionReasons['proj:sensitive-1']).toContain('Fragment not visible to this tenant/project.')
  })

  it('reports an unknown fragment id as excluded rather than throwing', () => {
    const packaged = packageMinimumNecessaryContext(request({ requestedFragmentIds: ['does-not-exist'] }), catalogue)
    expect(packaged.excludedFragmentIds).toEqual(['does-not-exist'])
    expect(packaged.exclusionReasons['does-not-exist']).toEqual(['Fragment not found in catalogue.'])
  })
})
