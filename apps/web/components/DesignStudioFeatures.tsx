const featureCards = [
  {
    title: 'AI floor plans',
    description: 'Generate layout options quickly from your brief and iterate on the most promising concepts.'
  },
  {
    title: '3D massing',
    description: 'Review building composition and spatial relationships before detailed design work begins.'
  },
  {
    title: 'Vastu checks',
    description: 'Flag planning-level guideline considerations early to reduce downstream revisions.'
  },
  {
    title: 'Plan variants',
    description: 'Compare alternative layouts, orientation choices, and program mixes side by side.'
  }
];

export default function DesignStudioFeatures() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">DesignStudio</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Turn concept exploration into sharper early decisions</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {featureCards.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
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
