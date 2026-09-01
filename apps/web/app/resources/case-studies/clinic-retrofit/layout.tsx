import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Community Clinic Seismic Retrofit Case Study - Ferrum OS',
  description: 'How a community clinic stayed open through its own seismic retrofit with zone-locked, after-hours-sequenced structural work in Ferrum OS BuildOS.',
  openGraph: {
    title: 'Community Clinic Seismic Retrofit Case Study - Ferrum OS',
    description: 'How a community clinic stayed open through its own seismic retrofit with zone-locked, after-hours-sequenced structural work in Ferrum OS BuildOS.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function ClinicRetrofitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/case-studies/clinic-retrofit"
        datePublished="2026-09-01"
        authorSeat="CRANE"
      />
      {children}
    </>
  )
}
