import SectionShell from '../../../../components/sections/SectionShell'
import Eyebrow from '../../../../components/sections/Eyebrow'
import SectionHeading from '../../../../components/sections/SectionHeading'
import ResearchCaseMeta from '../../_components/ResearchCaseMeta'
import { RESEARCH_CASES } from '../../../../lib/resources/registry'

const item = RESEARCH_CASES.find((c) => c.slug === 'rera-act-2016-framework')!

export default function Page() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-3xl">
          <Eyebrow>Research Cases</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            {item.title}
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">{item.summary}</p>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="max-w-3xl">
          <ResearchCaseMeta item={item} />
        </div>
      </SectionShell>

      <SectionShell>
        <div className="max-w-3xl space-y-6 text-sm leading-7 text-relume-ink">
          <p>
            The Real Estate (Regulation and Development) Act, 2016 is a central statute. It sets
            the framework -- project registration with a state Real Estate Regulatory Authority,
            mandatory disclosures, escrow requirements for buyer funds, and defined delivery
            timelines -- but each state then implements that framework through its own rules and
            its own RERA authority. Reading the central Act alone tells you the shape of the
            obligation, not whether a specific project in a specific state has actually met it.
          </p>
          <p>
            This matters for diligence: a project can be technically within the letter of the
            central Act while a state-specific rule (on carpet-area disclosure formats, or on
            escrow release conditions, for example) still applies on top of it. Anyone using this
            page as a starting point for diligence needs to pull the current rules from the
            relevant state RERA authority, not stop at the central text.
          </p>
          <p>
            Ferrum OS does not use this page, or any RERA-related product feature, to assert legal
            compliance for any project. It is a facilitator, not a legal practitioner --
            compliance status is a legal determination, not a product output.
          </p>
        </div>
      </SectionShell>
    </main>
  )
}
