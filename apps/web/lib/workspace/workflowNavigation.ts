import { workspaceProducts, type WorkspaceProduct } from '../types'

export type WorkflowStageId =
  | 'site'
  | 'design'
  | 'engineering'
  | 'quantities-cost'
  | 'procurement'
  | 'delivery'
  | 'evidence-approvals'

export type WorkflowSignal = 'ready' | 'stale' | 'issue'

export type WorkflowStage = {
  id: WorkflowStageId
  label: string
  product: WorkspaceProduct
  description: string
  signal: Exclude<WorkflowSignal, 'stale'>
  signalLabel: string
  status: { kind: 'capability'; value: 'LIMITED PREVIEW' | 'ROADMAP' } | { kind: 'evidence'; value: 'INDICATIVE' | 'UNKNOWN' }
}

export const workflowStages: readonly WorkflowStage[] = [
  { id: 'site', label: 'Site', product: 'Land', description: 'Parcel context and constraints', signal: 'issue', signalLabel: 'Authoritative parcel evidence required', status: { kind: 'evidence', value: 'INDICATIVE' } },
  { id: 'design', label: 'Design', product: 'Design', description: 'Plan and massing', signal: 'ready', signalLabel: 'Indicative test-fit available', status: { kind: 'capability', value: 'LIMITED PREVIEW' } },
  { id: 'engineering', label: 'Engineering', product: 'Structure', description: 'Bounded structural checks', signal: 'issue', signalLabel: 'Engineering verification required', status: { kind: 'evidence', value: 'INDICATIVE' } },
  { id: 'quantities-cost', label: 'Quantities & cost', product: 'Cost', description: 'Measured quantities and cost', signal: 'ready', signalLabel: 'Indicative quantities available', status: { kind: 'evidence', value: 'INDICATIVE' } },
  { id: 'procurement', label: 'Procurement', product: 'Procure', description: 'Material sourcing and orders', signal: 'issue', signalLabel: 'Workflow is not released', status: { kind: 'capability', value: 'ROADMAP' } },
  { id: 'delivery', label: 'Delivery', product: 'Build', description: 'Site execution and closure', signal: 'issue', signalLabel: 'Workflow is not released', status: { kind: 'capability', value: 'ROADMAP' } },
  { id: 'evidence-approvals', label: 'Evidence & approvals', product: 'Transact', description: 'Due diligence and issue controls', signal: 'issue', signalLabel: 'Professional approval remains external', status: { kind: 'evidence', value: 'INDICATIVE' } },
] as const

export const advancedWorkflowProducts: readonly { product: WorkspaceProduct; label: string; description: string; roadmap?: boolean }[] = [
  { product: 'Market', label: 'Market signals', description: 'Indicative comparable rates' },
  { product: 'Invest', label: 'Investment analysis', description: 'Indicative IRR and NPV' },
  { product: 'Community', label: 'Community funding', description: 'No live project workflow', roadmap: true },
] as const

export function workflowStageForProduct(product: WorkspaceProduct): WorkflowStage | undefined {
  return workflowStages.find((stage) => stage.product === product)
}

export function workspaceProductFromParam(value: string | null): WorkspaceProduct {
  return workspaceProducts.includes(value as WorkspaceProduct) ? value as WorkspaceProduct : 'Land'
}

/** Changes only the workspace product bookmark. Project, view/camera,
 * revision and any future query context remain byte-for-byte values. */
export function withWorkspaceProduct(url: string, product: WorkspaceProduct): string {
  const next = new URL(url)
  next.searchParams.set('product', product)
  return next.toString()
}
