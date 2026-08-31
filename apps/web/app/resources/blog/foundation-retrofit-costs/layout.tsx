import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What Drives Foundation Retrofit Costs - Ferrum OS',
  description: 'Reading a foundation assessment before you budget the fix: why assessment scope, access and sequencing, and contingency placement drive foundation retrofit costs more than materials.',
  openGraph: {
    title: 'What Drives Foundation Retrofit Costs - Ferrum OS',
    description: 'Reading a foundation assessment before you budget the fix: why assessment scope, access and sequencing, and contingency placement drive foundation retrofit costs more than materials.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function FoundationRetrofitCostsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
