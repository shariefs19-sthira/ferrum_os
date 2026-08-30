import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Ferrum OS',
  description: 'Learn how Ferrum OS collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy - Ferrum OS',
    description: 'Learn how Ferrum OS collects, uses, and protects your personal information.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}