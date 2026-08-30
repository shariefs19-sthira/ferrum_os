import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advanced ULPIN Workflows - Ferrum OS',
  description: 'Take ULPIN beyond lookup: layer geo-references, pre-empt disputes, and integrate parcel IDs into BOQ, permitting, and contractor tools with Ferrum OS.',
  openGraph: {
    title: 'Advanced ULPIN Workflows - Ferrum OS',
    description: 'Take ULPIN beyond lookup: layer geo-references, pre-empt disputes, and integrate parcel IDs into BOQ, permitting, and contractor tools with Ferrum OS.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function AdvancedUlpinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}