import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DPDP Notice - Ferrum OS',
  description: 'Notice under the Digital Personal Data Protection Act, 2023 describing how Ferrum OS processes personal data.',
  openGraph: {
    title: 'DPDP Notice - Ferrum OS',
    description: 'Notice under the Digital Personal Data Protection Act, 2023 describing how Ferrum OS processes personal data.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function DpdpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
