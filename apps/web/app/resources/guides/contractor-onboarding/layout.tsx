import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contractor Onboarding Guide - Ferrum OS',
  description: 'Getting a new contractor from signed contract to first certified claim: pre-contract verification, system and workflow setup, and the first 30 days.',
  openGraph: {
    title: 'Contractor Onboarding Guide - Ferrum OS',
    description: 'Getting a new contractor from signed contract to first certified claim: pre-contract verification, system and workflow setup, and the first 30 days.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function ContractorOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
