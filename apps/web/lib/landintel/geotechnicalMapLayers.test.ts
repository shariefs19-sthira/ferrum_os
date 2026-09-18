import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildGeotechnicalMapLayers,
  categorizeEvidence,
  mapLayerLegend,
  summarizeMapLayers,
  withLiveStaleness,
} from './geotechnicalMapLayers'
import type { GeotechnicalEvidence, ProjectGeotechnicalInput } from './geotechnicalIntelligence'
import { writeParcelContext, type ParcelContext } from '../workspace/parcelContext'

const evidence = (overrides: Partial<GeotechnicalEvidence>): GeotechnicalEvidence => ({
  id: 'e-1', topic: 'groundwater', label: 'Groundwater', value: 2.4, unit: 'm bgl',
  status: 'USER-PROVIDED', method: 'OBSERVED', confidence: 'MEDIUM',
  scope: 'PROJECT_INVESTIGATION',
  coverage: { kind: 'POINT', label: 'BH-01', coverageGaps: [] }, lineage: null,
  limitations: [], validUntil: null, ...overrides,
})

const projectInput = (overrides: Partial<ProjectGeotechnicalInput>): ProjectGeotechnicalInput => ({
  id: 'bh-01', kind: 'BOREHOLE_LOG', title: 'BH-01', fileName: 'bh01.pdf',
  issueDate: '2026-09-01', responsibleParty: 'Ferrum Geotech Pvt Ltd', professionalRole: 'Geotechnical Engineer',
  coordinates: { eastingOrLongitude: 77.59, northingOrLatitude: 12.97, horizontalCrs: 'EPSG:4326', groundLevel: 913, verticalDatum: 'MSL' },
  units: {}, sourceRevision: 'Rev A', checksum: 'a'.repeat(64), status: 'USER-PROVIDED',
  observations: [],
  ...overrides,
})

const parcelContext = (overrides: Partial<ParcelContext> = {}): ParcelContext => ({
  version: 1, method: 'ulpin', ulpin: 'KA-BLR-0001-2024', state: 'Karnataka', district: 'Bengaluru Urban',
  area_sqm: 1200, land_use: 'Residential', coordinates: { lat: 12.97, lng: 77.59 },
  provenance: { source: 'Seeded D1 record', vintage: '2026-09-18', status: 'INDICATIVE' },
  ...overrides,
})

describe('geotechnical map-layer categorisation', () => {
  it('prioritises CONFLICT over every other status', () => {
    expect(categorizeEvidence(evidence({ status: 'CONFLICT', scope: 'REGIONAL_SCREENING' }))).toBe('CONFLICT')
  })

  it('prioritises STALE UPSTREAM DATA over scope', () => {
    expect(categorizeEvidence(evidence({ status: 'STALE UPSTREAM DATA', scope: 'PROJECT_INVESTIGATION' }))).toBe('STALE_AREA')
  })

  it('routes project-investigation scope to PROJECT_INVESTIGATION_POINT', () => {
    expect(categorizeEvidence(evidence({ status: 'USER-PROVIDED', scope: 'PROJECT_INVESTIGATION' }))).toBe('PROJECT_INVESTIGATION_POINT')
  })

  it('routes UNKNOWN status or UNKNOWN coverage to UNKNOWN_GAP', () => {
    expect(categorizeEvidence(evidence({ status: 'UNKNOWN', scope: 'REGIONAL_SCREENING' }))).toBe('UNKNOWN_GAP')
    expect(categorizeEvidence(evidence({ status: 'SOURCE-VERIFIED', scope: 'REGIONAL_SCREENING', coverage: { kind: 'UNKNOWN', label: 'No source connected', coverageGaps: [] } }))).toBe('UNKNOWN_GAP')
  })

  it('routes verified regional evidence to AUTHORITATIVE_COVERAGE', () => {
    expect(categorizeEvidence(evidence({ status: 'SOURCE-VERIFIED', scope: 'REGIONAL_SCREENING', coverage: { kind: 'REGION', label: 'Karnataka geology index', coverageGaps: [] } }))).toBe('AUTHORITATIVE_COVERAGE')
  })

  it.each([
    ['SOURCE-VERIFIED', 'AUTHORITATIVE_COVERAGE'],
    ['USER-PROVIDED', 'UNKNOWN_GAP'],
    ['INDICATIVE', 'UNKNOWN_GAP'],
    ['INFERRED', 'UNKNOWN_GAP'],
    ['UNKNOWN', 'UNKNOWN_GAP'],
    ['STALE UPSTREAM DATA', 'STALE_AREA'],
    ['CONFLICT', 'CONFLICT'],
  ] as const)('classifies regional %s evidence as %s without granting unsupported authority', (status, category) => {
    expect(categorizeEvidence(evidence({
      status,
      scope: 'REGIONAL_SCREENING',
      coverage: { kind: 'REGION', label: 'Karnataka geology index', coverageGaps: [] },
    }))).toBe(category)
  })
})

describe('buildGeotechnicalMapLayers', () => {
  it('keeps regional evidence and project points spatially distinct', () => {
    const features = buildGeotechnicalMapLayers(
      [evidence({ id: 'regional-geo', topic: 'regional-geology-lithology', status: 'SOURCE-VERIFIED', scope: 'REGIONAL_SCREENING', coverage: { kind: 'REGION', label: 'Karnataka', coverageGaps: [] } })],
      [projectInput({})],
    )
    expect(features).toHaveLength(2)
    const regional = features.find((f) => f.id === 'evidence-regional-geo')!
    const point = features.find((f) => f.id === 'investigation-bh-01')!
    expect(regional.category).toBe('AUTHORITATIVE_COVERAGE')
    expect(regional.geometry.kind).toBe('REGIONAL')
    expect(point.category).toBe('PROJECT_INVESTIGATION_POINT')
    expect(point.geometry).toEqual({ kind: 'PROJECT_POINT', coordinates: projectInput({}).coordinates })
    expect(point.disclosure.jurisdiction).toBe('EPSG:4326')
    expect(regional.disclosure.evidenceStatus).toBe('SOURCE-VERIFIED')
    expect(point.disclosure.evidenceStatus).toBe('USER-PROVIDED')
  })

  it('omits project inputs with no coordinates rather than inventing a location', () => {
    const features = buildGeotechnicalMapLayers([], [projectInput({ coordinates: null })])
    expect(features).toHaveLength(0)
  })

  it('every legend category has a real description', () => {
    for (const category of Object.keys(mapLayerLegend) as Array<keyof typeof mapLayerLegend>) {
      expect(mapLayerLegend[category].description.length).toBeGreaterThan(20)
    }
  })
})

describe('summarizeMapLayers', () => {
  it('counts every category, including zero counts', () => {
    const summary = summarizeMapLayers(buildGeotechnicalMapLayers([evidence({ status: 'CONFLICT', scope: 'REGIONAL_SCREENING' })]))
    expect(summary.CONFLICT).toBe(1)
    expect(summary.AUTHORITATIVE_COVERAGE).toBe(0)
    expect(summary.PROJECT_INVESTIGATION_POINT).toBe(0)
  })
})

describe('withLiveStaleness', () => {
  beforeEach(() => localStorage.clear())

  it('leaves features alone when no active context is known', () => {
    const features = buildGeotechnicalMapLayers([evidence({ status: 'SOURCE-VERIFIED', scope: 'REGIONAL_SCREENING', coverage: { kind: 'REGION', label: 'X', coverageGaps: [] } })])
    expect(withLiveStaleness(features, null)).toEqual(features)
  })

  it('leaves features alone when the active site still matches the generating context', () => {
    const context = parcelContext()
    writeParcelContext(context)
    const features = buildGeotechnicalMapLayers([evidence({ id: 'a', status: 'SOURCE-VERIFIED', scope: 'REGIONAL_SCREENING', coverage: { kind: 'REGION', label: 'X', coverageGaps: [] } })])
    expect(withLiveStaleness(features, context)[0]!.category).toBe('AUTHORITATIVE_COVERAGE')
  })

  it('reclassifies non-conflict features to STALE_AREA once the active site changes', () => {
    const generatedFor = parcelContext({ ulpin: 'KA-BLR-0001-2024', district: 'Bengaluru Urban' })
    writeParcelContext(parcelContext({ ulpin: 'MH-PUN-0002-2024', district: 'Pune', state: 'Maharashtra' }))
    const features = buildGeotechnicalMapLayers([
      evidence({ id: 'a', status: 'SOURCE-VERIFIED', scope: 'REGIONAL_SCREENING', coverage: { kind: 'REGION', label: 'X', coverageGaps: [] } }),
      evidence({ id: 'b', status: 'CONFLICT', scope: 'REGIONAL_SCREENING' }),
    ])
    const restaled = withLiveStaleness(features, generatedFor)
    expect(restaled.find((f) => f.evidenceId === 'a')!.category).toBe('STALE_AREA')
    expect(restaled.find((f) => f.evidenceId === 'b')!.category).toBe('CONFLICT')
  })
})
