// AI-02 (CLAUDE-20260917-AI-FOUNDATION-LIVE). Connects the existing
// deterministic Concierge (lib/concierge/intents.ts, W2-307) to
// retrieval-grounded answers with citations. Per
// docs/CONCIERGE_LLM_GROUNDING.md #3, the deterministic router is tried
// FIRST and always wins when it matches -- this keeps the common case
// cheap, fast, and unchanged. Retrieval only answers what the
// deterministic router misses, and only when it clears a confidence
// threshold; below that, the same honest FALLBACK_MESSAGE is returned.
// No LLM call, no API key, no network request -- everything here runs
// against static, build-time data, so this is fully functional with
// zero configured AI provider and zero model spend, satisfying AI-02's
// own acceptance criterion.

import { matchIntent, FALLBACK_MESSAGE } from '../concierge/intents'
import { retrieveConfident, type RetrievalHit } from './retrieval'
import { answerProductKnowledge } from './productKnowledge'

export type Citation = {
  title: string
  href: string
}

export type ConciergeAnswer = {
  text: string
  /** Present only when the answer is grounded in retrieved, published content. */
  citations: Citation[]
  /** 'deterministic' = exact catalog/route match; 'retrieval' = grounded answer; 'fallback' = honest miss. */
  source: 'deterministic' | 'retrieval' | 'fallback'
  /** Set when a deterministic route match should also navigate the user. */
  navigateHref?: string
}

function buildRetrievalAnswer(hits: RetrievalHit[]): ConciergeAnswer {
  const top = hits[0]
  const citations: Citation[] = hits.map((h) => ({ title: h.doc.title, href: h.doc.href }))
  return {
    text: top.doc.text,
    citations,
    source: 'retrieval',
  }
}

/**
 * The single entry point the Concierge UI calls. Order of resolution:
 * 1. Deterministic intent match (instant, free, unchanged from W2-307).
 * 2. Confident retrieval hit -- grounded answer + citations.
 * 3. Honest fallback -- never invents an answer with no traceable source.
 */
export function answerWithGrounding(input: string): ConciergeAnswer {
  const productKnowledge = answerProductKnowledge(input)
  if (productKnowledge) return productKnowledge

  const deterministic = matchIntent(input)
  if (deterministic) {
    return {
      text: `Here's ${deterministic.entry.label} -- taking you there now.`,
      citations: [{ title: deterministic.entry.label, href: deterministic.entry.href }],
      source: 'deterministic',
      navigateHref: deterministic.entry.href,
    }
  }

  const hits = retrieveConfident(input)
  if (hits.length > 0) {
    return buildRetrievalAnswer(hits)
  }

  return {
    text: FALLBACK_MESSAGE,
    citations: [],
    source: 'fallback',
  }
}
