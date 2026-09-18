import type { CockpitProduct } from '../../components/workspace/ProductCockpitPreview'
import { productFeatureRegistry, productLabels, type ProductFeature } from '../productFeatureRegistry'
import type { ConciergeAnswer } from './concierge'

const entries = Object.entries(productFeatureRegistry) as [CockpitProduct, ProductFeature[]][]
const explanationIntent = /explain|feature|capabilit|what can|how does|how do|details?|everything|complete|available/i

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function findProduct(input: string): CockpitProduct | null {
  const query = normalize(input)
  return entries.find(([id]) => query.includes(normalize(id)) || query.includes(normalize(productLabels[id])))?.[0] ?? null
}

function findFeature(input: string, productId?: CockpitProduct | null) {
  const query = normalize(input)
  const queryTokens = new Set(query.split(' '))
  const candidates = productId ? productFeatureRegistry[productId].map((feature) => ({ productId, feature })) : entries.flatMap(([id, features]) => features.map((feature) => ({ productId: id, feature })))
  return candidates
    .map((candidate) => {
      const terms = [candidate.feature.title, ...candidate.feature.keywords].map(normalize).filter(Boolean)
      const score = terms.reduce((total, term) => total + (term.includes(' ') ? (query.includes(term) ? term.length : 0) : (queryTokens.has(term) ? term.length : 0)), 0)
      return { ...candidate, score }
    })
    .sort((a, b) => b.score - a.score)[0]
}

export function answerProductKnowledge(input: string): ConciergeAnswer | null {
  if (!explanationIntent.test(input)) return null
  const productId = findProduct(input)
  const match = findFeature(input, productId)
  if (match && match.score > 0) {
    return {
      text: `${match.feature.title} · ${match.feature.availability.replace('_', ' ')}. ${match.feature.body}`,
      citations: [{ title: `${productLabels[match.productId]}: ${match.feature.title}`, href: `/products/${match.productId}` }],
      source: 'retrieval',
    }
  }
  if (!productId) return null
  const features = productFeatureRegistry[productId]
  return {
    text: `${productLabels[productId]} includes ${features.length} documented features: ${features.map((feature) => `${feature.title} [${feature.availability.replace('_', ' ')}] — ${feature.body}`).join(' ')}`,
    citations: [{ title: `${productLabels[productId]} feature library`, href: `/products/${productId}` }],
    source: 'retrieval',
  }
}
