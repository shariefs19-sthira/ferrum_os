import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tunnel-Form Construction for Repetitive Floor Plates - Ferrum OS',
  description: 'Cycle time, formwork turnaround, and where tunnel-form construction pays off for repetitive floor plates on residential and hospitality towers.',
  openGraph: {
    title: 'Tunnel-Form Construction for Repetitive Floor Plates - Ferrum OS',
    description: 'Cycle time, formwork turnaround, and where tunnel-form construction pays off for repetitive floor plates on residential and hospitality towers.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function TunnelFormConstructionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
