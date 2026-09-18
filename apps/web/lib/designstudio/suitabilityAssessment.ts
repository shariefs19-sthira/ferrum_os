import type { BuildingTemplate, ProjectTemplateInputs, RecomputeTrigger, TemplateEvaluation } from './buildingLibraryKernel'
import { evaluateTemplateForProject } from './buildingLibraryKernel'
import type { JurisdictionPack } from './jurisdictionPacks'
import type { EnvironmentalContext, EnvironmentalLayerKind } from './environmentalContext'
import type { GeotechnicalAssessment } from '../landintel/geotechnicalIntelligence'
import type { ParcelContext } from '../workspace/parcelContext'

// Building-template suitability ranking: physical fit, planning, environmental,
// structural, geotechnical, supply and delivery. This module ranks reuse
// readiness of a building template against a specific parcel/context; it
// never determines legal, structural or regulatory compliance itself - every
// dimension's ceiling state and required-action text say so explicitly.
// Reused contracts (never redefined here): BuildingTemplate/TemplateEvaluation
// from ./buildingLibraryKernel, GeotechnicalAssessment from
// ../landintel/geotechnicalIntelligence, ParcelContext from
// ../workspace/parcelContext, EnvironmentalContext from
// ./environmentalContext, JurisdictionPack from ./jurisdictionPacks.

export const SUITABILITY_SCHEMA = 'ferrum.designstudio.suitability.v1' as const

export type SuitabilityDimensionKey =
  | 'physical-fit'
  | 'planning'
  | 'environmental'
  | 'structural'
  | 'geotechnical'
  | 'supply'
  | 'delivery'

export const suitabilityDimensionKeys: readonly SuitabilityDimensionKey[] = Object.freeze([
  'physical-fit',
  'planning',
  'environmental',
  'structural',
  'geotechnical',
  'supply',
  'delivery',
])

export type SuitabilityState = 'SUPPORTED' | 'CONDITIONAL' | 'BLOCKED' | 'UNKNOWN' | 'STALE'

/** Worst-first ranking. The overall result is governed by the single weakest (lowest-ranked) dimension. */
const STATE_SEVERITY: Record<SuitabilityState, number> = {
  BLOCKED: 0,
  STALE: 1,
  UNKNOWN: 2,
  CONDITIONAL: 3,
  SUPPORTED: 4,
}

export function worseState(a: SuitabilityState, b: SuitabilityState): SuitabilityState {
  return STATE_SEVERITY[a] <= STATE_SEVERITY[b] ? a : b
}

export type SuitabilityEvidenceRef = {
  id: string
  label: string
  sourceContract: 'building-library' | 'geotechnical-intelligence' | 'jurisdiction-pack' | 'environmental-context' | 'parcel-context' | 'supply-context' | 'delivery-context'
  status: string
  note: string
}

export type SuitabilityDimensionAssessment = {
  dimension: SuitabilityDimensionKey
  state: SuitabilityState
  evidence: SuitabilityEvidenceRef[]
  requiredAction: string[]
  reasons: string[]
  missingInputs: string[]
}

const within = (value: number | null, range: { min: number; max: number }) => value !== null && value >= range.min && value <= range.max

// --- Physical fit -----------------------------------------------------------

export type PhysicalFitInput = {
  parcel: ParcelContext | null
  dimensions: Pick<ProjectTemplateInputs, 'floorCount' | 'grossFloorAreaSqm' | 'buildingWidthM' | 'buildingDepthM' | 'storeyHeightM'>
}

export function assessPhysicalFit(template: BuildingTemplate, input: PhysicalFitInput): SuitabilityDimensionAssessment {
  const envelope = template.parametricEnvelope
  const missingInputs: string[] = []
  const reasons: string[] = []

  if (!input.parcel) {
    missingInputs.push('parcel-selection')
  } else if (input.parcel.provenance.status === 'GAP' || input.parcel.area_sqm <= 0) {
    // A parcel record with GAP provenance or a zero recorded area carries no
    // usable geometry - it is unverified, not "out of envelope". Comparing
    // it against the plot-area envelope would fabricate a BLOCKED verdict
    // from data that was never actually measured.
    missingInputs.push('verified-parcel-geometry')
    reasons.push(`Parcel record is present but not usable for a plot-area comparison (provenance status ${input.parcel.provenance.status}, recorded area ${input.parcel.area_sqm} m²); verified geometry/area is required before this dimension can move past UNKNOWN.`)
  }
  if (input.dimensions.floorCount === null) missingInputs.push('floor-count')
  if (input.dimensions.grossFloorAreaSqm === null) missingInputs.push('gross-floor-area')
  if (input.dimensions.buildingWidthM === null) missingInputs.push('building-width')
  if (input.dimensions.buildingDepthM === null) missingInputs.push('building-depth')
  if (input.dimensions.storeyHeightM === null) missingInputs.push('storey-height')

  const parcelGeometryUsable = input.parcel !== null && input.parcel.provenance.status !== 'GAP' && input.parcel.area_sqm > 0
  const plotWithin = parcelGeometryUsable ? within(input.parcel!.area_sqm, envelope.plotAreaSqm) : null
  if (plotWithin === false) {
    reasons.push(`Parcel area ${input.parcel!.area_sqm} m² is outside the template's plot-area envelope (${envelope.plotAreaSqm.min}-${envelope.plotAreaSqm.max} m²).`)
  }

  const dimensionChecks: Array<{ ok: boolean | null; label: string }> = [
    { ok: input.dimensions.floorCount === null ? null : within(input.dimensions.floorCount, envelope.floorCount), label: 'floor count' },
    { ok: input.dimensions.grossFloorAreaSqm === null ? null : within(input.dimensions.grossFloorAreaSqm, envelope.grossFloorAreaSqm), label: 'gross floor area' },
    { ok: input.dimensions.buildingWidthM === null ? null : within(input.dimensions.buildingWidthM, envelope.buildingWidthM), label: 'building width' },
    { ok: input.dimensions.buildingDepthM === null ? null : within(input.dimensions.buildingDepthM, envelope.buildingDepthM), label: 'building depth' },
    { ok: input.dimensions.storeyHeightM === null ? null : within(input.dimensions.storeyHeightM, envelope.storeyHeightM), label: 'storey height' },
  ]
  const outOfEnvelope = dimensionChecks.filter((check) => check.ok === false).map((check) => check.label)
  for (const label of outOfEnvelope) reasons.push(`Requested ${label} falls outside the template's parametric envelope.`)

  const requiredAction: string[] = []
  let state: SuitabilityState
  if (plotWithin === false || outOfEnvelope.length) {
    state = 'BLOCKED'
    requiredAction.push('Select a template whose parametric envelope covers the requested plot and building dimensions, or adjust the requested dimensions.')
  } else if (missingInputs.length) {
    state = 'UNKNOWN'
    requiredAction.push('Provide parcel selection and target building dimensions to evaluate physical fit.')
  } else {
    // Geometry-within-envelope is never treated as SUPPORTED: it says nothing
    // about setbacks, coverage ratio or an authority-approved plot boundary.
    state = 'CONDITIONAL'
    requiredAction.push('Physical envelope fit is geometry-only; it does not confirm setbacks, coverage ratio or authority-approved plot boundaries.')
  }

  const evidence: SuitabilityEvidenceRef[] = [
    {
      id: 'template-parametric-envelope',
      label: 'Template parametric envelope',
      sourceContract: 'building-library',
      status: template.releaseState,
      note: `Plot ${envelope.plotAreaSqm.min}-${envelope.plotAreaSqm.max} m², floors ${envelope.floorCount.min}-${envelope.floorCount.max}.`,
    },
  ]
  if (input.parcel) {
    evidence.push({
      id: 'parcel-context',
      label: 'Selected parcel',
      sourceContract: 'parcel-context',
      status: input.parcel.provenance.status,
      note: `${input.parcel.area_sqm} m², ${input.parcel.provenance.source}.`,
    })
  }

  return { dimension: 'physical-fit', state, evidence, requiredAction, reasons, missingInputs }
}

// --- Planning ----------------------------------------------------------------

export function assessPlanning(pack: JurisdictionPack | undefined, template: BuildingTemplate): SuitabilityDimensionAssessment {
  const missingInputs: string[] = []
  const reasons: string[] = []
  const requiredAction: string[] = []
  let state: SuitabilityState

  if (!pack) {
    missingInputs.push('jurisdiction-pack')
    state = 'UNKNOWN'
    reasons.push('No jurisdiction pack is resolved for this project location.')
    requiredAction.push('Resolve the governing jurisdiction (country, state/province and local authority) before proceeding.')
  } else if (pack.status === 'RESEARCH-REQUIRED') {
    state = 'BLOCKED'
    reasons.push(`Jurisdiction pack "${pack.label}" has no reviewed rule set; regulatory fields are UNKNOWN.`)
    requiredAction.push('Commission jurisdiction research and a qualified planning review before this template is selected for the parcel.')
  } else if (pack.status === 'ADAPTER-READY') {
    state = 'CONDITIONAL'
    reasons.push(`Jurisdiction pack "${pack.label}" has connector adapters but no independently verified local rule adoption yet.`)
    requiredAction.push('Verify the adopting authority, code edition and amendments before relying on this pack for a specific parcel.')
  } else {
    // AVAILABLE never becomes SUPPORTED here: a resolved rule pack says a
    // rule set exists, never that this project is compliant with it.
    state = 'CONDITIONAL'
    reasons.push(`Jurisdiction pack "${pack.label}" is available; this assessment does not infer planning compliance from that alone.`)
    requiredAction.push('A qualified planning professional must confirm compliance for this specific parcel; this dimension only confirms an applicable rule pack exists.')
  }

  if (pack && template.jurisdictionApplicability.length && !template.jurisdictionApplicability.includes('PROJECT REVIEW REQUIRED')) {
    const listed = template.jurisdictionApplicability.some((entry) => pack.scope.includes(entry) || entry === pack.id || entry === pack.label)
    if (!listed) {
      reasons.push(`Template jurisdiction applicability (${template.jurisdictionApplicability.join(', ')}) does not explicitly list the resolved jurisdiction pack.`)
      state = worseState(state, 'CONDITIONAL')
      requiredAction.push('Confirm this template is intended for the resolved jurisdiction before selection.')
    }
  }

  return {
    dimension: 'planning',
    state,
    evidence: pack ? [{ id: `jurisdiction-pack-${pack.id}`, label: pack.label, sourceContract: 'jurisdiction-pack', status: pack.status, note: pack.rule }] : [],
    requiredAction,
    reasons,
    missingInputs,
  }
}

// --- Environmental -------------------------------------------------------------

/**
 * Layers this dimension actually requires to render a usable site context.
 * `photoreal-context` is deliberately excluded: the contract itself marks it
 * optional and gated pending provider integration, so its absence is never a
 * gap in this dimension.
 */
const REQUIRED_ENVIRONMENTAL_LAYER_KINDS: EnvironmentalLayerKind[] = [
  'cadastral-boundary',
  'terrain',
  'osm-context',
  'proposed-design',
]

export function assessEnvironmental(context: EnvironmentalContext): SuitabilityDimensionAssessment {
  const missingInputs: string[] = []
  const reasons: string[] = []
  const requiredAction: string[] = []
  let state: SuitabilityState = 'SUPPORTED'

  const byKind = new Map(context.layers.map((layer) => [layer.kind, layer]))

  // Empty or incomplete layer sets are UNKNOWN with an explicit missing
  // input - never SUPPORTED by default (there is nothing to be confident
  // about) and never silently treated as "no issue" because other checks
  // below happen not to fire on an empty array.
  const missingLayerKinds = REQUIRED_ENVIRONMENTAL_LAYER_KINDS.filter((kind) => !byKind.has(kind))
  if (missingLayerKinds.length) {
    state = worseState(state, 'UNKNOWN')
    for (const kind of missingLayerKinds) missingInputs.push(kind)
    reasons.push(
      context.layers.length === 0
        ? 'No environmental layers are present in this context.'
        : `Environmental context is missing required layer(s): ${missingLayerKinds.join(', ')}.`,
    )
    requiredAction.push('Build a complete environmental context (cadastral boundary, terrain, contextual buildings/roads and the proposed design) before this dimension can be evaluated past UNKNOWN.')
  }

  if (context.cadastralBoundary.status === 'NO-PARCEL-SELECTED') {
    state = worseState(state, 'UNKNOWN')
    missingInputs.push('cadastral-boundary')
    reasons.push('No parcel boundary is loaded; environmental context cannot be anchored to a real site.')
    requiredAction.push('Select a parcel in Project Context before evaluating environmental context.')
  }

  // An UNAVAILABLE required layer means no source is connected at all. That
  // is never downgraded to CONDITIONAL by default - only a specific,
  // recorded contract rationale plus supporting evidence could justify
  // treating a missing source as an acceptable conditional pass, and no such
  // rationale/evidence is modelled here, so the ceiling stays UNKNOWN.
  const unavailableRequired = REQUIRED_ENVIRONMENTAL_LAYER_KINDS.filter((kind) => byKind.get(kind)?.provenance.confidence === 'UNAVAILABLE')
  if (unavailableRequired.length) {
    state = worseState(state, 'UNKNOWN')
    for (const kind of unavailableRequired) missingInputs.push(kind)
    reasons.push(`No connected source for: ${unavailableRequired.join(', ')} (confidence UNAVAILABLE); this is never treated as a conditional pass without a recorded contract rationale and supporting evidence, neither of which is present.`)
    requiredAction.push('Connect a verified source for each UNAVAILABLE required layer, or record the specific contract rationale and evidence that justifies proceeding without it.')
  }

  const indicative = context.layers.filter(
    (layer) => REQUIRED_ENVIRONMENTAL_LAYER_KINDS.includes(layer.kind) && (layer.provenance.confidence === 'INDICATIVE' || layer.provenance.confidence === 'SAMPLE-FIXTURE'),
  )
  if (indicative.length) {
    state = worseState(state, 'CONDITIONAL')
    reasons.push('One or more environmental layers are indicative or sample-fixture data, not verified site survey.')
    requiredAction.push('Treat indicative/sample-fixture layers as contextual only; commission survey-grade data before relying on them for setbacks or levels.')
  }

  if (state === 'SUPPORTED') requiredAction.push('No outstanding environmental-context gaps are recorded for this parcel as of this evaluation.')

  return {
    dimension: 'environmental',
    state,
    evidence: context.layers.map((layer) => ({ id: layer.id, label: layer.label, sourceContract: 'environmental-context', status: layer.provenance.confidence, note: layer.note })),
    requiredAction,
    reasons,
    missingInputs,
  }
}

// --- Structural -----------------------------------------------------------------

export function assessStructural(template: BuildingTemplate, evaluation: TemplateEvaluation): SuitabilityDimensionAssessment {
  const missingInputs = evaluation.missingInputs.filter((id) => id !== 'jurisdiction')
  const reasons = [...evaluation.reasons]
  const requiredAction: string[] = []
  let state: SuitabilityState

  switch (evaluation.state) {
    case 'WITHIN BOUNDED ENVELOPE':
      state = 'CONDITIONAL'
      requiredAction.push('Structural inputs sit within the precomputed analysis envelope; a project-specific engineering sign-off is still required before issue.')
      break
    case 'RECOMPUTE REQUIRED':
      state = 'STALE'
      requiredAction.push(`Recompute the structural analysis for: ${evaluation.triggers.join(', ')}.`)
      break
    case 'STALE TEMPLATE':
      state = 'STALE'
      requiredAction.push('Template review has expired; re-verify the structural system before reuse.')
      break
    case 'INSUFFICIENT SITE INPUTS':
      state = 'UNKNOWN'
      requiredAction.push(`Provide: ${evaluation.missingInputs.join(', ')}.`)
      break
    case 'NOT PRECOMPUTED':
    default:
      state = 'BLOCKED'
      requiredAction.push('No precomputed structural analysis envelope exists for this template; a structural engineer must establish one before use.')
  }

  if (template.structuralSystem.state === 'UNSPECIFIED') {
    reasons.push(template.structuralSystem.limitation)
    state = worseState(state, 'CONDITIONAL')
  }

  return {
    dimension: 'structural',
    state,
    evidence: [
      {
        id: `${template.templateId}-analysis-envelope`,
        label: 'Precomputed analysis envelope',
        sourceContract: 'building-library',
        status: evaluation.state,
        note: template.structuralSystem.limitation,
      },
    ],
    requiredAction,
    reasons,
    missingInputs,
  }
}

// --- Geotechnical -----------------------------------------------------------------

export function assessGeotechnicalDimension(assessment: GeotechnicalAssessment): SuitabilityDimensionAssessment {
  const missingInputs = assessment.holds.some((hold) => hold.startsWith('Project investigation evidence required')) ? ['project-geotechnical-investigation'] : []
  const stale = assessment.holds.some((hold) => hold.toLowerCase().includes('stale'))

  let state: SuitabilityState
  if (assessment.suitability === 'BLOCKED') state = 'BLOCKED'
  else if (stale) state = 'STALE'
  else if (assessment.suitability === 'SCREENING ONLY') state = 'UNKNOWN'
  // CONDITIONAL is this dimension's ceiling: regional or project evidence
  // never becomes a bearing-capacity or foundation-design guarantee here.
  else state = 'CONDITIONAL'

  return {
    dimension: 'geotechnical',
    state,
    evidence: assessment.evidence.slice(0, 8).map((item) => ({
      id: item.id,
      label: item.label,
      sourceContract: 'geotechnical-intelligence',
      status: item.status,
      note: item.limitations.join('; ') || 'No stated limitation.',
    })),
    requiredAction: [...assessment.holds, 'A registered geotechnical professional must interpret project investigation evidence before foundation design.'],
    reasons: assessment.holds,
    missingInputs,
  }
}

// --- Supply -----------------------------------------------------------------

export type SupplyMaterialAvailability = 'AVAILABLE' | 'CONSTRAINED' | 'UNAVAILABLE' | 'UNKNOWN'

export type SupplyContext = {
  materialAvailability: Record<string, SupplyMaterialAvailability>
  procurementHolds: string[]
  evaluatedAt: string
}

export function assessSupply(template: BuildingTemplate, supply: SupplyContext | null): SuitabilityDimensionAssessment {
  if (!supply) {
    return {
      dimension: 'supply',
      state: 'UNKNOWN',
      evidence: [],
      requiredAction: ['Provide material availability and procurement-hold data for this project.'],
      reasons: ['No supply context was provided.'],
      missingInputs: ['supply-context'],
    }
  }

  const requiredMaterials = template.structuralSystem.materialFamilies.length ? template.structuralSystem.materialFamilies : ['UNSPECIFIED-MATERIAL-FAMILY']
  const unavailable = requiredMaterials.filter((material) => supply.materialAvailability[material] === 'UNAVAILABLE')
  const constrained = requiredMaterials.filter((material) => supply.materialAvailability[material] === 'CONSTRAINED')
  const unknown = requiredMaterials.filter((material) => !supply.materialAvailability[material] || supply.materialAvailability[material] === 'UNKNOWN')

  const missingInputs: string[] = []
  const reasons: string[] = []
  const requiredAction: string[] = []
  let state: SuitabilityState

  if (unavailable.length || supply.procurementHolds.length) {
    state = 'BLOCKED'
    reasons.push(...supply.procurementHolds)
    requiredAction.push(`Resolve unavailable material supply: ${unavailable.join(', ') || 'see procurement holds'}.`)
  } else if (unknown.length === requiredMaterials.length) {
    state = 'UNKNOWN'
    missingInputs.push('material-availability')
    requiredAction.push('Record material availability for each required material family.')
  } else if (constrained.length || unknown.length) {
    state = 'CONDITIONAL'
    requiredAction.push(`Confirm lead time and alternate sourcing for: ${[...constrained, ...unknown].join(', ')}.`)
  } else {
    state = 'SUPPORTED'
    requiredAction.push('All required material families report available supply as of the evaluation date; this is a supply-availability check only, not a locked procurement commitment.')
  }

  return {
    dimension: 'supply',
    state,
    evidence: requiredMaterials.map((material) => ({
      id: `supply-${material}`,
      label: material,
      sourceContract: 'supply-context',
      status: supply.materialAvailability[material] ?? 'UNKNOWN',
      note: `Evaluated ${supply.evaluatedAt}.`,
    })),
    requiredAction,
    reasons,
    missingInputs,
  }
}

// --- Delivery -----------------------------------------------------------------

export type DeliveryAccessState = 'CONFIRMED' | 'CONSTRAINED' | 'UNCONFIRMED' | 'UNKNOWN'

export type DeliveryContext = {
  siteAccess: DeliveryAccessState
  logisticsNotes: string[]
  deliveryWindowConfirmed: boolean
  evaluatedAt: string
}

export function assessDelivery(delivery: DeliveryContext | null): SuitabilityDimensionAssessment {
  if (!delivery) {
    return {
      dimension: 'delivery',
      state: 'UNKNOWN',
      evidence: [],
      requiredAction: ['Provide site-access and delivery-window information.'],
      reasons: ['No delivery context was provided.'],
      missingInputs: ['delivery-context'],
    }
  }

  const missingInputs: string[] = []
  let state: SuitabilityState
  if (delivery.siteAccess === 'UNKNOWN' || delivery.siteAccess === 'UNCONFIRMED') {
    state = 'UNKNOWN'
    missingInputs.push('site-access-confirmation')
  } else if (delivery.siteAccess === 'CONSTRAINED' || !delivery.deliveryWindowConfirmed) {
    state = 'CONDITIONAL'
  } else {
    state = 'SUPPORTED'
  }

  const requiredAction = state === 'SUPPORTED'
    ? ['No outstanding delivery-logistics gaps are recorded as of this evaluation.']
    : ['Confirm site access route, load-in constraints and a delivery window before scheduling site works.']

  return {
    dimension: 'delivery',
    state,
    evidence: [
      {
        id: 'delivery-context',
        label: 'Site access and delivery window',
        sourceContract: 'delivery-context',
        status: delivery.siteAccess,
        note: delivery.deliveryWindowConfirmed ? 'Delivery window confirmed.' : 'Delivery window not confirmed.',
      },
    ],
    requiredAction,
    reasons: [...delivery.logisticsNotes],
    missingInputs,
  }
}

// --- Change impact ------------------------------------------------------------

export type ChangeImpactOutput = {
  evidenceReused: SuitabilityDimensionKey[]
  recheckRequired: SuitabilityDimensionKey[]
  recomputationRequired: RecomputeTrigger[]
  professionalReviewRequired: SuitabilityDimensionKey[]
  missingInputs: string[]
}

/** Dimensions whose worst non-SUPPORTED state always implies a named professional must sign off, never an automated inference. */
const PROFESSIONAL_REVIEW_DIMENSIONS: SuitabilityDimensionKey[] = ['structural', 'geotechnical', 'planning']

export function computeChangeImpact(dimensions: SuitabilityDimensionAssessment[], structuralTriggers: RecomputeTrigger[]): ChangeImpactOutput {
  const evidenceReused: SuitabilityDimensionKey[] = []
  const recheckRequired: SuitabilityDimensionKey[] = []
  const professionalReviewRequired: SuitabilityDimensionKey[] = []
  const missingInputs = new Set<string>()

  for (const dimension of dimensions) {
    if (dimension.state === 'SUPPORTED' || (dimension.state === 'CONDITIONAL' && dimension.missingInputs.length === 0)) {
      evidenceReused.push(dimension.dimension)
    }
    if (dimension.state === 'STALE') recheckRequired.push(dimension.dimension)
    if (PROFESSIONAL_REVIEW_DIMENSIONS.includes(dimension.dimension) && dimension.state !== 'SUPPORTED') professionalReviewRequired.push(dimension.dimension)
    for (const missing of dimension.missingInputs) missingInputs.add(missing)
  }

  return {
    evidenceReused,
    recheckRequired,
    recomputationRequired: [...structuralTriggers],
    professionalReviewRequired,
    missingInputs: Array.from(missingInputs),
  }
}

// --- Aggregate --------------------------------------------------------------

export type SuitabilityAssessmentInput = {
  template: BuildingTemplate
  templateInputs: ProjectTemplateInputs
  parcel: ParcelContext | null
  jurisdictionPack: JurisdictionPack | undefined
  environmentalContext: EnvironmentalContext
  geotechnicalAssessment: GeotechnicalAssessment
  supply: SupplyContext | null
  delivery: DeliveryContext | null
  evaluatedAt: string
}

export type BuildingTemplateSuitability = {
  schema: typeof SUITABILITY_SCHEMA
  templateId: string
  evaluatedAt: string
  overallState: SuitabilityState
  governingDimension: SuitabilityDimensionKey
  dimensions: SuitabilityDimensionAssessment[]
  changeImpact: ChangeImpactOutput
}

export function assessBuildingTemplateSuitability(input: SuitabilityAssessmentInput): BuildingTemplateSuitability {
  const evaluation = evaluateTemplateForProject(input.template, input.templateInputs, input.evaluatedAt)

  const dimensions: SuitabilityDimensionAssessment[] = [
    assessPhysicalFit(input.template, { parcel: input.parcel, dimensions: input.templateInputs }),
    assessPlanning(input.jurisdictionPack, input.template),
    assessEnvironmental(input.environmentalContext),
    assessStructural(input.template, evaluation),
    assessGeotechnicalDimension(input.geotechnicalAssessment),
    assessSupply(input.template, input.supply),
    assessDelivery(input.delivery),
  ]

  let governingDimension = dimensions[0].dimension
  let overallState = dimensions[0].state
  for (const dimension of dimensions.slice(1)) {
    if (STATE_SEVERITY[dimension.state] < STATE_SEVERITY[overallState]) {
      overallState = dimension.state
      governingDimension = dimension.dimension
    }
  }

  return {
    schema: SUITABILITY_SCHEMA,
    templateId: input.template.templateId,
    evaluatedAt: input.evaluatedAt,
    overallState,
    governingDimension,
    dimensions,
    changeImpact: computeChangeImpact(dimensions, evaluation.triggers),
  }
}
