import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Site Handover Playbook - Ferrum OS',
  description: 'A working guide to closing out a project cleanly: before the handover meeting, at the walkthrough, and what happens after handover.',
  openGraph: {
    title: 'Site Handover Playbook - Ferrum OS',
    description: 'A working guide to closing out a project cleanly: before the handover meeting, at the walkthrough, and what happens after handover.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function SiteHandoverPlaybookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
