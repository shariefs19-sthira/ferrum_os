import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import UlpinMapExplorer from '../../../components/sections/UlpinMapExplorer'

// W2-347: only ULPIN lookup (indicative sample data) and the interactive
// map (real Leaflet/OSM component) are real. Zoning, soil/hazard,
// feasibility report, and investment forecasts have zero implementation —
// The lookup returns state/district/area_sqm/land_use only, nothing
// else. Roadmap-labeled rather than deleted per RULE 13/W2-345's pattern.
const featureItems = [
  { title: 'ULPIN lookup', body: 'Enter a 14-digit ULPIN and pull indicative sample land records instantly.' },
  { title: 'Interactive maps', body: 'See boundaries, surroundings and access on live maps.' },
  { title: 'Zoning summary', body: 'Know what you can build before you buy — not yet built.' },
  { title: 'Soil & hazard data', body: 'Understand ground conditions and flood or seismic risk — not yet built.' },
  { title: 'Feasibility report', body: 'A shareable report that sizes up the whole deal — not yet built.' },
  { title: 'Investment forecasts', body: 'Project land value and returns over time — not yet built.' },
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
    answer: 'The live demo above runs on a small set of sample parcel records, clearly marked indicative. Live official land-records integration is on the roadmap and not yet connected.',
  },
  {
    question: 'Which cities are covered?',
    answer: 'The current demo covers a handful of sample parcels used to show how the tool works. Broader city coverage depends on the live land-records integration above, which has not shipped yet.',
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
              Enter a 14-digit ULPIN and get indicative sample land details today. Zoning, soil
              and hazard data, and investment forecasts are on the roadmap.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>ULPIN land lookup (indicative)</li>
              <li>Zoning &amp; soil data — roadmap</li>
              <li>Investment forecasts — roadmap</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
            </div>
          </div>
          <div className="order-first min-w-0 md:order-none">
            <UlpinMapExplorer />
          </div>
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

      {/* W2-373 INTERACTION_FIRST: the real UlpinMapExplorer tool now lives
          in the hero above — no second render of the same tool here. */}

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
