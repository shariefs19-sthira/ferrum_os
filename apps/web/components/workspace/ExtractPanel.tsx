"use client"

import type { WorkspaceExtract, WorkspaceProduct, WorkspaceProvenance } from "../../lib/types"

type ExtractPanelProps = {
  extracts: WorkspaceExtract[]
  lengthMetres?: number
  areaSquareMetres?: number
  onClose: () => void
  product: WorkspaceProduct
  provenance: WorkspaceProvenance
}

const squareFeetPerSquareMetre = 10.763910416709722
const feetPerMetre = 3.280839895013123

function format(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)
}

export default function ExtractPanel({
  areaSquareMetres,
  extracts,
  lengthMetres,
  onClose,
  product,
  provenance,
}: ExtractPanelProps) {
  return (
    <aside aria-label="Data extract" className="border border-relume-border bg-relume-surface p-5 sm:p-relume-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
            DATA-EXTRACT
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-relume-tight text-relume-ink">
            As per highlighted product: {product}
          </h2>
        </div>
        <button
          className="min-h-11 rounded-full border border-relume-border px-4 text-sm font-medium text-relume-ink hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
          onClick={onClose}
          type="button"
        >
          Close extract
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Data provenance">
        <span className="rounded-full border border-relume-border px-3 py-1 text-xs font-medium text-relume-ink">
          Source: {provenance.source}
        </span>
        <span className="rounded-full border border-relume-border px-3 py-1 text-xs font-medium text-relume-ink">
          Freshness: {provenance.freshness}
        </span>
        <span className="rounded-full border border-relume-border px-3 py-1 text-xs font-semibold text-relume-ink">
          {provenance.status}
        </span>
      </div>

      {extracts.length > 0 ? (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {extracts.map((extract) => (
            <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4" key={extract.label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">{extract.label}</dt>
              <dd className="mt-2 text-base font-semibold text-relume-ink">
                {extract.value}{extract.unit ? ` ${extract.unit}` : ""}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-6 rounded-relume border border-relume-border bg-relume-surface-secondary p-4 text-sm leading-6 text-relume-muted">
          No extractable fields are attached to this product yet. This panel does not invent a result.
        </p>
      )}

      {(typeof lengthMetres === "number" || typeof areaSquareMetres === "number") && (
        <section className="mt-6 border-t border-relume-border pt-5" aria-label="Dual-unit values">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Dual-unit values</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {typeof lengthMetres === "number" && (
              <p className="rounded-relume border border-relume-border p-4 text-sm text-relume-ink">
                Length: <strong>{format(lengthMetres)} m</strong> <span className="text-relume-muted">/ {format(lengthMetres * feetPerMetre)} ft</span>
              </p>
            )}
            {typeof areaSquareMetres === "number" && (
              <p className="rounded-relume border border-relume-border p-4 text-sm text-relume-ink">
                Area: <strong>{format(areaSquareMetres)} m²</strong> <span className="text-relume-muted">/ {format(areaSquareMetres * squareFeetPerSquareMetre)} sqft</span>
              </p>
            )}
          </div>
        </section>
      )}
    </aside>
  )
}
