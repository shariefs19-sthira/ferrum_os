import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Monsoon Concreting - Ferrum OS',
  description: 'A field-ready checklist for protecting concrete finish quality, curing, and site safety when working during wet weather and monsoon rains.',
  openGraph: {
    title: 'Monsoon Concreting - Ferrum OS',
    description: 'A field-ready checklist for protecting concrete finish quality, curing, and site safety when working during wet weather and monsoon rains.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function MonsoonConcretingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}