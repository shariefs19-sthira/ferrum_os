import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crane Maintenance Checklist - Ferrum OS',
  description: 'Daily pre-shift checks, periodic maintenance and certification, and the records that back them up, for site crane maintenance.',
  openGraph: {
    title: 'Crane Maintenance Checklist - Ferrum OS',
    description: 'Daily pre-shift checks, periodic maintenance and certification, and the records that back them up, for site crane maintenance.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function CraneMaintenanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
