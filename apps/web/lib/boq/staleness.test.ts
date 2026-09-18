import { describe, expect, it } from 'vitest'
import { buildLineageRecord } from './lineage'
import type { NewTakeoffLineageInput } from './lineage'
import {
  DocumentMismatchError,
  InvalidLineageRecordError,
  StaleLineageError,
  isLineStale,
  markChecked,
  reconcileCheckerState,
  reconcileLineageAgainstSource,
  requestCheck,
} from './staleness'
import type { SourceDocumentRevision } from './types'

const revisionB: SourceDocumentRevision = {
  documentId: 'DWG-S-101',
  fileName: 'S-101-slab-plan-rev-b.pdf',
  checksumSha256: 'b'.repeat(64),
  revisionLabel: 'Rev B',
  capturedAt: '2026-09-01T00:00:00.000Z',
}

const revisionC: SourceDocumentRevision = {
  ...revisionB,
  fileName: 'S-101-slab-plan-rev-c.pdf',
  checksumSha256: 'c'.repeat(64),
  revisionLabel: 'Rev C',
  capturedAt: '2026-09-10T00:00:00.000Z',
}

function baseInput(overrides: Partial<NewTakeoffLineageInput> = {}): NewTakeoffLineageInput {
  return {
    sourceDocument: revisionB,
    elementId: 'SLAB-GF-01',
    measurementGeometryRef: {
      refId: 'REF-1',
      documentId: revisionB.documentId,
      sheet: 'S-101',
      regionKind: 'POLYGON',
      coordinates: [{ x: 10, y: 10 }, { x: 50, y: 40 }],
      note: 'Highlighted slab outline',
    },
    dimensionChain: {
      steps: [{ label: 'length', valueM: 8, origin: 'MEASURED' }],
      formula: 'length x width x depth',
    },
    boqItemId: 'rcc-slab',
    boqItemDescription: 'RCC slab, M20',
    unit: 'm3',
    quantity: 6,
    floorOrZone: 'Ground Floor',
    assumptions: [],
    exclusions: [],
    structuralCategory: 'CONCRETE',
    ...overrides,
  }
}

describe('reconcileCheckerState', () => {
  it('leaves checkerState unchanged when the source revision is unchanged', () => {
    const record = buildLineageRecord(baseInput({ checkerState: 'CHECKED' }))
    expect(reconcileCheckerState(record, revisionB)).toBe('CHECKED')
  })

  it('deterministically overrides to STALE_UPSTREAM_DATA when checksum/revision changes, regardless of prior state', () => {
    const draft = buildLineageRecord(baseInput())
    const checked = buildLineageRecord(baseInput({ checkerState: 'CHECKED' }))
    expect(reconcileCheckerState(draft, revisionC)).toBe('STALE_UPSTREAM_DATA')
    expect(reconcileCheckerState(checked, revisionC)).toBe('STALE_UPSTREAM_DATA')
  })

  it('throws DocumentMismatchError when the latest source document is a different document entirely', () => {
    const record = buildLineageRecord(baseInput())
    const otherDocument: SourceDocumentRevision = { ...revisionB, documentId: 'DWG-OTHER' }
    expect(() => reconcileCheckerState(record, otherDocument)).toThrow(DocumentMismatchError)
  })
})

describe('reconcileLineageAgainstSource', () => {
  it('propagates STALE_UPSTREAM_DATA to every line of the changed document, leaving other documents untouched', () => {
    const lineA = buildLineageRecord(baseInput({ checkerState: 'CHECKED' }))
    const lineB = buildLineageRecord(baseInput({ elementId: 'SLAB-GF-02', checkerState: 'DRAFT' }))
    const otherDocLine = buildLineageRecord(baseInput({
      sourceDocument: { ...revisionB, documentId: 'DWG-OTHER' },
      measurementGeometryRef: { ...baseInput().measurementGeometryRef, documentId: 'DWG-OTHER' },
      elementId: 'WALL-01',
      checkerState: 'CHECKED',
    }))

    const reconciled = reconcileLineageAgainstSource([lineA, lineB, otherDocLine], revisionC)

    expect(reconciled.find((line) => line.lineId === lineA.lineId)?.checkerState).toBe('STALE_UPSTREAM_DATA')
    expect(reconciled.find((line) => line.lineId === lineB.lineId)?.checkerState).toBe('STALE_UPSTREAM_DATA')
    expect(reconciled.find((line) => line.lineId === otherDocLine.lineId)?.checkerState).toBe('CHECKED')
  })

  it('is a no-op (identity-preserving) when nothing has actually changed', () => {
    const line = buildLineageRecord(baseInput({ checkerState: 'CHECKED' }))
    const [reconciled] = reconcileLineageAgainstSource([line], revisionB)
    expect(reconciled).toBe(line)
  })

  it('never mutates the input records', () => {
    const line = buildLineageRecord(baseInput({ checkerState: 'CHECKED' }))
    reconcileLineageAgainstSource([line], revisionC)
    expect(line.checkerState).toBe('CHECKED')
  })
})

describe('isLineStale', () => {
  it('reports staleness as a pure function of current vs. latest source document', () => {
    const record = buildLineageRecord(baseInput())
    expect(isLineStale(record, revisionB)).toBe(false)
    expect(isLineStale(record, revisionC)).toBe(true)
  })
})

describe('checker-state lifecycle', () => {
  it('advances DRAFT -> CHECK_REQUIRED -> CHECKED', () => {
    const draft = buildLineageRecord(baseInput())
    const checkRequired = requestCheck(draft)
    expect(checkRequired.checkerState).toBe('CHECK_REQUIRED')
    const checked = markChecked(checkRequired)
    expect(checked.checkerState).toBe('CHECKED')
  })

  it('refuses to advance a STALE_UPSTREAM_DATA line without reconciliation first', () => {
    const stale = { ...buildLineageRecord(baseInput({ checkerState: 'CHECKED' })), checkerState: 'STALE_UPSTREAM_DATA' as const }
    expect(() => requestCheck(stale)).toThrow(StaleLineageError)
    expect(() => markChecked(stale)).toThrow(StaleLineageError)
  })

  it('refuses to skip CHECK_REQUIRED when marking a DRAFT record as checked', () => {
    const draft = buildLineageRecord(baseInput())
    expect(() => markChecked(draft)).toThrow(/must be CHECK_REQUIRED/)
  })

  it('refuses invalid deserialized records even when their predecessor is CHECK_REQUIRED', () => {
    const checkRequired = requestCheck(buildLineageRecord(baseInput()))
    const invalidDeserialized = {
      ...checkRequired,
      sourceDocument: { ...checkRequired.sourceDocument, checksumSha256: 'not-a-checksum' },
      unit: '',
      measurementGeometryRef: {
        ...checkRequired.measurementGeometryRef,
        coordinates: [{ x: Number.NaN, y: 0 }],
      },
      dimensionChain: {
        formula: '',
        steps: [{ label: 'length', valueM: Number.POSITIVE_INFINITY, origin: 'MEASURED' as const }],
      },
    }

    expect(() => markChecked(invalidDeserialized)).toThrow(InvalidLineageRecordError)
    try {
      markChecked(invalidDeserialized)
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidLineageRecordError)
      expect((error as InvalidLineageRecordError).issues).toEqual(expect.arrayContaining([
        'sourceDocument.checksumSha256 must be a 64-character hexadecimal SHA-256 checksum',
        'unit is empty',
        'measurementGeometryRef.coordinates[0] must have finite x and y values',
        'dimensionChain.steps[0].valueM must be finite',
        'dimensionChain.formula is empty',
      ]))
    }
  })
})
