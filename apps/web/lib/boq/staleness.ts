import { isSameSourceRevision, validateLineageRecord } from './lineage'
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

/** Current-source metadata is evidence for a transition, not optional UI
 * context. Reject incomplete metadata rather than reconciling against an
 * unverifiable revision. */
export class InvalidCurrentSourceRevisionError extends Error {
  constructor(readonly issues: ReadonlyArray<string>) {
    super('cannot advance checker state without an authoritative current source revision and checksum')
    this.name = 'InvalidCurrentSourceRevisionError'
  }
}

/** Thrown when a caller tries to check a record that fails the lineage
 * contract. Keeping the issues attached lets an intake or review layer show
 * conservative remediation without ever treating malformed stored data as
 * reviewed. */
export class InvalidLineageRecordError extends Error {
  readonly issues: ReadonlyArray<string>

  constructor(issues: ReadonlyArray<string>) {
    super('cannot mark checked: lineage record failed validation')
    this.name = 'InvalidLineageRecordError'
    this.issues = issues
  }
}

/**
 * The checker cannot advance a stored record using its own source metadata as
 * evidence of currency. A caller must provide the authoritative current
 * source revision on every transition, which is reconciled immediately before
 * the lifecycle guard runs.
 */
function reconcileForTransition(
  record: TakeoffLineageRecord,
  currentSourceDocument: SourceDocumentRevision,
): TakeoffLineageRecord {
  const issues: string[] = []
  if (!currentSourceDocument.documentId.trim()) issues.push('currentSourceDocument.documentId is empty')
  if (!currentSourceDocument.revisionLabel.trim()) issues.push('currentSourceDocument.revisionLabel is empty')
  if (!/^[a-f0-9]{64}$/i.test(currentSourceDocument.checksumSha256)) {
    issues.push('currentSourceDocument.checksumSha256 must be a 64-character hexadecimal SHA-256 checksum')
  }
  if (issues.length > 0) throw new InvalidCurrentSourceRevisionError(issues)
  const checkerState = reconcileCheckerState(record, currentSourceDocument)
  if (checkerState === 'STALE_UPSTREAM_DATA') throw new StaleLineageError(record.lineId)
  return checkerState === record.checkerState ? record : { ...record, checkerState }
}

export function requestCheck(
  record: TakeoffLineageRecord,
  currentSourceDocument: SourceDocumentRevision,
): TakeoffLineageRecord {
  const reconciled = reconcileForTransition(record, currentSourceDocument)
  if (reconciled.checkerState === 'STALE_UPSTREAM_DATA') throw new StaleLineageError(reconciled.lineId)
  return { ...reconciled, checkerState: 'CHECK_REQUIRED' }
}

export function markChecked(
  record: TakeoffLineageRecord,
  currentSourceDocument: SourceDocumentRevision,
): TakeoffLineageRecord {
  const reconciled = reconcileForTransition(record, currentSourceDocument)
  if (reconciled.checkerState === 'STALE_UPSTREAM_DATA') throw new StaleLineageError(reconciled.lineId)
  if (reconciled.checkerState !== 'CHECK_REQUIRED') {
    throw new Error(`line ${reconciled.lineId} must be CHECK_REQUIRED before it can be marked CHECKED`)
  }
  const issues = validateLineageRecord(reconciled)
  if (issues.length > 0) throw new InvalidLineageRecordError(issues)
  return { ...reconciled, checkerState: 'CHECKED' }
}
