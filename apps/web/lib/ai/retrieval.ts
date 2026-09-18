// AI-01 (CLAUDE-20260917-AI-FOUNDATION-LIVE). Deterministic build-time
// retrieval over CORPUS (corpus.ts) -- plain keyword/TF-IDF-style scoring,
// no embeddings, no external model, no new dependency. Runs entirely
// client- or edge-side against static data checked into the repo, so it
// works with zero configured AI provider (per the packet's AI-02
// acceptance criterion: "The existing deterministic concierge remains
// usable with zero external AI API keys and zero model spend").

import { CORPUS, type CorpusDoc } from './corpus'

export type RetrievalHit = {
  doc: CorpusDoc
  score: number
}

/** Below this score, treat the corpus as not confidently answering the question. */
export const CONFIDENCE_THRESHOLD = 2

function normalize(text: string): string {
  return text.toLowerCase().trim()
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1)
}

/**
 * Scores every corpus doc against the query using term overlap weighted by
 * field (title/keyword matches count more than body-text matches, mirroring
 * how a human skimming search results would weight a title hit over a
 * buried mention). Deterministic: same query always produces the same
 * ranked list, so answers and citations are reproducible and auditable.
 */
export function retrieve(query: string, topK = 3): RetrievalHit[] {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []

  const hits: RetrievalHit[] = []
  for (const doc of CORPUS) {
    const titleNorm = normalize(doc.title)
    const textNorm = normalize(doc.text)
    const keywordNorm = doc.keywords.map(normalize)

    let score = 0
    for (const token of queryTokens) {
      if (titleNorm.includes(token)) score += 3
      if (keywordNorm.some((k) => k.includes(token) || token.includes(k))) score += 3
      if (textNorm.includes(token)) score += 1
    }
    if (score > 0) hits.push({ doc, score })
  }

  hits.sort((a, b) => b.score - a.score)
  const selected = hits.slice(0, topK)
  // Feature-level documents can legitimately outrank their product overview,
  // but the overview must remain discoverable rather than being crowded out
  // by several controls from the same product.
  for (const hit of [...selected]) {
    if (!hit.doc.id.startsWith('product-feature:')) continue
    const productId = hit.doc.id.split(':')[1]
    const parent = hits.find((candidate) => candidate.doc.id === `product:${productId}`)
    if (parent && !selected.some((candidate) => candidate.doc.id === parent.doc.id)) {
      selected[selected.length - 1] = parent
    }
  }
  // A broad feature corpus can crowd a directly matching product overview
  // outside topK even when none of the selected feature rows happens to be
  // the one that triggers the parent-injection loop above. Preserve the best
  // matching product entry as the stable navigation/citation anchor.
  const bestProduct = hits.find((hit) => hit.doc.id.startsWith('product:'))
  if (bestProduct && !selected.some((hit) => hit.doc.id === bestProduct.doc.id)) {
    selected[selected.length - 1] = bestProduct
  }
  return selected.sort((a, b) => b.score - a.score)
}

export function retrieveConfident(query: string, topK = 3): RetrievalHit[] {
  const hits = retrieve(query, topK)
  return hits.filter((h) => h.score >= CONFIDENCE_THRESHOLD)
}
