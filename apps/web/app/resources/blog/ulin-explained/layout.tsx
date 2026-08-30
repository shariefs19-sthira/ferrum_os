import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ULPIN Explained - Ferrum OS',
  description: 'Understanding ULPIN (Unique Land Parcel Identification Number) and how unique land identifiers improve diligence, land records, and property comparisons.',
  openGraph: {
    title: 'ULPIN Explained - Ferrum OS',
    description: 'Understanding ULPIN (Unique Land Parcel Identification Number) and how unique land identifiers improve diligence, land records, and property comparisons.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function UlinExplainedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}