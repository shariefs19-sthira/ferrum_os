import Link from 'next/link';

const posts = [
  {
    category: 'Market Brief',
    href: '/resources/blog/ulin-explained',
    title: 'ULPIN explained: how unique land identifiers improve diligence and records',
    summary: 'A quick guide to how ULPIN helps teams verify land identity, reduce errors, and compare parcels more confidently.'
  },
  {
    category: 'Standards',
    href: '/resources/blog/is-1200-vs-cesmm4',
    title: 'IS 1200 vs CESMM4: choosing the right specification style',
    summary: 'A practical comparison of two common estimating frameworks used during planning and project delivery.'
  },
  {
    category: 'Operations',
    href: '/resources/blog/monsoon-concreting',
    title: 'Monsoon concreting: the checklist for safe work during wet weather',
    summary: 'A field-ready checklist for protecting finish quality, curing, and site safety when the rains hit.'
  }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Insights for smarter construction decisions
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Fresh thinking on land intelligence, planning, execution, and investment strategy for teams building with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#latest-posts" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              Explore articles
            </a>
            <a href="/resources" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
              Browse all resources
            </a>
          </div>
        </div>
      </section>

      <section id="latest-posts" className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                {post.category}
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-slate-900">{post.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{post.summary}</p>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <Link href={post.href} className="text-sm font-medium text-blue-700 transition hover:text-blue-800">
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
