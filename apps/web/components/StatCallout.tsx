type Stat = {
  value: string
  label: string
}

type StatCalloutProps = {
  stats: Stat[]
}

export default function StatCallout({ stats }: StatCalloutProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center sm:text-left">
          <div className="text-2xl font-black tracking-tight text-gray-900">{stat.value}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
