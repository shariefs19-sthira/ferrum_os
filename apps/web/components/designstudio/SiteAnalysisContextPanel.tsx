"use client"

import Link from 'next/link'
import { useSiteHandoff } from '../../lib/landintel/siteAnalysisStore'
import { compassLabel } from '../../lib/landintel/siteSolar'

/**
 * Read-only DesignStudio view of the LandIntel site-analysis handoff. It has
 * no control that changes the handoff or the model; the only way to change
 * what appears here is to review and resend in LandIntel. A STALE handoff is
 * shown as stale and its records are withheld rather than displayed as if
 * still valid.
 */
export default function SiteAnalysisContextPanel() {
  const { handoff, status } = useSiteHandoff()
  return (
    <section className="rounded-relume border border-relume-border bg-relume-surface p-5 sm:p-6" aria-labelledby="site-analysis-context-heading" data-site-analysis-context data-handoff-state={status.state}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">DesignStudio · site-analysis context</p>
      <h2 id="site-analysis-context-heading" className="mt-2 text-2xl font-semibold tracking-relume-tight text-relume-ink">Qualified site evidence from LandIntel</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-relume-muted">Read-only. Only records that were reviewed and qualified in LandIntel appear here; inferred, stale, invalid and low-confidence records are held back. This is context, not a design recommendation, and nothing here changes the model — design intent still goes through SUTRA.</p>

      {status.state === 'NONE' && <p className="mt-4 rounded-relume border border-dashed border-relume-border p-4 text-sm text-relume-muted" data-site-context-none>UNKNOWN — no site-analysis context has been handed off. Record, review and send evidence in LandIntel&apos;s Site analysis tab.</p>}

      {status.state === 'STALE' && handoff && (
        <div className="mt-4 rounded-relume border border-relume-danger p-4" role="status" data-site-context-stale>
          <p className="text-sm font-semibold text-relume-danger">STALE — {status.reason}</p>
          <p className="mt-1 text-xs leading-5 text-relume-ink">The {handoff.qualified.length} record{handoff.qualified.length === 1 ? '' : 's'} sent on {handoff.sentAt} for {handoff.parcelLabel} are withheld until the analysis is reviewed and sent again.</p>
        </div>
      )}

      {status.state === 'CURRENT' && handoff && (
        <div className="mt-4 space-y-4" data-site-context-current>
          <p className="text-sm text-relume-ink"><strong>{handoff.parcelLabel}</strong> — reviewed {handoff.reviewedAt} by {handoff.reviewer}; sent {handoff.sentAt}. {handoff.anchorNote}</p>
          <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div><dt className="text-relume-muted">Qualified records</dt><dd className="mt-1 text-lg font-semibold text-relume-ink">{handoff.qualified.length}</dd></div>
            <div><dt className="text-relume-muted">Held back</dt><dd className="mt-1 text-lg font-semibold text-relume-ink">{handoff.heldBackCount}</dd></div>
            <div><dt className="text-relume-muted">Topics missing</dt><dd className="mt-1 text-lg font-semibold text-relume-ink">{handoff.missing.length}</dd></div>
            <div><dt className="text-relume-muted">Boundary</dt><dd className="mt-1 text-lg font-semibold text-relume-ink">{handoff.boundary}</dd></div>
          </dl>
          <ul className="grid gap-2" aria-label="Qualified site records">
            {handoff.qualified.map((record) => <li key={record.id} className="rounded-relume border border-relume-border p-3 text-xs leading-5 text-relume-ink">
              <strong>{record.topicLabel}</strong> — {record.basis.replace('_', ' ')}, {record.confidence} confidence, {record.observedOn} by {record.observer} (source: {record.sourceRef}).
              {record.bearingDeg !== null && <> Bearing {record.bearingDeg}° {compassLabel(record.bearingDeg)}.</>}
              {record.note && <span className="block break-words text-relume-muted">{record.note}</span>}
            </li>)}
          </ul>
          <p className="text-xs leading-5 text-relume-muted"><strong className="text-relume-ink">Professional gates OPEN:</strong> {handoff.gates.map((gate) => gate.label).join(', ')}. Missing evidence stays UNKNOWN and is listed in LandIntel.</p>
        </div>
      )}

      <p className="mt-4 text-xs"><Link href="/products/landintel" className="font-semibold text-relume-command underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">Review or update in LandIntel</Link></p>
    </section>
  )
}
