import { describe, expect, it } from 'vitest'
import {
  EXTERNAL_ADAPTER_PERMISSION_ENVELOPE,
  isClassificationEligibleForAdapter,
  resolveAdapterDecision,
  type AdapterIdentity,
} from './ragAdapterBoundary'
import type { KnowledgeFragment } from './ragClassification'

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

const localAdapter: AdapterIdentity = { kind: 'LOCAL_OPEN_MODEL', modelId: 'ferrum-local-open-1' }
const externalAdapter: AdapterIdentity = { kind: 'EXTERNAL_MODEL', provider: 'CLAUDE', modelId: 'claude-connected-model' }

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

describe('resolveAdapterDecision', () => {
  it('allows a visible, eligible fragment to reach the local adapter with no permission envelope attached', () => {
    const decision = resolveAdapterDecision(fragment({ classification: 'RESTRICTED', tenantId: 'tenant-a' }), localAdapter, 'tenant-a', null)
    expect(decision.allowed).toBe(true)
    expect(decision.permissionEnvelope).toBeNull()
  })

  it('denies PERSONAL data reaching the external adapter and attaches the permission envelope anyway for audit visibility', () => {
    const decision = resolveAdapterDecision(fragment({ classification: 'PERSONAL', tenantId: 'tenant-a' }), externalAdapter, 'tenant-a', null)
    expect(decision.allowed).toBe(false)
    expect(decision.reasons[0]).toMatch(/exceeds the EXTERNAL_MODEL adapter's ceiling/)
    expect(decision.permissionEnvelope).toBe(EXTERNAL_ADAPTER_PERMISSION_ENVELOPE)
  })

  it('reports both tenant-visibility and classification-ceiling failures together', () => {
    const decision = resolveAdapterDecision(fragment({ classification: 'PERSONAL', tenantId: 'tenant-b' }), externalAdapter, 'tenant-a', null)
    expect(decision.allowed).toBe(false)
    expect(decision.reasons).toHaveLength(2)
  })

  it('allows PROJECT_SENSITIVE data to the external adapter once tenant-visible', () => {
    const decision = resolveAdapterDecision(fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: 'project-7' }), externalAdapter, 'tenant-a', 'project-7')
    expect(decision.allowed).toBe(true)
  })
})
