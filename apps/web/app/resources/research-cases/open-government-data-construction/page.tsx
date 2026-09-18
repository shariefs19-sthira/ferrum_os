import SectionShell from '../../../../components/sections/SectionShell'
import Eyebrow from '../../../../components/sections/Eyebrow'
import SectionHeading from '../../../../components/sections/SectionHeading'
import ResearchCaseMeta from '../../_components/ResearchCaseMeta'
import { RESEARCH_CASES } from '../../../../lib/resources/registry'

const item = RESEARCH_CASES.find((c) => c.slug === 'open-government-data-construction')!

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
            data.gov.in is the Government of India&rsquo;s national Open Government Data platform.
            Central ministries and state departments publish catalog entries there -- land
            records, infrastructure, planning, and market datasets among them -- each owned and
            updated by the contributing department, not by the portal itself.
          </p>
          <p>
            For a land or construction diligence workflow, the practical value is being able to
            point at a named, publicly checkable dataset instead of an unsourced figure. The
            portal organizes entries by ministry, sector, and state, which is the fastest way to
            find the specific catalog relevant to a given parcel&rsquo;s state or scheme.
          </p>
          <p>
            This page is a navigation aid to that structure, not a claim that Ferrum OS ingests any
            specific data.gov.in dataset into a live product pipeline. Where a Ferrum OS workflow
            does reference a specific dataset, that reference is made on the relevant product page,
            not implied here.
          </p>
        </div>
      </SectionShell>
    </main>
  )
}
