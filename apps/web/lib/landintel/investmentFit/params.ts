import type { FitRequirement, IntendedUse, RiskTolerance } from './types'

export const EMPTY_REQUIREMENT: FitRequirement = { intendedUse: null, budgetMinCr: null, budgetMaxCr: null, targetReturnPct: null, holdYears: null, risk: null, minAreaSqm: null, preferredZone: '', requireVerifiedRecord: false }
export const DEFAULT_REQUIREMENT: FitRequirement = { intendedUse: 'residential', budgetMinCr: 0.5, budgetMaxCr: 2, targetReturnPct: 8, holdYears: 5, risk: 'medium', minAreaSqm: 200, preferredZone: '', requireVerifiedRecord: false }

export const USES: { value: IntendedUse; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed', label: 'Mixed use' },
  { value: 'hold', label: 'Land hold (appreciation)' },
]
export const RISKS: { value: RiskTolerance; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

/** Requirement counts as empty when nothing has been stated. */
export function isRequirementEmpty(r: FitRequirement): boolean {
  return r.intendedUse === null && r.budgetMinCr === null && r.budgetMaxCr === null && r.targetReturnPct === null && r.holdYears === null && r.risk === null && r.minAreaSqm === null && !r.preferredZone.trim() && !r.requireVerifiedRecord
}
