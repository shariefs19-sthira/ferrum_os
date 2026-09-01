import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import RateCompareCalculator from '../../../components/sections/RateCompareCalculator'

const featureItems = [
  { title: 'Verified profiles', body: 'Profiles for architects, engineers and contractors.' },
  { title: 'Verification badges', body: 'Know who is vetted and who is not.' },
  { title: 'Job posting', body: 'Post a job and let pros come to you.' },
  { title: 'Proposal system', body: 'Compare bids side by side.' },
  { title: 'Escrow payments', body: 'Funds are released only on completion.' },
  { title: 'Reviews & ratings', body: 'Hire on proven track records.' },
]

const howItWorksSteps = [
  { title: 'Post your job', body: 'Describe the work and set your budget.' },
  { title: 'Compare proposals', body: 'Review verified pros and their bids.' },
  { title: 'Pay securely', body: 'Funds release through escrow on completion.' },
]

const integrationItems = [
  { title: 'BuildOS', body: 'Add hired pros to your project team.' },
  { title: 'BOQ Pro', body: 'Budget for your hired team.' },
  { title: 'ProcureHub', body: 'Coordinate materials with your contractors.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['1 active job', 'Basic profiles', 'Standard support', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited jobs', 'Verified pros', 'Escrow payments', 'Priority support'],
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
    question: 'How are professionals verified?',
    answer: 'We verify credentials, licences and work history before professionals earn their badge.',
  },
  {
    question: 'How does escrow work?',
    answer: 'Funds are held securely and released to the professional only when the work is completed.',
  },
  {
    question: 'Can I post a job for free?',
    answer: 'Yes — posting a job is free on the Free plan.',
  },
  {
    question: 'What fees apply?',
    answer: 'ProMarket charges a small service fee on completed escrow payments.',
  },
]

export default function ProMarketPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>ProMarket</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Hire verified professionals you can trust
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Find verified architects, engineers and contractors, post jobs, compare proposals
              and pay securely through escrow.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Verified professionals</li>
              <li>Escrow payments</li>
              <li>Reviews &amp; ratings</li>
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
          <SectionHeading className="mt-4">ProMarket questions, answered</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Everything you need to know before you hire.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* Try it: rate-compare calculator (parity: W2-271) */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Try it</Eyebrow>
          <SectionHeading className="mt-4">Compare material & labor rates</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            Indicative rates across regions, live from the Ferrum OS data layer.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <RateCompareCalculator />
        </div>
      </SectionShell>

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
