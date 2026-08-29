const posts = [
  {
    category: 'Market Brief',
    title: 'How construction teams reduce rework with better site intelligence',
    summary: 'A practical look at how early planning and property data improve cost certainty across the pre-construction phase.'
  },
  {
    category: 'Operations',
    title: 'Five signals that indicate a project is drifting before schedule slips',
    summary: 'Learn which indicators matter most for project managers when monitoring cash flow, approvals, and procurement lead times.'
  },
  {
    category: 'Investing',
    title: 'What to review before buying land for a residential or mixed-use project',
    summary: 'A framework covering zoning, feasibility, risk, and market demand to tighten investment decisions before commitment.'
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
                <a href="/resources" className="text-sm font-medium text-blue-700 transition hover:text-blue-800">
                  Read article →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
