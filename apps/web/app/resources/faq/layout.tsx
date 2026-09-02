import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Ferrum OS',
  description: 'Answers to common questions about Ferrum OS products, pricing, and how the platform works.',
  openGraph: {
    title: 'FAQ - Ferrum OS',
    description: 'Answers to common questions about Ferrum OS products, pricing, and how the platform works.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
