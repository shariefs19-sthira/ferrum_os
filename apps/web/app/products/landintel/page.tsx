import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton, SecondaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import LandIntelLookup from '../../../components/sections/LandIntelLookup'
import UlpinDemoWidget from '../../../components/sections/UlpinDemoWidget'

const featureItems = [
  { title: 'ULPIN lookup', body: 'Enter a 14-digit ULPIN and pull official land records instantly.' },
  { title: 'Interactive maps', body: 'See boundaries, surroundings and access on live maps.' },
  { title: 'Zoning summary', body: 'Know what you can build before you buy.' },
  { title: 'Soil & hazard data', body: 'Understand ground conditions and flood or seismic risk.' },
  { title: 'Feasibility report', body: 'A shareable report that sizes up the whole deal.' },
  { title: 'Investment forecasts', body: 'Project land value and returns over time.' },
]

const howItWorksSteps = [
  { title: 'Enter the ULPIN', body: 'Type the 14-digit land ID and hit look up.' },
  { title: 'Review the report', body: 'Get zoning, soil, hazard and feasibility in one view.' },
  { title: 'Decide with confidence', body: 'Export the report and move on to design or invest.' },
]

const integrationItems = [
  { title: 'DesignStudio', body: "Start design from your plot's real constraints." },
  { title: 'BOQ Pro', body: 'Estimate cost from land and build data.' },
  { title: 'InvestFlow', body: 'Forecast returns from feasibility.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['3 lookups a month', 'ULPIN lookup', 'Zoning summary', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited lookups', 'Feasibility reports', 'Investment forecasts', 'Priority support'],
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
    question: 'What is a ULPIN?',
    answer: 'A ULPIN is the 14-digit Unique Land Parcel Identification Number that uniquely identifies a plot of land in India.',
  },
  {
    question: 'How accurate is the land data?',
    answer: 'We source from official land records and verified surveys, updated regularly to keep reports reliable.',
  },
  {
    question: 'Which cities are covered?',
    answer: 'LandIntel covers major metros and tier-1 and tier-2 cities across India, with coverage expanding every quarter.',
  },
  {
    question: 'Can I export the feasibility report?',
    answer: 'Yes — generate a shareable PDF report you can send to stakeholders or use to start design and costing.',
  },
]

export default function LandIntelPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>LandIntel</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Know your land before you buy or build
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Enter a 14-digit ULPIN and get land details, zoning, soil and hazard data, and
              investment forecasts — in minutes.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>ULPIN land lookup</li>
              <li>Zoning &amp; soil data</li>
              <li>Investment forecasts</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
              <SecondaryButton href="#try-a-lookup">Try a lookup</SecondaryButton>
            </div>
          </div>
          <div className="rounded-lg border border-relume-border bg-relume-surface-secondary p-10" aria-hidden="true" />
        </div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">Everything you need to evaluate a plot</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            One lookup surfaces everything that decides whether a plot is worth buying or
            building on.
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
          <SectionHeading className="mt-4">From ULPIN to decision in minutes</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Three steps between you and a confident land decision.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid items={howItWorksSteps} columns={3} />
        </div>
      </SectionShell>

      {/* Try a lookup — the real, functional tool (not part of the wireframed
          marketing spec, preserved from the pre-Relume page rather than
          dropped: a live backend-backed ULPIN lookup, PDF export, soil/zoning
          data). Linked from the Hero's "Try a lookup" button. */}
      <SectionShell background="surface-secondary">
        <div id="try-a-lookup" className="mx-auto max-w-3xl scroll-mt-8 text-center">
          <Eyebrow>Try it now</Eyebrow>
          <SectionHeading className="mt-4">Run a real ULPIN lookup</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No account needed to try it — enter a ULPIN below.
          </p>
        </div>
        <div className="mt-12">
          <LandIntelLookup />
        </div>
      </SectionShell>

      {/* 4. Integration */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Integrations</Eyebrow>
          <SectionHeading className="mt-4">LandIntel feeds the whole build</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Your land data flows into every product that comes next.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid items={integrationItems} columns={3} />
        </div>
      </SectionShell>

      {/* 5. Pricing */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionHeading className="mt-4">Simple pricing for land decisions</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start free with a few lookups a month, and scale as your portfolio grows.
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
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>FAQ</Eyebrow>
          <SectionHeading className="mt-4">LandIntel questions, answered</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Everything you need to know before you look up a plot.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* Try it: ULPIN demo, sample data (parity: W2-269) */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Try it</Eyebrow>
          <SectionHeading className="mt-4">Look up a sample ULPIN</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            Three sample parcels, live from the Ferrum OS data layer — indicative until the real ULPIN registry integration lands.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <UlpinDemoWidget />
        </div>
      </SectionShell>

      {/* 7. CTA */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Run your first land lookup free</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No credit card required. Check a plot before you commit.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
