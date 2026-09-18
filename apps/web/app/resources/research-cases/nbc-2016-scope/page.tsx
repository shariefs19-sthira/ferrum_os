import SectionShell from '../../../../components/sections/SectionShell'
import Eyebrow from '../../../../components/sections/Eyebrow'
import SectionHeading from '../../../../components/sections/SectionHeading'
import ResearchCaseMeta from '../../_components/ResearchCaseMeta'
import { RESEARCH_CASES } from '../../../../lib/resources/registry'

const item = RESEARCH_CASES.find((c) => c.slug === 'nbc-2016-scope')!

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
            The National Building Code of India (NBC) is a model code published by the Bureau of
            Indian Standards. It is not, by itself, a law -- it becomes enforceable in a given
            city or town only when that jurisdiction&rsquo;s building bylaws adopt or reference it,
            which is why two projects a few kilometres apart can sit under meaningfully different
            local requirements even though both point back to the same national code.
          </p>
          <p>
            In practice, NBC scope spans administrative approval processes, structural and fire
            safety provisions, building services (plumbing, electrical, and allied installations),
            and construction management and site-safety practice. A team using Ferrum OS workflows
            treats NBC as the reference model to check local bylaws against, not as a document
            whose text this page reproduces or whose clauses substitute for the official
            publication.
          </p>
          <p>
            Because BIS revises and amends the Code over time, this page intentionally does not
            state a specific current amendment status -- that status is only ever accurate at the
            BIS source page linked above, which is why the metadata block on this page links out
            rather than quoting a snapshot that could go stale.
          </p>
        </div>
      </SectionShell>
    </main>
  )
}
