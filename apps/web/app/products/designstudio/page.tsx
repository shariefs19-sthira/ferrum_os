import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import TestFitCalculator from '../../../components/sections/TestFitCalculator'
import ProductHeroPreview from '../../../components/sections/ProductHeroPreview'

// W2-345: only "Test-fit massing" and "DXF export" are shipped and real
// (the plot-massing calculator on this page, powered by /api/testfit, and
// client-side DXF export). "AI plan generation", "Elevation library",
// "Plan editor" and "3D viewer" describe capability that does not exist —
// no AI/LLM plan generation, elevation library, drag-edit plan editor or
// 3D viewer is implemented anywhere in the codebase. Roadmap-labeled
// rather than deleted since they describe the product's real intended
// direction, not an abandoned idea.
const featureItems = [
  { title: 'Test-fit massing (live)', body: 'Enter plot dimensions and floor count to get a real massing calculation.' },
  { title: 'AI plan generation (roadmap)', body: 'Floor plans and elevations generated from a brief — not yet built.' },
  { title: 'Elevation library (roadmap)', body: 'Browse and apply ready-made facade styles — not yet built.' },
  { title: 'Plan editor (roadmap)', body: 'Drag walls, rooms and doors to fine-tune the layout — not yet built.' },
  { title: '3D viewer (roadmap)', body: 'Walk through your design in three dimensions — not yet built.' },
  { title: 'DXF export', body: 'Export the massing output as a build-ready DXF file.' },
]

// W2-345: rewritten to describe the shipped test-fit tool rather than the
// unbuilt AI brief-wizard workflow (see featureItems above).
const howItWorksSteps = [
  { title: 'Enter plot dimensions', body: 'Plot width, depth and floor count.' },
  { title: 'Get a massing result', body: 'Buildable-area calculation and a visual massing output.' },
  { title: 'Export DXF', body: 'Export the massing as a DXF file for engineering.' },
]

const integrationItems = [
  { title: 'Structura', body: 'Analyse your design for safety and IS compliance.' },
  { title: 'BOQ Pro', body: 'Estimate cost straight from your plans.' },
  { title: 'BuildOS', body: 'Manage construction against your approved design.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['1 active design', 'Brief wizard', 'Basic plan editor', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited designs', 'AI generation — roadmap', '3D viewer — roadmap', 'DXF export', 'PDF export — roadmap'],
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
    answer: 'Not yet — AI-generated plans, the elevation library and a drag-edit plan editor are on the roadmap. What is live today is a test-fit massing calculator (plot dimensions and floor count in, a buildable-area massing result out) with DXF export.',
  },
  {
    question: 'What file formats can I export?',
    answer: 'The test-fit massing tool exports to DXF today. PDF export is on the roadmap.',
  },
  {
    question: 'Can I edit the generated plans?',
    answer: 'Not yet — a drag-edit plan editor (walls, rooms, doors) is on the roadmap. Today\'s test-fit tool is calculator-only: change the inputs and re-run it.',
  },
  {
    question: 'Do I need design experience?',
    answer: 'No. The brief wizard guides you from a plain-language description to build-ready plans.',
  },
]

export default function DesignStudioPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>DesignStudio</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Design your building with AI
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              AI plan generation, editable floor plans, and a 3D viewer are on the roadmap.
              Live today: a test-fit massing calculator with DXF export.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>AI plan generation — roadmap</li>
              <li>3D viewer — roadmap</li>
              <li>DXF export (live) / PDF export — roadmap</li>
            </ul>
            <div className="mt-8">
              <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
            </div>
          </div>
          <ProductHeroPreview product="designstudio" />
        </div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">Everything you need to design</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            From first sketch to build-ready drawings, all in one studio.
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
            Describe what you need, and let the studio do the drafting.
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
            Your drawings hand off to engineering, costing and construction automatically.
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

      {/* Try it: test-fit + DXF export (parity: W2-266/267) */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Try it</Eyebrow>
          <SectionHeading className="mt-4">Generate a test-fit</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            A working preview of the plan generator — real SVG massing and DXF export, indicative data.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <TestFitCalculator />
        </div>
      </SectionShell>

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
