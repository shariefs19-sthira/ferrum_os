import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Monsoon Preparedness Audit Guide - Ferrum OS',
  description: 'Getting a site ready before the rains start: drainage and water management, materials and storage, and schedule and safety readiness.',
  openGraph: {
    title: 'Monsoon Preparedness Audit Guide - Ferrum OS',
    description: 'Getting a site ready before the rains start: drainage and water management, materials and storage, and schedule and safety readiness.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function MonsoonPreparednessAuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
