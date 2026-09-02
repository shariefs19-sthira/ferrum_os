import Link from 'next/link'
import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton, SecondaryButton } from '../../../components/sections/Buttons'

const caseStudies = [
  {
    label: 'Developer',
    href: '/resources/case-studies/greenfield-developer',
    name: 'Greenfield developer: turning early site assumptions into a confident launch plan',
    summary: 'A landowner used early feasibility signals to clarify risk, sequencing, and capital timing before breaking ground.'
  },
  {
    label: 'Family Build',
    href: '/resources/case-studies/self-build-family',
    name: 'Self-build family: planning a home around approvals, cost, and long-term use',
    summary: 'A family project team tightened design decisions by balancing budget, compliance, and site suitability in one workflow.'
  },
  {
    label: 'Contractor',
    href: '/resources/case-studies/contractor-fleet',
    name: 'Contractor fleet: replacing reactive planning with leaner workfront visibility',
    summary: 'A contractor network reduced uncertainty across teams by coordinating production, manpower, and site readiness more closely.'
  }
]

export default function CaseStudiesPage() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-3xl">
          <Eyebrow>Resources</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            Case studies that turn complex projects into clearer decisions
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            See how teams use Ferrum OS to de-risk land acquisition, streamline execution, and improve investment confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <PrimaryButton href="#stories">View client stories</PrimaryButton>
            <SecondaryButton href="/resources">Explore resources</SecondaryButton>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="stories" background="surface-secondary">
        <div className="grid gap-6 md:grid-cols-3">
          {caseStudies.map((item) => (
            <Link key={item.name} href={item.href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-relume-ink">
              <article className="h-full rounded-lg border border-relume-border bg-relume-surface p-6 transition hover:-translate-y-0.5 hover:border-relume-ink/40">
                <div className="mb-4 inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
                  {item.label}
                </div>
                <h2 className="text-2xl font-semibold tracking-relume-tight text-relume-ink">{item.name}</h2>
                <p className="mt-4 text-sm leading-6 text-relume-ink">{item.summary}</p>
                <div className="mt-6 border-t border-relume-border pt-4">
                  <span className="text-sm font-medium text-relume-ink underline underline-offset-4">
                  Read story →
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
