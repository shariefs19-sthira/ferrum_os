"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  ASSUMED_HEIGHT_COLOR, BUILDINGS_LAYER_ID, BUILDINGS_MIN_ZOOM, BUILDINGS_SOURCE_ID, DEFAULT_3D_BEARING, DEFAULT_3D_PITCH, DEFAULT_3D_ZOOM, EXTERNAL_TILE_DISCLOSURE,
  FOOTPRINT_OUTLINE_COLOR, FOOTPRINT_OUTLINE_LAYER_ID, MAP_3D_ATTRIBUTION, MAPLIBRE_WORKER_URL, MAX_PITCH, NOT_SURVEY_GRADE_NOTICE, OPENFREEMAP_STYLE_URL,
  RECORDED_HEIGHT_COLOR, TILE_LOAD_TIMEOUT_MS, buildingLayerSpecs, clamp, coverageMessage, detectWebGL2, failureMessage, resolveCoverage, summariseBuildings,
  type BuildingCounts, type Map3dFailureReason, type Map3dStatus, type ViewSnapshot,
} from './siteMap3dHelpers'
import { OBLIQUE_PITCH_DEG, TOP_DOWN_PITCH_DEG, frameForParcel, resetNorth, toggleTilt, toMapLibreCamera, type SiteViewFrame } from '../../lib/landintel/siteViewCamera'

export type SiteMap3DProps = {
  /** Selected site point — the single source of truth shared with the 2D map. */
  lat: number
  lng: number
  label?: string
  onPinDrop?: (coordinates: { lat: number; lng: number }) => void
  /** Called once when 3D cannot be shown (no WebGL2, style/tile failure, timeout) so the caller can keep 2D. */
  onUnavailable?: (reason: Map3dFailureReason) => void
  className?: string
}

const controlClass = 'flex h-11 w-11 items-center justify-center rounded-relume border border-relume-border bg-white text-sm font-semibold text-relume-command shadow-sm hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink'
const prefersReducedMotion = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

/**
 * MapLibre GL JS 3D site context (OpenFreeMap vector tiles, per the official MapLibre 3D-buildings example).
 * Never draws a parcel boundary and never invents buildings: extrusions exist only where OpenStreetMap has a footprint.
 * The worker is served same-origin from /maplibre/ (Next.js cannot bundle it) and no code is imported from a CDN.
 */
export default function SiteMap3D({ lat, lng, label = 'Selected location', onPinDrop, onUnavailable, className = 'h-full min-h-[32rem]' }: SiteMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<MapLibreMarker | null>(null)
  const pointRef = useRef({ lat, lng })
  const latestDrop = useRef(onPinDrop)
  const latestUnavailable = useRef(onUnavailable)
  const tileErrors = useRef(0)
  const [status, setStatus] = useState<Map3dStatus>('loading')
  const [failure, setFailure] = useState<Map3dFailureReason | null>(null)
  const [counts, setCounts] = useState<BuildingCounts | null>(null)
  const [settled, setSettled] = useState(false)
  const [view, setView] = useState<ViewSnapshot>({ lat, lng, zoom: DEFAULT_3D_ZOOM, pitch: DEFAULT_3D_PITCH, bearing: DEFAULT_3D_BEARING })
  latestDrop.current = onPinDrop
  latestUnavailable.current = onUnavailable
  pointRef.current = { lat, lng }

  const failed = useRef(false)
  const fail = useCallback((reason: Map3dFailureReason) => {
    if (failed.current) return
    failed.current = true
    setFailure(reason); setStatus('failed')
    latestUnavailable.current?.(reason)
  }, [])

  useEffect(() => {
    let disposed = false
    let timeout: ReturnType<typeof setTimeout> | undefined
    if (!detectWebGL2()) { fail('webgl2-unavailable'); return }

    import('maplibre-gl').then((maplibre) => {
      if (disposed || !containerRef.current) return
      try {
        maplibre.setWorkerUrl(MAPLIBRE_WORKER_URL)
        const start = pointRef.current
        const map = new maplibre.Map({
          container: containerRef.current,
          style: OPENFREEMAP_STYLE_URL,
          center: [start.lng, start.lat],
          zoom: DEFAULT_3D_ZOOM,
          pitch: DEFAULT_3D_PITCH,
          bearing: DEFAULT_3D_BEARING,
          maxPitch: MAX_PITCH,
          canvasContextAttributes: { antialias: true },
          attributionControl: { compact: true },
        })
        mapRef.current = map

        const el = document.createElement('div')
        el.setAttribute('data-site-map-3d-marker', '')
        el.setAttribute('role', 'img')
        el.setAttribute('aria-label', `Selected site point: ${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}`)
        el.style.cssText = 'width:28px;height:40px;pointer-events:none'
        el.innerHTML = '<svg width="28" height="40" viewBox="0 0 28 40" aria-hidden="true" focusable="false"><path d="M14 39C14 39 2 24 2 14a12 12 0 0 1 24 0c0 10-12 25-12 25Z" fill="#b91c1c" stroke="#ffffff" stroke-width="2"/><circle cx="14" cy="14" r="4.5" fill="#ffffff"/></svg>'
        markerRef.current = new maplibre.Marker({ element: el, anchor: 'bottom' }).setLngLat([start.lng, start.lat]).addTo(map)

        const snapshot = () => { const c = map.getCenter(); setView({ lat: c.lat, lng: c.lng, zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() }) }
        const measure = () => {
          if (disposed || !map.getLayer(BUILDINGS_LAYER_ID)) return
          const inView = map.getZoom() >= BUILDINGS_MIN_ZOOM ? map.queryRenderedFeatures({ layers: [BUILDINGS_LAYER_ID] }) : []
          setCounts(summariseBuildings(inView)); setSettled(map.areTilesLoaded())
          if (tileErrors.current > 0 && inView.length === 0 && map.getZoom() >= BUILDINGS_MIN_ZOOM) fail('tiles-failed')
        }

        timeout = setTimeout(() => { if (!map.loaded() || !map.getLayer(BUILDINGS_LAYER_ID)) fail('timeout') }, TILE_LOAD_TIMEOUT_MS)
        map.on('load', () => {
          if (disposed) return
          const specs = buildingLayerSpecs()
          const before = map.getStyle().layers.find((layer) => layer.type === 'symbol' && (layer.layout as { 'text-field'?: unknown } | undefined)?.['text-field'])?.id
          map.addSource(specs.source.id, specs.source.spec as never)
          map.addLayer(specs.extrusion as never, before)
          map.addLayer(specs.outline as never, before)
          setStatus((current) => (current === 'failed' ? current : 'ready')); snapshot()
        })
        map.on('error', (event) => {
          const detail = event as unknown as { sourceId?: string; error?: { status?: number } }
          if (!map.isStyleLoaded() && !map.getLayer(BUILDINGS_LAYER_ID)) { fail('style-failed'); return }
          // A 404/204 vector tile means "no data for this tile" (open water, empty land) — that is coverage, not failure.
          if ((detail.sourceId === BUILDINGS_SOURCE_ID || detail.sourceId === undefined) && detail.error?.status !== 404 && detail.error?.status !== 204) tileErrors.current += 1
        })
        map.on('idle', measure)
        map.on('moveend', () => { snapshot(); measure() })
        map.on('click', (event) => latestDrop.current?.({ lat: event.lngLat.lat, lng: event.lngLat.lng }))
      } catch { fail('init-failed') }
    }).catch(() => { if (!disposed) fail('init-failed') })

    return () => {
      disposed = true
      if (timeout) clearTimeout(timeout)
      markerRef.current?.remove(); markerRef.current = null
      mapRef.current?.remove(); mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once; location changes are applied by the effect below
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !markerRef.current) return
    markerRef.current.setLngLat([lng, lat])
    markerRef.current.getElement().setAttribute('aria-label', `Selected site point: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    setSettled(false); tileErrors.current = 0
    map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 16), duration: prefersReducedMotion() ? 0 : 600 })
  }, [lat, lng])

  const ease = (change: (map: MapLibreMap) => Parameters<MapLibreMap['easeTo']>[0]) => {
    const map = mapRef.current
    if (map) map.easeTo({ ...change(map), duration: prefersReducedMotion() ? 0 : 250 })
  }
  /** Frame around the selected point (never the current pan) with the map's live bearing/pitch; applied only on an explicit control press. */
  const selectedFrame = (): SiteViewFrame | null => {
    const map = mapRef.current
    if (!map) return null
    return { ...frameForParcel([lng, lat]), bearingDeg: map.getBearing(), pitchDeg: clamp(map.getPitch(), TOP_DOWN_PITCH_DEG, MAX_PITCH) }
  }
  const applyFrame = (step: (frame: SiteViewFrame) => SiteViewFrame) => {
    const frame = selectedFrame()
    if (!frame) return
    const { center, bearing, pitch } = toMapLibreCamera(step(frame))
    ease(() => ({ center, bearing, pitch }))
  }
  const obliqueNow = view.pitch >= OBLIQUE_PITCH_DEG / 2
  const recenter = () => ease(() => ({ center: [lng, lat], zoom: Math.max(mapRef.current?.getZoom() ?? DEFAULT_3D_ZOOM, 16) }))
  const coverage = resolveCoverage(view.zoom, counts, settled)

  return (
    <div className="min-w-0" data-site-map-3d data-3d-status={status} data-3d-failure={failure ?? undefined} data-selected-lat={lat} data-selected-lng={lng}
      data-map-center-lat={view.lat.toFixed(6)} data-map-center-lng={view.lng.toFixed(6)} data-map-zoom={view.zoom.toFixed(2)} data-map-pitch={view.pitch.toFixed(1)} data-map-bearing={view.bearing.toFixed(1)} data-camera-mode={obliqueNow ? 'oblique' : 'top-down'}
      data-building-count={counts?.total ?? 0} data-assumed-height-count={counts?.assumedHeight ?? 0} data-recorded-height-count={counts?.recordedHeight ?? 0} data-coverage={failure ? 'failed' : coverage}>
      <div className={`relative overflow-hidden rounded-lg border border-relume-border bg-relume-surface-secondary ${className}`} data-parcel-map-shell>
        <div ref={containerRef} className="h-full w-full" data-map-canvas data-map-lat={lat} data-map-lng={lng} role="region"
          aria-label={`Interactive 3D map of ${label}. Arrow keys pan, Shift plus arrow keys rotate and tilt, plus and minus zoom.`} />
        {status !== 'failed' && <div className="absolute bottom-16 left-2 z-10 flex flex-col gap-1" role="group" aria-label="3D map controls" data-site-map-3d-controls>
          <button type="button" className={controlClass} aria-label="Zoom in" onClick={() => ease((m) => ({ zoom: m.getZoom() + 1 }))}>+</button>
          <button type="button" className={controlClass} aria-label="Zoom out" onClick={() => ease((m) => ({ zoom: m.getZoom() - 1 }))}>−</button>
          <button type="button" className={controlClass} aria-label="Tilt up" onClick={() => ease((m) => ({ pitch: clamp(m.getPitch() + 10, 0, MAX_PITCH) }))}>⤒</button>
          <button type="button" className={controlClass} aria-label="Tilt down" onClick={() => ease((m) => ({ pitch: clamp(m.getPitch() - 10, 0, MAX_PITCH) }))}>⤓</button>
          <button type="button" className={controlClass} aria-label="Rotate left" onClick={() => ease((m) => ({ bearing: m.getBearing() - 15 }))}>↺</button>
          <button type="button" className={controlClass} aria-label="Rotate right" onClick={() => ease((m) => ({ bearing: m.getBearing() + 15 }))}>↻</button>
          <button type="button" className={controlClass} aria-label="Recenter on selected location" onClick={recenter}>◎</button>
        </div>}
        {status !== 'failed' && <div className="absolute left-2 top-2 z-10 flex gap-1" role="group" aria-label="Site view camera" data-site-view-controls>
          <button type="button" className="flex h-11 min-w-[5.5rem] items-center justify-center rounded-relume border border-relume-border bg-white px-3 text-xs font-semibold text-relume-command shadow-sm hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
            aria-label={obliqueNow ? 'Switch to top-down view centred on the selected point' : 'Switch to oblique view centred on the selected point'} data-site-view-tilt onClick={() => applyFrame(toggleTilt)}>{obliqueNow ? 'Top-down' : 'Oblique'}</button>
          <button type="button" className={controlClass} aria-label="Reset north" data-site-view-reset-north onClick={() => applyFrame(resetNorth)}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" style={{ transform: `rotate(${-view.bearing}deg)` }}><path d="M10 1 14 11H6Z" fill="#b91c1c" /><path d="M10 19 6 11h8Z" fill="currentColor" /></svg>
          </button>
        </div>}
        {status === 'loading' && <p className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-relume-command" role="status">Loading 3D map…</p>}
      </div>
      <div className="mt-2 space-y-1 text-[11px] leading-4 text-relume-muted" data-site-map-3d-notes>
        {failure ? <p role="alert" className="font-semibold text-relume-command">{failureMessage(failure)}</p>
          : <p role="status" aria-live="polite" data-building-coverage><strong className="text-relume-command">3D context · </strong>{coverageMessage(coverage, counts)}</p>}
        <p data-site-map-3d-privacy>{EXTERNAL_TILE_DISCLOSURE}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="3D map legend" data-site-map-3d-legend>
          <li className="flex items-center gap-1"><span className="inline-block h-3 w-3 border-2 bg-white" style={{ borderColor: FOOTPRINT_OUTLINE_COLOR }} aria-hidden="true" />OSM building footprint (observed where mapped)</li>
          <li className="flex items-center gap-1"><span className="inline-block h-3 w-3" style={{ backgroundColor: RECORDED_HEIGHT_COLOR }} aria-hidden="true" />Height derived from OSM tags</li>
          <li className="flex items-center gap-1"><span className="inline-block h-3 w-3" style={{ backgroundColor: ASSUMED_HEIGHT_COLOR }} aria-hidden="true" />Assumed {5} m default height</li>
        </ul>
        <p data-site-map-3d-attribution>Map data: {MAP_3D_ATTRIBUTION.map((item, index) => <span key={item.label}>{index > 0 ? ' · ' : ''}<a className="underline" href={item.href} target="_blank" rel="noreferrer">{item.label}</a></span>)}</p>
        <p className="font-semibold text-relume-command" data-not-survey-grade>{NOT_SURVEY_GRADE_NOTICE}</p>
      </div>
    </div>
  )
}
