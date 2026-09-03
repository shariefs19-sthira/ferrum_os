import { describe, it, expect } from 'vitest'
import { computePlotIntel } from '../../lib/parcelIntel/parcelIntel'

describe('computePlotIntel — fixed vectors from the real seed parcels', () => {
  it('KA-BLR-0001-2024 (Residential, 1200.5 sqm) resolves ruleset + advisable types', () => {
    const intel = computePlotIntel({ ulpin: 'KA-BLR-0001-2024', state: 'Karnataka', district: 'Bengaluru Urban', area_sqm: 1200.5, land_use: 'Residential' })
    expect(intel.ruleset?.city_label).toBe('Bengaluru')
    expect(intel.applicable_rule?.far).toBe(2.0)
    expect(intel.advisable_types[0].building_type).toContain('Low-rise apartment')
    expect(intel.indicative).toBe(true)
  })

  it('MH-PUN-0002-2024 (Mixed Use, 850 sqm) resolves Pune ruleset', () => {
    const intel = computePlotIntel({ ulpin: 'MH-PUN-0002-2024', state: 'Maharashtra', district: 'Pune', area_sqm: 850, land_use: 'Mixed Use' })
    expect(intel.ruleset?.city_label).toBe('Pune')
    expect(intel.advisable_types).toHaveLength(2)
  })

  it('TN-CHN-0003-2024 (Commercial, 2000 sqm) resolves Chennai ruleset', () => {
    const intel = computePlotIntel({ ulpin: 'TN-CHN-0003-2024', state: 'Tamil Nadu', district: 'Chennai', area_sqm: 2000, land_use: 'Commercial' })
    expect(intel.ruleset?.city_label).toBe('Chennai')
    expect(intel.applicable_rule?.far).toBe(2.0)
    expect(intel.advisable_types[0].building_type).toContain('Retail complex')
  })
})

describe('computePlotIntel — edge cases, never fabricates', () => {
  it('unrecognized state returns null ruleset and empty advisable types, not a guess', () => {
    const intel = computePlotIntel({ ulpin: 'X', state: 'Kerala', district: 'Kochi', area_sqm: 500, land_use: 'Residential' })
    expect(intel.ruleset).toBeNull()
    expect(intel.applicable_rule).toBeNull()
    expect(intel.advisable_types).toEqual([])
  })

  it('unrecognized land_use string returns empty advisable types even with a valid ruleset', () => {
    const intel = computePlotIntel({ ulpin: 'X', state: 'Karnataka', district: 'Bengaluru Urban', area_sqm: 500, land_use: 'Agricultural' })
    expect(intel.ruleset).not.toBeNull()
    expect(intel.applicable_rule).toBeNull()
    expect(intel.advisable_types).toEqual([])
  })

  it('every PlotIntel result carries indicative:true unconditionally', () => {
    const intel = computePlotIntel({ ulpin: 'X', state: 'Nowhere', district: 'Nowhere', area_sqm: 0, land_use: 'Nothing' })
    expect(intel.indicative).toBe(true)
  })
})
