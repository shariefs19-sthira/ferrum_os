import Link from 'next/link'
import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { RESEARCH_CASES } from '../../../lib/resources/registry'

export default function ResearchCasesIndexPage() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-3xl">
          <Eyebrow>Resources</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            Research Cases
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Each entry here traces back to a named, independently verifiable primary source --
            a government code, a statute, or an official open dataset -- with its source,
            jurisdiction, publication status, and analysis boundary stated up front. None of these
            describe a Ferrum OS customer, project, or delivery outcome.
          </p>
          <p className="mt-4 text-sm leading-6 text-relume-muted">
            This replaces the earlier &ldquo;Case Studies&rdquo; section, which described
            illustrative product-fit scenarios that were not real customer engagements. Those
            pages have been withdrawn from public discovery; see the note on any of their legacy
            URLs for details.
          </p>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="grid gap-6 sm:grid-cols-2">
          {RESEARCH_CASES.map((item) => (
            <article
              key={item.slug}
              className="relative rounded-lg border border-relume-border bg-relume-surface p-6 transition hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-relume-ink has-[a:focus-visible]:ring-offset-2"
            >
              <div className="mb-4 inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
                {item.jurisdiction.split(' (')[0]}
              </div>
              <h2 className="text-xl font-semibold tracking-relume-tight text-relume-ink">{item.title}</h2>
              <p className="mt-4 text-sm leading-6 text-relume-ink">{item.summary}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.1em] text-relume-muted">
                Source: {item.source.publisher}
              </p>
              <div className="mt-6 border-t border-relume-border pt-4">
                <Link
                  href={`/resources/research-cases/${item.slug}`}
                  className="z-10 text-sm font-medium text-relume-ink underline underline-offset-4 outline-none after:absolute after:inset-0 after:content-['']"
                >
                  Read research case →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="max-w-3xl rounded-lg border border-relume-border bg-relume-surface p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-relume-tight text-relume-ink">How we evaluate sources</h2>
          <p className="mt-4 text-sm leading-6 text-relume-ink">
            Every Research Cases entry is written to Google&rsquo;s{' '}
            <a
              href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-4"
            >
              helpful, people-first content
            </a>{' '}
            standard and{' '}
            <a
              href="https://developers.google.com/search/docs/essentials"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-4"
            >
              Search Essentials
            </a>
            : one named primary source per entry, no mass-generated or templated filler, and no
            claim that isn&rsquo;t either sourced or explicitly labeled illustrative. This is also
            why the entries here are few and specific rather than a large batch of thin pages.
          </p>
        </div>
      </SectionShell>
    </main>
  )
}
