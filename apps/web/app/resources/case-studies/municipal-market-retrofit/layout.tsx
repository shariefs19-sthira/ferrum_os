import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Municipal Market Structural Retrofit Case Study - Ferrum OS',
  description: 'Retrofitting a trading hall without closing it: rotating work zones sequenced around active trading hours so every vendor kept trading throughout.',
  openGraph: {
    title: 'Municipal Market Structural Retrofit Case Study - Ferrum OS',
    description: 'Retrofitting a trading hall without closing it: rotating work zones sequenced around active trading hours so every vendor kept trading throughout.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function MunicipalMarketRetrofitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/case-studies/municipal-market-retrofit"
        datePublished="2026-09-01"
        authorSeat="CRANE"
      />
      {children}
    </>
  )
}
