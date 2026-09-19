/**
 * Shared evidence model for LandIntel's pre-design SITE ANALYSIS workspace:
 * five modules (climate, physical/geotechnical, urban/contextual,
 * infrastructure/circulation, cultural/historical/socioeconomic) that all
 * capture the same governed observation record and roll up into one
 * reviewable synthesis.
 *
 * Boundary: this module classifies and reconciles METADATA about site
 * observations a person supplies. It never fetches a source, never derives a
 * measurement, and never draws a legal conclusion. Nothing here can raise a
 * record to "verified" -- verification is a professional gate (site visit,
 * survey, geotechnical interpretation, local-authority check) this workspace
 * only lists as OPEN. A map point and OSM buildings are context, never
 * evidence of a boundary, level, setback or heritage status.
 */

export type SiteModuleId = 'climate' | 'physical' | 'urban' | 'infrastructure' | 'cultural'
export type ObservationBasis = 'OBSERVED' | 'INFERRED' | 'USER_PROVIDED'
export type ObservationConfidence = 'HIGH' | 'MEDIUM' | 'LOW'
export type LocationSource = 'ENTERED' | 'MAP_POINT_CONTEXT' | 'DEVICE'
export type TopicGeometry = 'point' | 'directional' | 'document'
export type GateId = 'site-visit' | 'survey' | 'geotechnical' | 'authority'

export type SiteModule = { id: SiteModuleId; label: string; short: string; summary: string }

export const siteModules: SiteModule[] = [
  { id: 'climate', label: 'Climate & environment', short: 'Climate', summary: 'Dated regional climate evidence, on-site observations, sun orientation and shadow, wind and microclimate slots.' },
  { id: 'physical', label: 'Physical & geotechnical', short: 'Physical', summary: 'Surveyed terrain and contours, soil logs, hydrology, trees and ecology.' },
  { id: 'urban', label: 'Urban & contextual', short: 'Urban', summary: 'Adjacent buildings, statutory setbacks and envelopes, views, privacy and noise.' },
  { id: 'infrastructure', label: 'Infrastructure & circulation', short: 'Infrastructure', summary: 'Pedestrian, vehicle and service entry, roads and transit, utilities and rights-of-way.' },
  { id: 'cultural', label: 'Cultural, historical & socioeconomic', short: 'Cultural', summary: 'Heritage and archaeology constraints and observed community use.' },
]

export type ProfessionalGate = { id: GateId; label: string; requirement: string }

export const professionalGates: ProfessionalGate[] = [
  { id: 'site-visit', label: 'Professional site visit', requirement: 'A qualified professional inspects the site in person; a desk record or user note never substitutes.' },
  { id: 'survey', label: 'Licensed survey', requirement: 'A licensed surveyor establishes boundary, levels and contours; a map point or OSM footprint never substitutes.' },
  { id: 'geotechnical', label: 'Geotechnical interpretation', requirement: 'A licensed geotechnical engineer interprets soil logs; this workspace never derives bearing capacity or foundation suitability.' },
  { id: 'authority', label: 'Local-authority verification', requirement: 'The competent authority or utility provider confirms zoning, setbacks, heritage, rights-of-way and connections in writing.' },
]

export type SiteTopic = {
  id: string
  module: SiteModuleId
  label: string
  geometry: TopicGeometry
  /** Direction wording when a bearing is captured, so an arrow is never ambiguous. */
  bearingMeaning: string | null
  gates: GateId[]
  staleAfterDays: number
  /** Soil logs already have a governed metadata intake on the Land tab; this workspace never opens a second capture path for them. */
  delegatedTo: string | null
  /** The connector or source this topic still needs before any of it can be automated. */
  pendingConnector: string
  /** A deterministic computation (not a measurement) the diagram can draw for this topic. */
  computed: 'SUN_GEOMETRY' | null
}

const DAY_STALE = 365
const DOC_STALE = 1825

export const siteTopics: SiteTopic[] = [
  { id: 'regional-climate', module: 'climate', label: 'Regional climate (dated)', geometry: 'document', bearingMeaning: null, gates: [], staleAfterDays: DOC_STALE, delegatedTo: null, pendingConnector: 'Source-dated regional climate-normals connector (station series with publisher and period) — not connected.', computed: null },
  { id: 'site-climate', module: 'climate', label: 'Site climate observation', geometry: 'point', bearingMeaning: null, gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'No on-site sensor or logger feed connected; manual dated observations only.', computed: null },
  { id: 'sun-orientation', module: 'climate', label: 'Sun orientation', geometry: 'directional', bearingMeaning: 'compass-observed sun direction', gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Sun geometry is COMPUTED from the map point; on-site compass and obstruction checks are not connected.', computed: 'SUN_GEOMETRY' },
  { id: 'shadow', module: 'climate', label: 'Shadow', geometry: 'directional', bearingMeaning: 'shadow falls toward', gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Shadow study needs surveyed building heights and terrain — not connected; no shadow is simulated.', computed: null },
  { id: 'wind', module: 'climate', label: 'Wind', geometry: 'directional', bearingMeaning: 'wind comes from', gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Dated wind-rose source or anemometer log — not connected; no wind is modelled.', computed: null },
  { id: 'microclimate', module: 'climate', label: 'Microclimate', geometry: 'point', bearingMeaning: null, gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'No microclimate measurement source connected; manual dated observations only.', computed: null },

  { id: 'terrain-contours', module: 'physical', label: 'Surveyed terrain & contours', geometry: 'document', bearingMeaning: null, gates: ['survey'], staleAfterDays: DOC_STALE, delegatedTo: null, pendingConnector: 'Licensed topographic survey or DTM upload with CRS, datum and accuracy — not connected; no contour is drawn or inferred.', computed: null },
  { id: 'soil-logs', module: 'physical', label: 'Soil logs', geometry: 'document', bearingMeaning: null, gates: ['geotechnical'], staleAfterDays: DOC_STALE, delegatedTo: 'Land → Geotechnical observation intake', pendingConnector: 'The Land-tab geotechnical intake validates borehole metadata but does not yet persist into this synthesis.', computed: null },
  { id: 'hydrology', module: 'physical', label: 'Hydrology & drainage', geometry: 'directional', bearingMeaning: 'water flows toward', gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Hydrologically conditioned terrain and rainfall record — not connected; no flow path is computed.', computed: null },
  { id: 'trees-ecology', module: 'physical', label: 'Trees & ecology', geometry: 'point', bearingMeaning: null, gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Tree survey or ecological-constraint register — not connected.', computed: null },

  { id: 'adjacent-buildings', module: 'urban', label: 'Adjacent buildings', geometry: 'point', bearingMeaning: null, gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'OSM footprints are context only (no verified height, use or boundary); a surveyed context record is not connected.', computed: null },
  { id: 'statutory-envelope', module: 'urban', label: 'Statutory setbacks & envelope', geometry: 'document', bearingMeaning: null, gates: ['authority'], staleAfterDays: DOC_STALE, delegatedTo: null, pendingConnector: 'Authority development-control record with clause citation — not connected; no setback is asserted.', computed: null },
  { id: 'views-privacy', module: 'urban', label: 'Views & privacy', geometry: 'directional', bearingMeaning: 'view or overlooking toward', gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'No line-of-sight analysis connected; manual dated observations only.', computed: null },
  { id: 'noise', module: 'urban', label: 'Noise', geometry: 'directional', bearingMeaning: 'noise source lies toward', gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'No calibrated sound-level measurement connected; no noise level or propagation is stated.', computed: null },

  { id: 'pedestrian-entry', module: 'infrastructure', label: 'Pedestrian entry', geometry: 'directional', bearingMeaning: 'entry faces', gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Not connected; manual dated observation only.', computed: null },
  { id: 'vehicle-entry', module: 'infrastructure', label: 'Vehicle entry', geometry: 'directional', bearingMeaning: 'entry faces', gates: ['site-visit', 'authority'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Road-frontage and permitted-access record from the authority — not connected.', computed: null },
  { id: 'service-entry', module: 'infrastructure', label: 'Service entry', geometry: 'directional', bearingMeaning: 'entry faces', gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Not connected; manual dated observation only.', computed: null },
  { id: 'roads-transit', module: 'infrastructure', label: 'Roads & transit', geometry: 'point', bearingMeaning: null, gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Official road-width register and transit-stop registry with routed distance — not connected.', computed: null },
  { id: 'water', module: 'infrastructure', label: 'Water supply', geometry: 'point', bearingMeaning: null, gates: ['authority'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Utility-provider connection record — not connected; availability is not asserted.', computed: null },
  { id: 'power', module: 'infrastructure', label: 'Power', geometry: 'point', bearingMeaning: null, gates: ['authority'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Utility-provider connection record — not connected; availability is not asserted.', computed: null },
  { id: 'gas', module: 'infrastructure', label: 'Gas', geometry: 'point', bearingMeaning: null, gates: ['authority'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Utility-provider connection record — not connected; availability is not asserted.', computed: null },
  { id: 'telecom', module: 'infrastructure', label: 'Telecom', geometry: 'point', bearingMeaning: null, gates: ['authority'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Provider coverage or duct record — not connected.', computed: null },
  { id: 'sewer', module: 'infrastructure', label: 'Sewer & drainage connection', geometry: 'point', bearingMeaning: null, gates: ['authority'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'Utility-provider connection record — not connected; buried services are never inferred.', computed: null },
  { id: 'rights-of-way', module: 'infrastructure', label: 'Rights-of-way & easements', geometry: 'document', bearingMeaning: null, gates: ['authority', 'survey'], staleAfterDays: DOC_STALE, delegatedTo: null, pendingConnector: 'Recorded easement or right-of-way deed — not connected; no legal right of way is asserted.', computed: null },

  { id: 'heritage', module: 'cultural', label: 'Heritage constraints', geometry: 'document', bearingMeaning: null, gates: ['authority'], staleAfterDays: DOC_STALE, delegatedTo: null, pendingConnector: 'Heritage-authority listing check — not connected; absence of a record is never treated as "not heritage".', computed: null },
  { id: 'archaeology', module: 'cultural', label: 'Archaeology constraints', geometry: 'document', bearingMeaning: null, gates: ['authority'], staleAfterDays: DOC_STALE, delegatedTo: null, pendingConnector: 'Archaeological-authority protected-area check — not connected.', computed: null },
  { id: 'community-use', module: 'cultural', label: 'Observed community use', geometry: 'point', bearingMeaning: null, gates: ['site-visit'], staleAfterDays: DAY_STALE, delegatedTo: null, pendingConnector: 'No census or footfall source connected; manual dated observations only.', computed: null },
]

export const topicById = (id: string): SiteTopic | undefined => siteTopics.find((topic) => topic.id === id)
export const topicsForModule = (module: SiteModuleId): SiteTopic[] => siteTopics.filter((topic) => topic.module === module)

export type SiteObservation = {
  id: string
  parcelKey: string
  module: SiteModuleId
  topic: string
  basis: ObservationBasis
  confidence: ObservationConfidence
  observedOn: string
  observer: string
  sourceRef: string
  location: { lat: number; lng: number } | null
  locationSource: LocationSource | null
  bearingDeg: number | null
  note: string
  createdAt: string
}

export type IntakeIssue = { field: string; message: string }

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 86_400_000
export const NOTE_MAX = 400

export function parseIsoDate(value: string): number | null {
  if (!ISO_DATE.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const timestamp = Date.UTC(year, month - 1, day)
  const date = new Date(timestamp)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? timestamp : null
}

/** Conclusions this workspace never records; they need a professional or authority determination. */
const FORBIDDEN_NOTE_TERMS: RegExp[] = [
  /bearing capacity/i,
  /foundation suitab/i,
  /(legal|cadastral|property) boundary/i,
  /\btitle\b/i,
  /\bcompl(y|ies|iant|iance)\b/i,
  /\bapproved\b/i,
  /\bno (heritage|archaeolog\w*|risk|flood)/i,
  /\bnot (a )?(heritage|protected)\b/i,
  /heritage[- ]clear/i,
  /safe to build/i,
]

/** Topics that are evidenced by a document, so they can never be an on-site OBSERVED record. */
export const isDocumentTopic = (topic: SiteTopic): boolean => topic.geometry === 'document'

export function validateObservation(input: SiteObservation, nowIso: string): IntakeIssue[] {
  const issues: IntakeIssue[] = []
  const topic = topicById(input.topic)
  if (!topic) issues.push({ field: 'topic', message: 'Choose a topic in this module.' })
  else if (topic.module !== input.module) issues.push({ field: 'topic', message: 'Topic does not belong to this module.' })
  else if (topic.delegatedTo) issues.push({ field: 'topic', message: `Record this through ${topic.delegatedTo}; this workspace does not open a second capture path.` })
  if (!input.parcelKey.trim()) issues.push({ field: 'parcel', message: 'Resolve a site first; observations are recorded against a resolved map point.' })
  if (!input.observer.trim()) issues.push({ field: 'observer', message: 'Enter who made or supplied this observation.' })
  if (!input.sourceRef.trim()) issues.push({ field: 'sourceRef', message: 'Enter the source or document reference (field sheet, drawing number, letter reference).' })
  const observedMs = parseIsoDate(input.observedOn)
  const nowMs = parseIsoDate(nowIso)
  if (observedMs === null) issues.push({ field: 'observedOn', message: 'Enter a valid observation date.' })
  else if (nowMs !== null && observedMs > nowMs) issues.push({ field: 'observedOn', message: 'Observation date cannot be in the future.' })
  if (topic && isDocumentTopic(topic) && input.basis === 'OBSERVED') {
    issues.push({ field: 'basis', message: 'A document-evidenced topic cannot be OBSERVED on site; record it as USER_PROVIDED from the document or INFERRED.' })
  }
  if (topic && topic.geometry !== 'document' && !input.location) {
    issues.push({ field: 'location', message: 'Attach a location (use the map point, enter coordinates, or use this device).' })
  }
  if (input.location) {
    const { lat, lng } = input.location
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) issues.push({ field: 'location.lat', message: 'Latitude must be between -90 and 90.' })
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) issues.push({ field: 'location.lng', message: 'Longitude must be between -180 and 180.' })
  }
  if (input.bearingDeg !== null && (!Number.isFinite(input.bearingDeg) || input.bearingDeg < 0 || input.bearingDeg >= 360)) {
    issues.push({ field: 'bearingDeg', message: 'Bearing must be 0 up to (not including) 360 degrees clockwise from true north.' })
  }
  if (input.note.length > NOTE_MAX) issues.push({ field: 'note', message: `Note is limited to ${NOTE_MAX} characters.` })
  for (const term of FORBIDDEN_NOTE_TERMS) {
    if (term.test(input.note)) {
      issues.push({ field: 'note', message: 'The note states a conclusion this workspace does not record (bearing capacity, foundation suitability, boundary, title, compliance, approval, or absence of heritage/risk). Describe what was seen or read instead.' })
      break
    }
  }
  return issues
}

/**
 * Only a direct on-site observation can be HIGH, and never for a topic that
 * still needs a professional or authority gate. INFERRED and USER_PROVIDED
 * records are capped at MEDIUM: nothing here can be more certain than its
 * basis.
 */
export function effectiveConfidence(input: Pick<SiteObservation, 'basis' | 'confidence' | 'topic'>): ObservationConfidence {
  const topic = topicById(input.topic)
  const cap: ObservationConfidence = input.basis === 'OBSERVED' && topic && topic.gates.every((gate) => gate === 'site-visit') ? 'HIGH' : 'MEDIUM'
  const order: ObservationConfidence[] = ['LOW', 'MEDIUM', 'HIGH']
  return order[Math.min(order.indexOf(input.confidence), order.indexOf(cap))]
}

export type EvidenceState = 'OBSERVED' | 'USER_PROVIDED' | 'INFERRED' | 'STALE' | 'INVALID'

export type ClassifiedObservation = {
  record: SiteObservation
  state: EvidenceState
  confidence: ObservationConfidence
  issues: IntakeIssue[]
  /** Why this record is not handed to design as qualified context; null when it is qualified. */
  heldBackReason: string | null
}

export function isStale(record: SiteObservation, nowIso: string): boolean {
  const topic = topicById(record.topic)
  const observedMs = parseIsoDate(record.observedOn)
  const nowMs = parseIsoDate(nowIso)
  if (!topic || observedMs === null || nowMs === null) return false
  return (nowMs - observedMs) / DAY_MS > topic.staleAfterDays
}

/** State is the record's own basis, or STALE/INVALID -- there is deliberately no path to "verified". */
export function classifyObservation(record: SiteObservation, nowIso: string): ClassifiedObservation {
  const issues = validateObservation(record, nowIso)
  const confidence = effectiveConfidence(record)
  const state: EvidenceState = issues.length > 0 ? 'INVALID' : isStale(record, nowIso) ? 'STALE' : record.basis
  let heldBackReason: string | null = null
  if (state === 'INVALID') heldBackReason = 'Fails intake validation.'
  else if (state === 'STALE') heldBackReason = 'Older than the freshness window for this topic; re-observe before reuse.'
  else if (state === 'INFERRED') heldBackReason = 'An inference is never handed to design as a fact; confirm it by observation or a document.'
  else if (confidence === 'LOW') heldBackReason = 'Low confidence; raise it by re-observation or a supporting document.'
  return { record, state, confidence, issues, heldBackReason }
}

export type SlotState = 'GAP' | 'OBSERVED' | 'USER_PROVIDED' | 'INFERRED' | 'STALE'
const slotRank: Record<SlotState, number> = { OBSERVED: 4, USER_PROVIDED: 3, INFERRED: 2, STALE: 1, GAP: 0 }

export type TopicSlot = {
  topic: SiteTopic
  state: SlotState
  records: ClassifiedObservation[]
  qualifiedCount: number
  /** True when only a deterministic computation (no observation) informs this topic. */
  computedOnly: boolean
}

export function buildSlot(topic: SiteTopic, records: ClassifiedObservation[], hasAnchor: boolean): TopicSlot {
  const own = records.filter((item) => item.record.topic === topic.id)
  let state: SlotState = 'GAP'
  for (const item of own) {
    if (item.state === 'INVALID') continue
    const candidate = item.state as SlotState
    if (slotRank[candidate] > slotRank[state]) state = candidate
  }
  return {
    topic,
    state,
    records: own,
    qualifiedCount: own.filter((item) => item.heldBackReason === null).length,
    computedOnly: topic.computed !== null && hasAnchor && state === 'GAP',
  }
}

export type MissingEvidence = { topicId: string; module: SiteModuleId; label: string; reason: string; gates: GateId[]; pendingConnector: string }

export function missingEvidence(slots: TopicSlot[]): MissingEvidence[] {
  const missing: MissingEvidence[] = []
  for (const slot of slots) {
    let reason: string | null = null
    if (slot.topic.delegatedTo && slot.state === 'GAP') reason = `GAP — record through ${slot.topic.delegatedTo}; not yet connected to this synthesis.`
    else if (slot.state === 'GAP') reason = slot.computedOnly ? 'UNKNOWN on site — computed geometry only, no on-site observation.' : 'GAP — no evidence recorded.'
    else if (slot.state === 'STALE') reason = 'STALE — every record is older than its freshness window.'
    else if (slot.state === 'INFERRED') reason = 'INFERRED only — no observation or supporting document.'
    else if (slot.qualifiedCount === 0) reason = 'Recorded, but held back from design (low confidence or invalid).'
    if (reason) missing.push({ topicId: slot.topic.id, module: slot.topic.module, label: slot.topic.label, reason, gates: slot.topic.gates, pendingConnector: slot.topic.pendingConnector })
  }
  return missing
}

export type GateStatus = { gate: ProfessionalGate; status: 'OPEN'; topicLabels: string[] }

/** Every gate is OPEN: this workspace has no way to record a professional determination. */
export function gateStatuses(slots: TopicSlot[]): GateStatus[] {
  return professionalGates.map((gate) => ({
    gate,
    status: 'OPEN' as const,
    topicLabels: slots.filter((slot) => slot.topic.gates.includes(gate.id)).map((slot) => slot.topic.label),
  }))
}

export type ModuleSummary = { module: SiteModule; slots: TopicSlot[]; qualified: number; total: number }

export type SiteSynthesis = {
  classified: ClassifiedObservation[]
  modules: ModuleSummary[]
  missing: MissingEvidence[]
  gates: GateStatus[]
  qualified: ClassifiedObservation[]
  heldBack: ClassifiedObservation[]
  snapshotHash: string
  /** The synthesis never produces a design recommendation; it only qualifies context. */
  designRecommendation: 'NOT_PRODUCED'
}

/** Small deterministic FNV-1a hash for change detection only; it is not a security control. */
export function fnv1a(text: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

export function snapshotOf(parcelKey: string, classified: ClassifiedObservation[]): string {
  const canonical = classified
    .map((item) => [item.record.id, item.record.topic, item.record.basis, item.record.confidence, item.record.observedOn, item.record.observer, item.record.sourceRef, item.record.location, item.record.locationSource, item.record.bearingDeg, item.record.note, item.state, item.confidence])
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  return fnv1a(JSON.stringify([parcelKey, canonical]))
}

export function synthesize(parcelKey: string | null, observations: SiteObservation[], nowIso: string, hasAnchor: boolean): SiteSynthesis {
  const classified = observations.map((record) => classifyObservation(record, nowIso))
  const modules: ModuleSummary[] = siteModules.map((module) => {
    const slots = topicsForModule(module.id).map((topic) => buildSlot(topic, classified, hasAnchor))
    return { module, slots, qualified: slots.filter((slot) => slot.qualifiedCount > 0).length, total: slots.length }
  })
  const slots = modules.flatMap((item) => item.slots)
  return {
    classified,
    modules,
    missing: missingEvidence(slots),
    gates: gateStatuses(slots),
    qualified: classified.filter((item) => item.heldBackReason === null),
    heldBack: classified.filter((item) => item.heldBackReason !== null),
    snapshotHash: snapshotOf(parcelKey ?? '', classified),
    designRecommendation: 'NOT_PRODUCED',
  }
}

const METRES_PER_DEGREE_LAT = 111_320

/** Equirectangular offset, adequate at site scale; not for geodetic use. */
export function offsetMetres(anchor: { lat: number; lng: number }, point: { lat: number; lng: number }): { east: number; north: number } {
  const north = (point.lat - anchor.lat) * METRES_PER_DEGREE_LAT
  const east = (point.lng - anchor.lng) * METRES_PER_DEGREE_LAT * Math.cos(((anchor.lat + point.lat) / 2) * (Math.PI / 180))
  return { east, north }
}

/** Length is always shown in both unit systems (RULE 30); ft uses the exact 0.3048 constant. */
export function lengthLabel(metres: number): string {
  const feet = metres / 0.3048
  return `${Number.isInteger(metres) ? metres : metres.toFixed(1)} m / ${Math.round(feet)} ft`
}
