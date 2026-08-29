import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation - Ferrum OS',
  description: 'Comprehensive guides, tutorials, and resources for using Ferrum OS.',
  openGraph: {
    title: 'Documentation - Ferrum OS',
    description: 'Comprehensive guides, tutorials, and resources for using Ferrum OS.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}