import { kmAndMiles, type DistanceUnit } from '../units'

export type CatchmentEvidenceStatus = 'SOURCE-VERIFIED' | 'INDICATIVE' | 'INFERRED' | 'UNKNOWN' | 'STALE'

export type CatchmentCategory = {
  id: string
  label: string
  description: string
  status: CatchmentEvidenceStatus
}

export const DEFAULT_CATCHMENT_RADIUS_KM = 2

export const MIN_CATCHMENT_RADIUS_KM = 0.5
export const MAX_CATCHMENT_RADIUS_KM = 20

/**
 * Category list a catchment tool would need a real, licensed POI/routing
 * source to populate. Every category is UNKNOWN today — no place, count or
 * travel time is fabricated to fill the gap (mission requirement: never
 * fabricate nearby places or travel-time analysis).
 */
export const catchmentCategories: CatchmentCategory[] = [
  { id: 'schools', label: 'Schools & education', description: 'Count and distance of schools within the radius.', status: 'UNKNOWN' },
  { id: 'healthcare', label: 'Healthcare', description: 'Hospitals and clinics within the radius.', status: 'UNKNOWN' },
  { id: 'transit', label: 'Public transit', description: 'Metro, rail and organized bus stops within the radius.', status: 'UNKNOWN' },
  { id: 'retail', label: 'Retail & daily needs', description: 'Grocery, pharmacy and daily-needs retail within the radius.', status: 'UNKNOWN' },
  { id: 'employment', label: 'Employment nodes', description: 'Major office/industrial clusters within the radius.', status: 'UNKNOWN' },
]

export type CatchmentConfig = {
  radiusKm: number
  unit: DistanceUnit
  /** Straight-line ("as the crow flies") vs a routed network distance. Only 'straight-line' is honestly offered until a routing engine is wired. */
  method: 'straight-line'
}

export function clampRadiusKm(radiusKm: number): number {
  if (!Number.isFinite(radiusKm)) return DEFAULT_CATCHMENT_RADIUS_KM
  return Math.min(MAX_CATCHMENT_RADIUS_KM, Math.max(MIN_CATCHMENT_RADIUS_KM, radiusKm))
}

export function describeCatchment(config: CatchmentConfig): { km: number; mi: number; label: string } {
  const radiusKm = clampRadiusKm(config.radiusKm)
  const { km, mi } = kmAndMiles(radiusKm)
  const primary = config.unit === 'mi' ? `${mi.toFixed(2)} mi` : `${km.toFixed(2)} km`
  const secondary = config.unit === 'mi' ? `${km.toFixed(2)} km` : `${mi.toFixed(2)} mi`
  return { km, mi, label: `${primary} (${secondary}) · straight-line radius` }
}

export const catchmentInclusionDisclosure =
  'This radius is a straight-line ("as the crow flies") distance from the resolved site, not a routed travel time. ' +
  'No place, business, school, hospital or transit stop is listed inside it until a licensed POI/routing source is connected — ' +
  'every category below reads UNKNOWN rather than an invented count or name.'
