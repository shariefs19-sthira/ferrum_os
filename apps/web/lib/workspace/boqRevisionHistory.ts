import type { StudioPlan } from '../types'
import { createBoqRevision, type BoqRevision } from './boqRevision'

// Browser-local revision history, same SSR-safe/try-catch pattern as
// projectState.ts. This is what makes "preserve the previous revision"
// (mission requirement 5) real rather than a one-session-only artifact:
// a revision survives a reload, so an upstream geometry change can be
// compared against what was actually checked before, not just against
// whatever happens to still be in memory.

export const BOQ_REVISION_HISTORY_KEY = 'ferrum-boq-revision-history-v1'

export function readBoqRevisionHistory(): BoqRevision[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BOQ_REVISION_HISTORY_KEY)
    const parsed = raw ? (JSON.parse(raw) as BoqRevision[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeBoqRevisionHistory(history: BoqRevision[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BOQ_REVISION_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Storage unavailable (private mode, quota) — history stays in-memory for this call only.
  }
}

/**
 * Reads the stored history, computes the next revision against `plan`,
 * and appends it (or, if geometry hasn't actually changed, returns the
 * existing history untouched — recomputation is idempotent).
 */
export function appendBoqRevision(plan: StudioPlan): { history: BoqRevision[]; latest: BoqRevision } {
  const history = readBoqRevisionHistory()
  const previous = history.at(-1) ?? null
  const latest = createBoqRevision(plan, previous)
  const nextHistory = latest === previous ? history : [...history, latest]
  writeBoqRevisionHistory(nextHistory)
  return { history: nextHistory, latest }
}

/**
 * Opens the current take-off without silently accepting changed upstream
 * geometry. An existing revision is returned unchanged so callers can
 * compare its fingerprint with the current plan and expose a stale hold.
 * Only a first-time workspace is initialized automatically.
 */
export function readOrInitializeBoqRevisionHistory(plan: StudioPlan): BoqRevision[] {
  const history = readBoqRevisionHistory()
  return history.length > 0 ? history : appendBoqRevision(plan).history
}

/** Records a checker-status change (DRAFT → CHECK REQUIRED → CHECKED,
 * etc.) on the latest stored revision, without touching plan geometry. */
export function setLatestCheckerStatus(status: BoqRevision['checkerStatus']): BoqRevision[] {
  const history = readBoqRevisionHistory()
  if (history.length === 0) return history
  const next = history.map((revision, index) => index === history.length - 1 ? { ...revision, checkerStatus: status } : revision)
  writeBoqRevisionHistory(next)
  return next
}
