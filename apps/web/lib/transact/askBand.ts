// Ask-band estimator — Transact Stage-1, gated by
// docs/COMPLIANCE_GATE.md. Uses a small set of SAMPLE comparable
// multipliers, not a live listings feed (Ferrum OS has no live
// listings integration). Output is a price range, never a single
// "this is the price" number — a range is the honest shape for an
// illustrative estimate, and the compliance gate's "no guarantee
// language" rule rules out presenting a point estimate as if it were
// authoritative.

export type AskBandInput = {
  base_value: number
  /** 0 (no urgency) to 100 (highly urgent) — widens the band and shifts it down as urgency rises. */
  urgency: number
}

export type AskBandResult = {
  low: number
  high: number
  suggested: number
  indicative: true
}

const SAMPLE_COMPARABLES_SPREAD = 0.08 // ±8% baseline spread from sample comparable data

export function computeAskBand(input: AskBandInput): AskBandResult {
  const urgencyFactor = Math.max(0, Math.min(100, input.urgency)) / 100
  // Higher urgency narrows the band toward the low end (faster sale bias).
  const low = input.base_value * (1 - SAMPLE_COMPARABLES_SPREAD - urgencyFactor * 0.05)
  const high = input.base_value * (1 + SAMPLE_COMPARABLES_SPREAD - urgencyFactor * 0.03)
  const suggested = low + (high - low) * (1 - urgencyFactor * 0.4)
  return {
    low: Math.round(low),
    high: Math.round(high),
    suggested: Math.round(suggested),
    indicative: true,
  }
}
