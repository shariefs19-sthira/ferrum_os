"use client"

import { useParcelContext } from '../../lib/workspace/parcelContext'

const requiredRules = ['Permitted land use', 'Floor-area ratio', 'Site coverage', 'Setbacks', 'Height limit']

export default function ZoningSummary() {
  const parcel = useParcelContext()
  return (
    <section className="rounded-relume border border-relume-border bg-relume-surface p-5" data-zoning-summary>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-relume-command">Zoning summary</h3>
        <span className="rounded-full border border-relume-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Source-gated</span>
      </div>
      {!parcel ? (
        <p className="mt-4 text-sm text-relume-muted" data-no-parcel-context>No parcel context — resolve a lookup above.</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-relume-ink">{parcel.district}, {parcel.state} · {parcel.land_use}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {requiredRules.map((rule) => (
              <li key={rule} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3">
                <div className="flex items-center justify-between gap-2"><strong className="text-sm text-relume-command">{rule}</strong><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-danger">GAP</span></div>
                <p className="mt-2 text-xs leading-5 text-relume-muted">No current, clause-cited master-plan regulation is loaded for this jurisdiction. No value is shown.</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[10px] text-relume-muted">Parcel provenance: {parcel.provenance.source} · {parcel.provenance.vintage}</p>
        </>
      )}
    </section>
  )
}
