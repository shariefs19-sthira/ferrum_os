import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import SpecTable from '../../../components/SpecTable'
import SteppedForecastModule from '../../../components/sections/SteppedForecastModule'
import ProductCockpitPreview from '../../../components/workspace/ProductCockpitPreview'

// W2-345: only IS-code checking is shipped and real — two clause families
// (IS 456 RCC beam, IS 800 steel column) via lib/checks/isCode.ts, same
// logic on REST and MCP. "Model importer", "FEA analysis", "Sign-off
// workflow" and "Drawing generation" describe capability with zero
// implementation anywhere in the codebase — no model import, no finite
// element solver, no sign-off/approval flow, no drawing output. The full
// solver-orchestration layer these imply is documented in
// docs/ENGINE_ARCH.md as research-only, post-launch, with zero code
// landed. Roadmap-labeled rather than deleted since they describe the
// product's real intended direction.
const featureItems = [
  { title: 'IS code checking (live)', body: 'Run real IS 456 (RCC beam) and IS 800 (steel column) clause checks with pass/fail and citations.' },
  { title: 'Model importer (roadmap)', body: 'Bring in structural models from your design tools — not yet built.' },
  { title: 'FEA analysis (roadmap)', body: 'Run finite element analysis in the cloud — not yet built.' },
  { title: 'Sign-off workflow (roadmap)', body: 'Review, approve and sign off designs professionally — not yet built.' },
  { title: 'Drawing generation (roadmap)', body: 'Generate structural drawings from your analysis — not yet built.' },
]

const howItWorksSteps = [
  { title: 'Enter section parameters', body: 'Beam dimensions and reinforcement, or column slenderness and load.' },
  { title: 'Run the check', body: 'Get a pass/fail result against the specific IS clause, with the clause cited.' },
  { title: 'Iterate', body: 'Adjust parameters and re-check until the section passes.' },
]

const integrationItems = [
  { title: 'DesignStudio', body: 'Analyse plans straight from the design studio.' },
  { title: 'BOQ Pro', body: 'Cost your structure from the analysis.' },
  { title: 'BuildOS', body: 'Manage construction against the approved design.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['1 active project', 'Model import', 'Basic analysis', 'Community support'],
    button: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    tag: 'Most popular',
    features: ['Unlimited projects', 'FEA analysis', 'IS code compliance', 'Priority support'],
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
    question: 'Which IS codes does Structura support?',
    answer: 'Today: one clause check each for IS 456 (RCC beam minimum reinforcement) and IS 800 (steel column slenderness), with the specific clause cited on every result. Broader clause coverage is on the roadmap.',
  },
  {
    question: 'Can I import a structural model?',
    answer: 'Not yet — model import from design tools is on the roadmap. The live tool takes section parameters directly (dimensions, reinforcement, slenderness, load).',
  },
  {
    question: 'Is there a sign-off workflow?',
    answer: 'Not yet — a review/approve/sign-off flow is on the roadmap. Today the tool returns a pass/fail result you can act on yourself.',
  },
  {
    question: 'Do I need engineering software experience?',
    answer: 'Basic structural knowledge helps, but Structura guides you through analysis and compliance.',
  },
]

const beamTableColumns = [
  { key: 'spanM', label: 'Span (m)' },
  { key: 'widthMm', label: 'Width (mm)' },
  { key: 'depthMm', label: 'Depth (mm)' },
  { key: 'steelKg', label: 'Steel (kg/m)' },
  { key: 'use', label: 'Typical use' },
]

const beamTable = [
  { spanM: '3.0', widthMm: '230', depthMm: '300', steelKg: '9.5', use: 'Residential, light partitions' },
  { spanM: '4.0', widthMm: '230', depthMm: '380', steelKg: '14.2', use: 'Residential, room floors' },
  { spanM: '5.0', widthMm: '230', depthMm: '450', steelKg: '19.8', use: 'Residential + small commercial' },
  { spanM: '6.0', widthMm: '300', depthMm: '530', steelKg: '26.4', use: 'Commercial floors, parking' },
  { spanM: '7.5', widthMm: '300', depthMm: '600', steelKg: '34.7', use: 'Heavy commercial, offices' },
  { spanM: '9.0', widthMm: '300', depthMm: '700', steelKg: '44.1', use: 'Long-span commercial, industrial' },
]

export default function StructuraPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1.45fr)] lg:items-start">
          <div>
            <Eyebrow>Structura</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Structural checks with explicit limits
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Live today: two textbook IS-code checks (IS 456 minimum reinforcement, IS 800
              slenderness ratio) — not comprehensive code coverage. Full FEA analysis, broader
              design calculations, and a professional sign-off workflow are on the roadmap.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>IS 456/800 spot checks (2 clauses, live)</li>
              <li>FEA analysis — roadmap</li>
              <li>Professional sign-off — roadmap</li>
            </ul>
          </div>
          <div className="order-first min-w-0 lg:order-none">
            <ProductCockpitPreview product="structura" label="Structura">
              <SteppedForecastModule product="structura" />
            </ProductCockpitPreview>
          </div>
        </div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">Everything you need to engineer</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            From model import to a signed-off, code-compliant design.
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
          <SectionHeading className="mt-4">From model to sign-off</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A clear path from your structural model to a signed-off design.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid items={howItWorksSteps} columns={3} />
        </div>
      </SectionShell>

      {/* Beam-size reference table — real, useful static IS 456 reference
          content from the pre-Relume page, not in the wireframed spec but
          kept rather than dropped (unlike LandIntel's tool, this is static
          data, not a form, so no client-leaf needed). */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Quick lookup</Eyebrow>
          <SectionHeading className="mt-4">Beam-size reference table</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Indicative RC beam sizes for common residential and commercial spans, derived from
            IS 456 for M25 concrete and Fe500 reinforcement. Use as a pre-design starting point
            only — verify with a qualified structural engineer before finalising sections.
          </p>
        </div>
        <div className="mt-12">
          <SpecTable columns={beamTableColumns} rows={beamTable} rowKey="spanM" />
          <p className="mt-4 text-xs text-relume-ink">
            Values are indicative and rounded. Live BoQ quantities, exact reinforcement, and
            deflection checks should be generated in Structura for your specific load case.
          </p>
        </div>
      </SectionShell>

      {/* 4. Integration */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Integrations</Eyebrow>
          <SectionHeading className="mt-4">Engineered designs move forward</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Your approved design feeds costing and construction automatically.
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
          <SectionHeading className="mt-4">Simple pricing for engineering</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Start free with a project or two, and scale as your firm grows.
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
          <SectionHeading className="mt-4">Structura questions, answered</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Everything you need to know before you analyse.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* W2-373 INTERACTION_FIRST: IsCheckWidget now lives in the hero
          above (parity: W2-268) — no second render of the same tool here. */}

      {/* 7. CTA */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-xl rounded-lg border border-relume-border bg-relume-surface p-10 text-center">
          <Eyebrow>Start free</Eyebrow>
          <SectionHeading className="mt-4">Engineer your first structure free</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No credit card required. Run your first analysis in minutes.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
