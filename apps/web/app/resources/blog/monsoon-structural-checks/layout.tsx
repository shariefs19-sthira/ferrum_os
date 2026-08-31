import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Structural Checks Before and After Monsoon - Ferrum OS',
  description: 'What to inspect on an active site once the rains start: pre-monsoon punch lists, daily drainage and load checks during an active spell, and post-monsoon structural re-survey.',
  openGraph: {
    title: 'Structural Checks Before and After Monsoon - Ferrum OS',
    description: 'What to inspect on an active site once the rains start: pre-monsoon punch lists, daily drainage and load checks during an active spell, and post-monsoon structural re-survey.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function MonsoonStructuralChecksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
