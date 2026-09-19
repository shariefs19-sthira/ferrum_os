import type { BuildingTemplate } from './buildingLibraryKernel'
import {
  deriveCandidateVariant,
  evaluatePromotionGate,
  type CandidateVariant,
  type IntentFacets,
  type ParentBaselineFacets,
  type PromotionEvidence,
  type PromotionGateResult,
} from './libraryEvolutionContract'

// Honest sample fixture for the DesignStudio library-variant lineage panel.
// Ferrum has no persisted user brief, no stored variant record and no consent
// ledger in Project Context yet, so the intent below is synthetic. It is
// always presented as an INDICATIVE sample - even when a parcel is loaded,
// because a parcel does not supply a design intent.

export const LIBRARY_VARIANT_SAMPLE_NOTE =
  'SAMPLE INTENT - INDICATIVE. No saved design brief or library-variant record exists in Project Context; the intent facets below are synthetic demonstration data, not a real user request.'

export const LIBRARY_VARIANT_SAMPLE_TENANT = 'sample-tenant'
export const LIBRARY_VARIANT_SAMPLE_CREATED_AT = '2026-09-19T00:00:00.000Z'

/** Parent baseline read literally from the approved template - no inference. */
export function baselineFromTemplate(template: BuildingTemplate): ParentBaselineFacets {
  const { parametricEnvelope, structuralSystem } = template
  return {
    buildingTypes: [...template.buildingTypes],
    programme: [...template.programmes],
    targetFloorCount: parametricEnvelope.floorCount.min,
    targetGrossFloorAreaSqm: Math.round((parametricEnvelope.grossFloorAreaSqm.min + parametricEnvelope.grossFloorAreaSqm.max) / 2),
    materials: [...structuralSystem.materialFamilies],
    openings: [],
    structuralSystem: structuralSystem.gravitySystem,
  }
}

/** Synthetic intent, expressed as small edits to the parent baseline so the
 * derived deltas are legible: one more storey where the envelope allows, +10%
 * floor area, one extra programme line, one extra material and opening. */
export function buildSampleIntent(template: BuildingTemplate): IntentFacets {
  const baseline = baselineFromTemplate(template)
  const { floorCount } = template.parametricEnvelope
  return {
    buildingType: baseline.buildingTypes[0] ?? 'Residential',
    programme: [...baseline.programme, 'Home office'],
    occupancy: template.occupancies[0] ?? 'Unspecified',
    targetFloorCount: Math.min(floorCount.max, baseline.targetFloorCount + 1),
    targetGrossFloorAreaSqm: Math.round(baseline.targetGrossFloorAreaSqm * 1.1),
    materialPreferences: [...baseline.materials, 'Timber screening'],
    openingPreferences: ['Shaded verandah opening'],
    structuralSystemPreference: null,
  }
}

export function buildSampleCandidate(template: BuildingTemplate): CandidateVariant {
  return deriveCandidateVariant({
    tenantId: LIBRARY_VARIANT_SAMPLE_TENANT,
    parentTemplateId: template.templateId,
    parentTemplateVersion: template.version,
    parentVariant: null,
    parentBaseline: baselineFromTemplate(template),
    parentLicenceId: template.provenance.licence.licenceId,
    parentLicenceReusable: template.provenance.licence.reusableInPublicLibrary,
    copyrightBoundary: template.provenance.copyrightBoundary,
    intent: buildSampleIntent(template),
    createdAt: LIBRARY_VARIANT_SAMPLE_CREATED_AT,
    // No consent has been recorded anywhere, so none is supplied.
    consentGrant: null,
  })
}

/** No human review, geometry check, engineering verification, licence or
 * privacy review has happened for a sample - every evidence slot is empty. */
export const NO_PROMOTION_EVIDENCE: PromotionEvidence = {
  humanReviewerId: null,
  humanApprovalId: null,
  engineeringVerificationId: null,
  geometryCheckId: null,
  licenceReviewId: null,
  privacyReviewId: null,
  deduplicationCheckPassed: false,
}

export function evaluateSamplePromotionGate(candidate: CandidateVariant): PromotionGateResult {
  return evaluatePromotionGate(candidate, NO_PROMOTION_EVIDENCE)
}
