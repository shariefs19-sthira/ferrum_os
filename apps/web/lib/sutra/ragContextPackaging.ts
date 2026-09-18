// SUTRA read-only knowledge access - minimum-necessary context packaging
// and deterministic redaction.
//
// Packaging only ever includes the fragments a request explicitly named
// (never the whole matching corpus), drops anything the requesting
// tenant/project cannot see or the target adapter's classification
// ceiling forbids, and redacts personal-data patterns before a fragment
// is packaged - every included fragment still carries its own citation,
// so nothing packaged here is ever presented without provenance.

import { isVisibleToTenant, type DataClassification, type KnowledgeFragment, type RetrievalCitation } from './ragClassification'
import { isClassificationEligibleForAdapter, type AdapterIdentity } from './ragAdapterBoundary'

export type ContextRequest = {
  requestId: string
  tenantId: string | null
  projectId: string | null
  adapterIdentity: AdapterIdentity
  requestedFragmentIds: string[]
  purpose: string
}

export type RedactionEvent = {
  fragmentId: string
  pattern: string
  occurrences: number
}

export type PackagedFragment = {
  fragmentId: string
  classification: DataClassification
  content: string
  citation: RetrievalCitation
  redactions: RedactionEvent[]
}

export type PackagedContext = {
  requestId: string
  fragments: PackagedFragment[]
  excludedFragmentIds: string[]
  exclusionReasons: Record<string, string[]>
}

const REDACTION_PATTERNS: { name: string; pattern: RegExp; replacement: string }[] = [
  { name: 'EMAIL', pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/g, replacement: '[REDACTED_EMAIL]' },
  { name: 'PHONE', pattern: /\+?\d[\d\-\s]{8,}\d/g, replacement: '[REDACTED_PHONE]' },
  { name: 'NATIONAL_ID', pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, replacement: '[REDACTED_ID]' },
]

/**
 * Deterministic pattern-based redaction of common personal-data shapes.
 * Runs over every fragment being packaged regardless of its declared
 * classification - redaction is a second, independent control, not a
 * substitute for classification-based exclusion.
 */
export function redactPersonalData(fragmentId: string, content: string): { content: string; redactions: RedactionEvent[] } {
  let result = content
  const redactions: RedactionEvent[] = []
  for (const { name, pattern, replacement } of REDACTION_PATTERNS) {
    const matches = result.match(pattern)
    if (matches && matches.length > 0) {
      redactions.push({ fragmentId, pattern: name, occurrences: matches.length })
      result = result.replace(pattern, replacement)
    }
  }
  return { content: result, redactions }
}

/**
 * Builds the minimum-necessary context for a request: only fragments the
 * request named, filtered to what the requesting tenant/project may see
 * and what the target adapter's classification ceiling allows, with
 * personal-data patterns redacted and citation/provenance carried on
 * every packaged fragment. Anything excluded is reported with its
 * specific reason(s), never silently dropped.
 */
export function packageMinimumNecessaryContext(request: ContextRequest, catalogue: KnowledgeFragment[]): PackagedContext {
  const byId = new Map(catalogue.map((fragment) => [fragment.fragmentId, fragment]))
  const fragments: PackagedFragment[] = []
  const excludedFragmentIds: string[] = []
  const exclusionReasons: Record<string, string[]> = {}

  for (const fragmentId of request.requestedFragmentIds) {
    const fragment = byId.get(fragmentId)
    const reasons: string[] = []
    if (!fragment) {
      reasons.push('Fragment not found in catalogue.')
    } else {
      if (!isVisibleToTenant(fragment, request.tenantId, request.projectId)) {
        reasons.push('Fragment not visible to this tenant/project.')
      }
      if (!isClassificationEligibleForAdapter(fragment.classification, request.adapterIdentity.kind)) {
        reasons.push(`Classification ${fragment.classification} exceeds the ${request.adapterIdentity.kind} adapter's ceiling.`)
      }
    }

    if (reasons.length > 0) {
      excludedFragmentIds.push(fragmentId)
      exclusionReasons[fragmentId] = reasons
      continue
    }

    const { content, redactions } = redactPersonalData(fragment!.fragmentId, fragment!.content)
    fragments.push({
      fragmentId: fragment!.fragmentId,
      classification: fragment!.classification,
      content,
      citation: fragment!.citation,
      redactions,
    })
  }

  return { requestId: request.requestId, fragments, excludedFragmentIds, exclusionReasons }
}
