"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ParcelContext } from '../../lib/workspace/parcelContext'
import { buildingShellCatalog, recommendBuildingShells, type BuildingShell } from '../../lib/designstudio/shellCatalog'
import { designStudioRenderStack } from '../../lib/designstudio/renderStack'

type Props = {
  parcel: ParcelContext | null
  selectedShell: BuildingShell
  onSelect: (shell: BuildingShell) => void
}

export default function ShellCatalogPanel({ parcel, selectedShell, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState(false)
  const recommendations = useMemo(() => recommendBuildingShells(parcel, 4), [parcel])
  const primary = recommendations[0]
  const items = expanded ? buildingShellCatalog : recommendations.map((item) => item.shell)

  useEffect(() => setOpen(window.matchMedia('(min-width: 768px)').matches), [])

  return (
    <aside className="absolute left-3 top-40 z-30 w-[min(25rem,calc(100%-1.5rem))] overflow-hidden rounded-relume border border-relume-border bg-white/95 shadow-xl backdrop-blur-sm md:bottom-14 md:top-auto" aria-label="Building shell catalogue" data-shell-catalog>
      <div className={`${open ? 'border-b' : ''} border-relume-border p-3`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">SUTRA · locality fit</p>
            <p className="mt-1 text-sm font-semibold text-relume-command">{parcel ? `${parcel.district}, ${parcel.state}` : 'Parcel context required'}</p>
          </div>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="min-h-11 rounded-full border border-relume-border bg-white px-3 text-[10px] font-semibold text-relume-command">{open ? 'Hide library' : 'Change shell'}</button>
        </div>
        <span className="mt-1 inline-flex rounded-full bg-orange-50 px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-relume-command">INDICATIVE · {selectedShell.name}</span>
        {open && <>
        <p className="mt-2 text-xs leading-5 text-relume-ink" data-sutra-shell-reason>
          {parcel
            ? `${primary?.shell.name ?? selectedShell.name} ranks highest from the recorded region, ${Math.round(parcel.area_sqm)} m² plot area and ${parcel.land_use} use.`
            : 'Lock a LandIntel parcel or enter plot data before relying on locality recommendations. A neutral comparative shell is shown.'}
        </p>
        <p className="mt-1 text-[10px] leading-4 text-relume-muted">Planning controls, orientation, access, terrain and adjoining conditions remain subject to project evidence.</p>
        </>}
      </div>

      {open && <><div className="max-h-56 space-y-2 overflow-y-auto p-2" data-shell-options>
        {items.map((shell) => {
          const recommendation = recommendations.find((item) => item.shell.id === shell.id)
          const selected = shell.id === selectedShell.id
          return (
            <button key={shell.id} type="button" onClick={() => onSelect(shell)} aria-pressed={selected} className={`min-h-11 w-full rounded-lg border p-3 text-left transition ${selected ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border bg-white text-relume-command hover:bg-relume-surface-secondary'}`} data-shell-id={shell.id}>
              <span className="flex items-center justify-between gap-3"><strong className="text-xs">{shell.name}</strong><span className={`text-[9px] font-semibold uppercase tracking-[0.1em] ${selected ? 'text-relume-accent' : 'text-relume-muted'}`}>{shell.geometry.roof} roof</span></span>
              <span className={`mt-1 block text-[10px] leading-4 ${selected ? 'text-white/75' : 'text-relume-muted'}`}>{recommendation?.reasons[0] ?? shell.region} · original typology study</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-relume-border px-3 py-2">
        <button type="button" onClick={() => setExpanded((value) => !value)} className="min-h-11 text-xs font-semibold text-relume-command" aria-expanded={expanded}>{expanded ? 'Show recommendations' : `Browse all ${buildingShellCatalog.length} shells`}</button>
        <span className="text-right text-[9px] uppercase tracking-[0.1em] text-relume-muted">Three.js active<br />Cycles worker next</span>
      </div>
      <details className="border-t border-relume-border px-3 py-2 text-[10px] text-relume-muted">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold text-relume-command">Open rendering stack</summary>
        <ul className="space-y-2 pb-2">
          {designStudioRenderStack.map((engine) => <li key={engine.id} className="flex justify-between gap-3"><span>{engine.name} · {engine.role}</span><strong>{engine.status}</strong></li>)}
        </ul>
        <p>D5 and V-Ray are optional export plugins only. They receive no Ferrum project write access.</p>
      </details>
      </>}
    </aside>
  )
}
