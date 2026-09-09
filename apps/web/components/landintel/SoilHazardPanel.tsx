"use client"

import { useParcelContext } from '../../lib/workspace/parcelContext'

export type ParcelEvidenceDatum = {
  label: string
  value: string | null
  source: string | null
  vintage: string | null
  status: 'VERIFIED' | 'INDICATIVE' | 'UNVERIFIED' | 'GAP'
}

const gaps: ParcelEvidenceDatum[] = [
  'Soil class', 'Indicative bearing capacity', 'Water-table depth', 'Flood exposure', 'Seismic exposure', 'Cyclone exposure',
].map((label) => ({ label, value: null, source: null, vintage: null, status: 'GAP' }))

export default function SoilHazardPanel({ data = gaps }: { data?: ParcelEvidenceDatum[] }) {
  const parcel = useParcelContext()
  return <section className="rounded-relume border border-relume-border bg-relume-surface p-5" data-soil-hazard>
    <h3 className="text-lg font-semibold text-relume-command">Soil and hazard evidence</h3>
    {!parcel ? <p className="mt-4 text-sm text-relume-muted" data-no-parcel-context>No parcel context — resolve a lookup above.</p> : <>
      <p className="mt-2 text-sm text-relume-ink">{parcel.district}, {parcel.state}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.map((datum) => <div key={datum.label} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3">
        <div className="flex justify-between gap-2"><dt className="text-xs font-semibold text-relume-command">{datum.label}</dt><span className="text-[10px] font-semibold text-relume-danger">{datum.status}</span></div>
        <dd className="mt-2 text-sm text-relume-ink">{datum.value ?? 'No verified value loaded'}</dd>
        <p className="mt-2 text-[10px] text-relume-muted">{datum.source && datum.vintage ? `${datum.source} · ${datum.vintage}` : 'Source: GAP · Vintage: GAP'}</p>
      </div>)}</dl>
    </>}
  </section>
}
