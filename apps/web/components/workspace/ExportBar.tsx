"use client"

import { useEffect, useState } from 'react'
import { writeDxf } from '../../lib/dxf/writeDxf'
import { exportMassingToIfc } from '../../lib/ifc-export'
import type { StudioPlan } from '../../lib/types'
import { openingSegments } from '../../lib/workspace/openings'

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
    const lines = (plan.openings ?? []).filter((opening) => opening.floor === 1).flatMap((opening) => {
      const room = plan.rooms.find((candidate) => candidate.id === opening.roomId)
      if (!room) return []
      const layer = opening.kind === 'door' ? 'DOORS' : 'WINDOWS'
      return openingSegments(opening, room).map((segment) => ({ layer, x1: plan.setbackM + segment.x1, y1: plan.setbackM + segment.y1, x2: plan.setbackM + segment.x2, y2: plan.setbackM + segment.y2 }))
    })
    download(writeDxf({ rects, lines }), 'application/dxf', 'ferrum-plan.dxf')
    setStatus(`DXF exported with ${rects.length - 1} ground-floor rooms and ${lines.length} opening segments on DOORS/WINDOWS layers.`)
  }

  const exportIfc = () => {
    const floors = Math.max(1, Math.round(plan.floors))
    const bytes = exportMassingToIfc({
      plot_width_m: plan.plotWidthM,
      plot_depth_m: plan.plotDepthM,
      floors,
      floor_height_m: plan.floorHeightM,
    })
    // Uint8Array.from() copies into a plain (non-generic/non-shared)
    // ArrayBuffer-backed view — BlobPart's DOM typing rejects the
    // ArrayBufferLike-generic Uint8Array that TextEncoder.encode() (inside
    // exportMassingToIfc) returns.
    download(Uint8Array.from(bytes), 'model/ifc', 'ferrum-plan.ifc')
    setStatus(`IFC4 exported with ${floors} storey(s) — ${floors * 4} walls, ${floors} slabs, ${floors} spaces.`)
  }

  useEffect(() => {
    const handleCommand = (event: Event) => {
      const text = String((event as CustomEvent<string>).detail ?? '')
      if (/export dxf/i.test(text)) exportDxf()
      if (/export ifc/i.test(text)) exportIfc()
    }
    window.addEventListener('ferrum:workspace-command', handleCommand)
    return () => window.removeEventListener('ferrum:workspace-command', handleCommand)
  })

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-white/15 bg-relume-command px-4 py-3 text-white" data-export-bar>
      <span className="mr-auto text-xs text-white/70" aria-live="polite">{status}</span>
      <button type="button" onClick={exportDxf} data-export-dxf className="min-h-11 rounded-full border border-white/30 px-4 text-sm font-semibold hover:bg-white hover:text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        Export DXF
      </button>
      <button type="button" onClick={exportIfc} data-export-ifc className="min-h-11 rounded-full border border-white/30 px-4 text-sm font-semibold hover:bg-white hover:text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        Export IFC
      </button>
    </div>
  )
}
