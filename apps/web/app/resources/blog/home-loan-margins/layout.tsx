import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: "Home Loan Margins and the Builder's Cash-Flow Curve - Ferrum OS",
  description: 'How lender disbursement stages shape a builder\'s working capital and cash-flow planning across a project timeline.',
  openGraph: {
    title: "Home Loan Margins and the Builder's Cash-Flow Curve - Ferrum OS",
    description: 'How lender disbursement stages shape a builder\'s working capital and cash-flow planning across a project timeline.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function HomeLoanMarginsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/blog/home-loan-margins"
      />
      {children}
    </>
  )
}
