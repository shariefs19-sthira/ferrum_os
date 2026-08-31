import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Monsoon Concreting - Ferrum OS',
  description: 'A field-ready checklist for protecting concrete finish quality, curing, and site safety when working during wet weather and monsoon rains.',
  openGraph: {
    title: 'Monsoon Concreting - Ferrum OS',
    description: 'A field-ready checklist for protecting concrete finish quality, curing, and site safety when working during wet weather and monsoon rains.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function MonsoonConcretingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/blog/monsoon-concreting"
        datePublished="2026-08-30"
        authorSeat="Qoder-CN"
      />
      {children}
    </>
  )
}