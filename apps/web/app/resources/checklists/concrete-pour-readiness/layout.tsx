import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Concrete Pour Readiness Checklist - Ferrum OS',
  description: 'A pre-pour readiness checklist covering formwork and reinforcement, concrete and site conditions, and sign-off records before a concrete pour starts.',
  openGraph: {
    title: 'Concrete Pour Readiness Checklist - Ferrum OS',
    description: 'A pre-pour readiness checklist covering formwork and reinforcement, concrete and site conditions, and sign-off records before a concrete pour starts.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function ConcretePourReadinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
