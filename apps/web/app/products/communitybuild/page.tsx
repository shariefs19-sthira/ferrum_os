import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import CdeStatusMock from '../../../components/sections/CdeStatusMock'

const featureItems = [
  { title: 'SPV creation', body: 'Set up a special purpose vehicle for the build.' },
  { title: 'Investor commitments', body: 'Track commitments from every investor.' },
  { title: 'KYC/AML verification', body: 'Verify investors before they commit.' },
  { title: 'Construction tracking', body: 'Follow construction progress against the build.' },
  { title: 'Profit distribution', body: 'Distribute profits to investors as the build progresses.' },
  { title: 'Investor reporting', body: 'Report performance to your investor group.' },
]

const howItWorksSteps = [
  { title: 'Create the SPV', body: 'Set up the special purpose vehicle for the build.' },
  { title: 'Commit & verify', body: 'Investors commit and complete KYC/AML verification.' },
  { title: 'Track & distribute', body: 'Track construction and distribute profits.' },
]

const integrationItems = [
  { title: 'LandIntel', body: 'Start from verified land feasibility data.' },
  { title: 'InvestFlow', body: 'Model returns for the fractional build.' },
  { title: 'BuildOS', body: 'Track construction against the project.' },
]

const pricingPlans = [
  { name: 'Free', price: 'Free', button: 'Start Free Trial' },
  { name: 'Pro', price: '₹499/mo', tag: 'Most popular', button: 'Start Free Trial' },
  { name: 'Enterprise', price: '₹9,999/mo', button: 'Contact sales' },
]

// FAQ: docs/RELUME_ADDENDUM.md states "4 Q&As" for this page but does not
// give the actual question/answer text. Not fabricated — omitted pending
// real copy.

export default function CommunityBuildPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>CommunityBuild</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Invest in real estate, fractionally
            </SectionHeading>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>SPV creation</li>
              <li>KYC-AML verification</li>
              <li>Profit distribution</li>
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
          <SectionHeading className="mt-4">Everything you need to invest together</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={featureItems} columns={3} />
        </div>
      </SectionShell>

      {/* 3. How It Works */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <SectionHeading className="mt-4">From SPV to profit</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={howItWorksSteps} columns={3} />
        </div>
      </SectionShell>

      {/* 4. Integration */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Integrations</Eyebrow>
          <SectionHeading className="mt-4">Fractional builds connect the platform</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={integrationItems} columns={3} />
        </div>
      </SectionShell>

      {/* 5. Pricing */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionHeading className="mt-4">Simple pricing for community investing</SectionHeading>
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

      {/* Try it: CDE dashboard mock (parity: W2-272) */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Try it</Eyebrow>
          <SectionHeading className="mt-4">Check a project's CDE status</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            A working preview of the common-data-environment status read — indicative mock data.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <CdeStatusMock />
        </div>
      </SectionShell>

      {/* 6. CTA */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Invest your first build free</SectionHeading>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
