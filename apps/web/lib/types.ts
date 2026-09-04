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
] as const

export type WorkspaceProduct = (typeof workspaceProducts)[number]

export const workspaceTools = [
  "select",
  "measure",
  "compare",
  "extract",
] as const

export type WorkspaceTool = (typeof workspaceTools)[number]
export type WorkspaceMoreAction = "activity" | "export" | "help"

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
