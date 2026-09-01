import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Public Library Foundation Retrofit Case Study - Ferrum OS',
  description: 'Budgeting a foundation retrofit after a geotechnical surprise: separating foundation contingency from the general retrofit budget to hold the schedule.',
  openGraph: {
    title: 'Public Library Foundation Retrofit Case Study - Ferrum OS',
    description: 'Budgeting a foundation retrofit after a geotechnical surprise: separating foundation contingency from the general retrofit budget to hold the schedule.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function LibraryRetrofitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/case-studies/library-retrofit"
        datePublished="2026-09-01"
        authorSeat="CRANE"
      />
      {children}
    </>
  )
}
