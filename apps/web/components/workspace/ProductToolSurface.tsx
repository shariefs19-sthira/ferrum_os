"use client"

import type { ReactNode } from 'react'
import { resolveProductSurface, type ProductToolKey } from '../../lib/workspace/productSurface'
import type { ProductControlId } from '../../lib/workspace/controlRegistry'
import UlpinMapExplorer from '../sections/UlpinMapExplorer'
import IsCheckWidget from '../sections/IsCheckWidget'
import SteppedForecastModule from '../sections/SteppedForecastModule'
import IrrNpvModeler from '../sections/IrrNpvModeler'
import StampDutyEstimator from '../sections/StampDutyEstimator'
import AskBandEstimator from '../sections/AskBandEstimator'

// Existing live product components only -- nothing here computes or fabricates
// a result. A product with no entry in lib/workspace/productSurface.ts's live
// tool map never reaches this table.
const liveTools: Record<ProductToolKey, () => ReactNode> = {
  'ulpin-lookup': () => <UlpinMapExplorer />,
  'is-check': () => <IsCheckWidget />,
  'boq-cost-split': () => <SteppedForecastModule product="boq-pro" />,
  'rate-comparison': () => <SteppedForecastModule product="promarket" />,
  'irr-npv': () => <IrrNpvModeler />,
  'stamp-duty-ask-band': () => <><StampDutyEstimator /><div className="mt-4"><AskBandEstimator /></div></>,
}

/**
 * The selected product's real cockpit tool, or -- when it has none -- a
 * truthful ROADMAP statement with no action. Docked beside the canvas at `lg`
 * (never over it); below `lg` it is a dismissible task sheet opened from the
 * toolbar, so the central preview stays unobscured until the user asks.
 */
export default function ProductToolSurface({ product, mobileOpen = false, onMobileClose }: { product: ProductControlId; mobileOpen?: boolean; onMobileClose?: () => void }) {
  const surface = resolveProductSurface(product)
  const live = surface.state === 'LIVE' && surface.tool !== null
  return <aside
    className={`${mobileOpen ? 'fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-[80] block max-h-[min(82dvh,40rem)] overflow-y-auto rounded-relume shadow-xl lg:static lg:z-auto lg:max-h-none lg:rounded-none lg:shadow-none' : 'hidden'} border border-relume-border bg-white lg:relative lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:block lg:min-h-0 lg:border-y-0 lg:border-r-0`}
    aria-label={`${surface.label} tool`}
    role={mobileOpen ? 'dialog' : undefined}
    aria-modal={mobileOpen ? 'true' : undefined}
    data-product-tool-surface={product}
    data-tool-state={surface.state}
    data-mobile-sheet={mobileOpen ? 'tool' : undefined}
  >
    <div className="lg:absolute lg:inset-0 lg:overflow-y-auto">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">{surface.label}</p>
            <h2 className="mt-1 text-sm font-semibold text-relume-command" data-active-tool>{live ? surface.tool?.title : 'No live tool yet'}</h2>
          </div>
          <span className="shrink-0 rounded-full border border-relume-accent bg-orange-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink" data-evidence-state={surface.evidenceState}>{surface.evidenceState}</span>
        </div>
        {mobileOpen && <button type="button" onClick={onMobileClose} className="mt-3 min-h-11 rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-command lg:hidden">Close</button>}
        <p className="mt-2 text-xs leading-5 text-relume-muted">{surface.lens}</p>

        {live && surface.tool ? <div className="mt-4 [&_[data-forecast-grid]]:!grid-cols-1" data-live-tool={surface.tool.key}>{liveTools[surface.tool.key]()}</div> : <div className="mt-4 rounded-relume border border-dashed border-relume-border p-3" data-roadmap-state>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-command">ROADMAP</p>
          <p className="mt-2 text-xs leading-5 text-relume-ink">No live tool exists for this product yet. Nothing here is computed, and there is no action to run.</p>
        </div>}

        <p className="mt-4 text-[10px] leading-4 text-relume-muted">{surface.provenance}</p>

        {surface.roadmap.length > 0 && <details className="mt-4 rounded-relume border border-relume-border p-3" data-roadmap-list>
          <summary className="cursor-pointer text-xs font-semibold text-relume-command">ROADMAP capabilities ({surface.roadmap.length}) — not built</summary>
          <ul className="mt-3 space-y-2">
            {surface.roadmap.map((feature) => <li key={feature.id} className="text-xs leading-5" data-roadmap-feature={feature.id}><span className="font-semibold">{feature.title}</span> <span className="rounded-full bg-relume-surface-secondary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-relume-muted">ROADMAP</span></li>)}
          </ul>
        </details>}
      </div>
    </div>
  </aside>
}
