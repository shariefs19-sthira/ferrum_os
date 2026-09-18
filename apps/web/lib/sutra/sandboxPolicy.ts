export type SutraProvider = 'FERRUM_NATIVE' | 'CLAUDE' | 'CODEX'
export type SandboxAccessMode = 'READ_ONLY' | 'PROPOSE_ONLY' | 'PROJECT_MUTATION'
export type DataRetentionChoice = 'NO_RETENTION' | 'PROVIDER_DEFAULT' | 'FERRUM_MANAGED'
export type TrainingConsent = 'DENIED' | 'RETRIEVAL_ONLY' | 'EXPLICIT_TRAINING_OPT_IN'

export type SutraSandboxRequest = {
  requestId: string
  tenantId: string
  projectId: string
  actorId: string
  provider: SutraProvider
  providerModel: string
  providerVersion: string
  accessMode: SandboxAccessMode
  requestedContextIds: string[]
  disclosedContextIds: string[]
  dataRetention: DataRetentionChoice
  trainingConsent: TrainingConsent
  projectMutationConfirmationId: string | null
}

export type SutraSandboxDecision = {
  allowed: boolean
  reasons: string[]
  effectiveAccess: 'READ_ONLY' | 'PROPOSE_ONLY' | 'CONFIRMED_PROJECT_MUTATION' | 'DENIED'
  audit: {
    requestId: string
    tenantId: string
    projectId: string
    actorId: string
    provider: SutraProvider
    providerModel: string
    providerVersion: string
    disclosedContextIds: string[]
    dataRetention: DataRetentionChoice
    trainingConsent: TrainingConsent
  }
}

export const SUTRA_SANDBOX_POLICY = Object.freeze({
  tenantIsolation: 'REQUIRED' as const,
  contextDisclosure: 'LEAST_CONTEXT_REQUIRED' as const,
  defaultAccess: 'READ_ONLY' as const,
  generatedOutputs: 'PROPOSALS_UNTIL_HUMAN_ACCEPTANCE' as const,
  projectMutation: 'EXPLICIT_HUMAN_CONFIRMATION_REQUIRED' as const,
  repositoryAccess: false,
  websiteAdministration: false,
  deploymentAuthority: false,
  releaseAuthority: false,
  crossTenantAccess: false,
})

export function evaluateSandboxRequest(request: SutraSandboxRequest): SutraSandboxDecision {
  const reasons: string[] = []
  const requested = new Set(request.requestedContextIds)
  const excessiveDisclosure = request.disclosedContextIds.filter((id) => !requested.has(id))

  if (!request.tenantId || !request.projectId || !request.actorId) reasons.push('Tenant, project and actor identity are required.')
  if (!request.providerModel || !request.providerVersion) reasons.push('Provider model and version are required for auditability.')
  if (excessiveDisclosure.length) reasons.push(`Context disclosure exceeds the requested minimum: ${excessiveDisclosure.join(', ')}.`)
  if (request.accessMode === 'PROJECT_MUTATION' && !request.projectMutationConfirmationId) reasons.push('Project mutation requires an explicit human confirmation record.')
  if (request.provider !== 'FERRUM_NATIVE' && request.trainingConsent === 'EXPLICIT_TRAINING_OPT_IN') reasons.push('External providers cannot receive Ferrum customer data for training through the project sandbox.')

  const allowed = reasons.length === 0
  const effectiveAccess = !allowed
    ? 'DENIED'
    : request.accessMode === 'PROJECT_MUTATION'
      ? 'CONFIRMED_PROJECT_MUTATION'
      : request.accessMode

  return {
    allowed,
    reasons,
    effectiveAccess,
    audit: {
      requestId: request.requestId,
      tenantId: request.tenantId,
      projectId: request.projectId,
      actorId: request.actorId,
      provider: request.provider,
      providerModel: request.providerModel,
      providerVersion: request.providerVersion,
      disclosedContextIds: [...request.disclosedContextIds],
      dataRetention: request.dataRetention,
      trainingConsent: request.trainingConsent,
    },
  }
}

export type KnowledgeLicence = 'OPEN' | 'PUBLIC_DOMAIN' | 'LICENSED' | 'CUSTOMER_AUTHORIZED' | 'UNKNOWN'
export type KnowledgeSource = {
  sourceId: string
  title: string
  editionOrVersion: string
  jurisdiction: string | null
  licence: KnowledgeLicence
  sourceUri: string
  citationRequired: boolean
  tenantId: string | null
  retrievalConsent: boolean
  trainingConsent: TrainingConsent
}

export type LearningPromotion = {
  sourceId: string
  candidateVersion: string
  reviewerIds: string[]
  evaluationId: string | null
  approvedReleaseId: string | null
}

export function canUseForRetrieval(source: KnowledgeSource, activeTenantId: string | null): boolean {
  if (!['OPEN', 'PUBLIC_DOMAIN', 'LICENSED', 'CUSTOMER_AUTHORIZED'].includes(source.licence)) return false
  if (!source.retrievalConsent) return false
  if (source.licence === 'CUSTOMER_AUTHORIZED') return Boolean(source.tenantId && source.tenantId === activeTenantId)
  return source.tenantId === null
}

export function canPromoteLearning(source: KnowledgeSource, promotion: LearningPromotion): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = []
  if (source.sourceId !== promotion.sourceId) reasons.push('Promotion source does not match the reviewed source.')
  if (source.licence === 'UNKNOWN') reasons.push('Unknown-licence material cannot enter the learning pipeline.')
  if (source.licence === 'CUSTOMER_AUTHORIZED' && source.trainingConsent !== 'EXPLICIT_TRAINING_OPT_IN') reasons.push('Customer material requires explicit training opt-in.')
  if (!promotion.candidateVersion) reasons.push('A versioned learning candidate is required.')
  if (!promotion.reviewerIds.length) reasons.push('Human review is required.')
  if (!promotion.evaluationId) reasons.push('A recorded evaluation is required.')
  if (!promotion.approvedReleaseId) reasons.push('An approved versioned release is required.')
  return { allowed: reasons.length === 0, reasons }
}
