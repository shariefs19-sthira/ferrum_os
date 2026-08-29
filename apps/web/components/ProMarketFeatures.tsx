const featureCards = [
  {
    title: 'Verified professionals',
    description: 'Choose vetted specialists with clear credentials, project history, and trust signals.'
  },
  {
    title: 'Escrow payments',
    description: 'Protect project spend with milestone-based payment flows and transparent approvals.'
  },
  {
    title: 'Rating system',
    description: 'Review experience quality, reliability, and communication through structured feedback.'
  },
  {
    title: 'Availability calendar',
    description: 'Confirm working windows and assign tasks with a clear view of team availability.'
  }
];

export default function ProMarketFeatures() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">ProMarket</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Hire with more confidence and clearer oversight</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {featureCards.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-700">
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
