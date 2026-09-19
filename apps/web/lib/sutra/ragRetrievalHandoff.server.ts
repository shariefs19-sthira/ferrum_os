// Next rejects importing this boundary into a client component. Tests mock only
// this environment marker, never the consent authority or its policy decisions.
import 'next/dist/compiled/server-only'

import {
  EXTERNAL_ADAPTER_PERMISSION_ENVELOPE,
  isClassificationEligibleForAdapter,
  type AdapterDecision,
  type AdapterDecisionRequest,
  type ExternalDisclosureConsentReference,
} from './ragAdapterBoundary'
import { isVisibleToTenant, type KnowledgeFragment } from './ragClassification'
import { redactPersonalData, type ContextRequest, type PackagedContext } from './ragContextPackaging'
import { canUseForRetrieval, evaluateSandboxRequest, type KnowledgeSource, type SutraSandboxRequest } from './sandboxPolicy'

// Server-owned composition, with no exported factory, setter, verifier, record
// registration or proof-minting API. No authoritative consent repository is
// connected in this domain-only slice, so every external sensitive disclosure
// remains closed. A future server integration must replace this implementation
// with authoritative record verification; request data must never configure it.
const consentAuthority = Object.freeze({
  verify(_reference: ExternalDisclosureConsentReference): boolean {
    return false
  },
})

/** Diagnostic decision only. It is never accepted as packaging authorization. */
export function resolveAdapterDecision(request: AdapterDecisionRequest): AdapterDecision {
  const { fragment, identity, tenantId, projectId, sandboxRequest, knowledgeSource, externalDisclosureConsentReference } = request
  const reasons: string[] = []
  if (!isVisibleToTenant(fragment, tenantId, projectId)) reasons.push('Fragment is not visible to this tenant/project.')
  if (!isClassificationEligibleForAdapter(fragment.classification, identity.kind)) {
    reasons.push(`Classification ${fragment.classification} exceeds the ${identity.kind} adapter's ceiling.`)
  }
  const provider = identity.kind === 'EXTERNAL_MODEL' ? identity.provider : 'FERRUM_NATIVE'
  if (sandboxRequest.provider !== provider) reasons.push('Sandbox request provider does not match the adapter identity presented for this retrieval.')
  if (sandboxRequest.providerModel !== identity.modelId) reasons.push('Sandbox model does not match the adapter model.')
  if (sandboxRequest.tenantId !== tenantId || sandboxRequest.projectId !== projectId) reasons.push('Sandbox tenant/project does not match the retrieval context.')
  if (!sandboxRequest.requestedContextIds.includes(fragment.fragmentId) || !sandboxRequest.disclosedContextIds.includes(fragment.fragmentId)) {
    reasons.push('Fragment is not explicitly requested and disclosed in the sandbox context.')
  }
  if (sandboxRequest.accessMode !== 'READ_ONLY') reasons.push('Retrieval handoff requires read-only sandbox access.')
  if (identity.kind === 'EXTERNAL_MODEL' && !['NO_RETENTION', 'FERRUM_MANAGED'].includes(sandboxRequest.dataRetention)) {
    reasons.push('External retrieval requires an explicit no-retention or Ferrum-managed retention choice.')
  }
  const sandboxDecision = evaluateSandboxRequest(sandboxRequest)
  if (!sandboxDecision.allowed) reasons.push(`SUTRA sandbox policy denied this request: ${sandboxDecision.reasons.join('; ')}`)
  if (knowledgeSource.sourceId !== fragment.sourceId) reasons.push('Knowledge source does not match the fragment being retrieved.')
  else if (!canUseForRetrieval(knowledgeSource, tenantId)) reasons.push('Source licence/consent does not permit retrieval.')

  if (identity.kind === 'EXTERNAL_MODEL' && fragment.classification === 'PROJECT_SENSITIVE') {
    if (!externalDisclosureConsentReference) reasons.push('External PROJECT_SENSITIVE disclosure requires authoritative human consent.')
    else if (!consentAuthority.verify(externalDisclosureConsentReference)) {
      reasons.push('Authoritative consent verification is unavailable; external PROJECT_SENSITIVE disclosure is disabled.')
    }
  }
  const allowed = reasons.length === 0
  return { allowed, reasons, permissionEnvelope: allowed && identity.kind === 'EXTERNAL_MODEL' ? EXTERNAL_ADAPTER_PERMISSION_ENVELOPE : null }
}

export type RetrievalHandoffRequest = ContextRequest & {
  sandboxRequest: SutraSandboxRequest
  externalDisclosureConsentReferences: Readonly<Record<string, ExternalDisclosureConsentReference | undefined>>
}

/**
 * The sole content-producing handoff. Catalogue/source metadata must come from
 * server ingestion; no route or repository integration is claimed here. Caller
 * decisions, stores, verifiers and proofs are neither accepted nor consulted.
 * Decisions and packaging occur synchronously inside this boundary, so an
 * allowed diagnostic result cannot be replayed against different content.
 */
export function handoffRetrieval(
  request: RetrievalHandoffRequest,
  catalogue: readonly KnowledgeFragment[],
  sources: readonly KnowledgeSource[],
): PackagedContext {
  const byId = new Map(catalogue.map((fragment) => [fragment.fragmentId, fragment]))
  const bySourceId = new Map(sources.map((source) => [source.sourceId, source]))
  const result: PackagedContext = { requestId: request.requestId, fragments: [], excludedFragmentIds: [], exclusionReasons: {} }
  for (const fragmentId of Array.from(new Set(request.requestedFragmentIds))) {
    const fragment = byId.get(fragmentId)
    const source = fragment && bySourceId.get(fragment.sourceId)
    const reasons = !fragment ? ['Fragment not found in catalogue.'] : !source ? ['Knowledge source not found.'] : resolveAdapterDecision({
      fragment, identity: request.adapterIdentity, tenantId: request.tenantId, projectId: request.projectId,
      sandboxRequest: request.sandboxRequest, knowledgeSource: source,
      externalDisclosureConsentReference: request.externalDisclosureConsentReferences[fragmentId] ?? null,
    }).reasons
    if (request.requestId !== request.sandboxRequest.requestId) reasons.push('Sandbox request id does not match the handoff request.')
    if (reasons.length || !fragment) {
      result.excludedFragmentIds.push(fragmentId)
      result.exclusionReasons[fragmentId] = reasons
      continue
    }
    const { content, redactions } = redactPersonalData(fragmentId, fragment.content)
    result.fragments.push({ fragmentId, classification: fragment.classification, content, citation: { ...fragment.citation }, redactions })
  }
  return result
}
