import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build OS - Ferrum OS',
  description: 'Operating system for construction management and building automation.',
  openGraph: {
    title: 'Build OS - Ferrum OS',
    description: 'Operating system for construction management and building automation.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function BuildosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}