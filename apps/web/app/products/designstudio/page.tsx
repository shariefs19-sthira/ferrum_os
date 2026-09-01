import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'

const featureItems = [
  { title: 'Brief input wizard', body: 'Describe your rooms, size and style in plain words.' },
  { title: 'AI plan generation', body: 'Get floor plans and elevations generated from your brief.' },
  { title: 'Elevation library', body: 'Browse and apply ready-made facade styles.' },
  { title: 'Plan editor', body: 'Drag walls, rooms and doors to fine-tune the layout.' },
  { title: '3D viewer', body: 'Walk through your design in three dimensions.' },
  { title: 'DXF/PDF export', body: 'Export build-ready drawings to the formats you need.' },
]

const howItWorksSteps = [
  { title: 'Describe your brief', body: 'Tell the wizard your rooms, size and style.' },
  { title: 'Generate & refine', body: 'AI drafts plans and elevations you can edit.' },
  { title: 'Export & build', body: 'Send build-ready drawings to engineering and costing.' },
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
    features: ['Unlimited designs', 'AI generation', '3D viewer', 'DXF/PDF export'],
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
    question: 'How accurate are the AI-generated plans?',
    answer: 'Plans are generated to standard residential and commercial conventions, then fully editable in the plan editor.',
  },
  {
    question: 'What file formats can I export?',
    answer: 'Export to DXF and PDF for engineering, costing and construction.',
  },
  {
    question: 'Can I edit the generated plans?',
    answer: 'Yes — drag walls, rooms and doors to fine-tune the layout.',
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
              Turn a simple brief into editable floor plans and elevations, then view in 3D and
              export to DXF or PDF.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>AI plan generation</li>
              <li>3D viewer</li>
              <li>DXF/PDF export</li>
            </ul>
            <div className="mt-8">
              <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
            </div>
          </div>
          <div className="rounded-lg border border-relume-border bg-relume-surface-secondary p-10" aria-hidden="true" />
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
