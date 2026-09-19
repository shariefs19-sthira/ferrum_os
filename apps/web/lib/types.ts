/**
 * Client-safe contracts for the Workspace surface. Keep mutation ownership in
 * the caller: visual controls request an action through these callbacks; they
 * never mutate project or artifact data directly.
 */
export const workspaceProducts = [
  "Land",
  "Design",
  "Structure",
  "Cost",
  "Market",
  "Procure",
  "Invest",
  "Build",
  "Community",
  "Transact",
] as const

export type WorkspaceProduct = (typeof workspaceProducts)[number]

export const workspaceTools = [
  "select",
  "measure",
  "compare",
  "extract",
] as const

export type WorkspaceTool = (typeof workspaceTools)[number]
export type WorkspaceMoreAction = "activity" | "export" | "help" | "advanced"

export type WorkspaceToolCallbacks = {
  onProductChange: (product: WorkspaceProduct) => void
  onToolChange: (tool: WorkspaceTool) => void
  onExtractOpenChange: (open: boolean) => void
  onMoreOpenChange: (open: boolean) => void
  onMoreAction: (action: WorkspaceMoreAction) => void
}

export type WorkspaceProvenance = {
  source: string
  freshness: string
  status: "INDICATIVE" | "TEST MODE" | "ROADMAP"
}

export type WorkspaceExtract = {
  label: string
  value: string
  unit?: string
}

export type StudioView = "space" | "plan" | "front-elevation" | "side-elevation"

export type StudioRoom = {
  id: string
  name: string
  floor: number
  xM: number
  yM: number
  widthM: number
  depthM: number
  areaSqm: number
  color: string
}

export type StudioElevation = {
  id: "north" | "east"
  name: string
  widthM: number
  heightM: number
  floorLinesM: number[]
}

export type StudioOpeningKind = 'door' | 'window'
export type StudioOpeningEdge = 'north' | 'east' | 'south' | 'west'
export type StudioDoorConfiguration = 'single-swing' | 'double-swing' | 'sliding'
export type StudioWindowConfiguration = 'fixed' | 'casement' | 'sliding'

/** A deterministic opening hosted on a generated room edge, in metres. */
export type StudioOpening = {
  id: string
  kind: StudioOpeningKind
  floor: number
  roomId: string
  hostEdge: StudioOpeningEdge
  /** Distance from the edge's local origin to the opening's leading edge. */
  positionM: number
  widthM: number
  heightM: number
  /** Windows use this; doors remain at ground level (0 m). */
  sillM: number
  configuration: StudioDoorConfiguration | StudioWindowConfiguration
}

export type StudioWallKind = 'exterior' | 'interior'

/** Canonical wall segment in the building frame (metres, origin = north-west
 * corner of the buildable footprint, +x east, +y south). Derived from the
 * generated rooms; thickness/height are assumed defaults, not surveyed. */
export type StudioWall = {
  id: string
  floor: number
  kind: StudioWallKind
  orientation: 'horizontal' | 'vertical'
  x1: number
  y1: number
  x2: number
  y2: number
  thicknessM: number
  heightM: number
  /** Movable interior partition key shared by every floor (e.g. `int-v0`). */
  partitionKey?: string
  roomIds: string[]
}

export type StudioPlan = {
  schema: "ferrum-plan-v1"
  plotWidthM: number
  plotDepthM: number
  setbackM: number
  buildingWidthM: number
  buildingDepthM: number
  floors: number
  floorHeightM: number
  rooms: StudioRoom[]
  /** Optional for compatibility with plans created before parametric openings. */
  openings?: StudioOpening[]
  /** Optional for compatibility with plans created before the wall model. */
  walls?: StudioWall[]
  elevations: StudioElevation[]
  generatedBy: "deterministic-layout-v1"
}

export type StudioParameters = {
  plotWidthM: number
  plotDepthM: number
  setbackM: number
  floors: number
}

export type OrbitState = {
  yaw: number
  pitch: number
  zoom: number
  panX: number
  panY: number
}
