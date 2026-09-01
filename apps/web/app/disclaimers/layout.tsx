import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimers - Ferrum OS',
  description: 'Disclaimers covering Ferrum OS calculators, estimators, and Transact facilitation services.',
  openGraph: {
    title: 'Disclaimers - Ferrum OS',
    description: 'Disclaimers covering Ferrum OS calculators, estimators, and Transact facilitation services.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function DisclaimersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
