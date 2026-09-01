// IRR/NPV math — shared by the REST route and the MCP tool, per
// AGENT_INTERFACE.md §0's one-capability-two-transports commitment.
// Extracted out of lib/mcp/server.ts (W2-274) so the parity REST
// route (W2-270) doesn't duplicate the calculation.

export function computeNpv(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + discountRate, i), 0)
}

/** Newton's-method IRR estimate; returns null if it doesn't converge. */
export function estimateIrr(cashFlows: number[]): number | null {
  let rate = 0.1
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0
    let dNpv = 0
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t)
      dNpv += (-t * cashFlows[t]) / Math.pow(1 + rate, t + 1)
    }
    if (Math.abs(npv) < 1e-6) return Math.round(rate * 10000) / 10000
    if (dNpv === 0) return null
    const nextRate = rate - npv / dNpv
    if (!Number.isFinite(nextRate)) return null
    rate = nextRate
  }
  return null
}
