// SAMPLE DCR+FAR rulesets — S1 PARCEL_INTEL (W2-381). No real per-city
// development-control-regulation source exists anywhere in this repo
// (same gap already documented for FeasibilityScore's regulatory-fit
// sub-score in lib/analysis/sampleData.ts — SAMPLE_ALLOWABLE_FSI). These
// are explicitly indicative placeholder figures loosely modeled on
// published municipal DCR structure (base FAR by land use, coverage cap,
// setback, height cap), NOT a current or verified regulation for any
// city. `version` exists specifically so a real per-city/per-parcel
// source can replace one of these three entries later without changing
// the DcrFarRuleset shape or any caller — swap the ruleset object, bump
// `version`, done.
import type { DcrFarRuleset } from './types'

export const SAMPLE_DCR_FAR_RULESETS: Record<string, DcrFarRuleset> = {
  Karnataka: {
    state: 'Karnataka',
    city_label: 'Bengaluru',
    version: '2026.1-SAMPLE',
    indicative: true,
    source_note: 'Illustrative structure only — not sourced from a published BBMP/BDA DCR document. Replace with a real per-zone ruleset before presenting as authoritative.',
    land_use_rules: {
      Residential: { far: 2.0, max_coverage_pct: 65, min_setback_m: 1.5, max_height_m: 15, notes: 'Sample low-rise residential band.' },
      Commercial: { far: 2.75, max_coverage_pct: 70, min_setback_m: 3, max_height_m: 24, notes: 'Sample commercial-corridor band.' },
      'Mixed Use': { far: 2.5, max_coverage_pct: 68, min_setback_m: 2, max_height_m: 18, notes: 'Sample mixed-use band.' },
      Industrial: { far: 1.5, max_coverage_pct: 55, min_setback_m: 4.5, max_height_m: 12, notes: 'Sample light-industrial band.' },
      Institutional: { far: 1.75, max_coverage_pct: 50, min_setback_m: 3, max_height_m: 15, notes: 'Sample institutional band.' },
    },
  },
  Maharashtra: {
    state: 'Maharashtra',
    city_label: 'Pune',
    version: '2026.1-SAMPLE',
    indicative: true,
    source_note: 'Illustrative structure only — not sourced from a published PMC/PMRDA DCR document. Replace with a real per-zone ruleset before presenting as authoritative.',
    land_use_rules: {
      Residential: { far: 1.8, max_coverage_pct: 60, min_setback_m: 1.5, max_height_m: 14, notes: 'Sample low-rise residential band.' },
      Commercial: { far: 2.5, max_coverage_pct: 65, min_setback_m: 3, max_height_m: 21, notes: 'Sample commercial-corridor band.' },
      'Mixed Use': { far: 2.2, max_coverage_pct: 62, min_setback_m: 2, max_height_m: 17, notes: 'Sample mixed-use band.' },
      Industrial: { far: 1.4, max_coverage_pct: 50, min_setback_m: 4.5, max_height_m: 12, notes: 'Sample light-industrial band.' },
      Institutional: { far: 1.6, max_coverage_pct: 48, min_setback_m: 3, max_height_m: 14, notes: 'Sample institutional band.' },
    },
  },
  'Tamil Nadu': {
    state: 'Tamil Nadu',
    city_label: 'Chennai',
    version: '2026.1-SAMPLE',
    indicative: true,
    source_note: 'Illustrative structure only — not sourced from a published CMDA DCR document. Replace with a real per-zone ruleset before presenting as authoritative.',
    land_use_rules: {
      Residential: { far: 1.5, max_coverage_pct: 60, min_setback_m: 1.5, max_height_m: 15, notes: 'Sample low-rise residential band (CMDA-style FSI caps are typically lower than BBMP/PMC).' },
      Commercial: { far: 2.0, max_coverage_pct: 65, min_setback_m: 3, max_height_m: 24, notes: 'Sample commercial-corridor band.' },
      'Mixed Use': { far: 1.75, max_coverage_pct: 62, min_setback_m: 2, max_height_m: 18, notes: 'Sample mixed-use band.' },
      Industrial: { far: 1.25, max_coverage_pct: 50, min_setback_m: 4.5, max_height_m: 12, notes: 'Sample light-industrial band.' },
      Institutional: { far: 1.5, max_coverage_pct: 48, min_setback_m: 3, max_height_m: 15, notes: 'Sample institutional band.' },
    },
  },
}

export function getRulesetForState(state: string): DcrFarRuleset | null {
  return SAMPLE_DCR_FAR_RULESETS[state] ?? null
}
