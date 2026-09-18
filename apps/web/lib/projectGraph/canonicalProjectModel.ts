export const PROJECT_MODEL_SCHEMA = 'ferrum.project-model.v1' as const

export type ProjectModelFreezeState =
  | 'WORKING'
  | 'CONCEPT FROZEN'
  | 'COORDINATION FROZEN'
  | 'ENGINEERING VERIFIED'
  | 'APPROVED FOR ISSUE'
  | 'FABRICATION/CONSTRUCTION RELEASED'

export type DerivedProduct =
  | 'DesignStudio'
  | 'Structura/FEA'
  | 'BOQ Pro'
  | 'ProcureHub'
  | 'BuildOS'
  | 'InvestFlow'

export type EvidenceState =
  | 'SOURCE-VERIFIED'
  | 'INDICATIVE'
  | 'INFERRED'
  | 'UNKNOWN'
  | 'STALE UPSTREAM DATA'

export type ProjectModelRevision = {
  schema: typeof PROJECT_MODEL_SCHEMA
  projectId: string
  revisionId: string
  parentRevisionId: string | null
  checksum: `sha256:${string}`
  createdAt: string
  createdBy: string
  freezeState: ProjectModelFreezeState
  /** Semantic objects are referenced here rather than flattened into drawings. */
  semanticModelUri: string
  planViewUri: string
  elevationViewUris: string[]
  projectLocationId: string
}

export type ArtifactEvidence = {
  evidenceId: string
  title: string
  sourceUri: string
  sourceDate: string | null
  state: Exclude<EvidenceState, 'STALE UPSTREAM DATA'>
}

export type DerivedArtifact = {
  artifactId: string
  product: DerivedProduct
  artifactType: string
  sourceModelRevisionId: string
  sourceModelChecksum: ProjectModelRevision['checksum']
  createdAt: string
  owner: string
  status: Exclude<EvidenceState, 'STALE UPSTREAM DATA'>
  assumptions: string[]
  evidence: ArtifactEvidence[]
}

export type EffectiveDerivedArtifact = DerivedArtifact & {
  effectiveStatus: EvidenceState
  staleReason: string | null
}

export type ReleaseEvidence = {
  structuralVerificationId?: string
  issueApprovalId?: string
  releaseAuthorizationId?: string
}

const freezeOrder: ProjectModelFreezeState[] = [
  'WORKING',
  'CONCEPT FROZEN',
  'COORDINATION FROZEN',
  'ENGINEERING VERIFIED',
  'APPROVED FOR ISSUE',
  'FABRICATION/CONSTRUCTION RELEASED',
]

export const DOWNSTREAM_PRODUCTS: readonly DerivedProduct[] = Object.freeze([
  'DesignStudio',
  'Structura/FEA',
  'BOQ Pro',
  'ProcureHub',
  'BuildOS',
  'InvestFlow',
])

export function effectiveArtifactStatus(
  artifact: DerivedArtifact,
  currentModel: Pick<ProjectModelRevision, 'revisionId' | 'checksum'>,
): EffectiveDerivedArtifact {
  const revisionChanged = artifact.sourceModelRevisionId !== currentModel.revisionId
  const checksumChanged = artifact.sourceModelChecksum !== currentModel.checksum
  const stale = revisionChanged || checksumChanged
  return {
    ...artifact,
    effectiveStatus: stale ? 'STALE UPSTREAM DATA' : artifact.status,
    staleReason: stale
      ? `Derived from ${artifact.sourceModelRevisionId} (${artifact.sourceModelChecksum}); current source is ${currentModel.revisionId} (${currentModel.checksum}).`
      : null,
  }
}

export function evaluateFreezeTransition(
  from: ProjectModelFreezeState,
  to: ProjectModelFreezeState,
  evidence: ReleaseEvidence = {},
): { allowed: boolean; reasons: string[] } {
  const fromIndex = freezeOrder.indexOf(from)
  const toIndex = freezeOrder.indexOf(to)
  const reasons: string[] = []

  if (toIndex > fromIndex + 1) reasons.push('Freeze states must advance one controlled gate at a time.')
  if (toIndex < fromIndex) reasons.push('A released revision is immutable; create a successor revision instead of moving it backwards.')
  if (to === 'ENGINEERING VERIFIED' && !evidence.structuralVerificationId) reasons.push('Engineering verification evidence is required.')
  if (to === 'APPROVED FOR ISSUE' && !evidence.issueApprovalId) reasons.push('Named issue approval evidence is required.')
  if (to === 'FABRICATION/CONSTRUCTION RELEASED' && !evidence.releaseAuthorizationId) reasons.push('Release authorization evidence is required.')

  return { allowed: reasons.length === 0, reasons }
}

export type DeliverableCoverageInput = {
  requiredArtifactIds: string[]
  coordinatedArtifactIds: string[]
  artifacts: EffectiveDerivedArtifact[]
}

export type DeliverableCoverage = {
  required: number
  current: number
  sourceVerified: number
  coordinated: number
  stale: number
  unknown: number
  currentCoveragePercent: number
  verifiedCoveragePercent: number
  coordinatedCoveragePercent: number
}

/**
 * Ferrum's commercial value measure is closure over required deliverables.
 * Extra drafts do not improve coverage; a stale or unknown artifact cannot be
 * counted as verified simply because more outputs were generated.
 */
export function measureDeliverableCoverage(input: DeliverableCoverageInput): DeliverableCoverage {
  const requiredIds = new Set(input.requiredArtifactIds)
  const byId = new Map(input.artifacts.filter((artifact) => requiredIds.has(artifact.artifactId)).map((artifact) => [artifact.artifactId, artifact]))
  const required = requiredIds.size
  const current = Array.from(requiredIds).filter((id) => {
    const status = byId.get(id)?.effectiveStatus
    return Boolean(status && status !== 'STALE UPSTREAM DATA' && status !== 'UNKNOWN')
  }).length
  const sourceVerified = Array.from(requiredIds).filter((id) => byId.get(id)?.effectiveStatus === 'SOURCE-VERIFIED').length
  const coordinated = new Set(input.coordinatedArtifactIds.filter((id) => {
    if (!requiredIds.has(id)) return false
    const status = byId.get(id)?.effectiveStatus
    return Boolean(status && status !== 'STALE UPSTREAM DATA' && status !== 'UNKNOWN')
  })).size
  const stale = Array.from(requiredIds).filter((id) => byId.get(id)?.effectiveStatus === 'STALE UPSTREAM DATA').length
  const unknown = Array.from(requiredIds).filter((id) => !byId.has(id) || byId.get(id)?.effectiveStatus === 'UNKNOWN').length
  const percent = (value: number) => required === 0 ? 100 : Math.round((value / required) * 10000) / 100

  return {
    required,
    current,
    sourceVerified,
    coordinated,
    stale,
    unknown,
    currentCoveragePercent: percent(current),
    verifiedCoveragePercent: percent(sourceVerified),
    coordinatedCoveragePercent: percent(coordinated),
  }
}
