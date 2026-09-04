"use client"

import { useEffect, useMemo, useState } from "react"
import { computeNpv, estimateIrr } from "../../lib/finance/irrNpv"
import { SAMPLE_BRAND_MULTIPLIERS } from "../../lib/analysis/sampleData"
import { SAMPLE_DCR_FAR_RULESETS } from "../../lib/parcelIntel/sampleRulesets"
import type { LandUse } from "../../lib/parcelIntel/types"
import { SvgGeometryExporter } from "../../lib/providers/GeometryExporter"
import { computeFerrumRate } from "../../lib/rateEngine/ferrumRateEngine"
import { checkStructuralLive } from "../../lib/studio/structuralLive"
import { convertArea, metresAndFeet, type AreaUnit } from "../../lib/units"
import ParcelMap from "./ParcelMap"
import { PrimaryButton } from "./Buttons"
import DxfExportButton from "./DxfExportButton"

export type ForecastProduct =
  | "landintel"
  | "designstudio"
  | "structura"
  | "boq-pro"
  | "promarket"
  | "procurehub"
  | "investflow"

const areaUnitLabels: Record<AreaUnit, string> = {
  sqm: "m²",
  sqft: "sq ft",
  cent: "cents",
  guntha: "guntha",
  ground: "ground",
  acre: "acres",
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("en-IN", { maximumFractionDigits })
}

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function HonestyChip({ children = "INDICATIVE" }: { children?: string }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-relume-accent bg-orange-50 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
      {children}
    </span>
  )
}

function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  display: string
  onChange: (value: number) => void
}) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-relume-ink">
      <span className="flex items-baseline justify-between gap-4">
        <span>{label}</span>
        <output htmlFor={id} className="font-mono text-xs tabular-nums text-relume-muted">{display}</output>
      </span>
      <input
        id={id}
        data-forecast-slider={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-relume-command"
      />
    </label>
  )
}

function ForecastShell({
  title,
  note,
  controls,
  results,
  touched,
}: {
  title: string
  note: string
  controls: React.ReactNode
  results: React.ReactNode
  touched: boolean
}) {
  return (
    <section data-forecast-module={title} className="rounded-relume border border-relume-border bg-relume-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-relume-muted">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-success">Live</span>
          <HonestyChip />
        </div>
      </div>
      <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 space-y-5">{controls}</div>
        <div aria-live="polite" className="command-surface min-w-0 rounded-relume border p-5">{results}</div>
      </div>
      <p className="mt-4 text-xs leading-5 text-relume-muted">{note}</p>
      {touched && (
        <div className="mt-5" data-forecast-cta>
          <PrimaryButton href="/signup">Continue with this scenario</PrimaryButton>
        </div>
      )}
    </section>
  )
}

function usePreferredAreaUnit() {
  const [unit, setUnit] = useState<AreaUnit>("sqm")
  useEffect(() => {
    const stored = window.localStorage.getItem("ferrum-area-unit") as AreaUnit | null
    if (stored && stored in areaUnitLabels) setUnit(stored)
  }, [])
  const update = (next: AreaUnit) => {
    setUnit(next)
    window.localStorage.setItem("ferrum-area-unit", next)
  }
  return [unit, update] as const
}

function AreaResult({ areaSqm, preferred }: { areaSqm: number; preferred: AreaUnit }) {
  const values = convertArea(areaSqm)
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-white/70">Built-up potential</p>
      <p data-forecast-result className="mt-2 break-words font-mono text-3xl font-semibold tabular-nums text-white sm:text-4xl">
        {formatNumber(values[preferred])} {areaUnitLabels[preferred]}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-white/80">
        {(Object.keys(areaUnitLabels) as AreaUnit[]).map((unit) => (
          <div key={unit} className="flex justify-between gap-2 border-b border-white/15 py-1">
            <dt>{areaUnitLabels[unit]}</dt>
            <dd className="font-mono tabular-nums">{formatNumber(values[unit])}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function LandIntelForecast() {
  const [area, setArea] = useState(1200)
  const [landUseIndex, setLandUseIndex] = useState(0)
  const [touched, setTouched] = useState(false)
  const [preferred, setPreferred] = usePreferredAreaUnit()
  const [preview, setPreview] = useState({ lat: 22.5, lng: 79 })
  const landUses: LandUse[] = ["Residential", "Commercial", "Mixed Use", "Industrial", "Institutional"]
  const landUse = landUses[landUseIndex]
  const rule = SAMPLE_DCR_FAR_RULESETS.Karnataka.land_use_rules[landUse]!
  const builtUp = area * rule.far
  const footprint = area * (rule.max_coverage_pct / 100)

  useEffect(() => {
    setPreview({ lat: 8 + Math.random() * 27, lng: 68 + Math.random() * 29 })
  }, [])

  return (
    <ForecastShell
      title="Land-use forecast"
      touched={touched}
      note="INDICATIVE — calculations use the repository's 2026.1-SAMPLE Karnataka DCR/FAR structure, not a published BBMP/BDA rule or parcel entitlement. The map is a random India preview, not parcel geometry."
      controls={<>
        <RangeControl id="land-area" label="Plot area" value={area} min={100} max={10000} step={50} display={`${formatNumber(area)} m² · ${formatNumber(convertArea(area).sqft, 0)} sq ft`} onChange={(value) => { setArea(value); setTouched(true) }} />
        <RangeControl id="land-use" label="Land use" value={landUseIndex} min={0} max={landUses.length - 1} display={landUse} onChange={(value) => { setLandUseIndex(value); setTouched(true) }} />
        <label className="block text-sm text-relume-ink">Primary area unit
          <select value={preferred} onChange={(event) => setPreferred(event.target.value as AreaUnit)} className="mt-2 w-full rounded-relume border border-relume-border bg-white px-3 py-2">
            {(Object.keys(areaUnitLabels) as AreaUnit[]).map((unit) => <option key={unit} value={unit}>{areaUnitLabels[unit]}</option>)}
          </select>
        </label>
        <div className="overflow-hidden rounded-relume border border-relume-border">
          <ParcelMap lat={preview.lat} lng={preview.lng} zoom={4} label="Random India preview — not a parcel or lookup result" />
        </div>
      </>}
      results={<>
        <AreaResult areaSqm={builtUp} preferred={preferred} />
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/80">
          <p>Sample FAR <strong className="block font-mono text-xl text-white">{rule.far}</strong></p>
          <p>Coverage cap <strong className="block font-mono text-xl text-white">{rule.max_coverage_pct}%</strong></p>
          <p className="col-span-2">Footprint cap <strong className="font-mono text-white">{formatNumber(footprint)} m² / {formatNumber(convertArea(footprint).sqft, 0)} sq ft</strong></p>
        </div>
      </>}
    />
  )
}

function setbackForCoverage(width: number, depth: number, coverage: number) {
  let low = 0
  let high = Math.min(width, depth) / 2
  for (let i = 0; i < 30; i += 1) {
    const middle = (low + high) / 2
    const achieved = ((width - 2 * middle) * (depth - 2 * middle)) / (width * depth)
    if (achieved > coverage / 100) low = middle
    else high = middle
  }
  return (low + high) / 2
}

function DesignStudioForecast() {
  const [floors, setFloors] = useState(4)
  const [coverage, setCoverage] = useState(55)
  const [styleIndex, setStyleIndex] = useState(0)
  const [touched, setTouched] = useState(false)
  const styles = ["Contemporary", "Modern", "Regular"]
  const plotWidth = 20
  const plotDepth = 30
  const setback = setbackForCoverage(plotWidth, plotDepth, coverage)
  const result = useMemo(() => new SvgGeometryExporter().testfit({ plot_width_m: plotWidth, plot_depth_m: plotDepth, floors, setback_m: setback }), [floors, setback])
  const fsi = result.floor_area_sqm / (plotWidth * plotDepth)
  const dims = metresAndFeet(plotWidth)

  return (
    <ForecastShell
      title="Live massing forecast"
      touched={touched}
      note="INDICATIVE — the existing test-fit engine runs on a fixed 20 × 30 m (65.62 × 98.43 ft) sample plot. Style changes diagram treatment only; S3 owns buildable style parameters. Verify all local controls."
      controls={<>
        <RangeControl id="design-floors" label="Floors" value={floors} min={1} max={12} display={`${floors}`} onChange={(value) => { setFloors(value); setTouched(true) }} />
        <RangeControl id="design-coverage" label="Coverage" value={coverage} min={30} max={75} display={`${coverage}%`} onChange={(value) => { setCoverage(value); setTouched(true) }} />
        <RangeControl id="design-style" label="Diagram style" value={styleIndex} min={0} max={styles.length - 1} display={styles[styleIndex]} onChange={(value) => { setStyleIndex(value); setTouched(true) }} />
        <p className="text-xs text-relume-muted">Plot width: {plotWidth} m / {formatNumber(dims.feet)} ft · uniform setback: {formatNumber(setback)} m / {formatNumber(metresAndFeet(setback).feet)} ft</p>
      </>}
      results={<div className="grid gap-5 sm:grid-cols-[9rem_1fr] sm:items-center">
        <svg viewBox="0 0 160 180" role="img" aria-label={`${styles[styleIndex]} ${floors}-floor indicative massing`} className="h-44 w-full text-white">
          <path d="M20 150L82 116l58 30-62 34z" fill="rgba(255,255,255,.08)" stroke="currentColor" />
          {Array.from({ length: Math.min(floors, 8) }, (_, index) => {
            const y = 132 - index * 13
            return <g key={index}><path d={`M38 ${y}L82 ${y - 24}l42 21-44 25z`} fill={styleIndex === 1 ? "rgba(255,153,51,.32)" : "rgba(255,255,255,.14)"} stroke="currentColor" /><path d={`M38 ${y}v12l42 22v-12zM80 ${y + 1}l44-25v12l-44 25z`} fill="rgba(255,255,255,.06)" stroke="currentColor" /></g>
          })}
        </svg>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/70">Floor area</p>
          <p data-forecast-result className="mt-2 font-mono text-3xl font-semibold tabular-nums text-white">{formatNumber(result.floor_area_sqm)} m²</p>
          <p className="mt-1 font-mono text-sm text-white/75">{formatNumber(convertArea(result.floor_area_sqm).sqft, 0)} sq ft</p>
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-white/70">Achieved FSI</p>
          <p className="font-mono text-2xl font-semibold text-white">{formatNumber(fsi)}</p>
          <p className="mt-2 font-mono text-xs text-white/70">Diagram variant {styleIndex + 1}/3</p>
          <div className="mt-5 [&_button]:border-white/30 [&_button]:text-white [&_button:hover]:bg-white [&_button:hover]:text-relume-command">
            <DxfExportButton plot_width_m={plotWidth} plot_depth_m={plotDepth} setback_m={setback} filename="designstudio-forecast.dxf" />
          </div>
        </div>
      </div>}
    />
  )
}

function StructuraForecast() {
  const [span, setSpan] = useState(5)
  const [load, setLoad] = useState(18)
  const [touched, setTouched] = useState(false)
  const result = checkStructuralLive([{ id: "hero-beam", kind: "beam", span_m: span, depth_mm: 300, width_mm: 300, udl_kn_per_m: load, support: "simple" }])
  const check = result.results[0].checks[0]
  const ratio = (span * 1000) / 300
  return (
    <ForecastShell
      title="IS 456 constraint forecast"
      touched={touched}
      note="INDICATIVE — simplified IS 456 Cl 23.2.1 span/depth check on a fixed 300 mm deep simply supported beam. UDL is recorded for context only; the current engine has no stiffness input and does not compute load-based deflection or capacity. Not a structural design or sign-off."
      controls={<>
        <RangeControl id="structure-span" label="Beam span" value={span} min={3} max={9} step={0.25} display={`${formatNumber(span)} m · ${formatNumber(metresAndFeet(span).feet)} ft`} onChange={(value) => { setSpan(value); setTouched(true) }} />
        <RangeControl id="structure-load" label="Recorded UDL" value={load} min={5} max={40} display={`${load} kN/m`} onChange={(value) => { setLoad(value); setTouched(true) }} />
      </>}
      results={<>
        <p className="text-xs uppercase tracking-[0.14em] text-white/70">Simplified result</p>
        <p data-forecast-result className={`mt-2 font-mono text-4xl font-semibold ${check.pass ? "text-white" : "text-orange-300"}`}>{check.pass ? "PASS" : "REVIEW"}</p>
        <dl className="mt-6 space-y-3 text-sm text-white/80">
          <div className="flex justify-between gap-4"><dt>Span/depth</dt><dd className="font-mono text-white">{formatNumber(ratio, 1)} / 20</dd></div>
          <div className="flex justify-between gap-4"><dt>Recorded UDL</dt><dd className="font-mono text-white">{load} kN/m</dd></div>
          <div className="flex justify-between gap-4"><dt>Engine checks</dt><dd className="font-mono text-white">{result.results[0].checks.length}</dd></div>
        </dl>
      </>}
    />
  )
}

function BoqForecast() {
  const [area, setArea] = useState(1200)
  const [gradeIndex, setGradeIndex] = useState(1)
  const [touched, setTouched] = useState(false)
  const grades = ["Economy", "Standard", "Premium"] as const
  const gradeKeys = ["economy", "standard", "premium"] as const
  const multiplier = SAMPLE_BRAND_MULTIPLIERS[gradeKeys[gradeIndex]]
  const material = 400 * area * multiplier
  const labour = 800 * area * multiplier
  const gst = (material + labour) * 0.18
  const total = material + labour + gst
  return (
    <ForecastShell
      title="BOQ scenario forecast"
      touched={touched}
      note="INDICATIVE — reuses Mode 3's existing custom assumptions of ₹400 material + ₹800 labour per modeled area unit, its 18% GST calculation, and the Analysis Engine's sample grade multipliers. These are scenario inputs, not a measured BOQ or market quotation."
      controls={<>
        <RangeControl id="boq-area" label="Built-up scenario" value={area} min={100} max={5000} step={50} display={`${formatNumber(area)} m² · ${formatNumber(convertArea(area).sqft, 0)} sq ft`} onChange={(value) => { setArea(value); setTouched(true) }} />
        <RangeControl id="boq-grade" label="Sample grade" value={gradeIndex} min={0} max={grades.length - 1} display={`${grades[gradeIndex]} · ×${multiplier}`} onChange={(value) => { setGradeIndex(value); setTouched(true) }} />
      </>}
      results={<>
        <p className="text-xs uppercase tracking-[0.14em] text-white/70">Scenario total</p>
        <p data-forecast-result className="mt-2 font-mono text-3xl font-semibold tabular-nums text-white sm:text-4xl">{formatInr(total)}</p>
        <div className="mt-6 space-y-3 text-sm text-white/80">
          {[{ label: "Material", value: material }, { label: "Labour", value: labour }, { label: "GST (18%)", value: gst }].map((row) => <div key={row.label} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3"><span>{row.label}</span><span className="h-2 overflow-hidden rounded-full bg-white/15"><span className="block h-full bg-relume-accent" style={{ width: `${(row.value / total) * 100}%` }} /></span><span className="font-mono text-xs text-white">{formatInr(row.value)}</span></div>)}
        </div>
      </>}
    />
  )
}

function PriceBandForecast({ product }: { product: "promarket" | "procurehub" }) {
  const [quantity, setQuantity] = useState(50)
  const [touched, setTouched] = useState(false)
  const band = computeFerrumRate(420, 415, 405, "buyer").band
  const title = product === "promarket" ? "Verified-pro rate scenario" : "Material price scenario"
  return (
    <ForecastShell
      title={title}
      touched={touched}
      note="INDICATIVE — computed from the repository's three seeded cement-rate samples (₹420/₹415/₹405 per 50 kg bag), not live professional, supplier, inventory, or market data."
      controls={<RangeControl id={`${product}-quantity`} label="Cement quantity" value={quantity} min={1} max={500} display={`${quantity} bags · ${formatNumber(quantity * 50 / 1000)} t`} onChange={(value) => { setQuantity(value); setTouched(true) }} />}
      results={<>
        <p className="text-xs uppercase tracking-[0.14em] text-white/70">Seeded price band</p>
        <p data-forecast-result className="mt-2 font-mono text-3xl font-semibold tabular-nums text-white sm:text-4xl">{formatInr(band.p50 * quantity)}</p>
        <div className="mt-6 flex items-center gap-3 text-xs text-white/75"><span>P25 {formatInr(band.p25 * quantity)}</span><span className="h-px flex-1 bg-white/25" /><span>P75 {formatInr(band.p75 * quantity)}</span></div>
        <p className="mt-4 text-sm text-white/80">Median unit rate <span className="font-mono text-white">{formatInr(band.p50)}/bag</span></p>
      </>}
    />
  )
}

function InvestFlowForecast() {
  const [ticket, setTicket] = useState(1_000_000)
  const [tenure, setTenure] = useState(4)
  const [touched, setTouched] = useState(false)
  const sampleReturns = [0.3, 0.4, 0.5, 0.6]
  const flows = [-ticket, ...sampleReturns.slice(0, tenure).map((ratio) => ticket * ratio)]
  const irr = estimateIrr(flows)
  const npv = computeNpv(flows, 0.1)
  return (
    <ForecastShell
      title="IRR / NPV forecast"
      touched={touched}
      note="INDICATIVE — scales the existing four-period sample cash-flow pattern (−1.0, +0.3, +0.4, +0.5, +0.6) to the selected ticket and truncates it at the selected tenure. Discount rate is fixed at the existing 10% sample. Not investment advice or an offer."
      controls={<>
        <RangeControl id="invest-ticket" label="Scenario ticket" value={ticket} min={500000} max={20000000} step={500000} display={formatInr(ticket)} onChange={(value) => { setTicket(value); setTouched(true) }} />
        <RangeControl id="invest-tenure" label="Sample tenure" value={tenure} min={1} max={4} display={`${tenure} period${tenure === 1 ? "" : "s"}`} onChange={(value) => { setTenure(value); setTouched(true) }} />
      </>}
      results={<>
        <p className="text-xs uppercase tracking-[0.14em] text-white/70">Sample IRR</p>
        <p data-forecast-result className="mt-2 font-mono text-4xl font-semibold tabular-nums text-white">{irr === null ? "N/A" : `${formatNumber(irr * 100)}%`}</p>
        <p className="mt-5 text-xs uppercase tracking-[0.14em] text-white/70">NPV at 10%</p>
        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">{formatInr(npv)}</p>
        <p className="mt-5 break-words font-mono text-xs text-white/70">{flows.map((flow) => formatInr(flow)).join(" · ")}</p>
      </>}
    />
  )
}

export default function SteppedForecastModule({ product }: { product: ForecastProduct }) {
  if (product === "landintel") return <LandIntelForecast />
  if (product === "designstudio") return <DesignStudioForecast />
  if (product === "structura") return <StructuraForecast />
  if (product === "boq-pro") return <BoqForecast />
  if (product === "investflow") return <InvestFlowForecast />
  return <PriceBandForecast product={product} />
}
