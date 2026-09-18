// Split out of page.tsx: Next.js's page-typegen only permits a fixed set of
// named exports (default, metadata, generateStaticParams, ...) from a
// page.tsx file, so `faqs` can't live there and also be imported by
// lib/ai/corpus.ts for retrieval. This is the single source of truth for
// both.
export const faqs = [
  {
    category: 'Resources',
    question: 'What is in the Ferrum OS resources library?',
    answer: 'A curated set of articles, source-cited research cases, and Indian construction standards guidance. New entries ship regularly; older ones are reviewed when codes, markets, or product workflows change.'
  },
  {
    category: 'Reading',
    question: 'Do I need a Ferrum OS account to read the resources?',
    answer: 'No. All articles, research cases, the standards navigator, and this FAQ are public. Account access is only required to use the live product workflows such as LandIntel lookups, BOQ generation, and BuildOS project views.'
  },
  {
    category: 'Citations',
    question: 'How are code references and standards cited?',
    answer: 'Each reference uses the canonical IS code number (for example IS 1200, IS 456, IS 800, IS 875) and a one-line description. When a non-Indian standard is discussed, we note how it maps to Indian practice so teams can decide what to adopt, hold, or drop in their own workflow.'
  },
  {
    category: 'Updates',
    question: 'How often is the resources content updated?',
    answer: 'Articles and research cases are updated when product behaviour, market context, or referenced standards change. Standards Navigator stances (Adopt, Hold, Drop) are reviewed at least once per quarter.'
  },
  {
    category: 'Contributing',
    question: 'Can I suggest a topic or submit a research case?',
    answer: 'Yes. Reach the team through the contact page with the working title, a short outline, and the primary source (a statute, standard, or official dataset) that should ground the writeup -- research cases are only published when a verifiable primary source backs them.'
  },
  {
    category: 'Geography',
    question: 'Is the content specific to India?',
    answer: 'Yes. The library focuses on Indian land records, planning, compliance, contractor coordination, and delivery realities. Where international standards are referenced, the article explains the Indian equivalent or boundary condition.'
  }
]
