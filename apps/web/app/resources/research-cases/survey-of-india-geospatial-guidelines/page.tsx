import SectionShell from '../../../../components/sections/SectionShell'
import Eyebrow from '../../../../components/sections/Eyebrow'
import SectionHeading from '../../../../components/sections/SectionHeading'
import ResearchCaseMeta from '../../_components/ResearchCaseMeta'
import { RESEARCH_CASES } from '../../../../lib/resources/registry'

const item = RESEARCH_CASES.find((c) => c.slug === 'survey-of-india-geospatial-guidelines')!

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
            Survey of India, under the Department of Science &amp; Technology, publishes geospatial
            data guidelines that govern how mapping and survey data may be collected, held, and
            shared in India. These guidelines followed the 2021 liberalization of India&rsquo;s
            geospatial data policy, which opened up commercial and private survey activity that was
            previously far more restricted.
          </p>
          <p>
            For a parcel-mapping or diligence workflow, the practical relevance is accuracy and
            provenance: the guidelines set expectations for how mapping data should be sourced and
            classified. This page does not quote specific accuracy-class thresholds or restricted
            zones from the guidelines -- those change, and restating them here risks going stale or,
            worse, being treated as a substitute for the source text.
          </p>
          <p>
            Ferrum OS map-based tooling references publicly available imagery and parcel data
            sources; this page explains why that sourcing discipline matters, not what any specific
            Ferrum OS map output is derived from -- that detail belongs on the relevant product
            page, not here.
          </p>
        </div>
      </SectionShell>
    </main>
  )
}
