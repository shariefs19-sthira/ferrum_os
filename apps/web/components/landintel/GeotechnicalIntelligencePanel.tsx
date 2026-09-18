'use client'

import {
  createUnknownGeotechnicalScreening,
  geotechnicalTopicLabels,
  governmentGeotechnicalSources,
  projectInputChecklist,
  publicDataNonClaims,
  type GeotechnicalAssessment,
  type GeotechnicalEvidenceStatus,
} from '../../lib/landintel/geotechnicalIntelligence'
import { useParcelContext } from '../../lib/workspace/parcelContext'

const statusLegend: GeotechnicalEvidenceStatus[] = [
  'SOURCE-VERIFIED', 'USER-PROVIDED', 'INDICATIVE', 'INFERRED',
  'UNKNOWN', 'STALE UPSTREAM DATA', 'CONFLICT',
]

export default function GeotechnicalIntelligencePanel({
  assessment = createUnknownGeotechnicalScreening(),
}: {
  assessment?: GeotechnicalAssessment
}) {
  const parcel = useParcelContext()
  const visibleEvidence = assessment.evidence.slice(0, 8)

  return (
    <section className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface" aria-labelledby="geotechnical-intelligence-heading" data-geotechnical-intelligence>
      <div className="grid gap-5 border-b border-relume-border p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.34fr)] xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · geotechnical evidence</p>
          <h2 id="geotechnical-intelligence-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-ink sm:text-3xl">
            Ground conditions, with evidence limits visible
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">
            Regional geology, terrain and hazard layers can screen a site. Boreholes, field and laboratory testing, groundwater monitoring and accountable professional interpretation are required before project ground parameters are used.
          </p>
          <p className="mt-2 text-xs text-relume-muted" data-geotechnical-parcel>
            {parcel ? `Project context: ${parcel.district}, ${parcel.state}` : 'No resolved parcel context — source coverage has not been queried.'}
          </p>
        </div>
        <div className="rounded-relume border border-relume-ink bg-relume-ink p-4 text-white" aria-label="Geotechnical screening status">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">Current result</p>
          <p className="mt-2 text-xl font-semibold">{assessment.suitability}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-white/60">Evidence coverage</dt><dd className="mt-1 text-lg font-semibold">{assessment.coveragePercent}%</dd></div>
            <div><dt className="text-white/60">Active holds</dt><dd className="mt-1 text-lg font-semibold">{assessment.holds.length}</dd></div>
          </dl>
        </div>
      </div>

      <div className="border-b border-relume-border p-5 sm:p-6">
        <div className="flex flex-wrap gap-2" aria-label="Geotechnical evidence status legend">
          {statusLegend.map((status) => <span key={status} className="rounded-full border border-relume-border bg-relume-surface-secondary px-3 py-1.5 text-[10px] font-semibold tracking-[0.06em] text-relume-ink">{status}</span>)}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Geotechnical evidence coverage">
          {visibleEvidence.map((item) => (
            <article key={item.id} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-semibold leading-5 text-relume-ink">{geotechnicalTopicLabels[item.topic]}</h3>
                <span className="whitespace-nowrap text-[9px] font-semibold tracking-[0.06em] text-relume-muted">{item.status}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-relume-muted">{item.value === null ? 'No source-qualified parcel evidence loaded.' : `${String(item.value)}${item.unit ? ` ${item.unit}` : ''}`}</p>
              <p className="mt-2 text-[10px] leading-4 text-relume-muted">Coverage: {item.coverage.label}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-2">
        <div className="border-b border-relume-border p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Required project evidence</p>
          <ol className="mt-4 space-y-3">
            {projectInputChecklist.map((input, index) => <li key={input} className="flex gap-3 text-xs leading-5 text-relume-ink"><span className="font-semibold text-relume-muted">{String(index + 1).padStart(2, '0')}</span><span>{input}</span></li>)}
          </ol>
          <div className="mt-5 rounded-relume border border-relume-border bg-relume-surface-secondary p-4">
            <p className="text-xs font-semibold text-relume-ink">Dependent outputs held or recalculated</p>
            <p className="mt-2 text-xs leading-5 text-relume-muted">{assessment.downstreamInvalidations.join(' · ') || 'No downstream invalidation recorded'}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Authority source registry</p>
          <p className="mt-2 text-xs leading-5 text-relume-muted">Connector definitions are visible for discovery; none is represented as connected until its licence, coverage and record metadata pass ingestion checks.</p>
          <div className="mt-4 space-y-3" aria-label="Government geotechnical source registry">
            {governmentGeotechnicalSources.map((source) => (
              <article key={source.id} className="rounded-relume border border-relume-border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><h3 className="text-xs font-semibold text-relume-ink">{source.title}</h3><p className="mt-1 text-[10px] text-relume-muted">{source.authority} · {source.jurisdiction}</p></div>
                  <span className="text-[9px] font-semibold tracking-[0.06em] text-relume-muted">{source.connectorState}</span>
                </div>
                <p className="mt-2 text-[10px] leading-4 text-relume-muted">{source.screeningBoundary}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-relume-border bg-relume-surface-secondary p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Public data does not establish</p>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {publicDataNonClaims.map((claim) => <li key={claim} className="border-l-2 border-relume-ink pl-3 text-xs leading-5 text-relume-ink">{claim}</li>)}
        </ul>
        <p className="mt-5 text-xs font-semibold leading-5 text-relume-ink">INDICATIVE — REGIONAL SCREENING ONLY. Project investigation and accountable engineering review remain required.</p>
      </div>
    </section>
  )
}
