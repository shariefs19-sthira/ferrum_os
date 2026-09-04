"use client"

import { useState } from 'react'
import { writeDxf } from '../../lib/dxf/writeDxf'
import type { StudioPlan } from '../../lib/types'

function download(data: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function ExportBar({ plan }: { plan: StudioPlan }) {
  const [status, setStatus] = useState('Exports stay on this device.')

  const exportDxf = () => {
    const rects = [
      { layer: 'PLOT', x: 0, y: 0, width: plan.plotWidthM, height: plan.plotDepthM },
      ...plan.rooms.filter((room) => room.floor === 1).map((room) => ({
        layer: `ROOM_${room.id.toUpperCase()}`,
        x: plan.setbackM + room.xM,
        y: plan.setbackM + room.yM,
        width: room.widthM,
        height: room.depthM,
      })),
    ]
    download(writeDxf({ rects }), 'application/dxf', 'ferrum-plan.dxf')
    setStatus(`DXF exported with ${rects.length - 1} ground-floor rooms.`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-white/15 bg-relume-command px-4 py-3 text-white" data-export-bar>
      <span className="mr-auto text-xs text-white/70" aria-live="polite">{status}</span>
      <button type="button" onClick={exportDxf} className="min-h-11 rounded-full border border-white/30 px-4 text-sm font-semibold hover:bg-white hover:text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        Export DXF
      </button>
      <span className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white/65" aria-label="IFC export queued pending browser-safe bundling">
        IFC queued
      </span>
    </div>
  )
}
