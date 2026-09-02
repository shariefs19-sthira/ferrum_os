import Link from 'next/link';

const reports = [
  {
    slug: 'india-construction-cost-benchmarks-2026',
    title: 'India construction cost benchmarks, 2026 edition',
    year: '2026',
    type: 'Annual benchmark',
    summary:
      'A 48-page benchmark of unit costs across residential, commercial, and infrastructure projects in 12 Indian cities, with a methodology section explaining how each line item is sourced and reconciled.'
  },
  {
    slug: 'standards-discipline-survey',
    title: 'Standards discipline survey: developer and contractor practice',
    year: '2026',
    type: 'Industry survey',
    summary:
      'A 32-page survey of how 140 Indian developers and 90 contractors actually apply IS Codes, CESMM, and internal estimating templates in their award and execution decisions, with a gap analysis between policy and practice.'
  },
  {
    slug: 'monsoon-impact-report',
    title: 'Monsoon impact report, three-year panel',
    year: '2025',
    type: 'Field study',
    summary:
      'A three-year panel study of monsoon-related schedule and cost deviations across 38 active projects, with a comparison of the documentation discipline that closed the gap versus the projects that did not.'
  },
  {
    slug: 'procurement-cycle-times',
    title: 'Procurement cycle times, mid-rise residential',
    year: '2025',
    type: 'Process benchmark',
    summary:
      'A 24-page benchmark of procurement cycle times for the 40 most-bought item categories in Indian mid-rise residential, with a breakdown of which approval gates add the most days and how leading teams compress them.'
  }
];

export const metadata = {
  title: 'Reports — Ferrum OS Resources',
  description:
    'Annual benchmarks, industry surveys, and field studies from the Ferrum OS team on cost, schedule, and standards discipline in Indian construction.',
  openGraph: {
    title: 'Reports — Ferrum OS Resources',
    description:
      'Annual benchmarks, industry surveys, and field studies from the Ferrum OS team.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Reports
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Annual benchmarks, industry surveys, and field studies
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {reports.map((report) => (
            <article key={report.slug} className="border-b border-relume-border pb-8 last:border-b-0 last:pb-0">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink">{report.title}</h2>
                <span className="text-sm font-medium text-relume-muted">
                  {report.year} · {report.type}
                </span>
              </div>
              <p className="mt-3 text-relume-muted">{report.summary}</p>
              <p className="mt-4 text-sm text-relume-muted">
                Reference this report with its Ferrum OS slug:{' '}
                <code className="font-mono text-relume-muted">{report.slug}</code>
              </p>
            </article>
          ))}

          <div className="pt-4 border-t border-relume-border text-sm text-relume-muted">
            <p>
              For shorter, working-team material, see the{' '}
              <Link href="/resources/blog" className="text-relume-ink hover:underline">
                blog
              </Link>{' '}
              or the{' '}
              <Link href="/resources/whitepapers" className="text-relume-ink hover:underline">
                whitepapers
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
