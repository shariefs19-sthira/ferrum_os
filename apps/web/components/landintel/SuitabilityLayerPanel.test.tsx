import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SuitabilityLayerPanel from './SuitabilityLayerPanel'
import { useParcelContext } from '../../lib/workspace/parcelContext'

vi.mock('../../lib/workspace/parcelContext', () => ({ useParcelContext: vi.fn() }))

describe('LandIntel suitability layer panel', () => {
  beforeEach(() => vi.mocked(useParcelContext).mockReturnValue(null))

  it('keeps all evidence layers and decision states visible without claiming a result', () => {
    render(<SuitabilityLayerPanel />)
    expect(screen.getByText('Roadmap')).toBeTruthy()
    expect(screen.getAllByText('ROADMAP')).toHaveLength(8)
    expect(screen.getAllByText('UNKNOWN').length).toBeGreaterThanOrEqual(9)
    expect(screen.getByText('Parcel & statutory boundaries')).toBeTruthy()
    expect(screen.getByText('Setbacks & zoning')).toBeTruthy()
    expect(screen.getByText('Topography & slope')).toBeTruthy()
    expect(screen.getByText('Drainage & flood exposure')).toBeTruthy()
    expect(screen.getByText('Soil & geotechnical conditions')).toBeTruthy()
    expect(screen.getByText('Ecology & protected areas')).toBeTruthy()
    expect(screen.getByText('Utilities & access')).toBeTruthy()
    expect(screen.getByText('Development cost & constructability')).toBeTruthy()
    const states = within(screen.getByLabelText('Suitability decision states'))
    expect(states.getByText('Hard exclusion')).toBeTruthy()
    expect(states.getByText('Weighted preference')).toBeTruthy()
    expect(states.getByText('Data conflict')).toBeTruthy()
    expect(states.getByText('Suitable development zone')).toBeTruthy()
    expect(screen.getByText(/No zone is ranked from sample or missing data/)).toBeTruthy()
  })

  it('shows parcel provenance without converting it into a suitability conclusion', () => {
    vi.mocked(useParcelContext).mockReturnValue({ version: 1, method: 'ulpin', ulpin: 'KA-BLR-0001-2024', state: 'Karnataka', district: 'Bengaluru Urban', area_sqm: 1200, land_use: 'Residential', coordinates: { lat: 12.97, lng: 77.59 }, provenance: { source: 'Seeded D1 record', vintage: '2026-09-18', status: 'INDICATIVE' } })
    render(<SuitabilityLayerPanel />)
    expect(screen.getByText('Seeded D1 record')).toBeTruthy()
    expect(screen.getByText('18 Sept 2026')).toBeTruthy()
    expect(screen.getByText('CONTEXT LOADED')).toBeTruthy()
    expect(screen.getByText(/An indicative parcel context is loaded.*remaining authority and site evidence is incomplete/)).toBeTruthy()
    expect(screen.getByText('Suitable development zone: UNKNOWN')).toBeTruthy()
  })
})
