import { describe, expect, it } from 'vitest'
import { classificationRank, isVisibleToTenant, meetsOrExceeds, type KnowledgeFragment } from './ragClassification'

function fragment(overrides: Partial<KnowledgeFragment> = {}): KnowledgeFragment {
  return {
    fragmentId: 'frag-1',
    sourceId: 'src-1',
    classification: 'PUBLIC',
    tenantId: null,
    projectId: null,
    content: 'Setbacks under the local development code.',
    citation: { sourceName: 'Sample code', sourceUri: 'https://example.test/code', clauseOrLocator: 'Cl 1.1' },
    ...overrides,
  }
}

describe('classification ranking', () => {
  it('orders PUBLIC < PROJECT_SENSITIVE < PERSONAL < RESTRICTED', () => {
    expect(classificationRank('PUBLIC')).toBeLessThan(classificationRank('PROJECT_SENSITIVE'))
    expect(classificationRank('PROJECT_SENSITIVE')).toBeLessThan(classificationRank('PERSONAL'))
    expect(classificationRank('PERSONAL')).toBeLessThan(classificationRank('RESTRICTED'))
  })

  it('meetsOrExceeds compares against a floor', () => {
    expect(meetsOrExceeds('RESTRICTED', 'PERSONAL')).toBe(true)
    expect(meetsOrExceeds('PUBLIC', 'PERSONAL')).toBe(false)
    expect(meetsOrExceeds('PROJECT_SENSITIVE', 'PROJECT_SENSITIVE')).toBe(true)
  })
})

describe('tenant visibility', () => {
  it('PUBLIC fragments are always visible, tenant and project both null', () => {
    expect(isVisibleToTenant(fragment(), null, null)).toBe(true)
    expect(isVisibleToTenant(fragment(), 'tenant-a', 'project-1')).toBe(true)
  })

  it('tenant-scoped fragments require a matching tenant', () => {
    const f = fragment({ classification: 'PROJECT_SENSITIVE', tenantId: 'tenant-a', projectId: null })
    expect(isVisibleToTenant(f, 'tenant-a', null)).toBe(true)
    expect(isVisibleToTenant(f, 'tenant-b', null)).toBe(false)
    expect(isVisibleToTenant(f, null, null)).toBe(false)
  })

  it('a fragment scoped to no tenant is never visible once it requires tenant scoping', () => {
    const f = fragment({ classification: 'RESTRICTED', tenantId: null, projectId: null })
    expect(isVisibleToTenant(f, 'tenant-a', null)).toBe(false)
  })

  it('project scoping narrows further within the same tenant', () => {
    const f = fragment({ classification: 'PERSONAL', tenantId: 'tenant-a', projectId: 'project-7' })
    expect(isVisibleToTenant(f, 'tenant-a', 'project-7')).toBe(true)
    expect(isVisibleToTenant(f, 'tenant-a', 'project-8')).toBe(false)
  })
})
