import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Ferrum OS',
  description: 'Insights, analysis, and updates on real estate, construction, and property technology.',
  openGraph: {
    title: 'Blog - Ferrum OS',
    description: 'Insights, analysis, and updates on real estate, construction, and property technology.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}