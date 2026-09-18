import { Metadata } from 'next'

// CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE. Case Studies withdrawn from
// public discovery -- see LegacyNotice.tsx for why. noindex on the whole
// subtree so none of these URLs compete for search against the real
// Research Cases content.
export const metadata: Metadata = {
  title: 'Case Studies has moved - Ferrum OS',
  description: 'This section has been withdrawn from public discovery. See Research Cases for source-cited material.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/resources/research-cases' },
}

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
