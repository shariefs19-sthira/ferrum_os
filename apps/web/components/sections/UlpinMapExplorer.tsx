"use client"

import { lazy, Suspense, useEffect, useState, type FocusEvent, type PointerEvent } from 'react'
import ParcelMap from './ParcelMap'
import { detectWebGL2, failureMessage, type Map3dFailureReason } from './siteMap3dHelpers'
import { ProvenanceStrip } from '../ProvenanceStrip'
import SaveToWorkspaceButton from '../SaveToWorkspaceButton'
import { writeParcelContext } from '../../lib/workspace/parcelContext'
import type { PlotIntel } from '../../lib/parcelIntel/types'
import { productFeatureRegistry } from '../../lib/productFeatureRegistry'

// MapLibre (WebGL2) is code-split so the default 2D view never pays for it.
const SiteMap3D = lazy(() => import('./SiteMap3D'))
const MAP_CLASS = 'h-[min(70vh,48rem)] min-h-[32rem] border-0 min-[1600px]:h-[clamp(22rem,calc(100svh-27.5rem),32rem)] min-[1600px]:min-h-0'

type MapView = '2d' | '3d'
type Mode = 'ulpin' | 'pin' | 'coordinates' | 'place' | 'location' | 'survey'
type Coordinates = { lat: number; lng: number }
type Geocode = { display_name: string; lat: string; lon: string }
type ParcelRecord = { ulpin: string | null; state: string; district: string; area_sqm: number; land_use: string; coordinates: Coordinates; source: string; status: 'INDICATIVE' | 'GAP'; plot_intel?: PlotIntel }

const BENGALURU: Coordinates = { lat: 12.9716, lng: 77.5946 }
const SAMPLE_ULPINS = ['KA-BLR-0001-2024', 'MH-PUN-0002-2024', 'TN-CHN-0003-2024']
const modeLabels: Record<Mode, string> = { ulpin: 'ULPIN', pin: 'Map pin', coordinates: 'Coordinates', place: 'Address', location: 'My location', survey: 'Survey / khasra' }
const modeFeatures = Object.fromEntries(productFeatureRegistry.landintel.filter((feature) => feature.id.startsWith('location-')).map((feature) => [feature.id.replace('location-', ''), feature])) as Record<Mode, (typeof productFeatureRegistry.landintel)[number]>

const parseCoordinate = (value: string, positive: 'N' | 'E', negative: 'S' | 'W') => {
  const decimal = Number(value)
  if (Number.isFinite(decimal)) return decimal
  const values = value.match(/\d+(?:\.\d+)?/g)
  const direction = value.trim().slice(-1).toUpperCase()
  if (!values || values.length !== 3 || ![positive, negative].includes(direction as typeof positive)) return Number.NaN
  const result = Number(values[0]) + Number(values[1]) / 60 + Number(values[2]) / 3600
  return direction === negative ? -result : result
}

/** Map-first, source-qualified parcel finder. It never asserts a parcel boundary or authority verification. */
export default function UlpinMapExplorer() {
  const [mode, setMode] = useState<Mode>('ulpin')
  const [center, setCenter] = useState(BENGALURU)
  const [ulpin, setUlpin] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [place, setPlace] = useState('')
  const [matches, setMatches] = useState<Geocode[]>([])
  const [record, setRecord] = useState<ParcelRecord | null>(null)
  const [message, setMessage] = useState('SAMPLE LOCATION · Bengaluru reference centre — not a parcel.')
  const [mapView, setMapView] = useState<MapView>('2d')
  const [webgl2, setWebgl2] = useState<boolean | null>(null)
  const [viewNotice, setViewNotice] = useState('')
  // Single-active contextual help: only one method tip exists at a time, driven by hover / keyboard focus-visible, never by sticky click focus.
  const [helpId, setHelpId] = useState<string | null>(null)
  const activeHelp = Object.values(modeFeatures).find((feature) => feature.id === helpId)
  useEffect(() => { setWebgl2(detectWebGL2()) }, [])
  const chooseView = (next: MapView) => { setMapView(next); setViewNotice(next === '3d' ? '3D site context · OpenStreetMap-derived building footprints for the selected point. Context only, not survey-grade.' : '2D plan view · same selected point and marker.') }
  const fallBackTo2d = (reason: Map3dFailureReason) => { setMapView('2d'); setViewNotice(failureMessage(reason)) }
  const commit = (next: ParcelRecord, nextMessage: string) => {
    setCenter(next.coordinates); setRecord(next); setMessage(nextMessage)
    writeParcelContext({ version: 1, method: next.ulpin ? 'ulpin' : mode, ulpin: next.ulpin, state: next.state, district: next.district, area_sqm: next.area_sqm, land_use: next.land_use, coordinates: next.coordinates, provenance: { source: next.source, vintage: new Date().toISOString().slice(0, 10), status: next.status } })
  }
  const locationRecord = (coordinates: Coordinates, source: string, placeName = 'Coordinate-only location'): ParcelRecord => ({ ulpin: null, state: 'GAP', district: placeName, area_sqm: 0, land_use: 'GAP', coordinates, source, status: 'GAP' })
  const showError = (text: string) => { setMessage(text); setMatches([]) }
  const lookupUlpin = async () => {
    if (!ulpin.trim()) return showError('Enter a seeded sample ULPIN before lookup.')
    const response = await fetch(`/api/ulpin/${encodeURIComponent(ulpin.trim())}`)
    if (!response.ok) return showError('No seeded sample record found. Official registry lookup is not connected.')
    const item = await response.json() as { ulpin: string; state: string; district: string; area_sqm: number; land_use: string; plot_intel?: PlotIntel }
    const coordinates = item.ulpin.startsWith('MH') ? { lat: 18.5208, lng: 73.8551 } : item.ulpin.startsWith('TN') ? { lat: 13.09, lng: 80.27 } : BENGALURU
    commit({ ...item, coordinates, source: 'Ferrum seeded D1 ULPIN record — not an official registry result', status: 'INDICATIVE' }, `ULPIN · seeded D1 sample · ${item.district}`)
  }
  const resolveCoordinates = () => {
    const lat = parseCoordinate(latitude, 'N', 'S'), lng = parseCoordinate(longitude, 'E', 'W')
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return showError('Enter valid decimal or DMS coordinates, for example 12.9716 or 12°58′18″N.')
    commit(locationRecord({ lat, lng }, 'User-entered coordinates — address and parcel attributes are GAP'), `Coordinates · ${lat.toFixed(5)}, ${lng.toFixed(5)} · attributes GAP`)
  }
  const searchPlace = async () => {
    if (!place.trim()) return showError('Enter an address or place name before search.')
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(place.trim())}`)
    if (!response.ok) return showError('Address search is unavailable. Try coordinates or a seeded ULPIN.')
    const found = await response.json() as Geocode[]
    if (!found.length) return showError('No address result found. Try a more specific place name.')
    setMatches(found); setMessage('Address candidates from OpenStreetMap Nominatim — confirm one to set a location-only context.')
  }
  const selectPlace = (item: Geocode) => commit(locationRecord({ lat: Number(item.lat), lng: Number(item.lon) }, 'OpenStreetMap Nominatim geocode — parcel attributes are GAP', item.display_name), `Address · OpenStreetMap Nominatim · ${item.display_name}`)
  const resolvePin = async (coordinates: Coordinates) => {
    setMode('place')
    try { const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates.lat}&lon=${coordinates.lng}`); if (!response.ok) throw new Error('reverse unavailable'); const item = await response.json() as { display_name?: string }; commit(locationRecord(coordinates, 'OpenStreetMap Nominatim reverse geocode — parcel attributes are GAP', item.display_name ?? 'Reverse-geocode GAP'), `Map pin · reverse-geocoded · ${item.display_name ?? 'address GAP'}`) }
    catch { commit(locationRecord(coordinates, 'Map pin coordinates — reverse-geocode GAP'), `Map pin · ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)} · address GAP`) }
  }
  const useMyLocation = () => {
    if (!navigator.geolocation) return showError('This browser does not expose geolocation. Use coordinates instead.')
    navigator.geolocation.getCurrentPosition((position) => commit(locationRecord({ lat: position.coords.latitude, lng: position.coords.longitude }, 'Browser geolocation — parcel attributes are GAP'), 'Browser geolocation · permission granted · attributes GAP'), (error) => showError(error.code === 1 ? 'Location permission was denied. No location was set.' : 'Location could not be resolved. Use coordinates or address search.'), { enableHighAccuracy: false, timeout: 10000 })
  }

  const coordinateError = message.startsWith('Enter valid decimal or DMS coordinates')
  const ulpinError = message.startsWith('Enter a seeded') || message.startsWith('No seeded')
  const placeError = message.startsWith('Enter an address') || message.startsWith('No address')

  return <section className="min-w-0 overflow-hidden rounded-relume border border-relume-border bg-relume-surface" data-land-detect>
    <div className="border-b border-relume-border bg-white p-3 sm:p-4 min-[1600px]:p-3" aria-label="Find parcel" data-find-parcel-toolbar>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-semibold text-relume-command">Find parcel</p><p className="mt-1 text-xs text-relume-muted">Choose a method, then set or look up the location below.</p></div>
        <span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">{record?.status ?? 'SAMPLE'}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 min-[1600px]:mt-2" aria-label="Location method" onKeyDown={(event) => { if (event.key === 'Escape') setHelpId(null) }}>{(Object.keys(modeLabels) as Mode[]).map((item) => {
        const feature = modeFeatures[item]
        const tipId = `landintel-${feature.id}-tip`
        const helpOpen = helpId === feature.id
        const hoverHelp = (event: PointerEvent<HTMLButtonElement>) => { if (event.pointerType !== 'touch') setHelpId(feature.id) }
        const focusHelp = (event: FocusEvent<HTMLButtonElement>) => { try { if (event.currentTarget.matches(':focus-visible')) setHelpId(feature.id) } catch { /* no :focus-visible support: hover-only help */ } }
        const clearHelp = () => setHelpId((current) => (current === feature.id ? null : current))
        return <div key={item} className="min-w-0"><button type="button" onClick={() => { setMode(item); setMatches([]); setHelpId(null) }} onPointerEnter={hoverHelp} onPointerLeave={clearHelp} onFocus={focusHelp} onBlur={clearHelp} aria-pressed={mode === item} aria-describedby={helpOpen ? tipId : undefined} data-sutra-product="landintel" data-sutra-feature-id={feature.id} className={`min-h-11 w-full rounded-full border px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${mode === item ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border text-relume-command hover:bg-relume-surface-secondary'}`}>{modeLabels[item]}</button></div>
      })}</div>
      {activeHelp && <div id={`landintel-${activeHelp.id}-tip`} role="tooltip" data-landintel-help={activeHelp.id} className="mt-2 rounded-relume border border-relume-border bg-relume-surface-secondary p-3 text-left text-xs leading-5 text-relume-ink shadow-sm"><strong className="block text-xs font-semibold text-relume-command">{activeHelp.title}</strong><span className="mt-1 block">{activeHelp.body}</span></div>}
      <div className="mt-3 rounded-relume border border-relume-border bg-relume-surface-secondary p-3" data-selected-method>
        {mode === 'ulpin' && <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)_auto] lg:items-end min-[1600px]:grid-cols-[auto_minmax(14rem,1fr)_auto]"><div className="flex flex-wrap gap-2 min-[1600px]:flex-nowrap">{SAMPLE_ULPINS.map((sample) => <button key={sample} type="button" onClick={() => setUlpin(sample)} aria-pressed={ulpin === sample} className="min-h-11 rounded-full border border-relume-border bg-white px-3 text-xs">{sample}</button>)}</div><label className="block text-xs font-semibold">Seeded ULPIN<input value={ulpin} onChange={(event) => setUlpin(event.target.value)} aria-invalid={ulpinError} aria-describedby="parcel-finder-status" className="mt-1 min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 py-2" /></label><button type="button" onClick={() => void lookupUlpin()} className="min-h-11 rounded-full bg-relume-command px-4 text-sm font-semibold text-white">Lookup seeded record</button></div>}
        {mode === 'pin' && <p className="text-xs leading-5 text-relume-muted">Click any map point to set a location. Ferrum requests a reverse-geocoded address from OpenStreetMap Nominatim; parcel attributes remain GAP.</p>}
        {mode === 'coordinates' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end"><label className="block text-xs font-semibold">Latitude<input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="12.9716 or 12°58′18″N" aria-invalid={coordinateError} aria-describedby="parcel-finder-status" className="mt-1 min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 py-2" /></label><label className="block text-xs font-semibold">Longitude<input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="77.5946 or 77°35′41″E" aria-invalid={coordinateError} aria-describedby="parcel-finder-status" className="mt-1 min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 py-2" /></label><button type="button" onClick={resolveCoordinates} className="min-h-11 rounded-full bg-relume-command px-4 text-sm font-semibold text-white sm:col-span-2 lg:col-span-1">Set coordinates</button></div>}
        {mode === 'place' && <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><label className="block text-xs font-semibold">Address or place<input value={place} onChange={(event) => setPlace(event.target.value)} aria-invalid={placeError} aria-describedby="parcel-finder-status" className="mt-1 min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 py-2" /></label><button type="button" onClick={() => void searchPlace()} className="min-h-11 rounded-full bg-relume-command px-4 text-sm font-semibold text-white">Search address</button><div className="lg:col-span-2">{matches.map((item) => <button key={`${item.lat}-${item.lon}`} type="button" onClick={() => selectPlace(item)} className="mt-2 block min-h-11 w-full rounded-relume border border-relume-border bg-white p-2 text-left text-xs">{item.display_name}</button>)}</div></div>}
        {mode === 'location' && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-5 text-relume-muted">Your browser asks permission. Ferrum receives coordinates only in this local session; parcel attributes remain GAP.</p><button type="button" onClick={useMyLocation} className="min-h-11 rounded-full bg-relume-command px-4 text-sm font-semibold text-white">Use my location</button></div>}
        {mode === 'survey' && <p className="text-xs leading-5 text-relume-muted"><strong className="text-relume-command">ROADMAP</strong> — survey, khasra and plot numbering needs a state-specific adapter. No registry lookup is available here.</p>}
      </div>
      <p id="parcel-finder-status" className="mt-3 min-h-10 text-xs leading-5 text-relume-muted" role="status" aria-live="polite">{message}</p>
    </div>
    <div className="relative" data-parcel-map-stage>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-relume-border bg-white px-3 py-2" data-map-view-toolbar>
        <div role="group" aria-label="Map view" className="inline-flex rounded-full border border-relume-border p-0.5">
          {(['2d', '3d'] as MapView[]).map((item) => <button key={item} type="button" onClick={() => chooseView(item)} aria-pressed={mapView === item} disabled={item === '3d' && webgl2 === false} data-map-view-option={item}
            className={`min-h-11 min-w-[5.5rem] rounded-full px-4 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink disabled:cursor-not-allowed disabled:opacity-50 ${mapView === item ? 'bg-relume-command text-white' : 'text-relume-command hover:bg-relume-surface-secondary'}`}>{item === '2d' ? '2D plan' : '3D context'}</button>)}
        </div>
        <p className="min-w-0 text-[11px] leading-4 text-relume-muted" data-selected-point>Selected point <strong className="font-semibold text-relume-command">{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</strong>{record ? '' : ' · sample reference'}</p>
      </div>
      <p className="border-b border-relume-border bg-relume-surface-secondary px-3 py-1 text-[11px] leading-4 text-relume-muted empty:hidden" aria-live="polite" data-map-view-notice>{webgl2 === false && !viewNotice ? '3D context needs WebGL2, which this browser does not provide. The 2D plan stays available.' : viewNotice}</p>
      {mapView === '3d'
        ? <Suspense fallback={<p className={`flex items-center justify-center text-xs text-relume-muted ${MAP_CLASS}`} role="status">Loading 3D map…</p>}>
          <SiteMap3D lat={center.lat} lng={center.lng} label={record ? message : 'SAMPLE LOCATION · Bengaluru reference centre, not a parcel'} onPinDrop={resolvePin} onUnavailable={fallBackTo2d} className={MAP_CLASS} />
        </Suspense>
        : <ParcelMap lat={center.lat} lng={center.lng} zoom={record ? 13 : 11} label={record ? message : 'SAMPLE LOCATION · Bengaluru reference centre, not a parcel'} onPinDrop={resolvePin} className={MAP_CLASS} />}
      {record && <div className="border-t border-relume-border bg-white p-3 min-[1200px]:absolute min-[1200px]:right-3 min-[1200px]:top-28 min-[1200px]:z-[500] min-[1200px]:max-h-[calc(100%-8rem)] min-[1200px]:w-[min(26rem,40%)] min-[1200px]:overflow-y-auto min-[1200px]:rounded-relume min-[1200px]:border min-[1200px]:border-white/70 min-[1200px]:bg-white/80 min-[1200px]:backdrop-blur-md" data-ulpin-record-card data-map-overlay>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Selected location</p><p className="mt-1 text-xs font-medium">{record.district}</p></div>
            <SaveToWorkspaceButton type="parcel" title={record.ulpin ?? record.district} data={record} />
          </div>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div><dt className="text-relume-muted">Recorded land use</dt><dd className="mt-1 font-semibold text-relume-command">{record.land_use}</dd></div>
            <div><dt className="text-relume-muted">Zoning verification status</dt><dd className="mt-1 font-semibold text-relume-command">{record.status === 'INDICATIVE' ? 'REQUIRES AUTHORITY VERIFICATION' : 'UNKNOWN'}</dd></div>
          </dl>
          <p className="mt-2 text-[10px] leading-4 text-relume-muted">ULPIN identifies the parcel. Building use is derived only after the competent planning authority&apos;s current zoning record is verified; Ferrum does not offer unrestricted use choices.</p>
          {record.plot_intel?.advisable_types?.length ? <div className="mt-3 rounded-relume border border-white/70 bg-white/65 p-3" data-indicative-building-types>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Indicative building types · sample ruleset</p>
            <ul className="mt-2 space-y-2 text-xs">{record.plot_intel.advisable_types.map((item) => <li key={item.building_type}><strong className="text-relume-command">{item.building_type}</strong><span className="block text-relume-muted">{item.reason}</span></li>)}</ul>
            <p className="mt-2 text-[10px] text-relume-muted">Automatically derived from the seeded land-use value and an indicative sample ruleset. These are recommendations, not authority-permitted uses.</p>
          </div> : <p className="mt-3 text-xs font-semibold text-relume-muted" data-building-types-gap>Building-type guidance: GAP until compatible zoning evidence is available.</p>}
          <ProvenanceStrip source={record.source} freshness={new Date().toISOString().slice(0, 10)} />
        </div>
      </div>}
    </div>
  </section>
}
