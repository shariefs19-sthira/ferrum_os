import { describe, expect, it } from 'vitest'
import { auditAdapterDecision, auditContextPackaged, auditRetrievalRequested, auditsForRetrievalRecord } from './ragAuditEvents'
import type { RetrievalRecord } from './ragRetrievalRecord'
import type { AdapterDecision } from './ragAdapterBoundary'

const TS = '2026-09-19T00:00:00.000Z'

describe('audit event builders are deterministic', () => {
  it('auditRetrievalRequested carries the requested ids verbatim', () => {
    const event = auditRetrievalRequested('req-1', TS, ['a', 'b'])
    expect(event).toEqual({
      type: 'RETRIEVAL_REQUESTED',
      timestamp: TS,
      requestId: 'req-1',
      fragmentId: null,
      detail: { requestedFragmentIds: ['a', 'b'] },
    })
  })

  it('auditContextPackaged records both included and excluded ids', () => {
    const event = auditContextPackaged('req-1', TS, ['a'], ['b'])
    expect(event.type).toBe('CONTEXT_PACKAGED')
    expect(event.detail).toEqual({ includedFragmentIds: ['a'], excludedFragmentIds: ['b'] })
  })

  it('auditAdapterDecision reflects grant vs deny', () => {
    const allowed: AdapterDecision = { allowed: true, reasons: [], permissionEnvelope: null }
    const denied: AdapterDecision = { allowed: false, reasons: ['too sensitive'], permissionEnvelope: null }
    expect(auditAdapterDecision('req-1', TS, 'frag-1', allowed).type).toBe('ADAPTER_ACCESS_GRANTED')
    expect(auditAdapterDecision('req-1', TS, 'frag-1', denied).type).toBe('ADAPTER_ACCESS_DENIED')
  })
})

describe('auditsForRetrievalRecord', () => {
  const baseRecord: RetrievalRecord = {
    requestId: 'req-1',
    fragmentId: 'frag-1',
    classification: 'PUBLIC',
    citation: { sourceName: 'Sample code', sourceUri: 'https://example.test/code', clauseOrLocator: 'Cl 1.1' },
    contentFence: 'DATA_NOT_INSTRUCTION',
    injectionFlags: [],
    redactions: [],
  }

  it('emits nothing when there is nothing to report', () => {
    expect(auditsForRetrievalRecord(baseRecord, TS)).toHaveLength(0)
  })

  it('emits REDACTION_APPLIED and INJECTION_PATTERN_FLAGGED only when present', () => {
    const record: RetrievalRecord = {
      ...baseRecord,
      redactions: [{ fragmentId: 'frag-1', pattern: 'EMAIL', occurrences: 1 }],
      injectionFlags: [{ fragmentId: 'frag-1', pattern: 'ROLE_OVERRIDE', excerpt: 'you are now' }],
    }
    const events = auditsForRetrievalRecord(record, TS)
    expect(events.map((e) => e.type).sort()).toEqual(['INJECTION_PATTERN_FLAGGED', 'REDACTION_APPLIED'])
    expect(events.every((e) => e.requestId === 'req-1' && e.fragmentId === 'frag-1')).toBe(true)
  })
})
