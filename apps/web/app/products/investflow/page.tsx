import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'

const featureItems = [
  { title: 'Cash-flow modeling', body: 'Model cash flow across the life of a project.' },
  { title: 'IRR/NPV/yield', body: 'Calculate the return measures that matter to investors.' },
  { title: 'Sensitivity analysis', body: 'Stress-test a deal against changing assumptions.' },
  { title: 'Investor dashboards', body: 'Track investor commitments and returns in one view.' },
  { title: 'Capital commitment', body: 'Manage capital commitments through the project.' },
  { title: 'Scenario planning', body: 'Compare scenarios before you commit.' },
]

const howItWorksSteps = [
  { title: 'Model the deal', body: 'Build a cash-flow model for the project.' },
  { title: 'Run the numbers', body: 'Get IRR, NPV, yield and sensitivity results.' },
  { title: 'Commit & track', body: 'Commit capital and track returns over time.' },
]

const integrationItems = [
  { title: 'LandIntel', body: 'Model returns from land feasibility data.' },
  { title: 'CommunityBuild', body: 'Feed fractional investment deals into the model.' },
  { title: 'BuildOS', body: 'Track costs against your investment model.' },
]

const pricingPlans = [
  { name: 'Free', price: 'Free', button: 'Start Free Trial' },
  { name: 'Pro', price: '₹499/mo', tag: 'Most popular', button: 'Start Free Trial' },
  { name: 'Enterprise', price: '₹9,999/mo', button: 'Contact sales' },
]

// FAQ: docs/RELUME_ADDENDUM.md states "4 Q&As" for this page but does not
// give the actual question/answer text. Not fabricated — omitted pending
// real copy.

export default function InvestFlowPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>InvestFlow</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Know if your investment is worth it
            </SectionHeading>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Cash-flow modeling</li>
              <li>IRR/NPV/yield</li>
              <li>Sensitivity analysis</li>
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
          <SectionHeading className="mt-4">Everything you need to invest</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={featureItems} columns={3} />
        </div>
      </SectionShell>

      {/* 3. How It Works */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <SectionHeading className="mt-4">From model to commitment</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={howItWorksSteps} columns={3} />
        </div>
      </SectionShell>

      {/* 4. Integration */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Integrations</Eyebrow>
          <SectionHeading className="mt-4">Investments draw on the platform</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={integrationItems} columns={3} />
        </div>
      </SectionShell>

      {/* 5. Pricing */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionHeading className="mt-4">Simple pricing for investors</SectionHeading>
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
          <SectionHeading className="mt-4">Model your first deal free</SectionHeading>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
