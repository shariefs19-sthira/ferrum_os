import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Communitybuild - Ferrum OS',
  description: 'Community-driven construction and development platform for collaborative building projects.',
  openGraph: {
    title: 'Communitybuild - Ferrum OS',
    description: 'Community-driven construction and development platform for collaborative building projects.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function CommunitybuildLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}