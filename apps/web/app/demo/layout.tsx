import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo - Ferrum OS',
  description: 'Experience a live demonstration of Ferrum OS capabilities and features.',
  openGraph: {
    title: 'Demo - Ferrum OS',
    description: 'Experience a live demonstration of Ferrum OS capabilities and features.',
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