import Link from 'next/link'
import SectionShell from '../../components/sections/SectionShell'
import Eyebrow from '../../components/sections/Eyebrow'
import SectionHeading from '../../components/sections/SectionHeading'

const sections = [
  {
    label: 'Articles',
    href: '/resources/blog',
    name: 'Blog',
    summary: 'Field notes, standards explainers, and operational checklists for land, design, and delivery teams.'
  },
  {
    label: 'Client Stories',
    href: '/resources/case-studies',
    name: 'Case Studies',
    summary: 'How developers, families, and contractors use Ferrum OS to plan with more confidence and less rework.'
  },
  {
    label: 'Standards',
    href: '/resources/is-code-guides',
    name: 'IS Code Guides',
    summary: 'A practical radar for Indian construction standards: what to adopt, hold, or drop in real workflows.'
  }
]

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
            A growing library of articles, client stories, and Indian construction standards guides to help real estate and infrastructure teams move from uncertainty to confident action.
          </p>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.name} href={section.href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-relume-ink">
              <article className="h-full rounded-lg border border-relume-border bg-relume-surface p-6 transition hover:-translate-y-0.5 hover:border-relume-ink/40">
                <div className="mb-4 inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
                  {section.label}
                </div>
                <h2 className="text-2xl font-semibold tracking-relume-tight text-relume-ink">{section.name}</h2>
                <p className="mt-4 text-sm leading-6 text-relume-ink">{section.summary}</p>
                <div className="mt-6 border-t border-relume-border pt-4">
                  <span className="text-sm font-medium text-relume-ink underline underline-offset-4">
                  Browse {section.name.toLowerCase()} →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </SectionShell>
    </main>
  )
}
