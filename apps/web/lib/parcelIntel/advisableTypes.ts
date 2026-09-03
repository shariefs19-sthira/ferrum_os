// Advisable-types rule engine — S1 PARCEL_INTEL (W2-381). Pure,
// deterministic, rule-based (no ML/heuristic scoring): given a land use,
// its applicable DCR/FAR rule, and the plot area, returns the building
// types the SAMPLE ruleset would plausibly support. An unrecognized land
// use returns an empty list rather than guessing — same no-fabrication
// convention as CostEngine's priceLineItem() falling back to an
// "unmatched" line rather than inventing a rate.
import type { AdvisableType, LandUse, LandUseRule } from './types'

const SMALL_PLOT_SQM = 300
const MID_PLOT_SQM = 800

export function computeAdvisableTypes(landUse: LandUse, rule: LandUseRule, areaSqm: number): AdvisableType[] {
  const types: AdvisableType[] = []

  switch (landUse) {
    case 'Residential':
      if (areaSqm < SMALL_PLOT_SQM) {
        types.push({ building_type: 'Independent house / villa (single unit)', reason: `Plot area ${areaSqm} m² is below the ${SMALL_PLOT_SQM} m² threshold this ruleset treats as multi-unit-viable.` })
      } else if (areaSqm < MID_PLOT_SQM) {
        types.push({ building_type: 'Independent house or duplex', reason: `Plot area ${areaSqm} m² supports a duplex at the sample FAR of ${rule.far}, but is below the ${MID_PLOT_SQM} m² threshold for apartment-scale massing.` })
      } else {
        types.push({ building_type: 'Low-rise apartment / multi-unit residential', reason: `Plot area ${areaSqm} m² and sample FAR ${rule.far} together support multi-unit massing within the ${rule.max_coverage_pct}% coverage cap.` })
      }
      break

    case 'Commercial':
      if (areaSqm < SMALL_PLOT_SQM) {
        types.push({ building_type: 'Small retail / standalone shop', reason: `Plot area ${areaSqm} m² is below the ${SMALL_PLOT_SQM} m² threshold for a multi-tenant commercial building.` })
      } else {
        types.push({ building_type: 'Retail complex / office building', reason: `Plot area ${areaSqm} m² and sample FAR ${rule.far} support a multi-tenant commercial building within the ${rule.max_coverage_pct}% coverage cap.` })
      }
      break

    case 'Mixed Use':
      types.push({ building_type: 'Ground-floor retail with residential/office above', reason: `Sample mixed-use FAR ${rule.far} is explicitly structured for a retail podium with residential or office floors above.` })
      if (areaSqm >= MID_PLOT_SQM) {
        types.push({ building_type: 'Mixed-use building with basement parking', reason: `Plot area ${areaSqm} m² is large enough for the ruleset's ${rule.max_coverage_pct}% coverage cap to leave room for a basement parking footprint.` })
      }
      break

    case 'Industrial':
      types.push({ building_type: 'Light industrial shed / warehouse', reason: `Sample industrial FAR ${rule.far} and ${rule.min_setback_m} m minimum setback are structured for a single-storey shed footprint.` })
      if (areaSqm >= MID_PLOT_SQM) {
        types.push({ building_type: 'Industrial park unit (multi-bay)', reason: `Plot area ${areaSqm} m² supports subdividing into multiple bays within the sample coverage cap.` })
      }
      break

    case 'Institutional':
      types.push({ building_type: 'Educational / healthcare / community facility', reason: 'Institutional land use — advisable building types are typically use-specific and subject to their own NOC/licensing process beyond DCR/FAR alone.' })
      break

    default:
      // Exhaustive switch above covers every LandUse; this branch only
      // exists so an unrecognized string from real (non-sample) data
      // never silently produces a fabricated recommendation.
      break
  }

  return types
}
