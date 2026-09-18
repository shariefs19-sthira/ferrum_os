import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'
import { RESEARCH_CASES } from '../../../../lib/resources/registry'

const item = RESEARCH_CASES.find((c) => c.slug === 'survey-of-india-geospatial-guidelines')!

export const metadata: Metadata = {
  title: `${item.title} - Ferrum OS`,
  description: item.summary,
  openGraph: {
    title: `${item.title} - Ferrum OS`,
    description: item.summary,
    type: 'article',
    locale: 'en_US',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleJsonLd
        headline={item.title}
        description={item.summary}
        url={`/resources/research-cases/${item.slug}`}
        datePublished="2026-09-18"
        authorSeat="CLAUDE"
      />
      {children}
    </>
  )
}
