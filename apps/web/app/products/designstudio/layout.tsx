import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design Studio - Ferrum OS',
  description: 'Collaborative design and architectural workspace for creative professionals.',
  openGraph: {
    title: 'Design Studio - Ferrum OS',
    description: 'Collaborative design and architectural workspace for creative professionals.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function DesignstudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}