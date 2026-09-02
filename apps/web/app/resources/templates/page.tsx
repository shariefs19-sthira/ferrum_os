import Link from 'next/link';

const templates = [
  {
    label: 'Feasibility',
    type: 'PDF · 4 pages',
    name: 'Land feasibility one-pager template',
    summary:
      'A single-page template for distilling site visits, soil notes, and access constraints into a decision-ready summary for an investment committee.'
  },
  {
    label: 'Procurement',
    type: 'XLSX · 1 sheet',
    name: 'Rate-comparison sheet (item-rate vs lumpsum)',
    summary:
      'A spreadsheet that lines up vendor quotes on the same activity list, exposes hidden scope gaps, and flags unit-rate outliers before contract.'
  },
  {
    label: 'Site',
    type: 'DOCX · 2 pages',
    name: 'Daily site diary template',
    summary:
      'A short-form diary that captures weather, labour, materials, and instructions-of-the-day in a way that maps cleanly to running bills and change orders.'
  },
  {
    label: 'Handover',
    type: 'PDF · 3 pages',
    name: 'Project handover checklist',
    summary:
      'A structured handover packet covering as-built drawings, warranties, snag lists, and O&M documentation — designed for projects that need to be operable on day one.'
  }
];

export const metadata = {
  title: 'Templates — Ferrum OS Resources',
  description:
    'Downloadable templates for land feasibility, procurement comparison, site diaries, and project handover — distilled from real Ferrum OS engagements.',
  openGraph: {
    title: 'Templates — Ferrum OS Resources',
    description:
      'Downloadable templates for land feasibility, procurement comparison, site diaries, and project handover.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function ResourcesTemplatesPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Resources · Templates</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            Templates we use on real projects
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            Distilled versions of the working artefacts we lean on — feasibility one-pagers, procurement comparison
            sheets, site diaries, handover checklists. Each one is shaped by what the next team downstream will
            need to read, not by what is convenient to fill in.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {templates.map((item) => (
            <article
              key={item.name}
              className="relative rounded-2xl border border-relume-border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-relume-ink has-[a:focus-visible]:ring-offset-2"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                  {item.label}
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-relume-muted">
                  {item.type}
                </span>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-relume-ink">{item.name}</h2>
              <p className="mt-4 text-sm leading-7 text-relume-muted">{item.summary}</p>
              <div className="mt-6 border-t border-relume-border pt-4">
                <Link
                  href="/contact"
                  className="z-10 text-sm font-medium text-relume-ink transition hover:text-relume-ink outline-none after:absolute after:inset-0 after:content-['']"
                >
                  Request download →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-6 text-relume-muted">
          Templates are free for working teams. To request a copy, write to us from{' '}
          <Link href="/contact" className="text-relume-ink hover:text-relume-ink">
            the contact page
          </Link>{' '}
          with a one-line note on how you intend to use it.
        </p>
      </section>
    </main>
  );
}
