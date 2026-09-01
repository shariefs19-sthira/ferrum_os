import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy - Ferrum OS',
  description: 'Ferrum OS refund policy for subscriptions and paid features.',
  openGraph: {
    title: 'Refund Policy - Ferrum OS',
    description: 'Ferrum OS refund policy for subscriptions and paid features.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RefundsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
