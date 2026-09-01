import SectionShell from '../components/sections/SectionShell'
import Eyebrow from '../components/sections/Eyebrow'
import SectionHeading from '../components/sections/SectionHeading'
import { PrimaryButton, SecondaryButton } from '../components/sections/Buttons'
import CardGrid from '../components/sections/CardGrid'
import SliderLeaf from '../components/sections/SliderLeaf'

// boq-pro stays at /boq-pro (protected app page); every other product moved
// under /products/<slug> in W2-246, with 301s from the old paths.
const productShowcaseItems = [
  { title: 'LandIntel', body: 'Land feasibility & ULPIN lookup', href: '/products/landintel' },
  { title: 'DesignStudio', body: 'AI architectural design', href: '/products/designstudio' },
  { title: 'Structura', body: 'Structural analysis & IS compliance', href: '/products/structura' },
  { title: 'BOQ Pro', body: 'Automated BOQ & cost estimation', href: '/boq-pro' },
  { title: 'ProMarket', body: 'Verified professionals marketplace', href: '/products/promarket' },
  { title: 'BuildOS', body: 'Project management & digital PMC', href: '/products/buildos' },
  { title: 'ProcureHub', body: 'Material procurement & suppliers', href: '/products/procurehub' },
  { title: 'InvestFlow', body: 'Investment forecasting', href: '/products/investflow' },
  { title: 'CommunityBuild', body: 'Fractional development', href: '/products/communitybuild' },
]

const valuePropItems = [
  { title: 'Land', body: 'Check feasibility, zoning and risk before you buy or build.' },
  { title: 'Design', body: 'Generate plans and get them engineered to IS codes.' },
  { title: 'Build', body: 'Estimate, procure, manage and track your project.' },
  { title: 'Invest', body: 'Model returns and raise capital with confidence.' },
]

const howItWorksSteps = [
  { title: 'Look up your land', body: 'Enter a ULPIN and get feasibility, zoning and risk in minutes.' },
  { title: 'Design it', body: 'Turn a brief into plans with AI, then refine and export.' },
  { title: 'Engineer it', body: 'Run structural analysis and IS code checks.' },
  { title: 'Build & manage', body: 'Estimate, procure and track progress to handover.' },
  { title: 'Invest & grow', body: 'Model returns and raise capital.' },
]

const pricingPlans = [
  {
    name: 'Freemium',
    price: 'Free',
    features: ['1 active project', 'ULPIN land lookups', 'Basic BOQ & estimates', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited projects', 'All 9 products', 'IS code compliance', 'Priority support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: '₹9,999/mo',
    features: ['Unlimited everything', 'API access', 'Dedicated account manager', 'Custom integrations'],
    button: 'Contact sales',
  },
]

const testimonials = [
  {
    quote:
      "Ferrum Build took us from a bare plot to a signed-off design in weeks. The ULPIN lookup alone saved us a month of due diligence.",
    name: 'Rahul Mehta',
    title: 'Developer, Bengaluru',
  },
  {
    quote:
      'BOQ Pro gave us a GST-compliant bill of quantities in an afternoon — what used to take our estimator a week.',
    name: 'Priya Sharma',
    title: 'Civil Engineer, Pune',
  },
  {
    quote:
      'We run three projects on BuildOS and ProcureHub. One source of truth for the whole team, from site to site.',
    name: 'Arjun Nair',
    title: 'Contractor, Kochi',
  },
]

export default function HomePage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>The complete build platform</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              India&rsquo;s first end-to-end construction &amp; investment platform
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              From land to design, build and invest — run your entire project on one India-first
              platform. Nine integrated products, one shared data model.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Land feasibility &amp; ULPIN lookup</li>
              <li>AI-generated design &amp; engineering</li>
              <li>Estimate, procure, build &amp; manage</li>
              <li>Invest &amp; raise capital</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
              <SecondaryButton href="/products">Explore Products</SecondaryButton>
            </div>
          </div>
          <div className="rounded-lg border border-relume-border bg-relume-surface-secondary p-10" aria-hidden="true" />
        </div>
      </SectionShell>

      {/* 2. Value Proposition */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Land → Design → Build → Invest</Eyebrow>
          <SectionHeading className="mt-4">One platform, the whole journey</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Four connected stages. Nine products. One shared data model — so nothing is
            re-entered and every decision flows into the next.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid items={valuePropItems} columns={4} />
        </div>
      </SectionShell>

      {/* 3. Product Showcase */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Explore the products</Eyebrow>
          <SectionHeading className="mt-4">Nine products. One platform.</SectionHeading>
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

      {/* 4. How It Works */}
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

      {/* 5. Pricing Preview */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionHeading className="mt-4">Simple, SMB-friendly pricing</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start free. Scale as you build. Plans from ₹499/month — 60–90% below global tools.
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

      {/* 6. Testimonials */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Testimonials</Eyebrow>
          <SectionHeading className="mt-4">Trusted across the build</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Builders, engineers and investors who run their work on Ferrum Build.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="rounded-lg border border-relume-border bg-relume-surface p-6">
              <blockquote className="text-sm leading-6 text-relume-ink">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 border-t border-relume-border pt-4">
                <div className="font-semibold text-relume-ink">{item.name}</div>
                <div className="mt-1 text-sm text-relume-ink">{item.title}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </SectionShell>

      {/* 7. Start Free Trial */}
      <SectionShell>
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface-secondary p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Start building with Ferrum Build</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No credit card required. Set up your first project in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
            <SecondaryButton href="/pricing">Talk to sales</SecondaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
