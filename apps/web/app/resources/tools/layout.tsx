import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tools - Ferrum OS',
  description: 'A directory of Ferrum OS calculators and estimators across land, design, and structural workflows.',
  openGraph: {
    title: 'Tools - Ferrum OS',
    description: 'A directory of Ferrum OS calculators and estimators across land, design, and structural workflows.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
