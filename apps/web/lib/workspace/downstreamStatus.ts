import type { StudioPlan } from '../types'
import { planFingerprint } from './boqLineage'

// Recorded downstream outputs (a held BOQ take-off revision, a recorded
// structural span check) are computed from one geometry revision. When the
// plan's geometry fingerprint moves away from that revision they are STALE
// UPSTREAM DATA — and they stay CURRENT across cosmetic edits, because the
// fingerprint ignores colour/labels. Status is derived on read, never a
// stored flag. Live readouts (which recompute every render) are not "recorded
// outputs" and are never labelled by this module.

export type DownstreamOutputId = 'BOQ' | 'STRUCTURAL'
export type DownstreamState = 'CURRENT' | 'STALE UPSTREAM DATA'
export type RecordedRevision = { revision: string; recordedAt: string; governingSpanM: number; structuralPass: boolean }
export type DownstreamStatus = { id: DownstreamOutputId; label: string; state: DownstreamState; recordedRevision: string; currentRevision: string; detail: string }

/** Builds the record to persist when the user records outputs for `plan`. */
export function recordRevision(plan: StudioPlan, snapshot: { governingSpanM: number; structuralPass: boolean }, now: () => string = () => new Date().toISOString()): RecordedRevision {
  return { revision: planFingerprint(plan), recordedAt: now(), ...snapshot }
}

/** `recorded` undefined = nothing recorded yet: there is nothing to be stale. */
export function downstreamStatus(plan: StudioPlan, recorded: RecordedRevision | undefined): DownstreamStatus[] {
  const currentRevision = planFingerprint(plan)
  if (!recorded) return []
  const state: DownstreamState = recorded.revision === currentRevision ? 'CURRENT' : 'STALE UPSTREAM DATA'
  return [
    { id: 'BOQ', label: 'BOQ quantities', state, recordedRevision: recorded.revision, currentRevision, detail: 'Held take-off revision' },
    { id: 'STRUCTURAL', label: 'Structural span check', state, recordedRevision: recorded.revision, currentRevision, detail: `${recorded.structuralPass ? 'PASS' : 'REVIEW'} at ${recorded.governingSpanM.toFixed(2)} m span (simplified, INDICATIVE)` },
  ]
}

export const anyDownstreamStale = (statuses: DownstreamStatus[]) => statuses.some((status) => status.state === 'STALE UPSTREAM DATA')

export const DOWNSTREAM_RECORD_KEY = 'ferrum-downstream-recorded-revision-v1'

export function readRecordedRevision(): RecordedRevision | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DOWNSTREAM_RECORD_KEY) ?? 'null') as Partial<RecordedRevision> | null
    if (parsed && typeof parsed.revision === 'string' && /^[a-f0-9]{8}$/.test(parsed.revision) && Number.isFinite(parsed.governingSpanM) && typeof parsed.structuralPass === 'boolean') {
      return { revision: parsed.revision, recordedAt: typeof parsed.recordedAt === 'string' ? parsed.recordedAt : '', governingSpanM: Number(parsed.governingSpanM), structuralPass: parsed.structuralPass }
    }
  } catch {
    // Missing or malformed storage means nothing is recorded.
  }
  return undefined
}

export function writeRecordedRevision(record: RecordedRevision) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DOWNSTREAM_RECORD_KEY, JSON.stringify(record))
  } catch {
    // Storage unavailable: the record stays in memory for this session.
  }
}
