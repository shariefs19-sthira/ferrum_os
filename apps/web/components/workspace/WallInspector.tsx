"use client"

import { useEffect, useState } from 'react'
import type { StudioWall } from '../../lib/types'
import { MIN_ROOM_DIMENSION_M, WALL_STEP_M, wallLengthM } from '../../lib/workspace/walls'
import { feetToMetres, formatDualLength, formatThickness, metresToFeet } from '../../lib/workspace/wallUnits'

export type WallCommit = { positionM: number; message?: string } | undefined

const NUDGE_M = 0.1
const buttonClass = 'min-h-11 min-w-11 rounded-full border border-relume-border px-3 text-xs font-semibold text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-command disabled:cursor-not-allowed disabled:opacity-50'

/** Properties of the selected wall. Interior partitions can be moved with the
 * numeric field or the touch-sized nudge buttons (the drag on the plan is an
 * extra, never the only way). Exterior walls are read-only in this slice: the
 * envelope comes from the plot and setback parameters. */
export default function WallInspector({ wall, positionM, floors, openingCount, moved, onMoveTo, onReset, onClose, className = '' }: {
  wall?: StudioWall
  positionM: number
  floors: number
  openingCount: number
  moved: boolean
  onMoveTo: (positionM: number) => WallCommit
  onReset: () => void
  onClose: () => void
  className?: string
}) {
  const [draft, setDraft] = useState(positionM.toFixed(2))
  const [draftFt, setDraftFt] = useState(metresToFeet(positionM).toFixed(2))
  const [message, setMessage] = useState('')
  useEffect(() => { setDraft(positionM.toFixed(2)); setDraftFt(metresToFeet(positionM).toFixed(2)) }, [positionM, wall?.id])
  useEffect(() => { setMessage('') }, [wall?.id])
  if (!wall) return null

  const movable = wall.kind === 'interior' && Boolean(wall.partitionKey)
  const thickness = formatThickness(wall.thicknessM)
  const positionFtText = metresToFeet(positionM).toFixed(2)
  const axis = wall.orientation === 'horizontal' ? 'from the north face' : 'from the west face'
  const commit = (value: number) => {
    const result = onMoveTo(value)
    if (result) { setDraft(result.positionM.toFixed(2)); setDraftFt(metresToFeet(result.positionM).toFixed(2)); setMessage(result.message ?? '') }
  }
  return <aside className={`order-2 w-full border-t border-relume-border bg-white p-4 xl:order-none xl:border-l xl:border-t-0 ${className}`} aria-label={`${wall.kind === 'exterior' ? 'Exterior' : 'Interior'} wall property inspector`} data-wall-inspector>
    <div className="flex items-start justify-between gap-3 xl:pr-40"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Selected wall</p><button type="button" onClick={onClose} className="min-h-11 rounded-full border border-relume-border px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-command" aria-label="Close wall inspector">Close</button></div>
    <h3 className="mt-1 text-base font-semibold tracking-relume-tight text-relume-ink">{wall.kind === 'exterior' ? 'Exterior' : 'Interior'} wall · floor {wall.floor}</h3>
    <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
      <div><dt className="text-relume-muted">Length</dt><dd className="mt-1 font-mono text-sm text-relume-ink"><span className="block">{wallLengthM(wall).toFixed(2)} m</span><span className="block text-relume-muted">{metresToFeet(wallLengthM(wall)).toFixed(2)} ft</span></dd></div>
      <div><dt className="text-relume-muted">Thickness</dt><dd className="mt-1 font-mono text-sm text-relume-ink"><span className="block">{thickness.mm}</span><span className="block text-relume-muted">{thickness.ft}</span></dd></div>
      <div><dt className="text-relume-muted">Height</dt><dd className="mt-1 font-mono text-sm text-relume-ink"><span className="block">{wall.heightM.toFixed(2)} m</span><span className="block text-relume-muted">{metresToFeet(wall.heightM).toFixed(2)} ft</span></dd></div>
    </dl>
    <p className="mt-2 text-xs leading-5 text-relume-muted">Thickness and height are assumed defaults, not surveyed or structurally designed. {openingCount} opening{openingCount === 1 ? '' : 's'} attached. All values remain INDICATIVE.</p>
    {movable ? <div className="mt-4">
      <p className="text-xs font-medium text-relume-ink">Position {axis}</p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <label className="block text-xs text-relume-muted">Metres (m)
          <input type="number" inputMode="decimal" step="0.05" value={draft} onChange={(event) => { setDraft(event.target.value); setMessage('') }} onBlur={() => { const value = Number(draft); if (draft.trim() !== '' && Number.isFinite(value) && Math.abs(value - positionM) > 1e-6) commit(value); else { setDraft(positionM.toFixed(2)); setDraftFt(positionFtText) } }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} className="mt-1 min-h-11 w-full rounded-relume border border-relume-border px-3 text-sm text-relume-ink" aria-describedby="wall-inspector-message" data-wall-position-input="m" />
        </label>
        <label className="block text-xs text-relume-muted">Feet (ft)
          <input type="number" inputMode="decimal" step="0.1" value={draftFt} onChange={(event) => { setDraftFt(event.target.value); setMessage('') }} onBlur={() => { const value = Number(draftFt); if (draftFt.trim() !== '' && Number.isFinite(value) && draftFt !== positionFtText) commit(feetToMetres(value)); else { setDraft(positionM.toFixed(2)); setDraftFt(positionFtText) } }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} className="mt-1 min-h-11 w-full rounded-relume border border-relume-border px-3 text-sm text-relume-ink" aria-describedby="wall-inspector-message" data-wall-position-input="ft" />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Nudge wall">
        <button type="button" className={buttonClass} onClick={() => commit(positionM - NUDGE_M)} aria-label="Move wall back 0.1 metre" data-wall-nudge="back">−0.1 m</button>
        <button type="button" className={buttonClass} onClick={() => commit(positionM + NUDGE_M)} aria-label="Move wall forward 0.1 metre" data-wall-nudge="forward">+0.1 m</button>
        <button type="button" className={buttonClass} disabled={!moved} onClick={() => { onReset(); setMessage('') }} data-wall-reset>Reset wall</button>
      </div>
      <p className="mt-3 text-xs leading-5 text-relume-muted">Moving this partition reshapes the rooms on both sides on all {floors} floor{floors === 1 ? '' : 's'} and re-attaches doors and windows. Snaps to {(WALL_STEP_M * 100).toFixed(0)} cm ({metresToFeet(WALL_STEP_M).toFixed(2)} ft); rooms keep at least {formatDualLength(MIN_ROOM_DIMENSION_M)}.</p>
    </div> : <p className="mt-4 rounded-relume bg-relume-surface-secondary p-3 text-xs leading-5 text-relume-ink">Exterior walls follow the plot and setback parameters, so they are not moved here. Change the plot or setback to resize the envelope.</p>}
    <p id="wall-inspector-message" role={message ? 'alert' : undefined} className={`mt-3 text-xs leading-5 ${message ? 'text-red-700' : 'text-relume-muted'}`}>{message || 'Wall edits update the plan, the 3D wall model and the geometry revision immediately.'}</p>
  </aside>
}
