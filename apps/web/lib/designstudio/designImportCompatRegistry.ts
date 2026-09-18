/**
 * Design/import compatibility registry — capability contracts for the file
 * formats a construction-design intake pipeline is commonly asked to accept.
 *
 * No parser for any format is implemented in this repo. Every entry states
 * what is truthfully achievable today (metadata-only, reference-only, or "no
 * native parser exists yet") rather than asserting interoperability that has
 * not been built and proven. `designIntakeStateEvaluator.ts` reads this
 * registry to cap what approval state an intake can honestly reach.
 */

export type RequirementLevel = 'REQUIRED' | 'RECOMMENDED' | 'NOT_APPLICABLE'

/** Truthful description of what this repo can actually do with the format today. */
export type ParserAvailability =
  /** Open, text/XML-encoded, geometry-bearing format. No parser exists in this repo yet; one is structurally feasible to build. */
  | 'NO_PARSER_OPEN_TEXT'
  /** Open but binary-encoded, geometry-bearing format. No parser exists in this repo yet; feasible but non-trivial. */
  | 'NO_PARSER_OPEN_BINARY'
  /** Proprietary/opaque binary. Only file-level metadata (name, size, header fields where documented) is honest; full geometry decode would require a vendor SDK not present here. */
  | 'METADATA_ONLY'
  /** Proprietary and effectively closed without a vendor SDK/API. Tracked as an external reference pointer only — no metadata or geometry extraction attempted. */
  | 'REFERENCE_ONLY'
  /** Plain tabular text. Trivially structured, but no ingestion parser is implemented here; attribute-only, never a geometry source. */
  | 'TABULAR_TEXT'
  /** A document/report, not a geometry or attribute source. Tracked as an attached reference only. */
  | 'DOCUMENT_ONLY'

export type GeometryFidelity =
  | 'FULL_BREP_POTENTIAL'
  | 'MESH_ONLY_POTENTIAL'
  | 'CURVE_2D_POTENTIAL'
  | 'TABULAR_ATTRIBUTES_ONLY'
  | 'NONE_METADATA_ONLY'
  | 'NONE_REFERENCE_ONLY'
  | 'NONE_DOCUMENT_ONLY'

export type FormatCategory =
  | 'BIM'
  | 'CAD_2D'
  | 'CAD_3D'
  | 'SITE_CIVIL'
  | 'ENERGY'
  | 'COLLABORATION'
  | 'STANDARDS_EXCHANGE'
  | 'MESH_GEOMETRY'
  | 'TABULAR'
  | 'DOCUMENT'

export type GeometryWarningCategoryId =
  | 'UNIT_MISMATCH'
  | 'MISSING_CRS'
  | 'MISSING_DATUM'
  | 'NON_ORIGIN_ALIGNED'
  | 'MISSING_REVISION_METADATA'
  | 'DEGENERATE_GEOMETRY'
  | 'NON_MANIFOLD_MESH'
  | 'DUPLICATE_VERTICES'
  | 'INVERTED_NORMALS'
  | 'OUT_OF_TOLERANCE_SCALE'
  | 'UNSUPPORTED_ENTITY_TYPES'
  | 'BINARY_OPAQUE_NO_GEOMETRY_ACCESS'
  | 'EXTERNAL_REFERENCE_UNRESOLVED'

export type GeometryWarningSeverity = 'BLOCKING' | 'ADVISORY'

export type GeometryWarningDefinition = {
  id: GeometryWarningCategoryId
  label: string
  severity: GeometryWarningSeverity
  description: string
}

/** Downstream artifact kinds a design import can feed. Generic — not product-specific. */
export type DownstreamArtifactKind =
  | 'STRUCTURAL_MODEL'
  | 'CLASH_REPORT'
  | 'BOQ_TAKEOFF'
  | 'COST_ESTIMATE'
  | 'CONSTRUCTION_SCHEDULE'
  | 'COMPLIANCE_CHECK'
  | 'RENDER_CACHE'

export type FormatRequirements = {
  units: RequirementLevel
  crs: RequirementLevel
  datum: RequirementLevel
  origin: RequirementLevel
  revision: RequirementLevel
}

export type DesignImportFormat = {
  id: string
  label: string
  extensions: string[]
  category: FormatCategory
  parserAvailability: ParserAvailability
  geometryFidelity: GeometryFidelity
  requirements: FormatRequirements
  applicableWarnings: GeometryWarningCategoryId[]
  downstreamConsumers: DownstreamArtifactKind[]
  /** True only when the format is open enough that a native parser is a plausible future build, never a claim one exists. */
  eligibleForFutureNativeParser: boolean
  interoperabilityNote: string
}

export const geometryWarningCatalog: Record<GeometryWarningCategoryId, GeometryWarningDefinition> = {
  UNIT_MISMATCH: {
    id: 'UNIT_MISMATCH',
    label: 'Unit mismatch',
    severity: 'BLOCKING',
    description: 'The file declares, or is assumed to use, a length/area unit that conflicts with the project unit — e.g. millimetres read as metres.',
  },
  MISSING_CRS: {
    id: 'MISSING_CRS',
    label: 'Missing coordinate reference system',
    severity: 'BLOCKING',
    description: 'No CRS is declared or supplied alongside the file, so absolute site placement cannot be trusted.',
  },
  MISSING_DATUM: {
    id: 'MISSING_DATUM',
    label: 'Missing vertical/horizontal datum',
    severity: 'BLOCKING',
    description: 'No datum is declared, so elevations or grid coordinates cannot be reconciled with survey or site data.',
  },
  NON_ORIGIN_ALIGNED: {
    id: 'NON_ORIGIN_ALIGNED',
    label: 'Non-origin-aligned geometry',
    severity: 'ADVISORY',
    description: 'Geometry sits far from the file origin (common with real-world survey coordinates), risking precision loss downstream.',
  },
  MISSING_REVISION_METADATA: {
    id: 'MISSING_REVISION_METADATA',
    label: 'Missing revision metadata',
    severity: 'ADVISORY',
    description: 'The file carries no revision/version identifier, so later stale-impact tracking cannot distinguish this import from a future re-upload.',
  },
  DEGENERATE_GEOMETRY: {
    id: 'DEGENERATE_GEOMETRY',
    label: 'Degenerate geometry',
    severity: 'BLOCKING',
    description: 'Zero-area faces, zero-length edges, or coincident points that make downstream geometry processing unreliable.',
  },
  NON_MANIFOLD_MESH: {
    id: 'NON_MANIFOLD_MESH',
    label: 'Non-manifold mesh',
    severity: 'BLOCKING',
    description: 'Mesh topology is not a valid closed manifold (e.g. an edge shared by more than two faces), which breaks solid operations.',
  },
  DUPLICATE_VERTICES: {
    id: 'DUPLICATE_VERTICES',
    label: 'Duplicate vertices',
    severity: 'ADVISORY',
    description: 'Coincident or near-coincident vertices that inflate geometry without changing shape.',
  },
  INVERTED_NORMALS: {
    id: 'INVERTED_NORMALS',
    label: 'Inverted normals',
    severity: 'ADVISORY',
    description: 'Face winding/normal direction is inconsistent, which can invert shading or solid-inside/outside tests.',
  },
  OUT_OF_TOLERANCE_SCALE: {
    id: 'OUT_OF_TOLERANCE_SCALE',
    label: 'Out-of-tolerance scale',
    severity: 'BLOCKING',
    description: 'The model bounding box is implausible for its declared building type (e.g. a "building" 4mm or 4km across), suggesting a unit or scale error.',
  },
  UNSUPPORTED_ENTITY_TYPES: {
    id: 'UNSUPPORTED_ENTITY_TYPES',
    label: 'Unsupported entity types present',
    severity: 'ADVISORY',
    description: 'The file contains entity/element types outside what any future parser for this format is scoped to read.',
  },
  BINARY_OPAQUE_NO_GEOMETRY_ACCESS: {
    id: 'BINARY_OPAQUE_NO_GEOMETRY_ACCESS',
    label: 'Binary format opaque to this pipeline',
    severity: 'BLOCKING',
    description: 'The format is proprietary/binary and this pipeline has no decoder; only file-level metadata (or nothing) is available.',
  },
  EXTERNAL_REFERENCE_UNRESOLVED: {
    id: 'EXTERNAL_REFERENCE_UNRESOLVED',
    label: 'External reference unresolved',
    severity: 'ADVISORY',
    description: 'The import points at content this pipeline does not fetch or open (e.g. a reference-only proprietary file), so nothing beyond the pointer itself is verified.',
  },
}

const req = (units: RequirementLevel, crs: RequirementLevel, datum: RequirementLevel, origin: RequirementLevel, revision: RequirementLevel): FormatRequirements => ({
  units,
  crs,
  datum,
  origin,
  revision,
})

export const designImportFormats: DesignImportFormat[] = [
  {
    id: 'ifc', label: 'IFC (Industry Foundation Classes)', extensions: ['.ifc', '.ifcxml', '.ifczip'],
    category: 'BIM', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'FULL_BREP_POTENTIAL',
    requirements: req('REQUIRED', 'REQUIRED', 'REQUIRED', 'REQUIRED', 'REQUIRED'),
    applicableWarnings: ['UNIT_MISMATCH', 'MISSING_CRS', 'MISSING_DATUM', 'NON_ORIGIN_ALIGNED', 'MISSING_REVISION_METADATA', 'DEGENERATE_GEOMETRY', 'OUT_OF_TOLERANCE_SCALE', 'UNSUPPORTED_ENTITY_TYPES'],
    downstreamConsumers: ['STRUCTURAL_MODEL', 'CLASH_REPORT', 'BOQ_TAKEOFF', 'COST_ESTIMATE', 'COMPLIANCE_CHECK', 'RENDER_CACHE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Open ISO 16739 standard, SPF/XML text-encoded — structurally parseable, but no IFC parser is implemented in this repo, so no full-model interoperability is claimed.',
  },
  {
    id: 'dxf', label: 'DXF (Drawing Exchange Format)', extensions: ['.dxf'],
    category: 'CAD_2D', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'CURVE_2D_POTENTIAL',
    requirements: req('REQUIRED', 'RECOMMENDED', 'NOT_APPLICABLE', 'REQUIRED', 'RECOMMENDED'),
    applicableWarnings: ['UNIT_MISMATCH', 'MISSING_CRS', 'NON_ORIGIN_ALIGNED', 'MISSING_REVISION_METADATA', 'DEGENERATE_GEOMETRY', 'OUT_OF_TOLERANCE_SCALE', 'UNSUPPORTED_ENTITY_TYPES'],
    downstreamConsumers: ['BOQ_TAKEOFF', 'RENDER_CACHE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Autodesk-published, ASCII-text-encoded exchange format — this repo already writes DXF (lib/dxf/writeDxf.ts) but has no DXF *reader*, so import here is a capability contract only, not a proven read path.',
  },
  {
    id: 'dwg', label: 'DWG (AutoCAD native drawing)', extensions: ['.dwg'],
    category: 'CAD_2D', parserAvailability: 'METADATA_ONLY', geometryFidelity: 'NONE_METADATA_ONLY',
    requirements: req('NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'RECOMMENDED'),
    applicableWarnings: ['BINARY_OPAQUE_NO_GEOMETRY_ACCESS', 'MISSING_REVISION_METADATA'],
    downstreamConsumers: [],
    eligibleForFutureNativeParser: false,
    interoperabilityNote: 'Closed, versioned Autodesk binary format. No decoder exists in this repo or is planned here; only file-level metadata (name, size, declared DWG version where readable from the header) is honest — geometry is never extracted.',
  },
  {
    id: 'rvt', label: 'RVT (Revit project file)', extensions: ['.rvt'],
    category: 'BIM', parserAvailability: 'REFERENCE_ONLY', geometryFidelity: 'NONE_REFERENCE_ONLY',
    requirements: req('NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE'),
    applicableWarnings: ['EXTERNAL_REFERENCE_UNRESOLVED'],
    downstreamConsumers: [],
    eligibleForFutureNativeParser: false,
    interoperabilityNote: 'Proprietary Autodesk database format with no published open spec. Tracked as a reference pointer (filename, size, upload timestamp) only — this pipeline never opens or interprets its contents.',
  },
  {
    id: 'dgn', label: 'DGN (MicroStation design file)', extensions: ['.dgn'],
    category: 'CAD_2D', parserAvailability: 'METADATA_ONLY', geometryFidelity: 'NONE_METADATA_ONLY',
    requirements: req('NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'RECOMMENDED'),
    applicableWarnings: ['BINARY_OPAQUE_NO_GEOMETRY_ACCESS', 'MISSING_REVISION_METADATA'],
    downstreamConsumers: [],
    eligibleForFutureNativeParser: false,
    interoperabilityNote: 'Bentley proprietary binary format (V7/V8). No decoder exists here; only file-level metadata is honest to extract.',
  },
  {
    id: 'landxml', label: 'LandXML (civil/survey exchange)', extensions: ['.xml'],
    category: 'SITE_CIVIL', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'CURVE_2D_POTENTIAL',
    requirements: req('REQUIRED', 'REQUIRED', 'REQUIRED', 'RECOMMENDED', 'RECOMMENDED'),
    applicableWarnings: ['UNIT_MISMATCH', 'MISSING_CRS', 'MISSING_DATUM', 'NON_ORIGIN_ALIGNED', 'MISSING_REVISION_METADATA', 'UNSUPPORTED_ENTITY_TYPES'],
    downstreamConsumers: ['BOQ_TAKEOFF', 'COST_ESTIMATE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Open XML civil-survey exchange schema — structurally parseable, no reader implemented in this repo.',
  },
  {
    id: 'gbxml', label: 'gbXML (green building XML)', extensions: ['.xml', '.gbxml'],
    category: 'ENERGY', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'MESH_ONLY_POTENTIAL',
    requirements: req('REQUIRED', 'RECOMMENDED', 'NOT_APPLICABLE', 'REQUIRED', 'RECOMMENDED'),
    applicableWarnings: ['UNIT_MISMATCH', 'NON_ORIGIN_ALIGNED', 'MISSING_REVISION_METADATA', 'DEGENERATE_GEOMETRY', 'UNSUPPORTED_ENTITY_TYPES'],
    downstreamConsumers: ['COMPLIANCE_CHECK', 'RENDER_CACHE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Open XML schema for building-energy-analysis geometry — structurally parseable, no reader implemented in this repo.',
  },
  {
    id: 'bcf', label: 'BCF (BIM Collaboration Format)', extensions: ['.bcf', '.bcfzip'],
    category: 'COLLABORATION', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'TABULAR_ATTRIBUTES_ONLY',
    requirements: req('NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'RECOMMENDED'),
    applicableWarnings: ['MISSING_REVISION_METADATA', 'UNSUPPORTED_ENTITY_TYPES'],
    downstreamConsumers: ['CLASH_REPORT'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Open buildingSMART XML/JSON issue-exchange format — carries markup/viewpoints referencing a model, not geometry itself. No reader implemented in this repo.',
  },
  {
    id: 'saf', label: 'SAF (Structural Analysis Format)', extensions: ['.saf', '.json'],
    category: 'STANDARDS_EXCHANGE', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'CURVE_2D_POTENTIAL',
    requirements: req('REQUIRED', 'RECOMMENDED', 'NOT_APPLICABLE', 'REQUIRED', 'RECOMMENDED'),
    applicableWarnings: ['UNIT_MISMATCH', 'NON_ORIGIN_ALIGNED', 'MISSING_REVISION_METADATA', 'UNSUPPORTED_ENTITY_TYPES'],
    downstreamConsumers: ['STRUCTURAL_MODEL', 'COST_ESTIMATE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Open JSON-based structural-analysis exchange schema (CSI/buildingSMART) — structurally parseable, no reader implemented in this repo.',
  },
  {
    id: 'step', label: 'STEP (ISO 10303)', extensions: ['.stp', '.step'],
    category: 'STANDARDS_EXCHANGE', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'FULL_BREP_POTENTIAL',
    requirements: req('REQUIRED', 'RECOMMENDED', 'NOT_APPLICABLE', 'REQUIRED', 'RECOMMENDED'),
    applicableWarnings: ['UNIT_MISMATCH', 'NON_ORIGIN_ALIGNED', 'MISSING_REVISION_METADATA', 'DEGENERATE_GEOMETRY', 'OUT_OF_TOLERANCE_SCALE', 'UNSUPPORTED_ENTITY_TYPES'],
    downstreamConsumers: ['STRUCTURAL_MODEL', 'CLASH_REPORT', 'RENDER_CACHE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Open ISO 10303 exchange standard, SPF text-encoded — structurally parseable, no reader implemented in this repo.',
  },
  {
    id: 'stl', label: 'STL (mesh geometry)', extensions: ['.stl'],
    category: 'MESH_GEOMETRY', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'MESH_ONLY_POTENTIAL',
    requirements: req('REQUIRED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'REQUIRED', 'NOT_APPLICABLE'),
    applicableWarnings: ['UNIT_MISMATCH', 'NON_ORIGIN_ALIGNED', 'DEGENERATE_GEOMETRY', 'NON_MANIFOLD_MESH', 'DUPLICATE_VERTICES', 'INVERTED_NORMALS', 'OUT_OF_TOLERANCE_SCALE'],
    downstreamConsumers: ['RENDER_CACHE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Simple triangle-mesh format (ASCII or binary), no units/CRS/metadata carried by the format itself — any unit assumption is external to the file. No reader implemented in this repo.',
  },
  {
    id: 'obj', label: 'OBJ (Wavefront mesh)', extensions: ['.obj'],
    category: 'MESH_GEOMETRY', parserAvailability: 'NO_PARSER_OPEN_TEXT', geometryFidelity: 'MESH_ONLY_POTENTIAL',
    requirements: req('REQUIRED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'REQUIRED', 'NOT_APPLICABLE'),
    applicableWarnings: ['UNIT_MISMATCH', 'NON_ORIGIN_ALIGNED', 'DEGENERATE_GEOMETRY', 'NON_MANIFOLD_MESH', 'DUPLICATE_VERTICES', 'INVERTED_NORMALS', 'OUT_OF_TOLERANCE_SCALE'],
    downstreamConsumers: ['RENDER_CACHE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Open ASCII mesh format, no units/CRS carried by the format itself. No reader implemented in this repo.',
  },
  {
    id: 'gltf', label: 'glTF / GLB (transmission mesh)', extensions: ['.gltf', '.glb'],
    category: 'MESH_GEOMETRY', parserAvailability: 'NO_PARSER_OPEN_BINARY', geometryFidelity: 'MESH_ONLY_POTENTIAL',
    requirements: req('RECOMMENDED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'REQUIRED', 'RECOMMENDED'),
    applicableWarnings: ['UNIT_MISMATCH', 'NON_ORIGIN_ALIGNED', 'MISSING_REVISION_METADATA', 'DEGENERATE_GEOMETRY', 'NON_MANIFOLD_MESH', 'INVERTED_NORMALS', 'OUT_OF_TOLERANCE_SCALE'],
    downstreamConsumers: ['RENDER_CACHE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Open Khronos standard (JSON + binary buffers, or single GLB container); units are fixed to metres by spec, but real-world exports frequently violate that. No reader implemented in this repo.',
  },
  {
    id: 'csv', label: 'CSV (tabular schedule/attribute export)', extensions: ['.csv'],
    category: 'TABULAR', parserAvailability: 'TABULAR_TEXT', geometryFidelity: 'TABULAR_ATTRIBUTES_ONLY',
    requirements: req('RECOMMENDED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'RECOMMENDED'),
    applicableWarnings: ['UNIT_MISMATCH', 'MISSING_REVISION_METADATA', 'UNSUPPORTED_ENTITY_TYPES'],
    downstreamConsumers: ['BOQ_TAKEOFF', 'COST_ESTIMATE', 'CONSTRUCTION_SCHEDULE'],
    eligibleForFutureNativeParser: true,
    interoperabilityNote: 'Plain delimited text — trivially structured, but no ingestion parser is implemented here. Attribute/schedule data only; never a geometry source.',
  },
  {
    id: 'pdf', label: 'PDF (drawing sheet / report export)', extensions: ['.pdf'],
    category: 'DOCUMENT', parserAvailability: 'DOCUMENT_ONLY', geometryFidelity: 'NONE_DOCUMENT_ONLY',
    requirements: req('NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'RECOMMENDED'),
    applicableWarnings: ['MISSING_REVISION_METADATA'],
    downstreamConsumers: [],
    eligibleForFutureNativeParser: false,
    interoperabilityNote: 'A rendered document (drawing sheet, report), not a geometry or attribute source. Tracked as an attached reference only — no extraction attempted.',
  },
]

const formatsById = new Map(designImportFormats.map((f) => [f.id, f]))

export function getFormatCapability(formatId: string): DesignImportFormat | undefined {
  return formatsById.get(formatId)
}

export function listFormatCapabilities(): DesignImportFormat[] {
  return designImportFormats
}

export function getGeometryWarningDefinition(id: GeometryWarningCategoryId): GeometryWarningDefinition {
  return geometryWarningCatalog[id]
}
