"use client"

import { useRef, useState } from 'react'
import ParcelMap from './ParcelMap'
import { ProvenanceStrip } from '../ProvenanceStrip'
import { writeParcelContext } from '../../lib/workspace/parcelContext'

type Mode = 'ulpin' | 'pin' | 'coordinates' | 'place' | 'location' | 'survey'
type Coordinates = { lat: number; lng: number }
type Geocode = { display_name: string; lat: string; lon: string }
type ParcelRecord = { ulpin: string | null; state: string; district: string; area_sqm: number; land_use: string; coordinates: Coordinates; source: string; status: 'INDICATIVE' | 'GAP' }

const BENGALURU: Coordinates = { lat: 12.9716, lng: 77.5946 }
const SAMPLE_ULPINS = ['KA-BLR-0001-2024', 'MH-PUN-0002-2024', 'TN-CHN-0003-2024']
const modeLabels: Record<Mode, string> = { ulpin: 'ULPIN', pin: 'Map pin', coordinates: 'Coordinates', place: 'Address', location: 'My location', survey: 'Survey / khasra' }

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
  const [railOpen, setRailOpen] = useState(false)
  const [center, setCenter] = useState(BENGALURU)
  const [ulpin, setUlpin] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [place, setPlace] = useState('')
  const [matches, setMatches] = useState<Geocode[]>([])
  const [record, setRecord] = useState<ParcelRecord | null>(null)
  const [message, setMessage] = useState('SAMPLE LOCATION · Bengaluru reference centre — not a parcel.')
  const launcherRef = useRef<HTMLButtonElement>(null)
  const closeRail = () => { setRailOpen(false); requestAnimationFrame(() => launcherRef.current?.focus()) }
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
    const item = await response.json() as { ulpin: string; state: string; district: string; area_sqm: number; land_use: string }
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
    setMode('place'); setRailOpen(true)
    try { const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates.lat}&lon=${coordinates.lng}`); if (!response.ok) throw new Error('reverse unavailable'); const item = await response.json() as { display_name?: string }; commit(locationRecord(coordinates, 'OpenStreetMap Nominatim reverse geocode — parcel attributes are GAP', item.display_name ?? 'Reverse-geocode GAP'), `Map pin · reverse-geocoded · ${item.display_name ?? 'address GAP'}`) }
    catch { commit(locationRecord(coordinates, 'Map pin coordinates — reverse-geocode GAP'), `Map pin · ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)} · address GAP`) }
  }
  const useMyLocation = () => {
    if (!navigator.geolocation) return showError('This browser does not expose geolocation. Use coordinates instead.')
    navigator.geolocation.getCurrentPosition((position) => commit(locationRecord({ lat: position.coords.latitude, lng: position.coords.longitude }, 'Browser geolocation — parcel attributes are GAP'), 'Browser geolocation · permission granted · attributes GAP'), (error) => showError(error.code === 1 ? 'Location permission was denied. No location was set.' : 'Location could not be resolved. Use coordinates or address search.'), { enableHighAccuracy: false, timeout: 10000 })
  }

  return <section className="relative min-w-0 overflow-hidden rounded-relume border border-relume-border bg-relume-surface" data-land-detect>
    <ParcelMap lat={center.lat} lng={center.lng} zoom={record ? 13 : 11} label={record ? message : 'SAMPLE LOCATION · Bengaluru reference centre, not a parcel'} onPinDrop={resolvePin} className="h-[min(70vh,48rem)] min-h-[32rem]" />
    <button ref={launcherRef} type="button" onClick={() => setRailOpen(true)} className="absolute left-4 top-4 z-[500] min-h-11 rounded-full border border-relume-border bg-white px-4 text-sm font-semibold text-relume-command shadow-sm" aria-expanded={railOpen} aria-controls="find-parcel-rail">Find parcel</button>
    <aside id="find-parcel-rail" className={`absolute z-[600] border border-relume-border bg-white p-4 shadow-sm transition-transform ${railOpen ? 'translate-y-0' : 'translate-y-[calc(100%-5rem)]'} inset-x-0 bottom-0 h-[min(75dvh,34rem)] lg:bottom-4 lg:left-4 lg:right-auto lg:top-4 lg:h-auto lg:w-80 ${railOpen ? 'lg:translate-x-0' : 'lg:-translate-x-[calc(100%+1.5rem)]'}`} aria-label="Find parcel" aria-hidden={!railOpen}>
      <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-relume-command">Find parcel</p><button type="button" onClick={closeRail} className="min-h-11 rounded-full px-3 text-xs font-semibold">Close</button></div>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Location method">{(Object.keys(modeLabels) as Mode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setMatches([]) }} aria-pressed={mode === item} className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${mode === item ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border text-relume-command'}`}>{modeLabels[item]}</button>)}</div>
      <div className="mt-4 space-y-3">{mode === 'ulpin' && <><div className="flex flex-wrap gap-2">{SAMPLE_ULPINS.map((sample) => <button key={sample} type="button" onClick={() => setUlpin(sample)} aria-pressed={ulpin === sample} className="min-h-9 rounded-full border border-relume-border px-3 text-xs">{sample}</button>)}</div><label className="block text-xs font-semibold">Seeded ULPIN<input value={ulpin} onChange={(event) => setUlpin(event.target.value)} className="mt-1 w-full rounded-relume border border-relume-border px-3 py-2" /></label><button type="button" onClick={() => void lookupUlpin()} className="min-h-11 rounded-full bg-relume-command px-4 text-sm font-semibold text-white">Lookup seeded record</button></>}
      {mode === 'pin' && <p className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3 text-xs leading-5 text-relume-muted">Click any map point to set a location. Ferrum requests a reverse-geocoded address from OpenStreetMap Nominatim; parcel attributes remain GAP.</p>}
      {mode === 'coordinates' && <><label className="block text-xs font-semibold">Latitude<input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="12.9716 or 12°58′18″N" className="mt-1 w-full rounded-relume border border-relume-border px-3 py-2" /></label><label className="block text-xs font-semibold">Longitude<input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="77.5946 or 77°35′41″E" className="mt-1 w-full rounded-relume border border-relume-border px-3 py-2" /></label><button type="button" onClick={resolveCoordinates} className="min-h-11 rounded-full bg-relume-command px-4 text-sm font-semibold text-white">Set coordinates</button></>}
      {mode === 'place' && <><label className="block text-xs font-semibold">Address or place<input value={place} onChange={(event) => setPlace(event.target.value)} className="mt-1 w-full rounded-relume border border-relume-border px-3 py-2" /></label><button type="button" onClick={() => void searchPlace()} className="min-h-11 rounded-full bg-relume-command px-4 text-sm font-semibold text-white">Search address</button>{matches.map((item) => <button key={`${item.lat}-${item.lon}`} type="button" onClick={() => selectPlace(item)} className="block w-full rounded-relume border border-relume-border p-2 text-left text-xs">{item.display_name}</button>)}</>}
      {mode === 'location' && <><p className="text-xs leading-5 text-relume-muted">Your browser asks permission. Ferrum receives coordinates only in this local session; parcel attributes remain GAP.</p><button type="button" onClick={useMyLocation} className="min-h-11 rounded-full bg-relume-command px-4 text-sm font-semibold text-white">Use my location</button></>}
      {mode === 'survey' && <p className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3 text-xs leading-5 text-relume-muted"><strong className="text-relume-command">ROADMAP</strong> — survey, khasra and plot numbering needs a state-specific adapter. No registry lookup is available here.</p>}</div>
      <p className="mt-4 text-xs leading-5 text-relume-muted" role="status" aria-live="polite">{message}</p>
      {record && <div className="mt-3 rounded-relume bg-relume-surface-secondary p-3" data-ulpin-record-card><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Selected location</p><p className="mt-1 text-xs font-medium">{record.district}</p><ProvenanceStrip source={record.source} freshness={new Date().toISOString().slice(0, 10)} /></div>}
    </aside>
  </section>
}
