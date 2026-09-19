'use client'

import { useMemo, useRef, useState } from 'react'
import {
  NOTE_MAX, topicById, topicsForModule, validateObservation,
  type LocationSource, type ObservationBasis, type ObservationConfidence, type SiteModuleId, type SiteObservation,
} from '../../lib/landintel/siteAnalysis'
import { compassLabel } from '../../lib/landintel/siteSolar'

const basisOptions: { value: ObservationBasis; label: string; hint: string }[] = [
  { value: 'OBSERVED', label: 'Observed on site', hint: 'Seen or measured in person on the stated date.' },
  { value: 'USER_PROVIDED', label: 'User-provided', hint: 'Read from a document or supplied by someone else; not checked here.' },
  { value: 'INFERRED', label: 'Inferred', hint: 'Reasoned from other evidence; never handed to design as a fact.' },
]
const confidenceOptions: ObservationConfidence[] = ['HIGH', 'MEDIUM', 'LOW']

type FormState = {
  topic: string
  basis: ObservationBasis
  confidence: ObservationConfidence
  observedOn: string
  observer: string
  sourceRef: string
  lat: string
  lng: string
  locationSource: LocationSource | null
  bearing: string
  note: string
}

const numberOrNull = (value: string): number | null => (value.trim() === '' ? null : Number(value))

export type SiteObservationFormProps = {
  module: SiteModuleId
  parcelKey: string | null
  anchor: { lat: number; lng: number } | null
  nowIso: string
  idFactory?: () => string
  onAdd: (record: SiteObservation) => boolean
}

export default function SiteObservationForm({ module, parcelKey, anchor, nowIso, idFactory, onAdd }: SiteObservationFormProps) {
  const topics = useMemo(() => topicsForModule(module), [module])
  const firstOpen = topics.find((topic) => !topic.delegatedTo)?.id ?? topics[0].id
  const [form, setForm] = useState<FormState>({ topic: firstOpen, basis: 'OBSERVED', confidence: 'MEDIUM', observedOn: '', observer: '', sourceRef: '', lat: '', lng: '', locationSource: null, bearing: '', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const [deviceMessage, setDeviceMessage] = useState('')
  const summary = useRef<HTMLDivElement>(null)
  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }))

  const topic = topicById(form.topic) ?? topics[0]
  const lat = numberOrNull(form.lat)
  const lng = numberOrNull(form.lng)
  const bearing = numberOrNull(form.bearing)
  const draft: SiteObservation = {
    id: 'draft', parcelKey: parcelKey ?? '', module, topic: topic.id, basis: form.basis, confidence: form.confidence,
    observedOn: form.observedOn, observer: form.observer, sourceRef: form.sourceRef,
    location: lat !== null || lng !== null ? { lat: lat ?? Number.NaN, lng: lng ?? Number.NaN } : null,
    locationSource: form.locationSource ?? (lat !== null || lng !== null ? 'ENTERED' : null),
    bearingDeg: topic.geometry === 'directional' ? bearing : null, note: form.note.trim(), createdAt: '',
  }
  const issues = validateObservation(draft, nowIso)
  const has = (field: string) => submitted && issues.some((issue) => issue.field === field || issue.field.startsWith(`${field}.`))
  const disabled = !parcelKey

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setNotice('')
    if (issues.length > 0) {
      summary.current?.focus()
      return
    }
    const id = idFactory ? idFactory() : (globalThis.crypto?.randomUUID?.() ?? `obs-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    const saved = onAdd({ ...draft, id, createdAt: new Date().toISOString() })
    if (saved) {
      setNotice(`Added “${topic.label}” to the synthesis as ${draft.basis.replace('_', ' ').toLowerCase()}.`)
      setSubmitted(false)
      setForm((current) => ({ ...current, observedOn: '', sourceRef: '', lat: '', lng: '', locationSource: null, bearing: '', note: '' }))
    } else {
      setNotice('The browser refused to store this record (storage blocked or full). Nothing was saved.')
    }
  }

  const useMapPoint = () => {
    if (!anchor) return
    setForm((current) => ({ ...current, lat: String(anchor.lat), lng: String(anchor.lng), locationSource: 'MAP_POINT_CONTEXT' }))
    setDeviceMessage('')
  }
  const useDevice = () => {
    if (!navigator.geolocation) { setDeviceMessage('This device cannot provide a location. Enter coordinates or use the map point.'); return }
    setDeviceMessage('Requesting device location…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({ ...current, lat: position.coords.latitude.toFixed(6), lng: position.coords.longitude.toFixed(6), locationSource: 'DEVICE' }))
        setDeviceMessage(`Device location attached (accuracy about ${Math.round(position.coords.accuracy)} m).`)
      },
      () => setDeviceMessage('Device location was not provided. Enter coordinates or use the map point.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const inputClass = 'mt-2 min-h-11 w-full min-w-0 rounded-relume border border-relume-border bg-relume-surface px-3 text-sm text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink'
  const labelClass = 'block text-xs font-semibold text-relume-ink'
  const errorFor = (field: string, text: string) => has(field) && <p id={`site-${field}-error`} className="mt-1 text-xs leading-5 text-relume-danger">{issues.find((issue) => issue.field === field || issue.field.startsWith(`${field}.`))?.message ?? text}</p>
  const aria = (field: string) => ({ 'aria-invalid': has(field) || undefined, 'aria-describedby': has(field) ? `site-${field}-error` : undefined })

  return (
    <form noValidate onSubmit={submit} className="min-w-0 rounded-relume border border-relume-border bg-relume-surface p-4 sm:p-5" aria-labelledby="site-observation-heading" data-site-observation-form>
      <h4 id="site-observation-heading" className="text-base font-semibold text-relume-ink">Record a field observation</h4>
      <p className="mt-1 text-xs leading-5 text-relume-muted">Metadata only. Each record keeps its date, observer, source and basis; nothing here measures, surveys or verifies.</p>
      {disabled && <p className="mt-3 rounded-relume border border-dashed border-relume-border p-3 text-xs leading-5 text-relume-muted" data-site-form-disabled>UNKNOWN — resolve a site with the lookup above before recording; observations are stored against a resolved map point.</p>}
      {submitted && issues.length > 0 && (
        <div ref={summary} tabIndex={-1} role="alert" className="mt-4 scroll-mt-24 rounded-relume border border-relume-ink bg-relume-surface-secondary p-3" data-site-error-summary>
          <p className="text-sm font-semibold text-relume-ink">Correct {issues.length} issue{issues.length === 1 ? '' : 's'}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-relume-ink">{issues.map((issue, index) => <li key={`${issue.field}-${index}`}>{issue.message}</li>)}</ul>
        </div>
      )}
      <fieldset disabled={disabled} className="mt-4 min-w-0 border-0 p-0">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="site-topic" className={labelClass}>Topic</label>
            <select id="site-topic" value={form.topic} onChange={(event) => set('topic', event.target.value)} className={inputClass} {...aria('topic')}>
              {topics.map((item) => <option key={item.id} value={item.id} disabled={!!item.delegatedTo}>{item.label}{item.delegatedTo ? ` — use ${item.delegatedTo}` : ''}</option>)}
            </select>
            {errorFor('topic', 'Choose a topic.')}
          </div>
          <div className="min-w-0">
            <label htmlFor="site-basis" className={labelClass}>Evidence basis</label>
            <select id="site-basis" value={form.basis} onChange={(event) => set('basis', event.target.value as ObservationBasis)} className={inputClass} {...aria('basis')}>
              {basisOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <p className="mt-1 text-[11px] leading-4 text-relume-muted">{basisOptions.find((item) => item.value === form.basis)?.hint}</p>
            {errorFor('basis', '')}
          </div>
          <div className="min-w-0">
            <label htmlFor="site-observed-on" className={labelClass}>Observation date</label>
            <input id="site-observed-on" type="date" value={form.observedOn} onChange={(event) => set('observedOn', event.target.value)} className={inputClass} {...aria('observedOn')} />
            {errorFor('observedOn', '')}
          </div>
          <div className="min-w-0">
            <label htmlFor="site-confidence" className={labelClass}>Confidence</label>
            <select id="site-confidence" value={form.confidence} onChange={(event) => set('confidence', event.target.value as ObservationConfidence)} className={inputClass}>
              {confidenceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <p className="mt-1 text-[11px] leading-4 text-relume-muted">Capped by basis: only an on-site observation with no authority or survey gate can be HIGH.</p>
          </div>
          <div className="min-w-0">
            <label htmlFor="site-observer" className={labelClass}>Observer / supplier</label>
            <input id="site-observer" value={form.observer} onChange={(event) => set('observer', event.target.value)} autoComplete="off" className={inputClass} {...aria('observer')} />
            {errorFor('observer', '')}
          </div>
          <div className="min-w-0">
            <label htmlFor="site-source-ref" className={labelClass}>Source / document reference</label>
            <input id="site-source-ref" value={form.sourceRef} onChange={(event) => set('sourceRef', event.target.value)} autoComplete="off" className={inputClass} {...aria('sourceRef')} />
            {errorFor('sourceRef', '')}
          </div>
        </div>

        <fieldset className="mt-4 min-w-0 rounded-relume border border-relume-border p-3" data-site-location-fieldset>
          <legend className="px-1 text-xs font-semibold text-relume-ink">Location {topic.geometry === 'document' ? '(optional for document evidence)' : '(required)'}</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={useMapPoint} disabled={!anchor} className="min-h-11 rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-command hover:bg-relume-surface-secondary disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" data-site-use-map-point>Use map point</button>
            <button type="button" onClick={useDevice} className="min-h-11 rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-command hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" data-site-use-device>Use this device</button>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="site-lat" className={labelClass}>Latitude</label>
              <input id="site-lat" inputMode="decimal" value={form.lat} onChange={(event) => setForm((current) => ({ ...current, lat: event.target.value, locationSource: 'ENTERED' }))} className={inputClass} {...aria('location.lat')} />
              {errorFor('location.lat', '')}
            </div>
            <div className="min-w-0">
              <label htmlFor="site-lng" className={labelClass}>Longitude</label>
              <input id="site-lng" inputMode="decimal" value={form.lng} onChange={(event) => setForm((current) => ({ ...current, lng: event.target.value, locationSource: 'ENTERED' }))} className={inputClass} {...aria('location.lng')} />
              {errorFor('location.lng', '')}
            </div>
          </div>
          {submitted && issues.some((issue) => issue.field === 'location') && <p id="site-location-error" className="mt-2 text-xs leading-5 text-relume-danger">Attach a location (use the map point, enter coordinates, or use this device).</p>}
          <p className="mt-2 text-[11px] leading-4 text-relume-muted" data-site-location-source aria-live="polite">
            {draft.locationSource === 'MAP_POINT_CONTEXT' ? 'Attached to the resolved map point — context only; this places the record at the map point, not where it was actually observed.' : draft.locationSource === 'DEVICE' ? 'Attached from this device.' : draft.locationSource === 'ENTERED' ? 'Coordinates entered by hand (EPSG:4326).' : 'No location attached.'}
            {deviceMessage ? ` ${deviceMessage}` : ''}
          </p>
        </fieldset>

        {topic.geometry === 'directional' && (
          <div className="mt-4 max-w-xs min-w-0">
            <label htmlFor="site-bearing" className={labelClass}>Bearing — {topic.bearingMeaning} (° clockwise from true north, optional)</label>
            <input id="site-bearing" inputMode="decimal" value={form.bearing} onChange={(event) => set('bearing', event.target.value)} className={inputClass} {...aria('bearingDeg')} />
            {bearing !== null && Number.isFinite(bearing) && bearing >= 0 && bearing < 360 && <p className="mt-1 text-[11px] leading-4 text-relume-muted">{compassLabel(bearing)}</p>}
            {errorFor('bearingDeg', '')}
          </div>
        )}

        <div className="mt-4 min-w-0">
          <label htmlFor="site-note" className={labelClass}>What was seen or read</label>
          <textarea id="site-note" rows={3} value={form.note} onChange={(event) => set('note', event.target.value)} className={`${inputClass} py-2`} {...aria('note')} />
          <p className="mt-1 text-[11px] leading-4 text-relume-muted">{form.note.length} / {NOTE_MAX}. Describe evidence, not conclusions — no bearing capacity, boundary, title, compliance, approval or “no heritage/risk” statements.</p>
          {errorFor('note', '')}
        </div>

        <button type="submit" className="mt-5 min-h-11 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" data-site-add-observation>Add observation</button>
      </fieldset>
      <p role="status" aria-live="polite" className="mt-3 text-xs leading-5 text-relume-ink" data-site-form-notice>{notice}</p>
    </form>
  )
}
