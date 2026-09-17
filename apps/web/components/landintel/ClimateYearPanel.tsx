"use client"

import { useParcelContext } from '../../lib/workspace/parcelContext'

export type ClimateMonth = { id: string; month: string; rainfall_mm: number; mean_max_c: number; source: string; vintage: string }
export type ClimateRecommendation = { text: string; evidenceMonthId: string }

export default function ClimateYearPanel({ months = [], recommendations = [] }: { months?: ClimateMonth[]; recommendations?: ClimateRecommendation[] }) {
  const parcel = useParcelContext()
  const evidence = new Map(months.map((month) => [month.id, month]))
  const traced = recommendations.filter((item) => evidence.has(item.evidenceMonthId))
  return <section className="rounded-relume border border-relume-border bg-relume-surface p-5" data-climate-year>
    <h3 className="text-lg font-semibold text-relume-command">Climate year and design implications</h3>
    {!parcel ? <p className="mt-4 text-sm text-relume-muted" data-no-parcel-context>No parcel context — resolve a lookup above.</p> : months.length === 0 ? <div className="mt-4 rounded-relume border border-dashed border-relume-border p-4"><strong className="text-xs text-relume-danger">GAP</strong><p className="mt-2 text-sm text-relume-muted">No commercially usable, source-dated climate-normal series is loaded for {parcel.district}. No roof, ventilation, or opening recommendation is inferred.</p></div> : <>
      {/* W2-503: the forced min-w-[42rem] was the actual defect — four
          short columns (month name, rainfall, mean max, source·vintage)
          fit at every supported width once it's removed; the last column
          gets break-words so a long source citation wraps instead of
          forcing the row wider. */}
      <div className="mt-4"><table className="w-full text-left text-xs"><thead><tr className="text-relume-muted"><th>Month</th><th>Rainfall</th><th>Mean max</th><th>Source · vintage</th></tr></thead><tbody>{months.map((month) => <tr key={month.id} className="border-t border-relume-border"><td className="py-2">{month.month}</td><td>{month.rainfall_mm} mm</td><td>{month.mean_max_c} °C</td><td className="break-words">{month.source} · {month.vintage}</td></tr>)}</tbody></table></div>
      <ul className="mt-4 space-y-2">{traced.map((item) => <li key={`${item.evidenceMonthId}:${item.text}`} className="text-xs text-relume-ink">{item.text} <span className="text-relume-muted">Evidence: {item.evidenceMonthId}</span></li>)}</ul>
    </>}
  </section>
}
