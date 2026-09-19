// Model/drawing-linked quantity take-off lineage contract.
//
// This is a data-model + reconciliation layer only. It does NOT parse CAD
// files, does NOT run OCR, and does NOT derive quantities from geometry —
// every value here (checksum, dimensions, quantity) is supplied by a caller
// (an upstream intake step, a human takeoff, or a checker) and merely
// carried, validated, and reconciled by this module. See README.md.

/** Identifies one specific revision of one source document (a drawing
 * sheet, an exported model, a scanned PDF — the format is out of scope
 * for this contract). The checksum is asserted by the caller: this module
 * never computes it and never claims to have parsed the file's content. */
export type SourceDocumentRevision = {
  documentId: string
  fileName: string
  /** Caller-supplied content checksum (e.g. SHA-256 hex) of this exact
   * revision's bytes. Used only for equality comparison, never computed
   * here. */
  checksumSha256: string
  revisionLabel: string
  capturedAt: string
}

export type MeasurementGeometryRegionKind = 'POLYGON' | 'POLYLINE' | 'POINT'

/** A reference to a highlighted region on a source document — the
 * coordinates are opaque pass-through data (whatever coordinate space the
 * caller's viewer uses); this module never interprets or measures them. */
export type MeasurementGeometryRef = {
  refId: string
  documentId: string
  sheet: string | null
  regionKind: MeasurementGeometryRegionKind
  coordinates: ReadonlyArray<{ x: number; y: number }>
  note: string
}

export type DimensionChainStepOrigin = 'MEASURED' | 'DERIVED' | 'ASSUMED'

export type DimensionChainStep = {
  label: string
  valueM: number
  origin: DimensionChainStepOrigin
}

/** The explicit chain of dimensions and the formula that combines them
 * into the line's quantity — the auditable "how" behind `quantity`, not a
 * recomputation of it. */
export type DimensionChain = {
  steps: ReadonlyArray<DimensionChainStep>
  formula: string
}

export type StructuralCategory = 'CONCRETE' | 'REBAR' | 'FORMWORK' | 'NOT_APPLICABLE'

export const STRUCTURAL_CATEGORIES: ReadonlyArray<StructuralCategory> = [
  'CONCRETE', 'REBAR', 'FORMWORK', 'NOT_APPLICABLE',
]

/** Checker workflow state. STALE_UPSTREAM_DATA is never set by hand — it
 * is a derived override computed by `reconcileCheckerState` whenever the
 * source document a line was measured from has moved on to a different
 * revision/checksum. */
export type CheckerState = 'DRAFT' | 'CHECK_REQUIRED' | 'CHECKED' | 'STALE_UPSTREAM_DATA'

/** Every record produced by this contract is watermarked INDICATIVE —
 * this is a lineage/traceability record, never a legal or final quantity
 * statement. */
export type TakeoffLineageStatus = 'INDICATIVE'

export type TakeoffLineageRecord = {
  lineId: string
  sourceDocument: SourceDocumentRevision
  elementId: string
  measurementGeometryRef: MeasurementGeometryRef
  dimensionChain: DimensionChain
  boqItemId: string
  boqItemDescription: string
  unit: string
  quantity: number
  /** A floor number, a floor label, or a zone name — kept as a free-form
   * string so both grains are representable without two parallel fields. */
  floorOrZone: string
  assumptions: ReadonlyArray<string>
  exclusions: ReadonlyArray<string>
  structuralCategory: StructuralCategory
  checkerState: CheckerState
  status: TakeoffLineageStatus
}
