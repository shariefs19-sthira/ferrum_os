export type {
  CheckerState,
  DimensionChain,
  DimensionChainStep,
  DimensionChainStepOrigin,
  MeasurementGeometryRef,
  MeasurementGeometryRegionKind,
  SourceDocumentRevision,
  StructuralCategory,
  TakeoffLineageRecord,
  TakeoffLineageStatus,
} from './types'
export { STRUCTURAL_CATEGORIES } from './types'

export type { FloorZoneGroup, NewTakeoffLineageInput, StructuralQuantityTotal } from './lineage'
export {
  buildLineageRecord,
  geometryRefMatchesDocument,
  groupByFloorOrZone,
  isSameSourceRevision,
  structuralQuantityTotals,
  validateLineageRecord,
} from './lineage'

export {
  DocumentMismatchError,
  StaleLineageError,
  isLineStale,
  markChecked,
  reconcileCheckerState,
  reconcileLineageAgainstSource,
  requestCheck,
} from './staleness'
