// SUTRA read-only knowledge access - shared adapter types and constants.
// Authorization and packaging live in ragRetrievalHandoff.server.ts. This
// module has no service factory and accepts no caller-configured authority.

import { classificationRank, type DataClassification, type KnowledgeFragment } from './ragClassification'
import {
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
 * of outside this boundary. `resolveAdapterDecision` in the server handoff only ever
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
  /** Store reference. The authority is private to the server handoff, never request data. */
  externalDisclosureConsentReference: ExternalDisclosureConsentReference | null
}
