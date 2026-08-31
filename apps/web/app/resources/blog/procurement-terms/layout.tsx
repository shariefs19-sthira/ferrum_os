import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'Procurement Terms for Indian Construction - Ferrum OS',
  description: 'A working glossary of the procurement terms that show up in Indian construction contracts: rate-only, item-rate, lumpsum, EPC, and the clauses that decide who carries the risk.',
  openGraph: {
    title: 'Procurement Terms for Indian Construction - Ferrum OS',
    description: 'A working glossary of the procurement terms that show up in Indian construction contracts: rate-only, item-rate, lumpsum, EPC, and the clauses that decide who carries the risk.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function ProcurementTermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/blog/procurement-terms"
      />
      {children}
    </>
  )
}
