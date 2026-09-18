"use client"

import { landIntelSuitabilityLayers, suitabilityDecisionStates } from '../../lib/landintel/suitabilityLayers'
import { useParcelContext } from '../../lib/workspace/parcelContext'

function displayDate(value: string) {
  if (!value) return 'UNKNOWN'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function SuitabilityLayerPanel() {
  const parcel = useParcelContext()

  return (
    <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="suitability-layer-heading" data-suitability-layer-panel>
      <div className="rounded-relume border border-relume-border bg-relume-surface p-4 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.45fr)] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · auditable suitability engine</p>
              <span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Roadmap</span>
            </div>
            <h2 id="suitability-layer-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-command sm:text-3xl">Eight constraint layers, one explainable result</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">LandIntel will rank development zones only after the required evidence is loaded. Every layer retains its source, date, confidence and status; missing or conflicting evidence remains visible instead of being converted into a false answer.</p>
          </div>
          <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4" aria-label="Current suitability result">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Current result</p>
            <p className="mt-2 text-lg font-semibold text-relume-command">Suitable development zone: UNKNOWN</p>
            <p className="mt-2 text-xs leading-5 text-relume-muted">{parcel ? `A ${parcel.provenance.status.toLowerCase()} parcel context is loaded for ${parcel.district}, but the remaining authority and site evidence is incomplete. No zone is ranked.` : 'Resolve a parcel, then connect the authority and site evidence below. No zone is ranked from sample or missing data.'}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Suitability decision states">
          {suitabilityDecisionStates.map((state) => <span key={state} className="rounded-full border border-relume-border bg-white px-3 py-1.5 text-[11px] font-semibold text-relume-command">{state}</span>)}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="LandIntel suitability layers">
          {landIntelSuitabilityLayers.map((layer, index) => {
            const hasParcelEvidence = index === 0 && parcel
            const source = hasParcelEvidence ? parcel.provenance.source : 'Not connected'
            const date = hasParcelEvidence ? displayDate(parcel.provenance.vintage) : 'UNKNOWN'
            const confidence = hasParcelEvidence ? parcel.provenance.status : 'UNKNOWN'
            const status = hasParcelEvidence ? 'CONTEXT LOADED' : 'ROADMAP'
            return <article key={layer.id} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4" data-suitability-layer={layer.id}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Layer {String(index + 1).padStart(2, '0')}</p>
                <span className="rounded-full border border-relume-border bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-relume-muted">{status}</span>
              </div>
              <h3 className="mt-3 text-base font-semibold tracking-relume-tight text-relume-command">{layer.title}</h3>
              <p className="mt-2 text-xs leading-5 text-relume-ink">{layer.summary}</p>
              <dl className="mt-4 space-y-2 border-t border-relume-border pt-3 text-[10px] leading-4">
                <div><dt className="font-semibold text-relume-command">Decision role</dt><dd className="text-relume-muted">{layer.decisionRole}</dd></div>
                <div><dt className="font-semibold text-relume-command">Evidence required</dt><dd className="text-relume-muted">{layer.evidenceNeeded}</dd></div>
                <div className="grid grid-cols-2 gap-2"><div><dt className="font-semibold text-relume-command">Source</dt><dd className="break-words text-relume-muted">{source}</dd></div><div><dt className="font-semibold text-relume-command">Date</dt><dd className="text-relume-muted">{date}</dd></div></div>
                <div><dt className="font-semibold text-relume-command">Confidence / status</dt><dd className="font-semibold text-relume-muted">{confidence}</dd></div>
              </dl>
            </article>
          })}
        </div>

        <div className="mt-5 grid gap-3 border-t border-relume-border pt-5 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] lg:items-start">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Explainability contract</p><p className="mt-2 text-lg font-semibold text-relume-command">Every ranking must state why.</p></div>
          <p className="text-sm leading-6 text-relume-ink">Example only: “This zone ranked highest because it avoids verified flood exposure, satisfies cited setbacks, has an acceptable surveyed slope, and minimizes evidenced access cost.” Until those inputs exist, LandIntel reports <strong>UNKNOWN</strong> rather than drawing a persuasive but unsupported heatmap.</p>
        </div>
      </div>
    </section>
  )
}
