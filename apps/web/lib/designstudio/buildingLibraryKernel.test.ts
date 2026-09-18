import { describe, expect, it } from 'vitest'
import {
  TIME_TO_FIRST_COORDINATED_OPTION_TARGET,
  buildingTemplateLibrary,
  deriveIntentVariant,
  evaluateTemplateForProject,
  evaluateVariantPromotion,
  type BuildingIntent,
  type ProjectTemplateInputs,
} from './buildingLibraryKernel'

const completeInputs: ProjectTemplateInputs = {
  jurisdictionId: 'IN-KA-BENGALURU',
  soilBearingKpa: 200,
  windSpeedMps: 40,
  seismicClass: 'ZONE-II',
  snowLoadKpa: 0,
  floorCount: 2,
  grossFloorAreaSqm: 220,
  buildingWidthM: 12,
  buildingDepthM: 18,
  storeyHeightM: 3.2,
  materials: ['reinforced-concrete'],
  deadLoadKpa: 4,
  liveLoadKpa: 2,
  userChanges: [],
}

const intent: BuildingIntent = {
  buildingType: 'Residential',
  programme: ['Kitchen', 'Living', '3 Bedrooms'],
  occupancy: 'Single family',
  targetFloorCount: 2,
  targetGrossFloorAreaSqm: 220,
  preferences: ['Courtyard', 'Deep shade'],
  requestedChanges: ['GEOMETRY'],
}

describe('building library kernel', () => {
  it('wraps every visible shell in a versioned, checksummed semantic template', () => {
    expect(buildingTemplateLibrary.length).toBeGreaterThanOrEqual(10)
    for (const template of buildingTemplateLibrary) {
      expect(template.schema).toBe('ferrum.building-template.v1')
      expect(template.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(template.identityChecksum).toMatch(/^sha256:[a-f0-9]{64}$/)
      expect(template.semanticGeometry.geometryStatus).toBe('INDICATIVE')
      expect(template.provenance.copyrightBoundary).toContain('no architect project geometry')
    }
  })

  it('does not claim existing catalogue shells have reusable structural analysis or quantities', () => {
    const result = evaluateTemplateForProject(buildingTemplateLibrary[0], completeInputs, '2026-09-19')
    expect(result.state).toBe('NOT PRECOMPUTED')
    expect(result.reusableAnalysisRevision).toBeNull()
    expect(result.reusableBoqRevision).toBeNull()
  })

  it('records every site and user-change recomputation class', () => {
    const template = structuredClone(buildingTemplateLibrary[0])
    template.analysisEnvelope = {
      ...template.analysisEnvelope,
      state: 'ENGINEER VERIFIED',
      analysisRevision: 'analysis-7',
      verificationRecordId: 'verify-7',
      solver: { name: 'verified-solver', version: '1.0' },
      jurisdictionIds: ['IN-KL-KOCHI'],
      soilBearingKpa: { min: 150, max: 250 },
      windSpeedMps: { min: 30, max: 45 },
      seismicClasses: ['ZONE-III'],
      snowLoadKpa: { min: 0, max: 0.1 },
      deadLoadKpa: { min: 3, max: 5 },
      liveLoadKpa: { min: 1.5, max: 3 },
      coveredMaterials: ['reinforced-concrete'],
    }
    const result = evaluateTemplateForProject(template, {
      ...completeInputs,
      jurisdictionId: 'IN-KA-BENGALURU',
      soilBearingKpa: 80,
      windSpeedMps: 55,
      seismicClass: 'ZONE-IV',
      snowLoadKpa: 1,
      floorCount: 9,
      materials: ['steel'],
      deadLoadKpa: 9,
      userChanges: ['GEOMETRY'],
    }, '2026-09-19')
    expect(result.state).toBe('RECOMPUTE REQUIRED')
    expect(result.triggers).toEqual(expect.arrayContaining(['SOIL', 'WIND', 'SEISMIC', 'SNOW', 'JURISDICTION', 'DIMENSIONS', 'MATERIALS', 'LOADS', 'USER CHANGE']))
  })

  it('reuses only the exact reviewed envelope and a separately reviewed quantity revision', () => {
    const template = structuredClone(buildingTemplateLibrary.find((entry) => entry.templateId === 'ferrum:bengaluru-contemporary')!)
    template.analysisEnvelope = {
      ...template.analysisEnvelope,
      state: 'ENGINEER VERIFIED',
      analysisRevision: 'analysis-12',
      verificationRecordId: 'engineering-review-12',
      solver: { name: 'accepted-solver', version: '2026.09' },
      jurisdictionIds: ['IN-KA-BENGALURU'],
      soilBearingKpa: { min: 150, max: 250 },
      windSpeedMps: { min: 35, max: 45 },
      seismicClasses: ['ZONE-II'],
      snowLoadKpa: { min: 0, max: 0.1 },
      deadLoadKpa: { min: 3, max: 5 },
      liveLoadKpa: { min: 1.5, max: 3 },
      coveredMaterials: ['reinforced-concrete'],
    }
    template.boqBaseline = { ...template.boqBaseline, state: 'QUANTITY REVIEWED', quantityRevision: 'boq-9' }
    const result = evaluateTemplateForProject(template, completeInputs, '2026-09-19')
    expect(result).toMatchObject({ state: 'WITHIN BOUNDED ENVELOPE', reusableAnalysisRevision: 'analysis-12', reusableBoqRevision: 'boq-9' })
    expect(result.triggers).toEqual([])
  })

  it('expires a template independently of whether project inputs match', () => {
    const template = structuredClone(buildingTemplateLibrary[0])
    template.reviewDueAt = '2026-01-01'
    expect(evaluateTemplateForProject(template, completeInputs, '2026-09-19').state).toBe('STALE TEMPLATE')
  })

  it('deduplicates equivalent tenant intents while preserving private lineage', () => {
    const template = buildingTemplateLibrary[0]
    const first = deriveIntentVariant(template, intent, { tenantId: 'tenant-a', createdAt: '2026-09-19T12:00:00Z', trainingConsent: 'DENIED' })
    const duplicate = deriveIntentVariant(template, { ...intent, programme: [...intent.programme].reverse(), preferences: [...intent.preferences].reverse() }, { tenantId: 'tenant-a', createdAt: '2026-09-19T12:01:00Z', trainingConsent: 'EXPLICIT TRAINING OPT-IN' }, [first.variant])
    const otherTenant = deriveIntentVariant(template, intent, { tenantId: 'tenant-b', createdAt: '2026-09-19T12:02:00Z', trainingConsent: 'DENIED' }, [first.variant])
    expect(duplicate.deduplicated).toBe(true)
    expect(duplicate.variant.variantId).toBe(first.variant.variantId)
    expect(first.variant.libraryState).toBe('PRIVATE CANDIDATE')
    expect(otherTenant.deduplicated).toBe(false)
  })

  it('blocks automatic library promotion until every consent and review gate exists', () => {
    const variant = deriveIntentVariant(buildingTemplateLibrary[0], intent, { tenantId: 'tenant-a', createdAt: '2026-09-19T12:00:00Z', trainingConsent: 'EXPLICIT TRAINING OPT-IN' }).variant
    const blocked = evaluateVariantPromotion(variant, {
      libraryContributionConsentId: null,
      licenceReviewId: null,
      privacyReviewId: null,
      deterministicCheckIds: [],
      architectureReviewId: null,
      engineeringReviewId: null,
      quantityReviewId: null,
      evaluationId: null,
      versionedApprovalId: null,
    })
    expect(blocked.allowed).toBe(false)
    expect(blocked.reasons).toHaveLength(9)
  })

  it('defines 15-30 minutes as a non-guaranteed first-option target', () => {
    expect(TIME_TO_FIRST_COORDINATED_OPTION_TARGET).toMatchObject({ minimumMinutes: 15, maximumMinutes: 30, guarantee: false })
  })
})
