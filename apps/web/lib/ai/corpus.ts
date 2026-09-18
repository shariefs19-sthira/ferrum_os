// AI-01 (CLAUDE-20260917-AI-FOUNDATION-LIVE). Build-time retrieval corpus:
// real, already-published Ferrum OS content only, each entry traceable to
// a real route on this site. No third-party or user-submitted text, no
// invented facts -- mirrors the source-grounded constraint in
// docs/CONCIERGE_LLM_GROUNDING.md #1. Extend this file when new public
// content ships; the retrieval index (retrieval.ts) is generated from it
// deterministically at request time, no separate build step required.

import { PRODUCTS, TOOLS, GENERAL, type CatalogEntry } from '../concierge/catalog'
import { faqs } from '../../app/resources/faq/data'
import { STANDARDS } from '../resources/registry'
import { productFeatureList, productLabels, productRoutes } from '../productFeatureRegistry'

export type CorpusDoc = {
  id: string
  title: string
  href: string
  /** The actual published text this doc answers from. */
  text: string
  keywords: string[]
}

function fromCatalog(entries: CatalogEntry[], kind: string): CorpusDoc[] {
  return entries.map((e) => ({
    id: `${kind}:${e.id}`,
    title: e.label,
    href: e.href,
    text: `${e.label} -- Ferrum OS ${kind}. Relevant to: ${e.keywords.join(', ')}.`,
    keywords: e.keywords,
  }))
}

// Generated directly from apps/web/app/resources/faq/page.tsx's exported
// `faqs` array -- never hand-copied, so retrieval can't drift from the
// page's actual published copy.
const FAQ_DOCS: CorpusDoc[] = faqs.map((faq, i) => ({
  id: `faq:${i}`,
  title: faq.question,
  href: '/resources/faq',
  text: faq.answer,
  keywords: [faq.category.toLowerCase()],
}))

// Generated directly from apps/web/lib/resources/registry.ts's `STANDARDS`
// array -- the same array the Standards Navigator page renders from, so
// retrieval can't drift from what the page actually publishes.
const STANDARDS_DOCS: CorpusDoc[] = STANDARDS.map((standard) => ({
  id: `standard:${standard.code.toLowerCase().replace(/\s+/g, '-')}`,
  title: `${standard.code} -- ${standard.use}`,
  href: '/resources/standards-navigator',
  text: `${standard.code} covers ${standard.use}. Ferrum OS workflow stance: ${standard.stance}. ${standard.note} Publisher: ${standard.publisher}.`,
  keywords: [standard.code.toLowerCase(), standard.stance.toLowerCase()],
}))

/** Generated from the same registry rendered by every product page. */
export const PRODUCT_FEATURE_DOCS: CorpusDoc[] = productFeatureList.map((feature) => ({
  id: `product-feature:${feature.productId}:${feature.id}`,
  title: `${productLabels[feature.productId]}: ${feature.title}`,
  href: `/products/${productRoutes[feature.productId]}`,
  text: `${feature.title} is ${feature.availability.replace('_', ' ').toLowerCase()} in ${productLabels[feature.productId]}. ${feature.body}`,
  keywords: [feature.productId, productLabels[feature.productId], feature.title, feature.availability, ...feature.keywords],
}))

export const CORPUS: CorpusDoc[] = [
  ...fromCatalog(PRODUCTS, 'product'),
  ...fromCatalog(TOOLS, 'tool'),
  ...fromCatalog(GENERAL, 'page'),
  ...FAQ_DOCS,
  ...STANDARDS_DOCS,
  ...PRODUCT_FEATURE_DOCS,
]
