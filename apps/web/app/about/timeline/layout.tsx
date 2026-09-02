import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Story - Ferrum OS',
  description: 'The timeline behind Ferrum OS — how an India-first, AI-native construction platform came together.',
  openGraph: {
    title: 'Our Story - Ferrum OS',
    description: 'The timeline behind Ferrum OS — how an India-first, AI-native construction platform came together.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function AboutTimelineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
