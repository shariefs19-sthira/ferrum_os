const stats = [
  { value: '4.8/5', label: 'buyer satisfaction', detail: 'Across 2,400+ project reviews' },
  { value: '₹1.2Cr', label: 'saved on average', detail: 'from faster feasibility decisions' },
  { value: '3,400+', label: 'site checks', detail: 'tracked across active projects' },
  { value: '12 days', label: 'faster approvals', detail: 'with synced planning and reporting' },
]

export default function StatsBand() {
  return (
    <section className="bg-slate-900 py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Performance</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Built to move decisions from friction to flow.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-700 bg-slate-800/80 p-6 shadow-sm">
              <div className="text-3xl font-black tracking-tight text-white">{stat.value}</div>
              <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-blue-300">{stat.label}</div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
