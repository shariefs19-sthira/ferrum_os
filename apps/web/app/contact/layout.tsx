import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - Ferrum OS',
  description: 'Get in touch with our team for support, inquiries, or partnership opportunities.',
  openGraph: {
    title: 'Contact - Ferrum OS',
    description: 'Get in touch with our team for support, inquiries, or partnership opportunities.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}