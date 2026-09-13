import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import SteppedForecastModule from '../../../components/sections/SteppedForecastModule'
import UlpinMapExplorer from '../../../components/sections/UlpinMapExplorer'
import ProductCockpitPreview from '../../../components/workspace/ProductCockpitPreview'
import ZoningSummary from '../../../components/landintel/ZoningSummary'
import SoilHazardPanel from '../../../components/landintel/SoilHazardPanel'
import ClimateYearPanel from '../../../components/landintel/ClimateYearPanel'
import HistoryCenturyPanel from '../../../components/landintel/HistoryCenturyPanel'

// W2-347: only ULPIN lookup (indicative sample data) and the interactive
// map (real Leaflet/OSM component) are real. Zoning, soil/hazard,
// feasibility report, and investment forecasts have zero implementation —
// The lookup returns state/district/area_sqm/land_use only, nothing
// else. Roadmap-labeled rather than deleted per RULE 13/W2-345's pattern.
const featureItems = [
  { title: 'ULPIN lookup (live)', body: 'Look up one of three seeded ULPIN records through the D1-backed lookup, with a city-reference map and provenance.' },
  { title: 'Scenario forecast (live)', body: 'Move area and land-use controls to model built-up potential against a sample Karnataka FAR ruleset.' },
  { title: 'Interactive preview map (live)', body: 'See a randomized India map preview, clearly identified as neither a parcel nor a lookup result.' },
  { title: 'Zoning summary', body: 'Know what you can build before you buy — not yet built.' },
  { title: 'Soil & hazard data', body: 'Understand ground conditions and flood or seismic risk — not yet built.' },
  { title: 'Feasibility report', body: 'A shareable report that sizes up the whole deal — not yet built.' },
  { title: 'Investment forecasts', body: 'Project land value and returns over time — not yet built.' },
]

const howItWorksSteps = [
  { title: 'Choose a sample ULPIN', body: 'Select a seeded parcel ID or enter it directly; the lookup is the primary tool on this page.' },
  { title: 'Run the lookup', body: 'Read the returned state, district, area and land-use result with its disclosed provenance.' },
  { title: 'Explore a secondary scenario', body: 'Use the separately labelled indicative forecast only after the lookup.' },
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
    answer: 'The primary lookup returns seeded, indicative records only; it is not an official land-record integration. The secondary forecast applies a disclosed sample Karnataka FAR ruleset to values you choose.',
  },
  {
    question: 'Which cities are covered?',
    answer: 'Three seeded lookup records are available for Bengaluru, Pune and Chennai city-reference maps. They are not parcel geometry or a city-coverage service; broader official coverage remains unshipped.',
  },
]

export default function LandIntelPage() {
  return (
    <main>
      {/* The rail gives the real lookup context before the working surface at every width. */}
      <section className="bg-relume-surface py-relume-section" data-landintel-hero>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-y border-relume-border py-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-end lg:gap-12" data-landintel-context-rail>
            <div>
              <Eyebrow>LandIntel</Eyebrow>
              <SectionHeading as="h1" className="mt-4 max-w-4xl text-balance">
                Know your land before you buy or build
              </SectionHeading>
              <p className="mt-4 max-w-3xl text-base leading-7 text-relume-ink">
                Look up a seeded ULPIN/Bhu-Aadhaar record first. Returned records and city-reference maps are clearly labelled indicative; official zoning, soil, hazard, and entitlement data remain on the roadmap.
              </p>
            </div>
            <ul className="mt-6 grid gap-3 text-sm text-relume-ink sm:grid-cols-2 lg:mt-0" aria-label="LandIntel availability">
              <li className="border-l-2 border-relume-command pl-3">ULPIN/Bhu-Aadhaar lookup <span className="text-relume-muted">— seeded, indicative</span></li>
              <li className="border-l-2 border-relume-command pl-3">Sample FAR and coverage forecast <span className="text-relume-muted">— secondary, indicative</span></li>
              <li className="border-l-2 border-relume-border pl-3">Zoning &amp; soil data <span className="text-relume-muted">— roadmap</span></li>
              <li className="border-l-2 border-relume-border pl-3">Investment forecasts <span className="text-relume-muted">— roadmap</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 min-w-0 w-full" data-landintel-working-row>
          <ProductCockpitPreview product="landintel" label="LandIntel" layout="product-page">
            <UlpinMapExplorer />
          </ProductCockpitPreview>
        </div>
      </section>

      <SectionShell>
        <div className="mx-auto grid max-w-5xl gap-6"><ZoningSummary /><SoilHazardPanel /><ClimateYearPanel /><HistoryCenturyPanel /></div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Secondary tool</Eyebrow>
          <SectionHeading className="mt-4">Indicative land-use forecast</SectionHeading>
          <p className="mt-4 text-base leading-7 text-relume-ink">This scenario is not a parcel result. It uses a disclosed sample Karnataka FAR ruleset and remains secondary to the ULPIN lookup above.</p>
        </div>
        <div className="mx-auto mt-8 max-w-4xl"><SteppedForecastModule product="landintel" /></div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">Everything you need to evaluate a plot</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            The live scenario covers area, sample FAR, coverage and built-up potential. The
            remaining due-diligence surfaces below are explicitly marked as roadmap work.
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
          <SectionHeading className="mt-4">From area inputs to a transparent scenario</SectionHeading>
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
