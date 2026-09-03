// Shared types for S1 PARCEL_INTEL (W2-381). Pure types only — the
// ruleset data and rule-engine logic live in sibling files, both pure
// functions with no D1/fetch/env access, matching the Analysis Engine's
// (W2-370) established pattern in lib/analysis/**.

export type LandUse = 'Residential' | 'Commercial' | 'Mixed Use' | 'Industrial' | 'Institutional'

export type LandUseRule = {
  far: number
  max_coverage_pct: number
  min_setback_m: number
  max_height_m: number
  notes: string
}

/**
 * One versioned, per-state DCR+FAR ruleset. `version` and `indicative`
 * are mandatory on every ruleset so no caller can accidentally treat a
 * sample as a real, current development-control-regulation figure — see
 * sampleRulesets.ts for why no real per-city/per-parcel source exists
 * yet, and how a real one would plug in without changing this shape.
 */
export type DcrFarRuleset = {
  state: string
  city_label: string
  version: string
  indicative: true
  source_note: string
  land_use_rules: Partial<Record<LandUse, LandUseRule>>
}

export type AdvisableType = {
  building_type: string
  reason: string
}

export type PlotIntel = {
  ulpin: string
  state: string
  district: string
  area_sqm: number
  land_use: string
  ruleset: DcrFarRuleset | null
  applicable_rule: LandUseRule | null
  advisable_types: AdvisableType[]
  indicative: true
}
