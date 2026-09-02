const featureCards = [
  { title: 'ULPIN lookup', description: 'Search parcel data instantly with verified ownership and land metadata.' },
  { title: 'Interactive maps', description: 'View land boundaries, nearby parcels, and contextual spatial signals.' },
  { title: 'Zoning summary', description: 'Check permissible use, FAR, and maximum building height in one glance.' },
  { title: 'Soil & hazard', description: 'Review soil conditions and hazard exposure before a site decision.' },
  { title: 'Feasibility report', description: 'Generate a clean PDF snapshot with key risks and summary insights.' },
  { title: 'Investment forecasts', description: 'Evaluate commercial potential and long-term land monetization scenarios.' },
];

export default function LandIntelFeatures() {
  return (
    <section className="mt-8 rounded-3xl border border-relume-border bg-white p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-relume-ink">LandIntel</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-relume-ink">From parcel intelligence to investment clarity</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-relume-border bg-relume-surface-secondary p-5">
            <div className="mb-4 inline-flex rounded-full bg-relume-surface-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
              Feature
            </div>
            <h3 className="text-xl font-semibold text-relume-ink">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-relume-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
