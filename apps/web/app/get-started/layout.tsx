import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started - Ferrum OS',
  description: 'Quick start guide to begin using Ferrum OS for your real estate and construction projects.',
  openGraph: {
    title: 'Get Started - Ferrum OS',
    description: 'Quick start guide to begin using Ferrum OS for your real estate and construction projects.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}