import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cement Storage and Humidity on Site - Ferrum OS',
  description: 'Why cement age alone does not tell you whether a bag is usable: how humidity degrades cement, storage conditions that matter, and a field test for rejecting a bag.',
  openGraph: {
    title: 'Cement Storage and Humidity on Site - Ferrum OS',
    description: 'Why cement age alone does not tell you whether a bag is usable: how humidity degrades cement, storage conditions that matter, and a field test for rejecting a bag.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function CementStorageHumidityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
