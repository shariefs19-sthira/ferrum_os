// AI-01 (CLAUDE-20260917-AI-FOUNDATION-LIVE). Build-time retrieval corpus:
// real, already-published Ferrum OS content only, each entry traceable to
// a real route on this site. No third-party or user-submitted text, no
// invented facts -- mirrors the source-grounded constraint in
// docs/CONCIERGE_LLM_GROUNDING.md #1. Extend this file when new public
// content ships; the retrieval index (retrieval.ts) is generated from it
// deterministically at request time, no separate build step required.

import { PRODUCTS, TOOLS, GENERAL, type CatalogEntry } from '../concierge/catalog'

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

// Sourced verbatim from apps/web/app/resources/faq/page.tsx -- do not
// paraphrase here; if that page's copy changes, update this list in the
// same PR so retrieval never cites stale text.
const FAQ_DOCS: CorpusDoc[] = [
  {
    id: 'faq:resources-library',
    title: 'What is in the Ferrum OS resources library?',
    href: '/resources/faq',
    text: 'A curated set of articles, case studies, and Indian construction standards guides. New entries ship regularly; older ones are reviewed when codes, markets, or product workflows change.',
    keywords: ['resources', 'library', 'articles', 'case studies'],
  },
  {
    id: 'faq:account-required',
    title: 'Do I need a Ferrum OS account to read the resources?',
    href: '/resources/faq',
    text: 'No. All articles, case studies, IS code guides, and this FAQ are public. Account access is only required to use the live product workflows such as LandIntel lookups, BOQ generation, and BuildOS project views.',
    keywords: ['account', 'sign up', 'login', 'free', 'public'],
  },
  {
    id: 'faq:citations',
    title: 'How are code references and standards cited?',
    href: '/resources/faq',
    text: 'Each reference uses the canonical IS code number (for example IS 1200, IS 456, IS 800, IS 875) and a one-line description. When a non-Indian standard is discussed, we note how it maps to Indian practice so teams can decide what to adopt, hold, or drop in their own workflow.',
    keywords: ['is code', 'standards', 'citation', 'is 456', 'is 800', 'is 875', 'is 1200'],
  },
  {
    id: 'faq:update-cadence',
    title: 'How often is the resources content updated?',
    href: '/resources/faq',
    text: 'Articles and case studies are updated when product behaviour, market context, or referenced standards change. Code-guide stances (Adopt, Hold, Drop) are reviewed at least once per quarter.',
    keywords: ['update', 'how often', 'review', 'quarter'],
  },
  {
    id: 'faq:contribute',
    title: 'Can I suggest a topic or submit a case study?',
    href: '/resources/faq',
    text: 'Yes. Reach the team through the contact page with the working title, a short outline, and any links to drawings, approvals, or published references that should inform the writeup.',
    keywords: ['suggest', 'submit', 'contribute', 'contact'],
  },
  {
    id: 'faq:geography',
    title: 'Is the content specific to India?',
    href: '/resources/faq',
    text: 'Yes. The library focuses on Indian land records, planning, compliance, contractor coordination, and delivery realities. Where international standards are referenced, the article explains the Indian equivalent or boundary condition.',
    keywords: ['india', 'geography', 'indian standards'],
  },
]

// Sourced from apps/web/app/resources/is-code-guides/page.tsx's
// measurementRows table -- same do-not-paraphrase discipline as FAQ_DOCS.
const IS_CODE_DOCS: CorpusDoc[] = [
  {
    id: 'is-code:is-1200',
    title: 'IS 1200 -- measurement and billing stance',
    href: '/resources/is-code-guides',
    text: 'IS 1200 covers measurement and billing for civil works. Stance: Adopt. Best fit for Indian BOQ practices, easy to align with site measurement, and familiar to public works teams.',
    keywords: ['is 1200', 'measurement', 'billing', 'boq'],
  },
  {
    id: 'is-code:cesmm4',
    title: 'CESMM4 -- civil engineering measurement stance',
    href: '/resources/is-code-guides',
    text: 'CESMM4 covers civil engineering measurement rules for contract administration. Stance: Hold. Useful as a reference model for method statements and risk allocation, but not a direct replacement for Indian project standards without localization.',
    keywords: ['cesmm4', 'contract administration', 'measurement rules'],
  },
  {
    id: 'is-code:structural',
    title: 'IS 456 / IS 875 / IS 800 -- structural and material design stance',
    href: '/resources/is-code-guides',
    text: 'IS 456 / IS 875 / IS 800 cover structural and material design controls. Stance: Adopt. These remain the default technical rules for concrete, steel and loading design in Indian execution environments.',
    keywords: ['is 456', 'is 875', 'is 800', 'structural design', 'concrete', 'steel', 'loading'],
  },
]

export const CORPUS: CorpusDoc[] = [
  ...fromCatalog(PRODUCTS, 'product'),
  ...fromCatalog(TOOLS, 'tool'),
  ...fromCatalog(GENERAL, 'page'),
  ...FAQ_DOCS,
  ...IS_CODE_DOCS,
]
