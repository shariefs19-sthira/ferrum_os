import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton } from '../../../components/sections/Buttons'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import SpecTable from '../../../components/SpecTable'

const featureItems = [
  { title: 'Model importer', body: 'Bring in structural models from your design tools.' },
  { title: 'FEA analysis', body: 'Run finite element analysis in the cloud.' },
  { title: 'Design calculations', body: 'Get detailed RCC and steel design calculations.' },
  { title: 'Sign-off workflow', body: 'Review, approve and sign off designs professionally.' },
  { title: 'Drawing generation', body: 'Generate structural drawings from your analysis.' },
  { title: 'IS code compliance', body: 'Stay aligned to IS 456 and IS 800 throughout.' },
]

const howItWorksSteps = [
  { title: 'Import your model', body: 'Bring in your structural model from design tools.' },
  { title: 'Run the analysis', body: 'Get FEA results and design calculations.' },
  { title: 'Sign off & generate', body: 'Approve the design and generate drawings.' },
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
    answer: 'Structura supports IS 456 for RCC and IS 800 for steel structures, with more codes on the way.',
  },
  {
    question: 'What model formats can I import?',
    answer: 'Import structural models from common design tools and formats.',
  },
  {
    question: 'Can I sign off designs professionally?',
    answer: 'Yes — the sign-off workflow lets reviewers approve and certify designs.',
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
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>Structura</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Structural analysis you can sign off on
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Analyse RCC and steel buildings in the cloud with IS 456/800 compliance, FEA,
              design calculations and a professional sign-off workflow.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-relume-ink">
              <li>IS 456/800 compliance</li>
              <li>FEA analysis</li>
              <li>Professional sign-off</li>
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
