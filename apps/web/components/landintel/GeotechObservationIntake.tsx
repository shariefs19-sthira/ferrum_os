'use client'

import { useMemo, useRef, useState } from 'react'
import {
  computeDownstreamImpacts,
  intakeSiteObservation,
  type GeotechObservationKind,
  type ObservationClassification,
} from '../../lib/landintel/geotechObservationIntake'

const states: ObservationClassification[] = ['USER_PROVIDED', 'SOURCE_VERIFIED', 'INDICATIVE', 'UNKNOWN', 'STALE']
const kindLabels: Record<GeotechObservationKind, string> = {
  BOREHOLE_LOG_REFERENCE: 'Borehole log reference',
  LAB_REPORT_METADATA: 'Laboratory report metadata',
  GROUNDWATER_OBSERVATION: 'Groundwater observation',
}

type FormState = {
  providerName: string
  providerRole: string
  fieldDate: string
  referenceId: string
  checksum: string
  latitude: string
  longitude: string
  depthMetres: string
  kind: GeotechObservationKind
  groundwaterObservation: string
}

const initialState: FormState = {
  providerName: '', providerRole: '', fieldDate: '', referenceId: '', checksum: '',
  latitude: '', longitude: '', depthMetres: '', kind: 'BOREHOLE_LOG_REFERENCE', groundwaterObservation: 'Not recorded',
}

function asNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value)
}

export default function GeotechObservationIntake() {
  const [form, setForm] = useState<FormState>(initialState)
  const [submitted, setSubmitted] = useState(false)
  const errorSummary = useRef<HTMLDivElement>(null)

  const record = useMemo(() => intakeSiteObservation({
    id: 'landintel-project-observation', kind: form.kind, referenceId: form.referenceId,
    fieldDate: form.fieldDate, reportedAt: form.fieldDate, evidenceBasis: 'DIRECT_OBSERVATION',
    coordinate: form.latitude || form.longitude || form.depthMetres
      ? { latitude: asNumber(form.latitude) ?? Number.NaN, longitude: asNumber(form.longitude) ?? Number.NaN, depthMetres: asNumber(form.depthMetres), horizontalCrs: 'EPSG:4326', verticalDatum: null }
      : null,
    provider: { name: form.providerName, role: form.providerRole, licenceOrAccreditation: null },
    checksum: form.checksum,
    narrative: `Metadata-only ${form.groundwaterObservation.toLowerCase()} record.`, measurements: [],
  }, { nowIso: '2026-09-19', staleAfterDays: 365, verifiedProviderRegistry: [] }), [form])

  const impacts = useMemo(() => computeDownstreamImpacts([record], []), [record])
  const errors = record.issues
  const set = (field: keyof FormState, value: string) => setForm(current => ({ ...current, [field]: value }))
  const invalid = (field: string) => submitted && errors.some(error => error.field === field || error.field.startsWith(`${field}.`))
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (errors.length) errorSummary.current?.focus()
  }

  return <section className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface" aria-labelledby="geotech-observation-heading" data-geotech-observation-intake>
    <div className="border-b border-relume-border p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · project observation</p>
      <h2 id="geotech-observation-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-ink sm:text-3xl">Record geotechnical observation metadata</h2>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-muted">Metadata only. This screen does not upload or parse a report, call a network source, derive bearing capacity or foundation suitability, or establish a legal boundary.</p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Evidence state legend">{states.map(state => <span key={state} className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold tracking-[0.06em] text-relume-ink">{state}</span>)}</div>
    </div>
    <div className="grid min-w-0 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
      <form noValidate onSubmit={submit} className="min-w-0" aria-describedby="geotech-observation-boundary">
        <p id="geotech-observation-boundary" className="mb-5 text-xs leading-5 text-relume-muted">A submitted record remains USER_PROVIDED unless a separate governed provider-verification process supplies evidence. No verification is attempted here.</p>
        {submitted && errors.length > 0 && <div ref={errorSummary} tabIndex={-1} role="alert" className="mb-5 rounded-relume border border-relume-ink bg-relume-surface-secondary p-4" data-geotech-error-summary><h3 className="text-sm font-semibold text-relume-ink">Correct {errors.length} metadata issue{errors.length === 1 ? '' : 's'}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-relume-ink">{errors.map((error, index) => <li key={`${error.field}-${index}`}>{error.message}</li>)}</ul></div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Provider" id="geotech-provider" value={form.providerName} onChange={value => set('providerName', value)} invalid={invalid('provider.name')} error="Enter the report or observation provider." />
          <Field label="Provider role" id="geotech-provider-role" value={form.providerRole} onChange={value => set('providerRole', value)} invalid={invalid('provider.role')} error="Enter the provider role." />
          <Field label="Field date" id="geotech-field-date" type="date" value={form.fieldDate} onChange={value => set('fieldDate', value)} invalid={invalid('fieldDate')} error="Enter a valid field date that is not in the future." />
          <Field label="Report or log reference" id="geotech-reference" value={form.referenceId} onChange={value => set('referenceId', value)} invalid={invalid('referenceId')} error="Enter the borehole, laboratory or report reference." />
          <div className="sm:col-span-2"><Field label="Source document SHA-256 checksum" id="geotech-checksum" value={form.checksum} onChange={value => set('checksum', value)} invalid={invalid('checksum')} error="Enter the 64-character SHA-256 checksum. No document is uploaded." /></div>
          <Select label="Observation type" id="geotech-kind" value={form.kind} onChange={value => set('kind', value)} options={Object.entries(kindLabels)} />
          <Select label="Groundwater observation" id="geotech-groundwater" value={form.groundwaterObservation} onChange={value => set('groundwaterObservation', value)} options={['Not recorded', 'Observed', 'Not observed', 'Seasonal condition unknown'].map(value => [value, value])} />
          <Field label="Latitude (optional)" id="geotech-latitude" inputMode="decimal" value={form.latitude} onChange={value => set('latitude', value)} invalid={invalid('coordinate.latitude')} error="Latitude must be between -90 and 90." />
          <Field label="Longitude (optional)" id="geotech-longitude" inputMode="decimal" value={form.longitude} onChange={value => set('longitude', value)} invalid={invalid('coordinate.longitude')} error="Longitude must be between -180 and 180." />
          <Field label="Depth in metres (optional)" id="geotech-depth" inputMode="decimal" value={form.depthMetres} onChange={value => set('depthMetres', value)} invalid={invalid('coordinate.depthMetres')} error="Depth cannot be negative." />
        </div>
        <button type="submit" className="mt-6 min-h-11 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">Validate metadata</button>
      </form>
      <aside className="min-w-0 rounded-relume border border-relume-border bg-relume-surface-secondary p-4" aria-label="Observation state and downstream holds">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Current intake state</p>
        <p className="mt-3 break-words text-lg font-semibold tracking-relume-tight text-relume-ink" data-geotech-current-state>{record.classification}</p>
        <p className="mt-2 text-xs leading-5 text-relume-muted">{record.classification === 'UNKNOWN' ? 'Complete valid metadata before this record can support governed review.' : 'State reflects metadata classification only; professional interpretation remains required.'}</p>
        <div className="mt-6 border-t border-relume-border pt-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Downstream controls</p><ul className="mt-3 space-y-3">{impacts.length ? impacts.map(impact => <li key={`${impact.target}-${impact.action}`} className="border-l-2 border-relume-ink pl-3 text-xs leading-5 text-relume-ink"><strong>{impact.target}: {impact.action}</strong><br />{impact.reason}</li>) : <li className="text-xs leading-5 text-relume-muted">No automatic release is created. Accountable engineering review remains required for DesignStudio, Structura and BOQ.</li>}</ul></div>
      </aside>
    </div>
  </section>
}

function Field({ label, id, type = 'text', inputMode, value, onChange, invalid, error }: { label: string; id: string; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; value: string; onChange: (value: string) => void; invalid: boolean; error: string }) {
  return <div className="min-w-0"><label htmlFor={id} className="block text-xs font-semibold text-relume-ink">{label}</label><input id={id} type={type} inputMode={inputMode} value={value} onChange={event => onChange(event.target.value)} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} className="mt-2 min-h-11 w-full min-w-0 rounded-relume border border-relume-border bg-relume-surface px-3 text-sm text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" />{invalid && <p id={`${id}-error`} role="alert" className="mt-1 text-xs leading-5 text-relume-ink">{error}</p>}</div>
}

function Select({ label, id, value, onChange, options }: { label: string; id: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <div className="min-w-0"><label htmlFor={id} className="block text-xs font-semibold text-relume-ink">{label}</label><select id={id} value={value} onChange={event => onChange(event.target.value)} className="mt-2 min-h-11 w-full min-w-0 rounded-relume border border-relume-border bg-relume-surface px-3 text-sm text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></div>
}
