import type { ReactNode } from 'react'
import { computeFerrumRate } from '../../lib/rateEngine/ferrumRateEngine'
import { computeNpv, estimateIrr } from '../../lib/finance/irrNpv'
import { runIsCheck } from '../../lib/checks/isCode'

export type ProductPreview =
  | 'landintel'
  | 'designstudio'
  | 'structura'
  | 'boq-pro'
  | 'promarket'
  | 'investflow'
  | 'communitybuild'

const parcel = {
  ulpin: 'KA-BLR-0001-2024',
  district: 'Bengaluru Urban',
  area: '1,200.5 m²',
  landUse: 'Residential',
}

// These values are the INDICATIVE rows in migrations/0002_seed.sql.
const rates = [
  { item: 'Cement (OPC 53)', region: 'Bengaluru', unit: '50 kg bag', rate: 420 },
  { item: 'TMT Steel (Fe 500D)', region: 'Bengaluru', unit: 'kg', rate: 68.5 },
  { item: 'Skilled Mason', region: 'Bengaluru', unit: 'day', rate: 900 },
]

const ferrumRate = computeFerrumRate(420, 415, 405, 'buyer')
const beamCheck = runIsCheck('rc-beam', { b: 300, d: 500, fy: 415, Ast: 600 })
const cashFlows = [-1000, 300, 400, 500, 600]
const irr = estimateIrr(cashFlows)
const npv = computeNpv(cashFlows, 0.1)

function IndicativeBadge() {
  return (
    <span className="rounded-full border border-relume-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
      Indicative
    </span>
  )
}

function PreviewShell({
  tool,
  children,
  note,
}: {
  tool: string
  children: ReactNode
  note: string
}) {
  return (
    <figure
      aria-label={`${tool} indicative sample preview`}
      className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <figcaption className="text-xs font-semibold uppercase tracking-[0.18em] text-relume-muted">
          {tool}
        </figcaption>
        <IndicativeBadge />
      </div>
      <div className="mt-4 rounded-relume border border-relume-border bg-relume-surface p-4">
        {children}
      </div>
      <p className="mt-4 text-[11px] leading-5 text-relume-muted">{note}</p>
    </figure>
  )
}

function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-relume-border py-2 last:border-0">
      <dt className="text-xs text-relume-muted">{label}</dt>
      <dd className="text-right text-xs font-medium text-relume-ink">{value}</dd>
    </div>
  )
}

export default function ProductHeroPreview({ product }: { product: ProductPreview }) {
  if (product === 'landintel') {
    return (
      <PreviewShell tool="ULPIN parcel lookup" note="Seeded sample parcel — not live registry or title data.">
        <p className="font-mono text-sm font-semibold text-relume-ink">{parcel.ulpin}</p>
        <dl className="mt-3">
          <DataRow label="District" value={parcel.district} />
          <DataRow label="Area" value={parcel.area} />
          <DataRow label="Land use" value={parcel.landUse} />
        </dl>
      </PreviewShell>
    )
  }

  if (product === 'designstudio') {
    return (
      <PreviewShell tool="Test-fit massing" note="Sample 20 × 30 m plot, two floors and 2 m setback — verify local controls.">
        <div className="grid grid-cols-[7rem_1fr] items-center gap-4">
          <svg viewBox="0 0 200 300" role="img" aria-label="Indicative rectangular test-fit" className="h-40 w-28">
            <rect x="1" y="1" width="198" height="298" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="20" y="20" width="160" height="260" className="fill-relume-surface-secondary stroke-relume-ink" strokeWidth="2" />
            <path d="M20 150h160M100 20v260" className="stroke-relume-border" strokeWidth="2" />
          </svg>
          <dl>
            <DataRow label="Plot" value="600 m²" />
            <DataRow label="Floor area" value="832 m²" />
            <DataRow label="Coverage" value="69.3%" />
          </dl>
        </div>
      </PreviewShell>
    )
  }

  if (product === 'structura') {
    const result = beamCheck.checks[0]
    return (
      <PreviewShell tool="IS 456 beam check" note="Textbook clause check only — not a structural design or professional sign-off.">
        <p className="text-sm font-semibold text-relume-ink">RC beam · Cl 26.5.1.1</p>
        <dl className="mt-3">
          <DataRow label="Section" value="300 × 500 mm" />
          <DataRow label="Steel grade" value="fy 415 N/mm²" />
          <DataRow label="Provided Ast" value="600 mm²" />
          <DataRow label="Result" value={result.pass ? 'Meets minimum' : 'Below minimum'} />
        </dl>
      </PreviewShell>
    )
  }

  if (product === 'boq-pro') {
    const inr = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    return (
      <PreviewShell tool="Ferrum rate band" note="Computed from the three seeded cement-rate samples — not a current market quote.">
        <p className="text-xs text-relume-muted">Cement (OPC 53) · per 50 kg bag</p>
        <p className="mt-2 text-3xl font-semibold tracking-relume-tight text-relume-ink">
          {inr(ferrumRate.band.p50)}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-relume-muted">
          <span>P25 {inr(ferrumRate.band.p25)}</span>
          <span className="h-px flex-1 bg-relume-border" aria-hidden="true" />
          <span>P75 {inr(ferrumRate.band.p75)}</span>
        </div>
      </PreviewShell>
    )
  }

  if (product === 'promarket') {
    return (
      <PreviewShell tool="Rate comparison" note="Seeded sample rates — not live supplier, labour, or market quotations.">
        <p className="text-sm font-semibold text-relume-ink">Bengaluru reference rows</p>
        <dl className="mt-3">
          {rates.map((row) => (
            <DataRow key={row.item} label={row.item} value={`₹${row.rate}/${row.unit}`} />
          ))}
        </dl>
      </PreviewShell>
    )
  }

  if (product === 'investflow') {
    return (
      <PreviewShell tool="IRR / NPV model" note="Sample cash flows in relative ₹000 units — not an investment forecast or offer.">
        <p className="font-mono text-xs text-relume-muted">−1000, 300, 400, 500, 600</p>
        <dl className="mt-3">
          <DataRow label="Discount rate" value="10%" />
          <DataRow label="IRR" value={irr === null ? 'Did not converge' : `${(irr * 100).toFixed(2)}%`} />
          <DataRow label="NPV" value={`₹${npv.toFixed(2)}k`} />
        </dl>
      </PreviewShell>
    )
  }

  return (
    <PreviewShell tool="CDE project status" note="Fixed mock payload — no live project or per-project CDE record exists yet.">
      <p className="font-mono text-xs text-relume-muted">demo-project-01</p>
      <dl className="mt-3">
        <DataRow label="Phase" value="Design Development" />
        <DataRow label="Open items" value="4" />
        <DataRow label="Data source" value="Fixed mock" />
      </dl>
    </PreviewShell>
  )
}
