import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'

const featureItems = [
  { title: 'Quantity take-off', body: 'Automatically measure quantities from your design.' },
  { title: 'Brand-wise materials', body: 'Choose UltraTech, Tata, JSW and more.' },
  { title: 'City-wise pricing', body: 'Prices tuned to your city and market.' },
  { title: 'GST-compliant BOQ', body: 'Generate bills that meet Indian tax rules.' },
  { title: 'Excel/PDF export', body: 'Share your BOQ in the formats you need.' },
  { title: 'Cost breakdown', body: 'See where every rupee goes at a glance.' },
]

const howItWorksSteps = [
  { title: 'Import your design', body: 'Bring in plans from DesignStudio or your tools.' },
  { title: 'Auto take-off', body: 'Quantities and prices are computed automatically.' },
  { title: 'Export the BOQ', body: 'Share a GST-compliant BOQ as Excel or PDF.' },
]

const integrationItems = [
  { title: 'DesignStudio', body: 'Estimate straight from your designs.' },
  { title: 'ProcureHub', body: 'Turn your BOQ into purchase orders.' },
  { title: 'BuildOS', body: 'Track costs against the project.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['1 active project', 'Basic take-off', 'Standard materials', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited projects', 'Brand-wise materials', 'City-wise pricing', 'GST-compliant BOQ'],
    button: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: '₹9,999/mo',
    features: ['Unlimited everything', 'API access', 'Dedicated support', 'Custom integrations'],
    button: 'Contact sales',
  },
]

const faqItems = [
  {
    question: 'How accurate is the quantity take-off?',
    answer: 'Quantities are measured automatically from your design using standard Indian construction conventions.',
  },
  {
    question: 'Which material brands are supported?',
    answer: 'UltraTech, Tata, JSW and other leading Indian brands, with city-wise pricing.',
  },
  {
    question: 'Is the BOQ GST-compliant?',
    answer: 'Yes — bills are generated to meet Indian GST requirements.',
  },
  {
    question: 'Can I export my BOQ?',
    answer: 'Export to Excel and PDF for sharing with clients and teams.',
  },
]

export default function BoqProMarketingPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>BOQ Pro</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Know exactly what your build will cost
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Automate your bill of quantities and cost estimation from excavation to handover —
              with brand-wise materials and city-wise pricing.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Automated quantity take-off</li>
              <li>Brand-wise materials</li>
              <li>GST-compliant BOQ</li>
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
          <SectionHeading className="mt-4">Everything you need to estimate</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Turn a design into a priced, GST-compliant bill of quantities.
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
          <SectionHeading className="mt-4">From design to a priced BOQ</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Three steps between your design and a priced bill of quantities.
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
          <SectionHeading className="mt-4">Estimates flow into procurement</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Your BOQ turns into material requests and project tracking automatically.
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
          <SectionHeading className="mt-4">Simple pricing for estimation</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start free with an estimate or two, and scale as your projects grow.
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

      {/* 6. FAQ */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>FAQ</Eyebrow>
          <SectionHeading className="mt-4">BOQ Pro questions, answered</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Everything you need to know before you estimate.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* 7. CTA */}
      <SectionShell>
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface-secondary p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Price your first build free</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No credit card required. Get your first BOQ in minutes.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
