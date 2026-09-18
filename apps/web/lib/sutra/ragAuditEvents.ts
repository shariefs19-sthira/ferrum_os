// SUTRA read-only knowledge access - audit events.
//
// Every builder here is a pure function of its inputs: the caller
// supplies `timestamp` explicitly rather than this module calling
// Date.now() internally, so event construction stays deterministic and
// reproducible in tests. Callers own actually persisting/emitting the
// returned events to whatever audit sink the deployment uses.

import type { AdapterDecision } from './ragAdapterBoundary'
import type { RetrievalRecord } from './ragRetrievalRecord'

export type AuditEventType =
  | 'RETRIEVAL_REQUESTED'
  | 'CONTEXT_PACKAGED'
  | 'REDACTION_APPLIED'
  | 'INJECTION_PATTERN_FLAGGED'
  | 'ADAPTER_ACCESS_GRANTED'
  | 'ADAPTER_ACCESS_DENIED'

export type AuditEvent = {
  type: AuditEventType
  timestamp: string
  requestId: string
  fragmentId: string | null
  detail: Record<string, unknown>
}

export function auditRetrievalRequested(requestId: string, timestamp: string, requestedFragmentIds: string[]): AuditEvent {
  return { type: 'RETRIEVAL_REQUESTED', timestamp, requestId, fragmentId: null, detail: { requestedFragmentIds } }
}

export function auditContextPackaged(
  requestId: string,
  timestamp: string,
  includedFragmentIds: string[],
  excludedFragmentIds: string[],
): AuditEvent {
  return { type: 'CONTEXT_PACKAGED', timestamp, requestId, fragmentId: null, detail: { includedFragmentIds, excludedFragmentIds } }
}

/** Derives REDACTION_APPLIED and INJECTION_PATTERN_FLAGGED events from one retrieval record, only when there's something to report. */
export function auditsForRetrievalRecord(record: RetrievalRecord, timestamp: string): AuditEvent[] {
  const events: AuditEvent[] = []
  if (record.redactions.length > 0) {
    events.push({
      type: 'REDACTION_APPLIED',
      timestamp,
      requestId: record.requestId,
      fragmentId: record.fragmentId,
      detail: { redactions: record.redactions },
    })
  }
  if (record.injectionFlags.length > 0) {
    events.push({
      type: 'INJECTION_PATTERN_FLAGGED',
      timestamp,
      requestId: record.requestId,
      fragmentId: record.fragmentId,
      detail: { injectionFlags: record.injectionFlags },
    })
  }
  return events
}

export function auditAdapterDecision(requestId: string, timestamp: string, fragmentId: string, decision: AdapterDecision): AuditEvent {
  return {
    type: decision.allowed ? 'ADAPTER_ACCESS_GRANTED' : 'ADAPTER_ACCESS_DENIED',
    timestamp,
    requestId,
    fragmentId,
    detail: { allowed: decision.allowed, reasons: decision.reasons },
  }
}
