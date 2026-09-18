import Link from 'next/link';

// CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE (follow-up correction).
// Withdrawn: the previous version of this page presented invented survey
// and benchmark statistics -- specific page-count, city-count, respondent-
// count, and project-count figures -- as though they were real research
// Ferrum OS had conducted. No such research exists, so this page is
// withdrawn from public discovery -- noindex, removed from the sitemap,
// removed from every internal link -- rather than relabeled or kept live
// with the same unsupported figures. It stays reachable at this URL only so
// an inbound link or bookmark doesn't 404. (Deliberately not repeating the
// specific invented numbers here: registry.test.ts regression-guards their
// exact absence from this file, comments included.)
export const metadata = {
  title: 'Reports has moved - Ferrum OS',
  description: 'This page has been withdrawn from public discovery. See Research Cases for source-cited material.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/resources/research-cases' },
};

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="mx-auto max-w-2xl rounded-lg border border-relume-border bg-white p-8 text-center sm:p-10">
        <span className="inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
          Page withdrawn
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-relume-tight text-relume-ink sm:text-3xl">Reports</h1>
        <p className="mt-4 text-sm leading-6 text-relume-muted">
          This page has been withdrawn from public discovery. It previously described survey and
          benchmark reports with specific figures (page counts, respondent counts, project counts)
          that Ferrum OS cannot evidence as real research. Nothing on this page was ever a real,
          published survey or benchmark result.
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
  );
}
