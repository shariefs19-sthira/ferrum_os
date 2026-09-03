// PlotIntel composite — S1 PARCEL_INTEL (W2-381). Wires the ULPIN
// lookup's real parcel record (LandRecordsProvider.ParcelRecord) through
// the SAMPLE DCR/FAR ruleset and the advisable-types rule engine. Pure
// function — the caller (worker.ts) supplies the already-looked-up
// parcel; this file never touches D1 itself.
import { getRulesetForState } from './sampleRulesets'
import { computeAdvisableTypes } from './advisableTypes'
import type { LandUse, PlotIntel } from './types'

const KNOWN_LAND_USES: LandUse[] = ['Residential', 'Commercial', 'Mixed Use', 'Industrial', 'Institutional']

function asKnownLandUse(value: string): LandUse | null {
  return (KNOWN_LAND_USES as string[]).includes(value) ? (value as LandUse) : null
}

export function computePlotIntel(parcel: { ulpin: string; state: string; district: string; area_sqm: number; land_use: string }): PlotIntel {
  const ruleset = getRulesetForState(parcel.state)
  const landUse = asKnownLandUse(parcel.land_use)
  const applicableRule = ruleset && landUse ? ruleset.land_use_rules[landUse] ?? null : null
  const advisableTypes = applicableRule && landUse ? computeAdvisableTypes(landUse, applicableRule, parcel.area_sqm) : []

  return {
    ulpin: parcel.ulpin,
    state: parcel.state,
    district: parcel.district,
    area_sqm: parcel.area_sqm,
    land_use: parcel.land_use,
    ruleset,
    applicable_rule: applicableRule,
    advisable_types: advisableTypes,
    indicative: true,
  }
}
