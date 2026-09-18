import { describe, expect, it } from 'vitest'
import {
  assessGeotechnicalEvidence,
  createUnknownGeotechnicalScreening,
  governmentGeotechnicalSources,
  type GeotechnicalEvidence,
  type ProjectGeotechnicalInput,
  validateProjectGeotechnicalInput,
} from './geotechnicalIntelligence'

const evidence = (overrides: Partial<GeotechnicalEvidence>): GeotechnicalEvidence => ({
  id: 'e-1', topic: 'groundwater', label: 'Groundwater', value: 2.4, unit: 'm bgl',
  status: 'USER-PROVIDED', method: 'OBSERVED', confidence: 'MEDIUM',
  scope: 'PROJECT_INVESTIGATION',
  coverage: { kind: 'POINT', label: 'BH-01', coverageGaps: [] }, lineage: null,
  limitations: [], validUntil: null, ...overrides,
})

describe('geotechnical intelligence contracts', () => {
  it('keeps source connectors declarative and describes screening boundaries', () => {
    expect(governmentGeotechnicalSources.length).toBeGreaterThanOrEqual(5)
    for (const source of governmentGeotechnicalSources) {
      expect(source.connectorState).toBe('DECLARATIVE ONLY')
      expect(source.screeningBoundary.length).toBeGreaterThan(30)
      expect(source.uri).toMatch(/^https:\/\//)
    }
  })

  it('blocks conflicting evidence and invalidates dependent products', () => {
    const result = assessGeotechnicalEvidence([
      evidence({ id: 'gw-a', status: 'CONFLICT' }),
      evidence({ id: 'soil-a', topic: 'soil-classification-properties', value: 'Silty sand' }),
    ])
    expect(result.suitability).toBe('BLOCKED')
    expect(result.holds.join(' ')).toMatch(/conflicting evidence/i)
    expect(result.downstreamInvalidations).toEqual(expect.arrayContaining(['DesignStudio', 'Structures', 'Foundations', 'BOQ']))
  })

  it('does not turn a blank regional screen into investigation-grade evidence', () => {
    const result = createUnknownGeotechnicalScreening()
    expect(result.coveragePercent).toBe(0)
    expect(result.suitability).toBe('SCREENING ONLY')
    expect(result.evidence.every((item) => item.status === 'UNKNOWN')).toBe(true)
    expect(result.holds.join(' ')).toMatch(/project investigation evidence required/i)
  })

  it('does not let source-verified regional data clear project investigation holds', () => {
    const result = assessGeotechnicalEvidence([
      evidence({
        id: 'regional-soil', topic: 'soil-classification-properties', value: 'Mapped alluvium',
        status: 'SOURCE-VERIFIED', scope: 'REGIONAL_SCREENING',
      }),
      evidence({ id: 'regional-groundwater', status: 'SOURCE-VERIFIED', scope: 'REGIONAL_SCREENING' }),
    ])
    expect(result.suitability).toBe('SCREENING ONLY')
    expect(result.holds.join(' ')).toMatch(/soil classification and properties/i)
    expect(result.downstreamInvalidations).toEqual(expect.arrayContaining(['Structures', 'Foundations', 'BOQ']))
  })

  it('requires accountable metadata and preserves USER-PROVIDED status', () => {
    const input: ProjectGeotechnicalInput = {
      id: 'bh-01', kind: 'BOREHOLE_LOG', title: 'BH-01', fileName: 'bh01.pdf',
      issueDate: '19-09-2026', responsibleParty: '', professionalRole: '', coordinates: {
        eastingOrLongitude: 77.5, northingOrLatitude: 12.9, horizontalCrs: '', groundLevel: 913, verticalDatum: null,
      }, units: {}, sourceRevision: '', checksum: 'bad', status: 'USER-PROVIDED',
      observations: [evidence({ status: 'SOURCE-VERIFIED' })],
    }
    const issues = validateProjectGeotechnicalInput(input)
    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining([
      'issueDate', 'responsibleParty', 'professionalRole', 'sourceRevision', 'checksum',
      'coordinates.horizontalCrs', 'coordinates.verticalDatum', 'observations.e-1.status',
    ]))
  })
})
