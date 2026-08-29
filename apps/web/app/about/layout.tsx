import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - Ferrum OS',
  description: 'Learn about our mission, team, and the story behind Ferrum OS.',
  openGraph: {
    title: 'About - Ferrum OS',
    description: 'Learn about our mission, team, and the story behind Ferrum OS.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}