import Link from 'next/link'

// CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE. Shared compatibility notice
// for withdrawn Case Studies URLs. The static-export architecture (next.config.js
// `output: 'export'`) has no server to issue a real HTTP redirect, so the
// truthful treatment here is: keep the URL resolving (no dead link for an
// old bookmark or inbound link), state plainly what happened and why, and
// point to where verified content actually lives -- never a silent
// meta-refresh pretending to be an automatic redirect, and never a page
// that still reads as a customer-use claim.
export default function LegacyNotice({ title }: { title: string }) {
  return (
    <main className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="mx-auto max-w-2xl rounded-lg border border-relume-border bg-white p-8 text-center sm:p-10">
        <span className="inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
          Page withdrawn
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-relume-tight text-relume-ink sm:text-3xl">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-relume-muted">
          This page previously described an illustrative product-fit scenario under the
          &ldquo;Case Studies&rdquo; label. It has been withdrawn from public discovery because
          that framing could be read as a claim of a real customer engagement, outcome, or
          endorsement -- and Ferrum OS does not have verified evidence to back that claim for
          this scenario. Nothing on this page was ever a real, named customer story.
        </p>
        <p className="mt-4 text-sm leading-6 text-relume-muted">
          For source-cited material, see Research Cases -- independent analysis grounded in named
          primary sources (government codes, statutes, and open datasets), each with its source,
          jurisdiction, and evidence status stated.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/resources/research-cases"
            className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink"
          >
            Open Research Cases
          </Link>
          <Link
            href="/resources"
            className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink"
          >
            Back to Resources
          </Link>
        </div>
      </div>
    </main>
  )
}
