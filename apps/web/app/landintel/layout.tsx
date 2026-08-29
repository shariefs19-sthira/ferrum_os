import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LandIntel - Ferrum OS',
  description: 'Comprehensive land analysis and property intelligence platform for real estate professionals and developers.',
  openGraph: {
    title: 'LandIntel - Ferrum OS',
    description: 'Comprehensive land analysis and property intelligence platform for real estate professionals and developers.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function LandIntelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}