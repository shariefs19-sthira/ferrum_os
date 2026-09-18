// SUTRA orchestration automation stop rules.
//
// A pure evaluator: given a snapshot of what is known about the current
// orchestration step, returns the set of reasons automation must stop and
// hand control to a human. Never mutates state and never decides *how* the
// human is asked - that is orchestrationStateMachine.ts's job, which
// consumes this module's output to force a run into NEEDS_YOU.

export type StopRuleReason =
  | 'UNKNOWN'
  | 'CONFLICT'
  | 'JURISDICTION_UNAVAILABLE'
  | 'OUTSIDE_VALIDITY_ENVELOPE'
  | 'SAFETY_CRITICAL'
  | 'ISSUE_OR_RELEASE_ACTION'
  | 'EXTERNAL_AGENT_PROPOSAL'

export type StopRuleTrigger = {
  reason: StopRuleReason
  detail: string
}

export type StopRuleContext = {
  /** True when an input required to proceed is unresolved/missing, not merely low-confidence. */
  hasUnknownInputs: boolean
  /** True when two or more sources for the same fact disagree and were not reconciled. */
  hasConflictingSources: boolean
  /** The jurisdiction the step's answer depends on, or null when none applies. */
  jurisdiction: string | null
  /** False when `jurisdiction` is non-null but SUTRA has no coverage for it. */
  jurisdictionSupported: boolean
  /** False when the step falls outside the model/ruleset's declared validity envelope (scale, region, use type, code edition). */
  withinValidityEnvelope: boolean
  /** True when the step's outcome affects life-safety, structural integrity, or statutory compliance. */
  isSafetyCritical: boolean
  /** True when the step would issue a document for construction/fabrication or release a project revision. */
  isIssueOrReleaseAction: boolean
  /** True when the step originates from, or would hand control to, a connected external agent (Claude/Codex) proposal. */
  involvesExternalAgentProposal: boolean
}

const STOP_RULE_DEFINITIONS: Array<{
  reason: StopRuleReason
  applies: (context: StopRuleContext) => boolean
  detail: string
}> = [
  {
    reason: 'UNKNOWN',
    applies: (c) => c.hasUnknownInputs,
    detail: 'A required input is unresolved (UNKNOWN), not merely uncertain.',
  },
  {
    reason: 'CONFLICT',
    applies: (c) => c.hasConflictingSources,
    detail: 'Two or more sources disagree on the same fact and were not reconciled.',
  },
  {
    reason: 'JURISDICTION_UNAVAILABLE',
    applies: (c) => c.jurisdiction !== null && !c.jurisdictionSupported,
    detail: 'The applicable jurisdiction has no SUTRA coverage.',
  },
  {
    reason: 'OUTSIDE_VALIDITY_ENVELOPE',
    applies: (c) => !c.withinValidityEnvelope,
    detail: "The step falls outside the model/ruleset's declared validity envelope.",
  },
  {
    reason: 'SAFETY_CRITICAL',
    applies: (c) => c.isSafetyCritical,
    detail: 'The outcome affects life-safety, structural integrity, or statutory compliance.',
  },
  {
    reason: 'ISSUE_OR_RELEASE_ACTION',
    applies: (c) => c.isIssueOrReleaseAction,
    detail: 'The step would issue a document for construction/fabrication or release a project revision.',
  },
  {
    reason: 'EXTERNAL_AGENT_PROPOSAL',
    applies: (c) => c.involvesExternalAgentProposal,
    detail: 'The step originates from, or would act on, a connected external agent proposal.',
  },
]

export function evaluateAutomationStopRules(context: StopRuleContext): StopRuleTrigger[] {
  return STOP_RULE_DEFINITIONS.filter((rule) => rule.applies(context)).map((rule) => ({
    reason: rule.reason,
    detail: rule.detail,
  }))
}

export function requiresHumanBeforeAutomation(context: StopRuleContext): boolean {
  return evaluateAutomationStopRules(context).length > 0
}
