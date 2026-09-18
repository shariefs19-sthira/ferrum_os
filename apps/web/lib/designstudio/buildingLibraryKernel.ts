import { buildingShellCatalog, type BuildingShell, type ShellGeometry } from './shellCatalog'

export const BUILDING_LIBRARY_SCHEMA = 'ferrum.building-template.v1' as const

export const TIME_TO_FIRST_COORDINATED_OPTION_TARGET = Object.freeze({
  minimumMinutes: 15,
  maximumMinutes: 30,
  metric: 'TIME TO FIRST COORDINATED OPTION',
  guarantee: false,
  boundary: 'A comparable, evidence-labelled option; not a finished, approved or construction-ready building.',
})

export type TemplateReleaseState =
  | 'AUTHORING'
  | 'CATALOGUE REVIEWED'
  | 'ENGINEERING ENVELOPE VERIFIED'
  | 'APPROVED FOR SELECTION'
  | 'RETIRED'

export type TemplateValidityState =
  | 'WITHIN BOUNDED ENVELOPE'
  | 'RECOMPUTE REQUIRED'
  | 'INSUFFICIENT SITE INPUTS'
  | 'STALE TEMPLATE'
  | 'NOT PRECOMPUTED'

export type RecomputeTrigger =
  | 'SOIL'
  | 'WIND'
  | 'SEISMIC'
  | 'SNOW'
  | 'JURISDICTION'
  | 'DIMENSIONS'
  | 'MATERIALS'
  | 'LOADS'
  | 'USER CHANGE'

export type TemplateLicence = {
  rightsBasis: 'FERRUM ORIGINAL' | 'OPEN LICENSE' | 'LICENSED CONTRIBUTION'
  licenceId: string
  sourceUri: string
  reusableInPublicLibrary: boolean
  attributionRequired: boolean
  restrictions: string[]
}

export type TemplateProvenance = {
  authoringOrganisation: string
  createdAt: string
  reviewedAt: string
  sourceReferences: Array<{ title: string; uri: string }>
  copyrightBoundary: string
  licence: TemplateLicence
}

export type ParametricEnvelope = {
  plotAreaSqm: { min: number; max: number }
  floorCount: { min: number; max: number }
  grossFloorAreaSqm: { min: number; max: number }
  buildingWidthM: { min: number; max: number }
  buildingDepthM: { min: number; max: number }
  storeyHeightM: { min: number; max: number }
  geometry: ShellGeometry
}

export type StructuralSystemTemplate = {
  state: 'UNSPECIFIED' | 'CONCEPT SYSTEM' | 'ENGINEER REVIEWED'
  gravitySystem: string
  lateralSystem: string
  foundationAssumption: string
  materialFamilies: string[]
  limitation: string
}

export type PrecomputedAnalysisEnvelope = {
  state: 'NOT COMPUTED' | 'BOUNDED PRECOMPUTED' | 'ENGINEER VERIFIED'
  analysisRevision: string | null
  solver: { name: string; version: string } | null
  verificationRecordId: string | null
  jurisdictionIds: string[]
  soilBearingKpa: { min: number; max: number } | null
  windSpeedMps: { min: number; max: number } | null
  seismicClasses: string[]
  snowLoadKpa: { min: number; max: number } | null
  deadLoadKpa: { min: number; max: number } | null
  liveLoadKpa: { min: number; max: number } | null
  coveredDimensions: Pick<ParametricEnvelope, 'floorCount' | 'grossFloorAreaSqm' | 'buildingWidthM' | 'buildingDepthM' | 'storeyHeightM'>
  coveredMaterials: string[]
  assumptions: string[]
  exclusions: string[]
}

export type BoqBaseline = {
  state: 'NOT MEASURED' | 'INDICATIVE RANGE' | 'QUANTITY REVIEWED'
  currency: string | null
  quantityRevision: string | null
  range: { low: number; high: number; unit: string } | null
  assumptions: string[]
  exclusions: string[]
}

export type RequiredSiteInput = {
  id: 'jurisdiction' | 'soil' | 'wind' | 'seismic' | 'snow' | 'dimensions' | 'materials' | 'loads'
  requiredFor: Array<'SELECTION' | 'STRUCTURAL REUSE' | 'BOQ REUSE' | 'ISSUE'>
  absenceEffect: 'UNKNOWN' | 'RECOMPUTE' | 'HOLD'
}

export type ProductOutputContract = {
  product: 'LandIntel' | 'DesignStudio' | 'Structura/FEA' | 'BOQ Pro' | 'ProMarket' | 'ProcureHub' | 'BuildOS' | 'InvestFlow'
  output: string
  initialState: 'AVAILABLE AS TEMPLATE' | 'SCHEMA CONTRACT' | 'RECOMPUTE REQUIRED'
}

export type BuildingTemplate = {
  schema: typeof BUILDING_LIBRARY_SCHEMA
  templateId: string
  version: string
  /** SHA-256 of `${shellId}@${version}`; geometry assets carry separate intake checksums. */
  identityChecksum: `sha256:${string}`
  name: string
  buildingTypes: string[]
  programmes: string[]
  occupancies: string[]
  climateApplicability: string[]
  jurisdictionApplicability: string[]
  provenance: TemplateProvenance
  parametricEnvelope: ParametricEnvelope
  semanticGeometry: {
    uri: string
    format: 'FERRUM SEMANTIC SHELL'
    coordinateUnit: 'm'
    geometryStatus: 'INDICATIVE'
  }
  structuralSystem: StructuralSystemTemplate
  analysisEnvelope: PrecomputedAnalysisEnvelope
  boqBaseline: BoqBaseline
  requiredSiteInputs: RequiredSiteInput[]
  productOutputs: ProductOutputContract[]
  releaseState: TemplateReleaseState
  validFrom: string
  reviewDueAt: string
}

export type ProjectTemplateInputs = {
  jurisdictionId: string | null
  soilBearingKpa: number | null
  windSpeedMps: number | null
  seismicClass: string | null
  snowLoadKpa: number | null
  floorCount: number | null
  grossFloorAreaSqm: number | null
  buildingWidthM: number | null
  buildingDepthM: number | null
  storeyHeightM: number | null
  materials: string[]
  deadLoadKpa: number | null
  liveLoadKpa: number | null
  userChanges: Array<'GEOMETRY' | 'MATERIAL' | 'PROGRAMME' | 'OPENING' | 'STRUCTURAL SYSTEM' | 'LOAD'>
}

export type TemplateEvaluation = {
  state: TemplateValidityState
  triggers: RecomputeTrigger[]
  missingInputs: RequiredSiteInput['id'][]
  reasons: string[]
  reusableAnalysisRevision: string | null
  reusableBoqRevision: string | null
}

const requiredSiteInputs: RequiredSiteInput[] = [
  { id: 'jurisdiction', requiredFor: ['SELECTION', 'STRUCTURAL REUSE', 'BOQ REUSE', 'ISSUE'], absenceEffect: 'HOLD' },
  { id: 'soil', requiredFor: ['STRUCTURAL REUSE', 'ISSUE'], absenceEffect: 'RECOMPUTE' },
  { id: 'wind', requiredFor: ['STRUCTURAL REUSE', 'ISSUE'], absenceEffect: 'RECOMPUTE' },
  { id: 'seismic', requiredFor: ['STRUCTURAL REUSE', 'ISSUE'], absenceEffect: 'RECOMPUTE' },
  { id: 'snow', requiredFor: ['STRUCTURAL REUSE', 'ISSUE'], absenceEffect: 'UNKNOWN' },
  { id: 'dimensions', requiredFor: ['SELECTION', 'STRUCTURAL REUSE', 'BOQ REUSE', 'ISSUE'], absenceEffect: 'HOLD' },
  { id: 'materials', requiredFor: ['STRUCTURAL REUSE', 'BOQ REUSE', 'ISSUE'], absenceEffect: 'RECOMPUTE' },
  { id: 'loads', requiredFor: ['STRUCTURAL REUSE', 'BOQ REUSE', 'ISSUE'], absenceEffect: 'RECOMPUTE' },
]

const productOutputs: ProductOutputContract[] = [
  { product: 'LandIntel', output: 'Site-fit evidence and unresolved constraints', initialState: 'SCHEMA CONTRACT' },
  { product: 'DesignStudio', output: 'Parametric semantic shell and comparable rendered option', initialState: 'AVAILABLE AS TEMPLATE' },
  { product: 'Structura/FEA', output: 'Structural-system seed and bounded analysis intake', initialState: 'RECOMPUTE REQUIRED' },
  { product: 'BOQ Pro', output: 'Element-linked baseline and revision impact', initialState: 'RECOMPUTE REQUIRED' },
  { product: 'ProMarket', output: 'Specification and specialist requirement package', initialState: 'SCHEMA CONTRACT' },
  { product: 'ProcureHub', output: 'Material demand and procurement hold package', initialState: 'SCHEMA CONTRACT' },
  { product: 'BuildOS', output: 'Work-package and acceptance-plan seed', initialState: 'SCHEMA CONTRACT' },
  { product: 'InvestFlow', output: 'Cost and cash-flow option input', initialState: 'SCHEMA CONTRACT' },
]

const identityChecksums: Record<string, `sha256:${string}`> = {
  'kerala-courtyard': 'sha256:55a137fa4f8947650902abe26ec2419ed76d279d7c49c0a8e0b123b69a4be21a',
  'coastal-karnataka-tile': 'sha256:f8e600ebd8b4b2c7a72a86b89131dcbdf80deb9bf08d423defc147bf7c3bee9c',
  'bengaluru-contemporary': 'sha256:82c47c47bc0d294e7b46a634f43600994be9795cd1ea33c09152d4b7b4944d46',
  'goa-indo-portuguese': 'sha256:b2d7ba0aa00b723b8d680c328f9886ddc3a3d9b66cf8e67d5066a8b1a16ba4f1',
  'chettinad-court': 'sha256:4f0b1f09722315605c90173cf10feb8519be6124ae5f715e8e89da31eed52cb2',
  'rajasthan-haveli': 'sha256:a4a3080e56199c5a0ed722db60b5b391669305ac5aad54754b0f251abfb41b5f',
  'gujarat-pol': 'sha256:8c062f04dd82d6631053ac98abd94a5d7ed02ff2a63490b0af1f791da1b94c01',
  'assam-raised': 'sha256:6e4e68694a3c6a4ae57898c409270e6d186a9de6d1ef468ebb7cc0e17884217c',
  'himalayan-stepped': 'sha256:8a95d7ef908efa8c51b2fc38e739c8204b2d0f3c271ab5fc6ea4d69e4d1b7aac',
  'ladakh-solar': 'sha256:1348b632e6868d0ef6be0d9dd97686fa40cb5ac7b75d2a277e89e7c75c576d48',
  'bengal-courtyard': 'sha256:94f973a686283b5c9baf96e57a4bb03af94e3ab51114d2735cb736a79eb69316',
  'india-neutral-adaptive': 'sha256:4c83403066415e52e86010666c65ba4d537367e6a9595e5bd5dd3b38950f1c0e',
}

function templateFromShell(shell: BuildingShell): BuildingTemplate {
  return {
    schema: BUILDING_LIBRARY_SCHEMA,
    templateId: `ferrum:${shell.id}`,
    version: '0.1.0',
    identityChecksum: identityChecksums[shell.id],
    name: shell.name,
    buildingTypes: [...shell.buildingTypes],
    programmes: [...shell.buildingTypes],
    occupancies: [...shell.buildingTypes],
    climateApplicability: [...shell.climates],
    jurisdictionApplicability: shell.states.length ? [...shell.states] : ['PROJECT REVIEW REQUIRED'],
    provenance: {
      authoringOrganisation: 'Ferrum',
      createdAt: '2026-09-18',
      reviewedAt: shell.provenance.reviewedAt,
      sourceReferences: [{ title: shell.provenance.source, uri: shell.provenance.sourceUrl }],
      copyrightBoundary: shell.provenance.copyrightBoundary,
      licence: {
        rightsBasis: 'FERRUM ORIGINAL',
        licenceId: 'FERRUM-INTERNAL-TEMPLATE-1.0',
        sourceUri: '/documentation',
        reusableInPublicLibrary: true,
        attributionRequired: false,
        restrictions: ['No source-reference project geometry is reproduced.', 'Local professional approval remains project-specific.'],
      },
    },
    parametricEnvelope: {
      plotAreaSqm: { ...shell.plotAreaSqm },
      floorCount: { ...shell.floorRange },
      grossFloorAreaSqm: { min: shell.plotAreaSqm.min * 0.25, max: shell.plotAreaSqm.max * shell.floorRange.max * 0.7 },
      buildingWidthM: { min: 4, max: 60 },
      buildingDepthM: { min: 5, max: 80 },
      storeyHeightM: { min: 2.7, max: 4.5 },
      geometry: { ...shell.geometry },
    },
    semanticGeometry: {
      uri: `ferrum://building-library/${shell.id}/0.1.0/semantic-shell`,
      format: 'FERRUM SEMANTIC SHELL',
      coordinateUnit: 'm',
      geometryStatus: 'INDICATIVE',
    },
    structuralSystem: {
      state: 'UNSPECIFIED',
      gravitySystem: 'Project-specific selection required',
      lateralSystem: 'Project-specific selection required',
      foundationAssumption: 'No foundation assumption is reusable without accepted geotechnical evidence.',
      materialFamilies: [],
      limitation: 'Current catalogue shells are architectural massing studies and have no reusable structural verification.',
    },
    analysisEnvelope: {
      state: 'NOT COMPUTED',
      analysisRevision: null,
      solver: null,
      verificationRecordId: null,
      jurisdictionIds: [],
      soilBearingKpa: null,
      windSpeedMps: null,
      seismicClasses: [],
      snowLoadKpa: null,
      deadLoadKpa: null,
      liveLoadKpa: null,
      coveredDimensions: {
        floorCount: { ...shell.floorRange },
        grossFloorAreaSqm: { min: shell.plotAreaSqm.min * 0.25, max: shell.plotAreaSqm.max * shell.floorRange.max * 0.7 },
        buildingWidthM: { min: 4, max: 60 },
        buildingDepthM: { min: 5, max: 80 },
        storeyHeightM: { min: 2.7, max: 4.5 },
      },
      coveredMaterials: [],
      assumptions: [],
      exclusions: ['Structural analysis', 'Member design', 'Connections', 'Foundations', 'Authority approval'],
    },
    boqBaseline: {
      state: 'NOT MEASURED',
      currency: null,
      quantityRevision: null,
      range: null,
      assumptions: [],
      exclusions: ['Project quantities', 'Rates', 'Wastage', 'Logistics', 'Taxes'],
    },
    requiredSiteInputs: requiredSiteInputs.map((input) => ({ ...input, requiredFor: [...input.requiredFor] })),
    productOutputs: productOutputs.map((output) => ({ ...output })),
    releaseState: 'CATALOGUE REVIEWED',
    validFrom: shell.provenance.reviewedAt,
    reviewDueAt: '2027-09-18',
  }
}

export const buildingTemplateLibrary: readonly BuildingTemplate[] = Object.freeze(buildingShellCatalog.map(templateFromShell))

export function getBuildingTemplateByShellId(shellId: string): BuildingTemplate {
  return buildingTemplateLibrary.find((template) => template.templateId === `ferrum:${shellId}`)
    ?? buildingTemplateLibrary.find((template) => template.templateId === 'ferrum:india-neutral-adaptive')!
}

const within = (value: number | null, range: { min: number; max: number } | null) => value !== null && range !== null && value >= range.min && value <= range.max

export function evaluateTemplateForProject(template: BuildingTemplate, input: ProjectTemplateInputs, evaluatedAt: string): TemplateEvaluation {
  const missingInputs: RequiredSiteInput['id'][] = []
  if (!input.jurisdictionId) missingInputs.push('jurisdiction')
  if (input.soilBearingKpa === null) missingInputs.push('soil')
  if (input.windSpeedMps === null) missingInputs.push('wind')
  if (!input.seismicClass) missingInputs.push('seismic')
  if (input.snowLoadKpa === null) missingInputs.push('snow')
  if ([input.floorCount, input.grossFloorAreaSqm, input.buildingWidthM, input.buildingDepthM, input.storeyHeightM].some((value) => value === null)) missingInputs.push('dimensions')
  if (!input.materials.length) missingInputs.push('materials')
  if (input.deadLoadKpa === null || input.liveLoadKpa === null) missingInputs.push('loads')

  const reasons: string[] = []
  const triggers = new Set<RecomputeTrigger>()
  const envelope = template.analysisEnvelope
  const stale = Date.parse(evaluatedAt) > Date.parse(template.reviewDueAt)

  if (envelope.state === 'NOT COMPUTED') reasons.push('No precomputed structural analysis envelope is attached to this template.')
  if (input.jurisdictionId && !envelope.jurisdictionIds.includes(input.jurisdictionId)) triggers.add('JURISDICTION')
  if (input.soilBearingKpa !== null && !within(input.soilBearingKpa, envelope.soilBearingKpa)) triggers.add('SOIL')
  if (input.windSpeedMps !== null && !within(input.windSpeedMps, envelope.windSpeedMps)) triggers.add('WIND')
  if (input.seismicClass && !envelope.seismicClasses.includes(input.seismicClass)) triggers.add('SEISMIC')
  if (input.snowLoadKpa !== null && !within(input.snowLoadKpa, envelope.snowLoadKpa)) triggers.add('SNOW')
  if (
    (input.floorCount !== null && !within(input.floorCount, envelope.coveredDimensions.floorCount)) ||
    (input.grossFloorAreaSqm !== null && !within(input.grossFloorAreaSqm, envelope.coveredDimensions.grossFloorAreaSqm)) ||
    (input.buildingWidthM !== null && !within(input.buildingWidthM, envelope.coveredDimensions.buildingWidthM)) ||
    (input.buildingDepthM !== null && !within(input.buildingDepthM, envelope.coveredDimensions.buildingDepthM)) ||
    (input.storeyHeightM !== null && !within(input.storeyHeightM, envelope.coveredDimensions.storeyHeightM))
  ) triggers.add('DIMENSIONS')
  if (input.materials.some((material) => !envelope.coveredMaterials.includes(material))) triggers.add('MATERIALS')
  if ((input.deadLoadKpa !== null && !within(input.deadLoadKpa, envelope.deadLoadKpa)) || (input.liveLoadKpa !== null && !within(input.liveLoadKpa, envelope.liveLoadKpa))) triggers.add('LOADS')
  if (input.userChanges.length) triggers.add('USER CHANGE')

  for (const trigger of Array.from(triggers)) reasons.push(`${trigger} differs from, or is outside, the recorded analysis envelope.`)
  if (stale) reasons.push(`Template review expired on ${template.reviewDueAt}.`)

  const state: TemplateValidityState = stale
    ? 'STALE TEMPLATE'
    : envelope.state === 'NOT COMPUTED'
      ? 'NOT PRECOMPUTED'
      : missingInputs.length
        ? 'INSUFFICIENT SITE INPUTS'
        : triggers.size
          ? 'RECOMPUTE REQUIRED'
          : 'WITHIN BOUNDED ENVELOPE'

  const reusable = state === 'WITHIN BOUNDED ENVELOPE'
  return {
    state,
    triggers: Array.from(triggers),
    missingInputs,
    reasons,
    reusableAnalysisRevision: reusable ? envelope.analysisRevision : null,
    reusableBoqRevision: reusable && template.boqBaseline.state === 'QUANTITY REVIEWED' ? template.boqBaseline.quantityRevision : null,
  }
}

export type BuildingIntent = {
  buildingType: string
  programme: string[]
  occupancy: string
  targetFloorCount: number
  targetGrossFloorAreaSqm: number
  preferences: string[]
  requestedChanges: ProjectTemplateInputs['userChanges']
}

export type BuildingVariant = {
  variantId: string
  templateId: string
  templateVersion: string
  parentVariantId: string | null
  intentKey: string
  intent: BuildingIntent
  createdAt: string
  tenantId: string
  lineage: string[]
  libraryState: 'PRIVATE CANDIDATE' | 'PROMOTION REVIEW' | 'APPROVED LIBRARY VERSION'
  trainingConsent: 'DENIED' | 'RETRIEVAL ONLY' | 'EXPLICIT TRAINING OPT-IN'
}

const normalized = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

function hashIntent(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function intentKey(intent: BuildingIntent): string {
  const canonical = JSON.stringify({
    buildingType: normalized(intent.buildingType),
    programme: intent.programme.map(normalized).sort(),
    occupancy: normalized(intent.occupancy),
    targetFloorCount: intent.targetFloorCount,
    targetGrossFloorAreaSqm: intent.targetGrossFloorAreaSqm,
    preferences: intent.preferences.map(normalized).sort(),
    requestedChanges: [...intent.requestedChanges].sort(),
  })
  return `intent-fnv1a32:${hashIntent(canonical)}`
}

export function deriveIntentVariant(
  template: BuildingTemplate,
  intent: BuildingIntent,
  context: { tenantId: string; createdAt: string; trainingConsent: BuildingVariant['trainingConsent']; parentVariantId?: string | null },
  existing: readonly BuildingVariant[] = [],
): { variant: BuildingVariant; deduplicated: boolean } {
  const key = intentKey(intent)
  const duplicate = existing.find((variant) => variant.templateId === template.templateId && variant.templateVersion === template.version && variant.intentKey === key && variant.tenantId === context.tenantId)
  if (duplicate) return { variant: duplicate, deduplicated: true }

  const parentVariantId = context.parentVariantId ?? null
  return {
    deduplicated: false,
    variant: {
      variantId: `${template.templateId}:variant:${key.split(':')[1]}`,
      templateId: template.templateId,
      templateVersion: template.version,
      parentVariantId,
      intentKey: key,
      intent: { ...intent, programme: [...intent.programme], preferences: [...intent.preferences], requestedChanges: [...intent.requestedChanges] },
      createdAt: context.createdAt,
      tenantId: context.tenantId,
      lineage: [template.templateId, ...(parentVariantId ? [parentVariantId] : [])],
      libraryState: 'PRIVATE CANDIDATE',
      trainingConsent: context.trainingConsent,
    },
  }
}

export type VariantPromotionEvidence = {
  libraryContributionConsentId: string | null
  licenceReviewId: string | null
  privacyReviewId: string | null
  deterministicCheckIds: string[]
  architectureReviewId: string | null
  engineeringReviewId: string | null
  quantityReviewId: string | null
  evaluationId: string | null
  versionedApprovalId: string | null
}

export function evaluateVariantPromotion(variant: BuildingVariant, evidence: VariantPromotionEvidence): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = []
  if (variant.libraryState === 'APPROVED LIBRARY VERSION') reasons.push('Approved library versions are immutable; create a successor candidate.')
  if (!evidence.libraryContributionConsentId) reasons.push('Explicit library-contribution consent is required; interaction alone is not consent.')
  if (!evidence.licenceReviewId) reasons.push('Licence review is required.')
  if (!evidence.privacyReviewId) reasons.push('Privacy and tenant-data review is required.')
  if (!evidence.deterministicCheckIds.length) reasons.push('Deterministic geometry and data checks are required.')
  if (!evidence.architectureReviewId) reasons.push('Architectural review is required.')
  if (!evidence.engineeringReviewId) reasons.push('Engineering review is required for coordinated structural outputs.')
  if (!evidence.quantityReviewId) reasons.push('Quantity review is required for a reusable BOQ baseline.')
  if (!evidence.evaluationId) reasons.push('A recorded evaluation is required.')
  if (!evidence.versionedApprovalId) reasons.push('A versioned approval is required.')
  return { allowed: reasons.length === 0, reasons }
}
