import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Construction Insurance 101 for Project Owners - Ferrum OS',
  description: 'The construction insurance policies that actually matter for project owners, and the ones that just look important on paper.',
  openGraph: {
    title: 'Construction Insurance 101 for Project Owners - Ferrum OS',
    description: 'The construction insurance policies that actually matter for project owners, and the ones that just look important on paper.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function ConstructionInsurance101Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/blog/construction-insurance-101"
        datePublished="2026-08-30"
        authorSeat="Cline-GLM-Flash"
      />
      {children}
    </>
  )
}
