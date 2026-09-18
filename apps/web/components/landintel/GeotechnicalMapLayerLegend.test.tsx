import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GeotechnicalMapLayerLegend from './GeotechnicalMapLayerLegend'
import { useParcelContext, writeParcelContext, type ParcelContext } from '../../lib/workspace/parcelContext'
import { assessGeotechnicalEvidence } from '../../lib/landintel/geotechnicalIntelligence'
import type { GeotechnicalEvidence, ProjectGeotechnicalInput } from '../../lib/landintel/geotechnicalIntelligence'

vi.mock('../../lib/workspace/parcelContext', async () => {
  const actual = await vi.importActual<typeof import('../../lib/workspace/parcelContext')>('../../lib/workspace/parcelContext')
  return { ...actual, useParcelContext: vi.fn() }
})

const parcelContext = (overrides: Partial<ParcelContext> = {}): ParcelContext => ({
  version: 1, method: 'ulpin', ulpin: 'KA-BLR-0001-2024', state: 'Karnataka', district: 'Bengaluru Urban',
  area_sqm: 1200, land_use: 'Residential', coordinates: { lat: 12.97, lng: 77.59 },
  provenance: { source: 'Seeded D1 record', vintage: '2026-09-18', status: 'INDICATIVE' },
  ...overrides,
})

describe('GeotechnicalMapLayerLegend', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(useParcelContext).mockReturnValue(null)
  })

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

  it('states the authority boundary visibly and preserves non-authoritative evidence as a gap', () => {
    const evidence: GeotechnicalEvidence[] = [
      { id: 'indicative-a', topic: 'regional-geology-lithology', label: 'Indicative geology', value: 'Alluvium', unit: null, status: 'INDICATIVE', method: 'MODELLED', scope: 'REGIONAL_SCREENING', confidence: 'MEDIUM', coverage: { kind: 'REGION', label: 'Karnataka', coverageGaps: [] }, lineage: null, limitations: [], validUntil: null },
      { id: 'inferred-a', topic: 'groundwater', label: 'Inferred groundwater', value: null, unit: null, status: 'INFERRED', method: 'INFERRED', scope: 'REGIONAL_SCREENING', confidence: 'LOW', coverage: { kind: 'REGION', label: 'Karnataka', coverageGaps: [] }, lineage: null, limitations: [], validUntil: null },
      { id: 'provided-a', topic: 'flood-drainage', label: 'Provided flood note', value: null, unit: null, status: 'USER-PROVIDED', method: 'OBSERVED', scope: 'REGIONAL_SCREENING', confidence: 'LOW', coverage: { kind: 'REGION', label: 'Karnataka', coverageGaps: [] }, lineage: null, limitations: [], validUntil: null },
    ]
    render(<GeotechnicalMapLayerLegend assessment={assessGeotechnicalEvidence(evidence)} />)
    expect(screen.getByText(/reserved for SOURCE-VERIFIED regional evidence with known coverage/)).toBeTruthy()
    expect(screen.getByText('Authoritative mapped coverage').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('0')
    expect(screen.getByText('UNKNOWN gap').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('3')
  })

  it('never claims to render map geometry -- describes a declarative categorisation only', () => {
    render(<GeotechnicalMapLayerLegend />)
    expect(screen.getByText(/declarative categorisation, not a rendered map/)).toBeTruthy()
    expect(screen.getByText(/no map canvas or geometry is drawn on this page/)).toBeTruthy()
    expect(screen.queryByText(/kept spatially distinct/)).toBeNull()
  })

  it('keeps a project investigation point distinct from a conflicting regional layer', () => {
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

  it('does NOT go stale when no generatedFor context is supplied, even if the active site changes', () => {
    const evidence: GeotechnicalEvidence[] = [
      { id: 'regional-a', topic: 'regional-geology-lithology', label: 'Regional geology', value: 'Alluvium', unit: null, status: 'SOURCE-VERIFIED', method: 'MODELLED', scope: 'REGIONAL_SCREENING', confidence: 'MEDIUM', coverage: { kind: 'REGION', label: 'Karnataka', coverageGaps: [] }, lineage: null, limitations: [], validUntil: null },
    ]
    writeParcelContext(parcelContext())
    render(<GeotechnicalMapLayerLegend assessment={assessGeotechnicalEvidence(evidence)} />)
    expect(screen.getByText('Authoritative mapped coverage').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('1')
    expect(screen.getByText('Stale').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('0')
  })

  it('a real parcel swap reclassifies non-conflict items to Stale, proving generatedFor is compared against the ACTIVE context, not itself', () => {
    const generatedFor = parcelContext({ ulpin: 'KA-BLR-0001-2024', district: 'Bengaluru Urban' })
    writeParcelContext(generatedFor)
    const evidence: GeotechnicalEvidence[] = [
      { id: 'regional-a', topic: 'regional-geology-lithology', label: 'Regional geology', value: 'Alluvium', unit: null, status: 'SOURCE-VERIFIED', method: 'MODELLED', scope: 'REGIONAL_SCREENING', confidence: 'MEDIUM', coverage: { kind: 'REGION', label: 'Karnataka', coverageGaps: [] }, lineage: null, limitations: [], validUntil: null },
      { id: 'conflict-a', topic: 'seismic-hazard', label: 'Seismic hazard', value: null, unit: null, status: 'CONFLICT', method: 'MODELLED', scope: 'REGIONAL_SCREENING', confidence: 'LOW', coverage: { kind: 'REGION', label: 'Karnataka', coverageGaps: [] }, lineage: null, limitations: [], validUntil: null },
    ]
    const assessment = assessGeotechnicalEvidence(evidence)
    const { rerender } = render(<GeotechnicalMapLayerLegend assessment={assessment} generatedFor={generatedFor} />)

    // Still the active site: no reclassification yet.
    expect(screen.getByText('Authoritative mapped coverage').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('1')
    expect(screen.getByText('Conflict').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('1')
    expect(screen.getByText('Stale').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('0')

    // The user resolves a DIFFERENT site elsewhere in the app -- this is the
    // real parcel-swap regression this test guards: `generatedFor` (fixed,
    // from the caller) must be compared against the freshly-active context
    // read at render time, never against a copy of the live value itself.
    writeParcelContext(parcelContext({ ulpin: 'MH-PUN-0002-2024', district: 'Pune', state: 'Maharashtra' }))
    rerender(<GeotechnicalMapLayerLegend assessment={assessment} generatedFor={generatedFor} />)

    expect(screen.getByText('Authoritative mapped coverage').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('0')
    expect(screen.getByText('Conflict').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('1')
    expect(screen.getByText('Stale').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('1')
  })
})
