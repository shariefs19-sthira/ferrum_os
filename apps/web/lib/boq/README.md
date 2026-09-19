# BOQ take-off lineage contract

A data-model + reconciliation layer that traces one BOQ quantity line
back to the source drawing/model document it was measured from. It is
deliberately narrow: it carries and validates lineage data supplied by a
caller; it does not parse CAD/PDF files, does not run OCR, and does not
derive or invent any quantity. Every numeric value on a
`TakeoffLineageRecord` (dimensions, quantity) is asserted input.

## Files

- `types.ts` — the record shape: `SourceDocumentRevision` (checksum +
  revision), `MeasurementGeometryRef` (a highlighted-region reference on
  that document), `DimensionChain` (the steps + formula that produced the
  quantity), `StructuralCategory` (CONCRETE / REBAR / FORMWORK /
  NOT_APPLICABLE), `CheckerState`, and `TakeoffLineageRecord` itself
  (element id, BOQ item, floor/zone, assumptions, exclusions, status).
- `lineage.ts` — `buildLineageRecord` (constructs a record + its
  deterministic `lineId`), `validateLineageRecord` (non-throwing full
  issue list), `groupByFloorOrZone`, `structuralQuantityTotals` (sums per
  category *and* unit — never merges mismatched units), and the
  `isSameSourceRevision` / `geometryRefMatchesDocument` equality helpers.
- `staleness.ts` — the checker-state machine: `reconcileCheckerState` /
  `reconcileLineageAgainstSource` deterministically recompute
  `STALE_UPSTREAM_DATA` from a fresh comparison against the latest known
  source-document revision every time they're called (never a
  once-written flag trusted afterward), and `requestCheck` /
  `markChecked` advance the DRAFT → CHECK_REQUIRED → CHECKED lifecycle,
  refusing to advance a line that is currently stale.
- `index.ts` — barrel export of the above.

## Invariants

- A record's `measurementGeometryRef.documentId` must equal its
  `sourceDocument.documentId` — enforced at construction
  (`buildLineageRecord` throws) and re-checked by `validateLineageRecord`
  for records assembled elsewhere (e.g. deserialized).
- `STALE_UPSTREAM_DATA` is never set directly. It is the deterministic
  result of comparing a record's `sourceDocument` (documentId + checksum
  + revisionLabel) against the caller's current source-document revision.
  Any prior checker state (including `CHECKED`) is overridden the instant
  the source document moves to a different checksum/revision.
- `requestCheck` / `markChecked` reject a `STALE_UPSTREAM_DATA` line —
  reconciliation must run first, so the checker workflow can never
  fast-forward past its own staleness.
- Every record carries `status: 'INDICATIVE'` — this is a traceability
  record, never a legal or final quantity statement.

## Relationship to `apps/web/lib/workspace/boqLineage.ts`

That module already exists and covers a different slice: per-element BOQ
lineage derived *procedurally* from a generated `StudioPlan` (rooms/
openings), fingerprinted by hashing the plan's own geometry fields. This
contract instead models the case where the BOQ line traces back to an
**uploaded source document** identified by an externally-supplied
checksum/revision (a drawing sheet, an exported model, a scanned PDF) —
the checksum and dimensions are asserted by whatever intake step produced
them, not computed by this module. The two are complementary lineage
shapes, not a replacement of one by the other.

## Explicitly out of scope

- No OCR or CAD/PDF parsing of any kind.
- No quantity computation or unit conversion — `quantity`, `unit`, and
  every `DimensionChainStep.valueM` are caller-supplied.
- No UI.
