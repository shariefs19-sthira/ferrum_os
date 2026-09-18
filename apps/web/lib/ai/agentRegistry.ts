export type AgentModelId = 'sutra' | 'openai' | 'anthropic' | 'google' | 'local'

export type AgentModelDefinition = {
  id: AgentModelId
  label: string
  state: 'ACTIVE' | 'CONNECTION_REQUIRED' | 'ENDPOINT_REQUIRED'
  stateLabel: string
}

export const FERRUM_AGENT_POLICY = Object.freeze({
  defaultModel: 'sutra' as const,
  repositoryAccess: false,
  websiteAdministration: false,
  canModifyFerrumApplication: false,
  projectToolActions: 'explicit_capability_only' as const,
  externalSideEffects: 'user_approval_required' as const,
  evidenceLabelsRequired: true,
  providerCredentials: 'user_scoped_never_shared_between_providers' as const,
})

export const AGENT_MODELS: AgentModelDefinition[] = [
  { id: 'sutra', label: 'SUTRA', state: 'ACTIVE', stateLabel: 'Ferrum governed' },
  { id: 'openai', label: 'OpenAI', state: 'CONNECTION_REQUIRED', stateLabel: 'Connection required' },
  { id: 'anthropic', label: 'Anthropic', state: 'CONNECTION_REQUIRED', stateLabel: 'Connection required' },
  { id: 'google', label: 'Google Gemini', state: 'CONNECTION_REQUIRED', stateLabel: 'Connection required' },
  { id: 'local', label: 'Local model', state: 'ENDPOINT_REQUIRED', stateLabel: 'Endpoint required' },
]

export const CONSTRUCTION_CONNECTOR_GROUPS = [
  { group: 'BIM & design', items: 'Autodesk Construction Cloud, Revit, AutoCAD, Navisworks, Civil 3D, Tekla, Archicad, SketchUp, Bentley iTwin' },
  { group: 'Planning & controls', items: 'Primavera P6, Microsoft Project, Asta Powerproject, Smartsheet' },
  { group: 'Field & CDE', items: 'Procore, Autodesk Build, Trimble Connect, Bentley ProjectWise, Bluebeam, Fieldwire' },
  { group: 'Cost & procurement', items: 'CostX, Candy, SAP, Oracle ERP, Tally, Zoho Books, QuickBooks' },
  { group: 'Land & geospatial', items: 'ArcGIS, QGIS, OpenStreetMap, state land-record and planning-authority adapters' },
  { group: 'Files & collaboration', items: 'Google Drive, Microsoft 365, OneDrive, Dropbox, Box, Slack, Teams' },
] as const

export function canRunModel(modelId: AgentModelId) {
  return AGENT_MODELS.find((model) => model.id === modelId)?.state === 'ACTIVE'
}
