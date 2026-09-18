import type {
  MeasurementGeometryRef,
  SourceDocumentRevision,
  StructuralCategory,
  TakeoffLineageRecord,
} from './types'

export type NewTakeoffLineageInput = Omit<TakeoffLineageRecord, 'lineId' | 'status' | 'checkerState'> & {
  checkerState?: TakeoffLineageRecord['checkerState']
}

/** Builds one lineage record and its deterministic composite `lineId`
 * (documentId:elementId:boqItemId). Throws on the one integrity rule this
 * contract enforces structurally: the measurement geometry reference must
 * point at the same source document the record itself cites — a lineage
 * record whose geometry ref and source document disagree is not a valid
 * record, not a warning to surface later. */
export function buildLineageRecord(input: NewTakeoffLineageInput): TakeoffLineageRecord {
  if (input.measurementGeometryRef.documentId !== input.sourceDocument.documentId) {
    throw new Error(
      `measurementGeometryRef.documentId (${input.measurementGeometryRef.documentId}) does not match `
      + `sourceDocument.documentId (${input.sourceDocument.documentId})`,
    )
  }
  return {
    ...input,
    lineId: `${input.sourceDocument.documentId}:${input.elementId}:${input.boqItemId}`,
    status: 'INDICATIVE',
    checkerState: input.checkerState ?? 'DRAFT',
  }
}

/** Non-throwing validation for records assembled outside `buildLineageRecord`
 * (e.g. deserialized from storage) — returns every issue found rather than
 * failing fast on the first one, so a caller can report a complete list. */
export function validateLineageRecord(record: TakeoffLineageRecord): string[] {
  const issues: string[] = []
  if (!record.sourceDocument.documentId) issues.push('sourceDocument.documentId is empty')
  if (!/^[a-f0-9]{64}$/i.test(record.sourceDocument.checksumSha256)) {
    issues.push('sourceDocument.checksumSha256 must be a 64-character hexadecimal SHA-256 checksum')
  }
  if (!record.elementId) issues.push('elementId is empty')
  if (!record.boqItemId) issues.push('boqItemId is empty')
  if (!record.floorOrZone) issues.push('floorOrZone is empty')
  if (!record.unit.trim()) issues.push('unit is empty')
  if (record.measurementGeometryRef.documentId !== record.sourceDocument.documentId) {
    issues.push('measurementGeometryRef.documentId does not match sourceDocument.documentId')
  }
  if (record.measurementGeometryRef.coordinates.length === 0) {
    issues.push('measurementGeometryRef.coordinates is empty')
  }
  record.measurementGeometryRef.coordinates.forEach((coordinate, index) => {
    if (!Number.isFinite(coordinate.x) || !Number.isFinite(coordinate.y)) {
      issues.push(`measurementGeometryRef.coordinates[${index}] must have finite x and y values`)
    }
  })
  if (record.dimensionChain.steps.length === 0) {
    issues.push('dimensionChain.steps is empty')
  }
  record.dimensionChain.steps.forEach((step, index) => {
    if (!Number.isFinite(step.valueM)) {
      issues.push(`dimensionChain.steps[${index}].valueM must be finite`)
    }
  })
  if (!record.dimensionChain.formula.trim()) issues.push('dimensionChain.formula is empty')
  if (!Number.isFinite(record.quantity) || record.quantity < 0) {
    issues.push('quantity must be a finite, non-negative number')
  }
  if (record.lineId !== `${record.sourceDocument.documentId}:${record.elementId}:${record.boqItemId}`) {
    issues.push('lineId does not match documentId:elementId:boqItemId')
  }
  return issues
}

export type FloorZoneGroup = {
  floorOrZone: string
  lines: TakeoffLineageRecord[]
}

/** Groups lines by floor/zone, stable-sorted for deterministic output. */
export function groupByFloorOrZone(records: ReadonlyArray<TakeoffLineageRecord>): FloorZoneGroup[] {
  const keys = Array.from(new Set(records.map((record) => record.floorOrZone))).sort()
  return keys.map((floorOrZone) => ({
    floorOrZone,
    lines: records.filter((record) => record.floorOrZone === floorOrZone),
  }))
}

export type StructuralQuantityTotal = {
  category: StructuralCategory
  unit: string
  totalQuantity: number
  lineCount: number
}

/** Concrete / rebar / formwork separation, summed per (category, unit) —
 * kept separate by unit rather than assuming one unit per category, since
 * this contract never fabricates a unit conversion. */
export function structuralQuantityTotals(records: ReadonlyArray<TakeoffLineageRecord>): StructuralQuantityTotal[] {
  const byKey = new Map<string, StructuralQuantityTotal>()
  for (const record of records) {
    const key = `${record.structuralCategory}:${record.unit}`
    const existing = byKey.get(key)
    if (existing) {
      existing.totalQuantity += record.quantity
      existing.lineCount += 1
    } else {
      byKey.set(key, {
        category: record.structuralCategory,
        unit: record.unit,
        totalQuantity: record.quantity,
        lineCount: 1,
      })
    }
  }
  return Array.from(byKey.values()).sort((a, b) =>
    a.category.localeCompare(b.category) || a.unit.localeCompare(b.unit))
}

/** True when two source-document references identify the exact same
 * revision of the same document — the equality this whole contract's
 * staleness detection is built on. */
export function isSameSourceRevision(a: SourceDocumentRevision, b: SourceDocumentRevision): boolean {
  return a.documentId === b.documentId && a.checksumSha256 === b.checksumSha256 && a.revisionLabel === b.revisionLabel
}

/** Re-exported for callers that only need the geometry-ref shape check
 * without constructing a full record (e.g. validating intake payloads). */
export function geometryRefMatchesDocument(ref: MeasurementGeometryRef, sourceDocument: SourceDocumentRevision): boolean {
  return ref.documentId === sourceDocument.documentId
}
