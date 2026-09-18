"use client"

import { useEffect, useState } from 'react'
import type { StudioOpening } from '../../lib/types'
import type { OpeningEdit } from '../../lib/workspace/openings'

type Draft = { widthM: string; heightM: string; sillM: string; configuration: string }
const draftFrom = (opening: StudioOpening): Draft => ({ widthM: String(opening.widthM), heightM: String(opening.heightM), sillM: String(opening.sillM), configuration: opening.configuration })

export default function OpeningInspector({ opening, onCommit, onClose, doorCount, windowCount }: { opening?: StudioOpening; onCommit: (edit: OpeningEdit) => { opening: StudioOpening; message?: string } | undefined; onClose: () => void; doorCount: number; windowCount: number }) {
  const [draft, setDraft] = useState<Draft | undefined>(opening ? draftFrom(opening) : undefined)
  const [message, setMessage] = useState('')
  useEffect(() => { setDraft(opening ? draftFrom(opening) : undefined); setMessage('') }, [opening?.id])
  if (!opening || !draft) return null

  const commit = (field: keyof Draft) => {
    const edit: OpeningEdit = field === 'configuration'
      ? { configuration: draft.configuration as StudioOpening['configuration'] }
      : { [field]: Number(draft[field]) }
    const result = onCommit(edit)
    if (result) setDraft(draftFrom(result.opening))
    setMessage(result?.message ?? '')
  }
  const label = opening.kind === 'door' ? 'Door' : 'Window'
  return <aside className="w-full border-t border-relume-border bg-white p-4 xl:border-l xl:border-t-0" aria-label={`${label} property inspector`} data-opening-inspector>
    <div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Selected opening</p><button type="button" onClick={onClose} className="min-h-11 rounded-full border border-relume-border px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-command">Close inspector</button></div>
    <h3 className="mt-1 text-base font-semibold tracking-relume-tight text-relume-ink">{label} · floor {opening.floor}</h3>
    <p className="mt-1 text-xs text-relume-muted">Hosted on the {opening.hostEdge} edge. Measurements are metres and remain INDICATIVE.</p>
    <div className="mt-4 grid grid-cols-2 gap-3">
      {(['widthM', 'heightM'] as const).map((field) => <label key={field} className="text-xs font-medium text-relume-ink">{field === 'widthM' ? 'Width' : 'Height'} (m)<input type="number" min="0" step="0.05" value={draft[field]} onChange={(event) => { setDraft({ ...draft, [field]: event.target.value }); setMessage('') }} onBlur={() => commit(field)} className="mt-1 min-h-11 w-full rounded-relume border border-relume-border px-3 text-sm text-relume-ink" aria-describedby={message ? 'opening-inspector-message' : undefined} /></label>)}
      {opening.kind === 'window' && <label className="text-xs font-medium text-relume-ink">Sill (m)<input type="number" min="0" step="0.05" value={draft.sillM} onChange={(event) => { setDraft({ ...draft, sillM: event.target.value }); setMessage('') }} onBlur={() => commit('sillM')} className="mt-1 min-h-11 w-full rounded-relume border border-relume-border px-3 text-sm text-relume-ink" aria-describedby={message ? 'opening-inspector-message' : undefined} /></label>}
      <label className="col-span-2 text-xs font-medium text-relume-ink">Configuration<select value={draft.configuration} onChange={(event) => { const next = { ...draft, configuration: event.target.value }; setDraft(next); setMessage(''); const result = onCommit({ configuration: event.target.value as StudioOpening['configuration'] }); if (result) setDraft(draftFrom(result.opening)); setMessage(result?.message ?? '') }} className="mt-1 min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 text-sm text-relume-ink">{(opening.kind === 'door' ? [['single-swing', 'Single swing'], ['double-swing', 'Double swing'], ['sliding', 'Sliding']] : [['fixed', 'Fixed'], ['casement', 'Casement'], ['sliding', 'Sliding']]).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
    </div>
    <div className="mt-4 rounded-relume bg-relume-surface-secondary p-3 text-xs text-relume-ink" data-opening-boq>
      <p className="font-semibold">Measured BOQ · doors {doorCount} nos · windows {windowCount} nos</p>
      <p className="mt-1 leading-5 text-relume-muted">Basis: count of <code>plan.openings</code> by kind; not one per room.</p>
    </div>
    <p id="opening-inspector-message" role={message ? 'alert' : undefined} className={`mt-3 text-xs leading-5 ${message ? 'text-red-700' : 'text-relume-muted'}`}>{message || 'Changes are validated on blur and applied to the shared plan, elevation, BOQ and DXF geometry.'}</p>
  </aside>
}
