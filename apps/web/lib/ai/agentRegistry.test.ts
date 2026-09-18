import { describe, expect, it } from 'vitest'
import { AGENT_MODELS, FERRUM_AGENT_POLICY, canRunModel } from './agentRegistry'

describe('Ferrum agent governance registry', () => {
  it('keeps SUTRA active by default and connected providers gated', () => {
    expect(FERRUM_AGENT_POLICY.defaultModel).toBe('sutra')
    expect(canRunModel('sutra')).toBe(true)
    expect(AGENT_MODELS.filter((model) => model.id !== 'sutra').every((model) => !canRunModel(model.id))).toBe(true)
  })

  it('never grants an agent repository or website administration access', () => {
    expect(FERRUM_AGENT_POLICY.repositoryAccess).toBe(false)
    expect(FERRUM_AGENT_POLICY.websiteAdministration).toBe(false)
    expect(FERRUM_AGENT_POLICY.canModifyFerrumApplication).toBe(false)
    expect(FERRUM_AGENT_POLICY.externalSideEffects).toBe('user_approval_required')
  })
})
