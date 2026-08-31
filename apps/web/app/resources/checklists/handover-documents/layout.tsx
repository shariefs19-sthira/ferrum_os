import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Handover Documents Checklist - Ferrum OS',
  description: 'The document package a clean project handover needs: design and as-built records, compliance and certification, and owner handback items.',
  openGraph: {
    title: 'Handover Documents Checklist - Ferrum OS',
    description: 'The document package a clean project handover needs: design and as-built records, compliance and certification, and owner handback items.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function HandoverDocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
