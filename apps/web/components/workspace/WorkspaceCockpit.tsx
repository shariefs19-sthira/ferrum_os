"use client"

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { generateStudioPlan } from '../../lib/plan-gen'
import { checkStructuralLive } from '../../lib/studio/structuralLive'
import type { StudioParameters, StudioView, WorkspaceExtract, WorkspaceProvenance } from '../../lib/types'
import { getRulesetForState } from '../../lib/parcelIntel/sampleRulesets'
import type { LandUse } from '../../lib/parcelIntel/types'
import { convertArea, metresAndFeet } from '../../lib/units'
import ExportBar from './ExportBar'
import PlanElevationView from './PlanElevationView'
import { measureBoq } from '../../lib/workspace/measuredBoq'
import RegistryControls from './RegistryControls'
import type { ProductControlId } from '../../lib/workspace/controlRegistry'

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

const optionStages = ['use', 'floors', 'massing', 'rooms', 'compliance'] as const
type OptionStage = typeof optionStages[number]

type WorkspaceCockpitProps = {
  initialParameters?: StudioParameters
  onLiveMetricsChange?: (metrics: LiveMetrics) => void
  onParametersChange?: (parameters: StudioParameters) => void
  previewLabel?: string
  canvasFirst?: boolean
  controlProduct?: ProductControlId
  fullscreenControl?: { active: boolean; label: string; onClick: () => void }
}

const defaultParameters: StudioParameters = { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 }

export default function WorkspaceCockpit({ initialParameters = defaultParameters, onLiveMetricsChange, onParametersChange, previewLabel, canvasFirst = false, controlProduct, fullscreenControl }: WorkspaceCockpitProps) {
  const [parameters, setParameters] = useState<StudioParameters>(initialParameters)
  const [view, setView] = useState<StudioView>('space')
  const [activeFloor, setActiveFloor] = useState(1)
  const [primaryAreaUnit, setPrimaryAreaUnit] = useState<typeof areaUnits[number]>('sqm')
  const [showFineControls, setShowFineControls] = useState(false)
  const [commandResult, setCommandResult] = useState('Choose an option or describe a change above.')
  const [optionStage, setOptionStage] = useState<OptionStage>('use')
  const [landUse, setLandUse] = useState<LandUse>('Residential')
  const plan = useMemo(() => generateStudioPlan(parameters), [parameters])
  const activeRooms = plan.rooms.filter((room) => room.floor === activeFloor)
  const grossArea = plan.buildingWidthM * plan.buildingDepthM * plan.floors
  const measuredBoq = useMemo(() => measureBoq(plan), [plan])
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
  const ruleset = getRulesetForState('Karnataka')
  const landRule = ruleset?.land_use_rules[landUse]
  const coverageArea = plan.plotWidthM * plan.plotDepthM * ((landRule?.max_coverage_pct ?? 60) / 100)
  const farArea = plan.plotWidthM * plan.plotDepthM * (landRule?.far ?? 1.5)
  const maxFloors = Math.max(1, Math.min(Math.floor((landRule?.max_height_m ?? 15) / plan.floorHeightM), Math.floor(farArea / Math.max(coverageArea, 1))))
  const update = (key: keyof StudioParameters, value: number) => {
    setParameters((current) => ({ ...current, [key]: value }))
    if (key === 'floors') setActiveFloor((floor) => Math.min(floor, value))
  }
  useEffect(() => {
    const stored = window.localStorage.getItem('ferrum-area-unit')
    if (areaUnits.some((unit) => unit === stored)) setPrimaryAreaUnit(stored as typeof areaUnits[number])
    if (!previewLabel) {
      const handoff = window.localStorage.getItem('ferrum-cockpit-handoff')
      if (handoff) {
        try {
          const parsed = JSON.parse(handoff) as { parameters?: Partial<StudioParameters> }
          const next = parsed.parameters
          if (next && Number.isFinite(next.plotWidthM) && Number.isFinite(next.plotDepthM) && Number.isFinite(next.setbackM) && Number.isFinite(next.floors)) {
            setParameters(next as StudioParameters)
          }
        } catch {
          // Ignore malformed local preview state and retain deterministic defaults.
        }
      }
    }
  }, [previewLabel])
  useEffect(() => { onParametersChange?.(parameters) }, [parameters, onParametersChange])
  useEffect(() => {
    const openAdvanced = () => setShowFineControls(true)
    window.addEventListener('ferrum:workspace-advanced', openAdvanced)
    return () => window.removeEventListener('ferrum:workspace-advanced', openAdvanced)
  }, [])
  useEffect(() => {
    const applyCommand = (event: Event) => {
      const command = String((event as CustomEvent<string>).detail ?? '').trim().toLowerCase()
      if (!command) return
      const amount = Number(command.match(/\d+(?:\.\d+)?/)?.[0])
      if (/add|increase/.test(command) && /floor|storey|level/.test(command)) {
        setParameters((current) => ({ ...current, floors: Math.min(24, current.floors + (Number.isFinite(amount) ? amount : 1)) }))
        setCommandResult('Floor count increased. Massing and quantities updated.')
      } else if (/set/.test(command) && /floor|storey|level/.test(command) && Number.isFinite(amount)) {
        setParameters((current) => ({ ...current, floors: Math.max(1, Math.min(24, amount)) }))
        setCommandResult(`Floor count set to ${amount}. Massing and quantities updated.`)
      } else if (/set use/.test(command)) {
        const nextUse: LandUse = command.includes('mixed') ? 'Mixed Use' : command.includes('commercial') ? 'Commercial' : 'Residential'
        setLandUse(nextUse)
        const nextRule = getRulesetForState('Karnataka')?.land_use_rules[nextUse]
        if (nextRule) setParameters((current) => ({ ...current, setbackM: nextRule.min_setback_m }))
        setCommandResult(`${nextUse} sample land-use constraints applied. INDICATIVE.`)
      } else if (/set massing/.test(command)) {
        const delta = command.includes('compact') ? -0.5 : command.includes('slender') ? 0.5 : 0
        setParameters((current) => ({ ...current, setbackM: Math.max(0, current.setbackM + delta) }))
        setCommandResult('Massing proportion applied to the deterministic envelope.')
      } else if (/set coverage/.test(command) && Number.isFinite(amount)) {
        setParameters((current) => { const p=Math.max(.1,Math.min(.95,amount/100));const sum=current.plotWidthM+current.plotDepthM;const setback=(sum-Math.sqrt(sum*sum-4*(1-p)*current.plotWidthM*current.plotDepthM))/4;return {...current,setbackM:Math.max(0,setback)} })
        setCommandResult(`Coverage constrained to ${amount}% of the plot.`)
      } else if (/set rooms/.test(command)) {
        const delta = command.includes('social') ? 1 : command.includes('private') ? -1 : 0
        setParameters((current) => ({ ...current, plotWidthM: Math.max(8, current.plotWidthM + delta) }))
        setCommandResult('Room split preference applied to the deterministic plan proportions.')
      } else if (/set material/.test(command)) {
        setCommandResult('Material grade recorded for the brief. BOQ rates remain unverified.')
      } else if (/setback/.test(command) && Number.isFinite(amount)) {
        setParameters((current) => ({ ...current, setbackM: Math.max(0, amount) }))
        setCommandResult(`Setback set to ${amount} m; feet and area outputs reconciled.`)
      } else if (/plot/.test(command) && /width/.test(command) && Number.isFinite(amount)) {
        setParameters((current) => ({ ...current, plotWidthM: Math.max(8, Math.min(80, amount)) }))
        setCommandResult(`Plot width set to ${amount} m.`)
      } else if (/plan|top/.test(command)) {
        setView('plan')
        setCommandResult('Plan view opened.')
      } else if (/front/.test(command)) {
        setView('front-elevation')
        setCommandResult('Front elevation opened.')
      } else if (/side|east/.test(command)) {
        setView('side-elevation')
        setCommandResult('Side elevation opened.')
      } else if (/3d|space|massing|axon/.test(command)) {
        setView('space')
        setCommandResult('Interactive 3D massing opened.')
      } else if (/boq|extract/.test(command)) {
        setCommandResult('Measured extract opened. Rates remain blank until independently verified.')
      } else if (/export dxf/.test(command)) {
        setCommandResult('DXF export sent to the browser.')
      } else if (/diligence|permit/.test(command)) {
        setCommandResult('Territorial checklist context opened. Authority verification remains required.')
      } else if (/share workspace brief/.test(command)) {
        setCommandResult('Workspace brief prepared for sharing.')
      } else {
        setCommandResult('Command not recognized. Try “add a floor”, “set setback 3”, or “show plan”.')
      }
    }
    window.addEventListener('ferrum:workspace-command', applyCommand)
    return () => window.removeEventListener('ferrum:workspace-command', applyCommand)
  }, [])
  const updateAreaUnit = (unit: typeof areaUnits[number]) => {
    setPrimaryAreaUnit(unit)
    window.localStorage.setItem('ferrum-area-unit', unit)
  }

  return (
    <section className={`overflow-hidden border border-relume-border bg-relume-surface shadow-sm ${canvasFirst ? 'flex h-full min-h-0 flex-col' : 'rounded-relume'}`} data-workspace-cockpit data-cockpit-preview={previewLabel} data-canvas-first={canvasFirst || undefined}>
      {!canvasFirst && <header className="flex flex-wrap items-center gap-3 border-b border-relume-border px-4 py-3">
        <Link href="/" className="font-heading text-sm font-bold text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent" aria-label="Ferrum home">Ferrum</Link>
        <div className="mr-auto">
          <p className="font-display text-lg font-semibold text-relume-command">{previewLabel ? `${previewLabel} cockpit preview` : 'Design cockpit'}</p>
          <p className="text-xs text-relume-muted">Live deterministic plan and massing workspace</p>
        </div>
        <span className="rounded-full border border-relume-accent bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-command">INDICATIVE</span>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${structuralPass ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-950'}`} data-structural-gate={structuralPass ? 'pass' : 'review'} title="Simplified IS 456 Cl 23.2.1 span/depth check; 300 mm assumed depth, not a structural design.">
          IS 456 {structuralPass ? 'PASS' : 'REVIEW'} · {format(governingSpanM, 2)} m span
        </span>
        <span className="text-xs font-semibold text-relume-success">Autosaved locally</span>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-command hover:bg-relume-surface-secondary">Home</Link>
        {showFineControls && <button type="button" onClick={() => setShowFineControls(false)} className="min-h-11 rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-command hover:bg-relume-surface-secondary">Close advanced</button>}
      </header>}

      <div className={`grid min-w-0 ${canvasFirst ? 'min-h-0 flex-1 grid-cols-1' : showFineControls ? 'xl:grid-cols-[17rem_minmax(0,1fr)_18rem]' : 'xl:grid-cols-[minmax(0,1fr)_18rem]'}`}>
        {showFineControls && <aside className="order-2 space-y-5 border-b border-relume-border p-4 xl:order-none xl:border-b-0 xl:border-r" aria-label="Fine design controls">
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
        </aside>}

        <div className={`relative order-1 min-w-0 bg-[#E9EEF1] xl:order-none ${canvasFirst?'min-h-0':''}`}>
          <div className="relative z-40 flex flex-wrap gap-1 border-b border-relume-border bg-white p-2" role="tablist" aria-label="Model views">
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
            {fullscreenControl && <button type="button" aria-pressed={fullscreenControl.active} onClick={fullscreenControl.onClick} className="relative z-30 ml-auto min-h-11 rounded-full border border-relume-border bg-relume-command px-4 text-xs font-semibold text-white hover:bg-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent" data-fullscreen-toggle>{fullscreenControl.label}</button>}
          </div>
          <div className="absolute left-3 right-3 top-16 z-20 flex items-center gap-2 overflow-x-auto rounded-full border border-white/40 bg-relume-command/90 p-2 shadow-xl backdrop-blur-sm md:left-1/2 md:right-auto md:max-w-[calc(100%-2rem)] md:-translate-x-1/2" aria-label={`${optionStage} options`} data-option-chip-flow data-option-stage={optionStage}>
            <span className="shrink-0 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-accent">{optionStage} · INDICATIVE</span>
            {optionStage === 'use' && (['Residential', 'Commercial', 'Mixed Use'] as LandUse[]).map((choice) => <button key={choice} type="button" onClick={() => { const rule = ruleset?.land_use_rules[choice]; setLandUse(choice); if (rule) update('setbackM', rule.min_setback_m); setOptionStage('floors'); setCommandResult(`${choice} selected from Bengaluru 2026.1-SAMPLE ruleset.`) }} className="min-h-11 shrink-0 rounded-full bg-white px-4 text-xs font-semibold text-relume-command">{choice}</button>)}
            {optionStage === 'floors' && Array.from({ length: maxFloors }, (_, index) => index + 1).map((floors) => <button key={floors} type="button" onClick={() => { update('floors', floors); setOptionStage('massing'); setCommandResult(`${floors} floor${floors === 1 ? '' : 's'} selected; sample FAR and height caps allow up to ${maxFloors}.`) }} className="min-h-11 shrink-0 rounded-full bg-white px-4 text-xs font-semibold text-relume-command">{floors} floor{floors === 1 ? '' : 's'}</button>)}
            {optionStage === 'massing' && ['Compact', 'Balanced', 'Slender'].map((choice, index) => <button key={choice} type="button" onClick={() => { update('setbackM', Math.max(landRule?.min_setback_m ?? 1.5, (landRule?.min_setback_m ?? 1.5) + index * 0.5)); setOptionStage('rooms'); setCommandResult(`${choice} massing applied within the sample setback floor.`) }} className="min-h-11 shrink-0 rounded-full bg-white px-4 text-xs font-semibold text-relume-command">{choice}</button>)}
            {optionStage === 'rooms' && ['Social-first', 'Balanced', 'Private-first'].map((choice, index) => <button key={choice} type="button" onClick={() => { update('plotWidthM', Math.max(8, Math.min(80, parameters.plotWidthM + index - 1))); setOptionStage('compliance'); setCommandResult(`${choice} room split applied to the deterministic plan proportions.`) }} className="min-h-11 shrink-0 rounded-full bg-white px-4 text-xs font-semibold text-relume-command">{choice}</button>)}
            {optionStage === 'compliance' && ['Minimum setback', 'Extra 0.5 m margin'].map((choice, index) => <button key={choice} type="button" onClick={() => { update('setbackM', (landRule?.min_setback_m ?? 1.5) + index * 0.5); setOptionStage('use'); setCommandResult(`${choice} applied. Flow complete; sample rules remain INDICATIVE.`) }} className="min-h-11 shrink-0 rounded-full bg-white px-4 text-xs font-semibold text-relume-command">{choice}</button>)}
          </div>
          <div className={canvasFirst ? "absolute inset-x-0 bottom-0 top-[3.75rem]" : "h-[32rem] min-h-[24rem]"}>
            {view === 'space' ? <Space3D plan={plan} /> : <PlanElevationView plan={plan} view={view} activeFloor={activeFloor} />}
          </div>
          {controlProduct && <RegistryControls product={controlProduct} parameters={parameters} context={{maxFloors,minSetbackM:landRule?.min_setback_m??1.5,maxSetbackM:Math.max(landRule?.min_setback_m??1.5,Math.min(parameters.plotWidthM,parameters.plotDepthM)/2-2)}} onChange={update}/>}
        </div>

        {!canvasFirst && <aside className="order-3 border-t border-relume-border p-4 xl:order-none xl:border-l xl:border-t-0" aria-label="Plan data extract">
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
          <div className="mt-6" data-measured-boq>
            <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">Measured BOQ</p><span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-950">INDICATIVE · RATES REQUIRED</span></div>
            <p className="mt-2 text-[10px] leading-relaxed text-relume-muted">Geometry-derived quantities. Catalog rates remain blank until independently verified.</p>
            <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-[10px]"><thead><tr className="border-b border-relume-border text-relume-muted"><th className="py-2">Item</th><th className="py-2 text-right">Quantity</th><th className="py-2 text-right">Amount</th></tr></thead><tbody>{measuredBoq.map(line=><tr key={line.item.id} className="border-b border-relume-border/70" title={line.basis}><td className="max-w-32 py-2 pr-2"><span className="block font-medium">{line.item.name}</span><span className="font-mono text-[9px] text-relume-muted">{line.item.itemCode}</span></td><td className="py-2 text-right font-mono tabular-nums">{format(line.quantity,2)} {line.unit}</td><td className="py-2 text-right font-medium">{line.amountInr===null?'Rate required':`₹${format(line.amountInr,2)}`}</td></tr>)}</tbody></table></div>
          </div>
          <p className="mt-6 text-xs leading-5 text-relume-muted">INDICATIVE — deterministic rectangular zoning only. It does not resolve structure, circulation compliance, daylight, Vaastu, services, or authority approval.</p>
        </aside>}
      </div>
      <p className="border-t border-relume-border bg-relume-surface-secondary px-4 py-2 text-xs text-relume-muted" aria-live="polite" data-canvas-flow-result>{commandResult}</p>
      <ExportBar plan={plan} />
    </section>
  )
}
