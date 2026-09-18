import { describe, expect, it } from 'vitest'
import { capabilitiesForProduct, openSourceCapabilityRegistry, registryIntegrityIssues } from './openSourceRegistry'

describe('open-source capability registry', () => {
  it('has unique identities, evidence for active dependencies and explicit isolation for copyleft software', () => {
    expect(registryIntegrityIssues()).toEqual([])
  })

  it('does not claim planned or evaluated components are connected', () => {
    const unconnected = openSourceCapabilityRegistry.filter((entry) => entry.maturity !== 'ACTIVE DEPENDENCY')
    expect(unconnected.length).toBeGreaterThan(15)
    expect(unconnected.every((entry) => entry.connectionEvidence === null)).toBe(true)
  })

  it('keeps the adoption set curated and product-addressable', () => {
    expect(capabilitiesForProduct('DesignStudio').some((entry) => entry.id === 'three')).toBe(true)
    expect(capabilitiesForProduct('SUTRA').some((entry) => entry.id === 'model-serving')).toBe(true)
    expect(openSourceCapabilityRegistry.find((entry) => entry.id === 'commercial-gate-set')?.maturity).toBe('EXCLUDED/COMMERCIAL GATE')
  })
})
