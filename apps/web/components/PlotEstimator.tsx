"use client"

import { useMemo, useState } from "react"

export default function PlotEstimator() {
  const [plotAreaSqft, setPlotAreaSqft] = useState<number>(2200)

  const costBand = useMemo(() => {
    if (plotAreaSqft < 1200) {
      return {
        label: "Compact starter",
        range: "₹1.4k–₹1.8k/sqft",
        tone: "bg-amber-100 text-amber-900 border-amber-200",
      }
    }
    if (plotAreaSqft < 2600) {
      return {
        label: "Balanced build zone",
        range: "₹1.8k–₹2.6k/sqft",
        tone: "bg-relume-surface-secondary text-relume-ink border-relume-border",
      }
    }
    if (plotAreaSqft < 4200) {
      return {
        label: "Premium urban plot",
        range: "₹2.6k–₹3.4k/sqft",
        tone: "bg-violet-100 text-violet-900 border-violet-200",
      }
    }
    return {
      label: "High-density development",
      range: "₹3.4k–₹4.8k/sqft",
      tone: "bg-emerald-100 text-emerald-900 border-emerald-200",
    }
  }, [plotAreaSqft])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-relume-border bg-white p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-relume-ink">Plot estimator</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-relume-ink">Estimate cost band by plot size</h2>
          </div>
          <div className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${costBand.tone}`}>
            {costBand.label}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <label htmlFor="plot-area" className="mb-2 block text-sm font-medium text-relume-muted">
              Plot area (sqft)
            </label>
            <input
              id="plot-area"
              type="number"
              min={300}
              max={10000}
              value={plotAreaSqft}
              onChange={(event) => setPlotAreaSqft(Number(event.target.value) || 0)}
              className="w-full rounded-xl border border-relume-border bg-relume-surface-secondary px-4 py-3 text-relume-ink outline-none transition focus:border-relume-ink focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="rounded-2xl bg-relume-surface-secondary p-5 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-relume-muted">Estimated cost band</p>
            <div className="mt-4 text-3xl font-black tracking-tight text-relume-ink">{costBand.range}</div>
            <p className="mt-3 text-sm leading-6 text-relume-muted">
              Suggested screening range for planning, budgeting, and early contractor alignment.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
