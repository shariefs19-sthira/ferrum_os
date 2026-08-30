import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Ferrum OS',
  description: 'Terms and conditions governing the use of the Ferrum OS platform and services.',
  openGraph: {
    title: 'Terms of Service - Ferrum OS',
    description: 'Terms and conditions governing the use of the Ferrum OS platform and services.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}