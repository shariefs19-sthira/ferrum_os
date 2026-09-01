import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crane Lift Plan Checklist - Ferrum OS',
  description: 'Planning and signing off a crane lift before it happens: lift planning, pre-lift checks, and sign-off records.',
  openGraph: {
    title: 'Crane Lift Plan Checklist - Ferrum OS',
    description: 'Planning and signing off a crane lift before it happens: lift planning, pre-lift checks, and sign-off records.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function CraneLiftPlanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
