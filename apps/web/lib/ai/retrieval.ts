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
  return hits.slice(0, topK)
}

export function retrieveConfident(query: string, topK = 3): RetrievalHit[] {
  const hits = retrieve(query, topK)
  return hits.filter((h) => h.score >= CONFIDENCE_THRESHOLD)
}
