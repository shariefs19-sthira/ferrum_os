// SUTRA read-only knowledge access - adapter boundary.
//
// Two adapter kinds ever pull retrieval context: the local/open-model
// adapter (runs inside Ferrum's own boundary, no data leaves it) and the
// external-model adapter (a connected provider such as Claude or Codex).
// This module is the single deterministic gate `AdapterDecisionService.resolve`
// that every retrieval handoff must pass through - it does not merely
// describe the boundary, it enforces it in code: tenant visibility,
// classification ceiling, the existing SUTRA sandbox policy
// (sandboxPolicy.ts's `evaluateSandboxRequest`), the source's own
// licence/consent gate (`canUseForRetrieval`), and - for any external
// PROJECT_SENSITIVE disclosure specifically - an explicit human disclosure
// consent record bound to this exact disclosure. Request-asserted retention
// is evidence of neither human consent nor an authorization grant. A fragment that
// fails any one of these gates is denied; nothing here grants the
// external permission envelope except as the direct result of an
// `allowed: true` decision.

import { classificationRank, isVisibleToTenant, type DataClassification, type KnowledgeFragment } from './ragClassification'
import {
  canUseForRetrieval,
  evaluateSandboxRequest,
  type KnowledgeSource,
  type SutraSandboxRequest,
} from './sandboxPolicy'

export type AdapterKind = 'LOCAL_OPEN_MODEL' | 'EXTERNAL_MODEL'
export type ExternalModelProvider = 'CLAUDE' | 'CODEX'

export type AdapterIdentity =
  | { kind: 'LOCAL_OPEN_MODEL'; modelId: string }
  | { kind: 'EXTERNAL_MODEL'; provider: ExternalModelProvider; modelId: string }

/**
 * Immutable permission envelope every external-model adapter call
 * carries. Frozen so no call site can widen it at runtime - a broader
 * grant requires a new, separately-reviewed type, never a mutation of
 * this one. This envelope governs retrieval only: it grants no write,
 * no website/administration, no deploy and no delete authority,
 * regardless of what the external provider itself is otherwise capable
 * of outside this boundary. `AdapterDecisionService.resolve` below only ever
 * returns this envelope attached to an `allowed: true` decision - a
 * denied decision carries no envelope, so a caller can never mistake a
 * denial for a scoped grant.
 */
export const EXTERNAL_ADAPTER_PERMISSION_ENVELOPE = Object.freeze({
  canRead: true,
  canRetrieve: true,
  canWriteProjectData: false,
  canWriteRepository: false,
  canModifyWebsite: false,
  canDeploy: false,
  canDeleteData: false,
  canAdministerAccounts: false,
  canTrainOnDisclosedData: false,
  allowedOperations: Object.freeze(['READ', 'RETRIEVE', 'SUMMARIZE', 'CITE'] as const),
})

export type ExternalAdapterPermissionEnvelope = typeof EXTERNAL_ADAPTER_PERMISSION_ENVELOPE

/** Highest classification each adapter kind may ever receive. */
const ADAPTER_CLASSIFICATION_CEILING: Record<AdapterKind, DataClassification> = {
  LOCAL_OPEN_MODEL: 'RESTRICTED',
  EXTERNAL_MODEL: 'PROJECT_SENSITIVE',
}

export function isClassificationEligibleForAdapter(classification: DataClassification, adapterKind: AdapterKind): boolean {
  return classificationRank(classification) <= classificationRank(ADAPTER_CLASSIFICATION_CEILING[adapterKind])
}

export type ExternalDisclosurePurpose = 'SUTRA_READONLY_RETRIEVAL'

/**
 * Stable reference to a consent record held by the consent store. This is
 * deliberately not the record: a caller can freeze a forged object, but that
 * does not make it store-issued evidence.
 */
export type ExternalDisclosureConsentReference = Readonly<{
  immutableConfirmationId: string
  recordDigest: string
  recordVersion: string
}>

/** The exact disclosure binding a deterministic consent-store verifier returns. */
export type VerifiedExternalDisclosureBinding = Readonly<{
  projectId: string
  provider: ExternalModelProvider
  providerModel: string
  classification: DataClassification
  fragmentId: string
  purpose: ExternalDisclosurePurpose
}>

/**
 * Deterministic, server-side consent-store boundary. It receives the immutable
 * reference plus the intended disclosure binding, then returns evidence from
 * the store. It must perform no provider/network work; a production adapter
 * may supply a cached store-backed implementation.
 */
export type ExternalDisclosureConsentStore = Readonly<{
  verify(reference: ExternalDisclosureConsentReference, expected: VerifiedExternalDisclosureBinding): ConsentStoreVerificationResult
}>

export type ConsentStoreVerificationResult = Readonly<{
  verified: boolean
  immutableConfirmationId: string
  recordDigest: string
  recordVersion: string
  binding: VerifiedExternalDisclosureBinding
}>

export type AdapterDecision = {
  allowed: boolean
  reasons: string[]
  permissionEnvelope: ExternalAdapterPermissionEnvelope | null
}

export type AdapterDecisionRequest = {
  fragment: KnowledgeFragment
  identity: AdapterIdentity
  tenantId: string | null
  projectId: string | null
  /** The existing SUTRA sandbox request this retrieval is happening under - evaluated via sandboxPolicy.ts's own `evaluateSandboxRequest`, never re-derived here. */
  sandboxRequest: SutraSandboxRequest
  /** The knowledge source `fragment` was drawn from - its licence/consent is checked via sandboxPolicy.ts's own `canUseForRetrieval`, never re-derived here. */
  knowledgeSource: KnowledgeSource
  /** Store reference. The verifier is held by AdapterDecisionService, never request data. */
  externalDisclosureConsentReference: ExternalDisclosureConsentReference | null
}

/**
 * Resolves whether `fragment` may be handed to the given adapter. Every
 * gate is evaluated independently so all applicable reasons surface
 * together, never masked by an early return:
 *
 * 1. Tenant/project visibility (`isVisibleToTenant`).
 * 2. Classification ceiling for the adapter kind.
 * 3. The sandbox request's own identity actually matches this adapter
 *    (a sandbox decision for a different provider never authorizes
 *    this call).
 * 4. The existing SUTRA sandbox policy (`evaluateSandboxRequest`) must
 *    allow the request.
 * 5. The knowledge source `fragment` came from must match it by id and
 *    pass the existing licence/consent gate (`canUseForRetrieval`).
 * 6. Any external-adapter disclosure of a PROJECT_SENSITIVE fragment
 *    additionally requires an unexpired, immutable human consent record bound
 *    to this project, provider/model, classification, fragment and purpose.
 *
 * The permission envelope is only ever attached when `allowed` is
 * true - it is the enforced grant, not a label attached regardless of
 * outcome.
 */
/**
 * Retrieval composition root. The server selects and injects its trusted
 * consent-store boundary here. The private field deliberately keeps that
 * boundary out of caller-controlled AdapterDecisionRequest data.
 */
export class AdapterDecisionService {
  private readonly consentStore: ExternalDisclosureConsentStore

  private constructor(consentStore: ExternalDisclosureConsentStore) {
    this.consentStore = consentStore
  }

  static compose(consentStore: ExternalDisclosureConsentStore): AdapterDecisionService {
    return new AdapterDecisionService(consentStore)
  }

  resolve(request: AdapterDecisionRequest): AdapterDecision {
    const { fragment, identity, tenantId, projectId, sandboxRequest, knowledgeSource, externalDisclosureConsentReference } = request
    const reasons: string[] = []

    if (!isVisibleToTenant(fragment, tenantId, projectId)) {
      reasons.push('Fragment is not visible to this tenant/project.')
    }

    if (!isClassificationEligibleForAdapter(fragment.classification, identity.kind)) {
      reasons.push(`Classification ${fragment.classification} exceeds the ${identity.kind} adapter's ceiling.`)
    }

    const sandboxIdentityMatches =
      identity.kind === 'EXTERNAL_MODEL' ? sandboxRequest.provider === identity.provider : sandboxRequest.provider === 'FERRUM_NATIVE'
    if (!sandboxIdentityMatches) {
      reasons.push('Sandbox request provider does not match the adapter identity presented for this retrieval.')
    }

    const sandboxDecision = evaluateSandboxRequest(sandboxRequest)
    if (!sandboxDecision.allowed) {
      reasons.push(`SUTRA sandbox policy denied this request: ${sandboxDecision.reasons.join('; ')}`)
    }

    if (knowledgeSource.sourceId !== fragment.sourceId) {
      reasons.push('Knowledge source does not match the fragment being retrieved.')
    } else if (!canUseForRetrieval(knowledgeSource, tenantId)) {
      reasons.push('Source licence/consent does not permit retrieval.')
    }

    if (identity.kind === 'EXTERNAL_MODEL' && fragment.classification === 'PROJECT_SENSITIVE') {
      reasons.push(...validateExternalDisclosureConsent(externalDisclosureConsentReference, this.consentStore, { fragment, identity, projectId, sandboxRequest }))
    }

    const allowed = reasons.length === 0
    return {
      allowed,
      reasons,
      permissionEnvelope: allowed && identity.kind === 'EXTERNAL_MODEL' ? EXTERNAL_ADAPTER_PERMISSION_ENVELOPE : null,
    }
  }
}

function validateExternalDisclosureConsent(
  reference: ExternalDisclosureConsentReference | null,
  consentStore: ExternalDisclosureConsentStore,
  context: Pick<AdapterDecisionRequest, 'fragment' | 'identity' | 'projectId' | 'sandboxRequest'>,
): string[] {
  if (!reference) return ['External PROJECT_SENSITIVE disclosure requires consent-store verification evidence.']

  const reasons: string[] = []
  if (!Object.isFrozen(reference) || !reference.immutableConfirmationId || !reference.recordDigest || !reference.recordVersion) {
    reasons.push('External disclosure consent reference must carry immutable id, digest and version.')
    return reasons
  }
  if (context.identity.kind !== 'EXTERNAL_MODEL') return ['External disclosure consent verification was requested for a non-external adapter.']

  const expected: VerifiedExternalDisclosureBinding = Object.freeze({
    projectId: context.projectId ?? '',
    provider: context.identity.provider,
    providerModel: context.identity.modelId,
    classification: context.fragment.classification,
    fragmentId: context.fragment.fragmentId,
    purpose: 'SUTRA_READONLY_RETRIEVAL',
  })
  let result: ConsentStoreVerificationResult
  try {
    result = consentStore.verify(reference, expected)
  } catch {
    return ['Consent-store verifier did not produce verification evidence.']
  }
  if (!Object.isFrozen(result) || !Object.isFrozen(result.binding)) reasons.push('Consent-store verification evidence must be immutable.')
  if (!result.verified) reasons.push('Consent-store verifier did not verify this disclosure consent.')
  if (result.immutableConfirmationId !== reference.immutableConfirmationId || result.recordDigest !== reference.recordDigest || result.recordVersion !== reference.recordVersion) {
    reasons.push('Consent-store verification evidence does not match the immutable consent id, digest and version.')
  }
  if (
    result.binding.projectId !== expected.projectId || result.binding.provider !== expected.provider || result.binding.providerModel !== expected.providerModel ||
    result.binding.classification !== expected.classification || result.binding.fragmentId !== expected.fragmentId || result.binding.purpose !== expected.purpose
  ) reasons.push('Consent-store verification evidence is not bound to this exact disclosure.')
  return reasons
}
