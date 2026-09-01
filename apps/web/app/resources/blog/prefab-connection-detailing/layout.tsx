import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connection Detailing for Prefabricated Elements - Ferrum OS',
  description: 'Where precast and prefab projects actually go wrong: tolerance stacking across trades, detailing the connection not just the element, and sequencing erection to match the detail.',
  openGraph: {
    title: 'Connection Detailing for Prefabricated Elements - Ferrum OS',
    description: 'Where precast and prefab projects actually go wrong: tolerance stacking across trades, detailing the connection not just the element, and sequencing erection to match the detail.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function PrefabConnectionDetailingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
