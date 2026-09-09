import { useMemo } from 'react'
import { computeInvestmentCase } from '../../lib/analysis/investmentCase'
import { generateStudioPlan } from '../../lib/plan-gen'
import { checkStructuralLive } from '../../lib/studio/structuralLive'
import type { StudioParameters } from '../../lib/types'
import { measureBoq } from '../../lib/workspace/measuredBoq'
import type { CockpitProduct } from './ProductCockpitPreview'
import { useParcelContext } from '../../lib/workspace/parcelContext'

const number = (value: number, digits = 1) => value.toLocaleString('en-IN', { maximumFractionDigits: digits })

export default function CrossProductLiveSummary({ product, parameters }: { product: CockpitProduct; parameters: StudioParameters }) {
  const parcel = useParcelContext()
  const result = useMemo(() => {
    const plan = generateStudioPlan(parameters)
    const grossArea = plan.buildingWidthM * plan.buildingDepthM * plan.floors
    const span = Math.max(...plan.rooms.map((room) => room.widthM), 0)
    const structural = checkStructuralLive([{ id: 'shared-project-beam', kind: 'beam', span_m: span, depth_mm: 300, width_mm: 300, udl_kn_per_m: 8, support: 'simple' }])
    const structurePass = structural.results.every((member) => member.checks.every((check) => check.pass))
    const boq = measureBoq(plan)
    const line = (id: string) => boq.find((item) => item.item.id === id)
    const investment = computeInvestmentCase(grossArea, [{ month: 0, pct_of_total: 0.25 }, { month: 1, pct_of_total: 0.25 }, { month: 2, pct_of_total: 0.25 }, { month: 3, pct_of_total: 0.25 }], 4, grossArea * 1.2, 0.1)
    return { plan, grossArea, span, structurePass, line, investment }
  }, [parameters])

  const rows = product === 'structura'
    ? [['Governing span', `${number(result.span, 2)} m`], ['Indicative check', result.structurePass ? 'PASS' : 'REVIEW']]
    : product === 'boq-pro'
      ? [['RCC slabs', `${number(result.line('rcc-slab')?.quantity ?? 0, 2)} m³`], ['Reinforcement', `${number(result.line('rebar')?.quantity ?? 0, 1)} kg`]]
      : product === 'procurehub'
        ? [['Reinforcement demand', `${number(result.line('rebar')?.quantity ?? 0, 1)} kg`], ['Masonry demand', `${number(result.line('blockwork')?.quantity ?? 0, 2)} m²`]]
        : product === 'investflow'
          ? [['Cashflow basis', `${number(result.grossArea)} area-index units`], ['Base NPV index', number(result.investment.scenarios.find((scenario) => scenario.scenario === 'base')?.npv ?? 0, 2)]]
          : [['Shared gross area', `${number(result.grossArea)} m²`], ['Shared floors', String(result.plan.floors)]]

  return (
    <section className="mb-4 rounded-relume border border-relume-border bg-relume-surface p-4" aria-live="polite" data-cross-product-live={product} data-shared-floors={result.plan.floors} data-shared-gross-area={result.grossArea.toFixed(2)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Shared project · live recompute</p>
        <span className="rounded-full border border-relume-accent px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-relume-command">INDICATIVE</span>
      </div>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => <div key={label} className="rounded-relume bg-relume-surface-secondary p-3"><dt className="text-[10px] uppercase tracking-[0.12em] text-relume-muted">{label}</dt><dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-relume-command">{value}</dd></div>)}
      </dl>
      {parcel ? (
        <div className="mt-3 rounded-relume border border-relume-border p-3" data-parcel-context={parcel.ulpin ?? parcel.method}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Resolved parcel · {parcel.provenance.status}</p>
          <p className="mt-1 text-xs text-relume-command">{parcel.district}, {parcel.state} · {number(parcel.area_sqm)} m² · {parcel.land_use}</p>
          <p className="mt-1 text-[10px] text-relume-muted">{parcel.provenance.source} · {parcel.provenance.vintage}</p>
        </div>
      ) : (
        <p className="mt-3 rounded-relume border border-dashed border-relume-border p-3 text-xs text-relume-muted" data-no-parcel-context>No parcel context — resolve a lookup in LandIntel.</p>
      )}
      <p className="mt-3 text-[10px] leading-4 text-relume-muted">One browser-local project state feeds every product lens. Monetary rates remain blank unless independently verified; Invest uses a normalized area index, not currency.</p>
    </section>
  )
}
