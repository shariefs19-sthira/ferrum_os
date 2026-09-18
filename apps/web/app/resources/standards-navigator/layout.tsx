import { Metadata } from 'next'
import { STANDARDS_COVERED } from '../../../lib/resources/registry'

// Generated from STANDARDS_COVERED (the same registry the page itself
// renders from) so metadata can never advertise a standard -- like the
// since-excluded, unverified CESMM4 -- that isn't actually in the
// published, sourced list. resourcesRegistry.test.ts asserts this.
const description = `A practical radar for Indian construction standards: what to adopt, hold, or drop across ${STANDARDS_COVERED.join(', ')} -- scope and adoption guidance only, linking to official publishers rather than reproducing their text.`

export const metadata: Metadata = {
  title: 'Standards Navigator - Ferrum OS',
  description,
  openGraph: {
    title: 'Standards Navigator - Ferrum OS',
    description,
    type: 'article',
    locale: 'en_US',
  },
  alternates: { canonical: '/resources/standards-navigator' },
}

export default function StandardsNavigatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
