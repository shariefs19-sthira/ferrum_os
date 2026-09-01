import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Investflow - Ferrum OS',
  description: 'Investment analysis and financial modeling platform for real estate investors.',
  openGraph: {
    title: 'Investflow - Ferrum OS',
    description: 'Investment analysis and financial modeling platform for real estate investors.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function InvestflowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}