import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scaffold Handover Checklist - Ferrum OS',
  description: 'Confirming a scaffold is ready before handover: structural sign-off, access and safety, and the records that back the handover.',
  openGraph: {
    title: 'Scaffold Handover Checklist - Ferrum OS',
    description: 'Confirming a scaffold is ready before handover: structural sign-off, access and safety, and the records that back the handover.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function ScaffoldHandoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
