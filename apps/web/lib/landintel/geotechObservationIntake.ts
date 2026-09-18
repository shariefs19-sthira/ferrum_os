/**
 * Governed intake for project-specific geotechnical observations, and their
 * fusion with open-government regional context.
 *
 * Boundary: this module classifies and reconciles METADATA about
 * observations (borehole/log references, lab report metadata, groundwater
 * readings, coordinates/depths, provider and checksum). It never parses an
 * uploaded file, never calls a network source, and never derives an
 * allowable/ultimate bearing capacity, a foundation type or suitability
 * determination, or a legal/cadastral boundary — those remain a licensed
 * engineer's or surveyor's professional determination, out of scope here.
 *
 * Open-government regional layers (RegionalContextLayer) and site-specific
 * project observations (SiteObservationRecord) are kept in structurally
 * separate arrays everywhere in this module's public API — they are never
 * concatenated into one homogeneous list, and `fuseSiteAndRegionalEvidence`
 * throws if a caller crosses the two.
 */

export type ObservationClassification =
  | 'USER_PROVIDED'
  | 'SOURCE_VERIFIED'
  | 'INDICATIVE'
  | 'UNKNOWN'
  | 'STALE'

export type GeotechObservationKind =
  | 'BOREHOLE_LOG_REFERENCE'
  | 'LAB_REPORT_METADATA'
  | 'GROUNDWATER_OBSERVATION'

export type EvidenceBasis =
  | 'DIRECT_OBSERVATION'
  | 'LABORATORY_MEASUREMENT'
  | 'FIELD_ESTIMATE'

export type SiteCoordinate = {
  latitude: number
  longitude: number
  depthMetres: number | null
  horizontalCrs: string
  verticalDatum: string | null
}

export type ObservationProvider = {
  name: string
  role: string
  licenceOrAccreditation: string | null
}

export type GeotechObservationMeasurement = {
  parameter: string
  value: number | string | null
  unit: string | null
  depthMetres: number | null
}

export type GeotechObservationInput = {
  id: string
  kind: GeotechObservationKind
  referenceId: string
  fieldDate: string
  reportedAt: string
  evidenceBasis: EvidenceBasis
  coordinate: SiteCoordinate | null
  provider: ObservationProvider
  checksum: string
  narrative: string
  measurements: GeotechObservationMeasurement[]
}

export type IntakeIssue = { field: string; message: string }

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const SHA256 = /^[a-f0-9]{64}$/i

function parseIsoDate(value: string): number | null {
  if (!ISO_DATE.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const timestamp = Date.UTC(year, month - 1, day)
  const date = new Date(timestamp)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? timestamp
    : null
}

const FORBIDDEN_NARRATIVE_TERMS: RegExp[] = [
  /bearing capacity/i,
  /foundation suitab/i,
  /legal boundary/i,
  /cadastral boundary/i,
  /property boundary/i,
  /\btitle\b/i,
]

export function validateGeotechObservationInput(input: GeotechObservationInput, nowIso?: string): IntakeIssue[] {
  const issues: IntakeIssue[] = []
  if (!input.id.trim()) issues.push({ field: 'id', message: 'Observation ID is required.' })
  if (!input.referenceId.trim()) issues.push({ field: 'referenceId', message: 'Borehole/log/lab-report reference is required.' })
  const fieldDateMs = parseIsoDate(input.fieldDate)
  if (fieldDateMs === null) issues.push({ field: 'fieldDate', message: 'Field date must be a valid ISO date (YYYY-MM-DD).' })
  const reportedAtMs = parseIsoDate(input.reportedAt)
  if (reportedAtMs === null) issues.push({ field: 'reportedAt', message: 'Reported-at date must be a valid ISO date (YYYY-MM-DD).' })
  if (nowIso !== undefined) {
    const nowMs = parseIsoDate(nowIso)
    if (nowMs === null) {
      issues.push({ field: 'options.nowIso', message: 'Classification date must be a valid ISO date (YYYY-MM-DD).' })
    } else if (fieldDateMs !== null && fieldDateMs > nowMs) {
      issues.push({ field: 'fieldDate', message: 'Field date cannot be in the future.' })
    }
  }
  if (!SHA256.test(input.checksum)) issues.push({ field: 'checksum', message: 'A SHA-256 checksum of the source document is required.' })
  if (!input.provider.name.trim()) issues.push({ field: 'provider.name', message: 'Provider name is required.' })
  if (!input.provider.role.trim()) issues.push({ field: 'provider.role', message: 'Provider role is required.' })
  if (input.coordinate) {
    if (!input.coordinate.horizontalCrs.trim()) issues.push({ field: 'coordinate.horizontalCrs', message: 'Horizontal CRS is required when coordinates are supplied.' })
    if (!Number.isFinite(input.coordinate.latitude) || input.coordinate.latitude < -90 || input.coordinate.latitude > 90) {
      issues.push({ field: 'coordinate.latitude', message: 'Latitude must be finite and within -90 to 90 degrees.' })
    }
    if (!Number.isFinite(input.coordinate.longitude) || input.coordinate.longitude < -180 || input.coordinate.longitude > 180) {
      issues.push({ field: 'coordinate.longitude', message: 'Longitude must be finite and within -180 to 180 degrees.' })
    }
    if (input.coordinate.depthMetres !== null && (!Number.isFinite(input.coordinate.depthMetres) || input.coordinate.depthMetres < 0)) {
      issues.push({ field: 'coordinate.depthMetres', message: 'Depth must be finite and cannot be negative.' })
    }
  }
  for (const term of FORBIDDEN_NARRATIVE_TERMS) {
    if (term.test(input.narrative)) {
      issues.push({ field: 'narrative', message: `Observation narrative must not assert a conclusion this module does not derive (matched: ${term.source}).` })
    }
  }
  for (const measurement of input.measurements) {
    if (typeof measurement.value === 'number') {
      if (!Number.isFinite(measurement.value) || measurement.value < 0) {
        issues.push({ field: `measurements.${measurement.parameter}.value`, message: 'Numeric measurements must be finite and cannot be negative.' })
      }
      if (!measurement.unit) issues.push({ field: `measurements.${measurement.parameter}.unit`, message: 'Numeric measurements require a unit.' })
    }
    if (measurement.depthMetres !== null && (!Number.isFinite(measurement.depthMetres) || measurement.depthMetres < 0)) {
      issues.push({ field: `measurements.${measurement.parameter}.depthMetres`, message: 'Measurement depth must be finite and cannot be negative.' })
    }
  }
  return issues
}

export type ClassificationOptions = {
  nowIso: string
  staleAfterDays: number
  /** Provider identities the caller has already, independently verified elsewhere. This module performs no lookup itself. */
  verifiedProviderRegistry: string[]
}

export function validateClassificationOptions(options: ClassificationOptions): IntakeIssue[] {
  const issues: IntakeIssue[] = []
  if (parseIsoDate(options.nowIso) === null) {
    issues.push({ field: 'options.nowIso', message: 'Classification date must be a valid ISO date (YYYY-MM-DD).' })
  }
  if (!Number.isFinite(options.staleAfterDays) || options.staleAfterDays < 0) {
    issues.push({ field: 'options.staleAfterDays', message: 'Staleness threshold must be finite and cannot be negative.' })
  }
  return issues
}

function providerKey(provider: ObservationProvider): string {
  return `${provider.name.trim().toLowerCase()}|${(provider.licenceOrAccreditation ?? '').trim().toLowerCase()}`
}

/**
 * Priority: an input that fails validation cannot be classified at all
 * (UNKNOWN). Age then overrides provenance (STALE), since a stale reading
 * is unsafe to rely on regardless of who supplied it. A field estimate is
 * INDICATIVE even from a verified provider, since it is not a direct or
 * laboratory measurement. Otherwise, a verified provider earns
 * SOURCE_VERIFIED; anything else well-formed defaults to USER_PROVIDED.
 */
export function classifyObservation(input: GeotechObservationInput, options: ClassificationOptions): ObservationClassification {
  if (validateGeotechObservationInput(input, options.nowIso).length > 0 || validateClassificationOptions(options).length > 0) return 'UNKNOWN'

  const fieldDateMs = parseIsoDate(input.fieldDate)
  const nowMs = parseIsoDate(options.nowIso)
  if (fieldDateMs === null || nowMs === null) return 'UNKNOWN'

  const ageDays = (nowMs - fieldDateMs) / (1000 * 60 * 60 * 24)
  if (ageDays > options.staleAfterDays) return 'STALE'

  if (input.evidenceBasis === 'FIELD_ESTIMATE') return 'INDICATIVE'

  const key = providerKey(input.provider)
  if (options.verifiedProviderRegistry.some((entry) => entry.trim().toLowerCase() === key)) return 'SOURCE_VERIFIED'

  return 'USER_PROVIDED'
}

export type SiteObservationRecord = {
  input: GeotechObservationInput
  classification: ObservationClassification
  issues: IntakeIssue[]
  scope: 'SITE_OBSERVATION'
}

export function intakeSiteObservation(input: GeotechObservationInput, options: ClassificationOptions): SiteObservationRecord {
  const issues = [
    ...validateGeotechObservationInput(input, options.nowIso),
    ...validateClassificationOptions(options),
  ]
  return {
    input,
    classification: classifyObservation(input, options),
    issues,
    scope: 'SITE_OBSERVATION',
  }
}

export type RegionalContextTopic =
  | 'regional-geology'
  | 'regional-groundwater-zone'
  | 'regional-seismic-zone'
  | 'regional-soil-map'

/** Regional data can never itself be USER_PROVIDED — it is not a project submission. */
const REGIONAL_ALLOWED_CLASSIFICATIONS: ObservationClassification[] = ['INDICATIVE', 'SOURCE_VERIFIED', 'UNKNOWN', 'STALE']

export type RegionalContextLayer = {
  id: string
  topic: RegionalContextTopic
  authority: string
  jurisdiction: string
  sourceUri: string
  publishedAt: string | null
  retrievedAt: string | null
  classification: ObservationClassification
  scope: 'REGIONAL_OPEN_GOVERNMENT'
  screeningNote: string
}

export function validateRegionalContextLayer(layer: RegionalContextLayer): IntakeIssue[] {
  const issues: IntakeIssue[] = []
  if (!layer.id.trim()) issues.push({ field: 'id', message: 'Regional layer ID is required.' })
  if (!layer.authority.trim()) issues.push({ field: 'authority', message: 'Authority is required.' })
  if (!/^https:\/\//.test(layer.sourceUri)) issues.push({ field: 'sourceUri', message: 'Source URI must be an https reference.' })
  if (!REGIONAL_ALLOWED_CLASSIFICATIONS.includes(layer.classification)) {
    issues.push({ field: 'classification', message: 'Regional context cannot be classified USER_PROVIDED; it is not a project submission.' })
  }
  if (!layer.screeningNote.trim()) {
    issues.push({ field: 'screeningNote', message: 'A screening note is required, stating this layer never establishes bearing capacity, foundation suitability or a legal boundary.' })
  }
  return issues
}

export type DownstreamTarget = 'DesignStudio' | 'Structura' | 'BOQ'
export type DownstreamAction = 'RECHECK' | 'HOLD'

export type DownstreamImpact = {
  target: DownstreamTarget
  action: DownstreamAction
  reason: string
  observationId: string
}

export function computeDownstreamImpacts(
  siteObservations: SiteObservationRecord[],
  regionalContext: RegionalContextLayer[],
): DownstreamImpact[] {
  const impacts: DownstreamImpact[] = []

  for (const record of siteObservations) {
    const id = record.input.id
    if (record.classification === 'UNKNOWN' || record.issues.length > 0) {
      impacts.push({ target: 'DesignStudio', action: 'HOLD', reason: `Observation ${id} has invalid intake metadata and cannot ground a design input.`, observationId: id })
      impacts.push({ target: 'Structura', action: 'HOLD', reason: `Observation ${id} has invalid intake metadata; structural parameters relying on it are held.`, observationId: id })
      impacts.push({ target: 'BOQ', action: 'HOLD', reason: `Observation ${id} has invalid intake metadata; quantities relying on it are held.`, observationId: id })
      continue
    }
    if (record.classification === 'STALE') {
      impacts.push({ target: 'DesignStudio', action: 'RECHECK', reason: `Observation ${id} is older than the staleness threshold; recheck before reuse.`, observationId: id })
      impacts.push({ target: 'Structura', action: 'RECHECK', reason: `Observation ${id} is stale; recheck structural assumptions before reuse.`, observationId: id })
    }
    if (record.classification === 'INDICATIVE') {
      impacts.push({ target: 'BOQ', action: 'RECHECK', reason: `Observation ${id} is a field estimate, not a laboratory or direct measurement; recheck quantities before commitment.`, observationId: id })
    }
  }

  for (const layer of regionalContext) {
    if (layer.classification === 'UNKNOWN' || layer.classification === 'STALE') {
      impacts.push({
        target: 'DesignStudio',
        action: 'RECHECK',
        reason: `Regional layer ${layer.id} (${layer.topic}) is ${layer.classification.toLowerCase()}; it never substitutes for site-specific evidence.`,
        observationId: layer.id,
      })
    }
  }

  return impacts
}

export const prohibitedGeotechConclusions = [
  'Allowable or ultimate bearing capacity',
  'Foundation type or suitability determination',
  'Legal or cadastral property boundary',
] as const

export type GeotechIntakeFusionReport = {
  siteObservations: SiteObservationRecord[]
  regionalContext: RegionalContextLayer[]
  downstreamImpacts: DownstreamImpact[]
  classificationCounts: Record<ObservationClassification, number>
  prohibitedConclusions: readonly string[]
}

function emptyClassificationCounts(): Record<ObservationClassification, number> {
  return { USER_PROVIDED: 0, SOURCE_VERIFIED: 0, INDICATIVE: 0, UNKNOWN: 0, STALE: 0 }
}

/**
 * Reconciles governed site observations with open-government regional
 * context without ever merging them into a single evidence list. Throws if
 * a record's declared `scope` doesn't match the array it was passed in —
 * the one place this module actively refuses to let the two mix.
 */
export function fuseSiteAndRegionalEvidence(
  siteObservations: SiteObservationRecord[],
  regionalContext: RegionalContextLayer[],
): GeotechIntakeFusionReport {
  for (const record of siteObservations) {
    if (record.scope !== 'SITE_OBSERVATION') {
      throw new Error(`Record ${record.input.id} is not scoped as a site observation; site and regional evidence must never share one list.`)
    }
  }
  for (const layer of regionalContext) {
    if (layer.scope !== 'REGIONAL_OPEN_GOVERNMENT') {
      throw new Error(`Layer ${layer.id} is not scoped as regional open-government context; site and regional evidence must never share one list.`)
    }
  }

  const classificationCounts = emptyClassificationCounts()
  for (const record of siteObservations) classificationCounts[record.classification] += 1
  for (const layer of regionalContext) classificationCounts[layer.classification] += 1

  return {
    siteObservations,
    regionalContext,
    downstreamImpacts: computeDownstreamImpacts(siteObservations, regionalContext),
    classificationCounts,
    prohibitedConclusions: prohibitedGeotechConclusions,
  }
}
