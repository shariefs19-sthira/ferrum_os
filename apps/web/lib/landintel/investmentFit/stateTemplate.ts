import { convertArea } from '../../units'
import type { FitFacts, FitRequirement } from './types'

const U = 'UNKNOWN'
const v = (x: string | number | null | undefined) => (x === null || x === undefined || x === '' ? U : String(x))

/** Renders deterministic facts + stated requirement into the plain-text state the judge reads. No personal data. Missing => UNKNOWN. */
export function renderState(f: FitFacts, r: FitRequirement, projection: { futureValueCr: number; years: number } | null, extras: { label: string; value: string }[] = []): string {
  const a = f.areaSqm === null ? null : convertArea(f.areaSqm)
  return [
    'PARCEL FACTS (deterministic modules; INDICATIVE unless marked VERIFIED)',
    `ULPIN: ${v(f.ulpin)} | State: ${v(f.state)} | District: ${v(f.district)}`,
    `Area: ${a ? `${a.sqm.toFixed(1)} m2 = ${a.sqft.toFixed(0)} sqft = ${a.cent.toFixed(2)} cents = ${a.guntha.toFixed(2)} guntha = ${a.ground.toFixed(2)} ground = ${a.acre.toFixed(3)} acre` : U}`,
    `Land use: ${v(f.landUse)} | Zone: ${v(f.zone)}`,
    `Current value (INR crore): ${v(f.askingValueCr)}`,
    `Feasibility score (0-100): ${v(f.feasibilityScore)} | Growth assumption %/yr: ${v(f.growthPct)}`,
    `Projected value at end of hold (INR crore): ${projection ? projection.futureValueCr.toFixed(3) : U}`,
    `Provenance: ${f.provenance ? `${f.provenance.status}, ${f.provenance.source}, ${f.provenance.vintage}` : U}`,
    '',
    'STATED REQUIREMENT',
    `Intended use: ${v(r.intendedUse)} | Budget INR crore: ${v(r.budgetMinCr)} to ${v(r.budgetMaxCr)}`,
    `Target return %/yr: ${v(r.targetReturnPct)} | Hold years: ${v(r.holdYears)} | Risk tolerance: ${v(r.risk)}`,
    `Minimum area m2: ${v(r.minAreaSqm)} | Preferred zone: ${v(r.preferredZone.trim())} | Requires VERIFIED record: ${r.requireVerifiedRecord ? 'yes' : 'no'}`,
    ...(extras.length ? ['Other stated preferences: ' + extras.map((e) => `${e.label}=${e.value}`).join('; ')] : []),
  ].join('\n')
}
