import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import SteppedForecastModule from '../../../components/sections/SteppedForecastModule'

// W2-345: only rate comparison is shipped and real (RateCompareCalculator
// below, D1-backed). The marketplace itself — profiles, verification,
// job posting, proposals, escrow — has zero implementation anywhere in
// the codebase: no marketplace tables, no escrow integration, no review
// system. Roadmap-labeled rather than deleted since this describes the
// product's real intended direction.
const featureItems = [
  { title: 'Rate comparison (live)', body: 'Compare category rates across sample cities to sanity-check a quote.' },
  { title: 'Verified profiles (roadmap)', body: 'Profiles for architects, engineers and contractors — not yet built.' },
  { title: 'Job posting (roadmap)', body: 'Post a job and let pros come to you — not yet built.' },
  { title: 'Proposal system (roadmap)', body: 'Compare bids side by side — not yet built.' },
  { title: 'Escrow payments (roadmap)', body: 'Funds released only on completion — not yet built. See docs/ESCROW_DESIGN.md for the design.' },
  { title: 'Reviews & ratings (roadmap)', body: 'Hire on proven track records — not yet built.' },
]

const howItWorksSteps = [
  { title: 'Pick a category', body: 'Choose a material or labor category.' },
  { title: 'Compare cities', body: 'See how rates compare across sample locations.' },
  { title: 'Sanity-check a quote', body: 'Use the comparison as a reference point, not a live market price.' },
]

const integrationItems = [
  { title: 'BuildOS', body: 'Add hired pros to your project team.' },
  { title: 'BOQ Pro', body: 'Budget for your hired team.' },
  { title: 'ProcureHub', body: 'Coordinate materials with your contractors.' },
]

// W2-345: pricing tiers here describe the roadmap marketplace, not a
// product that can be bought today — no SubscribeButton/Razorpay wiring
// exists on this page (unlike pricing.tsx's real subscription tiers).
// Feature bullets rewritten to stop implying job posting, verified pros
// and escrow are purchasable now.
const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['Rate comparison tool', 'Standard support', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro (roadmap)',
    price: '₹499/mo',
    tag: 'Marketplace not yet live',
    features: ['Job posting — roadmap', 'Verified pros — roadmap', 'Escrow payments — roadmap', 'Priority support'],
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
    question: 'Is the professionals marketplace live yet?',
    answer: 'Not yet. Verified profiles, job posting, proposals, escrow payments and reviews are all on the roadmap — see docs/ESCROW_DESIGN.md for how escrow is planned to work once it ships. What is live today is the rate comparison tool above.',
  },
  {
    question: 'What fees apply?',
    answer: 'No marketplace fees apply yet, since the marketplace itself has not launched.',
  },
]

export default function ProMarketPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>ProMarket</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Compare project rates before the marketplace arrives
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Verified profiles, job posting, proposals and escrow payments are on the roadmap.
              Live today: an indicative material/labor rate comparison tool.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Verified professionals — roadmap</li>
              <li>Escrow payments — roadmap</li>
              <li>Reviews &amp; ratings — roadmap</li>
            </ul>
          </div>
          <div className="order-first min-w-0 lg:order-none">
            <SteppedForecastModule product="promarket" />
          </div>
        </div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">Everything you need to hire</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Find, vet and pay the right people for your build.
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
          <SectionHeading className="mt-4">From job post to done</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A simple path from posting a job to paying securely.
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
          <SectionHeading className="mt-4">Hire into your projects</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Your hires plug into project management, costing and procurement.
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
          <SectionHeading className="mt-4">Simple pricing for hiring</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start free with a job or two, and scale as your projects grow.
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
          <SectionHeading className="mt-4">ProMarket questions, answered</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Everything you need to know before you hire.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* W2-373 INTERACTION_FIRST: RateCompareCalculator (parity: W2-271)
          now lives in the hero above — no second render of the same tool here. */}

      {/* 7. CTA */}
      <SectionShell>
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface-secondary p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Hire your first professional free</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No credit card required. Post a job and get verified proposals.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
