import { describe, expect, it } from 'vitest'
import {
  LIBRARY_EVOLUTION_SCHEMA,
  computeValidationState,
  deltaSimilarity,
  deriveCandidateVariant,
  deriveLicence,
  deriveLineage,
  deriveParameterDeltas,
  evaluatePromotionGate,
  evaluateReuseEligibility,
  findSimilarVariant,
  intentFingerprint,
  resolvePrivacyConsent,
  validationStateAtLeast,
  type CandidateVariant,
  type DeriveCandidateVariantInput,
  type IntentFacets,
  type ParentBaselineFacets,
} from './libraryEvolutionContract'

/** `findSimilarVariant` takes a flattened dedup key, not a full CandidateVariant. */
const asDedupKey = (variant: CandidateVariant) => ({
  variantId: variant.variantId,
  tenantId: variant.tenantId,
  parentTemplateId: variant.lineage.parentTemplateId,
  parentTemplateVersion: variant.lineage.parentTemplateVersion,
  intentFingerprint: variant.intentFingerprint,
  deltas: variant.deltas,
})

const parentBaseline: ParentBaselineFacets = {
  buildingTypes: ['Residential'],
  programme: ['Kitchen', 'Living'],
  targetFloorCount: 2,
  targetGrossFloorAreaSqm: 200,
  materials: ['brick'],
  openings: ['timber-window'],
  structuralSystem: 'load-bearing-masonry',
}

const baseIntent: IntentFacets = {
  buildingType: 'Residential',
  programme: ['Kitchen', 'Living', '3 Bedrooms'],
  occupancy: 'Single family',
  targetFloorCount: 2,
  targetGrossFloorAreaSqm: 220,
  materialPreferences: ['brick', 'exposed-concrete'],
  openingPreferences: ['timber-window'],
  structuralSystemPreference: null,
}

const baseInput: DeriveCandidateVariantInput = {
  tenantId: 'tenant-1',
  parentTemplateId: 'ferrum:kerala-courtyard',
  parentTemplateVersion: '0.1.0',
  parentVariant: null,
  parentBaseline,
  parentLicenceId: 'FERRUM-INTERNAL-TEMPLATE-1.0',
  parentLicenceReusable: true,
  copyrightBoundary: 'Original Ferrum massing study; no architect project geometry reproduced.',
  intent: baseIntent,
  createdAt: '2026-09-19T00:00:00.000Z',
  consentGrant: null,
}

describe('lineage', () => {
  it('records depth 0 for a template-derived candidate', () => {
    const lineage = deriveLineage('ferrum:x', '0.1.0', null)
    expect(lineage).toEqual({ parentTemplateId: 'ferrum:x', parentTemplateVersion: '0.1.0', parentVariantId: null, depth: 0 })
  })

  it('increments depth when derived from an existing variant', () => {
    const parentVariant = { variantId: 'ferrum:x@0.1.0:variant:abc', lineage: { parentTemplateId: 'ferrum:x', parentTemplateVersion: '0.1.0', parentVariantId: null, depth: 0 } }
    const lineage = deriveLineage('ferrum:x', '0.1.0', parentVariant)
    expect(lineage.parentVariantId).toBe('ferrum:x@0.1.0:variant:abc')
    expect(lineage.depth).toBe(1)
  })
})

describe('intent fingerprint', () => {
  it('is stable under reordering and case/whitespace differences', () => {
    const a = intentFingerprint(baseIntent)
    const reordered: IntentFacets = { ...baseIntent, programme: [...baseIntent.programme].reverse(), materialPreferences: [' Brick ', 'exposed-concrete'] }
    expect(intentFingerprint(reordered)).toBe(a)
  })

  it('differs when a facet actually changes', () => {
    const a = intentFingerprint(baseIntent)
    const b = intentFingerprint({ ...baseIntent, targetFloorCount: 3 })
    expect(a).not.toBe(b)
  })
})

describe('deriveParameterDeltas', () => {
  it('is empty when intent exactly matches the parent baseline', () => {
    const matchingIntent: IntentFacets = {
      buildingType: 'Residential',
      programme: ['Kitchen', 'Living'],
      occupancy: 'n/a',
      targetFloorCount: 2,
      targetGrossFloorAreaSqm: 200,
      materialPreferences: ['brick'],
      openingPreferences: ['timber-window'],
      structuralSystemPreference: null,
    }
    expect(deriveParameterDeltas(parentBaseline, matchingIntent)).toEqual([])
  })

  it('reports every dimension, material, programme and opening change deterministically', () => {
    const deltas = deriveParameterDeltas(parentBaseline, baseIntent)
    const paths = deltas.map((d) => d.path).sort()
    expect(paths).toEqual(['materials', 'programme', 'targetGrossFloorAreaSqm'])
    const gfa = deltas.find((d) => d.path === 'targetGrossFloorAreaSqm')
    expect(gfa).toEqual({ path: 'targetGrossFloorAreaSqm', kind: 'DIMENSION', fromValue: 200, toValue: 220 })
  })

  it('produces the same delta set regardless of array order (determinism)', () => {
    const d1 = deriveParameterDeltas(parentBaseline, baseIntent)
    const shuffled: IntentFacets = { ...baseIntent, materialPreferences: [...baseIntent.materialPreferences].reverse() }
    const d2 = deriveParameterDeltas(parentBaseline, shuffled)
    expect(d2).toEqual(d1)
  })
})

describe('deltaSimilarity + findSimilarVariant', () => {
  it('scores identical delta sets as 1 and disjoint sets as 0', () => {
    const deltas = deriveParameterDeltas(parentBaseline, baseIntent)
    expect(deltaSimilarity(deltas, deltas)).toBe(1)
    const other = deriveParameterDeltas(parentBaseline, { ...baseIntent, targetFloorCount: 9, materialPreferences: ['steel'], programme: ['Garage'] })
    expect(deltaSimilarity(deltas, other)).toBeLessThan(1)
  })

  it('flags an exact intent-fingerprint duplicate ahead of any similarity scoring', () => {
    const candidate = deriveCandidateVariant(baseInput)
    const existing = [asDedupKey(candidate)]
    const dup = deriveCandidateVariant({ ...baseInput, createdAt: '2026-09-20T00:00:00.000Z' })
    const match = findSimilarVariant(asDedupKey(dup), existing)
    expect(match).toEqual({ variantId: candidate.variantId, similarity: 1, exactFingerprintMatch: true })
  })

  it('does not match across a different tenant even with identical intent', () => {
    const candidate = deriveCandidateVariant(baseInput)
    const otherTenant = deriveCandidateVariant({ ...baseInput, tenantId: 'tenant-2' })
    const match = findSimilarVariant(asDedupKey(otherTenant), [asDedupKey(candidate)])
    expect(match).toBeNull()
  })

  it('returns null below the similarity threshold', () => {
    const candidate = deriveCandidateVariant(baseInput)
    const farVariant = deriveCandidateVariant({ ...baseInput, intent: { ...baseIntent, targetFloorCount: 40, targetGrossFloorAreaSqm: 40000, materialPreferences: ['steel', 'glass-curtain-wall'], programme: ['Data hall'] } })
    const match = findSimilarVariant(asDedupKey(farVariant), [asDedupKey(candidate)], 0.85)
    expect(match).toBeNull()
  })
})

describe('licence', () => {
  it('never marks a freshly derived private candidate as publicly reusable, even when the parent is', () => {
    const licence = deriveLicence('FERRUM-INTERNAL-TEMPLATE-1.0', true)
    expect(licence.reusableInPublicLibrary).toBe(false)
    expect(licence.rightsBasis).toBe('TENANT_PRIVATE_DERIVATIVE')
  })
})

describe('privacy consent', () => {
  it('defaults to NOT_GRANTED with no explicit grant', () => {
    expect(resolvePrivacyConsent(null)).toEqual({ state: 'NOT_GRANTED', consentId: null, grantedAt: null })
  })

  it('never upgrades an explicit RETRIEVAL_ONLY grant into training consent', () => {
    const consent = resolvePrivacyConsent({ consentId: 'c-1', grantedAt: '2026-09-19', state: 'RETRIEVAL_ONLY' })
    expect(consent.state).toBe('RETRIEVAL_ONLY')
  })
})

describe('validation state', () => {
  it('is GENERATED with no evidence at all', () => {
    expect(computeValidationState({ geometryCheckId: null, engineeringVerificationId: null, humanApprovalId: null })).toBe('GENERATED')
  })

  it('requires geometry before engineering can count, in order', () => {
    expect(computeValidationState({ geometryCheckId: null, engineeringVerificationId: 'e-1', humanApprovalId: null })).toBe('GENERATED')
    expect(computeValidationState({ geometryCheckId: 'g-1', engineeringVerificationId: null, humanApprovalId: null })).toBe('GEOMETRY_CHECKED')
    expect(computeValidationState({ geometryCheckId: 'g-1', engineeringVerificationId: 'e-1', humanApprovalId: null })).toBe('ENGINEERING_VERIFIED')
    expect(computeValidationState({ geometryCheckId: 'g-1', engineeringVerificationId: 'e-1', humanApprovalId: 'h-1' })).toBe('APPROVED_FOR_ISSUE')
  })

  it('orders states correctly for validationStateAtLeast', () => {
    expect(validationStateAtLeast('ENGINEERING_VERIFIED', 'GEOMETRY_CHECKED')).toBe(true)
    expect(validationStateAtLeast('GEOMETRY_CHECKED', 'ENGINEERING_VERIFIED')).toBe(false)
  })
})

describe('reuse eligibility', () => {
  const licence = deriveLicence('lic-1', true)
  const noConsent = resolvePrivacyConsent(null)
  const trainingConsent = resolvePrivacyConsent({ consentId: 'c-1', grantedAt: '2026-09-19', state: 'TRAINING_OPT_IN' })

  it('always allows tenant-private reuse regardless of validation state', () => {
    expect(evaluateReuseEligibility('TENANT_PRIVATE_REUSE', 'GENERATED', licence, noConsent).eligible).toBe(true)
  })

  it('blocks structural/BOQ reuse below GEOMETRY_CHECKED', () => {
    const result = evaluateReuseEligibility('STRUCTURAL_REUSE', 'GENERATED', licence, noConsent)
    expect(result.eligible).toBe(false)
    expect(result.reasons[0]).toContain('GEOMETRY_CHECKED')
  })

  it('allows structural/BOQ reuse once geometry-checked, without claiming engineering verification', () => {
    const result = evaluateReuseEligibility('BOQ_REUSE', 'GEOMETRY_CHECKED', licence, noConsent)
    expect(result.eligible).toBe(true)
    expect(result.reasons[0]).toContain('not a verified result')
  })

  it('blocks public library reuse without APPROVED_FOR_ISSUE, licence and explicit training consent', () => {
    expect(evaluateReuseEligibility('PUBLIC_LIBRARY_REUSE', 'APPROVED_FOR_ISSUE', licence, noConsent).eligible).toBe(false)
    expect(evaluateReuseEligibility('PUBLIC_LIBRARY_REUSE', 'GEOMETRY_CHECKED', licence, trainingConsent).eligible).toBe(false)
  })

  it('allows public library reuse only when every condition is actually met', () => {
    const reusableLicence = { ...licence, reusableInPublicLibrary: true }
    const result = evaluateReuseEligibility('PUBLIC_LIBRARY_REUSE', 'APPROVED_FOR_ISSUE', reusableLicence, trainingConsent)
    expect(result.eligible).toBe(true)
  })
})

describe('promotion gate', () => {
  const consent = resolvePrivacyConsent({ consentId: 'c-1', grantedAt: '2026-09-19', state: 'TRAINING_OPT_IN' })
  const licence = deriveLicence('lic-1', true)
  const candidate = { libraryState: 'PRIVATE_CANDIDATE' as const, consent, licence }

  it('blocks promotion with no evidence at all', () => {
    const result = evaluatePromotionGate(candidate, {
      humanReviewerId: null,
      humanApprovalId: null,
      engineeringVerificationId: null,
      geometryCheckId: null,
      licenceReviewId: null,
      privacyReviewId: null,
      deduplicationCheckPassed: false,
    })
    expect(result.allowed).toBe(false)
    expect(result.blockingReasons.length).toBeGreaterThan(0)
  })

  it('blocks promotion when every check passes except human approval', () => {
    const result = evaluatePromotionGate(candidate, {
      humanReviewerId: null,
      humanApprovalId: null,
      engineeringVerificationId: 'e-1',
      geometryCheckId: 'g-1',
      licenceReviewId: 'l-1',
      privacyReviewId: 'p-1',
      deduplicationCheckPassed: true,
    })
    expect(result.allowed).toBe(false)
    expect(result.blockingReasons.some((r) => r.toLowerCase().includes('human'))).toBe(true)
  })

  it('allows promotion only once every gate condition, including explicit human approval, is met', () => {
    const result = evaluatePromotionGate(candidate, {
      humanReviewerId: 'reviewer-1',
      humanApprovalId: 'approval-1',
      engineeringVerificationId: 'e-1',
      geometryCheckId: 'g-1',
      licenceReviewId: 'l-1',
      privacyReviewId: 'p-1',
      deduplicationCheckPassed: true,
    })
    expect(result).toEqual({ allowed: true, blockingReasons: [] })
  })

  it('never allows re-promoting an already-approved library version', () => {
    const approved = { ...candidate, libraryState: 'APPROVED_LIBRARY_VERSION' as const }
    const result = evaluatePromotionGate(approved, {
      humanReviewerId: 'reviewer-1',
      humanApprovalId: 'approval-1',
      engineeringVerificationId: 'e-1',
      geometryCheckId: 'g-1',
      licenceReviewId: 'l-1',
      privacyReviewId: 'p-1',
      deduplicationCheckPassed: true,
    })
    expect(result.allowed).toBe(false)
  })
})

describe('deriveCandidateVariant', () => {
  it('always starts GENERATED and PRIVATE_CANDIDATE, never engineering-verified on creation', () => {
    const variant = deriveCandidateVariant(baseInput)
    expect(variant.schema).toBe(LIBRARY_EVOLUTION_SCHEMA)
    expect(variant.validationState).toBe('GENERATED')
    expect(variant.libraryState).toBe('PRIVATE_CANDIDATE')
    expect(variant.provenance.generationMethod).toBe('DETERMINISTIC_PARAMETER_DERIVATION')
  })

  it('defaults consent to NOT_GRANTED when no explicit grant is supplied', () => {
    const variant = deriveCandidateVariant(baseInput)
    expect(variant.consent.state).toBe('NOT_GRANTED')
  })

  it('is fully deterministic: identical input always produces identical variantId, fingerprint and deltas', () => {
    const a = deriveCandidateVariant(baseInput)
    const b = deriveCandidateVariant(baseInput)
    expect(a.variantId).toBe(b.variantId)
    expect(a.intentFingerprint).toBe(b.intentFingerprint)
    expect(a.deltas).toEqual(b.deltas)
  })

  it('carries lineage back to the parent template', () => {
    const variant = deriveCandidateVariant(baseInput)
    expect(variant.lineage).toEqual({ parentTemplateId: baseInput.parentTemplateId, parentTemplateVersion: baseInput.parentTemplateVersion, parentVariantId: null, depth: 0 })
  })
})
