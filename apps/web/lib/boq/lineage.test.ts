import { describe, expect, it } from 'vitest'
import {
  buildLineageRecord,
  geometryRefMatchesDocument,
  groupByFloorOrZone,
  isSameSourceRevision,
  structuralQuantityTotals,
  validateLineageRecord,
} from './lineage'
import type { NewTakeoffLineageInput } from './lineage'
import type { SourceDocumentRevision, StructuralCategory } from './types'

const sourceDocument: SourceDocumentRevision = {
  documentId: 'DWG-S-101',
  fileName: 'S-101-slab-plan-rev-b.pdf',
  checksumSha256: 'a'.repeat(64),
  revisionLabel: 'Rev B',
  capturedAt: '2026-09-01T00:00:00.000Z',
}

function baseInput(overrides: Partial<NewTakeoffLineageInput> = {}): NewTakeoffLineageInput {
  return {
    sourceDocument,
    elementId: 'SLAB-GF-01',
    measurementGeometryRef: {
      refId: 'REF-1',
      documentId: sourceDocument.documentId,
      sheet: 'S-101',
      regionKind: 'POLYGON',
      coordinates: [{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 40 }, { x: 10, y: 40 }],
      note: 'Highlighted slab outline, gridlines A-D / 1-3',
    },
    dimensionChain: {
      steps: [
        { label: 'length', valueM: 8, origin: 'MEASURED' },
        { label: 'width', valueM: 6, origin: 'MEASURED' },
        { label: 'depth', valueM: 0.125, origin: 'ASSUMED' },
      ],
      formula: 'length x width x depth',
    },
    boqItemId: 'rcc-slab',
    boqItemDescription: 'RCC slab, M20',
    unit: 'm3',
    quantity: 6,
    floorOrZone: 'Ground Floor',
    assumptions: ['Slab depth assumed uniform at 0.125 m.'],
    exclusions: ['Excludes any cantilevered projection beyond the highlighted outline.'],
    structuralCategory: 'CONCRETE',
    ...overrides,
  }
}

describe('buildLineageRecord', () => {
  it('builds a deterministic composite lineId and defaults checkerState to DRAFT', () => {
    const record = buildLineageRecord(baseInput())
    expect(record.lineId).toBe('DWG-S-101:SLAB-GF-01:rcc-slab')
    expect(record.checkerState).toBe('DRAFT')
    expect(record.status).toBe('INDICATIVE')
  })

  it('honors an explicit initial checkerState', () => {
    const record = buildLineageRecord(baseInput({ checkerState: 'CHECKED' }))
    expect(record.checkerState).toBe('CHECKED')
  })

  it('throws when the geometry ref points at a different document than sourceDocument', () => {
    const input = baseInput({
      measurementGeometryRef: { ...baseInput().measurementGeometryRef, documentId: 'DWG-OTHER' },
    })
    expect(() => buildLineageRecord(input)).toThrow(/does not match/)
  })
})

describe('validateLineageRecord', () => {
  it('returns no issues for a well-formed record', () => {
    const record = buildLineageRecord(baseInput())
    expect(validateLineageRecord(record)).toEqual([])
  })

  it('reports every issue found, not just the first', () => {
    const record = buildLineageRecord(baseInput())
    const broken = {
      ...record,
      elementId: '',
      quantity: -1,
      dimensionChain: { steps: [], formula: '' },
    }
    const issues = validateLineageRecord(broken)
    expect(issues).toContain('elementId is empty')
    expect(issues).toContain('quantity must be a finite, non-negative number')
    expect(issues).toContain('dimensionChain.steps is empty')
  })

  it('rejects malformed checksum, formula, units, dimensions, and geometry coordinates', () => {
    const record = buildLineageRecord(baseInput())
    const broken = {
      ...record,
      sourceDocument: { ...record.sourceDocument, checksumSha256: 'not-a-checksum' },
      unit: '  ',
      measurementGeometryRef: {
        ...record.measurementGeometryRef,
        coordinates: [{ x: Number.NaN, y: Number.POSITIVE_INFINITY }],
      },
      dimensionChain: {
        formula: ' ',
        steps: [{ label: 'length', valueM: Number.NEGATIVE_INFINITY, origin: 'MEASURED' as const }],
      },
    }

    expect(validateLineageRecord(broken)).toEqual(expect.arrayContaining([
      'sourceDocument.checksumSha256 must be a 64-character hexadecimal SHA-256 checksum',
      'unit is empty',
      'measurementGeometryRef.coordinates[0] must have finite x and y values',
      'dimensionChain.steps[0].valueM must be finite',
      'dimensionChain.formula is empty',
    ]))
  })

  it('flags a lineId that no longer matches its own document/element/item triple', () => {
    const record = buildLineageRecord(baseInput())
    const tampered = { ...record, lineId: 'wrong-id' }
    expect(validateLineageRecord(tampered)).toContain('lineId does not match documentId:elementId:boqItemId')
  })
})

describe('groupByFloorOrZone', () => {
  it('groups and sorts lines by floor/zone deterministically', () => {
    const groundFloor = buildLineageRecord(baseInput())
    const firstFloor = buildLineageRecord(baseInput({ elementId: 'SLAB-1F-01', floorOrZone: 'First Floor' }))
    const groups = groupByFloorOrZone([firstFloor, groundFloor])
    expect(groups.map((group) => group.floorOrZone)).toEqual(['First Floor', 'Ground Floor'])
    expect(groups[1].lines).toEqual([groundFloor])
  })
})

describe('structuralQuantityTotals', () => {
  it('separates concrete, rebar, and formwork, summing per (category, unit)', () => {
    const concreteA = buildLineageRecord(baseInput())
    const concreteB = buildLineageRecord(baseInput({ elementId: 'SLAB-GF-02', quantity: 4 }))
    const rebar = buildLineageRecord(baseInput({
      elementId: 'SLAB-GF-01', boqItemId: 'rebar', unit: 'kg', quantity: 570,
      structuralCategory: 'REBAR' as StructuralCategory,
    }))
    const formwork = buildLineageRecord(baseInput({
      elementId: 'SLAB-GF-01', boqItemId: 'formwork', unit: 'm2', quantity: 48,
      structuralCategory: 'FORMWORK' as StructuralCategory,
    }))

    const totals = structuralQuantityTotals([concreteA, concreteB, rebar, formwork])

    expect(totals).toEqual([
      { category: 'CONCRETE', unit: 'm3', totalQuantity: 10, lineCount: 2 },
      { category: 'FORMWORK', unit: 'm2', totalQuantity: 48, lineCount: 1 },
      { category: 'REBAR', unit: 'kg', totalQuantity: 570, lineCount: 1 },
    ])
  })

  it('never mixes units within a category into one total', () => {
    const cubic = buildLineageRecord(baseInput())
    const sqm = buildLineageRecord(baseInput({ elementId: 'SLAB-GF-03', unit: 'm2', quantity: 1 }))
    const totals = structuralQuantityTotals([cubic, sqm])
    expect(totals).toHaveLength(2)
    expect(totals.every((total) => total.lineCount === 1)).toBe(true)
  })
})

describe('isSameSourceRevision / geometryRefMatchesDocument', () => {
  it('compares documentId + checksum + revisionLabel exactly', () => {
    expect(isSameSourceRevision(sourceDocument, { ...sourceDocument })).toBe(true)
    expect(isSameSourceRevision(sourceDocument, { ...sourceDocument, checksumSha256: 'b'.repeat(64) })).toBe(false)
    expect(isSameSourceRevision(sourceDocument, { ...sourceDocument, revisionLabel: 'Rev C' })).toBe(false)
  })

  it('checks only documentId equality for the geometry-ref shape check', () => {
    const ref = baseInput().measurementGeometryRef
    expect(geometryRefMatchesDocument(ref, sourceDocument)).toBe(true)
    expect(geometryRefMatchesDocument(ref, { ...sourceDocument, documentId: 'OTHER' })).toBe(false)
  })
})
