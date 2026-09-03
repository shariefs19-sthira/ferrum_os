"use client"

import { useEffect, useState } from "react"
import { ProvenanceStrip } from "./ProvenanceStrip"

type SubScore = { label: string; weight: number; score: number; note: string }
type PricedLineItem = { category: string; quantity: number; unit: string; rate: number; line_total: number; matched_govt_rate: boolean; taxable: boolean }
type CostBreakdown = { mode: string; line_items: PricedLineItem[]; subtotal: number; gst: number; grand_total: number; indicative: true }
type SensitivityPoint = { delta_pct: number; grand_total: number }
type InvestmentScenario = { scenario: "base" | "bull" | "bear"; irr: number | null; npv: number }
type RiskFlag = { id: string; severity: "info" | "warning"; chip: "INDICATIVE" | "ROADMAP" | null; message: string }
type CityRow = { city: string; cost: CostBreakdown; feasibility_score: number }
type AnalysisResponse = {
  feasibility: { score: number; sub_scores: SubScore[]; indicative: true }
  cost: CostBreakdown
  sensitivity: SensitivityPoint[]
  investment_case: { scenarios: InvestmentScenario[]; discount_rate: number; indicative: true } | null
  risk_flags: RiskFlag[]
  city_comparison: CityRow[]
  computed_at: string
}

const inr = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#138808" : score >= 40 ? "#FF9933" : "#c81e1e"
  return (
    <div className="flex items-center gap-4">
      <div
        role="img"
        aria-label={`Feasibility score ${score} out of 100`}
        className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, var(--relume-surface-secondary, #eee) 0deg)` }}
      >
        <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-relume-surface">
          <span className="text-2xl font-semibold tracking-relume-tight text-relume-ink">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-relume-ink">Feasibility score</p>
        <p className="text-xs text-relume-muted">0-100 composite, rule-based. See breakdown below.</p>
      </div>
    </div>
  )
}

function Chip({ label }: { label: "INDICATIVE" | "ROADMAP" }) {
  const tone = label === "INDICATIVE" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-relume-border bg-relume-surface-secondary text-relume-muted"
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${tone}`}>{label}</span>
}

function SensitivityBars({ points }: { points: SensitivityPoint[] }) {
  const max = Math.max(...points.map((p) => p.grand_total), 1)
  return (
    <div className="grid grid-cols-5 items-end gap-2" role="img" aria-label="Cost sensitivity across -10% to +10% rate deltas">
      {points.map((p) => (
        <div key={p.delta_pct} className="flex flex-col items-center gap-1">
          <div className="flex h-24 w-full items-end rounded-t bg-relume-surface-secondary">
            <div
              className="w-full rounded-t bg-relume-ink"
              style={{ height: `${Math.max((p.grand_total / max) * 100, 2)}%` }}
              aria-hidden="true"
            />
          </div>
          <span className="text-[11px] text-relume-muted">{p.delta_pct > 0 ? `+${p.delta_pct}%` : `${p.delta_pct}%`}</span>
          <span className="text-[10px] text-relume-muted">{inr(p.grand_total)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Analysis Engine tab (W2-370 M3) — reads GET /api/projects/:id/analysis
 * and renders every M1 calculator's output. Nothing here computes
 * anything; it only formats what the API already returned.
 */
export default function AnalysisTab({ projectId }: { projectId: string }) {
  const [data, setData] = useState<AnalysisResponse | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    if (!projectId) return
    setStatus("loading")
    fetch(`/api/projects/${encodeURIComponent(projectId)}/analysis`)
      .then((res) => {
        if (!res.ok) throw new Error("analysis fetch failed")
        return res.json()
      })
      .then((json) => {
        setData(json)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }, [projectId])

  if (!projectId) return <p className="text-sm text-relume-muted">Select a project to see its analysis.</p>
  if (status === "loading") return <p className="text-sm text-relume-muted">Computing analysis…</p>
  if (status === "error" || !data) return <p className="text-sm text-relume-muted">Analysis is not available for this project yet — attach a ULPIN lookup, test-fit, or BOQ to get started.</p>

  return (
    <div id="analysis-report" className="space-y-8">
      {/* M4: print/export — same window.print() pattern as apps/web/app/boq-pro/page.tsx,
          plus the classic "print just this element" CSS trick (hide everything,
          re-show #analysis-report) so the header/footer/tab-nav/cookie banner
          don't end up in the printed report. No new dependency. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #analysis-report, #analysis-report * { visibility: visible; }
          #analysis-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-watermark { display: block !important; }
        }
      `}</style>
      <div className="print-watermark hidden text-center text-xs font-semibold uppercase tracking-[0.2em] text-relume-muted">
        Indicative — Ferrum Analysis Engine report, {new Date(data.computed_at).toLocaleDateString()}
      </div>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <ProvenanceStrip
          source="Ferrum Analysis Engine (in-repo calculators)"
          freshness={new Date(data.computed_at).toLocaleString()}
        />
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-relume-border px-4 py-2 text-sm font-medium text-relume-ink hover:bg-relume-ink hover:text-white"
        >
          Print / Export PDF
        </button>
      </div>
      <div className="rounded-relume border border-relume-border bg-relume-surface p-relume-card">
        <ScoreGauge score={data.feasibility.score} />
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {data.feasibility.sub_scores.map((s) => (
            <div key={s.label} className="rounded-lg border border-relume-border p-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-relume-muted">{s.label} · {s.weight}%</dt>
              <dd className="mt-2 text-xl font-semibold text-relume-ink">{s.score}</dd>
              <p className="mt-1 text-[11px] leading-4 text-relume-muted">{s.note}</p>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-relume border border-relume-border bg-relume-surface p-relume-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">Cost breakdown</h3>
          <Chip label="INDICATIVE" />
        </div>
        {data.cost.line_items.length === 0 ? (
          <p className="mt-4 text-sm text-relume-muted">No BOQ items attached to this project yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-relume-border text-left text-xs uppercase tracking-[0.08em] text-relume-muted">
                  <th className="py-2 pr-2">Category</th>
                  <th className="py-2 pr-2">Qty</th>
                  <th className="py-2 pr-2">Rate</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {data.cost.line_items.map((li) => (
                  <tr key={li.category} className="border-b border-relume-border last:border-0">
                    <td className="py-2 pr-2 text-relume-ink">{li.category}</td>
                    <td className="py-2 pr-2 text-relume-ink">{li.quantity} {li.unit}</td>
                    <td className="py-2 pr-2 text-relume-ink">{inr(li.rate)}</td>
                    <td className="py-2 pr-2 font-medium text-relume-ink">{inr(li.line_total)}</td>
                    <td className="py-2 text-xs text-relume-muted">{li.matched_govt_rate ? "Govt reference" : "Unmatched"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm sm:w-2/3">
              <div><dt className="text-xs text-relume-muted">Subtotal</dt><dd className="font-medium text-relume-ink">{inr(data.cost.subtotal)}</dd></div>
              <div><dt className="text-xs text-relume-muted">GST (18%)</dt><dd className="font-medium text-relume-ink">{inr(data.cost.gst)}</dd></div>
              <div><dt className="text-xs text-relume-muted">Grand total</dt><dd className="font-medium text-relume-ink">{inr(data.cost.grand_total)}</dd></div>
            </dl>
          </div>
        )}
      </div>

      <div className="rounded-relume border border-relume-border bg-relume-surface p-relume-card">
        <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">Rate sensitivity</h3>
        <p className="mt-1 text-xs text-relume-muted">Grand total recomputed at each rate delta — same formula as the cost breakdown above.</p>
        <div className="mt-4">
          <SensitivityBars points={data.sensitivity} />
        </div>
      </div>

      <div className="rounded-relume border border-relume-border bg-relume-surface p-relume-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">Investment case</h3>
          {data.investment_case && <Chip label="INDICATIVE" />}
        </div>
        {!data.investment_case ? (
          <p className="mt-4 text-sm text-relume-muted">No IRR/NPV artifact attached yet — run the InvestFlow calculator and save the result to this project.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {data.investment_case.scenarios.map((s) => (
              <div key={s.scenario} className="rounded-lg border border-relume-border p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-relume-muted">{s.scenario}</p>
                <p className="mt-2 text-relume-ink"><strong>IRR:</strong> {s.irr !== null ? `${(s.irr * 100).toFixed(2)}%` : "Did not converge"}</p>
                <p className="mt-1 text-relume-ink"><strong>NPV:</strong> {inr(s.npv)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-relume border border-relume-border bg-relume-surface p-relume-card">
        <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">City comparison</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-relume-border text-left text-xs uppercase tracking-[0.08em] text-relume-muted">
                <th className="py-2 pr-2">City</th>
                <th className="py-2 pr-2">Cost total</th>
                <th className="py-2">Feasibility score</th>
              </tr>
            </thead>
            <tbody>
              {data.city_comparison.map((row) => (
                <tr key={row.city} className="border-b border-relume-border last:border-0">
                  <td className="py-2 pr-2 text-relume-ink">{row.city}</td>
                  <td className="py-2 pr-2 text-relume-ink">{inr(row.cost.grand_total)}</td>
                  <td className="py-2 text-relume-ink">{row.feasibility_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.risk_flags.length > 0 && (
        <div className="rounded-relume border border-relume-border bg-relume-surface p-relume-card">
          <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">Risk flags</h3>
          <ul className="mt-4 space-y-2">
            {data.risk_flags.map((flag) => (
              <li key={flag.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-relume-border p-3 text-sm">
                {flag.chip && <Chip label={flag.chip} />}
                <span className="text-relume-ink">{flag.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-relume-muted">Computed {new Date(data.computed_at).toLocaleString()}.</p>
    </div>
  )
}
