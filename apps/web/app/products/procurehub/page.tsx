import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'

// W2-345: ProcureHub has zero shipped tool — no material requests, purchase
// orders, delivery tracking, supplier directory, bill reconciliation or
// payment integration exist anywhere in the codebase. All roadmap-labeled
// rather than deleted, since they describe the product's real intended
// direction (docs/RELUME_HANDOFF.md §5).
const featureItems = [
  { title: 'Material requests', body: 'Raise material requests straight from your BOQ — not yet built.' },
  { title: 'Purchase orders', body: 'Issue purchase orders to your suppliers — not yet built.' },
  { title: 'Delivery tracking', body: 'Track deliveries from order to site — not yet built.' },
  { title: 'Supplier directory', body: 'Find and manage suppliers in one place — not yet built.' },
  { title: 'Bill reconciliation', body: 'Reconcile bills against orders and deliveries — not yet built.' },
  { title: 'Payment integration', body: 'Pay suppliers directly from ProcureHub — not yet built.' },
]

const howItWorksSteps = [
  { title: 'Request materials', body: 'Raise a request driven by your BOQ — not yet built.' },
  { title: 'Issue purchase orders', body: 'Send orders to your chosen suppliers — not yet built.' },
  { title: 'Track & pay', body: 'Track delivery and pay through ProcureHub — not yet built.' },
]

const integrationItems = [
  { title: 'BOQ Pro', body: 'Requests are driven by your bill of quantities.' },
  { title: 'BuildOS', body: 'Track material status against your project.' },
  { title: 'ProMarket', body: 'Coordinate procurement with your hired team.' },
]

const pricingPlans = [
  { name: 'Free', price: 'Free', button: 'Start Free Trial' },
  { name: 'Pro', price: '₹499/mo', tag: 'Most popular', button: 'Start Free Trial' },
  { name: 'Enterprise', price: '₹9,999/mo', button: 'Contact sales' },
]

// FAQ: docs/RELUME_ADDENDUM.md states "4 Q&As" for this page but does not
// give the actual question/answer text (unlike the main Build Manifest's
// fully wireframed FAQs). Not fabricated — omitted pending real copy.

export default function ProcureHubPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="max-w-3xl">
          <div>
            <Eyebrow>ProcureHub</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Get materials on site, on time
            </SectionHeading>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>BOQ-driven requests — roadmap</li>
              <li>Delivery tracking — roadmap</li>
              <li>Supplier directory — roadmap</li>
            </ul>
            <div className="mt-8">
              <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">Everything you need to procure</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={featureItems} columns={3} />
        </div>
      </SectionShell>

      {/* 3. How It Works */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <SectionHeading className="mt-4">From request to delivery</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={howItWorksSteps} columns={3} />
        </div>
      </SectionShell>

      {/* 4. Integration */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Integrations</Eyebrow>
          <SectionHeading className="mt-4">Procurement connects your build</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={integrationItems} columns={3} />
        </div>
      </SectionShell>

      {/* 5. Pricing */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionHeading className="mt-4">Simple pricing for procurement</SectionHeading>
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
              <div className="mt-8">
                <PrimaryButton href={plan.button === 'Contact sales' ? '/contact' : '/signup'}>
                  {plan.button}
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* 6. CTA */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Procure your first order free</SectionHeading>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
