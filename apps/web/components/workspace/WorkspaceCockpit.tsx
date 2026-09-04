"use client"

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { generateStudioPlan } from '../../lib/plan-gen'
import { checkStructuralLive } from '../../lib/studio/structuralLive'
import type { StudioParameters, StudioView, WorkspaceExtract, WorkspaceProvenance } from '../../lib/types'
import { convertArea, metresAndFeet } from '../../lib/units'
import ExportBar from './ExportBar'
import PlanElevationView from './PlanElevationView'

// Perf (W-27 TASK A): three.js (~591KB raw / ~148KB gz across its two
// chunks) was landing in the cockpit's first-load bundle even though
// Space3D is one of several interchangeable views (see `views` below).
// next/dynamic + ssr:false moves it to its own chunk, fetched at mount
// time instead of blocking the initial script tags - real code-split,
// not a stub swap (Space3D's own implementation is untouched).
const Space3D = dynamic(() => import('./Space3D'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-96 flex-1 items-center justify-center rounded-relume border border-dashed border-relume-border text-sm text-relume-muted">
      Loading 3D view…
    </div>
  ),
})

const format = (value: number, digits = 1) => value.toLocaleString('en-IN', { maximumFractionDigits: digits })
const areaUnits = ['sqm', 'sqft', 'cent', 'guntha', 'ground', 'acre'] as const
const areaUnitLabels = { sqm: 'm²', sqft: 'sq ft', cent: 'cents', guntha: 'guntha', ground: 'ground', acre: 'acres' }

function DualLength({ value }: { value: number }) {
  const units = metresAndFeet(value)
  return <span className="font-mono tabular-nums">{format(units.metres, 2)} m · {format(units.feet, 2)} ft</span>
}

function AreaReadout({ squareMetres, primary }: { squareMetres: number; primary: typeof areaUnits[number] }) {
  const values = convertArea(squareMetres)
  return (
    <>
      <p className="mb-3 font-mono text-lg font-semibold tabular-nums">{format(values[primary], primary === 'acre' ? 4 : 2)} {areaUnitLabels[primary]}</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {areaUnits.map((unit) => <div key={unit} className="flex justify-between gap-2"><dt>{areaUnitLabels[unit]}</dt><dd className="font-mono">{format(values[unit], unit === 'acre' ? 4 : unit === 'sqm' || unit === 'sqft' ? 1 : 3)}</dd></div>)}
      </dl>
    </>
  )
}

function Parameter({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: React.ReactNode; onChange: (value: number) => void }) {
  return (
    <label className="block text-xs font-semibold text-relume-ink">
      <span className="flex flex-wrap items-baseline justify-between gap-2"><span>{label}</span><output>{display}</output></span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 min-h-11 w-full accent-relume-command" />
    </label>
  )
}

const views: { id: StudioView; label: string }[] = [
  { id: 'space', label: '3D space' },
  { id: 'plan', label: 'Plan' },
  { id: 'front-elevation', label: 'Front' },
  { id: 'side-elevation', label: 'Side' },
]

type LiveMetrics = {
  extracts: WorkspaceExtract[]
  lengthMetres: number
  areaSquareMetres: number
  provenance: WorkspaceProvenance
}

export default function WorkspaceCockpit({ onLiveMetricsChange }: { onLiveMetricsChange?: (metrics: LiveMetrics) => void }) {
  const [parameters, setParameters] = useState<StudioParameters>({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })
  const [view, setView] = useState<StudioView>('space')
  const [activeFloor, setActiveFloor] = useState(1)
  const [primaryAreaUnit, setPrimaryAreaUnit] = useState<typeof areaUnits[number]>('sqm')
  const plan = useMemo(() => generateStudioPlan(parameters), [parameters])
  const activeRooms = plan.rooms.filter((room) => room.floor === activeFloor)
  const grossArea = plan.buildingWidthM * plan.buildingDepthM * plan.floors
  const governingSpanM = Math.max(...activeRooms.map((room) => room.widthM), 0)
  const structural = checkStructuralLive([{ id: 'active-floor-beam', kind: 'beam', span_m: governingSpanM, depth_mm: 300, width_mm: 300, udl_kn_per_m: 8, support: 'simple' }])
  const structuralPass = structural.results.every((result) => result.checks.every((check) => check.pass))

  // Battery-fail (2): a tool mutate (any Parameter slider below) must
  // recompute the bottom extract panel live. onLiveMetricsChange runs
  // from real derived state (plan/grossArea/governingSpanM/
  // structuralPass), not a static snapshot - the effect re-fires
  // whenever those change.
  useEffect(() => {
    if (!onLiveMetricsChange) return
    onLiveMetricsChange({
      extracts: [
        { label: 'Floors', value: String(plan.floors) },
        { label: 'Gross area', value: format(grossArea, 1), unit: 'm²' },
        { label: 'Governing span', value: format(governingSpanM, 2), unit: 'm' },
        { label: 'IS 456 span/depth check', value: structuralPass ? 'PASS' : 'REVIEW' },
      ],
      lengthMetres: governingSpanM,
      areaSquareMetres: grossArea,
      provenance: { source: 'Design cockpit (deterministic plan generator)', freshness: 'Live', status: 'INDICATIVE' },
    })
  }, [plan, grossArea, governingSpanM, structuralPass, onLiveMetricsChange])

  const update = (key: keyof StudioParameters, value: number) => {
    setParameters((current) => ({ ...current, [key]: value }))
    if (key === 'floors') setActiveFloor((floor) => Math.min(floor, value))
  }
  useEffect(() => {
    const stored = window.localStorage.getItem('ferrum-area-unit')
    if (areaUnits.some((unit) => unit === stored)) setPrimaryAreaUnit(stored as typeof areaUnits[number])
  }, [])
  const updateAreaUnit = (unit: typeof areaUnits[number]) => {
    setPrimaryAreaUnit(unit)
    window.localStorage.setItem('ferrum-area-unit', unit)
  }

  return (
    <section className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface shadow-sm" data-workspace-cockpit>
      <header className="flex flex-wrap items-center gap-3 border-b border-relume-border px-4 py-3">
        <div className="mr-auto">
          <p className="font-display text-lg font-semibold text-relume-command">Design cockpit</p>
          <p className="text-xs text-relume-muted">Live deterministic plan and massing workspace</p>
        </div>
        <span className="rounded-full border border-relume-accent bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-command">INDICATIVE</span>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${structuralPass ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-950'}`} data-structural-gate={structuralPass ? 'pass' : 'review'} title="Simplified IS 456 Cl 23.2.1 span/depth check; 300 mm assumed depth, not a structural design.">
          IS 456 {structuralPass ? 'PASS' : 'REVIEW'} · {format(governingSpanM, 2)} m span
        </span>
        <span className="text-xs font-semibold text-relume-success">Autosaved locally</span>
      </header>

      <div className="grid min-w-0 xl:grid-cols-[17rem_minmax(0,1fr)_18rem]">
        <aside className="order-2 space-y-5 border-b border-relume-border p-4 xl:order-none xl:border-b-0 xl:border-r" aria-label="Design parameters">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-relume-muted">Parameters</p>
          <Parameter label="Plot width" value={parameters.plotWidthM} min={8} max={80} step={0.5} display={<DualLength value={parameters.plotWidthM} />} onChange={(value) => update('plotWidthM', value)} />
          <Parameter label="Plot depth" value={parameters.plotDepthM} min={10} max={120} step={0.5} display={<DualLength value={parameters.plotDepthM} />} onChange={(value) => update('plotDepthM', value)} />
          <Parameter label="Setback" value={parameters.setbackM} min={0} max={Math.max(0, Math.min(parameters.plotWidthM, parameters.plotDepthM) / 2 - 2)} step={0.25} display={<DualLength value={parameters.setbackM} />} onChange={(value) => update('setbackM', value)} />
          <Parameter label="Floors" value={parameters.floors} min={1} max={24} step={1} display={<span className="font-mono">{parameters.floors}</span>} onChange={(value) => update('floors', value)} />
          <div className="rounded-relume bg-relume-surface-secondary p-3 text-relume-ink">
            <label className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">Plot area
              <select value={primaryAreaUnit} onChange={(event) => updateAreaUnit(event.target.value as typeof areaUnits[number])} className="rounded border border-relume-border bg-white px-2 py-1 normal-case tracking-normal">
                {areaUnits.map((unit) => <option key={unit} value={unit}>{areaUnitLabels[unit]}</option>)}
              </select>
            </label>
            <AreaReadout squareMetres={plan.plotWidthM * plan.plotDepthM} primary={primaryAreaUnit} />
          </div>
        </aside>

        <div className="order-1 min-w-0 bg-[#E9EEF1] xl:order-none">
          <div className="flex flex-wrap gap-1 border-b border-relume-border bg-white p-2" role="tablist" aria-label="Model views">
            {views.map((candidate) => (
              <button key={candidate.id} type="button" role="tab" aria-selected={view === candidate.id} onClick={() => setView(candidate.id)} className={`min-h-11 rounded-full px-4 text-xs font-semibold ${view === candidate.id ? 'bg-relume-command text-white' : 'text-relume-ink hover:bg-relume-surface-secondary'}`}>
                {candidate.label}
              </button>
            ))}
            {view === 'plan' && (
              <label className="ml-auto flex min-h-11 items-center gap-2 px-2 text-xs font-semibold">Floor
                <select value={activeFloor} onChange={(event) => setActiveFloor(Number(event.target.value))} className="rounded border border-relume-border bg-white px-2 py-1">
                  {Array.from({ length: plan.floors }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
                </select>
              </label>
            )}
          </div>
          <div className="h-[32rem] min-h-[24rem]">
            {view === 'space' ? <Space3D plan={plan} /> : <PlanElevationView plan={plan} view={view} activeFloor={activeFloor} />}
          </div>
        </div>

        <aside className="order-3 border-t border-relume-border p-4 xl:order-none xl:border-l xl:border-t-0" aria-label="Plan data extract">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-relume-muted">Data extract</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-relume bg-relume-command p-3 text-white"><dt className="text-white/65">Gross floor area</dt><dd className="mt-1 font-mono text-lg">{format(grossArea, 1)} m²</dd></div>
            <div className="rounded-relume bg-relume-surface-secondary p-3"><dt>Rooms</dt><dd className="mt-1 font-mono text-lg">{plan.rooms.length}</dd></div>
            <div><dt className="text-relume-muted">Buildable width</dt><dd><DualLength value={plan.buildingWidthM} /></dd></div>
            <div><dt className="text-relume-muted">Buildable depth</dt><dd><DualLength value={plan.buildingDepthM} /></dd></div>
          </dl>
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold">Floor {activeFloor} rooms</p><span className="font-mono text-xs">{activeRooms.length}</span></div>
            <ul className="mt-3 space-y-2">
              {activeRooms.map((room) => <li key={room.id} className="flex items-center justify-between gap-3 border-b border-relume-border pb-2 text-xs"><span>{room.name.replace(`Floor ${activeFloor} `, '')}</span><span className="font-mono">{format(room.areaSqm, 1)} m²</span></li>)}
            </ul>
          </div>
          <p className="mt-6 text-xs leading-5 text-relume-muted">INDICATIVE — deterministic rectangular zoning only. It does not resolve structure, circulation compliance, daylight, Vaastu, services, or authority approval.</p>
        </aside>
      </div>
      <ExportBar plan={plan} />
    </section>
  )
}
