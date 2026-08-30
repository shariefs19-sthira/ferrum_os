import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Infrastructure Contractor Case Study - Ferrum OS',
  description: 'How a 14-site civil-works contractor cut BoQ certification from 10-15 days to 3 days and recovered 6% of revenue from retention disputes using Ferrum OS BoQ-Pro.',
  openGraph: {
    title: 'Infrastructure Contractor Case Study - Ferrum OS',
    description: 'How a 14-site civil-works contractor cut BoQ certification from 10-15 days to 3 days and recovered 6% of revenue from retention disputes using Ferrum OS BoQ-Pro.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function InfrastructureContractorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
