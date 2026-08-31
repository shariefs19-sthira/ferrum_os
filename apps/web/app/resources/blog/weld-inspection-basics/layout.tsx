import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Weld Inspection Basics for Site Teams - Ferrum OS',
  description: 'What a non-destructive weld test actually tells you: visual inspection first, choosing the right NDT method, and reading the result against acceptance criteria.',
  openGraph: {
    title: 'Weld Inspection Basics for Site Teams - Ferrum OS',
    description: 'What a non-destructive weld test actually tells you: visual inspection first, choosing the right NDT method, and reading the result against acceptance criteria.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function WeldInspectionBasicsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
