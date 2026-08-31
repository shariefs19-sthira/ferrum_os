import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Retrofit Handover Checklist - Ferrum OS',
  description: 'A closeout checklist for seismic or structural retrofit handover: structural sign-off, access and utilities restored, and owner documentation handback.',
  openGraph: {
    title: 'Retrofit Handover Checklist - Ferrum OS',
    description: 'A closeout checklist for seismic or structural retrofit handover: structural sign-off, access and utilities restored, and owner documentation handback.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function RetrofitHandoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
