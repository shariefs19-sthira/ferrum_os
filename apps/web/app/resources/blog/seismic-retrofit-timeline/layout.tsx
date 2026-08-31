import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seismic Retrofit Timelines for Occupied Structures - Ferrum OS',
  description: 'How to sequence seismic retrofit work on occupied buildings: assessment gates, zone-by-zone phasing, and communicating slippage before it erodes trust.',
  openGraph: {
    title: 'Seismic Retrofit Timelines for Occupied Structures - Ferrum OS',
    description: 'How to sequence seismic retrofit work on occupied buildings: assessment gates, zone-by-zone phasing, and communicating slippage before it erodes trust.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function SeismicRetrofitTimelineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
