export type ModelIntakeState = 'UPLOADED' | 'PREVIEWED' | 'VALIDATION REQUIRED' | 'VALIDATED' | 'APPROVED FOR MACHINE' | 'REJECTED'

export type EvidenceValue<T> = {
  status: 'OBSERVED' | 'USER PROVIDED' | 'UNKNOWN' | 'NOT EVALUATED'
  value: T | null
  note?: string
}

export type ParsedObjectType = { type: string; count: number }

export type ModelIntakeReport = {
  reportVersion: '1.0'
  state: ModelIntakeState
  file: {
    name: string; sizeBytes: number; mediaType: string; sha256: string
    revision: EvidenceValue<string>; source: EvidenceValue<string>; responsibleParty: EvidenceValue<string>
  }
  parser: { engine: 'web-ifc'; engineVersion: '0.0.77'; schema: EvidenceValue<string>; parsedAt: string }
  spatialReference: {
    units: EvidenceValue<string>; crs: EvidenceValue<string>; verticalDatum: EvidenceValue<string>
    origin: EvidenceValue<[number, number, number]>
    bounds: EvidenceValue<{ min: [number, number, number]; max: [number, number, number] }>
  }
  parsedObjectTypes: ParsedObjectType[]
  unsupportedEntities: EvidenceValue<string[]>
  geometryWarnings: string[]
  previousRevisionComparison: {
    status: 'NOT REQUESTED' | 'AWAITING PREVIOUS REVISION' | 'NOT EVALUATED'
    previousRevision: string | null; note: string
  }
  approval: { state: ModelIntakeState; reviewer: string | null; reviewedAt: string | null; evidence: string[] }
  downstreamConsumers: Array<{
    product: 'DesignStudio' | 'Structura' | 'BOQ Pro' | 'ProcureHub' | 'Ferrum Projects' | 'Machine workflow'
    state: 'BLOCKED' | 'REVIEW REQUIRED'; reason: string
  }>
}

export type ModelIntakeField = { id: string; label: string; requirement: string }
export type ModelInspectionCapability = { id: string; title: string; body: string; keywords: string[] }

export const modelIntakeFields: ModelIntakeField[] = [
  { id: 'checksum-revision', label: 'Checksum & revision', requirement: 'Immutable SHA-256 file hash, user-declared revision and superseded-file relationship.' },
  { id: 'source-owner', label: 'Source & responsible party', requirement: 'Originating organization, author and accountable model owner.' },
  { id: 'units', label: 'Units', requirement: 'Declared model units cross-checked against bounds and known control distances.' },
  { id: 'crs-datum', label: 'CRS & vertical datum', requirement: 'Horizontal CRS/EPSG and vertical datum stated, recognized and mutually compatible.' },
  { id: 'bounds-origin', label: 'Bounds & origin', requirement: 'Model extents, insertion point and distance from project survey control.' },
  { id: 'object-types', label: 'Parsed object types', requirement: 'Entity counts reported by web-ifc for the uploaded revision.' },
  { id: 'geometry-warnings', label: 'Geometry warnings', requirement: 'Unsupported entities, parse errors, gaps, overlaps, inverted faces and corrupt alignments.' },
  { id: 'revision-comparison', label: 'Previous-revision comparison', requirement: 'Added, removed and changed geometry plus the prior revision used for comparison.' },
  { id: 'approval-status', label: 'Approval status', requirement: 'Current release state, reviewer, evidence, date and unresolved holds.' },
  { id: 'affected-consumers', label: 'Affected downstream consumers', requirement: 'Design, quantities, procurement, field, survey and machine outputs impacted by the change.' },
]

export const modelInspectionCapabilities: ModelInspectionCapability[] = [
  { id: 'ifc-metadata', title: 'IFC metadata intake', body: 'A local browser pass computes SHA-256 and uses web-ifc to read schema and entity counts without uploading the file.', keywords: ['ifc', 'web-ifc', 'checksum', 'metadata'] },
  { id: 'combined-model', title: 'Combined project model', body: 'Inspect compatible building, road, utility and site models in one browser scene while preserving each source model and revision.', keywords: ['combined model', 'building', 'road', 'utility', 'site model'] },
  { id: 'hierarchy-visibility', title: 'Hierarchy & visibility', body: 'Browse a model tree, toggle sources and categories, and isolate selected objects without deleting project context.', keywords: ['hierarchy', 'layer tree', 'visibility', 'isolate'] },
  { id: 'viewpoints', title: 'Plan, 3D & cross-section views', body: 'Keep top, front, side, isometric and cross-section views synchronized to the same selected object and coordinates.', keywords: ['top view', 'front view', 'side view', 'isometric', 'cross section'] },
  { id: 'representations', title: 'Surface, wireframe & points', body: 'Switch representation to expose topology, point density and geometry that a shaded surface may conceal.', keywords: ['surface', 'wireframe', 'points', 'representation'] },
  { id: 'alignment-views', title: 'Alignment & centreline inspection', body: 'Inspect alignments, centrelines and their relationship to surfaces and project control.', keywords: ['alignment', 'centreline', 'linear infrastructure'] },
  { id: 'measure-coordinate', title: 'Measurements & coordinate readout', body: 'Interrogate distances, elevations and coordinates with units, CRS, datum and precision visible beside every result.', keywords: ['measure', 'coordinate', 'distance', 'elevation'] },
  { id: 'revision-overlay', title: 'Revision overlays', body: 'Compare current and previous revisions and prevent superseded geometry from silently reaching downstream work.', keywords: ['revision overlay', 'superseded', 'model comparison', 'change'] },
  { id: 'design-survey', title: 'Design-versus-survey comparison', body: 'Compare design geometry with survey or as-built evidence and report deviations against stated tolerances.', keywords: ['design versus survey', 'as built', 'deviation', 'tolerance'] },
]

export const modelReleaseStates: Array<{ state: ModelIntakeState; meaning: string; gate: string }> = [
  { state: 'UPLOADED', meaning: 'The browser received the selected file and computed its identity.', gate: 'Upload says nothing about format validity, geometry, coordinates or approval.' },
  { state: 'PREVIEWED', meaning: 'A visual preview was created for a specific checksum.', gate: 'Rendering success does not establish geographic, dimensional or engineering validity.' },
  { state: 'VALIDATION REQUIRED', meaning: 'Parsing completed, but required evidence or professional checks remain open.', gate: 'Downstream release remains blocked.' },
  { state: 'VALIDATED', meaning: 'Required intake checks passed against project control and warnings were reviewed.', gate: 'Validation records reviewer, evidence, date, tolerance and limitations.' },
  { state: 'APPROVED FOR MACHINE', meaning: 'A named authority approved a validated revision for a stated machine workflow.', gate: 'Approval is revision-specific and revoked by affecting changes.' },
  { state: 'REJECTED', meaning: 'The file failed intake or was rejected by a reviewer.', gate: 'Rejected revisions cannot supply downstream work.' },
]

export const supportedModelFormatIntent = [
  { format: 'IFC', state: 'AVAILABLE', note: 'Local metadata intake with SHA-256, schema and entity counts. Geometry viewing and validation remain separate.' },
  { format: 'DXF', state: 'ROADMAP', note: 'Intake must disclose supported entities, units, coordinate system and skipped content.' },
  { format: 'LandXML / XML', state: 'ROADMAP', note: 'Surface, point, alignment and centreline parsing requires schema and compatibility reporting.' },
] as const

export const machineReleaseChecks = [
  'Exact model revision and checksum selected', 'Units, CRS, vertical datum and project control validated',
  'Geometry warnings accepted or closed', 'Previous-revision differences reviewed',
  'Machine/export compatibility validated', 'Named approver, scope and audit evidence recorded',
] as const
