const features = [
  {
    icon: 'AI',
    title: 'AI underwriting',
    description: 'Surface land risk, pricing pressure, and conversion potential before teams commit capital.'
  },
  {
    icon: 'CP',
    title: 'Construction controls',
    description: 'Track progress, budgets, and dependencies across sites with a single live operating view.'
  },
  {
    icon: 'VN',
    title: 'Verified network',
    description: 'Bring in trusted contractors, vendors, and partners with transparent performance signals.'
  },
  {
    icon: 'RC',
    title: 'Ready compliance',
    description: 'Keep documentation, approvals, and milestone checks aligned with project execution.'
  }
];

export default function HomeFeatureHighlights() {
  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Built for operators</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            One operating system for construction and capital.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-semibold text-blue-700">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
