import { describe, expect, it } from 'vitest'
import { evaluateAutomationStopRules, requiresHumanBeforeAutomation, type StopRuleContext } from './automationStopRules'

const clearContext: StopRuleContext = {
  hasUnknownInputs: false,
  hasConflictingSources: false,
  jurisdiction: 'IN-KA',
  jurisdictionSupported: true,
  withinValidityEnvelope: true,
  isSafetyCritical: false,
  isIssueOrReleaseAction: false,
  involvesExternalAgentProposal: false,
}

describe('automation stop rules', () => {
  it('returns no triggers and allows automation when every condition is clear', () => {
    expect(evaluateAutomationStopRules(clearContext)).toEqual([])
    expect(requiresHumanBeforeAutomation(clearContext)).toBe(false)
  })

  it('stops on UNKNOWN inputs', () => {
    const triggers = evaluateAutomationStopRules({ ...clearContext, hasUnknownInputs: true })
    expect(triggers.map((t) => t.reason)).toEqual(['UNKNOWN'])
  })

  it('stops on CONFLICT between sources', () => {
    const triggers = evaluateAutomationStopRules({ ...clearContext, hasConflictingSources: true })
    expect(triggers.map((t) => t.reason)).toEqual(['CONFLICT'])
  })

  it('stops when jurisdiction is set but unsupported, not when jurisdiction is absent', () => {
    expect(evaluateAutomationStopRules({ ...clearContext, jurisdiction: 'XX-NONE', jurisdictionSupported: false }).map((t) => t.reason)).toEqual([
      'JURISDICTION_UNAVAILABLE',
    ])
    expect(evaluateAutomationStopRules({ ...clearContext, jurisdiction: null, jurisdictionSupported: false })).toEqual([])
  })

  it('stops when outside the declared validity envelope', () => {
    const triggers = evaluateAutomationStopRules({ ...clearContext, withinValidityEnvelope: false })
    expect(triggers.map((t) => t.reason)).toEqual(['OUTSIDE_VALIDITY_ENVELOPE'])
  })

  it('stops on safety-critical decisions', () => {
    const triggers = evaluateAutomationStopRules({ ...clearContext, isSafetyCritical: true })
    expect(triggers.map((t) => t.reason)).toEqual(['SAFETY_CRITICAL'])
  })

  it('stops on issue/release actions', () => {
    const triggers = evaluateAutomationStopRules({ ...clearContext, isIssueOrReleaseAction: true })
    expect(triggers.map((t) => t.reason)).toEqual(['ISSUE_OR_RELEASE_ACTION'])
  })

  it('stops on external-agent proposals', () => {
    const triggers = evaluateAutomationStopRules({ ...clearContext, involvesExternalAgentProposal: true })
    expect(triggers.map((t) => t.reason)).toEqual(['EXTERNAL_AGENT_PROPOSAL'])
  })

  it('accumulates every triggered reason, not just the first', () => {
    const triggers = evaluateAutomationStopRules({
      ...clearContext,
      hasUnknownInputs: true,
      isSafetyCritical: true,
      involvesExternalAgentProposal: true,
    })
    expect(triggers.map((t) => t.reason).sort()).toEqual(['EXTERNAL_AGENT_PROPOSAL', 'SAFETY_CRITICAL', 'UNKNOWN'].sort())
    expect(requiresHumanBeforeAutomation({ ...clearContext, hasUnknownInputs: true })).toBe(true)
  })
})
