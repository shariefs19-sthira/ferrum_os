export type FerrumProduct =
  | 'CROSS'
  | 'LandIntel'
  | 'DesignStudio'
  | 'Structura'
  | 'BOQ Pro'
  | 'ProMarket'
  | 'ProcureHub'
  | 'BuildOS'
  | 'InvestFlow'
  | 'SUTRA'

export type OpenSourceCapability = {
  id: string
  name: string
  role: string
  licence: {
    spdxExpression: string
    class: 'PERMISSIVE' | 'WEAK COPYLEFT' | 'STRONG COPYLEFT' | 'DATA LICENCE' | 'NON-OPEN/RESTRICTED' | 'SELECTION REQUIRED'
    reviewNote: string
  }
  integrationMode: 'IN-PROCESS LIBRARY' | 'ISOLATED WORKER' | 'ISOLATED SERVICE' | 'DATA PIPELINE' | 'PROTOCOL/INTERFACE'
  maturity: 'ACTIVE DEPENDENCY' | 'ARCHITECTURE PLANNED' | 'EVALUATION CANDIDATE' | 'EXCLUDED/COMMERCIAL GATE'
  isolation: 'NONE BEYOND TENANCY' | 'PROCESS BOUNDARY' | 'NETWORK SERVICE BOUNDARY' | 'LICENCE AND SECURITY GATE'
  products: FerrumProduct[]
  connectionEvidence: string | null
  limitation: string
}

const capability = (value: OpenSourceCapability): OpenSourceCapability => value

/**
 * A decision registry, not a dependency manifest. `ACTIVE DEPENDENCY` is used
 * only when the component is already connected in this repository. Everything
 * else remains an adapter candidate until its own implementation and acceptance.
 */
export const openSourceCapabilityRegistry: readonly OpenSourceCapability[] = Object.freeze([
  capability({ id: 'three', name: 'Three.js', role: 'Browser 3D and PBR rendering', licence: { spdxExpression: 'MIT', class: 'PERMISSIVE', reviewNote: 'Retain copyright and licence notice.' }, integrationMode: 'IN-PROCESS LIBRARY', maturity: 'ACTIVE DEPENDENCY', isolation: 'NONE BEYOND TENANCY', products: ['DesignStudio', 'LandIntel'], connectionEvidence: 'apps/web/package.json#three', limitation: 'A rendered scene is not dimensional or engineering verification.' }),
  capability({ id: 'web-ifc', name: 'web-ifc', role: 'Browser IFC parsing', licence: { spdxExpression: 'MPL-2.0', class: 'WEAK COPYLEFT', reviewNote: 'Preserve MPL-covered-file obligations and notices.' }, integrationMode: 'IN-PROCESS LIBRARY', maturity: 'ACTIVE DEPENDENCY', isolation: 'PROCESS BOUNDARY', products: ['DesignStudio', 'Structura', 'BOQ Pro'], connectionEvidence: 'apps/web/package.json#web-ifc', limitation: 'Parsing success does not validate units, placement, schema or engineering suitability.' }),
  capability({ id: 'tesseract-js', name: 'Tesseract.js', role: 'Browser document OCR', licence: { spdxExpression: 'Apache-2.0', class: 'PERMISSIVE', reviewNote: 'Retain notices and attribution.' }, integrationMode: 'IN-PROCESS LIBRARY', maturity: 'ACTIVE DEPENDENCY', isolation: 'PROCESS BOUNDARY', products: ['SUTRA', 'BOQ Pro', 'BuildOS'], connectionEvidence: 'apps/web/package.json#tesseract.js', limitation: 'OCR output requires page-coordinate preservation and review.' }),
  capability({ id: 'mcp-sdk', name: 'Model Context Protocol SDK', role: 'Scoped agent tool interface', licence: { spdxExpression: 'MIT', class: 'PERMISSIVE', reviewNote: 'Retain copyright and licence notice.' }, integrationMode: 'PROTOCOL/INTERFACE', maturity: 'ACTIVE DEPENDENCY', isolation: 'LICENCE AND SECURITY GATE', products: ['SUTRA', 'CROSS'], connectionEvidence: 'apps/web/package.json#@modelcontextprotocol/sdk', limitation: 'Tools remain least-privilege and proposal-only until a human-approved mutation.' }),

  capability({ id: 'postgresql', name: 'PostgreSQL', role: 'Transactional project and audit store', licence: { spdxExpression: 'PostgreSQL', class: 'PERMISSIVE', reviewNote: 'Operate under the PostgreSQL licence and retain notices.' }, integrationMode: 'ISOLATED SERVICE', maturity: 'ARCHITECTURE PLANNED', isolation: 'NETWORK SERVICE BOUNDARY', products: ['CROSS'], connectionEvidence: null, limitation: 'Not connected by this registry; tenancy, backup and migration acceptance are required.' }),
  capability({ id: 'postgis', name: 'PostGIS', role: 'Spatial indexing and geospatial queries', licence: { spdxExpression: 'GPL-2.0-or-later', class: 'STRONG COPYLEFT', reviewNote: 'Deploy only as an isolated PostgreSQL extension/service after licence review.' }, integrationMode: 'ISOLATED SERVICE', maturity: 'ARCHITECTURE PLANNED', isolation: 'LICENCE AND SECURITY GATE', products: ['LandIntel', 'DesignStudio'], connectionEvidence: null, limitation: 'Not connected; spatial results still require CRS and source-quality controls.' }),
  capability({ id: 'object-store', name: 'S3-compatible object-store interface', role: 'Immutable native files, evidence and render artifacts', licence: { spdxExpression: 'IMPLEMENTATION-DEPENDENT', class: 'SELECTION REQUIRED', reviewNote: 'Select and review a concrete self-hosted or managed implementation before adoption.' }, integrationMode: 'PROTOCOL/INTERFACE', maturity: 'ARCHITECTURE PLANNED', isolation: 'NETWORK SERVICE BOUNDARY', products: ['CROSS'], connectionEvidence: null, limitation: 'The interface is planned; no storage engine is selected or live.' }),
  capability({ id: 'occt', name: 'Open CASCADE Technology', role: 'Exact B-rep geometry and CAD exchange kernel', licence: { spdxExpression: 'LGPL-2.1-only WITH OCCT-exception-1.0', class: 'WEAK COPYLEFT', reviewNote: 'Confirm exception scope and dynamic/service boundary before distribution.' }, integrationMode: 'ISOLATED WORKER', maturity: 'EVALUATION CANDIDATE', isolation: 'LICENCE AND SECURITY GATE', products: ['DesignStudio', 'Structura'], connectionEvidence: null, limitation: 'No OCCT worker or CAD conformance suite is connected.' }),
  capability({ id: 'ifcopenshell', name: 'IfcOpenShell / Ifc5D', role: 'Server IFC conversion, validation and model-linked quantities', licence: { spdxExpression: 'LGPL-3.0-or-later (core; component review required)', class: 'WEAK COPYLEFT', reviewNote: 'Keep in an isolated service and review optional GPL components separately.' }, integrationMode: 'ISOLATED SERVICE', maturity: 'ARCHITECTURE PLANNED', isolation: 'LICENCE AND SECURITY GATE', products: ['DesignStudio', 'Structura', 'BOQ Pro'], connectionEvidence: null, limitation: 'Planned conversion/audit service; it is not installed or connected.' }),
  capability({ id: 'freecad', name: 'FreeCAD', role: 'Optional parametric CAD automation workbench', licence: { spdxExpression: 'LGPL-2.1-or-later (core; component review required)', class: 'WEAK COPYLEFT', reviewNote: 'Use only through an isolated worker after workbench-by-workbench licence review.' }, integrationMode: 'ISOLATED WORKER', maturity: 'EVALUATION CANDIDATE', isolation: 'LICENCE AND SECURITY GATE', products: ['DesignStudio'], connectionEvidence: null, limitation: 'Not selected as Ferrum\'s geometry authority and not connected.' }),
  capability({ id: 'blender-cycles', name: 'Blender / Cycles', role: 'High-resolution isolated rendering', licence: { spdxExpression: 'GPL-3.0-or-later (Blender binary); Apache-2.0 (Cycles engine)', class: 'STRONG COPYLEFT', reviewNote: 'Run official Blender as an isolated worker; review distributed add-ons independently.' }, integrationMode: 'ISOLATED WORKER', maturity: 'ARCHITECTURE PLANNED', isolation: 'LICENCE AND SECURITY GATE', products: ['DesignStudio'], connectionEvidence: null, limitation: 'No render worker is connected; output images have no project write authority.' }),

  capability({ id: 'maplibre', name: 'MapLibre GL JS', role: 'Open browser mapping surface', licence: { spdxExpression: 'BSD-3-Clause', class: 'PERMISSIVE', reviewNote: 'Retain copyright and licence notice.' }, integrationMode: 'IN-PROCESS LIBRARY', maturity: 'ARCHITECTURE PLANNED', isolation: 'NONE BEYOND TENANCY', products: ['LandIntel', 'DesignStudio'], connectionEvidence: null, limitation: 'Planned; current web dependency is Leaflet.' }),
  capability({ id: 'cesiumjs', name: 'CesiumJS', role: '3D Tiles and globe visualization', licence: { spdxExpression: 'Apache-2.0', class: 'PERMISSIVE', reviewNote: 'Retain notices; data/service terms remain separate.' }, integrationMode: 'IN-PROCESS LIBRARY', maturity: 'EVALUATION CANDIDATE', isolation: 'PROCESS BOUNDARY', products: ['LandIntel', 'DesignStudio'], connectionEvidence: null, limitation: 'No CesiumJS client is connected; Cesium ion is a separate commercial service.' }),
  capability({ id: 'deck-gl', name: 'deck.gl', role: 'Large geospatial visualization layers', licence: { spdxExpression: 'MIT', class: 'PERMISSIVE', reviewNote: 'Retain copyright and licence notice.' }, integrationMode: 'IN-PROCESS LIBRARY', maturity: 'EVALUATION CANDIDATE', isolation: 'PROCESS BOUNDARY', products: ['LandIntel'], connectionEvidence: null, limitation: 'Not connected and does not supply map data itself.' }),
  capability({ id: 'overture', name: 'Overture Maps data', role: 'Global contextual buildings, places and transport', licence: { spdxExpression: 'ODbL-1.0 / CDLA-Permissive-2.0 by theme', class: 'DATA LICENCE', reviewNote: 'Track theme-level licence, attribution and derived-database obligations.' }, integrationMode: 'DATA PIPELINE', maturity: 'ARCHITECTURE PLANNED', isolation: 'PROCESS BOUNDARY', products: ['LandIntel', 'DesignStudio'], connectionEvidence: null, limitation: 'Source coverage varies and cannot replace cadastral or survey evidence.' }),
  capability({ id: 'gdal-proj', name: 'GDAL / PROJ', role: 'Geospatial conversion and coordinate transforms', licence: { spdxExpression: 'MIT', class: 'PERMISSIVE', reviewNote: 'Review bundled format drivers and datum-grid data separately.' }, integrationMode: 'ISOLATED WORKER', maturity: 'ARCHITECTURE PLANNED', isolation: 'PROCESS BOUNDARY', products: ['LandIntel', 'DesignStudio'], connectionEvidence: null, limitation: 'No worker is connected; transformations require explicit CRS and grid provenance.' }),
  capability({ id: 'pdal', name: 'PDAL', role: 'Point-cloud processing pipelines', licence: { spdxExpression: 'BSD-3-Clause', class: 'PERMISSIVE', reviewNote: 'Retain notices; review optional drivers.' }, integrationMode: 'ISOLATED WORKER', maturity: 'EVALUATION CANDIDATE', isolation: 'PROCESS BOUNDARY', products: ['LandIntel', 'DesignStudio'], connectionEvidence: null, limitation: 'Not connected; classification and datum quality remain source-dependent.' }),
  capability({ id: 'open3d', name: 'Open3D', role: 'Point-cloud registration and geometry processing', licence: { spdxExpression: 'MIT', class: 'PERMISSIVE', reviewNote: 'Retain copyright and licence notice.' }, integrationMode: 'ISOLATED WORKER', maturity: 'EVALUATION CANDIDATE', isolation: 'PROCESS BOUNDARY', products: ['LandIntel', 'DesignStudio', 'BuildOS'], connectionEvidence: null, limitation: 'Not connected; registration requires survey control before measured use.' }),

  capability({ id: 'energyplus-openstudio', name: 'EnergyPlus / OpenStudio', role: 'Energy and thermal simulation', licence: { spdxExpression: 'BSD-3-Clause', class: 'PERMISSIVE', reviewNote: 'Pin engine and weather-file versions; retain notices.' }, integrationMode: 'ISOLATED WORKER', maturity: 'ARCHITECTURE PLANNED', isolation: 'PROCESS BOUNDARY', products: ['DesignStudio'], connectionEvidence: null, limitation: 'No solver is connected; results remain simulations with declared assumptions.' }),
  capability({ id: 'radiance', name: 'Radiance', role: 'Daylight, luminance and glare simulation', licence: { spdxExpression: 'BSD-3-Clause', class: 'PERMISSIVE', reviewNote: 'Retain notices and pin binaries/material inputs.' }, integrationMode: 'ISOLATED WORKER', maturity: 'ARCHITECTURE PLANNED', isolation: 'PROCESS BOUNDARY', products: ['DesignStudio'], connectionEvidence: null, limitation: 'No simulation worker is connected.' }),
  capability({ id: 'ortools', name: 'OR-Tools CP-SAT', role: 'Deterministic layout, logistics and scheduling constraints', licence: { spdxExpression: 'Apache-2.0', class: 'PERMISSIVE', reviewNote: 'Retain notices and publish solver/input versions in evidence.' }, integrationMode: 'ISOLATED WORKER', maturity: 'ARCHITECTURE PLANNED', isolation: 'PROCESS BOUNDARY', products: ['DesignStudio', 'ProcureHub', 'BuildOS'], connectionEvidence: null, limitation: 'Planned; no optimization result is live or accepted.' }),
  capability({ id: 'docling', name: 'Docling', role: 'Layout-aware document ingestion', licence: { spdxExpression: 'MIT', class: 'PERMISSIVE', reviewNote: 'Review model weights and optional OCR backends independently.' }, integrationMode: 'ISOLATED SERVICE', maturity: 'EVALUATION CANDIDATE', isolation: 'NETWORK SERVICE BOUNDARY', products: ['SUTRA', 'BOQ Pro', 'BuildOS'], connectionEvidence: null, limitation: 'Not connected; extraction requires source-page coordinates and confidence.' }),
  capability({ id: 'paddleocr', name: 'PaddleOCR', role: 'Multilingual OCR and document structure', licence: { spdxExpression: 'Apache-2.0', class: 'PERMISSIVE', reviewNote: 'Review model weights and retain notices.' }, integrationMode: 'ISOLATED SERVICE', maturity: 'EVALUATION CANDIDATE', isolation: 'NETWORK SERVICE BOUNDARY', products: ['SUTRA', 'BOQ Pro', 'BuildOS'], connectionEvidence: null, limitation: 'Not connected; outputs require confidence and human correction.' }),
  capability({ id: 'model-serving', name: 'LiteLLM / vLLM / llama.cpp', role: 'Policy-routed local and external model inference', licence: { spdxExpression: 'MIT / Apache-2.0 / MIT (core projects)', class: 'PERMISSIVE', reviewNote: 'Pin each component and separately review model-weight licences and hosted-provider terms.' }, integrationMode: 'ISOLATED SERVICE', maturity: 'ARCHITECTURE PLANNED', isolation: 'LICENCE AND SECURITY GATE', products: ['SUTRA', 'CROSS'], connectionEvidence: null, limitation: 'No router or self-hosted inference service is connected by this registry.' }),
  capability({ id: 'opa', name: 'Open Policy Agent', role: 'Deterministic authorization and release policy evaluation', licence: { spdxExpression: 'Apache-2.0', class: 'PERMISSIVE', reviewNote: 'Pin policy bundles and preserve decision logs.' }, integrationMode: 'ISOLATED SERVICE', maturity: 'ARCHITECTURE PLANNED', isolation: 'NETWORK SERVICE BOUNDARY', products: ['SUTRA', 'CROSS'], connectionEvidence: null, limitation: 'Not connected; policy authoring and conformance tests are required.' }),
  capability({ id: 'opentelemetry', name: 'OpenTelemetry', role: 'Agent, solver and tool-call observability', licence: { spdxExpression: 'Apache-2.0', class: 'PERMISSIVE', reviewNote: 'Retain notices and apply privacy controls before exporting traces.' }, integrationMode: 'PROTOCOL/INTERFACE', maturity: 'ARCHITECTURE PLANNED', isolation: 'NETWORK SERVICE BOUNDARY', products: ['SUTRA', 'CROSS'], connectionEvidence: null, limitation: 'Not connected; traces must redact project and personal data.' }),

  capability({ id: 'gpl-fea', name: 'CalculiX / Code_Aster / OpenFOAM', role: 'Specialist FEA and CFD evaluation', licence: { spdxExpression: 'GPL-2.0-or-later / GPL-3.0-or-later', class: 'STRONG COPYLEFT', reviewNote: 'Only consider isolated executables after component-specific legal and validation review.' }, integrationMode: 'ISOLATED WORKER', maturity: 'EVALUATION CANDIDATE', isolation: 'LICENCE AND SECURITY GATE', products: ['Structura', 'DesignStudio'], connectionEvidence: null, limitation: 'Not connected; solver validation and professional review are mandatory.' }),
  capability({ id: 'commercial-gate-set', name: 'OpenSees / Ultralytics / xeokit / BIMserver core / PotreeConverter 2', role: 'Restricted or commercially gated candidate set', licence: { spdxExpression: 'MIXED OR RESTRICTED', class: 'NON-OPEN/RESTRICTED', reviewNote: 'Do not adopt without product-specific licence adjudication or a commercial agreement.' }, integrationMode: 'PROTOCOL/INTERFACE', maturity: 'EXCLUDED/COMMERCIAL GATE', isolation: 'LICENCE AND SECURITY GATE', products: ['LandIntel', 'DesignStudio', 'Structura', 'BuildOS'], connectionEvidence: null, limitation: 'Explicitly excluded from the default stack; no live capability is claimed.' }),
])

export function capabilitiesForProduct(product: FerrumProduct): OpenSourceCapability[] {
  return openSourceCapabilityRegistry.filter((entry) => entry.products.includes(product) || entry.products.includes('CROSS'))
}

export function registryIntegrityIssues(registry: readonly OpenSourceCapability[] = openSourceCapabilityRegistry): string[] {
  const issues: string[] = []
  const ids = new Set<string>()
  for (const entry of registry) {
    if (ids.has(entry.id)) issues.push(`Duplicate capability id: ${entry.id}`)
    ids.add(entry.id)
    if (entry.maturity === 'ACTIVE DEPENDENCY' && !entry.connectionEvidence) issues.push(`Active capability lacks connection evidence: ${entry.id}`)
    if (entry.maturity !== 'ACTIVE DEPENDENCY' && entry.connectionEvidence) issues.push(`Unconnected capability carries active evidence: ${entry.id}`)
    if (entry.licence.class === 'STRONG COPYLEFT' && entry.isolation !== 'LICENCE AND SECURITY GATE') issues.push(`Strong-copyleft capability lacks a licence gate: ${entry.id}`)
  }
  return issues
}

