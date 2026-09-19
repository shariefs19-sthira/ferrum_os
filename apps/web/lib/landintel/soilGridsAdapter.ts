/**
 * ISRIC SoilGrids 2.0 point adapter (LandIntel geotechnical source, regional screening).
 *
 * Boundary: SoilGrids is a ~250 m machine-learning soil-property PRIOR. Every
 * value emitted here is INDICATIVE / MODELLED / REGIONAL_SCREENING. It is never
 * parcel ground truth and never a bearing capacity, USCS/engineering
 * classification, borehole, CPT or SPT result. The adapter only emits the
 * `soil-classification-properties` topic and never derives a design value.
 *
 * Verified against official ISRIC sources (2026-09-19):
 *  - REST API `https://rest.isric.org/soilgrids/v2.0/properties/query`, OpenAPI at
 *    `.../openapi.json`: lon in [-180,180], lat in [-90,90], repeatable
 *    `property`, `depth`, `value` (Q0.05, Q0.5, Q0.95, mean, uncertainty).
 *  - Response layers carry `unit_measure.{d_factor,mapped_units,target_units}`;
 *    the converted value is mapped value / d_factor, in target_units.
 *  - Masked cells (e.g. built-up/urban, water) return null values with HTTP 200;
 *    the central Bengaluru cell (77.5946, 12.9716) was observed null.
 *  - Licence: ISRIC data policy — SoilGrids is shared under CC BY 4.0; citation
 *    requested; "assessment of the accuracy and applicability ... is strictly a
 *    user responsibility". Citation: Poggio et al. (2021), SOIL 7, 217–240.
 *  - No numeric rate limit is stated in the official docs reachable at
 *    verification time, so no limiter is implemented; one request per call and
 *    an injectable cache (only used for outage fallback) is all this adapter does.
 *
 * All network access goes through the injected `fetchImpl`.
 */

import {
  publicDataNonClaims,
  type GeotechnicalEvidence,
  type GeotechnicalEvidenceStatus,
  type SourceLineage,
} from './geotechnicalIntelligence'

export const SOILGRIDS_SOURCE_ID = 'isric-soilgrids-2.0'
export const SOILGRIDS_BASE_URL = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
export const SOILGRIDS_ATTRIBUTION =
  'SoilGrids 2.0 (ISRIC — World Soil Information), CC BY 4.0. Poggio, L. et al. (2021) SoilGrids 2.0: producing soil information for the globe with quantified spatial uncertainty, SOIL, 7, 217–240.'
export const SOILGRIDS_LICENCE = 'CC BY 4.0'
export const SOILGRIDS_WATERMARK = 'INDICATIVE MODELLED REGIONAL_SCREENING'

export const SOILGRIDS_PROPERTIES = [
  'bdod', 'cec', 'cfvo', 'clay', 'nitrogen', 'ocd', 'ocs', 'phh2o', 'sand', 'silt', 'soc', 'wv0010', 'wv0033', 'wv1500',
] as const
export const SOILGRIDS_DEPTHS = [
  '0-5cm', '5-15cm', '15-30cm', '30-60cm', '60-100cm', '100-200cm',
] as const
export type SoilGridsProperty = (typeof SOILGRIDS_PROPERTIES)[number]
export type SoilGridsDepth = (typeof SOILGRIDS_DEPTHS)[number]

const DEFAULT_PROPERTIES: SoilGridsProperty[] = ['clay', 'sand', 'silt', 'bdod', 'phh2o']
const REQUESTED_VALUES = ['Q0.05', 'Q0.5', 'Q0.95', 'mean'] as const
const DEFAULT_TIMEOUT_MS = 15_000

export type SoilGridsUncertainty = {
  q05: number | null
  q50: number | null
  q95: number | null
  /** (Q0.95 - Q0.05) / |mean|; null when it cannot be computed. */
  relativeIntervalWidth: number | null
}

export type SoilGridsEvidence = GeotechnicalEvidence<number | null> & {
  property: SoilGridsProperty | string
  depth: string
  uncertainty: SoilGridsUncertainty
}

export type SoilGridsOutcome =
  | 'LIVE'
  | 'STALE_CACHE'
  | 'NO_DATA'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_REJECTED'
  | 'INVALID_INPUT'

export type SoilGridsResult = {
  outcome: SoilGridsOutcome
  evidence: SoilGridsEvidence[]
  issues: string[]
  attribution: string
  licence: string
  watermark: string
  retrievedAt: string | null
}

export type SoilGridsCacheEntry = { storedAt: string; evidence: SoilGridsEvidence[] }
export type SoilGridsCache = {
  get(key: string): SoilGridsCacheEntry | undefined | Promise<SoilGridsCacheEntry | undefined>
  set(key: string, entry: SoilGridsCacheEntry): void | Promise<void>
}

export function createMemorySoilGridsCache(): SoilGridsCache {
  const store = new Map<string, SoilGridsCacheEntry>()
  return { get: (key) => store.get(key), set: (key, entry) => { store.set(key, entry) } }
}

export type SoilGridsFetch = (url: string, init?: { signal?: AbortSignal }) => Promise<{
  ok: boolean
  status: number
  json(): Promise<unknown>
}>

export type SoilGridsOptions = {
  fetchImpl: SoilGridsFetch
  cache?: SoilGridsCache
  now?: () => Date
  properties?: string[]
  depths?: string[]
  timeoutMs?: number
}

export function validateSoilGridsRequest(
  latitude: unknown, longitude: unknown, properties: readonly string[], depths: readonly string[],
): string[] {
  const issues: string[] = []
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) issues.push('Latitude must be a finite number in [-90, 90] (WGS84).')
  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) issues.push('Longitude must be a finite number in [-180, 180] (WGS84).')
  if (!properties.length) issues.push('At least one SoilGrids property is required.')
  for (const property of properties) if (!(SOILGRIDS_PROPERTIES as readonly string[]).includes(property)) issues.push(`Unsupported SoilGrids property: ${property}.`)
  if (!depths.length) issues.push('At least one SoilGrids depth is required.')
  for (const depth of depths) if (!(SOILGRIDS_DEPTHS as readonly string[]).includes(depth)) issues.push(`Unsupported SoilGrids depth: ${depth}.`)
  return issues
}

export function buildSoilGridsUrl(latitude: number, longitude: number, properties: readonly string[], depths: readonly string[]): string {
  const params = new URLSearchParams()
  params.append('lon', String(longitude))
  params.append('lat', String(latitude))
  for (const property of properties) params.append('property', property)
  for (const depth of depths) params.append('depth', depth)
  for (const value of REQUESTED_VALUES) params.append('value', value)
  return `${SOILGRIDS_BASE_URL}?${params.toString()}`
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

const LIMITATIONS = [
  'SoilGrids is a ~250 m modelled prior, not a measurement at the parcel.',
  'Indicative modelled regional screening only; not evidence of: ' + publicDataNonClaims.join('; ') + '.',
  'Applicability and accuracy for a specific use remain the user\'s responsibility (ISRIC data policy).',
]

function confidenceFor(u: SoilGridsUncertainty): SoilGridsEvidence['confidence'] {
  // Capped at MEDIUM: a global model prior never earns HIGH confidence.
  if (u.relativeIntervalWidth === null) return 'LOW'
  return u.relativeIntervalWidth <= 0.5 ? 'MEDIUM' : 'LOW'
}

function unknownEvidence(id: string, label: string, coverageLabel: string, reason: string, lineage: SourceLineage | null, property: string, depth: string, status: GeotechnicalEvidenceStatus = 'UNKNOWN'): SoilGridsEvidence {
  return {
    id, topic: 'soil-classification-properties', label, value: null, unit: null, status,
    method: 'MODELLED', scope: 'REGIONAL_SCREENING', confidence: 'UNKNOWN',
    coverage: { kind: 'POINT', label: coverageLabel, coverageGaps: [reason] },
    lineage, limitations: [reason, ...LIMITATIONS], validUntil: null,
    property, depth, uncertainty: { q05: null, q50: null, q95: null, relativeIntervalWidth: null },
  }
}

/** Parses a SoilGrids properties/query GeoJSON body. Unparseable layers become UNKNOWN, never zero. */
export function parseSoilGridsResponse(body: unknown, ctx: { latitude: number; longitude: number; sourceUri: string; retrievedAt: string }): SoilGridsEvidence[] | null {
  if (!isRecord(body) || !isRecord(body.properties) || !Array.isArray(body.properties.layers)) return null
  const coverageLabel = `SoilGrids ~250 m cell containing ${ctx.latitude}, ${ctx.longitude}`
  const lineage: SourceLineage = {
    sourceId: SOILGRIDS_SOURCE_ID, sourceUri: ctx.sourceUri, retrievedAt: ctx.retrievedAt,
    observationDate: null, publicationDate: null,
    transformationSteps: ['ISRIC REST properties/query (WGS84 point)', 'mapped value / d_factor -> target_units', 'Q0.05/Q0.5/Q0.95/mean retained as uncertainty'],
    inputChecksums: [],
  }
  const out: SoilGridsEvidence[] = []
  for (const layer of body.properties.layers) {
    if (!isRecord(layer) || typeof layer.name !== 'string' || !Array.isArray(layer.depths)) continue
    const name = layer.name
    const unitMeasure = isRecord(layer.unit_measure) ? layer.unit_measure : {}
    const dFactor = num(unitMeasure.d_factor)
    const targetUnit = typeof unitMeasure.target_units === 'string' && unitMeasure.target_units ? unitMeasure.target_units : null
    for (const d of layer.depths) {
      if (!isRecord(d) || typeof d.label !== 'string') continue
      const id = `soilgrids-${name}-${d.label}`
      const label = `${name} ${d.label} (SoilGrids modelled)`
      const values = isRecord(d.values) ? d.values : {}
      const raw = { q05: num(values['Q0.05']), q50: num(values['Q0.5']), q95: num(values['Q0.95']), mean: num(values.mean) }
      if (raw.mean === null) {
        out.push(unknownEvidence(id, label, coverageLabel, 'SoilGrids returned no value for this cell (masked, e.g. built-up or water, or outside model coverage).', lineage, name, d.label))
        continue
      }
      if (dFactor === null || dFactor <= 0 || targetUnit === null) {
        out.push(unknownEvidence(id, label, coverageLabel, 'SoilGrids unit metadata (d_factor/target_units) missing or invalid; value not converted.', lineage, name, d.label))
        continue
      }
      const conv = (v: number | null) => (v === null ? null : v / dFactor)
      const mean = raw.mean / dFactor
      const q05 = conv(raw.q05), q95 = conv(raw.q95)
      const relativeIntervalWidth = q05 !== null && q95 !== null && mean !== 0 ? (q95 - q05) / Math.abs(mean) : null
      const uncertainty: SoilGridsUncertainty = { q05, q50: conv(raw.q50), q95, relativeIntervalWidth }
      out.push({
        id, topic: 'soil-classification-properties', label, value: mean, unit: targetUnit,
        status: 'INDICATIVE', method: 'MODELLED', scope: 'REGIONAL_SCREENING',
        confidence: confidenceFor(uncertainty),
        coverage: { kind: 'POINT', label: coverageLabel, coverageGaps: ['250 m cell prediction; not parcel-scale'] },
        lineage,
        limitations: [
          ...(relativeIntervalWidth !== null && relativeIntervalWidth > 0.5 ? [`Wide 90% prediction interval (${q05}–${q95} ${targetUnit}); treat mean as weak.`] : []),
          ...LIMITATIONS,
        ],
        validUntil: null, property: name, depth: d.label, uncertainty,
      })
    }
  }
  return out
}

const cacheKey = (lat: number, lon: number, props: readonly string[], depths: readonly string[]) =>
  `soilgrids:${lat.toFixed(5)},${lon.toFixed(5)}:${[...props].sort().join('+')}:${[...depths].sort().join('+')}`

function result(outcome: SoilGridsOutcome, evidence: SoilGridsEvidence[], issues: string[], retrievedAt: string | null): SoilGridsResult {
  return { outcome, evidence, issues, attribution: SOILGRIDS_ATTRIBUTION, licence: SOILGRIDS_LICENCE, watermark: SOILGRIDS_WATERMARK, retrievedAt }
}

export async function fetchSoilGridsScreening(latitude: number, longitude: number, options: SoilGridsOptions): Promise<SoilGridsResult> {
  const properties = options.properties ?? DEFAULT_PROPERTIES
  const depths = options.depths ?? [...SOILGRIDS_DEPTHS]
  const issues = validateSoilGridsRequest(latitude, longitude, properties, depths)
  if (issues.length) return result('INVALID_INPUT', [], issues, null)

  const now = options.now ?? (() => new Date())
  const url = buildSoilGridsUrl(latitude, longitude, properties, depths)
  const key = cacheKey(latitude, longitude, properties, depths)
  const coverageLabel = `SoilGrids ~250 m cell containing ${latitude}, ${longitude}`
  const unknownAll = (reason: string, outcome: SoilGridsOutcome) => result(outcome, [
    unknownEvidence('soilgrids-unavailable', 'Soil properties (SoilGrids modelled)', coverageLabel, reason, null, 'all', 'all'),
  ], [reason], null)

  const fallback = async (reason: string): Promise<SoilGridsResult> => {
    let cached: SoilGridsCacheEntry | undefined
    try { cached = await options.cache?.get(key) } catch { cached = undefined }
    if (!cached || !cached.evidence.length) return unknownAll(`${reason}; no cached SoilGrids data available.`, 'UPSTREAM_UNAVAILABLE')
    const stale = cached.evidence.map((item): SoilGridsEvidence => item.status === 'UNKNOWN' ? item : {
      ...item, status: 'STALE UPSTREAM DATA', confidence: item.confidence === 'MEDIUM' ? 'LOW' : item.confidence,
      limitations: [`Cached SoilGrids response from ${cached!.storedAt}; upstream unavailable (${reason}). Refresh before use.`, ...item.limitations],
    })
    return result('STALE_CACHE', stale, [reason], cached.storedAt)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  let res: Awaited<ReturnType<SoilGridsFetch>>
  try {
    res = await options.fetchImpl(url, { signal: controller.signal })
  } catch (error) {
    return fallback(`SoilGrids request failed (${error instanceof Error ? error.message : 'network error'})`)
  } finally {
    clearTimeout(timer)
  }
  if (res.status >= 500 || res.status === 429) return fallback(`SoilGrids returned HTTP ${res.status}`)
  if (!res.ok) return unknownAll(`SoilGrids rejected the request (HTTP ${res.status}).`, 'UPSTREAM_REJECTED')

  let body: unknown
  try { body = await res.json() } catch { return fallback('SoilGrids returned a non-JSON body') }
  const retrievedAt = now().toISOString()
  const evidence = parseSoilGridsResponse(body, { latitude, longitude, sourceUri: url, retrievedAt })
  if (!evidence || !evidence.length) return fallback('SoilGrids response had an unexpected shape')

  if (evidence.every((item) => item.status === 'UNKNOWN')) {
    return result('NO_DATA', evidence, ['SoilGrids has no modelled value for this location (masked or non-soil cell).'], retrievedAt)
  }
  try { await options.cache?.set(key, { storedAt: retrievedAt, evidence }) } catch { /* cache is best-effort */ }
  return result('LIVE', evidence, [], retrievedAt)
}
