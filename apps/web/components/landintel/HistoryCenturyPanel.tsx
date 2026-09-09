"use client"

import { useParcelContext } from '../../lib/workspace/parcelContext'

export type HistoricalParcelEvent = { id: string; category: 'Rainfall extreme' | 'Flood/seismic event' | 'Land-use change'; date: string; title: string; source: string; sourceYear: string }
const categories: HistoricalParcelEvent['category'][] = ['Rainfall extreme', 'Flood/seismic event', 'Land-use change']

export default function HistoryCenturyPanel({ events = [] }: { events?: HistoricalParcelEvent[] }) {
  const parcel = useParcelContext()
  const dated = events.filter((item) => item.date && item.source && item.sourceYear)
  return <section className="rounded-relume border border-relume-border bg-relume-surface p-5" data-history-century>
    <h3 className="text-lg font-semibold text-relume-command">100-year evidence timeline</h3>
    {!parcel ? <p className="mt-4 text-sm text-relume-muted" data-no-parcel-context>No parcel context — resolve a lookup above.</p> : <div className="mt-4 grid gap-3 lg:grid-cols-3">{categories.map((category) => {
      const items = dated.filter((item) => item.category === category)
      return <div key={category} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3"><div className="flex justify-between gap-2"><h4 className="text-xs font-semibold text-relume-command">{category}</h4>{items.length === 0 && <span className="text-[10px] font-semibold text-relume-danger">GAP</span>}</div>{items.length === 0 ? <p className="mt-2 text-xs leading-5 text-relume-muted">No source-dated record loaded for {parcel.district}; undated claims are omitted.</p> : <ul className="mt-2 space-y-3">{items.map((item) => <li key={item.id} className="text-xs text-relume-ink"><time className="font-mono">{item.date}</time> · {item.title}<p className="text-[10px] text-relume-muted">{item.source} · published {item.sourceYear}</p></li>)}</ul>}</div>
    })}</div>}
  </section>
}
