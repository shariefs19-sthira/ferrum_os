// Buyer/seller case state machine (W2-322), gated by
// docs/COMPLIANCE_GATE.md — Stage-1 only. Every step name is
// deliberately process-language ("token_payment", "opinion_slot"),
// never outcome language ("approved", "guaranteed"), per the
// compliance gate's no-guarantee-language rule.

export type CaseRole = 'buyer' | 'seller'

export const BUYER_STEPS = [
  'shortlist',
  'legal_cross_check',
  'token_payment',
  'registration_checklist',
  'slot_requested',
] as const

export const SELLER_STEPS = [
  'intake',
  'opinion_slot',
  'ask_band',
  'mandate_confirm',
  'listing_card',
] as const

export type BuyerStep = (typeof BUYER_STEPS)[number]
export type SellerStep = (typeof SELLER_STEPS)[number]
export type CaseStep = BuyerStep | SellerStep

export function stepsForRole(role: CaseRole): readonly string[] {
  return role === 'buyer' ? BUYER_STEPS : SELLER_STEPS
}

export function initialStep(role: CaseRole): string {
  return stepsForRole(role)[0]
}

/**
 * A step may only advance to the next step in its role's fixed sequence.
 * token_payment (buyer) is Stage-1 test-mode only — no real Razorpay
 * charge exists yet (W2-324 not landed); advancing past it just records
 * the case moved on, it does not confirm a payment was captured.
 */
export function nextStep(role: CaseRole, current: string): string | null {
  const steps = stepsForRole(role)
  const idx = steps.indexOf(current)
  if (idx === -1 || idx === steps.length - 1) return null
  return steps[idx + 1]
}

export function isValidTransition(role: CaseRole, from: string, to: string): boolean {
  return nextStep(role, from) === to
}

export function isTerminalStep(role: CaseRole, step: string): boolean {
  const steps = stepsForRole(role)
  return steps.indexOf(step) === steps.length - 1
}
