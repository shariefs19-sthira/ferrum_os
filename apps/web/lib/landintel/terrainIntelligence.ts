export type TerrainEvidenceStatus = 'SOURCE MISSING' | 'UNKNOWN' | 'INDICATIVE' | 'SURVEY-VALIDATED'

export type TerrainCapability = {
  id: string
  title: string
  decision: string
  evidence: string
  keywords: string[]
}

export type TerrainMetadataField = {
  id: string
  label: string
  value: string
  status: TerrainEvidenceStatus
}

export const terrainEvidenceStates: TerrainEvidenceStatus[] = [
  'SOURCE MISSING',
  'UNKNOWN',
  'INDICATIVE',
  'SURVEY-VALIDATED',
]

export const terrainCapabilities: TerrainCapability[] = [
  {
    id: 'dtm-dsm',
    title: 'Bare-earth DTM & surface DSM',
    decision: 'Separate classified ground from buildings, vegetation and other surface returns.',
    evidence: 'Classified point cloud or authority terrain model with documented derivation.',
    keywords: ['dtm', 'dsm', 'bare earth', 'surface model', 'point cloud'],
  },
  {
    id: 'slope-elevation',
    title: 'Slope & elevation analysis',
    decision: 'Screen gradients, elevation ranges and abrupt terrain changes inside the project boundary.',
    evidence: 'Terrain elevations with horizontal and vertical reference systems and stated accuracy.',
    keywords: ['slope', 'elevation', 'gradient', 'terrain'],
  },
  {
    id: 'drainage-low-points',
    title: 'Drainage paths & low points',
    decision: 'Identify preliminary flow paths, sinks and low areas for drainage review.',
    evidence: 'Hydrologically conditioned terrain model plus rainfall and drainage context.',
    keywords: ['drainage', 'flow path', 'low point', 'sink', 'hydrology'],
  },
  {
    id: 'access-gradient',
    title: 'Access-gradient screening',
    decision: 'Compare preliminary road or ramp alignments against target gradients.',
    evidence: 'Terrain surface, proposed alignment, design criteria and verified tie-in levels.',
    keywords: ['access', 'road', 'ramp', 'gradient', 'alignment'],
  },
  {
    id: 'cut-fill',
    title: 'Cut-and-fill estimation',
    decision: 'Compare existing terrain with a proposed formation surface to estimate earthwork.',
    evidence: 'Surveyed existing surface, design surface, boundary, method and tolerances.',
    keywords: ['cut', 'fill', 'earthwork', 'volume', 'formation level'],
  },
  {
    id: 'canopy-obstruction',
    title: 'Canopy & obstruction mapping',
    decision: 'Expose above-ground obstructions and canopy that may affect access or development.',
    evidence: 'Classified above-ground returns with acquisition date and completeness statement.',
    keywords: ['canopy', 'tree height', 'obstruction', 'classification'],
  },
  {
    id: 'cross-sections',
    title: 'Building & road cross-sections',
    decision: 'Inspect the terrain profile along a proposed building, road or user-defined line.',
    evidence: 'Georeferenced terrain plus the current design alignment or footprint revision.',
    keywords: ['cross section', 'profile', 'building', 'road', 'alignment'],
  },
  {
    id: 'survey-design-comparison',
    title: 'Survey & design-level comparison',
    decision: 'Measure deviations between terrain evidence, project survey and design levels.',
    evidence: 'Versioned survey and design surfaces in compatible horizontal and vertical datums.',
    keywords: ['survey levels', 'design levels', 'deviation', 'comparison', 'datum'],
  },
]

export const terrainMetadataFields: TerrainMetadataField[] = [
  { id: 'capture-date', label: 'Capture date', value: 'Not connected', status: 'SOURCE MISSING' },
  { id: 'provider', label: 'Provider', value: 'Not connected', status: 'SOURCE MISSING' },
  { id: 'resolution', label: 'Resolution / point density', value: 'UNKNOWN', status: 'UNKNOWN' },
  { id: 'classification', label: 'Classification', value: 'UNKNOWN', status: 'UNKNOWN' },
  { id: 'crs', label: 'Horizontal CRS', value: 'UNKNOWN', status: 'UNKNOWN' },
  { id: 'vertical-datum', label: 'Vertical datum', value: 'UNKNOWN', status: 'UNKNOWN' },
  { id: 'accuracy', label: 'Horizontal / vertical accuracy', value: 'UNKNOWN', status: 'UNKNOWN' },
  { id: 'coverage-gaps', label: 'Coverage gaps', value: 'UNKNOWN', status: 'UNKNOWN' },
]

export const terrainProcessingStages = [
  'Connect terrain source',
  'Validate provenance & reference systems',
  'Classify and derive DTM / DSM',
  'Stream governed 3D terrain',
  'Run bounded terrain analysis',
  'Compare survey & design levels',
  'Record an evidence-linked decision',
] as const

export const terrainNonClaims = [
  'Soil bearing capacity or geotechnical suitability',
  'Buried utilities or underground obstructions',
  'Foundation type or structural adequacy',
  'Legal parcel boundaries, title or ownership',
] as const

