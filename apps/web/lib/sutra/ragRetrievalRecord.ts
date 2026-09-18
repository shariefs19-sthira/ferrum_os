// SUTRA read-only knowledge access - prompt-injection-resistant
// retrieval records.
//
// Retrieved content is DATA, never INSTRUCTIONS. This module never
// executes, strips silently, or otherwise treats a retrieved fragment's
// text as a command; it scans for instruction-shaped patterns and
// records what it found so a downstream prompt-builder can keep the
// fragment fenced as `contentFence: 'DATA_NOT_INSTRUCTION'` and a
// reviewer can see exactly what was flagged and why.

import type { PackagedContext, PackagedFragment } from './ragContextPackaging'

export type InjectionFlag = {
  fragmentId: string
  pattern: string
  excerpt: string
}

const INJECTION_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: 'IGNORE_INSTRUCTIONS', pattern: /ignore (?:all |any |previous |the above )+instructions/i },
  { name: 'ROLE_OVERRIDE', pattern: /you are now|act as (the )?system|disregard your (rules|guidelines)/i },
  { name: 'SECRET_EXFILTRATION', pattern: /reveal (your|the) (system prompt|api key|secret)/i },
  { name: 'PRIVILEGE_ESCALATION', pattern: /grant (yourself|me) (write|admin|deploy) access/i },
]

/** Scans one fragment's content for instruction-shaped text. Flags only - never acts on a match. */
export function scanForInjectionPatterns(fragmentId: string, content: string): InjectionFlag[] {
  const flags: InjectionFlag[] = []
  for (const { name, pattern } of INJECTION_PATTERNS) {
    const match = content.match(pattern)
    if (match) flags.push({ fragmentId, pattern: name, excerpt: match[0] })
  }
  return flags
}

export type RetrievalRecord = {
  requestId: string
  fragmentId: string
  classification: PackagedFragment['classification']
  citation: PackagedFragment['citation']
  /** Fixed tag every consumer keys off to keep this fragment fenced as data in any prompt it builds. */
  contentFence: 'DATA_NOT_INSTRUCTION'
  injectionFlags: InjectionFlag[]
  redactions: PackagedFragment['redactions']
}

/** Builds one immutable-in-intent retrieval record per packaged fragment. */
export function buildRetrievalRecords(packagedContext: PackagedContext): RetrievalRecord[] {
  return packagedContext.fragments.map((fragment) => ({
    requestId: packagedContext.requestId,
    fragmentId: fragment.fragmentId,
    classification: fragment.classification,
    citation: fragment.citation,
    contentFence: 'DATA_NOT_INSTRUCTION' as const,
    injectionFlags: scanForInjectionPatterns(fragment.fragmentId, fragment.content),
    redactions: fragment.redactions,
  }))
}
