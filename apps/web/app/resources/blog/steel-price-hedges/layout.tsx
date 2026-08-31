import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hedging Steel Price Risk on Fixed-Price Contracts - Ferrum OS',
  description: 'Why steel price volatility is a contract problem before it is a market problem: contractual protections to negotiate first, and when a financial hedge actually makes sense.',
  openGraph: {
    title: 'Hedging Steel Price Risk on Fixed-Price Contracts - Ferrum OS',
    description: 'Why steel price volatility is a contract problem before it is a market problem: contractual protections to negotiate first, and when a financial hedge actually makes sense.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function SteelPriceHedgesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
