import { isSameSourceRevision } from './lineage'
import type { CheckerState, SourceDocumentRevision, TakeoffLineageRecord } from './types'

/** Thrown when a caller tries to reconcile a lineage record against a
 * "latest" source document that isn't even the same document — that's a
 * caller bug (wrong document passed in), not a staleness condition. */
export class DocumentMismatchError extends Error {
  constructor(recordDocumentId: string, latestDocumentId: string) {
    super(`cannot reconcile record for document ${recordDocumentId} against unrelated document ${latestDocumentId}`)
    this.name = 'DocumentMismatchError'
  }
}

/** The single deterministic rule this contract's staleness detection
 * reduces to: a record's checker state is STALE_UPSTREAM_DATA whenever
 * `latestSourceDocument` is a different revision/checksum of the same
 * document than the one the record was measured against — computed fresh
 * on every call, never trusted as a previously-written flag. Any other
 * checker state passes through unchanged. */
export function reconcileCheckerState(
  record: TakeoffLineageRecord,
  latestSourceDocument: SourceDocumentRevision,
): CheckerState {
  if (record.sourceDocument.documentId !== latestSourceDocument.documentId) {
    throw new DocumentMismatchError(record.sourceDocument.documentId, latestSourceDocument.documentId)
  }
  return isSameSourceRevision(record.sourceDocument, latestSourceDocument)
    ? record.checkerState
    : 'STALE_UPSTREAM_DATA'
}

/** Applies `reconcileCheckerState` across a set of lines, propagating
 * STALE_UPSTREAM_DATA to every line whose sourceDocument no longer
 * matches `latestSourceDocument`. Lines measured from a different
 * document entirely are left untouched (they are simply not this
 * document's concern) rather than raising — only same-document,
 * different-revision lines are reconciled here. Returns new record
 * objects; never mutates the input. */
export function reconcileLineageAgainstSource(
  records: ReadonlyArray<TakeoffLineageRecord>,
  latestSourceDocument: SourceDocumentRevision,
): TakeoffLineageRecord[] {
  return records.map((record) => {
    if (record.sourceDocument.documentId !== latestSourceDocument.documentId) return record
    const checkerState = reconcileCheckerState(record, latestSourceDocument)
    if (checkerState === record.checkerState) return record
    return { ...record, checkerState }
  })
}

/** Convenience predicate for a UI/report layer outside this module's
 * scope: is this specific line currently stale against `latestSourceDocument`? */
export function isLineStale(record: TakeoffLineageRecord, latestSourceDocument: SourceDocumentRevision): boolean {
  return reconcileCheckerState(record, latestSourceDocument) === 'STALE_UPSTREAM_DATA'
}

/** Checker-state lifecycle transitions. Each guards against advancing a
 * line that is currently STALE_UPSTREAM_DATA — a stale line must be
 * re-measured/re-reconciled against the current source revision before
 * the checker workflow can move it forward, never fast-forwarded past
 * its own staleness. */

export class StaleLineageError extends Error {
  constructor(lineId: string) {
    super(`line ${lineId} is STALE_UPSTREAM_DATA and must be reconciled before its checker state can advance`)
    this.name = 'StaleLineageError'
  }
}

export function requestCheck(record: TakeoffLineageRecord): TakeoffLineageRecord {
  if (record.checkerState === 'STALE_UPSTREAM_DATA') throw new StaleLineageError(record.lineId)
  return { ...record, checkerState: 'CHECK_REQUIRED' }
}

export function markChecked(record: TakeoffLineageRecord): TakeoffLineageRecord {
  if (record.checkerState === 'STALE_UPSTREAM_DATA') throw new StaleLineageError(record.lineId)
  return { ...record, checkerState: 'CHECKED' }
}
