import { describe, expect, it } from 'vitest'
import type { ParcelContext } from '../workspace/parcelContext'
import { buildingTemplateLibrary, type ProjectTemplateInputs } from './buildingLibraryKernel'
import { jurisdictionPacks } from './jurisdictionPacks'
import { buildEnvironmentalContext } from './environmentalContext'
import { assessGeotechnicalEvidence, createUnknownGeotechnicalScreening, type GeotechnicalEvidence } from '../landintel/geotechnicalIntelligence'
import {
  assessBuildingTemplateSuitability,
  assessDelivery,
  assessEnvironmental,
  assessGeotechnicalDimension,
  assessPhysicalFit,
  assessPlanning,
  assessStructural,
  assessSupply,
  computeChangeImpact,
  worseState,
  type DeliveryContext,
  type SupplyContext,
} from './suitabilityAssessment'

const template = buildingTemplateLibrary[0]

const parcel: ParcelContext = {
  version: 1,
  method: 'ulpin',
  ulpin: 'KA-BLR-0001-2024',
  state: 'Karnataka',
  district: 'Bengaluru Urban',
  area_sqm: (template.parametricEnvelope.plotAreaSqm.min + template.parametricEnvelope.plotAreaSqm.max) / 2,
  land_use: 'Residential',
  coordinates: { lat: 12.9762, lng: 77.5896 },
  provenance: { source: 'Ferrum verified survey record', vintage: '2026-09-10', status: 'VERIFIED' },
}

const completeInputs: ProjectTemplateInputs = {
  jurisdictionId: 'IN-KA-BENGALURU',
  soilBearingKpa: 200,
  windSpeedMps: 40,
  seismicClass: 'ZONE-II',
  snowLoadKpa: 0,
  floorCount: template.parametricEnvelope.floorCount.min,
  grossFloorAreaSqm: template.parametricEnvelope.grossFloorAreaSqm.min,
  buildingWidthM: 10,
  buildingDepthM: 12,
  storeyHeightM: 3,
  materials: ['reinforced-concrete'],
  deadLoadKpa: 4,
  liveLoadKpa: 2,
  userChanges: [],
}

const emptyInputs: ProjectTemplateInputs = {
  jurisdictionId: null,
  soilBearingKpa: null,
  windSpeedMps: null,
  seismicClass: null,
  snowLoadKpa: null,
  floorCount: null,
  grossFloorAreaSqm: null,
  buildingWidthM: null,
  buildingDepthM: null,
  storeyHeightM: null,
  materials: [],
  deadLoadKpa: null,
  liveLoadKpa: null,
  userChanges: [],
}

const osm = { sourceDate: '2026-09-05T04:35:36Z', license: 'ODbL', attribution: '© OpenStreetMap contributors', isLiveFetch: false }
const sampleFallback = { lat: 12.9762, lon: 77.5896 }

describe('suitability state ordering', () => {
  it('treats BLOCKED as strictly worse than every other state', () => {
    expect(worseState('BLOCKED', 'SUPPORTED')).toBe('BLOCKED')
    expect(worseState('SUPPORTED', 'BLOCKED')).toBe('BLOCKED')
    expect(worseState('STALE', 'CONDITIONAL')).toBe('STALE')
    expect(worseState('UNKNOWN', 'SUPPORTED')).toBe('UNKNOWN')
  })
})

describe('physical fit dimension', () => {
  it('is UNKNOWN when no parcel or dimensions are supplied', () => {
    const result = assessPhysicalFit(template, { parcel: null, dimensions: emptyInputs })
    expect(result.state).toBe('UNKNOWN')
    expect(result.missingInputs).toContain('parcel-selection')
  })

  it('is BLOCKED when the parcel area falls outside the template plot-area envelope', () => {
    const tinyParcel: ParcelContext = { ...parcel, area_sqm: template.parametricEnvelope.plotAreaSqm.min - 1 }
    const result = assessPhysicalFit(template, { parcel: tinyParcel, dimensions: completeInputs })
    expect(result.state).toBe('BLOCKED')
    expect(result.reasons.join(' ')).toContain('plot-area envelope')
  })

  it('is never SUPPORTED even with a full, in-envelope match - geometry fit never implies compliance', () => {
    const result = assessPhysicalFit(template, { parcel, dimensions: completeInputs })
    expect(result.state).toBe('CONDITIONAL')
    expect(result.requiredAction.join(' ')).toContain('does not confirm setbacks')
  })
})

describe('planning dimension', () => {
  const globalPack = jurisdictionPacks.find((pack) => pack.id === 'global-openbim')!
  const researchPack = jurisdictionPacks.find((pack) => pack.status === 'RESEARCH-REQUIRED')!

  it('is UNKNOWN with no resolved jurisdiction pack', () => {
    const result = assessPlanning(undefined, template)
    expect(result.state).toBe('UNKNOWN')
    expect(result.missingInputs).toContain('jurisdiction-pack')
  })

  it('is BLOCKED for a RESEARCH-REQUIRED pack', () => {
    const result = assessPlanning(researchPack, template)
    expect(result.state).toBe('BLOCKED')
  })

  it('never reports SUPPORTED for an AVAILABLE pack - compliance is never inferred', () => {
    const result = assessPlanning(globalPack, template)
    expect(result.state).not.toBe('SUPPORTED')
    expect(result.reasons.join(' ')).toContain('does not infer planning compliance')
  })
})

describe('environmental dimension', () => {
  it('is UNKNOWN when no parcel boundary is loaded', () => {
    const context = buildEnvironmentalContext({ parcel: null, sampleFallbackOrigin: sampleFallback, osmSampleCentre: sampleFallback, osm })
    const result = assessEnvironmental(context)
    expect(result.state).toBe('UNKNOWN')
  })

  it('is CONDITIONAL once a parcel is loaded but terrain remains unconnected', () => {
    const context = buildEnvironmentalContext({ parcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre: sampleFallback, osm })
    const result = assessEnvironmental(context)
    expect(result.state).toBe('CONDITIONAL')
    expect(result.missingInputs).toContain('terrain')
  })
})

describe('structural dimension', () => {
  it('is BLOCKED when the template has no precomputed analysis envelope', () => {
    const result = assessStructural(template, {
      state: 'NOT PRECOMPUTED',
      triggers: [],
      missingInputs: [],
      reasons: ['No precomputed structural analysis envelope is attached to this template.'],
      reusableAnalysisRevision: null,
      reusableBoqRevision: null,
    })
    expect(result.state).toBe('BLOCKED')
  })

  it('is STALE when a recompute trigger fires', () => {
    const result = assessStructural(template, {
      state: 'RECOMPUTE REQUIRED',
      triggers: ['SOIL', 'WIND'],
      missingInputs: [],
      reasons: ['SOIL differs from, or is outside, the recorded analysis envelope.'],
      reusableAnalysisRevision: null,
      reusableBoqRevision: null,
    })
    expect(result.state).toBe('STALE')
  })
})

describe('geotechnical dimension', () => {
  it('maps unknown regional screening to the UNKNOWN suitability state', () => {
    const screening = createUnknownGeotechnicalScreening()
    const result = assessGeotechnicalDimension(screening)
    expect(result.state).toBe('UNKNOWN')
  })

  it('is BLOCKED when evidence conflicts', () => {
    const conflictingEvidence: GeotechnicalEvidence[] = [
      {
        id: 'ev-1',
        topic: 'soil-classification-properties',
        label: 'Soil classification',
        value: 'A',
        unit: null,
        status: 'CONFLICT',
        method: 'OBSERVED',
        scope: 'PROJECT_INVESTIGATION',
        confidence: 'LOW',
        coverage: { kind: 'POINT', label: 'Site', coverageGaps: [] },
        lineage: null,
        limitations: [],
        validUntil: null,
      },
    ]
    const result = assessGeotechnicalDimension(assessGeotechnicalEvidence(conflictingEvidence))
    expect(result.state).toBe('BLOCKED')
  })

  it('never exceeds CONDITIONAL even for fully covered, non-stale evidence', () => {
    const geotechTopics = createUnknownGeotechnicalScreening().evidence.map((item) => item.topic)
    const evidence: GeotechnicalEvidence[] = geotechTopics.map((topic) => ({
      id: `ev-${topic}`,
      topic,
      label: topic,
      value: 1,
      unit: 'm',
      status: 'USER-PROVIDED',
      method: 'PROFESSIONAL_INTERPRETATION',
      scope: 'PROJECT_INVESTIGATION',
      confidence: 'HIGH',
      coverage: { kind: 'POINT', label: 'Site', coverageGaps: [] },
      lineage: null,
      limitations: [],
      validUntil: null,
    }))
    const result = assessGeotechnicalDimension(assessGeotechnicalEvidence(evidence))
    expect(result.state).toBe('CONDITIONAL')
  })
})

describe('supply dimension', () => {
  it('is UNKNOWN with no supply context', () => {
    const result = assessSupply(template, null)
    expect(result.state).toBe('UNKNOWN')
    expect(result.missingInputs).toContain('supply-context')
  })

  it('is BLOCKED when a required material is unavailable', () => {
    const supply: SupplyContext = { materialAvailability: { 'UNSPECIFIED-MATERIAL-FAMILY': 'UNAVAILABLE' }, procurementHolds: [], evaluatedAt: '2026-09-19' }
    const result = assessSupply(template, supply)
    expect(result.state).toBe('BLOCKED')
  })

  it('is SUPPORTED when every required material reports available supply', () => {
    const supply: SupplyContext = { materialAvailability: { 'UNSPECIFIED-MATERIAL-FAMILY': 'AVAILABLE' }, procurementHolds: [], evaluatedAt: '2026-09-19' }
    const result = assessSupply(template, supply)
    expect(result.state).toBe('SUPPORTED')
  })
})

describe('delivery dimension', () => {
  it('is UNKNOWN with no delivery context', () => {
    expect(assessDelivery(null).state).toBe('UNKNOWN')
  })

  it('is CONDITIONAL when access is constrained', () => {
    const delivery: DeliveryContext = { siteAccess: 'CONSTRAINED', logisticsNotes: ['Narrow lane access'], deliveryWindowConfirmed: true, evaluatedAt: '2026-09-19' }
    expect(assessDelivery(delivery).state).toBe('CONDITIONAL')
  })

  it('is SUPPORTED with confirmed access and a confirmed delivery window', () => {
    const delivery: DeliveryContext = { siteAccess: 'CONFIRMED', logisticsNotes: [], deliveryWindowConfirmed: true, evaluatedAt: '2026-09-19' }
    expect(assessDelivery(delivery).state).toBe('SUPPORTED')
  })
})

describe('change impact', () => {
  it('routes STALE dimensions to recheckRequired and always-review dimensions to professionalReviewRequired', () => {
    const result = assessBuildingTemplateSuitability({
      template,
      templateInputs: completeInputs,
      parcel,
      jurisdictionPack: jurisdictionPacks.find((pack) => pack.id === 'global-openbim'),
      environmentalContext: buildEnvironmentalContext({ parcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre: sampleFallback, osm }),
      geotechnicalAssessment: createUnknownGeotechnicalScreening(),
      supply: null,
      delivery: null,
      evaluatedAt: '2026-09-19',
    })

    expect(result.changeImpact.professionalReviewRequired).toEqual(expect.arrayContaining(['structural', 'geotechnical', 'planning']))
    expect(result.changeImpact.missingInputs.length).toBeGreaterThan(0)
  })

  it('computeChangeImpact reuses only dimensions with no outstanding missing inputs', () => {
    const impact = computeChangeImpact(
      [
        { dimension: 'physical-fit', state: 'SUPPORTED', evidence: [], requiredAction: [], reasons: [], missingInputs: [] },
        { dimension: 'planning', state: 'CONDITIONAL', evidence: [], requiredAction: [], reasons: [], missingInputs: ['jurisdiction-pack'] },
        { dimension: 'structural', state: 'STALE', evidence: [], requiredAction: [], reasons: [], missingInputs: [] },
      ],
      ['SOIL'],
    )
    expect(impact.evidenceReused).toEqual(['physical-fit'])
    expect(impact.recheckRequired).toEqual(['structural'])
    expect(impact.recomputationRequired).toEqual(['SOIL'])
    expect(impact.missingInputs).toEqual(['jurisdiction-pack'])
  })
})

describe('overall aggregation', () => {
  it('is governed by the single weakest dimension (BLOCKED beats everything else)', () => {
    const result = assessBuildingTemplateSuitability({
      template,
      templateInputs: emptyInputs,
      parcel: null,
      jurisdictionPack: jurisdictionPacks.find((pack) => pack.status === 'RESEARCH-REQUIRED'),
      environmentalContext: buildEnvironmentalContext({ parcel: null, sampleFallbackOrigin: sampleFallback, osmSampleCentre: sampleFallback, osm }),
      geotechnicalAssessment: createUnknownGeotechnicalScreening(),
      supply: null,
      delivery: null,
      evaluatedAt: '2026-09-19',
    })
    expect(result.overallState).toBe('BLOCKED')
    expect(['physical-fit', 'planning', 'structural']).toContain(result.governingDimension)
  })

  it('carries the schema tag and one assessment per dimension', () => {
    const result = assessBuildingTemplateSuitability({
      template,
      templateInputs: completeInputs,
      parcel,
      jurisdictionPack: jurisdictionPacks.find((pack) => pack.id === 'global-openbim'),
      environmentalContext: buildEnvironmentalContext({ parcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre: sampleFallback, osm }),
      geotechnicalAssessment: createUnknownGeotechnicalScreening(),
      supply: null,
      delivery: null,
      evaluatedAt: '2026-09-19',
    })
    expect(result.schema).toBe('ferrum.designstudio.suitability.v1')
    expect(result.dimensions).toHaveLength(7)
  })
})
