import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import SteppedForecastModule from '../../../components/sections/SteppedForecastModule'

// W2-360 BOQ_PAGE_TRUTH: applies the W2-345 claim-truth convention to this
// page's remaining sections — it never got that pass (unlike the other 8
// product pages), because its Hero section alone was fixed separately
// under W2-347-followup. Verified fresh against the real backend before
// writing this:
//   REAL: city-wise pricing (migrations/0002_seed.sql seeds Bengaluru/
//   Pune/Chennai rates) and the three-mode calculator itself
//   (lib/rateEngine/ferrumRateEngine.ts — govt/custom/Ferrum-band,
//   40-40-20 weighted P25/P50/P75 band, rendered live below via
//   ThreeModeCalculator).
//   NOT REAL (for THIS page / its ThreeModeCalculator specifically):
//   grepped lib/, worker.ts, and every migration for UltraTech/Tata/JSW
//   (brand-wise materials) — zero hits, not implemented anywhere.
//   Grepped for design-import/take-off/auto-measure logic — zero hits,
//   no design-import or automated quantity measurement exists anywhere.
//   GST and Excel/PDF export are NOT unimplemented platform-wide —
//   double-checked apps/web/app/boq-pro/page.tsx (the separate,
//   protected standalone take-off tool at /boq-pro, RULE 6) and found
//   both ARE real there: a flat 18% GST computed on the line-item
//   subtotal (boq-pro/page.tsx:43-44,149-150,184) and a working
//   window.print() PDF/print export (boq-pro/page.tsx:74-75,175). That
//   tool is a separate localStorage-based take-off calculator with no
//   data connection to this marketing page's ThreeModeCalculator, so
//   GST/export claims here are still unbacked for what THIS page
//   offers — worded below to say so precisely rather than claim no GST/
//   export logic exists on the platform at all, which would be false.
const featureItems = [
  { title: 'Cost split scenario (live)', body: 'Adjust built-up area and sample grade to see material, labour and GST components update immediately.' },
  { title: 'City-wise pricing (live)', body: 'Rates tuned to your city, seeded across Bengaluru, Pune and Chennai today.' },
  { title: 'Rate band breakdown (live)', body: 'See the P25/P50/P75 band and a role-aware number behind every estimate.' },
  { title: 'Quantity take-off', body: 'Automatically measure quantities from your design — not yet built.' },
  { title: 'Brand-wise materials', body: 'Choose UltraTech, Tata, JSW and more — not yet built.' },
  { title: 'GST-compliant BOQ', body: 'Not from this rate calculator — a separate take-off tool applies GST, but it isn’t connected to this page.' },
]

// Rewritten to describe the real three-mode-calculator workflow instead
// of the unbuilt design-import-and-auto-take-off flow it previously
// claimed.
const howItWorksSteps = [
  { title: 'Set built-up area', body: 'Use the labeled slider; the same area remains visible in metric and Indian units.' },
  { title: 'Choose a sample grade', body: 'Move the grade control to apply the disclosed sample multiplier.' },
  { title: 'Review the split', body: 'See material, labour and 18% GST update live — an indicative scenario, not a measured BOQ.' },
]

// All three cross-product integrations were unbacked: DesignStudio has no
// real plan-generation to estimate from, and ProcureHub/BuildOS have zero
// shipped backend of their own to receive data from this page (confirmed
// during W2-345). Roadmap-labeled rather than deleted, since they describe
// the platform's real intended direction (docs/RELUME_HANDOFF.md §5).
const integrationItems = [
  { title: 'DesignStudio', body: 'Estimate straight from your designs — not yet built.' },
  { title: 'ProcureHub', body: 'Turn your BOQ into purchase orders — not yet built.' },
  { title: 'BuildOS', body: 'Track costs against the project — not yet built.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['1 active project', 'Rate calculator access', 'Standard rate categories', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited projects', 'City-wise pricing', 'Brand-wise materials — roadmap', 'GST-compliant BOQ — not on this calculator'],
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
    question: 'What can I do on BOQ Pro today?',
    answer: 'Use the hero to model an indicative material, labour and GST split from built-up area and a sample grade. The calculation reuses the existing custom assumptions and grade multipliers; it is not an automated take-off or quotation.',
  },
  {
    question: 'Is automated quantity take-off available yet?',
    answer: 'Not yet. There is no design import or automated measurement; the hero models a scenario from the area and sample grade you select.',
  },
  {
    question: 'Which material brands are supported?',
    answer: 'None yet — brand-specific pricing (UltraTech, Tata, JSW, etc.) is on the roadmap. Today’s rates are by category, not brand.',
  },
  {
    question: 'Is the BOQ GST-compliant?',
    answer: 'The hero scenario transparently adds a flat 18% GST to its sample material-and-labour subtotal. This remains indicative and is not a measured or tax-certified BOQ.',
  },
  {
    question: 'Can I export my BOQ?',
    answer: 'Not from this rate calculator yet — Excel/PDF export from it is on the roadmap. The separate BOQ Pro take-off tool does have a print/PDF export today, but it is not connected to this page.',
  },
]

export default function BoqProMarketingPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>BOQ Pro</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Model a cost scenario before take-off
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Explore a transparent built-up-area scenario using the existing custom-rate math.
              Automated take-off, measured quantities, and brand-specific market rates remain on the roadmap.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Live custom-rate scenario math</li>
              <li>Automated quantity take-off — roadmap</li>
              <li>Brand-wise materials — roadmap</li>
            </ul>
          </div>
          <div className="order-first min-w-0 lg:order-none">
            <SteppedForecastModule product="boq-pro" />
          </div>
        </div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">What&apos;s live, and what&apos;s next</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A live, transparent cost-split scenario today. Design import, automated take-off,
            brand-wise pricing and connected exports remain on the roadmap.
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
          <SectionHeading className="mt-4">From built-up area to a cost split</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Three controls-and-results steps, with every assumption exposed.
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
          <SectionHeading className="mt-4">The roadmap connects the platform</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            None of these cross-product integrations are built yet — DesignStudio, ProcureHub and
            BuildOS don&apos;t yet exchange data with this calculator.
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
          <SectionHeading className="mt-4">Simple pricing for estimation</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start free with an estimate or two, and scale as your projects grow.
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
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>FAQ</Eyebrow>
          <SectionHeading className="mt-4">BOQ Pro questions, answered</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Everything you need to know before you estimate.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* W2-373 INTERACTION_FIRST: ThreeModeCalculator (W2-311) now lives
          in the hero above — no second render of the same tool here. */}

      {/* 7. CTA */}
      <SectionShell>
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface-secondary p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Get your first rate band free</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No credit card required. Compute a rate band in minutes.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
