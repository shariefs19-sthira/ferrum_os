const featureCards = [
  {
    title: 'Gantt planner',
    description: 'Map milestones, dependencies, and site workflows in one visible execution timeline.'
  },
  {
    title: 'Site diary',
    description: 'Capture daily progress, observations, and inspections from the field without losing context.'
  },
  {
    title: 'Material tracker',
    description: 'Track quantities, deliveries, and consumption across active packages and subcontractors.'
  },
  {
    title: 'RFI log',
    description: 'Keep questions, clarifications, and decisions centrally organized for faster closeout.'
  }
];

export default function BuildOSFeatures() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">BuildOS</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Run construction execution with more clarity</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {featureCards.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
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
