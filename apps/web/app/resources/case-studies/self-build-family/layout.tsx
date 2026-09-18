import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Self-Build Family Home has moved - Ferrum OS',
  description: 'This page has been withdrawn from public discovery. See Research Cases for source-cited material.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/resources/research-cases' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
