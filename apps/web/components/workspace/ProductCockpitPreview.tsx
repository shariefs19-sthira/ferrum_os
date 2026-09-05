"use client"

import { useCallback, useState, type ReactNode } from 'react'
import type { StudioParameters } from '../../lib/types'
import WorkspaceCockpit from './WorkspaceCockpit'
import type { ProductControlId } from '../../lib/workspace/controlRegistry'
import FullscreenController from './FullscreenController'

export type CockpitProduct = ProductControlId

const presets: Record<CockpitProduct, StudioParameters> = {
  landintel: { plotWidthM: 24, plotDepthM: 40, setbackM: 3, floors: 4 },
  designstudio: { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 },
  structura: { plotWidthM: 18, plotDepthM: 28, setbackM: 2, floors: 4 },
  'boq-pro': { plotWidthM: 25, plotDepthM: 36, setbackM: 2.5, floors: 5 },
  promarket: { plotWidthM: 16, plotDepthM: 24, setbackM: 1.5, floors: 3 },
  buildos: { plotWidthM: 30, plotDepthM: 45, setbackM: 3, floors: 6 },
  procurehub: { plotWidthM: 22, plotDepthM: 32, setbackM: 2, floors: 4 },
  investflow: { plotWidthM: 28, plotDepthM: 42, setbackM: 3, floors: 7 },
  communitybuild: { plotWidthM: 32, plotDepthM: 48, setbackM: 3.5, floors: 5 },
  transact: { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 },
}

export default function ProductCockpitPreview({ product, label, children }: { product: CockpitProduct; label: string; children?: ReactNode }) {
  const [parameters, setParameters] = useState<StudioParameters>(presets[product])
  const persistHandoff = useCallback(() => {
    window.localStorage.setItem('ferrum-cockpit-handoff', JSON.stringify({ version: 1, source: product, parameters }))
    window.localStorage.setItem('ferrum-preview-session', 'active')
  }, [parameters, product])

  return (
    <div className="min-w-0" data-product-cockpit={product}>
      {children && <div className="mb-4" data-product-live-tool={product}>{children}</div>}
      <FullscreenController previewSource={product}>{fullscreen => <WorkspaceCockpit controlProduct={product} initialParameters={presets[product]} onParametersChange={setParameters} previewLabel={label} fullscreenControl={{ active: fullscreen.active, label: 'Open in workspace ⛶', onClick: () => { persistHandoff(); fullscreen.toggle() } }} />}</FullscreenController>
      <div className="mt-3 rounded-relume border border-relume-border bg-white p-3">
        <p className="text-xs text-relume-muted"><strong className="text-relume-command">INDICATIVE</strong> deterministic geometry; verify site, code, and authority constraints.</p>
      </div>
    </div>
  )
}
