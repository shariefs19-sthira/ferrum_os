import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'
import { RESEARCH_CASES } from '../../../../lib/resources/registry'

const item = RESEARCH_CASES.find((c) => c.slug === 'nbc-2016-scope')!

export const metadata: Metadata = {
  title: `${item.title} - Ferrum OS`,
  description: item.summary,
  openGraph: {
    title: `${item.title} - Ferrum OS`,
    description: item.summary,
    type: 'article',
    locale: 'en_US',
  },
  alternates: { canonical: `/resources/research-cases/${item.slug}` },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleJsonLd
        headline={item.title}
        description={item.summary}
        url={`/resources/research-cases/${item.slug}`}
        authorSeat="Ferrum OS Editorial Team"
      />
      {children}
    </>
  )
}
