import Link from 'next/link'
import SectionShell from '../../components/sections/SectionShell'
import Eyebrow from '../../components/sections/Eyebrow'
import SectionHeading from '../../components/sections/SectionHeading'
import { RESOURCE_CATEGORIES } from '../../lib/resources/registry'

export default function ResourcesIndexPage() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-3xl">
          <Eyebrow>Resources</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            Everything you need to plan, build, and decide with clarity
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Articles, source-cited research, standards guidance, field checklists, and reference
            material for real estate and infrastructure teams -- each category below states its
            own source scope and current count, derived from what is actually published here.
          </p>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_CATEGORIES.map((section) => (
            <article
              key={section.key}
              className="relative rounded-lg border border-relume-border bg-relume-surface p-6 transition hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-relume-ink has-[a:focus-visible]:ring-offset-2"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
                  {section.label}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-relume-muted">
                  {section.countLabel}
                </span>
              </div>
              <h2 className="text-2xl font-semibold tracking-relume-tight text-relume-ink">{section.name}</h2>
              <p className="mt-4 text-sm leading-6 text-relume-ink">{section.summary}</p>
              <p className="mt-4 text-xs leading-5 text-relume-muted">{section.sourceScope}</p>
              <div className="mt-6 border-t border-relume-border pt-4">
                <Link
                  href={section.href}
                  className="z-10 text-sm font-medium text-relume-ink underline underline-offset-4 outline-none after:absolute after:inset-0 after:content-['']"
                >
                  Browse {section.name.toLowerCase()} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    </main>
  )
}
