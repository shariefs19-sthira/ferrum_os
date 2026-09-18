/**
 * Canonical LandIntel geotechnical evidence contracts.
 *
 * Regional/public layers are screening evidence. They cannot establish a
 * project bearing capacity, settlement, foundation design or excavation
 * method without a project investigation and accountable interpretation.
 */

export type GeotechnicalEvidenceStatus =
  | 'SOURCE-VERIFIED'
  | 'USER-PROVIDED'
  | 'INDICATIVE'
  | 'INFERRED'
  | 'UNKNOWN'
  | 'STALE UPSTREAM DATA'
  | 'CONFLICT'

export type GeotechnicalEvidenceMethod = 'OBSERVED' | 'INFERRED' | 'MODELLED' | 'PROFESSIONAL_INTERPRETATION'

export type GeotechnicalTopic =
  | 'terrain-slope'
  | 'regional-geology-lithology'
  | 'soil-classification-properties'
  | 'groundwater'
  | 'flood-drainage'
  | 'seismic-hazard'
  | 'landslide'
  | 'subsidence'
  | 'karst'
  | 'liquefaction'
  | 'contamination'
  | 'radon'
  | 'boreholes'
  | 'cpt-spt'
  | 'laboratory-tests'
  | 'bearing-settlement-inputs'
  | 'foundation-constraints'
  | 'excavation-retaining'
  | 'dewatering'
  | 'aggressivity-corrosion'

export type SpatialCoverage = {
  kind: 'GLOBAL' | 'COUNTRY' | 'REGION' | 'POLYGON' | 'POINT' | 'UNKNOWN'
  label: string
  geometryRef?: string
  coverageGaps: string[]
}

export type SourceLineage = {
  sourceId: string
  sourceUri: string
  retrievedAt: string | null
  observationDate: string | null
  publicationDate: string | null
  transformationSteps: string[]
  inputChecksums: string[]
}

export type GeotechnicalEvidence<T = string | number | null> = {
  id: string
  topic: GeotechnicalTopic
  label: string
  value: T
  unit: string | null
  status: GeotechnicalEvidenceStatus
  method: GeotechnicalEvidenceMethod
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
  coverage: SpatialCoverage
  lineage: SourceLineage | null
  limitations: string[]
  validUntil: string | null
}

export type GovernmentSourceDefinition = {
  id: string
  authority: string
  jurisdiction: string
  title: string
  uri: string
  licence: string
  topics: GeotechnicalTopic[]
  evidenceMethods: GeotechnicalEvidenceMethod[]
  publishedResolutionOrScale: string
  temporalMetadata: 'SOURCE_PROVIDED' | 'MUST_BE_CAPTURED_AT_INGEST' | 'UNKNOWN'
  declaredCoverage: SpatialCoverage
  connectorState: 'DECLARATIVE ONLY' | 'CONNECTED' | 'SUSPENDED'
  screeningBoundary: string
}

export const governmentGeotechnicalSources: GovernmentSourceDefinition[] = [
  {
    id: 'us-usgs-ngmdb',
    authority: 'United States Geological Survey',
    jurisdiction: 'US',
    title: 'National Geologic Map Database',
    uri: 'https://ngmdb.usgs.gov/ngmdb/ngmdb_home.html',
    licence: 'Verify the licence and attribution of each underlying publication at ingest',
    topics: ['regional-geology-lithology', 'landslide', 'karst', 'subsidence'],
    evidenceMethods: ['OBSERVED', 'MODELLED'],
    publishedResolutionOrScale: 'Varies by source map; capture per record',
    temporalMetadata: 'SOURCE_PROVIDED',
    declaredCoverage: { kind: 'COUNTRY', label: 'United States; record-level coverage varies', coverageGaps: ['Not a uniform site-investigation dataset'] },
    connectorState: 'DECLARATIVE ONLY',
    screeningBoundary: 'Regional geology and hazard screening only; consult the detailed source publication and project investigation.',
  },
  {
    id: 'us-usgs-3dep',
    authority: 'United States Geological Survey',
    jurisdiction: 'US',
    title: '3D Elevation Program',
    uri: 'https://www.usgs.gov/3d-elevation-program/about-3dep-products-services',
    licence: 'USGS describes 3DEP products as public domain; retain product metadata and verify the selected work unit',
    topics: ['terrain-slope', 'flood-drainage', 'landslide'],
    evidenceMethods: ['OBSERVED', 'MODELLED'],
    publishedResolutionOrScale: 'Varies by product/work unit; capture source resolution and quality level',
    temporalMetadata: 'SOURCE_PROVIDED',
    declaredCoverage: { kind: 'COUNTRY', label: 'United States; product and quality coverage varies', coverageGaps: ['Work-unit quality and acquisition date must be checked'] },
    connectorState: 'DECLARATIVE ONLY',
    screeningBoundary: 'Elevation evidence does not establish subsurface soil, rock, groundwater or foundation conditions.',
  },
  {
    id: 'us-fema-nfhl',
    authority: 'Federal Emergency Management Agency',
    jurisdiction: 'US',
    title: 'National Flood Hazard Layer',
    uri: 'https://msc.fema.gov/portal/advanceSearch',
    licence: 'Verify FEMA terms, effective map date and community adoption at ingest',
    topics: ['flood-drainage'],
    evidenceMethods: ['MODELLED'],
    publishedResolutionOrScale: 'Varies by flood study and effective map panel',
    temporalMetadata: 'SOURCE_PROVIDED',
    declaredCoverage: { kind: 'COUNTRY', label: 'United States; mapped-community coverage varies', coverageGaps: ['Unmapped and pending-change areas may exist'] },
    connectorState: 'DECLARATIVE ONLY',
    screeningBoundary: 'Flood-screening evidence only; effective local studies and current site levels control project decisions.',
  },
  {
    id: 'gb-bgs-geoindex',
    authority: 'British Geological Survey',
    jurisdiction: 'GB',
    title: 'BGS GeoIndex',
    uri: 'https://mapapps2.bgs.ac.uk/geoindex/home.html',
    licence: 'Dataset-specific BGS licence must be resolved before ingestion or redistribution',
    topics: ['regional-geology-lithology', 'boreholes', 'groundwater', 'landslide', 'subsidence', 'karst', 'radon'],
    evidenceMethods: ['OBSERVED', 'MODELLED'],
    publishedResolutionOrScale: 'Layer-specific; capture map scale and borehole metadata',
    temporalMetadata: 'SOURCE_PROVIDED',
    declaredCoverage: { kind: 'COUNTRY', label: 'Great Britain; layer and borehole coverage varies', coverageGaps: ['Index presence does not guarantee an accessible investigation record'] },
    connectorState: 'DECLARATIVE ONLY',
    screeningBoundary: 'Regional/index information is not a substitute for site-specific investigation or professional interpretation.',
  },
  {
    id: 'in-gsi-bhukosh',
    authority: 'Geological Survey of India',
    jurisdiction: 'IN',
    title: 'Bhukosh geoscientific portal',
    uri: 'https://bhukosh.gsi.gov.in/Bhukosh/Public',
    licence: 'Verify layer-specific access, licence, attribution and reuse terms at ingest',
    topics: ['regional-geology-lithology', 'landslide', 'seismic-hazard'],
    evidenceMethods: ['OBSERVED', 'MODELLED'],
    publishedResolutionOrScale: 'Layer-specific; capture the source map and scale',
    temporalMetadata: 'SOURCE_PROVIDED',
    declaredCoverage: { kind: 'COUNTRY', label: 'India; layer coverage varies', coverageGaps: ['No uniform parcel-scale geotechnical coverage is asserted'] },
    connectorState: 'DECLARATIVE ONLY',
    screeningBoundary: 'National/regional geoscience screening only; project investigation remains required.',
  },
]

export type CoordinateReference = {
  eastingOrLongitude: number
  northingOrLatitude: number
  horizontalCrs: string
  groundLevel: number | null
  verticalDatum: string | null
}

export type ProjectGeotechnicalInputKind =
  | 'GEOTECHNICAL_REPORT'
  | 'BOREHOLE_LOG'
  | 'CPT_RESULT'
  | 'SPT_RESULT'
  | 'LAB_TEST'
  | 'GROUNDWATER_READING'
  | 'PROFESSIONAL_INTERPRETATION'

export type ProjectGeotechnicalInput = {
  id: string
  kind: ProjectGeotechnicalInputKind
  title: string
  fileName: string | null
  issueDate: string
  responsibleParty: string
  professionalRole: string
  coordinates: CoordinateReference | null
  units: Record<string, string>
  sourceRevision: string
  checksum: string
  observations: GeotechnicalEvidence[]
  status: 'USER-PROVIDED'
}

export type InputValidationIssue = { field: string; message: string }

export function validateProjectGeotechnicalInput(input: ProjectGeotechnicalInput): InputValidationIssue[] {
  const issues: InputValidationIssue[] = []
  if (!input.id.trim()) issues.push({ field: 'id', message: 'Input ID is required.' })
  if (!input.title.trim()) issues.push({ field: 'title', message: 'Title is required.' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.issueDate)) issues.push({ field: 'issueDate', message: 'Use an ISO issue date (YYYY-MM-DD).' })
  if (!input.responsibleParty.trim()) issues.push({ field: 'responsibleParty', message: 'Responsible party is required.' })
  if (!input.professionalRole.trim()) issues.push({ field: 'professionalRole', message: 'Professional role is required.' })
  if (!input.sourceRevision.trim()) issues.push({ field: 'sourceRevision', message: 'Source revision is required.' })
  if (!/^[a-f0-9]{64}$/i.test(input.checksum)) issues.push({ field: 'checksum', message: 'A SHA-256 checksum is required.' })
  if (input.coordinates && !input.coordinates.horizontalCrs.trim()) issues.push({ field: 'coordinates.horizontalCrs', message: 'Horizontal CRS is required when coordinates are supplied.' })
  if (input.coordinates?.groundLevel !== null && input.coordinates && !input.coordinates.verticalDatum) issues.push({ field: 'coordinates.verticalDatum', message: 'Vertical datum is required when a ground level is supplied.' })
  for (const observation of input.observations) {
    if (observation.status !== 'USER-PROVIDED') issues.push({ field: `observations.${observation.id}.status`, message: 'Uploaded observations remain USER-PROVIDED until independently verified.' })
    if (observation.value !== null && typeof observation.value === 'number' && !observation.unit) issues.push({ field: `observations.${observation.id}.unit`, message: 'Numeric observations require units.' })
  }
  return issues
}

export const geotechnicalTopicLabels: Record<GeotechnicalTopic, string> = {
  'terrain-slope': 'Terrain and slope',
  'regional-geology-lithology': 'Regional geology and lithology',
  'soil-classification-properties': 'Soil classification and properties',
  groundwater: 'Groundwater',
  'flood-drainage': 'Flood and drainage',
  'seismic-hazard': 'Seismic hazard',
  landslide: 'Landslide',
  subsidence: 'Subsidence',
  karst: 'Karst',
  liquefaction: 'Liquefaction',
  contamination: 'Contamination',
  radon: 'Radon',
  boreholes: 'Boreholes',
  'cpt-spt': 'CPT and SPT',
  'laboratory-tests': 'Laboratory testing',
  'bearing-settlement-inputs': 'Bearing and settlement inputs',
  'foundation-constraints': 'Foundation constraints',
  'excavation-retaining': 'Excavation and retaining',
  dewatering: 'Dewatering',
  'aggressivity-corrosion': 'Chemical aggressivity and corrosion',
}

export type GeotechnicalAssessment = {
  evidence: GeotechnicalEvidence[]
  coveragePercent: number
  constraintCount: number
  holds: string[]
  downstreamInvalidations: Array<'DesignStudio' | 'Structures' | 'Foundations' | 'BOQ'>
  suitability: 'SCREENING ONLY' | 'CONDITIONAL' | 'BLOCKED'
}

const criticalProjectTopics: GeotechnicalTopic[] = [
  'soil-classification-properties', 'groundwater', 'boreholes', 'cpt-spt',
  'laboratory-tests', 'bearing-settlement-inputs', 'foundation-constraints',
]

export function assessGeotechnicalEvidence(evidence: GeotechnicalEvidence[]): GeotechnicalAssessment {
  const uniqueTopics = new Set(evidence.filter((item) => item.status !== 'UNKNOWN').map((item) => item.topic))
  const coveragePercent = Math.round((uniqueTopics.size / Object.keys(geotechnicalTopicLabels).length) * 100)
  const conflict = evidence.some((item) => item.status === 'CONFLICT')
  const stale = evidence.some((item) => item.status === 'STALE UPSTREAM DATA')
  const missingCritical = criticalProjectTopics.filter((topic) => !evidence.some((item) => item.topic === topic && ['USER-PROVIDED', 'SOURCE-VERIFIED'].includes(item.status)))
  const holds = [
    ...(conflict ? ['Resolve conflicting evidence before site or foundation decisions.'] : []),
    ...(stale ? ['Refresh stale upstream evidence and recompute affected outputs.'] : []),
    ...(missingCritical.length ? [`Project investigation evidence required: ${missingCritical.map((topic) => geotechnicalTopicLabels[topic]).join(', ')}.`] : []),
  ]
  const invalidations = new Set<GeotechnicalAssessment['downstreamInvalidations'][number]>()
  if (conflict || stale || missingCritical.length) {
    invalidations.add('Structures')
    invalidations.add('Foundations')
    invalidations.add('BOQ')
  }
  if (conflict || stale || missingCritical.includes('groundwater') || missingCritical.includes('foundation-constraints')) invalidations.add('DesignStudio')
  return {
    evidence,
    coveragePercent,
    constraintCount: evidence.filter((item) => item.status === 'CONFLICT' || item.limitations.length > 0).length,
    holds,
    downstreamInvalidations: Array.from(invalidations),
    suitability: conflict ? 'BLOCKED' : missingCritical.length || stale ? 'SCREENING ONLY' : 'CONDITIONAL',
  }
}

export function createUnknownGeotechnicalScreening(): GeotechnicalAssessment {
  const topics = Object.keys(geotechnicalTopicLabels) as GeotechnicalTopic[]
  return assessGeotechnicalEvidence(topics.map((topic) => ({
    id: `unknown-${topic}`,
    topic,
    label: geotechnicalTopicLabels[topic],
    value: null,
    unit: null,
    status: 'UNKNOWN',
    method: 'MODELLED',
    confidence: 'UNKNOWN',
    coverage: { kind: 'UNKNOWN', label: 'No source connected', coverageGaps: ['Parcel coverage is unverified'] },
    lineage: null,
    limitations: ['No source-qualified evidence loaded'],
    validUntil: null,
  })))
}

export const projectInputChecklist = [
  'Geotechnical investigation report with responsible professional and issue revision',
  'Georeferenced borehole logs and ground levels with horizontal CRS and vertical datum',
  'CPT/SPT field records and laboratory schedules with methods, units and sample depths',
  'Seasonal groundwater observations and monitoring dates',
  'Professional ground model, design parameters and stated limitations',
] as const

export const publicDataNonClaims = [
  'Allowable bearing capacity or foundation type',
  'Total or differential settlement',
  'Excavation support, dewatering or temporary-works design',
  'Absence of contamination, cavities, buried obstructions or local weak strata',
] as const
