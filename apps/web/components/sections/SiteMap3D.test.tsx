import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SiteMap3D from './SiteMap3D'
import { MAPLIBRE_WORKER_URL, OPENFREEMAP_STYLE_URL } from './siteMap3dHelpers'

type Handler = (event?: unknown) => void
const h = vi.hoisted(() => {
  const state = { maps: [] as any[], markers: [] as any[], features: [] as unknown[], loaded: true }
  return state
})

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}))
vi.mock('maplibre-gl', () => {
  class FakeMap {
    handlers: Record<string, Handler[]> = {}
    layers: any[] = [{ id: 'label', type: 'symbol', layout: { 'text-field': '{name}' } }]
    added: any[] = []
    center = { lat: 0, lng: 0 }
    zoom = 17; pitch = 60; bearing = -17.6
    removed = false
    easeTo = vi.fn((o: any) => { if (o.center) this.center = { lng: o.center[0], lat: o.center[1] }; if (o.zoom !== undefined) this.zoom = o.zoom; if (o.pitch !== undefined) this.pitch = o.pitch; if (o.bearing !== undefined) this.bearing = o.bearing; this.emit('moveend') })
    constructor(public options: any) { this.center = { lng: options.center[0], lat: options.center[1] }; h.maps.push(this) }
    on(name: string, fn: Handler) { (this.handlers[name] ??= []).push(fn) }
    emit(name: string, event?: unknown) { (this.handlers[name] ?? []).forEach((fn) => fn(event)) }
    getStyle() { return { layers: this.layers } }
    addSource = vi.fn(); addLayer = vi.fn((spec: any) => { this.added.push(spec); this.layers.push(spec) })
    getLayer(id: string) { return this.added.find((l) => l.id === id) }
    getCenter() { return this.center } getZoom() { return this.zoom } getPitch() { return this.pitch } getBearing() { return this.bearing }
    queryRenderedFeatures() { return h.features } areTilesLoaded() { return true } isStyleLoaded() { return this.added.length > 0 } loaded() { return h.loaded }
    remove() { this.removed = true }
  }
  class FakeMarker {
    el: HTMLElement; lngLat: number[] = []
    constructor(o: any) { this.el = o.element; h.markers.push(this) }
    setLngLat(v: number[]) { this.lngLat = v; return this } addTo() { return this } getElement() { return this.el } remove() {}
  }
  return { Map: FakeMap, Marker: FakeMarker, setWorkerUrl: vi.fn() }
})

const webgl2 = (available: boolean) => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((kind: string) => (available && kind === 'webgl2' ? ({} as never) : null)) as never)
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)) })
const loadMap = async () => { await flush(); const map = h.maps.at(-1); await act(async () => { map.emit('load') }); return map }

describe('SiteMap3D', () => {
  beforeEach(() => { h.maps.length = 0; h.markers.length = 0; h.features = []; h.loaded = true; vi.restoreAllMocks(); webgl2(true) })

  it('starts MapLibre on OpenFreeMap centred on the exact selected point with a same-origin worker and tilt', async () => {
    const maplibre = await import('maplibre-gl')
    render(<SiteMap3D lat={12.97161} lng={77.59462} />)
    const map = await loadMap()
    expect(maplibre.setWorkerUrl).toHaveBeenCalledWith(MAPLIBRE_WORKER_URL)
    expect(map.options.style).toBe(OPENFREEMAP_STYLE_URL)
    expect(map.options.center).toEqual([77.59462, 12.97161]); expect(map.options.pitch).toBeGreaterThan(0)
    expect(h.markers[0].lngLat).toEqual([77.59462, 12.97161])
    expect(document.querySelector('[data-site-map-3d]')?.getAttribute('data-3d-status')).toBe('ready')
    expect(map.added.map((l: any) => l.type)).toEqual(['fill-extrusion', 'line'])
    expect(map.addLayer.mock.calls[0][1]).toBe('label')
  })

  it('reports covered footprints with observed-vs-assumed height counts, attribution and the not-survey-grade notice', async () => {
    h.features = [{ properties: { render_height: 21 } }, { properties: { render_height: 5 } }, { properties: { render_height: 5 } }]
    render(<SiteMap3D lat={12.97} lng={77.59} />)
    const map = await loadMap(); await act(async () => { map.emit('idle') })
    const root = document.querySelector('[data-site-map-3d]')!
    expect(root.getAttribute('data-coverage')).toBe('covered'); expect(root.getAttribute('data-building-count')).toBe('3')
    expect(root.getAttribute('data-assumed-height-count')).toBe('2')
    expect(screen.getByText(/3 OSM building footprints in view · 1 with OSM-derived height · 2 at an assumed 5 m default/)).toBeTruthy()
    expect(screen.getByRole('list', { name: '3D map legend' }).textContent).toMatch(/OSM building footprint.*Height derived from OSM tags.*Assumed 5 m default height/)
    expect(document.querySelector('[data-site-map-3d-attribution]')?.textContent).toMatch(/OpenFreeMap.*OpenMapTiles.*OpenStreetMap contributors/)
    expect(screen.getByText(/not survey-grade/i)).toBeTruthy()
  })

  it('shows an honest empty state when no footprints exist, without inventing buildings', async () => {
    render(<SiteMap3D lat={13} lng={82} />)
    const map = await loadMap(); await act(async () => { map.emit('idle') })
    expect(document.querySelector('[data-site-map-3d]')?.getAttribute('data-coverage')).toBe('none')
    expect(screen.getByText(/No OpenStreetMap building footprints found in this view/)).toBeTruthy()
    expect(map.added).toHaveLength(2) // only the tile-driven layers; no GeoJSON building sources
    expect(map.addSource).toHaveBeenCalledTimes(1)
  })

  it('moves marker and camera to a new selected point across input methods and keeps the tilt', async () => {
    const { rerender } = render(<SiteMap3D lat={12.97} lng={77.59} />)
    const map = await loadMap()
    rerender(<SiteMap3D lat={18.5208} lng={73.8551} />)
    expect(h.markers[0].lngLat).toEqual([73.8551, 18.5208])
    expect(map.center).toEqual({ lng: 73.8551, lat: 18.5208 })
    expect(map.pitch).toBe(60)
    expect(h.markers[0].el.getAttribute('aria-label')).toBe('Selected site point: 18.52080, 73.85510')
    expect(document.querySelector('[data-site-map-3d]')?.getAttribute('data-map-center-lat')).toBe('18.520800')
  })

  it('offers labelled, ≥44px keyboard-operable controls for zoom, tilt, rotate and recenter', async () => {
    render(<SiteMap3D lat={12.97} lng={77.59} />)
    const map = await loadMap()
    for (const name of ['Zoom in', 'Zoom out', 'Tilt up', 'Tilt down', 'Rotate left', 'Rotate right', 'Recenter on selected location']) {
      const button = screen.getByRole('button', { name })
      expect(button.className).toContain('h-11'); expect(button.className).toContain('w-11'); expect(button.tagName).toBe('BUTTON')
    }
    fireEvent.click(screen.getByRole('button', { name: 'Tilt down' })); expect(map.pitch).toBe(50)
    fireEvent.click(screen.getByRole('button', { name: 'Rotate right' })); expect(map.bearing).toBeCloseTo(-2.6)
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' })); expect(map.zoom).toBe(18)
    map.center = { lat: 1, lng: 1 }; fireEvent.click(screen.getByRole('button', { name: 'Recenter on selected location' }))
    expect(map.center).toEqual({ lng: 77.59, lat: 12.97 })
    expect(screen.getByRole('region', { name: /Interactive 3D map.*Arrow keys pan.*rotate and tilt/ })).toBeTruthy()
  })

  it('forwards map clicks as pin drops (parity with 2D)', async () => {
    const onPinDrop = vi.fn()
    render(<SiteMap3D lat={12.97} lng={77.59} onPinDrop={onPinDrop} />)
    const map = await loadMap(); await act(async () => { map.emit('click', { lngLat: { lat: 12.5, lng: 77.1 } }) })
    expect(onPinDrop).toHaveBeenCalledWith({ lat: 12.5, lng: 77.1 })
  })

  it('reports WebGL2 absence once and never starts MapLibre', async () => {
    vi.restoreAllMocks(); webgl2(false)
    const onUnavailable = vi.fn()
    render(<SiteMap3D lat={12.97} lng={77.59} onUnavailable={onUnavailable} />); await flush()
    expect(onUnavailable).toHaveBeenCalledTimes(1); expect(onUnavailable).toHaveBeenCalledWith('webgl2-unavailable')
    expect(h.maps).toHaveLength(0)
    expect(screen.getByRole('alert').textContent).toMatch(/needs WebGL2.*2D plan/)
    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull()
  })

  it('falls back when the style/tiles fail before load, and ignores 404 empty tiles after load', async () => {
    const onUnavailable = vi.fn()
    render(<SiteMap3D lat={12.97} lng={77.59} onUnavailable={onUnavailable} />); await flush()
    const map = h.maps.at(-1); await act(async () => { map.emit('error', { error: { status: 503 } }) })
    expect(onUnavailable).toHaveBeenCalledWith('style-failed')
    expect(document.querySelector('[data-site-map-3d]')?.getAttribute('data-3d-status')).toBe('failed')
  })

  it('does not treat a 404 tile as failure', async () => {
    const onUnavailable = vi.fn()
    render(<SiteMap3D lat={13} lng={82} onUnavailable={onUnavailable} />)
    const map = await loadMap()
    await act(async () => { map.emit('error', { sourceId: 'site-openfreemap', error: { status: 404 } }); map.emit('idle') })
    expect(onUnavailable).not.toHaveBeenCalled()
    expect(document.querySelector('[data-site-map-3d]')?.getAttribute('data-coverage')).toBe('none')
  })

  it('falls back when building tiles error out and nothing rendered', async () => {
    const onUnavailable = vi.fn()
    render(<SiteMap3D lat={12.97} lng={77.59} onUnavailable={onUnavailable} />)
    const map = await loadMap()
    await act(async () => { map.emit('error', { sourceId: 'site-openfreemap', error: { status: 500 } }); map.emit('idle') })
    await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('tiles-failed'))
  })

  it('cleans up the map on unmount', async () => {
    const { unmount } = render(<SiteMap3D lat={12.97} lng={77.59} />)
    const map = await loadMap(); unmount()
    expect(map.removed).toBe(true)
  })
})
