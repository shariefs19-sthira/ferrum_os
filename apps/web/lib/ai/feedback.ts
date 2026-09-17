// AI-03 (CLAUDE-20260917-AI-FOUNDATION-LIVE). Local, privacy-preserving
// useful/not-useful + correction capture for Concierge answers. This is
// NOT RLHF and NOT model training -- there is no model here to train.
// It is a client-side evaluation log: nothing is transmitted anywhere,
// nothing touches a server, credentials, project data, or a personal
// identifier. Entries live only in the visitor's own browser
// (localStorage) and can be cleared by clearing site data, same as any
// other client-side preference.

const STORAGE_KEY = 'ferrum-concierge-feedback-v1'
const MAX_ENTRIES = 200

export type FeedbackEntry = {
  /** Client-generated, timestamp-based id -- not a user identifier. */
  id: string
  timestamp: string
  query: string
  answerText: string
  answerSource: 'deterministic' | 'retrieval' | 'fallback'
  useful: boolean
  correction?: string
}

function readAll(): FeedbackEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(entries: FeedbackEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)))
  } catch {
    // Storage unavailable (private browsing, quota) -- feedback capture is
    // best-effort and never blocks the Concierge UI on failure.
  }
}

export function recordFeedback(entry: Omit<FeedbackEntry, 'id' | 'timestamp'>): FeedbackEntry {
  const full: FeedbackEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  }
  const entries = readAll()
  entries.push(full)
  writeAll(entries)
  return full
}

export function getFeedback(): FeedbackEntry[] {
  return readAll()
}

export function clearFeedback(): void {
  writeAll([])
}
