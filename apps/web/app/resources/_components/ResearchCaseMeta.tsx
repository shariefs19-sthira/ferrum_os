import type { ResearchCase } from '../../../lib/resources/registry'

// CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE. Every Research Cases entry
// carries this same evidence block -- source, jurisdiction, publication/
// currency note, analysis boundary, and evidence status -- so a reader (or
// a crawler) never has to guess whether a claim traces back to a verified
// primary source.
export default function ResearchCaseMeta({ item }: { item: ResearchCase }) {
  return (
    <dl className="grid gap-6 rounded-lg border border-relume-border bg-relume-surface-secondary p-6 text-sm sm:grid-cols-2 sm:p-8">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Primary source</dt>
        <dd className="mt-2 text-relume-ink">
          <a
            href={item.source.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-medium underline underline-offset-4"
          >
            {item.source.label}
          </a>
          <span className="mt-1 block text-relume-muted">{item.source.publisher}</span>
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Jurisdiction</dt>
        <dd className="mt-2 text-relume-ink">{item.jurisdiction}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Publication / currency note</dt>
        <dd className="mt-2 text-relume-ink">{item.publicationNote}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Analysis boundary</dt>
        <dd className="mt-2 text-relume-ink">{item.analysisBoundary}</dd>
      </div>
      <div className="sm:col-span-2 border-t border-relume-border pt-4">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Evidence status</dt>
        <dd className="mt-2 text-relume-ink">{item.evidenceStatus}</dd>
      </div>
    </dl>
  )
}
