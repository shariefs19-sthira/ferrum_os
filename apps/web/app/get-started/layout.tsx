import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started - Ferrum OS',
  description: 'Start building with confidence: create an account, add your first plot, and explore AI-native Ferrum OS products for land insight, planning, and operations.',
  openGraph: {
    title: 'Get Started - Ferrum OS',
    description: 'Start building with confidence: create an account, add your first plot, and explore AI-native Ferrum OS products for land insight, planning, and operations.',
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