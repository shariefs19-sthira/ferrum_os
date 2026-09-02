import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BOQ Pro - Ferrum OS',
  description: 'Three-mode bill-of-quantities rate calculator — government reference, custom, and the Ferrum-band engine — for construction estimating.',
  openGraph: {
    title: 'BOQ Pro - Ferrum OS',
    description: 'Three-mode bill-of-quantities rate calculator — government reference, custom, and the Ferrum-band engine — for construction estimating.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function BoqProProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
