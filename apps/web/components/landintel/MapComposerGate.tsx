"use client"

import { useEffect, useState } from 'react'
import { useParcelContext } from '../../lib/workspace/parcelContext'
import { buildActiveLayers, evaluateMapComposerReadiness, summarizeReadiness } from '../../lib/landintel/mapComposerReadiness'
import { emptyMapComposerMetadata, generateLayerId, readMapComposerMetadata, writeMapComposerMetadata, type MapComposerLayer, type MapComposerMetadata } from '../../lib/landintel/mapComposerState'

const inputClass = 'mt-1 min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 py-2 text-sm'
const labelClass = 'block text-xs font-semibold text-relume-command'

export default function MapComposerGate() {
  const parcel = useParcelContext()
  const [metadata, setMetadata] = useState<MapComposerMetadata>(emptyMapComposerMetadata)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setMetadata(readMapComposerMetadata())
    setHydrated(true)
  }, [])

  const update = (patch: Partial<MapComposerMetadata>) => {
    setMetadata((previous) => {
      const next = { ...previous, ...patch }
      if (hydrated) writeMapComposerMetadata(next)
      return next
    })
  }

  const addLayer = () => {
    const layer: MapComposerLayer = { id: generateLayerId(), name: '', source: '', observationDate: '', editable: true }
    update({ layers: [...metadata.layers, layer] })
  }

  const updateLayer = (id: string, patch: Partial<MapComposerLayer>) => {
    update({ layers: metadata.layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)) })
  }

  const removeLayer = (id: string) => {
    update({ layers: metadata.layers.filter((layer) => layer.id !== id) })
  }

  const checks = evaluateMapComposerReadiness(metadata, parcel)
  const summary = summarizeReadiness(checks)
  const activeLayers = buildActiveLayers(metadata, parcel)
  const locatorRequired = !!parcel && (parcel.state === 'GAP' || parcel.district === 'GAP')
  const indicativeApplies = parcel?.provenance.status === 'INDICATIVE'

  return (
    <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="map-composer-heading" data-map-composer-gate>
      <div className="rounded-relume border border-relume-border bg-relume-surface p-4 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · governed Map Composer</p>
              <span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Export-readiness workflow</span>
            </div>
            <h2 id="map-composer-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-command sm:text-3xl">A map export must pass evidence and cartography checks</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">This is a reproducible quality gate, not an AI &ldquo;make professional&rdquo; control. Fill in the project metadata below; each check is derived from real project state, never from typed text alone.</p>
          </div>
          <div className="rounded-relume border border-relume-ink bg-relume-ink px-4 py-3 text-white" aria-label="Map export status">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">Export status</p>
            <p className="mt-1 text-sm font-semibold">{summary.blocked ? 'BLOCKED' : 'READY'} · {summary.passed} / {summary.total} checks passed</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-relume-border pt-5 md:grid-cols-2 xl:grid-cols-3">
          <label className={labelClass}>Map title
            <input value={metadata.title} onChange={(event) => update({ title: event.target.value })} placeholder="e.g. Whitefield parcel — pre-purchase suitability map" className={inputClass} aria-describedby="map-composer-title-hint" />
          </label>
          <label className={`${labelClass} xl:col-span-2`}>Purpose & analysis subject
            <input value={metadata.purpose} onChange={(event) => update({ purpose: event.target.value })} placeholder="What is being analysed, and why this map exists" className={inputClass} />
          </label>
          <label className={labelClass}>CRS / EPSG identifier
            <input value={metadata.crs} onChange={(event) => update({ crs: event.target.value })} placeholder="EPSG:4326" className={inputClass} />
          </label>
          <label className={labelClass}>Author / issuer
            <input value={metadata.author} onChange={(event) => update({ author: event.target.value })} placeholder="Name or organisation" className={inputClass} />
          </label>
          <label className={labelClass}>Issue date
            <input type="date" value={metadata.issueDate} onChange={(event) => update({ issueDate: event.target.value })} className={inputClass} />
          </label>
          <label className={labelClass}>Revision
            <input value={metadata.revision} onChange={(event) => update({ revision: event.target.value })} placeholder="e.g. Rev A" className={inputClass} />
          </label>
        </div>
        <p id="map-composer-title-hint" className="mt-2 text-[11px] leading-4 text-relume-muted">Typed text alone never passes a check below — each field is validated for format, and geometry- or provenance-backed checks require real project evidence.</p>

        <div className="mt-6 border-t border-relume-border pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Active layers</p>
              <p className="mt-1 text-sm text-relume-ink">Every active layer needs a source and an observation date before the legend and source/date checks can pass.</p>
            </div>
            <button type="button" onClick={addLayer} className="min-h-11 rounded-full border border-relume-command px-4 text-sm font-semibold text-relume-command">Add layer</button>
          </div>
          {activeLayers.length === 0 && <p className="mt-3 text-xs text-relume-muted">No active layers yet. Resolve a location above or add a layer manually.</p>}
          <ul className="mt-3 grid gap-3" aria-label="Active layers">
            {activeLayers.map((layer) => (
              <li key={layer.id} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3" data-map-composer-layer={layer.id}>
                {layer.editable ? (
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,9rem)_auto] sm:items-end">
                    <label className={labelClass}>Layer name
                      <input value={layer.name} onChange={(event) => updateLayer(layer.id, { name: event.target.value })} className={inputClass} />
                    </label>
                    <label className={labelClass}>Source
                      <input value={layer.source} onChange={(event) => updateLayer(layer.id, { source: event.target.value })} className={inputClass} />
                    </label>
                    <label className={labelClass}>Observation date
                      <input type="date" value={layer.observationDate} onChange={(event) => updateLayer(layer.id, { observationDate: event.target.value })} className={inputClass} />
                    </label>
                    <button type="button" onClick={() => removeLayer(layer.id)} aria-label={`Remove layer ${layer.name || 'untitled'}`} className="min-h-11 rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-command">Remove</button>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-relume-muted">Layer</p><p className="text-sm font-semibold text-relume-command">{layer.name}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-relume-muted">Source</p><p className="text-xs text-relume-ink">{layer.source}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-relume-muted">Observation date</p><p className="text-xs text-relume-ink">{layer.observationDate}</p></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid gap-4 border-t border-relume-border pt-5 sm:grid-cols-2">
          <label className="flex min-h-11 items-start gap-3 text-sm text-relume-ink">
            <input type="checkbox" checked={metadata.locatorInsetAdded} onChange={(event) => update({ locatorInsetAdded: event.target.checked })} disabled={!locatorRequired} className="mt-1 h-4 w-4" />
            <span>Locator inset added{locatorRequired ? ' (required — the loaded location has no resolved state/district)' : ' (not required for the loaded location)'}</span>
          </label>
          <label className="flex min-h-11 items-start gap-3 text-sm text-relume-ink">
            <input type="checkbox" checked={metadata.indicativeAcknowledged} onChange={(event) => update({ indicativeAcknowledged: event.target.checked })} disabled={!indicativeApplies} className="mt-1 h-4 w-4" />
            <span>I acknowledge this map will be watermarked INDICATIVE — NOT A LEGAL OPINION{indicativeApplies ? ' (required — loaded data is seeded/INDICATIVE)' : ' (not required — no INDICATIVE data is loaded)'}</span>
          </label>
        </div>

        <ol className="mt-6 grid gap-3 border-t border-relume-border pt-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Map Composer quality checks">
          {checks.map((check, index) => (
            <li key={check.id} className={`rounded-relume border p-4 ${check.passed ? 'border-emerald-600/40 bg-emerald-50' : 'border-relume-border bg-relume-surface-secondary'}`} data-map-composer-requirement={check.id} data-map-composer-check-passed={check.passed}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Check {String(index + 1).padStart(2, '0')}</span>
                <span className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${check.passed ? 'border-emerald-600 bg-white text-emerald-700' : 'border-relume-border bg-white text-relume-muted'}`}>{check.passed ? 'Passed' : 'Blocked'}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-relume-command">{check.title}</h3>
              <p className="mt-2 text-xs leading-5 text-relume-muted">{check.reason}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-relume-border pt-4">
          <p className="max-w-3xl text-xs leading-5 text-relume-muted"><strong className="text-relume-command">INDICATIVE — NOT GIS EVIDENCE OR AN APPROVAL DELIVERABLE.</strong> No PDF, GIS, CAD, or image export is generated by this workflow. Export unlocks only once every check above genuinely passes against real project evidence.</p>
          <button type="button" disabled={summary.blocked} aria-disabled={summary.blocked} title={summary.blocked ? `${summary.total - summary.passed} check(s) still blocked` : undefined} className="min-h-11 rounded-full bg-relume-command px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-relume-border disabled:text-relume-muted">Export map ({summary.passed}/{summary.total})</button>
        </div>
      </div>
    </section>
  )
}
