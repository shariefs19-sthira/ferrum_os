const featureCards = [
  {
    title: 'Frame design assist',
    description: 'Draft framing layouts and iterate quickly with intent-based structural suggestions.'
  },
  {
    title: 'Load calculations',
    description: 'Check gravity and lateral load assumptions with a clean summary view for design reviews.'
  },
  {
    title: 'IS 800 checks',
    description: 'Review compliance inputs against steel design criteria with a structured checklist view.'
  },
  {
    title: 'Report export',
    description: 'Package design notes, load summaries, and recommendations into a shareable report.'
  }
];

export default function StructuraFeatures() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Structura</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Design faster with clearer engineering direction</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {featureCards.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
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
