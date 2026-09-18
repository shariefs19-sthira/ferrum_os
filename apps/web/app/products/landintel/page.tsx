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
import GeotechnicalIntelligencePanel from '../../../components/landintel/GeotechnicalIntelligencePanel'
import ClimateYearPanel from '../../../components/landintel/ClimateYearPanel'
import HistoryCenturyPanel from '../../../components/landintel/HistoryCenturyPanel'
import SuitabilityLayerPanel from '../../../components/landintel/SuitabilityLayerPanel'
import MapComposerGate from '../../../components/landintel/MapComposerGate'
import TerrainIntelligencePanel from '../../../components/landintel/TerrainIntelligencePanel'
import AccessConnectivityPanel from '../../../components/landintel/AccessConnectivityPanel'
import MarketContextPanel from '../../../components/landintel/MarketContextPanel'
import ProximityCatchmentPanel from '../../../components/landintel/ProximityCatchmentPanel'
import EvidenceThemeTabs from '../../../components/landintel/EvidenceThemeTabs'
import { productFeatureRegistry } from '../../../lib/productFeatureRegistry'

// The ULPIN lookup (seeded sample data) and the interactive map (real
// Leaflet/OSM component) are real, as are the Zoning/Soil/Climate/History/
// Suitability/Terrain/Access/Market instrumentation panels below and the
// Map Composer export gate -- every one of them is a real, rendered
// surface, not a stub. What remains genuinely unconnected is the
// UNDERLYING DATA each panel needs (a verified authority zoning record, a
// geotechnical report, a licensed POI/routing feed, and so on): those
// panels honestly read UNKNOWN/GAP/Roadmap per parcel rather than
// synthesizing a plausible-looking result. The ULPIN lookup itself still
// returns only state/district/area_sqm/land_use from seeded D1 records.
const featureItems = productFeatureRegistry.landintel

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
                Look up a seeded ULPIN/Bhu-Aadhaar record first, then work through land, access, environment, regulation and market evidence below. Every figure is labelled indicative, UNKNOWN or roadmap until a verified source is connected — nothing is synthesized to fill a gap.
              </p>
            </div>
            <ul className="mt-6 grid gap-3 text-sm text-relume-ink sm:grid-cols-2 lg:mt-0" aria-label="LandIntel availability">
              <li className="border-l-2 border-relume-command pl-3">ULPIN/Bhu-Aadhaar lookup <span className="text-relume-muted">— seeded, indicative</span></li>
              <li className="border-l-2 border-relume-command pl-3">Sample FAR and coverage forecast <span className="text-relume-muted">— secondary, indicative</span></li>
              <li className="border-l-2 border-relume-command pl-3">Zoning, soil, climate &amp; history panels <span className="text-relume-muted">— live surfaces, data per-parcel UNKNOWN/GAP until verified</span></li>
              <li className="border-l-2 border-relume-border pl-3">Access, market &amp; proximity catchment evidence <span className="text-relume-muted">— roadmap, no fabricated places or prices</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 min-w-0 w-full" data-landintel-working-row>
          <ProductCockpitPreview product="landintel" label="LandIntel" layout="product-page">
            <UlpinMapExplorer />
          </ProductCockpitPreview>
        </div>
        <div className="mt-6" data-landintel-evidence-themes>
          <EvidenceThemeTabs
            themes={[
              {
                id: 'land',
                label: 'Land',
                description: 'Parcel and statutory suitability constraints, terrain/topography and soil-geotechnical conditions for the resolved site.',
                content: <div className="space-y-6"><SuitabilityLayerPanel /><TerrainIntelligencePanel /><GeotechnicalIntelligencePanel /></div>,
              },
              {
                id: 'access',
                label: 'Access',
                description: 'Lawful road access and connectivity checks, plus a configurable proximity catchment — never a fabricated travel time or nearby place.',
                content: <div className="space-y-6"><AccessConnectivityPanel /><ProximityCatchmentPanel /></div>,
              },
              {
                id: 'environment',
                label: 'Environment',
                description: 'Month-by-month climate normals and a dated century of recorded rainfall, flood, seismic and land-use history for the resolved site.',
                content: <div className="space-y-6"><ClimateYearPanel /><HistoryCenturyPanel /></div>,
              },
              {
                id: 'regulation',
                label: 'Regulation',
                description: 'Master-plan zoning regulation for the resolved parcel, shown with a clause citation where a real source exists and an explicit GAP where it does not.',
                content: <ZoningSummary />,
              },
              {
                id: 'market',
                label: 'Market',
                description: 'Comparable-transaction, guidance-value, price-trend and demand evidence needs — never an appraisal, forecast or investment recommendation.',
                content: <MarketContextPanel />,
              },
            ]}
          />
        </div>
        <div className="mt-6 min-w-0 w-full" data-landintel-export-row>
          <MapComposerGate />
        </div>
        {/* Moved directly beside the working lookup tool (previously two
            full sections lower, after the Zoning/Soil/Climate/History
            roadmap panels) so the forecast is visible alongside a lookup's
            results without scrolling past unrelated roadmap content.
            SteppedForecastModule's LandIntelForecast already reads the
            shared parcel context UlpinMapExplorer's commit() writes on
            every successful lookup (any mode: ULPIN, map pin, coordinates,
            address, my location) - this is a positional fix only, the
            data wiring already existed. Still framed as secondary/
            indicative, per RULE 29 Feature Conservation - not promoted
            to equal or primary standing. */}
        <div className="mt-6 min-w-0 w-full" data-landintel-forecast-row>
          <div className="mx-auto max-w-4xl text-center">
            <Eyebrow>Secondary tool</Eyebrow>
            <SectionHeading className="mt-4">Indicative land-use forecast</SectionHeading>
            <p className="mt-4 text-base leading-7 text-relume-ink">This scenario is not a parcel result. It uses a disclosed sample Karnataka FAR ruleset and remains secondary to the ULPIN lookup above.</p>
          </div>
          <div className="mx-auto mt-8 max-w-4xl"><SteppedForecastModule product="landintel" /></div>
        </div>
      </section>

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
