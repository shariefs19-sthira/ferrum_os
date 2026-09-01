import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Promarket - Ferrum OS',
  description: 'Real estate marketing and property listing platform for agents and developers.',
  openGraph: {
    title: 'Promarket - Ferrum OS',
    description: 'Real estate marketing and property listing platform for agents and developers.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function PromarketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}