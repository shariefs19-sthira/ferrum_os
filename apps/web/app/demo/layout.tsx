import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo - Ferrum OS',
  description: 'Book a demo to see how Ferrum OS streamlines construction workflows, get personalized recommendations, and connect with product experts.',
  openGraph: {
    title: 'Demo - Ferrum OS',
    description: 'Book a demo to see how Ferrum OS streamlines construction workflows, get personalized recommendations, and connect with product experts.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}