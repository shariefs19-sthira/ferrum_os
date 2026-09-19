'use client'

import { useMemo, useState } from 'react'
import { useParcelContext } from '../../lib/workspace/parcelContext'
import {
  synthesize, topicById, lengthLabel, type ClassifiedObservation, type SiteModuleId, type SiteObservation, type SlotState,
} from '../../lib/landintel/siteAnalysis'
import {
  buildHandoff, handoffStatus, observationsFor, parcelKeyOf, readStore, reviewFor, todayIso, useSiteAnalysisStore,
  withHandoff, withObservations, withReview, writeStore,
} from '../../lib/landintel/siteAnalysisStore'
import { compassLabel, computeSunGeometry } from '../../lib/landintel/siteSolar'
import SiteAnalysisDiagram, { diagramLayers, plotRecords, radiusOptions, type DiagramLayer } from './SiteAnalysisDiagram'
import SiteObservationForm from './SiteObservationForm'
import SiteSynthesisPanel from './SiteSynthesisPanel'

/** What is genuinely automated per module today; everything else is manual capture and says so. */
const moduleAutomation: Record<SiteModuleId, string> = {
  climate: 'Automated: sun geometry only, COMPUTED from the map point. Manual capture only: regional climate, site climate, shadow, wind, microclimate — no climate, shadow or wind source is connected.',
  physical: 'Automated: nothing. Terrain and contours, soil logs, hydrology and trees are reference records; no survey, DTM, borehole or hydrology connector is connected.',
  urban: 'Automated: nothing. The map point and OSM buildings are context only; setbacks and envelopes need an authority record, views, privacy and noise are manual.',
  infrastructure: 'Automated: nothing. No road-width, transit, utility or right-of-way source is connected; entries and utilities are manual dated observations or provider references.',
  cultural: 'Automated: nothing. No heritage or archaeology register is connected; absence of a record is never treated as “not heritage”.',
}

const chip = 'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em]'
const stateChip = (state: SlotState | ClassifiedObservation['state']) =>
  state === 'GAP' ? `${chip} border-dashed border-relume-steel text-relume-muted`
    : state === 'OBSERVED' ? `${chip} border-relume-command bg-relume-command text-white`
    : state === 'STALE' || state === 'INVALID' ? `${chip} border-relume-danger text-relume-danger`
    : `${chip} border-relume-command text-relume-command`

export default function SiteAnalysisWorkspace({ clock = () => new Date() }: { clock?: () => Date }) {
  const parcel = useParcelContext()
  const store = useSiteAnalysisStore()
  const parcelKey = parcelKeyOf(parcel)
  const anchor = parcel?.coordinates ?? null
  const nowIso = todayIso(clock)
  const [activeModule, setActiveModule] = useState<SiteModuleId>('climate')
  const [layers, setLayers] = useState<Set<DiagramLayer>>(() => new Set(diagramLayers.map((layer) => layer.id)))
  const [radiusM, setRadiusM] = useState<number>(100)
  const [saveError, setSaveError] = useState('')

  const observations = useMemo(() => observationsFor(store, parcelKey), [store, parcelKey])
  const synthesis = useMemo(() => synthesize(parcelKey, observations, nowIso, !!anchor), [parcelKey, observations, nowIso, anchor])
  const review = reviewFor(store, parcelKey)
  const status = handoffStatus(store.handoff, parcelKey, synthesis.snapshotHash)
  const sun = useMemo(() => (anchor ? computeSunGeometry(anchor.lat) : null), [anchor])
  const active = synthesis.modules.find((item) => item.module.id === activeModule) ?? synthesis.modules[0]
  const drawn = useMemo(() => plotRecords(anchor, radiusM, synthesis.classified), [anchor, radiusM, synthesis.classified])

  const commit = (next: ReturnType<typeof readStore>) => {
    const ok = writeStore(next)
    setSaveError(ok ? '' : 'The browser refused to store this change (storage blocked or full). Nothing was saved.')
    return ok
  }
  const addObservation = (record: SiteObservation) => {
    if (!parcelKey) return false
    const fresh = readStore()
    return commit(withObservations(fresh, parcelKey, [...observationsFor(fresh, parcelKey), record]))
  }
  const removeObservation = (id: string) => {
    if (!parcelKey) return
    const fresh = readStore()
    commit(withObservations(fresh, parcelKey, observationsFor(fresh, parcelKey).filter((item) => item.id !== id)))
  }
  const markReviewed = (reviewer: string) => {
    if (!parcelKey) return
    commit(withReview(readStore(), parcelKey, { snapshotHash: synthesis.snapshotHash, reviewedAt: nowIso, reviewer }))
  }
  const send = () => {
    if (!parcel || !review || review.snapshotHash !== synthesis.snapshotHash) return
    commit(withHandoff(readStore(), buildHandoff({
      parcel, review, qualified: synthesis.qualified, heldBackCount: synthesis.heldBack.length,
      missing: synthesis.missing.map(({ topicId, label, reason }) => ({ topicId, label, reason })),
      gates: synthesis.gates.map((item) => ({ id: item.gate.id, label: item.gate.label })),
      sentAt: nowIso, topicLabel: (id) => topicById(id)?.label ?? id,
    })))
  }
  const withdraw = () => { commit(withHandoff(readStore(), null)) }

  const toggleLayer = (id: DiagramLayer) => setLayers((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  const onDiagram = (item: ClassifiedObservation): string =>
    item.state === 'INVALID' ? 'Not drawn (invalid)' : drawn.plotted.some((entry) => entry.item.record.id === item.record.id) ? 'Drawn' : drawn.offScale.some((entry) => entry.record.id === item.record.id) ? 'Beyond radius' : 'No location'
  const moduleRecords = synthesis.classified.filter((item) => item.record.module === active.module.id)

  return (
    <section className="min-w-0 rounded-relume border border-relume-border bg-relume-surface" aria-labelledby="site-analysis-heading" data-site-analysis>
      <div className="border-b border-relume-border p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · pre-design site analysis</p>
        <h2 id="site-analysis-heading" className="mt-2 text-2xl font-semibold tracking-relume-tight text-relume-ink sm:text-3xl">Site analysis: gather evidence before any design</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-muted">Five modules share one governed observation record — date, observer, source, location, confidence and basis. Nothing here is a survey, a legal opinion or a measurement: a map point and OSM buildings are context, missing data reads UNKNOWN or GAP, and site visit, licensed survey, geotechnical interpretation and local-authority verification stay explicit OPEN gates.</p>
        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3" data-site-analysis-status>
          <div className="min-w-0"><dt className="text-relume-muted">Anchor</dt><dd className="mt-1 break-words font-semibold text-relume-ink" data-site-anchor-text>{parcel && anchor ? `${anchor.lat.toFixed(5)}, ${anchor.lng.toFixed(5)} — map point, context only` : 'UNKNOWN — no site resolved'}</dd></div>
          <div className="min-w-0"><dt className="text-relume-muted">Qualified / held back / gaps</dt><dd className="mt-1 font-semibold text-relume-ink">{synthesis.qualified.length} / {synthesis.heldBack.length} / {synthesis.missing.length}</dd></div>
          <div className="min-w-0"><dt className="text-relume-muted">Handoff to DesignStudio &amp; SUTRA</dt><dd className="mt-1 font-semibold text-relume-ink" data-site-handoff-state>{status.state === 'STALE' ? `STALE — ${status.reason}` : status.state}</dd></div>
        </dl>
      </div>

      <div className="grid min-w-0 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 space-y-3" data-site-diagram-column>
          <div role="group" aria-label="Diagram layers" className="flex flex-wrap gap-2" data-site-diagram-toggles>
            {diagramLayers.map((layer) => (
              <button key={layer.id} type="button" aria-pressed={layers.has(layer.id)} onClick={() => toggleLayer(layer.id)} data-diagram-toggle={layer.id}
                className={`min-h-11 rounded-full border px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${layers.has(layer.id) ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border text-relume-command hover:bg-relume-surface-secondary'}`}>
                {layer.label}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="site-diagram-radius" className="block text-xs font-semibold text-relume-ink">Diagram radius (view only)</label>
            <select id="site-diagram-radius" value={radiusM} onChange={(event) => setRadiusM(Number(event.target.value))} className="mt-2 min-h-11 w-full max-w-xs rounded-relume border border-relume-border bg-relume-surface px-3 text-sm text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
              {radiusOptions.map((option) => <option key={option} value={option}>{lengthLabel(option)}</option>)}
            </select>
          </div>
          <SiteAnalysisDiagram anchor={anchor} items={synthesis.classified} sun={sun} radiusM={radiusM} layers={layers} />
        </div>

        <div className="min-w-0 space-y-4" data-site-module-column>
          <div role="group" aria-label="Site analysis modules" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5" data-site-module-picker>
            {synthesis.modules.map((item) => (
              <button key={item.module.id} type="button" aria-pressed={item.module.id === activeModule} onClick={() => setActiveModule(item.module.id)} data-site-module={item.module.id}
                className={`min-h-11 min-w-0 rounded-relume border px-3 py-2 text-left text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${item.module.id === activeModule ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border text-relume-command hover:bg-relume-surface-secondary'}`}>
                <span className="block break-words">{item.module.short}</span>
                <span className="mt-1 block text-[10px] font-normal opacity-80">{item.qualified} of {item.total} topics qualified</span>
              </button>
            ))}
          </div>

          <div className="rounded-relume border border-relume-border p-4" data-site-module-panel={active.module.id}>
            <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">{active.module.label}</h3>
            <p className="mt-1 text-xs leading-5 text-relume-muted">{active.module.summary}</p>
            <p className="mt-2 rounded-relume bg-relume-surface-secondary p-3 text-xs leading-5 text-relume-ink" data-module-automation>{moduleAutomation[active.module.id]}</p>
            <ul className="mt-4 space-y-2" aria-label={`${active.module.short} topics`}>
              {active.slots.map((slot) => (
                <li key={slot.topic.id} className="rounded-relume border border-relume-border p-3" data-topic-slot={slot.topic.id} data-topic-state={slot.state}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-relume-ink">{slot.topic.label}</span>
                    <span className={stateChip(slot.state)}>{slot.state === 'GAP' ? 'GAP / UNKNOWN' : slot.state}</span>
                    {slot.topic.computed && anchor && <span className={`${chip} border-relume-steel text-relume-muted`}>COMPUTED geometry</span>}
                    {slot.qualifiedCount > 0 && <span className="text-[11px] text-relume-muted">{slot.qualifiedCount} qualified</span>}
                  </div>
                  {slot.topic.delegatedTo && <p className="mt-1 text-[11px] leading-4 text-relume-ink">Record through {slot.topic.delegatedTo} (Land tab). It is not yet connected to this synthesis.</p>}
                  <details className="mt-1"><summary className="flex min-h-11 cursor-pointer items-center text-[11px] font-semibold text-relume-command">Connector status</summary><p className="mt-1 text-[11px] leading-4 text-relume-muted">{slot.topic.pendingConnector}</p></details>
                </li>
              ))}
            </ul>
          </div>

          <SiteObservationForm key={active.module.id} module={active.module.id} parcelKey={parcelKey} anchor={anchor} nowIso={nowIso} onAdd={addObservation} />

          <div className="rounded-relume border border-relume-border p-4" data-site-records>
            <h4 className="text-base font-semibold text-relume-ink">Recorded observations — {active.module.short} ({moduleRecords.length})</h4>
            {moduleRecords.length === 0 ? <p className="mt-2 text-xs leading-5 text-relume-muted">None recorded. Every topic above reads GAP until a dated, sourced record exists.</p> : (
              <ul className="mt-3 space-y-3">
                {moduleRecords.map((item) => {
                  const { record } = item
                  return <li key={record.id} className="rounded-relume border border-relume-border p-3" data-observation-row={record.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-relume-ink">{topicById(record.topic)?.label ?? record.topic}</span>
                      <span className={stateChip(item.state)}>{item.state}</span>
                      <span className={`${chip} border-relume-border text-relume-muted`}>{item.confidence} confidence</span>
                    </div>
                    <dl className="mt-2 grid gap-x-4 gap-y-1 text-[11px] leading-4 text-relume-ink sm:grid-cols-2">
                      <div><dt className="inline text-relume-muted">Basis: </dt><dd className="inline">{record.basis.replace('_', ' ')}</dd></div>
                      <div><dt className="inline text-relume-muted">Date: </dt><dd className="inline">{record.observedOn}</dd></div>
                      <div><dt className="inline text-relume-muted">Observer: </dt><dd className="inline break-words">{record.observer}</dd></div>
                      <div><dt className="inline text-relume-muted">Source: </dt><dd className="inline break-words">{record.sourceRef}</dd></div>
                      <div><dt className="inline text-relume-muted">Location: </dt><dd className="inline break-words">{record.location ? `${record.location.lat.toFixed(5)}, ${record.location.lng.toFixed(5)}${record.locationSource === 'MAP_POINT_CONTEXT' ? ' (map point, context only)' : record.locationSource === 'DEVICE' ? ' (device)' : ''}` : 'none'}</dd></div>
                      <div><dt className="inline text-relume-muted">Bearing: </dt><dd className="inline">{record.bearingDeg !== null ? `${record.bearingDeg}° ${compassLabel(record.bearingDeg)} — ${topicById(record.topic)?.bearingMeaning ?? ''}` : 'none'}</dd></div>
                      <div><dt className="inline text-relume-muted">Diagram: </dt><dd className="inline" data-on-diagram>{onDiagram(item)}</dd></div>
                    </dl>
                    {record.note && <p className="mt-2 break-words text-xs leading-5 text-relume-ink">{record.note}</p>}
                    {item.heldBackReason && <p className="mt-2 text-[11px] leading-4 text-relume-danger">Held back: {item.heldBackReason}</p>}
                    {item.issues.length > 0 && <ul className="mt-1 list-disc pl-5 text-[11px] leading-4 text-relume-danger">{item.issues.map((issue, index) => <li key={index}>{issue.message}</li>)}</ul>}
                    <button type="button" onClick={() => removeObservation(record.id)} className="mt-2 min-h-11 rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-command hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" aria-label={`Remove ${topicById(record.topic)?.label ?? record.topic} observation dated ${record.observedOn}`}>Remove</button>
                  </li>
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <SiteSynthesisPanel synthesis={synthesis} hasParcel={!!parcelKey} review={review} handoff={store.handoff} handoffState={status} saveError={saveError} onReview={markReviewed} onSend={send} onWithdraw={withdraw} />
      </div>
    </section>
  )
}

