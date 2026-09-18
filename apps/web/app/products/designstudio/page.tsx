import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import ProductCockpitPreview from '../../../components/workspace/ProductCockpitPreview'
import SteppedForecastModule from '../../../components/sections/SteppedForecastModule'
import { productFeatureRegistry } from '../../../lib/productFeatureRegistry'
import ModelIntakePanel from '../../../components/model-intake/ModelIntakePanel'
import EnvironmentalContextPanel from '../../../components/designstudio/EnvironmentalContextPanel'

const featureItems = productFeatureRegistry.designstudio

// W2-345: rewritten to describe the shipped test-fit tool rather than the
// unbuilt AI brief-wizard workflow (see featureItems above).
const howItWorksSteps = [
  { title: 'Continue from LandIntel', body: 'Use the locked parcel context, or enter plot dimensions when no parcel is available.' },
  { title: 'Swap a regional shell', body: 'Compare original typology-derived outer shells while the rendered view remains visible.' },
  { title: 'Review the evidence', body: 'Inspect SUTRA’s reasons, UNKNOWN items, provenance and the INDICATIVE status before export.' },
]

const integrationItems = [
  { title: 'Structura', body: 'Analyse your design for safety and IS compliance.' },
  { title: 'BOQ Pro', body: 'Estimate cost straight from your plans.' },
  { title: 'Ferrum Projects', body: 'Manage construction against your approved design.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['Indicative test-fit preview', 'Bounded parametric openings', 'Local preview session', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited designs', 'Regional shell catalogue', 'Three.js rendered cockpit', 'DXF export', 'PDF export — roadmap'],
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
    question: 'Is AI plan generation available yet?',
    answer: 'No. AI plan generation remains on the roadmap. The available workspace is an INDICATIVE deterministic preview with bounded parametric door and window editing.',
  },
  {
    question: 'What file formats can I export?',
    answer: 'The preview can export plot, room, door and window geometry to DXF layers. PDF issue sets are on the roadmap.',
  },
  {
    question: 'Can I edit the generated plans?',
    answer: 'You can select generated doors and windows and edit bounded dimensions, sill and configuration. Wall and room dragging, freehand CAD drafting and AI plan generation remain on the roadmap.',
  },
  {
    question: 'Do I need design experience?',
    answer: 'The preview supports a small deterministic test-fit workflow. It does not produce build-ready or production documentation.',
  },
]

export default function DesignStudioPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1.45fr)] lg:items-start">
          <div>
            <Eyebrow>DesignStudio</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Place and compare locality-aware building shells
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Continue from a locked LandIntel parcel, review SUTRA’s locality-fit explanation and swap original regional shell studies inside the always-visible rendered cockpit.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>Three.js real-time PBR and progressive open-source beauty preview</li>
              <li>Regional shells with provenance, fit reasons and explicit UNKNOWN items</li>
              <li>Every model remains INDICATIVE until planning and professional verification</li>
            </ul>
          </div>
          <div className="order-first min-w-0 lg:order-none">
            <ProductCockpitPreview product="designstudio" label="DesignStudio">
              <SteppedForecastModule product="designstudio" />
            </ProductCockpitPreview>
          </div>
        </div>
      </SectionShell>

      <ModelIntakePanel />

      <SectionShell>
        <EnvironmentalContextPanel />
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">Everything you need to design</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            The current shell catalogue and rendered viewport are live. Engineering verification, authority approval and production documentation remain separate controlled stages.
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
          <SectionHeading className="mt-4">From brief to plans in minutes</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start from verified project context where available, compare bounded shell studies and retain the reasoning behind each selection.
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
          <SectionHeading className="mt-4">Designs flow into the build</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            The preview can expose geometry-derived context for review; downstream verification remains required.
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
          <SectionHeading className="mt-4">Simple pricing for design</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start free with a design or two, and scale as your studio grows.
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
          <SectionHeading className="mt-4">DesignStudio questions, answered</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Everything you need to know before you design.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* W2-373 INTERACTION_FIRST: TestFitCalculator (parity: W2-266/267)
          now lives in the hero above — no second render of the same tool here. */}

      {/* 7. CTA */}
      <SectionShell>
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface-secondary p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Design your first building free</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No credit card required. Generate your first plans in minutes.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
