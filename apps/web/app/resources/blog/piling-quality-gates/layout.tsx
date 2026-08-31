import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quality Gates for Piling Work - Ferrum OS',
  description: 'Catching a bad pile before it is buried under a foundation: verification during installation, integrity testing before load, and documentation that survives handover.',
  openGraph: {
    title: 'Quality Gates for Piling Work - Ferrum OS',
    description: 'Catching a bad pile before it is buried under a foundation: verification during installation, integrity testing before load, and documentation that survives handover.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function PilingQualityGatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
