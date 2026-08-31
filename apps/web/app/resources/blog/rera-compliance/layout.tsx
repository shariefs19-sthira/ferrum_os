import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'RERA Compliance for Project Teams - Ferrum OS',
  description: 'Turning quarterly RERA statutory reporting, escrow, and post-handover records into a continuous discipline instead of a quarter-end scramble.',
  openGraph: {
    title: 'RERA Compliance for Project Teams - Ferrum OS',
    description: 'Turning quarterly RERA statutory reporting, escrow, and post-handover records into a continuous discipline instead of a quarter-end scramble.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function ReraComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/blog/rera-compliance"
        datePublished="2026-08-30"
        authorSeat="Cline-GLM-Flash"
      />
      {children}
    </>
  )
}
