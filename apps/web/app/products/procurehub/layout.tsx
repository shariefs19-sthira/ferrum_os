import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Procurehub - Ferrum OS',
  description: 'Procurement and supply chain management platform for construction and real estate projects.',
  openGraph: {
    title: 'Procurehub - Ferrum OS',
    description: 'Procurement and supply chain management platform for construction and real estate projects.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function ProcurehubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}