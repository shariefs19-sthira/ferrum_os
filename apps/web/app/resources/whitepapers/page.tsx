import Link from 'next/link';

const whitepapers = [
  {
    slug: 'boq-drift-diagnostics',
    title: 'BOQ drift diagnostics: a field protocol',
    year: '2026',
    pages: 18,
    summary:
      'A working protocol for detecting cost and quantity drift between the estimate, the site diary, and the running bill, with worked examples from Indian mid-rise residential projects.'
  },
  {
    slug: 'standards-as-procurement-filter',
    title: 'Standards as a procurement filter, not a checkbox',
    year: '2026',
    pages: 22,
    summary:
      'Why IS Code alignment is a stronger vendor-evaluation signal than lowest-quote selection, and how to operationalise it inside a procurement workflow without slowing awards down.'
  },
  {
    slug: 'is-1200-vs-cesmm4',
    title: 'IS 1200 vs CESMM4: a measured comparison for Indian projects',
    year: '2025',
    pages: 14,
    summary:
      'Side-by-side comparison of measurement conventions, method-statement granularity, and risk allocation between the two civil-engineering measurement standards, with localisation notes.'
  },
  {
    slug: 'monsoon-concreting-decision-tree',
    title: 'Monsoon concreting decision tree for site engineers',
    year: '2025',
    pages: 11,
    summary:
      'A printable decision tree for sequencing pours, protecting curing, and documenting weather deviations during the Indian monsoon, derived from a year of field-clinic case logs.'
  }
];

export const metadata = {
  title: 'Whitepapers — Ferrum OS Resources',
  description:
    'Long-form research from the Ferrum OS team on cost, quantity, and standards discipline in Indian construction projects. Read or download.',
  openGraph: {
    title: 'Whitepapers — Ferrum OS Resources',
    description:
      'Long-form research from the Ferrum OS team on cost, quantity, and standards discipline.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function WhitepapersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Whitepapers
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Long-form research on cost, quantity, and standards discipline
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {whitepapers.map((paper) => (
            <article key={paper.slug} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{paper.title}</h2>
                <span className="text-sm font-medium text-gray-500">
                  {paper.year} · {paper.pages} pages
                </span>
              </div>
              <p className="mt-3 text-gray-600">{paper.summary}</p>
              <p className="mt-4 text-sm text-gray-500">
                Reference this paper with its Ferrum OS slug:{' '}
                <code className="font-mono text-gray-700">{paper.slug}</code>
              </p>
            </article>
          ))}

          <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              Looking for shorter, working-team material? See the{' '}
              <Link href="/resources/blog" className="text-blue-700 hover:underline">
                blog
              </Link>{' '}
              or the{' '}
              <Link href="/resources/templates" className="text-blue-700 hover:underline">
                downloadable templates
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
