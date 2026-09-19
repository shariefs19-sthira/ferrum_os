// SUTRA read-only knowledge access - minimum-necessary context packaging
// and deterministic redaction.
//
// The server handoff owns packaging; this module contains only value types
// and redaction, with no independent packaging/authorization entry point.
// Packaging only ever includes the fragments a request explicitly named
// (never the whole matching corpus), drops anything the requesting
// tenant/project cannot see or the target adapter's classification
// ceiling forbids, and redacts personal-data patterns before a fragment
// is packaged - every included fragment still carries its own citation,
// so nothing packaged here is ever presented without provenance.

import { type DataClassification, type RetrievalCitation } from './ragClassification'
import { type AdapterIdentity } from './ragAdapterBoundary'

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
