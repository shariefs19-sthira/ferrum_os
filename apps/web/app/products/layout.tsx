import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products - Ferrum OS',
  description: 'All 10 Ferrum OS products in one place: land intelligence, design, structural checks, BOQ, procurement, project finance, and more.',
  openGraph: {
    title: 'Products - Ferrum OS',
    description: 'All 10 Ferrum OS products in one place: land intelligence, design, structural checks, BOQ, procurement, project finance, and more.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function ProductsIndexLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
