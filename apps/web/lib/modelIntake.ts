export type ModelReleaseState = 'PREVIEWED' | 'VALIDATED' | 'APPROVED FOR MACHINE'

export type ModelIntakeField = {
  id: string
  label: string
  requirement: string
}

export type ModelInspectionCapability = {
  id: string
  title: string
  body: string
  keywords: string[]
}

export const modelIntakeFields: ModelIntakeField[] = [
  { id: 'checksum-revision', label: 'Checksum & revision', requirement: 'Immutable file hash, revision identifier and superseded-file relationship.' },
  { id: 'source-owner', label: 'Source & responsible party', requirement: 'Originating organization, author and accountable model owner.' },
  { id: 'units', label: 'Units', requirement: 'Declared model units cross-checked against bounds and known control distances.' },
  { id: 'crs-datum', label: 'CRS & vertical datum', requirement: 'Horizontal CRS/EPSG and vertical datum stated, recognized and mutually compatible.' },
  { id: 'bounds-origin', label: 'Bounds & origin', requirement: 'Model extents, insertion point and distance from project survey control.' },
  { id: 'object-types', label: 'Parsed object types', requirement: 'Entity counts for surfaces, points, alignments, centrelines, buildings, roads and utilities.' },
  { id: 'geometry-warnings', label: 'Geometry warnings', requirement: 'Unsupported entities, parse errors, gaps, overlaps, inverted triangles and corrupt alignments.' },
  { id: 'revision-comparison', label: 'Previous-revision comparison', requirement: 'Added, removed and changed geometry plus the prior revision used for comparison.' },
  { id: 'approval-status', label: 'Approval status', requirement: 'Current release state, reviewer, evidence, date and any unresolved hold.' },
  { id: 'affected-consumers', label: 'Affected downstream consumers', requirement: 'Design, quantities, procurement, field, survey and machine outputs impacted by the change.' },
]

export const modelInspectionCapabilities: ModelInspectionCapability[] = [
  { id: 'combined-model', title: 'Combined project model', body: 'Inspect compatible building, road, utility and site models in one browser scene while preserving each source model and revision.', keywords: ['combined model', 'building', 'road', 'utility', 'site model'] },
  { id: 'hierarchy-visibility', title: 'Hierarchy & visibility', body: 'Browse a model tree, toggle sources and categories, and isolate selected objects without deleting project context.', keywords: ['hierarchy', 'layer tree', 'visibility', 'isolate'] },
  { id: 'viewpoints', title: 'Plan, 3D & cross-section views', body: 'Keep top, front, side, isometric and cross-section views synchronized to the same selected object and coordinates.', keywords: ['top view', 'front view', 'side view', 'isometric', 'cross section'] },
  { id: 'representations', title: 'Surface, wireframe & points', body: 'Switch representation to expose topology, point density and geometry that a shaded surface may conceal.', keywords: ['surface', 'wireframe', 'points', 'representation'] },
  { id: 'alignment-views', title: 'Alignment & centreline inspection', body: 'Inspect alignments, centrelines and their relationship to surfaces and project control.', keywords: ['alignment', 'centreline', 'linear infrastructure'] },
  { id: 'measure-coordinate', title: 'Measurements & coordinate readout', body: 'Interrogate distances, elevations and coordinates with units, CRS, datum and precision visible beside every result.', keywords: ['measure', 'coordinate', 'distance', 'elevation'] },
  { id: 'revision-overlay', title: 'Revision overlays', body: 'Compare the current and previous model revisions, identify changes and prevent superseded geometry from silently reaching downstream work.', keywords: ['revision overlay', 'superseded', 'model comparison', 'change'] },
  { id: 'design-survey', title: 'Design-versus-survey comparison', body: 'Compare design geometry with survey or as-built evidence and report deviations against stated tolerances.', keywords: ['design versus survey', 'as built', 'deviation', 'tolerance'] },
]

export const modelReleaseStates: Array<{ state: ModelReleaseState; meaning: string; gate: string }> = [
  {
    state: 'PREVIEWED',
    meaning: 'The file parsed sufficiently to create a visual inspection view.',
    gate: 'This state does not establish correct coordinates, dimensions, revision, engineering validity or machine suitability.',
  },
  {
    state: 'VALIDATED',
    meaning: 'Required intake checks passed against project control and the geometry-warning record was reviewed.',
    gate: 'Validation must identify the reviewer, evidence, date, tolerance and unresolved limitations.',
  },
  {
    state: 'APPROVED FOR MACHINE',
    meaning: 'A named authority approved a specific validated revision and export for a stated machine workflow.',
    gate: 'Approval is revision-specific and is revoked when an affecting source, control point, transform or export changes.',
  },
]

export const supportedModelFormatIntent = [
  { format: 'DXF', state: 'ROADMAP', note: 'Browser intake must disclose supported entities, units, coordinate system and skipped content.' },
  { format: 'LandXML / XML', state: 'ROADMAP', note: 'Surface, point, alignment and centreline parsing requires schema and compatibility reporting.' },
] as const

export const machineReleaseChecks = [
  'Exact model revision and checksum selected',
  'Units, CRS, vertical datum and project control validated',
  'Geometry warnings accepted or closed',
  'Previous-revision differences reviewed',
  'Machine/export compatibility validated',
  'Named approver, scope and audit evidence recorded',
] as const

