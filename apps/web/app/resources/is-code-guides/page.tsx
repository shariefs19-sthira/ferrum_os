import { Metadata } from 'next'
import Link from 'next/link'
import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'

// CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE. Content moved to
// /resources/standards-navigator. This static-export architecture has no
// server to issue a real HTTP redirect, so the truthful treatment is: keep
// this URL resolving with real HTML (no dead link), mark it noindex +
// canonical to the new location so it doesn't compete for search or get
// treated as a second, stale copy, and tell the reader plainly where to go.
export const metadata: Metadata = {
  title: 'IS Code Guides has moved - Ferrum OS',
  description: 'This page has moved to /resources/standards-navigator.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/resources/standards-navigator' },
}

export default function LegacyIsCodeGuidesPage() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-2xl text-center mx-auto">
          <Eyebrow>Resources</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            This page has moved
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            &ldquo;IS Code Guides&rdquo; is now published as Standards Navigator, with the same
            adopt/hold/drop guidance plus direct links to the official BIS and India Code
            publications it discusses.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/resources/standards-navigator"
              className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink"
            >
              Open Standards Navigator
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink"
            >
              Back to Resources
            </Link>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
