import Link from 'next/link';

const sections = [
  {
    label: 'Articles',
    href: '/resources/blog',
    name: 'Blog',
    summary: 'Field notes, standards explainers, and operational checklists for land, design, and delivery teams.'
  },
  {
    label: 'Client Stories',
    href: '/resources/case-studies',
    name: 'Case Studies',
    summary: 'How developers, families, and contractors use Ferrum OS to plan with more confidence and less rework.'
  },
  {
    label: 'Standards',
    href: '/resources/is-code-guides',
    name: 'IS Code Guides',
    summary: 'A practical radar for Indian construction standards: what to adopt, hold, or drop in real workflows.'
  }
];

export default function ResourcesIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Everything you need to plan, build, and decide with clarity
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A growing library of articles, client stories, and Indian construction standards guides to help real estate and infrastructure teams move from uncertainty to confident action.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <article key={section.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                {section.label}
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-slate-900">{section.name}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{section.summary}</p>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <Link href={section.href} className="text-sm font-medium text-blue-700 transition hover:text-blue-800">
                  Browse {section.name.toLowerCase()} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
