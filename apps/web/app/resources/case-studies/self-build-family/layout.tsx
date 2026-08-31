import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Self-Build Family Home Case Study - Ferrum OS',
  description: 'How a self-build family delivered a custom home 10% under budget while keeping full control over design and construction with Ferrum OS.',
  openGraph: {
    title: 'Self-Build Family Home Case Study - Ferrum OS',
    description: 'How a self-build family delivered a custom home 10% under budget while keeping full control over design and construction with Ferrum OS.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function SelfBuildFamilyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/case-studies/self-build-family"
      />
      {children}
    </>
  )
}