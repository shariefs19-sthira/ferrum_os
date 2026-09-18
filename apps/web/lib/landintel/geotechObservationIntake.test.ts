import { describe, expect, it } from 'vitest'
import {
  classifyObservation,
  computeDownstreamImpacts,
  fuseSiteAndRegionalEvidence,
  intakeSiteObservation,
  prohibitedGeotechConclusions,
  validateClassificationOptions,
  validateGeotechObservationInput,
  validateRegionalContextLayer,
  type ClassificationOptions,
  type GeotechObservationInput,
  type RegionalContextLayer,
} from './geotechObservationIntake'

const validChecksum = 'a'.repeat(64)

const baseInput = (overrides: Partial<GeotechObservationInput> = {}): GeotechObservationInput => ({
  id: 'obs-1',
  kind: 'BOREHOLE_LOG_REFERENCE',
  referenceId: 'BH-01',
  fieldDate: '2026-06-01',
  reportedAt: '2026-06-05',
  evidenceBasis: 'DIRECT_OBSERVATION',
  coordinate: { latitude: 12.9, longitude: 77.5, depthMetres: 6.2, horizontalCrs: 'EPSG:4326', verticalDatum: 'MSL' },
  provider: { name: 'Acme Geotech Labs', role: 'Testing laboratory', licenceOrAccreditation: 'NABL-1234' },
  checksum: validChecksum,
  narrative: 'SPT and groundwater readings recorded at BH-01.',
  measurements: [{ parameter: 'Groundwater depth', value: 3.4, unit: 'm bgl', depthMetres: null }],
  ...overrides,
})

const classificationOptions = (overrides: Partial<ClassificationOptions> = {}): ClassificationOptions => ({
  nowIso: '2026-09-19',
  staleAfterDays: 365,
  verifiedProviderRegistry: ['acme geotech labs|nabl-1234'],
  ...overrides,
})

const baseRegionalLayer = (overrides: Partial<RegionalContextLayer> = {}): RegionalContextLayer => ({
  id: 'regional-groundwater-1',
  topic: 'regional-groundwater-zone',
  authority: 'Central Ground Water Board',
  jurisdiction: 'IN',
  sourceUri: 'https://cgwb.gov.in',
  publishedAt: '2025-01-01',
  retrievedAt: '2026-09-01',
  classification: 'INDICATIVE',
  scope: 'REGIONAL_OPEN_GOVERNMENT',
  screeningNote: 'Regional screening only; never establishes bearing capacity, foundation suitability or a legal boundary.',
  ...overrides,
})

describe('validateGeotechObservationInput', () => {
  it('accepts a fully governed input', () => {
    expect(validateGeotechObservationInput(baseInput())).toEqual([])
  })

  it('flags missing metadata and malformed dates/checksum', () => {
    const issues = validateGeotechObservationInput(baseInput({
      referenceId: '',
      fieldDate: '01-06-2026',
      reportedAt: 'not-a-date',
      checksum: 'bad',
      provider: { name: '', role: '', licenceOrAccreditation: null },
    }))
    const fields = issues.map((issue) => issue.field)
    expect(fields).toEqual(expect.arrayContaining([
      'referenceId', 'fieldDate', 'reportedAt', 'checksum', 'provider.name', 'provider.role',
    ]))
  })

  it('rejects narrative asserting bearing capacity, foundation suitability or a legal boundary', () => {
    for (const narrative of [
      'This confirms the bearing capacity is adequate.',
      'Foundation suitability is confirmed for spread footings.',
      'This establishes the legal boundary of the plot.',
    ]) {
      const issues = validateGeotechObservationInput(baseInput({ narrative }))
      expect(issues.some((issue) => issue.field === 'narrative')).toBe(true)
    }
  })

  it('requires units on numeric measurements', () => {
    const issues = validateGeotechObservationInput(baseInput({
      measurements: [{ parameter: 'SPT N', value: 14, unit: null, depthMetres: 3 }],
    }))
    expect(issues.some((issue) => issue.field.includes('measurements.SPT N.unit'))).toBe(true)
  })

  it('requires horizontal CRS when coordinates are supplied', () => {
    const issues = validateGeotechObservationInput(baseInput({
      coordinate: { latitude: 1, longitude: 1, depthMetres: 1, horizontalCrs: '', verticalDatum: null },
    }))
    expect(issues.some((issue) => issue.field === 'coordinate.horizontalCrs')).toBe(true)
  })

  it('rejects future field dates relative to the classification date', () => {
    const issues = validateGeotechObservationInput(baseInput({ fieldDate: '2026-09-20' }), '2026-09-19')
    expect(issues).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'fieldDate', message: expect.stringContaining('future') })]))
  })

  it('rejects non-finite or out-of-range coordinates and non-finite or negative depths and values', () => {
    const issues = validateGeotechObservationInput(baseInput({
      coordinate: { latitude: Infinity, longitude: 181, depthMetres: Number.NaN, horizontalCrs: 'EPSG:4326', verticalDatum: 'MSL' },
      measurements: [{ parameter: 'SPT N', value: -1, unit: 'blows/300 mm', depthMetres: Infinity }],
    }))
    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining([
      'coordinate.latitude', 'coordinate.longitude', 'coordinate.depthMetres', 'measurements.SPT N.value', 'measurements.SPT N.depthMetres',
    ]))
  })
})

describe('classifyObservation', () => {
  it('returns UNKNOWN for an invalid input', () => {
    expect(classifyObservation(baseInput({ checksum: 'bad' }), classificationOptions())).toBe('UNKNOWN')
  })

  it('returns STALE when the field date exceeds the staleness threshold', () => {
    expect(classifyObservation(baseInput({ fieldDate: '2020-01-01' }), classificationOptions())).toBe('STALE')
  })

  it('returns INDICATIVE for a field estimate even from a verified provider', () => {
    expect(classifyObservation(baseInput({ evidenceBasis: 'FIELD_ESTIMATE' }), classificationOptions())).toBe('INDICATIVE')
  })

  it('returns SOURCE_VERIFIED when the provider is in the caller-supplied registry', () => {
    expect(classifyObservation(baseInput(), classificationOptions())).toBe('SOURCE_VERIFIED')
  })

  it('returns USER_PROVIDED by default for a well-formed, unverified submission', () => {
    expect(classifyObservation(baseInput(), classificationOptions({ verifiedProviderRegistry: [] }))).toBe('USER_PROVIDED')
  })

  it('prioritises STALE over provider verification', () => {
    expect(classifyObservation(baseInput({ fieldDate: '2019-01-01' }), classificationOptions())).toBe('STALE')
  })

  it.each([
    ['future field date', baseInput({ fieldDate: '2026-09-20' }), classificationOptions()],
    ['out-of-range latitude', baseInput({ coordinate: { latitude: 90.1, longitude: 77.5, depthMetres: 1, horizontalCrs: 'EPSG:4326', verticalDatum: 'MSL' } }), classificationOptions()],
    ['negative measurement value', baseInput({ measurements: [{ parameter: 'SPT N', value: -1, unit: 'blows/300 mm', depthMetres: 1 }] }), classificationOptions()],
    ['negative stale threshold', baseInput(), classificationOptions({ staleAfterDays: -1 })],
    ['non-finite stale threshold', baseInput(), classificationOptions({ staleAfterDays: Number.POSITIVE_INFINITY })],
  ])('returns UNKNOWN instead of verified or user-provided for %s', (_case, input, options) => {
    expect(classifyObservation(input, options)).toBe('UNKNOWN')
  })

  it('rejects negative and non-finite stale thresholds', () => {
    expect(validateClassificationOptions(classificationOptions({ staleAfterDays: -1 }))).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'options.staleAfterDays' }),
    ]))
    expect(validateClassificationOptions(classificationOptions({ staleAfterDays: Number.NaN }))).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'options.staleAfterDays' }),
    ]))
  })
})

describe('intakeSiteObservation', () => {
  it('carries classification, issues and a fixed site scope', () => {
    const record = intakeSiteObservation(baseInput(), classificationOptions())
    expect(record.scope).toBe('SITE_OBSERVATION')
    expect(record.classification).toBe('SOURCE_VERIFIED')
    expect(record.issues).toEqual([])
  })

  it('records validation issues and holds every downstream target for unsafe inputs', () => {
    for (const [input, options] of [
      [baseInput({ fieldDate: '2026-09-20' }), classificationOptions()],
      [baseInput({ coordinate: { latitude: Number.NaN, longitude: 77.5, depthMetres: 1, horizontalCrs: 'EPSG:4326', verticalDatum: 'MSL' } }), classificationOptions()],
      [baseInput({ coordinate: { latitude: 12.9, longitude: 180.1, depthMetres: -1, horizontalCrs: 'EPSG:4326', verticalDatum: 'MSL' } }), classificationOptions()],
      [baseInput({ measurements: [{ parameter: 'SPT N', value: Number.POSITIVE_INFINITY, unit: 'blows/300 mm', depthMetres: 1 }] }), classificationOptions()],
      [baseInput({ measurements: [{ parameter: 'SPT N', value: 1, unit: 'blows/300 mm', depthMetres: -1 }] }), classificationOptions()],
      [baseInput(), classificationOptions({ staleAfterDays: -1 })],
      [baseInput(), classificationOptions({ staleAfterDays: Number.POSITIVE_INFINITY })],
    ] as const) {
      const record = intakeSiteObservation(input, options)
      expect(record.classification).toBe('UNKNOWN')
      expect(record.issues.length).toBeGreaterThan(0)
      expect(computeDownstreamImpacts([record], []).filter((impact) => impact.action === 'HOLD').map((impact) => impact.target).sort())
        .toEqual(['BOQ', 'DesignStudio', 'Structura'])
    }
  })
})

describe('validateRegionalContextLayer', () => {
  it('accepts a well-formed regional layer', () => {
    expect(validateRegionalContextLayer(baseRegionalLayer())).toEqual([])
  })

  it('rejects USER_PROVIDED regional classification', () => {
    const issues = validateRegionalContextLayer(baseRegionalLayer({ classification: 'USER_PROVIDED' }))
    expect(issues.some((issue) => issue.field === 'classification')).toBe(true)
  })

  it('requires an https source and a screening note', () => {
    const issues = validateRegionalContextLayer(baseRegionalLayer({ sourceUri: 'http://insecure.example', screeningNote: '' }))
    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining(['sourceUri', 'screeningNote']))
  })
})

describe('computeDownstreamImpacts', () => {
  it('holds all three downstream targets for an UNKNOWN observation', () => {
    const record = intakeSiteObservation(baseInput({ checksum: 'bad' }), classificationOptions())
    const impacts = computeDownstreamImpacts([record], [])
    expect(impacts.filter((i) => i.action === 'HOLD').map((i) => i.target).sort()).toEqual(['BOQ', 'DesignStudio', 'Structura'])
  })

  it('rechecks DesignStudio and Structura for a STALE observation', () => {
    const record = intakeSiteObservation(baseInput({ fieldDate: '2020-01-01' }), classificationOptions())
    const impacts = computeDownstreamImpacts([record], [])
    expect(impacts.map((i) => i.target).sort()).toEqual(['DesignStudio', 'Structura'])
    expect(impacts.every((i) => i.action === 'RECHECK')).toBe(true)
  })

  it('rechecks BOQ for an INDICATIVE (field-estimate) observation', () => {
    const record = intakeSiteObservation(baseInput({ evidenceBasis: 'FIELD_ESTIMATE' }), classificationOptions())
    const impacts = computeDownstreamImpacts([record], [])
    expect(impacts).toEqual([{ target: 'BOQ', action: 'RECHECK', reason: expect.any(String), observationId: 'obs-1' }])
  })

  it('produces no impact for a clean SOURCE_VERIFIED observation', () => {
    const record = intakeSiteObservation(baseInput(), classificationOptions())
    expect(computeDownstreamImpacts([record], [])).toEqual([])
  })

  it('rechecks DesignStudio for stale or unknown regional context', () => {
    const impacts = computeDownstreamImpacts([], [baseRegionalLayer({ classification: 'STALE' })])
    expect(impacts).toEqual([{ target: 'DesignStudio', action: 'RECHECK', reason: expect.any(String), observationId: 'regional-groundwater-1' }])
  })
})

describe('fuseSiteAndRegionalEvidence', () => {
  it('keeps site and regional evidence in disjoint arrays and tallies classifications', () => {
    const site = intakeSiteObservation(baseInput(), classificationOptions())
    const regional = baseRegionalLayer()
    const report = fuseSiteAndRegionalEvidence([site], [regional])
    expect(report.siteObservations).toEqual([site])
    expect(report.regionalContext).toEqual([regional])
    expect(report.classificationCounts).toEqual({ USER_PROVIDED: 0, SOURCE_VERIFIED: 1, INDICATIVE: 1, UNKNOWN: 0, STALE: 0 })
    expect(report.prohibitedConclusions).toEqual(prohibitedGeotechConclusions)
  })

  it('throws if a site record is mis-scoped', () => {
    const site = intakeSiteObservation(baseInput(), classificationOptions())
    const mixed = { ...site, scope: 'REGIONAL_OPEN_GOVERNMENT' as unknown as 'SITE_OBSERVATION' }
    expect(() => fuseSiteAndRegionalEvidence([mixed], [])).toThrow(/must never share one list/)
  })

  it('throws if a regional layer is mis-scoped', () => {
    const layer = { ...baseRegionalLayer(), scope: 'SITE_OBSERVATION' as unknown as 'REGIONAL_OPEN_GOVERNMENT' }
    expect(() => fuseSiteAndRegionalEvidence([], [layer])).toThrow(/must never share one list/)
  })

  it('never asserts bearing capacity, foundation suitability or a legal boundary', () => {
    expect(prohibitedGeotechConclusions).toEqual([
      'Allowable or ultimate bearing capacity',
      'Foundation type or suitability determination',
      'Legal or cadastral property boundary',
    ])
  })
})
