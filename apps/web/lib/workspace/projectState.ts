import type { StudioParameters } from '../types'

export const PROJECT_STATE_KEY = 'ferrum-project-state-v1'
export const PROJECT_STATE_EVENT = 'ferrum:project-state'

export type SharedProjectState = {
  version: 1
  revision: number
  updatedAt: string
  source: string
  parameters: StudioParameters
}

const validParameters = (value: unknown): value is StudioParameters => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<StudioParameters>
  return Number.isFinite(candidate.plotWidthM) && Number.isFinite(candidate.plotDepthM) && Number.isFinite(candidate.setbackM) && Number.isFinite(candidate.floors)
}

export function readProjectState(fallback: StudioParameters): SharedProjectState {
  if (typeof window === 'undefined') return { version: 1, revision: 0, updatedAt: '', source: 'server-default', parameters: fallback }
  try {
    const raw = window.localStorage.getItem(PROJECT_STATE_KEY)
    const parsed = raw ? JSON.parse(raw) as Partial<SharedProjectState> : null
    if (parsed?.version === 1 && validParameters(parsed.parameters)) {
      return { version: 1, revision: Number.isFinite(parsed.revision) ? Number(parsed.revision) : 0, updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '', source: typeof parsed.source === 'string' ? parsed.source : 'unknown', parameters: parsed.parameters }
    }
  } catch {
    // Malformed local state never replaces the deterministic fallback.
  }
  return { version: 1, revision: 0, updatedAt: '', source: 'local-default', parameters: fallback }
}

export function writeProjectState(parameters: StudioParameters, source: string): SharedProjectState {
  const previous = readProjectState(parameters)
  const next: SharedProjectState = { version: 1, revision: previous.revision + 1, updatedAt: new Date().toISOString(), source, parameters }
  window.localStorage.setItem(PROJECT_STATE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent<SharedProjectState>(PROJECT_STATE_EVENT, { detail: next }))
  return next
}

export function subscribeProjectState(listener: (state: SharedProjectState) => void) {
  const onProjectState = (event: Event) => listener((event as CustomEvent<SharedProjectState>).detail)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== PROJECT_STATE_KEY || !event.newValue) return
    try {
      const parsed = JSON.parse(event.newValue) as SharedProjectState
      if (parsed.version === 1 && validParameters(parsed.parameters)) listener(parsed)
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
