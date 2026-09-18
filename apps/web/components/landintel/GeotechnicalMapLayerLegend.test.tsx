import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GeotechnicalMapLayerLegend from './GeotechnicalMapLayerLegend'
import { useParcelContext } from '../../lib/workspace/parcelContext'
import { assessGeotechnicalEvidence } from '../../lib/landintel/geotechnicalIntelligence'
import type { GeotechnicalEvidence, ProjectGeotechnicalInput } from '../../lib/landintel/geotechnicalIntelligence'

vi.mock('../../lib/workspace/parcelContext', async () => {
  const actual = await vi.importActual<typeof import('../../lib/workspace/parcelContext')>('../../lib/workspace/parcelContext')
  return { ...actual, useParcelContext: vi.fn() }
})

describe('GeotechnicalMapLayerLegend', () => {
  beforeEach(() => vi.mocked(useParcelContext).mockReturnValue(null))

  it('renders all five categories with a real description, never blank on an UNKNOWN-only screen', () => {
    render(<GeotechnicalMapLayerLegend />)
    expect(screen.getByText('Authoritative mapped coverage')).toBeTruthy()
    expect(screen.getByText('Project investigation point')).toBeTruthy()
    expect(screen.getByText('Conflict')).toBeTruthy()
    expect(screen.getByText('Stale')).toBeTruthy()
    expect(screen.getByText('UNKNOWN gap')).toBeTruthy()
    // 20 canonical topics all default to UNKNOWN -> UNKNOWN_GAP
    const unknownArticle = screen.getByText('UNKNOWN gap').parentElement!
    expect(unknownArticle.querySelector('[data-map-layer-count]')!.textContent).toBe('20')
  })

  it('declares every government connector as unconnected, never claiming a live source', () => {
    render(<GeotechnicalMapLayerLegend />)
    expect(screen.getByText(/DECLARATIVE ONLY -- none is wired to live credentials/)).toBeTruthy()
  })

  it('keeps a project investigation point spatially distinct from a conflicting regional layer', () => {
    const evidence: GeotechnicalEvidence[] = [
      { id: 'regional-a', topic: 'regional-geology-lithology', label: 'Regional geology', value: 'Alluvium', unit: null, status: 'CONFLICT', method: 'MODELLED', scope: 'REGIONAL_SCREENING', confidence: 'MEDIUM', coverage: { kind: 'REGION', label: 'Karnataka', coverageGaps: [] }, lineage: null, limitations: [], validUntil: null },
    ]
    const projectInputs: ProjectGeotechnicalInput[] = [
      { id: 'bh-01', kind: 'BOREHOLE_LOG', title: 'BH-01', fileName: 'bh01.pdf', issueDate: '2026-09-01', responsibleParty: 'Ferrum Geotech Pvt Ltd', professionalRole: 'Geotechnical Engineer', coordinates: { eastingOrLongitude: 77.59, northingOrLatitude: 12.97, horizontalCrs: 'EPSG:4326', groundLevel: 913, verticalDatum: 'MSL' }, units: {}, sourceRevision: 'Rev A', checksum: 'a'.repeat(64), status: 'USER-PROVIDED', observations: [] },
    ]
    render(<GeotechnicalMapLayerLegend assessment={assessGeotechnicalEvidence(evidence)} projectInputs={projectInputs} />)
    const conflictCount = screen.getByText('Conflict').parentElement!
    const pointCount = screen.getByText('Project investigation point').parentElement!
    expect(conflictCount.querySelector('[data-map-layer-count]')!.textContent).toBe('1')
    expect(pointCount.querySelector('[data-map-layer-count]')!.textContent).toBe('1')
  })
})
