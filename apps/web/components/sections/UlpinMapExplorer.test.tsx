import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UlpinMapExplorer from './UlpinMapExplorer'
import { writeParcelContext } from '../../lib/workspace/parcelContext'

vi.mock('./ParcelMap', () => ({ default: ({ onPinDrop }: { onPinDrop?: (point: { lat: number; lng: number }) => void }) => <button type="button" aria-label="Map showing sample" onClick={() => onPinDrop?.({ lat: 12.9, lng: 77.5 })}>Map</button> }))
vi.mock('./SiteMap3D', () => ({ default: ({ lat, lng, onPinDrop, onUnavailable }: { lat: number; lng: number; onPinDrop?: (point: { lat: number; lng: number }) => void; onUnavailable?: (reason: string) => void }) => <div data-testid="site-map-3d" data-lat={lat} data-lng={lng}><button type="button" onClick={() => onPinDrop?.({ lat: 12.5, lng: 77.1 })}>3D pin</button><button type="button" onClick={() => onUnavailable?.('style-failed')}>3D fail</button></div> }))
vi.mock('../ProvenanceStrip', () => ({ ProvenanceStrip: ({ source }: { source: string }) => <span>Source: {source}</span> }))
vi.mock('../../lib/workspace/parcelContext', () => ({ writeParcelContext: vi.fn() }))

// jsdom has no PointerEvent, so pointerType would be dropped and a touch tap would be indistinguishable from a mouse click.
if (typeof window.PointerEvent === 'undefined') {
  class TestPointerEvent extends MouseEvent { pointerType: string; constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) { super(type, init); this.pointerType = init.pointerType ?? '' } }
  vi.stubGlobal('PointerEvent', TestPointerEvent)
}

const seeded = { ulpin: 'KA-BLR-0001-2024', state: 'Karnataka', district: 'Bengaluru Urban', area_sqm: 1500, land_use: 'Commercial', plot_intel: { advisable_types: [{ building_type: 'Retail complex', reason: 'Sample commercial rule fit' }] } }
describe('UlpinMapExplorer W-85 parcel finder', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => seeded })) })

  it('shows one light contextual tip at a time: hover/keyboard reveal, click/leave/blur/Escape/mode change dismiss', () => {
    render(<UlpinMapExplorer />)
    const coordinates = screen.getByRole('button', { name: 'Coordinates' }), address = screen.getByRole('button', { name: 'Address' })
    expect(coordinates.hasAttribute('title')).toBe(false)
    expect(coordinates.getAttribute('data-sutra-feature-id')).toBe('location-coordinates')
    expect(screen.queryAllByRole('tooltip')).toHaveLength(0); expect(coordinates.hasAttribute('aria-describedby')).toBe(false)
    fireEvent.pointerEnter(coordinates, { pointerType: 'mouse' })
    expect(screen.getAllByRole('tooltip')).toHaveLength(1); expect(coordinates.getAttribute('aria-describedby')).toBe('landintel-location-coordinates-tip')
    fireEvent.click(coordinates)
    expect(screen.queryAllByRole('tooltip')).toHaveLength(0); expect(coordinates.hasAttribute('aria-describedby')).toBe(false)
    fireEvent.pointerLeave(coordinates); fireEvent.pointerEnter(address, { pointerType: 'mouse' })
    const tips = screen.getAllByRole('tooltip'); expect(tips).toHaveLength(1); expect(tips[0].textContent).toContain('Search a place name')
    expect(tips[0].className).not.toMatch(/bg-relume-ink|text-white/)
    fireEvent.click(address); expect(screen.queryAllByRole('tooltip')).toHaveLength(0)
    fireEvent.pointerEnter(coordinates, { pointerType: 'mouse' }); fireEvent.pointerLeave(coordinates); expect(screen.queryAllByRole('tooltip')).toHaveLength(0)
    fireEvent.pointerEnter(coordinates, { pointerType: 'mouse' }); fireEvent.pointerEnter(address, { pointerType: 'mouse' }); expect(screen.getAllByRole('tooltip')).toHaveLength(1)
    fireEvent.keyDown(address, { key: 'Escape' }); expect(screen.queryAllByRole('tooltip')).toHaveLength(0)
  })

  it('closes a hover-only tip on a document-level Escape (no keyboard focus anywhere) and removes the listener with the tip', () => {
    render(<UlpinMapExplorer />)
    const coordinates = screen.getByRole('button', { name: 'Coordinates' })
    expect(document.activeElement).toBe(document.body)
    fireEvent.pointerEnter(coordinates, { pointerType: 'mouse' }); expect(screen.getAllByRole('tooltip')).toHaveLength(1)
    expect(document.activeElement).not.toBe(coordinates)
    fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.queryAllByRole('tooltip')).toHaveLength(0); expect(coordinates.hasAttribute('aria-describedby')).toBe(false)
    const remove = vi.spyOn(document, 'removeEventListener')
    fireEvent.pointerEnter(coordinates, { pointerType: 'mouse' }); fireEvent.pointerLeave(coordinates, { pointerType: 'mouse' })
    expect(remove.mock.calls.some(([type]) => type === 'keydown')).toBe(true); remove.mockRestore()
  })

  it('opens the help on a touch tap, keeps it through the touch pointerleave, and clears on tap-away, Escape or the next method tap', () => {
    render(<UlpinMapExplorer />)
    const coordinates = screen.getByRole('button', { name: 'Coordinates' }), address = screen.getByRole('button', { name: 'Address' })
    const tap = (button: HTMLElement) => { fireEvent.pointerEnter(button, { pointerType: 'touch' }); fireEvent.pointerDown(button, { pointerType: 'touch' }); fireEvent.pointerUp(button, { pointerType: 'touch' }); fireEvent.click(button); fireEvent.pointerLeave(button, { pointerType: 'touch' }) }
    tap(coordinates)
    expect(coordinates.getAttribute('aria-pressed')).toBe('true'); expect(screen.getAllByRole('tooltip')).toHaveLength(1); expect(coordinates.getAttribute('aria-describedby')).toBe('landintel-location-coordinates-tip')
    fireEvent.pointerDown(address, { pointerType: 'touch' }); fireEvent.click(address)
    const tips = screen.getAllByRole('tooltip'); expect(tips).toHaveLength(1); expect(tips[0].textContent).toContain('Search a place name'); expect(coordinates.hasAttribute('aria-describedby')).toBe(false)
    fireEvent.pointerDown(document.body, { pointerType: 'touch' }); expect(screen.queryAllByRole('tooltip')).toHaveLength(0)
    tap(coordinates); expect(screen.getAllByRole('tooltip')).toHaveLength(1); fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.queryAllByRole('tooltip')).toHaveLength(0)
    // a mouse click (no touch pointerdown) still dismisses instead of opening
    fireEvent.pointerEnter(address, { pointerType: 'mouse' }); fireEvent.pointerDown(address, { pointerType: 'mouse' }); fireEvent.click(address); expect(screen.queryAllByRole('tooltip')).toHaveLength(0)
  })

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
    const overlay = document.querySelector('[data-map-overlay]')
    expect(document.querySelector('[data-parcel-map-stage]')?.contains(overlay)).toBe(true)
    expect(overlay?.className).toContain('absolute')
    expect(document.getElementById('parcel-finder-status')?.className).toContain('min-h-10')
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

  describe('2D/3D site map toggle', () => {
    const webgl2 = (available: boolean) => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((kind: string) => (available && kind === 'webgl2' ? ({} as never) : null)) as never)
    const three = () => screen.getByRole('button', { name: '3D context' })

    it('defaults to the 2D plan with an accessible pressed-state toggle and shows the exact selected point', () => {
      webgl2(true); render(<UlpinMapExplorer />)
      const group = screen.getByRole('group', { name: 'Map view' })
      expect(group.querySelectorAll('button')).toHaveLength(2)
      expect(screen.getByRole('button', { name: '2D plan' }).getAttribute('aria-pressed')).toBe('true'); expect(three().getAttribute('aria-pressed')).toBe('false')
      expect(screen.getByRole('button', { name: '2D plan' }).className).toContain('min-h-11'); expect(three().className).toContain('min-h-11')
      expect(document.querySelector('[data-selected-point]')?.textContent).toContain('12.97160, 77.59460')
      expect(screen.queryByTestId('site-map-3d')).toBeNull()
    })

    it('keeps the exact coordinates across 2D → 3D → 2D and follows every input method in 3D', async () => {
      webgl2(true); render(<UlpinMapExplorer />)
      fireEvent.click(screen.getByRole('button', { name: 'Coordinates' })); fireEvent.change(screen.getByLabelText('Latitude'), { target: { value: '13.0827' } }); fireEvent.change(screen.getByLabelText('Longitude'), { target: { value: '80.2707' } }); fireEvent.click(screen.getByRole('button', { name: 'Set coordinates' }))
      fireEvent.click(three()); const map3d = await screen.findByTestId('site-map-3d')
      expect(map3d.getAttribute('data-lat')).toBe('13.0827'); expect(map3d.getAttribute('data-lng')).toBe('80.2707')
      expect(three().getAttribute('aria-pressed')).toBe('true'); expect(screen.queryByRole('button', { name: 'Map showing sample' })).toBeNull()
      // pin drop inside 3D commits through the same parcel-context pipeline as 2D
      fireEvent.click(screen.getByRole('button', { name: '3D pin' })); await waitFor(() => expect(writeParcelContext).toHaveBeenLastCalledWith(expect.objectContaining({ coordinates: { lat: 12.5, lng: 77.1 } })))
      expect(screen.getByTestId('site-map-3d').getAttribute('data-lat')).toBe('12.5')
      // seeded ULPIN lookup while in 3D recentres 3D on the seeded sample coordinates
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ ...seeded, ulpin: 'MH-PUN-0002-2024', district: 'Pune' }) } as Response)
      fireEvent.click(screen.getByRole('button', { name: 'ULPIN' })); fireEvent.click(screen.getByRole('button', { name: 'MH-PUN-0002-2024' })); fireEvent.click(screen.getByRole('button', { name: 'Lookup seeded record' }))
      await waitFor(() => expect(screen.getByTestId('site-map-3d').getAttribute('data-lat')).toBe('18.5208'))
      fireEvent.click(screen.getByRole('button', { name: '2D plan' })); expect(screen.getByRole('button', { name: 'Map showing sample' })).toBeTruthy()
      expect(document.querySelector('[data-selected-point]')?.textContent).toContain('18.52080, 73.85510')
    })

    it('disables 3D with a visible reason when WebGL2 is missing and leaves 2D working', () => {
      webgl2(false); render(<UlpinMapExplorer />)
      return waitFor(() => { expect((three() as HTMLButtonElement).disabled).toBe(true) }).then(() => {
        expect(document.querySelector('[data-map-view-notice]')?.textContent).toMatch(/needs WebGL2/)
        expect(screen.getByRole('button', { name: 'Map showing sample' })).toBeTruthy()
      })
    })

    it('falls back to the 2D plan with a visible message when 3D tiles are unavailable', async () => {
      webgl2(true); render(<UlpinMapExplorer />); fireEvent.click(three()); fireEvent.click(await screen.findByRole('button', { name: '3D fail' }))
      await waitFor(() => expect(screen.getByRole('button', { name: 'Map showing sample' })).toBeTruthy())
      expect(document.querySelector('[data-map-view-notice]')?.textContent).toMatch(/could not be loaded.*2D plan/)
      expect(screen.getByRole('button', { name: '2D plan' }).getAttribute('aria-pressed')).toBe('true')
    })

    it('places the record card below the map on narrow screens and only overlays it from 1200px, so it cannot cover the map centre', async () => {
      webgl2(true); render(<UlpinMapExplorer />); fireEvent.click(screen.getByRole('button', { name: 'ULPIN' })); fireEvent.click(screen.getByRole('button', { name: seeded.ulpin })); fireEvent.click(screen.getByRole('button', { name: 'Lookup seeded record' }))
      await screen.findByText('Retail complex')
      const card = document.querySelector('[data-map-overlay]') as HTMLElement
      expect(card.className).not.toMatch(/(^|\s)absolute(\s|$)/); expect(card.className).toContain('min-[1200px]:absolute')
      expect(card.className).toMatch(/min-\[1200px\]:w-\[min\(26rem,40%\)\]/)
      expect(card.className).not.toContain('inset-x-3')
    })
  })
})
