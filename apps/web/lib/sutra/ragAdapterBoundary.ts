// SUTRA read-only knowledge access - adapter boundary.
//
// Two adapter kinds ever pull retrieval context: the local/open-model
// adapter (runs inside Ferrum's own boundary, no data leaves it) and the
// external-model adapter (a connected provider such as Claude or Codex).
// This module is the single deterministic gate `resolveAdapterDecision`
// that every retrieval handoff must pass through - it does not merely
// describe the boundary, it enforces it in code: tenant visibility,
// classification ceiling, the existing SUTRA sandbox policy
// (sandboxPolicy.ts's `evaluateSandboxRequest`), the source's own
// licence/consent gate (`canUseForRetrieval`), and - for any external
// PROJECT_SENSITIVE disclosure specifically - an explicit, non-default,
// classification-compatible data-retention choice. A fragment that
// fails any one of these gates is denied; nothing here grants the
// external permission envelope except as the direct result of an
// `allowed: true` decision.

import { classificationRank, isVisibleToTenant, type DataClassification, type KnowledgeFragment } from './ragClassification'
import {
  canUseForRetrieval,
  evaluateSandboxRequest,
  type DataRetentionChoice,
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
 * of outside this boundary. `resolveAdapterDecision` below only ever
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

/**
 * Retention choices that are both explicit (never `PROVIDER_DEFAULT`)
 * and compatible with disclosing PROJECT_SENSITIVE data to an external
 * adapter. `PROVIDER_DEFAULT` never qualifies - a provider's own
 * default retention behaviour is exactly what "explicit" is required to
 * override.
 */
const PROJECT_SENSITIVE_EXTERNAL_COMPATIBLE_RETENTION: readonly DataRetentionChoice[] = ['NO_RETENTION', 'FERRUM_MANAGED']

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
 *    additionally requires an explicit, non-default, classification-
 *    compatible data-retention choice on the sandbox request.
 *
 * The permission envelope is only ever attached when `allowed` is
 * true - it is the enforced grant, not a label attached regardless of
 * outcome.
 */
export function resolveAdapterDecision(request: AdapterDecisionRequest): AdapterDecision {
  const { fragment, identity, tenantId, projectId, sandboxRequest, knowledgeSource } = request
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
    if (!PROJECT_SENSITIVE_EXTERNAL_COMPATIBLE_RETENTION.includes(sandboxRequest.dataRetention)) {
      reasons.push(
        'External PROJECT_SENSITIVE disclosure requires an explicit, non-default data-retention choice (NO_RETENTION or FERRUM_MANAGED), not PROVIDER_DEFAULT.',
      )
    }
  }

  const allowed = reasons.length === 0
  return {
    allowed,
    reasons,
    permissionEnvelope: allowed && identity.kind === 'EXTERNAL_MODEL' ? EXTERNAL_ADAPTER_PERMISSION_ENVELOPE : null,
  }
}
