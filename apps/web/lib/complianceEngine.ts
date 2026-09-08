import { getRulesetForState } from './parcelIntel/sampleRulesets'
import type { LandUse } from './parcelIntel/types'

export type PermissionStage = 'BUY' | 'BUILD'

export type ComplianceParcel = {
  state: string
  areaSqm: number
  proposedHeightM: number
  proposedCoveragePct: number
  proposedFar: number
}

export type IndicativePermission = {
  id: string
  title: string
  authority: string
  stage: PermissionStage
  timelineDays: { min: number; max: number }
  feeEstimateInr: { min: number; max: number }
  documents: string[]
  status: 'INDICATIVE'
  rulesetVersion: string
  sourceNote: string
}

export type ComplianceResult = {
  ok: boolean
  permissions: IndicativePermission[]
  violations: string[]
  status: 'INDICATIVE'
  rulesetVersion: string | null
}

const BUILDING_TYPES: ReadonlySet<LandUse> = new Set<LandUse>([
  'Residential',
  'Commercial',
  'Mixed Use',
  'Industrial',
  'Institutional',
])

function moneyBand(areaSqm: number, rate: number): { min: number; max: number } {
  const midpoint = Math.round(areaSqm * rate / 1000) * 1000
  return { min: Math.max(0, Math.round(midpoint * 0.8 / 1000) * 1000), max: Math.round(midpoint * 1.2 / 1000) * 1000 }
}

/**
 * Builds an explicitly sample-derived permission workflow. It must not be used
 * as current authority advice: the only available rulesets are 2026.1-SAMPLE.
 */
export function evaluateCompliance(
  parcel: ComplianceParcel,
  buildingType: LandUse,
): ComplianceResult {
  const ruleset = getRulesetForState(parcel.state)
  if (!ruleset || !BUILDING_TYPES.has(buildingType)) {
    return { ok: false, permissions: [], violations: ['No sample ruleset exists for this state/building type.'], status: 'INDICATIVE', rulesetVersion: ruleset?.version ?? null }
  }

  const rule = ruleset.land_use_rules[buildingType]
  if (!rule || parcel.areaSqm <= 0 || parcel.proposedHeightM < 0 || parcel.proposedCoveragePct < 0 || parcel.proposedFar < 0) {
    return { ok: false, permissions: [], violations: ['Parcel dimensions and a matching sample land-use rule are required.'], status: 'INDICATIVE', rulesetVersion: ruleset.version }
  }

  const authority = `${ruleset.city_label} planning authority (sample workflow)`
  const common = {
    authority,
    status: 'INDICATIVE' as const,
    rulesetVersion: ruleset.version,
    sourceNote: ruleset.source_note,
  }
  const permissions: IndicativePermission[] = [
    {
      ...common,
      id: 'title-and-land-use-diligence',
      title: 'Title and land-use diligence',
      stage: 'BUY',
      timelineDays: { min: 7, max: 21 },
      feeEstimateInr: moneyBand(parcel.areaSqm, 18),
      documents: ['Title chain', 'Encumbrance record', 'Survey or parcel record', 'Current land-use record'],
    },
    {
      ...common,
      id: 'planning-review',
      title: 'Planning submission review',
      stage: 'BUILD',
      timelineDays: { min: 30, max: 90 },
      feeEstimateInr: moneyBand(parcel.areaSqm, 90),
      documents: ['Site plan', 'Area statement', 'Setback schedule', 'Ownership record', 'Professional declarations'],
    },
  ]

  if (parcel.proposedHeightM > 15 || buildingType === 'Commercial' || buildingType === 'Institutional') {
    permissions.push({
      ...common,
      id: 'technical-noc-review',
      title: 'Technical NOC review',
      stage: 'BUILD',
      timelineDays: { min: 21, max: 60 },
      feeEstimateInr: moneyBand(parcel.areaSqm, 35),
      documents: ['Fire and life-safety concept', 'Access statement', 'Services concept', 'Structural design basis'],
    })
  }

  const violations: string[] = []
  if (parcel.proposedFar > rule.far) violations.push(`Proposed FAR ${parcel.proposedFar} exceeds sample maximum ${rule.far}.`)
  if (parcel.proposedCoveragePct > rule.max_coverage_pct) violations.push(`Proposed coverage ${parcel.proposedCoveragePct}% exceeds sample maximum ${rule.max_coverage_pct}%.`)
  if (parcel.proposedHeightM > rule.max_height_m) violations.push(`Proposed height ${parcel.proposedHeightM} m exceeds sample maximum ${rule.max_height_m} m.`)

  return { ok: violations.length === 0, permissions, violations, status: 'INDICATIVE', rulesetVersion: ruleset.version }
}
