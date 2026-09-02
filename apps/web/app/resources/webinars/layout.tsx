import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Webinars - Ferrum OS',
  description: 'Recorded and upcoming Ferrum OS webinars on construction technology, estimating, and compliance.',
  openGraph: {
    title: 'Webinars - Ferrum OS',
    description: 'Recorded and upcoming Ferrum OS webinars on construction technology, estimating, and compliance.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function WebinarsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
