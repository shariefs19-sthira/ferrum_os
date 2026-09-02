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
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Resources · Guides</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            A short reading path through the reference library
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
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
              className="relative rounded-2xl border border-relume-border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-relume-ink has-[a:focus-visible]:ring-offset-2"
            >
              <div className="mb-4 inline-flex rounded-full bg-relume-surface-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
                {guide.label}
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-relume-ink">{guide.name}</h2>
              <p className="mt-4 text-sm leading-7 text-relume-muted">{guide.summary}</p>
              <div className="mt-6 border-t border-relume-border pt-4">
                <Link
                  href={guide.href}
                  className="z-10 text-sm font-medium text-relume-ink transition hover:text-relume-ink outline-none after:absolute after:inset-0 after:content-['']"
                >
                  Open {guide.name.toLowerCase()} →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-6 text-relume-muted">
          Looking for articles or client stories instead?{' '}
          <Link href="/resources/blog" className="font-medium text-relume-ink hover:text-relume-ink">
            Browse the blog
          </Link>{' '}
          or{' '}
          <Link
            href="/resources/case-studies"
            className="font-medium text-relume-ink hover:text-relume-ink"
          >
            read a case study
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
