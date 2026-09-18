import type { StudioPlan } from '../types'
import { measureBoqLineage, planFingerprint, type BoqLineageEntry } from './boqLineage'

// Revision/staleness/delta tracking for the model-linked BOQ. A revision
// is a pure snapshot of measureBoqLineage() taken against one specific
// plan fingerprint. It never mutates in place — "STALE UPSTREAM DATA" is
// a derived comparison between a held revision's fingerprint and the
// plan's current fingerprint, computed on read, not a flag written once
// and trusted forever.

export type CheckerStatus = 'DRAFT' | 'CHECK REQUIRED' | 'CHECKED' | 'STALE UPSTREAM DATA' | 'INDICATIVE'

export type BoqRevision = {
  revisionId: number
  parentRevisionId: number | null
  fingerprint: string
  createdAt: string
  checkerStatus: CheckerStatus
  lines: BoqLineageEntry[]
}

/**
 * Creates the next revision from `plan`. If `previous` already matches
 * the plan's current fingerprint, it's returned unchanged (idempotent —
 * recomputing against unchanged geometry never creates a duplicate
 * revision or discards checker progress).
 */
export function createBoqRevision(plan: StudioPlan, previous: BoqRevision | null, now: () => string = () => new Date().toISOString()): BoqRevision {
  const fingerprint = planFingerprint(plan)
  if (previous && previous.fingerprint === fingerprint) return previous
  return {
    revisionId: (previous?.revisionId ?? 0) + 1,
    parentRevisionId: previous?.revisionId ?? null,
    fingerprint,
    createdAt: now(),
    checkerStatus: 'DRAFT',
    lines: measureBoqLineage(plan),
  }
}

/** True when `revision` was computed from geometry that no longer
 * matches `plan` — the actual, on-read trigger for STALE UPSTREAM DATA. */
export function isRevisionStale(revision: BoqRevision, plan: StudioPlan): boolean {
  return revision.fingerprint !== planFingerprint(plan)
}

/** The status a UI should actually display: STALE UPSTREAM DATA
 * overrides whatever checker status was last recorded, since a checked
 * revision against superseded geometry is not still "checked". */
export function effectiveCheckerStatus(revision: BoqRevision, plan: StudioPlan): CheckerStatus {
  return isRevisionStale(revision, plan) ? 'STALE UPSTREAM DATA' : revision.checkerStatus
}

export type RevisionDeltaLine = {
  catalogId: string
  scope: BoqLineageEntry['scope']
  unit: string
  previousQuantity: number | null
  nextQuantity: number | null
  deltaQuantity: number | null
}

const deltaKey = (line: BoqLineageEntry) => `${line.catalogId}:${line.scope}`

/**
 * Per-line quantity delta between two revisions, keyed by (catalogId,
 * scope) so a line that only exists in one revision (a floor added or
 * removed) shows up with the other side null instead of being silently
 * dropped from the comparison.
 */
export function computeRevisionDelta(previous: BoqRevision, next: BoqRevision): RevisionDeltaLine[] {
  const previousByKey = new Map(previous.lines.map((line) => [deltaKey(line), line]))
  const nextByKey = new Map(next.lines.map((line) => [deltaKey(line), line]))
  const keys = new Set(Array.from(previousByKey.keys()).concat(Array.from(nextByKey.keys())))
  return Array.from(keys)
    .map((key) => {
      const previousLine = previousByKey.get(key)
      const nextLine = nextByKey.get(key)
      const reference = nextLine ?? previousLine as BoqLineageEntry
      const previousQuantity = previousLine?.quantity ?? null
      const nextQuantity = nextLine?.quantity ?? null
      const deltaQuantity = previousQuantity === null || nextQuantity === null ? null : nextQuantity - previousQuantity
      return { catalogId: reference.catalogId, scope: reference.scope, unit: reference.unit, previousQuantity, nextQuantity, deltaQuantity }
    })
    .sort((a, b) => a.catalogId.localeCompare(b.catalogId) || String(a.scope).localeCompare(String(b.scope)))
}
