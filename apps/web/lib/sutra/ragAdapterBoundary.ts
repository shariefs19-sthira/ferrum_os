// SUTRA read-only knowledge access - adapter boundary.
//
// Two adapter kinds ever pull retrieval context: the local/open-model
// adapter (runs inside Ferrum's own boundary, no data leaves it) and the
// external-model adapter (a connected provider such as Claude or Codex,
// governed by lib/sutra/sandboxPolicy.ts's sandbox rules on top of this
// module's classification ceiling and immutable permission envelope).
// This module decides only the retrieval-side question: given a
// fragment's declared classification, may this adapter kind ever
// receive it, and under what fixed permission envelope.

import { classificationRank, isVisibleToTenant, type DataClassification, type KnowledgeFragment } from './ragClassification'

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
 * of outside this boundary.
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

export type AdapterDecision = {
  allowed: boolean
  reasons: string[]
  permissionEnvelope: ExternalAdapterPermissionEnvelope | null
}

/**
 * Resolves whether `fragment` may be handed to the given adapter. Denies
 * on tenant-visibility failure and on classification-ceiling breach
 * independently, so both reasons surface together rather than the first
 * one masking the second.
 */
export function resolveAdapterDecision(
  fragment: KnowledgeFragment,
  identity: AdapterIdentity,
  tenantId: string | null,
  projectId: string | null,
): AdapterDecision {
  const reasons: string[] = []
  if (!isVisibleToTenant(fragment, tenantId, projectId)) {
    reasons.push('Fragment is not visible to this tenant/project.')
  }
  if (!isClassificationEligibleForAdapter(fragment.classification, identity.kind)) {
    reasons.push(`Classification ${fragment.classification} exceeds the ${identity.kind} adapter's ceiling.`)
  }
  const allowed = reasons.length === 0
  return {
    allowed,
    reasons,
    permissionEnvelope: identity.kind === 'EXTERNAL_MODEL' ? EXTERNAL_ADAPTER_PERMISSION_ENVELOPE : null,
  }
}
