// FERRUM-RATE ENGINE — W2-312, Mode 1 of the three-mode calculator
// (W2-311). Combines govt-reference, market, and user-supplied rates
// into a weighted-percentile band, with role-aware framing. Every
// output figure carries indicative:true — this engine estimates,
// it does not quote a market truth.
//
// Sources v1 (per the task spec): govt reference, indicative market
// seeds, user Mode-3 assumptions, project params. Uploaded BOQs and
// live feeds are explicitly out of scope until post-launch.

export type RateSource = { name: 'govt' | 'market' | 'user'; value: number; weight: number }
export type Role = 'buyer' | 'seller' | 'contractor'

export type TimeAdjustment = {
  project_start_month: string // YYYY-MM
  quarterly_escalation_factor: number // e.g. 0.02 for 2% per quarter
}

export type FerrumRateResult = {
  band: { p25: number; p50: number; p75: number }
  role_output: { role: Role; value: number; label: string }
  sources: RateSource[]
  weights_used: { govt: number; market: number; user: number }
  why_this_band: string
  time_adjustment_applied: boolean
  indicative: true
}

const DEFAULT_WEIGHTS = { govt: 40, market: 40, user: 20 }

/** Weighted percentile via cumulative-weight interpolation over sorted (value, weight) pairs. */
function weightedPercentile(sources: RateSource[], percentile: number): number {
  const sorted = [...sources].sort((a, b) => a.value - b.value)
  const totalWeight = sorted.reduce((sum, s) => sum + s.weight, 0)
  if (totalWeight === 0) return 0

  let cumulative = 0
  const target = (percentile / 100) * totalWeight
  for (let i = 0; i < sorted.length; i++) {
    const prevCumulative = cumulative
    cumulative += sorted[i].weight
    if (target <= cumulative) {
      if (i === 0) return sorted[i].value
      // Interpolate between this point and the previous one.
      const span = cumulative - prevCumulative
      const frac = span > 0 ? (target - prevCumulative) / span : 0
      return sorted[i - 1].value + frac * (sorted[i].value - sorted[i - 1].value)
    }
  }
  return sorted[sorted.length - 1].value
}

function roleOutput(role: Role, band: { p25: number; p50: number; p75: number }, marketValue: number): { role: Role; value: number; label: string } {
  if (role === 'buyer') {
    return { role, value: Math.round(band.p75), label: 'Conservative-high — plan for the upper end of the band.' }
  }
  if (role === 'seller') {
    return { role, value: Math.round(marketValue), label: 'Market median — anchored to the market source specifically.' }
  }
  return { role, value: Math.round(band.p50), label: 'Realistic median — the balanced weighted-percentile estimate.' }
}

function applyTimeAdjustment(value: number, adjustment: TimeAdjustment): number {
  const [startYear, startMonth] = adjustment.project_start_month.split('-').map(Number)
  const now = new Date()
  const monthsElapsed = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth)
  const quartersElapsed = Math.max(0, Math.floor(monthsElapsed / 3))
  return value * Math.pow(1 + adjustment.quarterly_escalation_factor, quartersElapsed)
}

export function computeFerrumRate(
  govtValue: number,
  marketValue: number,
  userValue: number,
  role: Role,
  weights: { govt: number; market: number; user: number } = DEFAULT_WEIGHTS,
  timeAdjustment?: TimeAdjustment,
): FerrumRateResult {
  const sources: RateSource[] = [
    { name: 'govt', value: govtValue, weight: weights.govt },
    { name: 'market', value: marketValue, weight: weights.market },
    { name: 'user', value: userValue, weight: weights.user },
  ]

  let p25 = weightedPercentile(sources, 25)
  let p50 = weightedPercentile(sources, 50)
  let p75 = weightedPercentile(sources, 75)

  const timeApplied = Boolean(timeAdjustment)
  if (timeAdjustment) {
    p25 = applyTimeAdjustment(p25, timeAdjustment)
    p50 = applyTimeAdjustment(p50, timeAdjustment)
    p75 = applyTimeAdjustment(p75, timeAdjustment)
  }

  const band = { p25: Math.round(p25 * 100) / 100, p50: Math.round(p50 * 100) / 100, p75: Math.round(p75 * 100) / 100 }
  const output = roleOutput(role, band, timeApplied && timeAdjustment ? applyTimeAdjustment(marketValue, timeAdjustment) : marketValue)

  const whyThisBand = `Weighted from govt reference (${weights.govt}%), market data (${weights.market}%), and your own assumption (${weights.user}%). ${
    timeApplied ? 'Escalated for time elapsed since project start. ' : ''
  }Band spans P25-P75 of the weighted distribution; the ${role} view highlights the ${output.label.split(' —')[0].toLowerCase()}.`

  return {
    band,
    role_output: output,
    sources,
    weights_used: weights,
    why_this_band: whyThisBand,
    time_adjustment_applied: timeApplied,
    indicative: true,
  }
}
