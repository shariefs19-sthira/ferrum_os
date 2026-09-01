// Deterministic intent matching for the Concierge (W2-307). No LLM, no
// network call — pure keyword scoring against the build-time catalog
// (lib/concierge/catalog.ts). Ambiguous or unmatched input falls back
// to a polite, honest "I couldn't find that" reply rather than
// guessing — a fabricated match is worse than an honest miss.

import { PRODUCTS, TOOLS, GENERAL, type CatalogEntry } from './catalog'

export type IntentMatch = {
  entry: CatalogEntry
  score: number
}

const ALL_ENTRIES: CatalogEntry[] = [...PRODUCTS, ...TOOLS, ...GENERAL]

function normalize(text: string): string {
  return text.toLowerCase().trim()
}

/** Scores every catalog entry against the input; highest score wins if above threshold. */
export function matchIntent(input: string): IntentMatch | null {
  const normalized = normalize(input)
  if (!normalized) return null

  let best: IntentMatch | null = null
  for (const entry of ALL_ENTRIES) {
    let score = 0
    if (normalized.includes(entry.label.toLowerCase())) score += 3
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword.toLowerCase())) score += 2
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score }
    }
  }
  return best
}

export const FALLBACK_MESSAGE =
  "I couldn't find that — I only know about Ferrum OS's products and tools, not general questions. Try one of the quick replies below, or reach out and a person will help."
