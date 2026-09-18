export type GovernedOrchestrationStage = {
  id: string
  title: string
  product: string
  stateChange: string
  evidence: string
}

export const governedOrchestrationStages: GovernedOrchestrationStage[] = [
  { id: 'design-revision', title: 'Design revision', product: 'DesignStudio', stateChange: 'A controlled revision enters the project record.', evidence: 'Revision ID, author, timestamp and changed geometry' },
  { id: 'affected-quantity', title: 'Affected quantity', product: 'BOQ Pro', stateChange: 'Only quantities touched by the revision are recalculated.', evidence: 'Measurement basis, before/after quantity and source elements' },
  { id: 'procurement-hold', title: 'Procurement hold', product: 'ProcureHub', stateChange: 'Affected requests and orders are held before commitment.', evidence: 'Linked line items, supplier status and accountable owner' },
  { id: 'cost-impact', title: 'Cost impact', product: 'BOQ Pro · InvestFlow', stateChange: 'The commercial effect is recomputed without hiding uncertainty.', evidence: 'Rate source, variance, contingency and confidence status' },
  { id: 'site-instruction', title: 'Site instruction', product: 'Ferrum Projects', stateChange: 'An approved instruction reaches the responsible site team.', evidence: 'Instruction revision, approver, recipients and acknowledgement' },
  { id: 'acceptance-evidence', title: 'Acceptance evidence', product: 'Ferrum Projects', stateChange: 'Completion is supported by inspection evidence.', evidence: 'Checklist, photos, test records, date and responsible reviewer' },
  { id: 'controlled-closure', title: 'Controlled closure', product: 'Ferrum Projects', stateChange: 'The chain closes only after every hold and acceptance condition is resolved.', evidence: 'Closure authority, linked records and immutable audit trail' },
]

export const governedAiQuestions = [
  'What event triggered the AI?',
  'What evidence did it inspect?',
  'What recommendation did it produce?',
  'Who retained approval authority?',
  'What downstream records changed?',
  'How can the decision be audited?',
] as const

export const governedOrchestrationFeatureBody = `Follow one traceable project chain from design revision to affected quantity, procurement hold, cost impact, site instruction, acceptance evidence and controlled closure. Every transition must retain its trigger, inspected evidence, AI recommendation, human approval authority, changed downstream records and audit trail. This is a roadmap contract: Ferrum does not yet claim an operational end-to-end orchestration engine.`
