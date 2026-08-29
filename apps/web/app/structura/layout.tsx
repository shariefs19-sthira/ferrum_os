import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Structura - Ferrum OS',
  description: 'Advanced structural engineering and building design software for architects and engineers.',
  openGraph: {
    title: 'Structura - Ferrum OS',
    description: 'Advanced structural engineering and building design software for architects and engineers.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function StructuraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}