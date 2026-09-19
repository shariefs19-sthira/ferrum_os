import { safeGet, safeSet } from '../safeStorage'
import type { StudioParameters } from '../types'
import type { OpeningEdit } from './openings'
import type { WallOffsets } from './walls'

export const PROJECT_STATE_KEY = 'ferrum-project-state-v1'
export const PROJECT_STATE_EVENT = 'ferrum:project-state'

export type SharedProjectState = {
  version: 1
  revision: number
  updatedAt: string
  source: string
  parameters: StudioParameters
  /** Optional in v1 so saved parameter-only handoffs remain readable. */
  openingEdits?: Record<string, OpeningEdit>
  /** Optional so states saved before the wall model read back with no wall moves. */
  wallOffsets?: WallOffsets
}

const validParameters = (value: unknown): value is StudioParameters => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<StudioParameters>
  return Number.isFinite(candidate.plotWidthM) && Number.isFinite(candidate.plotDepthM) && Number.isFinite(candidate.setbackM) && Number.isFinite(candidate.floors)
}

export function readProjectState(fallback: StudioParameters): SharedProjectState {
  if (typeof window === 'undefined') return { version: 1, revision: 0, updatedAt: '', source: 'server-default', parameters: fallback, openingEdits: {}, wallOffsets: {} }
  try {
    const raw = safeGet(PROJECT_STATE_KEY)
    const parsed = raw ? JSON.parse(raw) as Partial<SharedProjectState> : null
    if (parsed?.version === 1 && validParameters(parsed.parameters)) {
      return { version: 1, revision: Number.isFinite(parsed.revision) ? Number(parsed.revision) : 0, updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '', source: typeof parsed.source === 'string' ? parsed.source : 'unknown', parameters: parsed.parameters, openingEdits: validOpeningEdits(parsed.openingEdits) ? parsed.openingEdits : {}, wallOffsets: validWallOffsets(parsed.wallOffsets) ? parsed.wallOffsets : {} }
    }
  } catch {
    // Malformed local state never replaces the deterministic fallback.
  }
  return { version: 1, revision: 0, updatedAt: '', source: 'local-default', parameters: fallback, openingEdits: {}, wallOffsets: {} }
}

/** Only finite offsets under the known partition-key shape survive; anything else reads back as no move. */
const validWallOffsets = (value: unknown): value is WallOffsets => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.entries(value as Record<string, unknown>).every(([key, offset]) => /^int-[hv][0-9]$/.test(key) && typeof offset === 'number' && Number.isFinite(offset) && Math.abs(offset) < 1000)
}

const validOpeningEdits = (value: unknown): value is Record<string, OpeningEdit> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value as Record<string, unknown>).every((edit) => {
    if (!edit || typeof edit !== 'object' || Array.isArray(edit)) return false
    const candidate = edit as Record<string, unknown>
    const numeric = ['widthM', 'heightM', 'sillM'].every((key) => candidate[key] === undefined || Number.isFinite(candidate[key]))
    const configuration = candidate.configuration === undefined || ['single-swing', 'double-swing', 'sliding', 'fixed', 'casement'].includes(String(candidate.configuration))
    return numeric && configuration
  })
}

export function writeProjectState(parameters: StudioParameters, source: string, openingEdits: Record<string, OpeningEdit> = {}, wallOffsets: WallOffsets = {}): SharedProjectState {
  const previous = readProjectState(parameters)
  const next: SharedProjectState = { version: 1, revision: previous.revision + 1, updatedAt: new Date().toISOString(), source, parameters, openingEdits, wallOffsets }
  safeSet(PROJECT_STATE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent<SharedProjectState>(PROJECT_STATE_EVENT, { detail: next }))
  return next
}

export function subscribeProjectState(listener: (state: SharedProjectState) => void) {
  const onProjectState = (event: Event) => listener((event as CustomEvent<SharedProjectState>).detail)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== PROJECT_STATE_KEY || !event.newValue) return
    try {
      const parsed = JSON.parse(event.newValue) as SharedProjectState
      if (parsed.version === 1 && validParameters(parsed.parameters)) listener({ ...parsed, openingEdits: validOpeningEdits(parsed.openingEdits) ? parsed.openingEdits : {}, wallOffsets: validWallOffsets(parsed.wallOffsets) ? parsed.wallOffsets : {} })
    } catch {
      // Ignore malformed writes from another tab.
    }
  }
  window.addEventListener(PROJECT_STATE_EVENT, onProjectState)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(PROJECT_STATE_EVENT, onProjectState)
    window.removeEventListener('storage', onStorage)
  }
}

export const sameParameters = (a: StudioParameters, b: StudioParameters) => a.plotWidthM === b.plotWidthM && a.plotDepthM === b.plotDepthM && a.setbackM === b.setbackM && a.floors === b.floors
