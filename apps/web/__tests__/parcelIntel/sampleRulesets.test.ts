import { describe, it, expect } from 'vitest'
import { getRulesetForState, SAMPLE_DCR_FAR_RULESETS } from '../../lib/parcelIntel/sampleRulesets'

describe('getRulesetForState', () => {
  it('returns the Karnataka ruleset for Karnataka', () => {
    const ruleset = getRulesetForState('Karnataka')
    expect(ruleset?.city_label).toBe('Bengaluru')
    expect(ruleset?.indicative).toBe(true)
  })

  it('returns null for an unrecognized state (edge case)', () => {
    expect(getRulesetForState('Kerala')).toBeNull()
  })

  it('every ruleset carries a version string and indicative:true', () => {
    for (const ruleset of Object.values(SAMPLE_DCR_FAR_RULESETS)) {
      expect(ruleset.version).toMatch(/SAMPLE/)
      expect(ruleset.indicative).toBe(true)
    }
  })

  it('every ruleset covers all 5 documented land uses', () => {
    for (const ruleset of Object.values(SAMPLE_DCR_FAR_RULESETS)) {
      expect(Object.keys(ruleset.land_use_rules).sort()).toEqual(
        ['Commercial', 'Industrial', 'Institutional', 'Mixed Use', 'Residential'].sort(),
      )
    }
  })
})
