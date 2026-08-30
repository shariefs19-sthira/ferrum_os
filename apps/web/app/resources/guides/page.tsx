import Link from 'next/link';

const guides = [
  {
    label: 'Standards',
    href: '/resources/is-code-guides',
    name: 'IS Code Guides',
    summary:
      'A practical radar for Indian construction standards: what to adopt, hold, or drop in real land, design, and delivery workflows.'
  },
  {
    label: 'Reference',
    href: '/resources/glossary',
    name: 'Glossary',
    summary:
      'Plain-language definitions for the land, design, and delivery terms that show up across our articles, case studies, and standards guides.'
  },
  {
    label: 'Help',
    href: '/resources/faq',
    name: 'FAQ',
    summary:
      'Common questions about the library: how to cite a guide, how often standards notes are updated, and where to send corrections.'
  }
];

export const metadata = {
  title: 'Guides — Ferrum OS Resources',
  description:
    'A reading path through the Ferrum OS reference library: IS Code Guides, Glossary, and FAQ, with one-line descriptions of each.',
  openGraph: {
    title: 'Guides — Ferrum OS Resources',
    description:
      'A reading path through the Ferrum OS reference library: IS Code Guides, Glossary, and FAQ.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function ResourcesGuidesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Resources · Guides</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            A short reading path through the reference library
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Three pages, one job: help you ground a decision in the right standard, the right term, and the right
            answer. Start with whichever fits the question in front of you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {guides.map((guide) => (
            <article
              key={guide.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                {guide.label}
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-slate-900">{guide.name}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{guide.summary}</p>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <Link
                  href={guide.href}
                  className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
                >
                  Open {guide.name.toLowerCase()} →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-6 text-slate-500">
          Looking for articles or client stories instead?{' '}
          <Link href="/resources/blog" className="font-medium text-blue-700 hover:text-blue-800">
            Browse the blog
          </Link>{' '}
          or{' '}
          <Link
            href="/resources/case-studies"
            className="font-medium text-blue-700 hover:text-blue-800"
          >
            read a case study
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
