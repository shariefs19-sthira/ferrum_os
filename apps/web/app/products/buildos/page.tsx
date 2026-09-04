import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import ProductHeroPreview from '../../../components/sections/ProductHeroPreview'
import ProductCockpitPreview from '../../../components/workspace/ProductCockpitPreview'

// W2-345: BuildOS has zero shipped tool of any kind — no task management,
// no RFI/submittal tracking, no QA/QC or HSE checklists, no progress
// tracking, no measurement books/RA billing, and no mobile app. Every
// claim on this page previously described unbuilt capability as present
// tense. All roadmap-labeled rather than deleted, since they describe the
// product's real intended direction (docs/RELUME_HANDOFF.md §5).
const featureItems = [
  { title: 'Common data environment', body: 'One source of truth for the whole team — not yet built.' },
  { title: 'Task management', body: 'Assign, track and close out tasks — not yet built.' },
  { title: 'RFIs & submittals', body: 'Resolve questions and approvals in one place — not yet built.' },
  { title: 'QA/QC & HSE', body: 'Run checklists and safety logs on site — not yet built.' },
  { title: 'Progress tracking', body: 'See the build move in real time — not yet built.' },
  { title: 'Measurement books & RA bills', body: 'Bill accurately from measured work — not yet built.' },
]

const howItWorksSteps = [
  { title: 'Set up your project', body: 'Create the workspace and invite your team — not yet built.' },
  { title: 'Track & manage', body: 'Run tasks, RFIs, QA/QC and progress — not yet built.' },
  { title: 'Bill & handover', body: 'Close out measurement books and RA bills — not yet built.' },
]

const integrationItems = [
  { title: 'BOQ Pro', body: 'Track costs against your project.' },
  { title: 'ProcureHub', body: 'See materials and deliveries on site.' },
  { title: 'ProMarket', body: 'Add hired pros to your project team.' },
]

// W2-345: feature bullets rewritten — none of these are buildable today
// (no tool exists on this page at all).
const pricingPlans = [
  {
    name: 'Free (roadmap)',
    price: 'Free',
    features: ['Task management — roadmap', 'Basic CDE — roadmap', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro (roadmap)',
    price: '₹499/mo',
    tag: 'Not yet buildable',
    features: ['RFIs & submittals — roadmap', 'QA/QC & HSE — roadmap', 'Priority support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: '₹9,999/mo',
    features: ['Unlimited everything', 'API access', 'Dedicated support', 'Custom integrations'],
    button: 'Contact sales',
  },
]

// FAQ topics per docs/RELUME_ADDENDUM.md: CDE, mobile field app, MB/RA
// bills, small projects. Answers restate facts already stated elsewhere
// on this page (Hero, Features, Pricing) — not new claims.
const faqItems = [
  {
    question: 'Is BuildOS live yet?',
    answer: 'Not yet. Task management, RFIs, QA/QC, progress tracking and measurement books/RA billing are all on the roadmap. This page describes the intended product; nothing on it is buildable or usable today.',
  },
  {
    question: 'Is there a mobile app for the field?',
    answer: 'No. Ferrum OS is a web platform; no mobile app exists for any product, BuildOS included.',
  },
]

export default function BuildOSPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1.45fr)] lg:items-start">
          <div>
            <Eyebrow>BuildOS</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Run your whole project on one system
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              A common data environment for construction project management — tasks, RFIs,
              QA/QC, measurement books and RA bills. Not yet built — this page describes the
              intended product.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Common data environment — roadmap</li>
              <li>QA/QC &amp; HSE — roadmap</li>
              <li>Task management — roadmap</li>
            </ul>
            <div className="mt-8">
              <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
            </div>
          </div>
          <ProductCockpitPreview product="buildos" label="BuildOS">
            <ProductHeroPreview product="buildos" />
          </ProductCockpitPreview>
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
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* 6. FAQ */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>FAQ</Eyebrow>
          <SectionHeading className="mt-4">BuildOS questions, answered</SectionHeading>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* 7. CTA */}
      <SectionShell>
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface-secondary p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Run your first project free</SectionHeading>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
