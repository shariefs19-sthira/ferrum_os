import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Structural Punch List Checklist - Ferrum OS',
  description: 'A closeout checklist for structural handover: foundation and substructure, superstructure and frame, and closeout documentation items.',
  openGraph: {
    title: 'Structural Punch List Checklist - Ferrum OS',
    description: 'A closeout checklist for structural handover: foundation and substructure, superstructure and frame, and closeout documentation items.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function StructuralPunchListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
