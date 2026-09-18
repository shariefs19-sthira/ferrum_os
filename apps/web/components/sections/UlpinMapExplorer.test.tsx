import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UlpinMapExplorer from './UlpinMapExplorer'
import { writeParcelContext } from '../../lib/workspace/parcelContext'

vi.mock('./ParcelMap', () => ({ default: ({ onPinDrop }: { onPinDrop?: (point: { lat: number; lng: number }) => void }) => <button type="button" aria-label="Map showing sample" onClick={() => onPinDrop?.({ lat: 12.9, lng: 77.5 })}>Map</button> }))
vi.mock('../ProvenanceStrip', () => ({ ProvenanceStrip: ({ source }: { source: string }) => <span>Source: {source}</span> }))
vi.mock('../../lib/workspace/parcelContext', () => ({ writeParcelContext: vi.fn() }))

const seeded = { ulpin: 'KA-BLR-0001-2024', state: 'Karnataka', district: 'Bengaluru Urban', area_sqm: 1500, land_use: 'Commercial', plot_intel: { advisable_types: [{ building_type: 'Retail complex', reason: 'Sample commercial rule fit' }] } }
describe('UlpinMapExplorer W-85 parcel finder', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => seeded })) })

  it('keeps the map mounted and writes a source-qualified seeded ULPIN context', async () => {
    render(<UlpinMapExplorer />); const map = screen.getByRole('button', { name: 'Map showing sample' })
    expect(screen.getAllByRole('button', { name: /ULPIN|Map pin|Coordinates|Address|My location|Survey \/ khasra/ })).toHaveLength(6)
    fireEvent.click(screen.getByRole('button', { name: seeded.ulpin })); fireEvent.click(screen.getByRole('button', { name: 'Lookup seeded record' }))
    await waitFor(() => expect(writeParcelContext).toHaveBeenCalledWith(expect.objectContaining({ method: 'ulpin', ulpin: seeded.ulpin, coordinates: { lat: 12.9716, lng: 77.5946 }, provenance: expect.objectContaining({ status: 'INDICATIVE' }) })))
    expect(screen.getByText('Commercial')).toBeTruthy()
    expect(screen.getByText('REQUIRES AUTHORITY VERIFICATION')).toBeTruthy()
    expect(screen.getByText('Retail complex')).toBeTruthy()
    expect(screen.getByText(/recommendations, not authority-permitted uses/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Residential' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Commercial' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Mixed Use' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Map showing sample' })).toBe(map)
  })

  it('parses coordinate input and visibly announces invalid input', () => {
    render(<UlpinMapExplorer />); fireEvent.click(screen.getByRole('button', { name: 'Coordinates' }))
    fireEvent.change(screen.getByLabelText('Latitude'), { target: { value: 'invalid' } }); fireEvent.click(screen.getByRole('button', { name: 'Set coordinates' }))
    expect(screen.getByRole('status').textContent).toContain('Enter valid decimal or DMS coordinates')
    expect(screen.getByLabelText('Latitude').getAttribute('aria-invalid')).toBe('true')
    fireEvent.change(screen.getByLabelText('Latitude'), { target: { value: '12°58′18″N' } }); fireEvent.change(screen.getByLabelText('Longitude'), { target: { value: '77°35′41″E' } }); fireEvent.click(screen.getByRole('button', { name: 'Set coordinates' }))
    expect(writeParcelContext).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'coordinates', area_sqm: 0, provenance: expect.objectContaining({ status: 'GAP' }) }))
  })

  it('supports address candidates, pin reverse-geocoding, roadmap disclosure, and location denial', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => [{ display_name: 'Bengaluru, Karnataka', lat: '12.97', lon: '77.59' }] } as Response)
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (_ok: unknown, fail: (error: { code: number }) => void) => fail({ code: 1 }) } })
    render(<UlpinMapExplorer />); fireEvent.click(screen.getByRole('button', { name: 'Address' })); fireEvent.change(screen.getByLabelText('Address or place'), { target: { value: 'Bengaluru' } }); fireEvent.click(screen.getByRole('button', { name: 'Search address' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Bengaluru, Karnataka' })).toBeTruthy()); fireEvent.click(screen.getByRole('button', { name: 'Bengaluru, Karnataka' })); expect(writeParcelContext).toHaveBeenCalledWith(expect.objectContaining({ method: 'place', provenance: expect.objectContaining({ source: expect.stringContaining('Nominatim') }) }))
    fireEvent.click(screen.getByRole('button', { name: 'Map showing sample' })); await waitFor(() => expect(writeParcelContext).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'My location' })); fireEvent.click(screen.getByRole('button', { name: 'Use my location' })); expect(screen.getByRole('status').textContent).toContain('Location permission was denied')
    fireEvent.click(screen.getByRole('button', { name: 'Survey / khasra' })); expect(screen.getByText('ROADMAP')).toBeTruthy()
  })
})
