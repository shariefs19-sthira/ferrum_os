import SectionShell from '../../../../components/sections/SectionShell'
import Eyebrow from '../../../../components/sections/Eyebrow'
import SectionHeading from '../../../../components/sections/SectionHeading'
import ResearchCaseMeta from '../../_components/ResearchCaseMeta'
import { RESEARCH_CASES } from '../../../../lib/resources/registry'

const item = RESEARCH_CASES.find((c) => c.slug === 'dilrmp-land-records-modernization')!

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
            The Digital India Land Records Modernization Programme (DILRMP) is a central scheme,
            run by the Department of Land Resources, aimed at digitizing and integrating land
            records across states. States publish their own progress catalogs on data.gov.in&rsquo;s
            state nodes -- the Andhra Pradesh entry linked above is one worked example of what
            those catalogs contain: dataset structure, update cadence, and coverage, as defined by
            the contributing state department.
          </p>
          <p>
            A land-diligence reader should treat any completion percentage or district-level status
            figure in one of these catalogs as only as current as its own last-updated timestamp on
            data.gov.in -- this page deliberately does not restate a specific figure, since doing
            so here would go stale the moment the source updates and this page didn&rsquo;t.
          </p>
          <p>
            The broader pattern generalizes: other states publish their own DILRMP progress
            catalogs under their own state data-portal nodes, following the same structure as the
            Andhra Pradesh entry used here as the worked example.
          </p>
        </div>
      </SectionShell>
    </main>
  )
}
