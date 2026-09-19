import SectionShell from '../components/sections/SectionShell'
import Eyebrow from '../components/sections/Eyebrow'
import SectionHeading from '../components/sections/SectionHeading'
import HomepageCockpitHero from '../components/sections/HomepageCockpitHero'
import ProjectFirstHero from '../components/sections/ProjectFirstHero'
import GovernedOrchestrationChain from '../components/sections/GovernedOrchestrationChain'
import HomepageJourney, { type HomepageJourneyStep } from '../components/sections/HomepageJourney'
import RegionalAvailability from '../components/sections/RegionalAvailability'
import { productFeatureRegistry } from '../lib/productFeatureRegistry'

// W2-347: rewritten to match each linked product page's real vs. roadmap
// split (LandIntel/DesignStudio/ProcureHub/CommunityBuild steps were
// overstating unbuilt capability as present-tense, same defect class
// W2-345 found and fixed on the product pages themselves).
const feature = (product: keyof typeof productFeatureRegistry, id: string) => {
  const match = productFeatureRegistry[product].find((item) => item.id === id)
  if (!match) throw new Error(`Homepage journey feature not found: ${product}/${id}`)
  return { title: match.title, body: match.body, availability: match.availability }
}

const howItWorksSteps: HomepageJourneyStep[] = [
  {
    id: 'landintel',
    title: 'Look up your land',
    summary: 'Start with a parcel or location and preserve its evidence state.',
    productLabel: 'LandIntel',
    productHref: '/products/landintel',
    features: [feature('landintel', 'ulpin-lookup'), feature('landintel', 'interactive-map')],
  },
  {
    id: 'designstudio',
    title: 'Develop the scheme',
    summary: 'Turn bounded site inputs into an indicative massing and plan export.',
    productLabel: 'DesignStudio',
    productHref: '/products/designstudio',
    features: [feature('designstudio', 'test-fit-massing'), feature('designstudio', 'dxf-preview-export')],
  },
  {
    id: 'structura',
    title: 'Check the structure',
    summary: 'Run bounded clause checks while preserving engineering limits.',
    productLabel: 'Structura',
    productHref: '/products/structura',
    features: [feature('structura', 'is-code-checking'), feature('structura', 'fea-analysis')],
  },
  {
    id: 'boq-pro',
    title: 'Define scope and cost',
    summary: 'Compare transparent cost assumptions and indicative city rates.',
    productLabel: 'BOQ Pro',
    productHref: '/products/boq-pro',
    features: [feature('boq-pro', 'cost-split'), feature('boq-pro', 'city-pricing')],
  },
  {
    id: 'buildos',
    title: 'Coordinate delivery',
    summary: 'Carry approved changes through controlled project closure.',
    productLabel: 'BuildOS',
    productHref: '/products/buildos',
    features: [feature('buildos', 'governed-cross-functional-closure'), feature('buildos', 'task-management')],
  },
]

// W2-500 (Project Decision Console): the old "Value Proposition" section
// that used to render here (its own `valuePropItems` array, prose-only
// Land/Design/Build/Invest framing) has been removed — that same
// four-stage framing is now the hero's stage indicator (see
// apps/web/lib/homepageStages.ts and HomepageCockpitHero.tsx), so the
// concept is presented once on the page instead of twice (once as prose,
// once implicitly via the product grid).
//
// CODEX-SENTINEL-20260918-1700-cockpit-journey-context: the ten-product
// "Explore the products" CardGrid section that used to render directly
// below the hero has been removed outright, not relocated -- it was a
// literal duplicate of the /products catalogue page (same title, same
// items, same copy) rendered a second time on the homepage. The
// single-homepage-product-navigation rule this task enforces means the
// hero's own product tab rail is the one homepage product-selection
// surface; every product page stays reachable via the header's "Products"
// link (-> /products, which lists and links all ten) and the footer's
// Products column, so removing this duplicate strands no route.
//
// The Pricing Preview section (`pricingPlans`) and the final "Start Free
// Trial" CTA section have also been removed entirely. Per
// docs/design/FERRUM_DOMAIN_AND_ROUTE_MATRIX_2026.md, `/pricing` is HOLD
// (unattributed ₹499/₹9,999 figures, payment processing falls back to a
// stub provider when Razorpay isn't configured) and `/signup`/`/login`
// are real source-level implementations but not deployed-account
// verified — neither should be promoted as a homepage CTA ahead of that
// verification. Removing the pricing block also removes the unattributed
// "60-90% below global tools" comparison that lived inside it.
export default function HomePage() {
  return (
    <main>
      <ProjectFirstHero />

      <RegionalAvailability />

      {/* Existing product behavior remains intact as a detailed platform
          preview below the project-first orientation. */}
      <div id="how-ferrum-works">
        <HomepageCockpitHero />
      </div>

      {/* A concrete cross-product proof contract. This remains explicitly
          ROADMAP until the state transitions and evidence links execute. */}
      <div id="platform">
        <GovernedOrchestrationChain />
      </div>

      {/* 3. How It Works */}
      <SectionShell id="how-it-works" background="surface-secondary">
        <div className="max-w-3xl">
          <Eyebrow>How it works</Eyebrow>
          {/* CODEX-SENTINEL-20260918-1700-cockpit-journey-context: "profit"
              was an unverified outcome claim (Ferrum OS is pre-launch, no
              real project has completed through it) — "delivery" states
              what the last workflow step in `howItWorksSteps` (Build &
              manage) actually is. */}
          <SectionHeading className="mt-4">From plot to delivery in five steps</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A clear path from your first land lookup through design, cost, and delivery.
          </p>
        </div>
        <HomepageJourney items={howItWorksSteps} />
      </SectionShell>

      {/* Testimonials section removed under W2-345 (SITEWIDE_CLAIM_TRUTH):
          it presented three fabricated customer quotes attributed to
          invented named individuals (Rahul Mehta, Priya Sharma, Arjun Nair)
          who do not exist. Ferrum OS is pre-launch and has no real customers
          to quote yet. This is a DELETE decision, not REWRITE/ROADMAP-LABEL —
          there is no honest version of a customer testimonial section before
          there are customers. Reinstate with real, attributed quotes once
          they exist. */}
    </main>
  )
}
