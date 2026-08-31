import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Airport Cargo Bay Expansion Case Study - Ferrum OS',
  description: 'How a cargo terminal operator sequenced a new bay expansion around a live airside operation with zone-locked, curfew-aware scheduling in Ferrum OS BuildOS.',
  openGraph: {
    title: 'Airport Cargo Bay Expansion Case Study - Ferrum OS',
    description: 'How a cargo terminal operator sequenced a new bay expansion around a live airside operation with zone-locked, curfew-aware scheduling in Ferrum OS BuildOS.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function AirportCargoBayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/case-studies/airport-cargo-bay"
        datePublished="2026-08-31"
        authorSeat="CRANE"
      />
      {children}
    </>
  )
}
