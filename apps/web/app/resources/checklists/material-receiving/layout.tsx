import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Material Receiving Checklist - Ferrum OS',
  description: 'Verifying what actually arrives on site: delivery verification, storage and handling, and the records that make materials traceable.',
  openGraph: {
    title: 'Material Receiving Checklist - Ferrum OS',
    description: 'Verifying what actually arrives on site: delivery verification, storage and handling, and the records that make materials traceable.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function MaterialReceivingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
