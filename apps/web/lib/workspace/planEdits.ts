import type { OpeningEdit } from './openings'
import type { WallOffsets } from './walls'

// Undo/redo for the user's plan edits. The plan itself is always re-derived
// (generateStudioPlan + these edits), so history only has to hold the small
// edit overlay, never a copy of the geometry.

export type PlanEdits = { wallOffsets: WallOffsets; openingEdits: Record<string, OpeningEdit> }
export type EditHistory = { past: PlanEdits[]; present: PlanEdits; future: PlanEdits[] }

export const HISTORY_LIMIT = 50
export const emptyPlanEdits = (): PlanEdits => ({ wallOffsets: {}, openingEdits: {} })

const canonical = (edits: PlanEdits) => JSON.stringify([
  Object.entries(edits.wallOffsets).sort(([a], [b]) => a.localeCompare(b)),
  Object.entries(edits.openingEdits).sort(([a], [b]) => a.localeCompare(b)),
])
export const samePlanEdits = (a: PlanEdits, b: PlanEdits) => canonical(a) === canonical(b)

export const initHistory = (present: PlanEdits = emptyPlanEdits()): EditHistory => ({ past: [], present, future: [] })

/** Records a new present state. A no-op edit (same content) is ignored so
 * blur-without-change never pollutes history; any new edit clears redo. */
export function commitEdit(history: EditHistory, next: PlanEdits): EditHistory {
  if (samePlanEdits(history.present, next)) return history
  return { past: [...history.past, history.present].slice(-HISTORY_LIMIT), present: next, future: [] }
}

export function undo(history: EditHistory): EditHistory {
  const previous = history.past[history.past.length - 1]
  if (!previous) return history
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] }
}

export function redo(history: EditHistory): EditHistory {
  const [next, ...rest] = history.future
  if (!next) return history
  return { past: [...history.past, history.present], present: next, future: rest }
}

/** Replaces the present state from outside (another tab, restored storage)
 * and drops history: those edits were not made in this session's timeline. */
export const replaceHistory = (present: PlanEdits): EditHistory => initHistory(present)

export const canUndo = (history: EditHistory) => history.past.length > 0
export const canRedo = (history: EditHistory) => history.future.length > 0
