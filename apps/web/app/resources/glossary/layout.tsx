import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Glossary - Ferrum OS',
  description: 'Plain-language definitions of construction, land, and finance terms used across Ferrum OS.',
  openGraph: {
    title: 'Glossary - Ferrum OS',
    description: 'Plain-language definitions of construction, land, and finance terms used across Ferrum OS.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
