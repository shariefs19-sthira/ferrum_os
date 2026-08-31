import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Greenfield Development Case Study - Ferrum OS',
  description: 'How a developer delivered a 500-acre greenfield community 15% ahead of schedule and 20% under budget with Ferrum OS.',
  openGraph: {
    title: 'Greenfield Development Case Study - Ferrum OS',
    description: 'How a developer delivered a 500-acre greenfield community 15% ahead of schedule and 20% under budget with Ferrum OS.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function GreenfieldDeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/case-studies/greenfield-developer"
        datePublished="2026-08-30"
        authorSeat="Cline-GLM-Flash"
      />
      {children}
    </>
  )
}