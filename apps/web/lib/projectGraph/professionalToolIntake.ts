export type ProfessionalSourceDomain =
  | 'BIM_AUTHORING'
  | 'CAD_AUTHORING'
  | 'FABRICATION_MODEL'
  | 'STRUCTURAL_ANALYSIS'
  | 'QUANTITY'
  | 'PROCUREMENT'
  | 'QA_QC'
  | 'SCHEDULING'
  | 'SURVEY'

export type ProfessionalSourceTool =
  | 'REVIT'
  | 'AUTOCAD'
  | 'TEKLA'
  | 'STAAD.PRO'
  | 'ETABS'
  | 'IFC-AUTHORING-TOOL'
  | 'QUANTITY-SYSTEM'
  | 'PROCUREMENT-SYSTEM'
  | 'QA-QC-SYSTEM'
  | 'SCHEDULING-SYSTEM'
  | 'SURVEY-SYSTEM'

export type ToolIntakeState =
  | 'IMPORTED'
  | 'PREVIEWED'
  | 'VALIDATED'
  | 'ENGINEERING VERIFIED'
  | 'APPROVED FOR ISSUE'

export type AdapterImplementationState = 'CONTRACT ONLY' | 'GATED PROPRIETARY CONNECTOR'
export type ExchangeRoute = 'OPEN STANDARD' | 'PLUGIN/ADAPTER'

export type ProfessionalToolAdapter = {
  adapterId: string
  sourceTool: ProfessionalSourceTool
  domain: ProfessionalSourceDomain
  preferredExchange: string[]
  route: ExchangeRoute
  implementationState: AdapterImplementationState
  limitation: string
}

export const PROFESSIONAL_TOOL_ADAPTERS: readonly ProfessionalToolAdapter[] = Object.freeze([
  { adapterId: 'revit-ifc', sourceTool: 'REVIT', domain: 'BIM_AUTHORING', preferredExchange: ['IFC'], route: 'OPEN STANDARD', implementationState: 'CONTRACT ONLY', limitation: 'Revit native parsing is not claimed; exchange requires an authored IFC export and validation report.' },
  { adapterId: 'autocad-dxf-dwg', sourceTool: 'AUTOCAD', domain: 'CAD_AUTHORING', preferredExchange: ['DXF', 'DWG via gated plugin'], route: 'PLUGIN/ADAPTER', implementationState: 'GATED PROPRIETARY CONNECTOR', limitation: 'DXF/DWG import is not live; DWG requires a licensed provider or user-installed plugin.' },
  { adapterId: 'tekla-ifc-fabrication', sourceTool: 'TEKLA', domain: 'FABRICATION_MODEL', preferredExchange: ['IFC', 'fabrication package via gated plugin'], route: 'PLUGIN/ADAPTER', implementationState: 'GATED PROPRIETARY CONNECTOR', limitation: 'Tekla native and fabrication-model connectors are not live or approved for machine release.' },
  { adapterId: 'staad-analysis', sourceTool: 'STAAD.PRO', domain: 'STRUCTURAL_ANALYSIS', preferredExchange: ['vendor export', 'analysis exchange via gated adapter'], route: 'PLUGIN/ADAPTER', implementationState: 'GATED PROPRIETARY CONNECTOR', limitation: 'No STAAD.Pro native parser or engineering verification automation is claimed.' },
  { adapterId: 'etabs-analysis', sourceTool: 'ETABS', domain: 'STRUCTURAL_ANALYSIS', preferredExchange: ['vendor export', 'analysis exchange via gated adapter'], route: 'PLUGIN/ADAPTER', implementationState: 'GATED PROPRIETARY CONNECTOR', limitation: 'No ETABS native parser or engineering verification automation is claimed.' },
  { adapterId: 'ifc-openbim', sourceTool: 'IFC-AUTHORING-TOOL', domain: 'BIM_AUTHORING', preferredExchange: ['IFC'], route: 'OPEN STANDARD', implementationState: 'CONTRACT ONLY', limitation: 'An IFC file still requires schema, unit, placement and geometry validation before coordinated use.' },
  { adapterId: 'quantity-tabular', sourceTool: 'QUANTITY-SYSTEM', domain: 'QUANTITY', preferredExchange: ['CSV', 'XLSX', 'API'], route: 'PLUGIN/ADAPTER', implementationState: 'CONTRACT ONLY', limitation: 'Formula lineage and source geometry must be supplied; tabular import alone is not a checked BOQ.' },
  { adapterId: 'procurement-adapter', sourceTool: 'PROCUREMENT-SYSTEM', domain: 'PROCUREMENT', preferredExchange: ['CSV', 'API'], route: 'PLUGIN/ADAPTER', implementationState: 'CONTRACT ONLY', limitation: 'Supplier, commercial and approval records remain source-system controlled.' },
  { adapterId: 'qa-qc-adapter', sourceTool: 'QA-QC-SYSTEM', domain: 'QA_QC', preferredExchange: ['CSV', 'API', 'evidence package'], route: 'PLUGIN/ADAPTER', implementationState: 'CONTRACT ONLY', limitation: 'Imported evidence does not confer acceptance without the named reviewer and approval record.' },
  { adapterId: 'schedule-adapter', sourceTool: 'SCHEDULING-SYSTEM', domain: 'SCHEDULING', preferredExchange: ['XER/XML', 'CSV', 'API'], route: 'PLUGIN/ADAPTER', implementationState: 'CONTRACT ONLY', limitation: 'Calendar, logic, baseline and data-date validation remain required.' },
  { adapterId: 'survey-adapter', sourceTool: 'SURVEY-SYSTEM', domain: 'SURVEY', preferredExchange: ['LandXML', 'IFC', 'CSV/XYZ'], route: 'OPEN STANDARD', implementationState: 'CONTRACT ONLY', limitation: 'Survey control, CRS, horizontal datum, vertical datum and responsible surveyor must be validated.' },
])

export type ModelBounds = {
  minX: number
  minY: number
  minZ: number | null
  maxX: number
  maxY: number
  maxZ: number | null
}

export type ProfessionalToolIntake = {
  intakeId: string
  adapterId: string
  nativeFileName: string
  nativeFileUri: string
  nativeChecksum: `sha256:${string}`
  nativeRevision: string
  author: string
  sourceTool: ProfessionalSourceTool
  sourceToolVersion: string
  importedAt: string
  units: string | null
  crs: string | null
  horizontalDatum: string | null
  verticalDatum: string | null
  bounds: ModelBounds | null
  parsedEntityTypes: string[]
  warnings: string[]
  state: ToolIntakeState
  approvalRecordId: string | null
  downstreamImpact: Array<{ product: string; artifactIds: string[]; effect: 'CREATED' | 'CHANGED' | 'STALE' | 'HELD' }>
}

const intakeOrder: ToolIntakeState[] = ['IMPORTED', 'PREVIEWED', 'VALIDATED', 'ENGINEERING VERIFIED', 'APPROVED FOR ISSUE']

export function evaluateIntakeTransition(
  intake: ProfessionalToolIntake,
  to: ToolIntakeState,
  evidence: { validationReportId?: string; engineeringVerificationId?: string; issueApprovalId?: string } = {},
): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = []
  const fromIndex = intakeOrder.indexOf(intake.state)
  const toIndex = intakeOrder.indexOf(to)
  if (toIndex > fromIndex + 1) reasons.push('Intake states must advance one gate at a time.')
  if (toIndex < fromIndex) reasons.push('Approved intake history is immutable; ingest a successor revision instead.')
  if (to === 'VALIDATED' && !evidence.validationReportId) reasons.push('A machine-readable intake validation report is required.')
  if (to === 'ENGINEERING VERIFIED' && !evidence.engineeringVerificationId) reasons.push('Named engineering verification evidence is required.')
  if (to === 'APPROVED FOR ISSUE' && !evidence.issueApprovalId) reasons.push('A named issue approval record is required.')
  return { allowed: reasons.length === 0, reasons }
}

export function validateIntakeRecord(intake: ProfessionalToolIntake): string[] {
  const reasons: string[] = []
  if (!/^sha256:[a-f0-9]{64}$/i.test(intake.nativeChecksum)) reasons.push('A SHA-256 native-file checksum is required.')
  if (!intake.nativeRevision || !intake.author || !intake.sourceToolVersion) reasons.push('Native revision, author and source-tool version are required.')
  if (!intake.units) reasons.push('Units are UNKNOWN.')
  if (!intake.crs) reasons.push('CRS is UNKNOWN.')
  if (!intake.horizontalDatum) reasons.push('Horizontal datum is UNKNOWN.')
  if (!intake.verticalDatum) reasons.push('Vertical datum is UNKNOWN.')
  if (!intake.bounds) reasons.push('Model bounds are UNKNOWN.')
  return reasons
}
