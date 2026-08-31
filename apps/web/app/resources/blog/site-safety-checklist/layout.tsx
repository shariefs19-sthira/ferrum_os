import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Site Safety Checklist for Working Project Teams - Ferrum OS',
  description: 'What a foreman-grade safety walk actually looks like, and how to turn it into a repeatable checklist for working project teams.',
  openGraph: {
    title: 'Site Safety Checklist for Working Project Teams - Ferrum OS',
    description: 'What a foreman-grade safety walk actually looks like, and how to turn it into a repeatable checklist for working project teams.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function SiteSafetyChecklistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/blog/site-safety-checklist"
      />
      {children}
    </>
  )
}
