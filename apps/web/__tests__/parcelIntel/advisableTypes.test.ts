import { describe, it, expect } from 'vitest'
import { computeAdvisableTypes } from '../../lib/parcelIntel/advisableTypes'
import { getRulesetForState } from '../../lib/parcelIntel/sampleRulesets'

const KA = getRulesetForState('Karnataka')!

describe('computeAdvisableTypes — Residential', () => {
  it('small plot (<300 sqm) advises a single-unit house', () => {
    const types = computeAdvisableTypes('Residential', KA.land_use_rules.Residential!, 200)
    expect(types).toHaveLength(1)
    expect(types[0].building_type).toContain('Independent house')
  })
  it('mid plot (300-800 sqm) advises a house or duplex', () => {
    const types = computeAdvisableTypes('Residential', KA.land_use_rules.Residential!, 500)
    expect(types[0].building_type).toContain('duplex')
  })
  it('large plot (>=800 sqm) advises multi-unit residential', () => {
    const types = computeAdvisableTypes('Residential', KA.land_use_rules.Residential!, 1200.5)
    expect(types[0].building_type).toContain('Low-rise apartment')
  })
  it('boundary: exactly 300 sqm falls into the mid band, not small (edge case)', () => {
    const types = computeAdvisableTypes('Residential', KA.land_use_rules.Residential!, 300)
    expect(types[0].building_type).toContain('duplex')
  })
})

describe('computeAdvisableTypes — Commercial', () => {
  it('small plot advises standalone shop', () => {
    const types = computeAdvisableTypes('Commercial', KA.land_use_rules.Commercial!, 100)
    expect(types[0].building_type).toContain('Small retail')
  })
  it('large plot (2000 sqm, matches Chennai seed) advises a retail complex', () => {
    const types = computeAdvisableTypes('Commercial', KA.land_use_rules.Commercial!, 2000)
    expect(types[0].building_type).toContain('Retail complex')
  })
})

describe('computeAdvisableTypes — Mixed Use', () => {
  it('always advises ground-floor retail, and adds basement parking on large plots', () => {
    const small = computeAdvisableTypes('Mixed Use', KA.land_use_rules['Mixed Use']!, 400)
    expect(small).toHaveLength(1)
    const large = computeAdvisableTypes('Mixed Use', KA.land_use_rules['Mixed Use']!, 850)
    expect(large).toHaveLength(2)
    expect(large[1].building_type).toContain('basement parking')
  })
})

describe('computeAdvisableTypes — Industrial and Institutional', () => {
  it('industrial always advises a shed, adds multi-bay on large plots', () => {
    const small = computeAdvisableTypes('Industrial', KA.land_use_rules.Industrial!, 400)
    expect(small).toHaveLength(1)
    const large = computeAdvisableTypes('Industrial', KA.land_use_rules.Industrial!, 900)
    expect(large).toHaveLength(2)
  })
  it('institutional advises one general-purpose type, never a specific guess', () => {
    const types = computeAdvisableTypes('Institutional', KA.land_use_rules.Institutional!, 1000)
    expect(types).toHaveLength(1)
    expect(types[0].reason).toContain('NOC')
  })
})

describe('computeAdvisableTypes — edge cases', () => {
  it('zero area does not crash and still returns a type (edge case)', () => {
    const types = computeAdvisableTypes('Residential', KA.land_use_rules.Residential!, 0)
    expect(types).toHaveLength(1)
  })
})
