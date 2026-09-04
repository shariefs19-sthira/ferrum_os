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
