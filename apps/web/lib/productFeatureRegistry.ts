import type { CockpitProduct } from '../components/workspace/ProductCockpitPreview'
import { landIntelSuitabilityLayers } from './landintel/suitabilityLayers'
import { mapComposerRequirements } from './landintel/mapComposerRequirements'
import { terrainCapabilities } from './landintel/terrainIntelligence'
import { governedOrchestrationFeatureBody } from './governedOrchestration'
import { machineReleaseChecks, modelInspectionCapabilities, modelIntakeFields, modelReleaseStates } from './modelIntake'

export type FeatureAvailability = 'AVAILABLE' | 'ROADMAP' | 'TEST_MODE'

export type ProductFeature = {
  id: string
  title: string
  body: string
  availability: FeatureAvailability
  keywords: string[]
}

export const productLabels: Record<CockpitProduct, string> = {
  landintel: 'LandIntel',
  designstudio: 'DesignStudio',
  structura: 'Structura',
  'boq-pro': 'BOQ Pro',
  promarket: 'ProMarket',
  buildos: 'BuildOS',
  procurehub: 'ProcureHub',
  investflow: 'InvestFlow',
  communitybuild: 'CommunityBuild',
  transact: 'Transact',
}

const available = (id: string, title: string, body: string, keywords: string[] = []): ProductFeature => ({ id, title, body, availability: 'AVAILABLE', keywords })
const roadmap = (id: string, title: string, body: string, keywords: string[] = []): ProductFeature => ({ id, title, body, availability: 'ROADMAP', keywords })
const testMode = (id: string, title: string, body: string, keywords: string[] = []): ProductFeature => ({ id, title, body, availability: 'TEST_MODE', keywords })

/**
 * Canonical product-feature library. Product pages and SUTRA both consume
 * this registry, so a feature cannot be added to a product's feature grid
 * without entering SUTRA's grounded retrieval corpus in the same change.
 */
export const productFeatureRegistry: Record<CockpitProduct, ProductFeature[]> = {
  landintel: [
    available('ulpin-lookup', 'ULPIN lookup (live)', 'Look up one of three seeded ULPIN records through the D1-backed lookup, with a city-reference map and explicit provenance.', ['ulpin', 'bhu aadhaar', 'parcel record']),
    available('location-ulpin', 'ULPIN search', 'Select or enter a seeded ULPIN, request its indicative D1 record, center the reference map on its sample city coordinates, and preserve the returned state, district, area, land use, source, and evidence status in the local project context. This is not an official registry lookup.', ['ulpin mode', 'seeded record']),
    available('location-pin', 'Map pin', 'Click the map to capture latitude and longitude, attempt an OpenStreetMap Nominatim reverse geocode, and save a location-only project context. Parcel boundary, ownership, area, and official land attributes remain unknown.', ['pin', 'reverse geocode', 'latitude', 'longitude']),
    available('location-coordinates', 'Coordinates', 'Enter decimal coordinates such as 12.9716 and 77.5946, or degrees-minutes-seconds values such as 12°58′18″N and 77°35′41″E. Ferrum validates latitude within ±90 and longitude within ±180, centers the reference map, and saves a coordinate-only context. It does not infer a parcel boundary, ownership, area, zoning, or official land record.', ['coordinates', 'decimal', 'dms', 'latitude', 'longitude']),
    available('location-place', 'Address', 'Search a place name through OpenStreetMap Nominatim, review returned candidates, and select one to establish a geocoded location-only context. Search results are addresses, not verified parcels or authority records.', ['address', 'place', 'nominatim', 'geocode']),
    available('location-location', 'My location', 'Request browser geolocation permission and use the returned coordinates only within the local session. Denial leaves project context unchanged; parcel attributes, boundary, and official zoning remain unknown.', ['browser location', 'geolocation', 'permission']),
    roadmap('location-survey', 'Survey / khasra', 'State-specific survey, khasra, and plot-number lookup requires an authority adapter and is not currently connected. The control explains this gap without fabricating a result.', ['survey', 'khasra', 'plot number']),
    available('scenario-forecast', 'Scenario forecast (live)', 'Move area and land-use controls to model built-up potential against a disclosed sample Karnataka FAR ruleset.', ['far', 'coverage', 'built-up potential']),
    available('interactive-map', 'Interactive preview map (live)', 'View the selected lookup result or chosen coordinates on an OpenStreetMap reference map. It does not assert an official parcel boundary.', ['map', 'coordinates', 'openstreetmap']),
    roadmap('zoning-summary', 'Zoning summary', 'Official, authority-verified development permission and zoning interpretation are not yet connected.', ['zoning', 'authority', 'permitted use']),
    roadmap('soil-hazard', 'Soil & hazard data', 'Ground conditions and flood or seismic risk data are not yet connected.', ['soil', 'flood', 'seismic', 'hazard']),
    roadmap('feasibility-report', 'Feasibility report', 'A consolidated, shareable due-diligence report is not yet built.', ['report', 'feasibility', 'due diligence']),
    roadmap('investment-forecast', 'Investment forecasts', 'Land-value and return forecasting are not yet built in LandIntel.', ['land value', 'return', 'forecast']),
    roadmap('auditable-suitability-engine', 'Auditable suitability engine', 'Combine parcel and statutory boundaries, setbacks and zoning, topography and slope, drainage and flood exposure, soil and geotechnical conditions, ecology and protected areas, utilities and access, and development cost and constructability. Each layer must retain source, date, confidence and status. The engine must distinguish hard exclusions, weighted preferences, data conflicts, UNKNOWN areas and suitable development zones, then explain every ranking from traceable evidence. This is roadmap work; no suitability zone is currently asserted.', ['suitability', 'overlay method', 'constraint engine', 'hard exclusion', 'weighted preference', 'data conflict', 'suitable development zone']),
    ...landIntelSuitabilityLayers.map((layer) => roadmap(`suitability-${layer.id}`, layer.title, `${layer.summary} Decision role: ${layer.decisionRole}. Required evidence: ${layer.evidenceNeeded}. This layer is visible in LandIntel but remains ROADMAP until a dated source and confidence status are connected.`, layer.keywords)),
    roadmap('governed-terrain-intelligence', 'Governed terrain intelligence', 'Connect classified point clouds, bare-earth DTM and surface DSM data to project boundaries, design levels and traceable decisions. Every terrain dataset must expose capture date, provider, resolution or point density, classification, horizontal CRS, vertical datum, horizontal and vertical accuracy, and coverage gaps. Derived results remain INDICATIVE until validated against a project survey. Terrain evidence does not establish soil capacity, buried services, foundation suitability or legal boundaries. The specification is visible; ingestion, processing, 3D visualization and engineering calculations are not yet connected.', ['lidar', 'terrain intelligence', 'point cloud', 'dtm', 'dsm', 'survey validation', 'terrain evidence']),
    ...terrainCapabilities.map((capability) => roadmap(`terrain-${capability.id}`, capability.title, `${capability.decision} Required evidence: ${capability.evidence} This terrain analysis is visible in LandIntel but remains ROADMAP until a qualified source is connected and validated.`, capability.keywords)),
    available('governed-map-composer', 'Governed Map Composer (live readiness gate)', 'Enter project metadata — title, purpose, CRS/EPSG, active-layer sources and observation dates, author, issue date, revision — and LandIntel derives an 11-check readiness score live from that metadata plus the loaded parcel context, never from typed text alone. Export stays BLOCKED until purpose, a verified boundary, geometry-derived scale, north, CRS, sources, legend, a required locator inset, collision-checked labels, disclosed confidence, and INDICATIVE qualification all genuinely pass. No PDF, GIS, CAD or image export is generated yet — only the quality gate is live.', ['map composer', 'cartography', 'map layout', 'quality gate', 'map export']),
    ...mapComposerRequirements.map((item) => available(`map-composer-${item.id}`, item.title, `${item.requirement} This check is validated live in LandIntel's Map Composer against real metadata and parcel-context evidence; it fails closed rather than passing on typed text alone.`, item.keywords)),
  ],
  designstudio: [
    available('parametric-openings', 'Parametric openings (INDICATIVE)', 'Select generated doors and windows and adjust bounded dimensions and configuration in the deterministic preview.', ['door', 'window', 'opening']),
    available('test-fit-massing', 'Test-fit massing', 'Enter plot dimensions and floor count to generate a deterministic, indicative massing preview.', ['massing', 'plot', 'floors', 'test fit']),
    roadmap('browser-native-prompt-geometry', 'Browser-native prompt geometry', 'Create and revise editable architectural geometry through SUTRA inside the Ferrum web workspace, with no Rhino or other desktop CAD dependency. The target workflow keeps prompting, direct manipulation, validation, drawings, quantities, and export in one governed project context; it is not built yet.', ['prompt geometry', 'browser native', 'editable geometry', 'ai modeling', 'all in one']),
    roadmap('constraint-preserving-visualization', 'Constraint-preserving concept visualization', 'Generate selectable presentation styles only after verified site, CAD, or GIS geometry is loaded and spatial constraints are locked. The target workflow keeps parcel boundaries, roads, dimensions, north orientation, and scale traceable; compares source and generated views side by side; records model, prompt, seed, and source revision; and exports every result as INDICATIVE — NOT FOR CONSTRUCTION OR APPROVAL. It is not built yet.', ['screenshot to visualization', 'concept render', 'geometry preservation', 'traceability', 'style generation', 'master plan']),
    roadmap('ai-plan-generation', 'AI plan generation (roadmap)', 'Floor plans and elevations generated from a natural-language brief are not yet built.', ['ai plan', 'floor plan', 'elevation']),
    roadmap('general-plan-editing', 'General plan editing (roadmap)', 'Wall and room dragging, freehand drafting, and broader CAD controls are not available.', ['cad', 'wall', 'room', 'drafting']),
    roadmap('issue-sets', 'Issue sets (roadmap)', 'PDF issue sets and collaborative issue workflows are not available.', ['pdf', 'issue set', 'collaboration']),
    available('dxf-preview-export', 'DXF preview export', 'Export indicative plot, room, door, and window geometry into DXF layers for further review.', ['dxf', 'export', 'layers']),
    roadmap('model-preview-on-ingestion', 'Model preview on ingestion', 'Open compatible DXF and XML/LandXML project files in a browser inspection workspace, preserve source-model identity, and produce a visual preview together with a machine-readable intake report. A successful render remains PREVIEWED only; it does not establish correct units, coordinates, revision, engineering validity or machine suitability. File ingestion and parsing are not yet connected.', ['model preview', 'ingestion', 'dxf', 'landxml', 'xml', 'browser viewer']),
    ...modelInspectionCapabilities.map((capability) => roadmap(`model-inspection-${capability.id}`, capability.title, `${capability.body} This inspection capability is visible in the shared model-intake contract but is not yet connected to a file parser or production viewer.`, capability.keywords)),
  ],
  structura: [
    available('is-code-checking', 'IS code checking (live)', 'Run bounded IS 456 RCC beam and IS 800 steel-column clause checks with pass/review results and citations.', ['is 456', 'is 800', 'beam', 'column']),
    roadmap('model-importer', 'Model importer (roadmap)', 'Importing structural models from external design tools is not yet built.', ['model', 'import']),
    roadmap('fea-analysis', 'FEA analysis (roadmap)', 'Cloud finite-element analysis is not yet built.', ['fea', 'finite element']),
    roadmap('sign-off-workflow', 'Sign-off workflow (roadmap)', 'Professional review, approval, and engineering sign-off workflows are not yet built.', ['approval', 'sign off', 'review']),
    roadmap('drawing-generation', 'Drawing generation (roadmap)', 'Structural drawing generation from analysis results is not yet built.', ['drawing', 'detailing']),
  ],
  'boq-pro': [
    available('cost-split', 'Cost split scenario (live)', 'Adjust built-up area and sample grade to see indicative material, labour, and GST components recompute.', ['material', 'labour', 'gst', 'cost split']),
    available('city-pricing', 'City-wise pricing (live)', 'Compare seeded indicative rates for Bengaluru, Pune, and Chennai.', ['city', 'rate', 'pricing']),
    available('rate-band', 'Rate band breakdown (live)', 'Review P25, P50, and P75 Ferrum rate bands behind the indicative estimate.', ['p25', 'p50', 'p75', 'rate band']),
    roadmap('quantity-takeoff', 'Quantity take-off', 'Automatic measured quantities derived from a connected design are not yet built.', ['quantity', 'takeoff', 'measurement']),
    roadmap('brand-materials', 'Brand-wise materials', 'Brand-level selections such as cement and steel manufacturers are not yet built.', ['brand', 'cement', 'steel']),
    roadmap('gst-boq', 'GST-compliant BOQ', 'A connected, measured GST-compliant BOQ is not available from the current rate calculator.', ['boq', 'gst', 'takeoff']),
  ],
  promarket: [
    available('rate-comparison', 'Rate comparison (live)', 'Compare indicative category rates across seeded sample cities to sanity-check a quote.', ['rate', 'city', 'quote']),
    roadmap('verified-profiles', 'Verified profiles (roadmap)', 'Professional profiles for architects, engineers, and contractors are not yet built.', ['architect', 'engineer', 'contractor', 'profile']),
    roadmap('job-posting', 'Job posting (roadmap)', 'Publishing project briefs and receiving professional interest are not yet built.', ['job', 'brief', 'hire']),
    roadmap('proposal-system', 'Proposal system (roadmap)', 'Side-by-side professional bid and proposal comparison is not yet built.', ['proposal', 'bid']),
    roadmap('escrow-payments', 'Escrow payments (roadmap)', 'Milestone-based escrow and fund release are not yet built.', ['escrow', 'payment', 'milestone']),
    roadmap('reviews-ratings', 'Reviews & ratings (roadmap)', 'Verified reviews and performance ratings are not yet built.', ['review', 'rating']),
  ],
  buildos: [
    roadmap('governed-cross-functional-closure', 'Governed cross-functional closure', governedOrchestrationFeatureBody, ['design revision', 'quantity impact', 'procurement hold', 'cost impact', 'site instruction', 'acceptance evidence', 'controlled closure', 'audit trail', 'ai accountability']),
    roadmap('controlled-model-release', 'Controlled model release', 'Carry one model revision from browser preview through evidence-based validation to a named, revision-specific APPROVED FOR MACHINE decision. The release record includes checksum, source and responsible party, units, CRS and vertical datum, bounds and origin, parsed objects, geometry warnings, previous-revision comparison, approval evidence and affected downstream consumers. Release execution is not yet built.', ['model release', 'previewed', 'validated', 'approved for machine', 'machine control', 'audit trail']),
    ...modelIntakeFields.map((field) => roadmap(`model-intake-${field.id}`, field.label, `${field.requirement} This field is mandatory in the shared model-intake report and remains UNKNOWN until a real model and evidence source are connected.`, [field.label.toLowerCase(), 'model intake'])),
    ...modelReleaseStates.map((item) => roadmap(`model-release-${item.state.toLowerCase().replaceAll(' ', '-')}`, item.state, `${item.meaning} Gate: ${item.gate} The controlled-release workflow is not yet built.`, [item.state.toLowerCase(), 'model approval', 'release state'])),
    ...machineReleaseChecks.map((check, index) => roadmap(`machine-release-check-${index + 1}`, `Machine release check ${index + 1}`, `${check}. The machine release remains blocked until this check and every other required check are evidenced.`, ['machine release', 'approval gate', check.toLowerCase()])),
    roadmap('common-data-environment', 'Common data environment', 'A shared, governed source of project truth is not yet built.', ['cde', 'documents', 'project data']),
    roadmap('task-management', 'Task management', 'Creating, assigning, tracking, and closing project tasks are not yet built.', ['task', 'assignment']),
    roadmap('rfis-submittals', 'RFIs & submittals', 'RFI and submittal review workflows are not yet built.', ['rfi', 'submittal']),
    roadmap('qaqc-hse', 'QA/QC & HSE', 'Quality and safety checklists, inspections, and site logs are not yet built.', ['quality', 'safety', 'hse', 'inspection']),
    roadmap('progress-tracking', 'Progress tracking', 'Live construction progress capture and reporting are not yet built.', ['progress', 'site']),
    roadmap('measurement-billing', 'Measurement books & RA bills', 'Measured-work books and running-account billing are not yet built.', ['measurement book', 'ra bill', 'billing']),
  ],
  procurehub: [
    roadmap('material-requests', 'Material requests', 'Raising material requests directly from an approved BOQ is not yet built.', ['material request', 'boq']),
    roadmap('purchase-orders', 'Purchase orders', 'Creating and issuing purchase orders to suppliers is not yet built.', ['purchase order', 'po']),
    roadmap('delivery-tracking', 'Delivery tracking', 'Tracking materials from order through site receipt is not yet built.', ['delivery', 'receipt']),
    roadmap('supplier-directory', 'Supplier directory', 'Finding, qualifying, and managing suppliers are not yet built.', ['supplier', 'vendor']),
    roadmap('bill-reconciliation', 'Bill reconciliation', 'Reconciling supplier bills against orders and receipts is not yet built.', ['invoice', 'bill', 'reconciliation']),
    roadmap('supplier-payments', 'Payment integration', 'Supplier payment execution from ProcureHub is not yet built.', ['payment', 'supplier']),
  ],
  investflow: [
    available('cash-flow-modeling', 'Cash-flow modeling (live)', 'Model dated project cash flows across an indicative investment period.', ['cash flow', 'schedule']),
    available('irr-npv', 'IRR/NPV (live)', 'Calculate IRR and NPV from the supplied cash-flow schedule and discount rate.', ['irr', 'npv', 'discount rate']),
    roadmap('sensitivity-analysis', 'Sensitivity analysis', 'Stress-testing returns against changing assumptions is not yet built.', ['sensitivity', 'stress test']),
    roadmap('investor-dashboards', 'Investor dashboards', 'Portfolio views of investor commitments and returns are not yet built.', ['investor', 'dashboard']),
    roadmap('capital-commitment', 'Capital commitment', 'Managing investor capital commitments through the project is not yet built.', ['capital', 'commitment']),
    roadmap('scenario-planning', 'Scenario planning', 'Comparing multiple investment scenarios is not yet built.', ['scenario', 'comparison']),
  ],
  communitybuild: [
    roadmap('spv-creation', 'SPV creation', 'Creating and administering a project special-purpose vehicle is not yet built.', ['spv', 'entity']),
    roadmap('investor-commitments', 'Investor commitments', 'Tracking commitments from multiple community investors is not yet built.', ['investor', 'commitment']),
    roadmap('kyc-aml', 'KYC/AML verification', 'CommunityBuild investor verification is not yet built; Transact has a separate bounded KYC path.', ['kyc', 'aml', 'verification']),
    roadmap('construction-status', 'Construction status', 'The existing fixed sample response is not live per-project tracking.', ['construction status', 'progress']),
    roadmap('profit-distribution', 'Profit distribution', 'Calculating and distributing project profits to investors is not yet built.', ['profit', 'distribution']),
    roadmap('investor-reporting', 'Investor reporting', 'Performance and governance reporting to the investor group are not yet built.', ['report', 'investor']),
  ],
  transact: [
    available('stamp-duty', 'Stamp-duty estimator', 'Estimate indicative state-wise stamp duty and registration fees from illustrative sample rates.', ['stamp duty', 'registration fee', 'state']),
    available('ask-band', 'Ask-band estimator', 'Calculate an indicative price range from sample comparable data and an urgency adjustment.', ['ask band', 'price range', 'urgency']),
    available('demand-token', 'Demand-token waitlist', 'Register interest in Transact as a demand signal. It is not a financial commitment or guaranteed queue position.', ['waitlist', 'interest', 'demand']),
    testMode('case-flow', 'Buyer & seller case flow', 'Use a step-by-step case tracker for legal cross-check, listing, registration, and a token-payment step that remains in test mode; no live funds move.', ['buyer', 'seller', 'case', 'token payment']),
  ],
}

export const productFeatureList = Object.entries(productFeatureRegistry).flatMap(([productId, features]) =>
  features.map((feature) => ({ productId: productId as CockpitProduct, ...feature })),
)
