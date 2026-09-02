import Link from 'next/link'
import { computeFerrumRate } from '../../lib/rateEngine/ferrumRateEngine'

/**
 * W2-344 RELUME_IDENTITY_PASS — Home hero media slot
 * (docs/RELUME_HANDOFF.md §3 HOME: "content left + media right").
 *
 * Was a literal empty placeholder box. This is a composed preview of four
 * real product surfaces: LandIntel/ULPIN, BOQ Pro rate band, workspace
 * status, and Transact stamp duty.
 *
 * HONESTY RULES APPLIED HERE:
 * - Every value shown is a REAL row from the shipped seed data
 *   (migrations/0002_seed.sql, 0003_transact.sql), not invented for display.
 * - The rate band is not typed by hand: it is computed at build time by the
 *   SHIPPED engine (lib/rateEngine/ferrumRateEngine.ts) from those seeded
 *   values, so what the hero shows is what the product actually computes.
 * - Every card carries an INDICATIVE badge, matching the labeling every one
 *   of these surfaces uses in-product, per docs/COMPLIANCE_GATE.md.
 * - Nothing here claims to be live registry, market, or project data.
 */

// Real seeded parcel — migrations/0002_seed.sql.
const PARCEL = {
  ulpin: 'KA-BLR-0001-2024',
  district: 'Bengaluru Urban',
  areaSqm: 1200.5,
  landUse: 'Residential',
}

// Real seeded cement rates — migrations/0002_seed.sql: Bengaluru 420,
// Pune 405, Chennai 415 (per 50kg bag). Fed to the real engine as the
// govt / market / user inputs at the default 40-40-20 weighting.
const RATE = computeFerrumRate(420.0, 415.0, 405.0, 'buyer')

// Real seeded stamp duty — migrations/0003_transact.sql, Karnataka.
const STAMP = { state: 'Karnataka', ratePct: 5.0, registrationPct: 1.0 }

function IndicativeBadge() {
  return (
    <span className="rounded-full border border-relume-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
      Indicative
    </span>
  )
}

function PreviewCard({
  product,
  href,
  children,
}: {
  product: string
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group block rounded-relume border border-relume-border bg-relume-surface p-4 transition hover:border-relume-ink/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
          {product}
        </span>
        <IndicativeBadge />
      </div>
      <div className="mt-3">{children}</div>
    </Link>
  )
}

export default function HeroComposite() {
  const inr = (n: number) =>
    `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-relume-muted">
        Sample project surfaces
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PreviewCard product="LandIntel" href="/products/landintel">
          <p className="font-mono text-sm text-relume-ink">{PARCEL.ulpin}</p>
          <dl className="mt-2 space-y-1 text-xs text-relume-muted">
            <div className="flex justify-between gap-2">
              <dt>District</dt>
              <dd className="text-relume-ink">{PARCEL.district}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Area</dt>
              <dd className="text-relume-ink">{PARCEL.areaSqm} m²</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Land use</dt>
              <dd className="text-relume-ink">{PARCEL.landUse}</dd>
            </div>
          </dl>
        </PreviewCard>

        <PreviewCard product="BOQ Pro" href="/products/boq-pro">
          <p className="text-xs text-relume-muted">Cement (OPC 53) · per 50kg bag</p>
          <p className="mt-1 text-lg font-semibold tracking-relume-tight text-relume-ink">
            {inr(RATE.band.p50)}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-relume-muted">
            <span>P25 {inr(RATE.band.p25)}</span>
            <span className="h-px flex-1 bg-relume-border" aria-hidden="true" />
            <span>P75 {inr(RATE.band.p75)}</span>
          </div>
        </PreviewCard>

        <PreviewCard product="Workspace" href="/project-workspace">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-relume-ink" aria-hidden="true" />
            <p className="text-sm text-relume-ink">Design Development</p>
          </div>
          <p className="mt-2 text-xs text-relume-muted">
            Saved artifacts, exports and shared links in one workspace.
          </p>
        </PreviewCard>

        <PreviewCard product="Transact" href="/products/transact">
          <p className="text-xs text-relume-muted">Stamp duty · {STAMP.state}</p>
          <p className="mt-1 text-lg font-semibold tracking-relume-tight text-relume-ink">
            {STAMP.ratePct}%
          </p>
          <p className="mt-2 text-[11px] text-relume-muted">
            + {STAMP.registrationPct}% registration · verify with your sub-registrar
          </p>
        </PreviewCard>
      </div>

      <p className="mt-4 text-[11px] leading-5 text-relume-muted">
        Sample records from seeded reference data — not live registry, market or project
        data. Figures are indicative and not a legal or valuation opinion.
      </p>
    </div>
  )
}
