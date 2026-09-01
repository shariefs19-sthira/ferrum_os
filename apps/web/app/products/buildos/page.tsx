import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'

const featureItems = [
  { title: 'Common data environment', body: 'One source of truth for the whole team.' },
  { title: 'Task management', body: 'Assign, track and close out tasks.' },
  { title: 'RFIs & submittals', body: 'Resolve questions and approvals in one place.' },
  { title: 'QA/QC & HSE', body: 'Run checklists and safety logs on site.' },
  { title: 'Progress tracking', body: 'See the build move in real time.' },
  { title: 'Measurement books & RA bills', body: 'Bill accurately from measured work.' },
]

const howItWorksSteps = [
  { title: 'Set up your project', body: 'Create the workspace and invite your team.' },
  { title: 'Track & manage', body: 'Run tasks, RFIs, QA/QC and progress.' },
  { title: 'Bill & handover', body: 'Close out measurement books and RA bills.' },
]

const integrationItems = [
  { title: 'BOQ Pro', body: 'Track costs against your project.' },
  { title: 'ProcureHub', body: 'See materials and deliveries on site.' },
  { title: 'ProMarket', body: 'Add hired pros to your project team.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['1 active project', 'Task management', 'Basic CDE', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited projects', 'RFIs & submittals', 'QA/QC & HSE', 'Priority support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: '₹9,999/mo',
    features: ['Unlimited everything', 'API access', 'Dedicated support', 'Custom integrations'],
    button: 'Contact sales',
  },
]

// FAQ and CTA sections are explicitly marked PENDING (not yet wireframed)
// in docs/RELUME_HANDOFF.md for BuildOS — deferred to Wave B per W2-252's
// own scope note. Not fabricated here.

export default function BuildOSPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>BuildOS</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Run your whole project on one system
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              A common data environment for construction project management — tasks, RFIs,
              QA/QC, measurement books and RA bills, with a mobile field app.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Common data environment</li>
              <li>QA/QC &amp; HSE</li>
              <li>Mobile field app</li>
            </ul>
            <div className="mt-8">
              <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
            </div>
          </div>
          <div className="rounded-lg border border-relume-border bg-relume-surface-secondary p-10" aria-hidden="true" />
        </div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">Everything you need to manage</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Keep every part of the build in one shared environment.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid items={featureItems} columns={3} />
        </div>
      </SectionShell>

      {/* 3. How It Works */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <SectionHeading className="mt-4">From setup to handover</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A clear path from project setup to a clean handover.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid items={howItWorksSteps} columns={3} />
        </div>
      </SectionShell>

      {/* 4. Integration */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Integrations</Eyebrow>
          <SectionHeading className="mt-4">Projects connect across the platform</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Your project pulls in from costing, procurement and hiring.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid items={integrationItems} columns={3} />
        </div>
      </SectionShell>

      {/* 5. Pricing */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionHeading className="mt-4">Simple pricing for project management</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start free with a project, and scale as your portfolio grows.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className="rounded-lg border border-relume-border bg-relume-surface p-8">
              {plan.tag && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">
                  {plan.tag}
                </p>
              )}
              <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">{plan.name}</h3>
              <p className="mt-2 text-3xl font-semibold tracking-relume-tight text-relume-ink">{plan.price}</p>
              <ul className="mt-6 space-y-2 text-sm text-relume-ink">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="mt-8">
                <PrimaryButton href={plan.button === 'Contact sales' ? '/contact' : '/signup'}>
                  {plan.button}
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </main>
  )
}
