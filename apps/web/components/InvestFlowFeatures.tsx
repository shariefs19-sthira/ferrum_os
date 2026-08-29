const featureCards = [
  {
    title: 'DCF snapshots',
    description: 'Review current valuation assumptions and change drivers in a clean, investor-ready format.'
  },
  {
    title: 'Scenario comparisons',
    description: 'Benchmark base, upside, and downside cases side by side to speed portfolio decisions.'
  },
  {
    title: 'Investor-ready PDFs',
    description: 'Package key assumptions and outputs into polished summaries that are presentation-ready.'
  },
  {
    title: 'IRR projections',
    description: 'Track return outcomes and hold periods with transparent assumptions for easier review.'
  }
];

export default function InvestFlowFeatures() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">InvestFlow</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Make capital decisions with more transparency</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {featureCards.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
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
