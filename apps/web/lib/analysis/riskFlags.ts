// RiskFlags — M1.5. Rule-based, deterministic flags. No scoring here —
// each rule either fires or doesn't, based on the same inputs the other
// calculators consume, so the flags stay traceable to real data gaps
// rather than a vague "risk level."
import type { LandData, RegulatoryData } from './types'

export type RiskFlag = {
  id: string
  severity: 'info' | 'warning'
  chip: 'INDICATIVE' | 'ROADMAP' | null
  message: string
}

export type RiskFlagInputs = {
  land: LandData
  regulatory: RegulatoryData | null
  boq: { matchedItems: number; totalItems: number }
  usesSampleGovtRates: boolean
  usesSampleStampDuty: boolean
  gatedFeatures: string[] // feature names not yet wired (e.g. 'auto take-off', 'GST computation')
}

export function computeRiskFlags(inputs: RiskFlagInputs): RiskFlag[] {
  const flags: RiskFlag[] = []

  if (!inputs.regulatory) {
    flags.push({ id: 'missing-zoning', severity: 'warning', chip: null, message: 'No zoning/regulatory data attached — feasibility regulatory-fit sub-score cannot be computed.' })
  } else if (inputs.regulatory.allowable_fsi <= 0) {
    flags.push({ id: 'invalid-fsi', severity: 'warning', chip: null, message: 'Allowable FSI is zero or missing — regulatory fit is not meaningful.' })
  }

  if (!inputs.land.ulpin) {
    flags.push({ id: 'missing-ulpin', severity: 'warning', chip: null, message: 'No ULPIN attached to this project — land-data completeness is capped.' })
  }

  if (inputs.boq.totalItems === 0) {
    flags.push({ id: 'empty-boq', severity: 'warning', chip: null, message: 'No BOQ line items attached — cost figures are not available.' })
  } else if (inputs.boq.matchedItems < inputs.boq.totalItems) {
    flags.push({
      id: 'unmatched-boq-items',
      severity: 'info',
      chip: null,
      message: `${inputs.boq.totalItems - inputs.boq.matchedItems} of ${inputs.boq.totalItems} BOQ item(s) have no matching govt reference rate.`,
    })
  }

  if (inputs.usesSampleGovtRates) {
    flags.push({ id: 'sample-govt-rates', severity: 'info', chip: 'INDICATIVE', message: 'Cost figures use seeded sample govt-reference rates, not live published rates.' })
  }
  if (inputs.usesSampleStampDuty) {
    flags.push({ id: 'sample-stamp-duty', severity: 'info', chip: 'INDICATIVE', message: 'Stamp duty/registration figures use illustrative sample rates — verify with the local sub-registrar.' })
  }

  for (const feature of inputs.gatedFeatures) {
    flags.push({ id: `gated-${feature.toLowerCase().replace(/\s+/g, '-')}`, severity: 'info', chip: 'ROADMAP', message: `${feature} is not yet built — excluded from this analysis.` })
  }

  return flags
}
