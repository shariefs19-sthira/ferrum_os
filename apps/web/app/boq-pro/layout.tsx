import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BOQ Pro Calculator - Ferrum OS',
  description: 'A working bill-of-quantities calculator: build a take-off table, compute rates, and export or print your estimate.',
  openGraph: {
    title: 'BOQ Pro Calculator - Ferrum OS',
    description: 'A working bill-of-quantities calculator: build a take-off table, compute rates, and export or print your estimate.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function BoqProAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
