import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies - Ferrum OS',
  description: 'Real-world examples of how Ferrum OS has transformed construction and real estate projects.',
  openGraph: {
    title: 'Case Studies - Ferrum OS',
    description: 'Real-world examples of how Ferrum OS has transformed construction and real estate projects.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}