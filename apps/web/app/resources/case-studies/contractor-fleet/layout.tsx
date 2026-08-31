import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Contractor Fleet Management Case Study - Ferrum OS',
  description: 'How a 25-site, 150+ vehicle construction company achieved 30% better fleet utilization and 25% lower maintenance costs with Ferrum OS.',
  openGraph: {
    title: 'Contractor Fleet Management Case Study - Ferrum OS',
    description: 'How a 25-site, 150+ vehicle construction company achieved 30% better fleet utilization and 25% lower maintenance costs with Ferrum OS.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function ContractorFleetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/case-studies/contractor-fleet"
        datePublished="2026-08-30"
        authorSeat="Cline-GLM-Flash"
      />
      {children}
    </>
  )
}