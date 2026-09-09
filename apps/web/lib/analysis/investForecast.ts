export const NORMALIZED_LAND_INDEX = {
  name: 'User-assumption land-value index',
  base: 100,
  method: 'Index(t) = 100 × (1 + user annual growth assumption)^t',
} as const

export function projectLandValue(currentValue: number, annualGrowthPct: number, years: number) {
  if (currentValue <= 0 || years < 0) throw new Error('Current value must be positive and years non-negative')
  const factor = Math.pow(1 + annualGrowthPct / 100, years)
  return { futureValue: currentValue * factor, gain: currentValue * factor - currentValue, normalizedIndex: NORMALIZED_LAND_INDEX.base * factor, indicative: true as const }
}
