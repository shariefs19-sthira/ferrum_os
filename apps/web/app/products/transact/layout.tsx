import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transact - Ferrum OS',
  description: 'Stamp-duty and ask-band estimators for property transactions in India — indicative figures, Stage-1 facilitation only.',
  openGraph: {
    title: 'Transact - Ferrum OS',
    description: 'Stamp-duty and ask-band estimators for property transactions in India — indicative figures, Stage-1 facilitation only.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function TransactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
