import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research Cases - Ferrum OS',
  description:
    'Independent explainers grounded in named primary sources -- government codes, statutes, and open datasets -- with source, jurisdiction, and evidence status stated on every entry.',
  openGraph: {
    title: 'Research Cases - Ferrum OS',
    description:
      'Independent explainers grounded in named primary sources -- government codes, statutes, and open datasets -- with source, jurisdiction, and evidence status stated on every entry.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function ResearchCasesLayout({ children }: { children: React.ReactNode }) {
  return children
}
