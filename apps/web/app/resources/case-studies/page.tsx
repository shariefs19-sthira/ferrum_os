import Link from 'next/link';

const caseStudies = [
  {
    label: 'Developer',
    href: '/resources/case-studies/greenfield-developer',
    name: 'Greenfield developer: turning early site assumptions into a confident launch plan',
    summary: 'A landowner used early feasibility signals to clarify risk, sequencing, and capital timing before breaking ground.'
  },
  {
    label: 'Family Build',
    href: '/resources/case-studies/self-build-family',
    name: 'Self-build family: planning a home around approvals, cost, and long-term use',
    summary: 'A family project team tightened design decisions by balancing budget, compliance, and site suitability in one workflow.'
  },
  {
    label: 'Contractor',
    href: '/resources/case-studies/contractor-fleet',
    name: 'Contractor fleet: replacing reactive planning with leaner workfront visibility',
    summary: 'A contractor network reduced uncertainty across teams by coordinating production, manpower, and site readiness more closely.'
  }
];

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Case studies that turn complex projects into clearer decisions
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            See how teams use Ferrum OS to de-risk land acquisition, streamline execution, and improve investment confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#stories" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              View client stories
            </a>
            <a href="/resources" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
              Explore resources
            </a>
          </div>
        </div>
      </section>

      <section id="stories" className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {caseStudies.map((item) => (
            <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                {item.label}
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-slate-900">{item.name}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <Link href={item.href} className="text-sm font-medium text-blue-700 transition hover:text-blue-800">
                  Read story →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
