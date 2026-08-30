import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IS 1200 vs CESMM4 - Ferrum OS',
  description: 'A practical comparison of IS 1200 and CESMM4 estimating frameworks to help choose the right specification style during planning and project delivery.',
  openGraph: {
    title: 'IS 1200 vs CESMM4 - Ferrum OS',
    description: 'A practical comparison of IS 1200 and CESMM4 estimating frameworks to help choose the right specification style during planning and project delivery.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function Is1200VsCesmm4Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}