import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Ferrum OS',
  description: 'Flexible pricing plans for our real estate and construction management platform.',
  openGraph: {
    title: 'Pricing - Ferrum OS',
    description: 'Flexible pricing plans for our real estate and construction management platform.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}