"use client"

import { useState } from 'react'
import {
  DEFAULT_CATCHMENT_RADIUS_KM,
  MAX_CATCHMENT_RADIUS_KM,
  MIN_CATCHMENT_RADIUS_KM,
  catchmentCategories,
  catchmentInclusionDisclosure,
  clampRadiusKm,
  describeCatchment,
} from '../../lib/landintel/proximityCatchment'
import { KM_PER_MILE, kmAndMiles, type DistanceUnit } from '../../lib/units'

export default function ProximityCatchmentPanel() {
  const [radiusKm, setRadiusKm] = useState(DEFAULT_CATCHMENT_RADIUS_KM)
  const [unit, setUnit] = useState<DistanceUnit>('km')

  const summary = describeCatchment({ radiusKm, unit, method: 'straight-line' })
  const { km, mi } = kmAndMiles(radiusKm)

  const setFromKm = (value: number) => setRadiusKm(clampRadiusKm(value))
  const setFromMi = (value: number) => setRadiusKm(clampRadiusKm(value * KM_PER_MILE))

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="proximity-catchment-heading"
      data-proximity-catchment-panel
    >
      <div className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface">
        <div className="grid gap-5 border-b border-relume-border p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.45fr)] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · proximity catchment</p>
              <span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Configurable, UNKNOWN contents</span>
            </div>
            <h2 id="proximity-catchment-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-command sm:text-3xl">
              Set a radius. Nothing inside it is invented.
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">{catchmentInclusionDisclosure}</p>
          </div>
          <div className="rounded-relume border border-relume-ink bg-relume-ink p-4 text-white" aria-label="Catchment radius">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">Current radius</p>
            <p className="mt-2 text-lg font-semibold" data-catchment-radius-readout>{summary.label}</p>
          </div>
        </div>

        <div className="grid gap-4 border-b border-relume-border p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <label className="block text-xs font-semibold text-relume-command" htmlFor="catchment-radius-slider">
            Radius ({MIN_CATCHMENT_RADIUS_KM}{'–'}{MAX_CATCHMENT_RADIUS_KM} km)
            <input
              id="catchment-radius-slider"
              type="range"
              min={MIN_CATCHMENT_RADIUS_KM}
              max={MAX_CATCHMENT_RADIUS_KM}
              step={0.1}
              value={km}
              onChange={(event) => setFromKm(Number(event.target.value))}
              aria-describedby="catchment-km-input catchment-mi-input"
              className="mt-2 min-h-11 w-full"
            />
          </label>
          <label className="block text-xs font-semibold text-relume-command">
            Kilometres
            <input
              id="catchment-km-input"
              type="number"
              min={MIN_CATCHMENT_RADIUS_KM}
              max={MAX_CATCHMENT_RADIUS_KM}
              step={0.1}
              value={Number(km.toFixed(2))}
              onChange={(event) => setFromKm(Number(event.target.value))}
              className="mt-2 min-h-11 w-24 rounded-relume border border-relume-border bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-relume-command">
            Miles
            <input
              id="catchment-mi-input"
              type="number"
              min={0}
              step={0.1}
              value={Number(mi.toFixed(2))}
              onChange={(event) => setFromMi(Number(event.target.value))}
              className="mt-2 min-h-11 w-24 rounded-relume border border-relume-border bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-relume-border p-4 sm:p-6" aria-label="Preferred display unit" data-catchment-unit-toggle>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Display unit</span>
          {(['km', 'mi'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setUnit(option)}
              aria-pressed={unit === option}
              className={`min-h-11 rounded-full border px-4 text-xs font-semibold ${unit === option ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border text-relume-command'}`}
            >
              {option === 'km' ? 'Kilometres' : 'Miles'}
            </button>
          ))}
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3" aria-label="Catchment categories">
          {catchmentCategories.map((category) => (
            <article key={category.id} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4" data-catchment-category={category.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-relume-command">{category.label}</h3>
                <span className="rounded-full border border-relume-border bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-relume-muted">{category.status}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-relume-ink">{category.description}</p>
            </article>
          ))}
        </div>

        <p className="border-t border-relume-border px-4 py-4 text-xs leading-5 text-relume-muted sm:px-6">
          <strong className="text-relume-command">INDICATIVE RADIUS ONLY {'—'} NOT A TRAVEL-TIME ANALYSIS.</strong> Connecting a licensed POI/routing source is required before any category above can show a real count, name or distance.
        </p>
      </div>
    </section>
  )
}
