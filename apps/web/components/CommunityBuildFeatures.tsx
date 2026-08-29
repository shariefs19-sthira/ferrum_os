const featureCards = [
  {
    title: 'Contractor network',
    description: 'Connect with trusted local builders, specialists, and project partners ready to mobilize.'
  },
  {
    title: 'Progress milestones',
    description: 'Track key delivery points and keep the community aligned around real project momentum.'
  },
  {
    title: 'Community Q&A',
    description: 'Ask questions, share updates, and surface practical insights from neighbors and experts.'
  },
  {
    title: 'Local pricing',
    description: 'Compare realistic market pricing and understand cost expectations before you commit.'
  }
];

export default function CommunityBuildFeatures() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">CommunityBuild</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Build together with the right local context</h2>
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
