const specs = [
  { label: 'Coverage', value: '14-digit ULPIN, district and village mapping' },
  { label: 'Refresh cadence', value: 'Daily sync with upstream plot data sources' },
  { label: 'Inputs', value: 'Ownership, survey, land use, zoning and parcel context' },
  { label: 'Outputs', value: 'Feasibility summary, risks, and PDF-ready reporting' },
  { label: 'Use cases', value: 'Pre-acquisition review, site diligence, and approvals planning' },
  { label: 'Delivery', value: 'Fast lookup with fallback coverage when live feeds are offline' },
]

export default function ProductSpecs() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-relume-ink">Product specs</p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-relume-tight text-relume-ink sm:text-4xl">
          Built to keep project decisions grounded in real plot intelligence.
        </h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-relume-border bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-relume-surface-secondary">
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">
                Area
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">
                Detail
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {specs.map((spec) => (
              <tr key={spec.label} className="align-top">
                <td className="px-6 py-5 text-sm font-semibold text-relume-ink">{spec.label}</td>
                <td className="px-6 py-5 text-sm leading-6 text-relume-muted">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
