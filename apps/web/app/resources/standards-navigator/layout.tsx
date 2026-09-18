import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Standards Navigator - Ferrum OS',
  description: 'A practical radar for Indian construction standards: what to adopt, hold, or drop across IS 1200, CESMM4, IS 456/875/800 -- scope and adoption guidance only, linking to official publishers rather than reproducing their text.',
  openGraph: {
    title: 'Standards Navigator - Ferrum OS',
    description: 'A practical radar for Indian construction standards: what to adopt, hold, or drop across IS 1200, CESMM4, IS 456/875/800 -- scope and adoption guidance only, linking to official publishers rather than reproducing their text.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function StandardsNavigatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
