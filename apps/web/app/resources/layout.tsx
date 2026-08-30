import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources - Ferrum OS',
  description: 'Comprehensive collection of articles, case studies, and guides for real estate and construction professionals.',
  openGraph: {
    title: 'Resources - Ferrum OS',
    description: 'Comprehensive collection of articles, case studies, and guides for real estate and construction professionals.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}