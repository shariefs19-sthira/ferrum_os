const featureCards = [
  {
    title: 'Vendor directory',
    description: 'Browse qualified suppliers and compare operational fit before issuing a purchase request.'
  },
  {
    title: 'Rate comparison',
    description: 'Review quotes across vendors to reduce cost variance and improve procurement confidence.'
  },
  {
    title: 'Purchase orders',
    description: 'Issue, approve, and track orders with a single source of truth across procurement activity.'
  },
  {
    title: 'Delivery tracking',
    description: 'Monitor shipments, expected arrival dates, and supply commitments without chasing updates.'
  }
];

export default function ProcureHubFeatures() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">ProcureHub</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Source smarter with more control over the pipeline</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {featureCards.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-700">
              Feature
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
