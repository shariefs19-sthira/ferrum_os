import SectionShell from '../components/sections/SectionShell'
import Eyebrow from '../components/sections/Eyebrow'
import SectionHeading from '../components/sections/SectionHeading'
import CardGrid from '../components/sections/CardGrid'
import SliderLeaf from '../components/sections/SliderLeaf'
import HomepageCockpitHero from '../components/sections/HomepageCockpitHero'

// The protected /boq-pro app page still exists separately (RULE 6); this
// card links to its Relume marketing page at /products/boq-pro (W2-250).
const productShowcaseItems = [
  { title: 'LandIntel', body: 'Land feasibility & ULPIN lookup', href: '/products/landintel' },
  { title: 'DesignStudio', body: 'AI architectural design', href: '/products/designstudio' },
  { title: 'Structura', body: 'Structural analysis & IS compliance', href: '/products/structura' },
  { title: 'BOQ Pro', body: 'Automated BOQ & cost estimation', href: '/products/boq-pro' },
  { title: 'ProMarket', body: 'Verified professionals marketplace', href: '/products/promarket' },
  { title: 'BuildOS', body: 'Project management & digital PMC', href: '/products/buildos' },
  { title: 'ProcureHub', body: 'Material procurement & suppliers', href: '/products/procurehub' },
  { title: 'InvestFlow', body: 'Investment forecasting', href: '/products/investflow' },
  { title: 'CommunityBuild', body: 'Fractional development', href: '/products/communitybuild' },
  { title: 'Transact', body: 'Indicative stamp-duty & ask-band estimation', href: '/products/transact' },
]

// W2-347: rewritten to match each linked product page's real vs. roadmap
// split (LandIntel/DesignStudio/ProcureHub/CommunityBuild steps were
// overstating unbuilt capability as present-tense, same defect class
// W2-345 found and fixed on the product pages themselves).
const howItWorksSteps = [
  { title: 'Look up your land', body: 'Enter a ULPIN for indicative sample land details — zoning/risk data on the roadmap.' },
  { title: 'Design it', body: 'Test-fit massing and DXF export today; AI-generated plans on the roadmap.' },
  { title: 'Engineer it', body: 'Two textbook IS-code checks today (IS 456, IS 800); full FEA on the roadmap.' },
  { title: 'Build & manage', body: 'BOQ estimation today; procurement and project tracking on the roadmap.' },
  { title: 'Invest & grow', body: 'Model IRR/NPV today; capital-raising and fractional investment on the roadmap.' },
]

// W2-500 (Project Decision Console): the old "Value Proposition" section
// that used to render here (its own `valuePropItems` array, prose-only
// Land/Design/Build/Invest framing) has been removed — that same
// four-stage framing is now the hero's stage indicator (see
// apps/web/lib/homepageStages.ts and HomepageCockpitHero.tsx), so the
// concept is presented once on the page instead of twice (once as prose,
// once implicitly via the product grid). The ten-product map below is
// relocated to sit directly after the hero, per
// docs/design/HOMEPAGE_REDESIGN_2026.md §5.4.
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
      {/* 1. Product-led cockpit hero (Project Decision Console) */}
      <HomepageCockpitHero />

      {/* 2. Ten-product map, directly below the working preview */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Explore the products</Eyebrow>
          <SectionHeading className="mt-4">Ten products. One platform.</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Each product works standalone or plugs into the full workflow — so you can start
            with one and grow into the rest.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid
            items={productShowcaseItems.map((p) => ({ ...p, linkLabel: 'Learn more' }))}
            columns={3}
          />
        </div>
      </SectionShell>

      {/* 3. How It Works */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <SectionHeading className="mt-4">From plot to profit in five steps</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A clear path from your first land lookup to a finished, funded project.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-xl">
          <SliderLeaf items={howItWorksSteps} />
        </div>
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
