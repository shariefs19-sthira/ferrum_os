'use client'

import { useEffect, useMemo, useState } from 'react'
import type { StudioPlan } from '../../lib/types'
import {
  UNSUPPORTED_STRUCTURAL_ELEMENT_TYPES,
  buildElementRegister,
  groupEntriesByScope,
  structuralQuantitySummary,
  type BoqLineageEntry,
  type BoqScope,
} from '../../lib/workspace/boqLineage'
import { appendBoqRevision, readOrInitializeBoqRevisionHistory, setLatestCheckerStatus } from '../../lib/workspace/boqRevisionHistory'
import { computeRevisionDelta, effectiveCheckerStatus, isRevisionStale, type BoqRevision, type CheckerStatus } from '../../lib/workspace/boqRevision'

// Drawing/model element -> highlighted measurement -> formula -> BOQ line
// -> revision impact, built entirely on the existing StudioPlan model and
// measureBoq's own formulas (lib/workspace/boqLineage.ts /
// lib/workspace/boqRevision.ts decompose and version that same math — no
// new engineering quantities are invented here).

const format = (value: number, digits = 2) => value.toLocaleString('en-IN', { maximumFractionDigits: digits })
const scopeLabel = (scope: BoqScope) => (scope === 'FOUNDATION' ? 'Foundation / substructure' : `Floor ${scope}`)

const statusStyle: Record<CheckerStatus, string> = {
  DRAFT: 'bg-relume-surface-secondary text-relume-muted border-relume-border',
  'CHECK REQUIRED': 'bg-amber-100 text-amber-950 border-amber-300',
  CHECKED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  'STALE UPSTREAM DATA': 'bg-rose-100 text-rose-900 border-rose-300',
  INDICATIVE: 'bg-orange-50 text-relume-command border-relume-accent',
}

export type BoqTraceabilitySelection = { lineId: string; sourceElementIds: string[]; scope: BoqScope } | undefined

type BoqTraceabilityPanelProps = {
  plan: StudioPlan
  onSelectLine?: (selection: BoqTraceabilitySelection) => void
}

export default function BoqTraceabilityPanel({ plan, onSelectLine }: BoqTraceabilityPanelProps) {
  const [history, setHistory] = useState<BoqRevision[]>([])
  const [selectedLineId, setSelectedLineId] = useState<string>()

  useEffect(() => {
    setHistory(readOrInitializeBoqRevisionHistory(plan))
  }, [plan])

  const latest = history.at(-1)
  const previous = history.length > 1 ? history[history.length - 2] : null
  const stale = latest ? isRevisionStale(latest, plan) : false
  const status: CheckerStatus = latest ? effectiveCheckerStatus(latest, plan) : 'DRAFT'
  const entries = useMemo(() => latest?.lines ?? [], [latest])
  const groups = useMemo(() => groupEntriesByScope(entries), [entries])
  const register = useMemo(() => buildElementRegister(plan), [plan])
  const structural = useMemo(() => structuralQuantitySummary(entries), [entries])
  const delta = previous && latest ? computeRevisionDelta(previous, latest) : []
  const selectedEntry = entries.find((entry) => entry.lineId === selectedLineId)

  const selectLine = (entry: BoqLineageEntry) => {
    const next = selectedLineId === entry.lineId ? undefined : entry.lineId
    setSelectedLineId(next)
    onSelectLine?.(next ? { lineId: entry.lineId, sourceElementIds: entry.sourceElementIds, scope: entry.scope } : undefined)
  }

  const markChecked = (nextStatus: CheckerStatus) => setHistory(setLatestCheckerStatus(nextStatus))

  const recalculate = () => {
    const { history: nextHistory } = appendBoqRevision(plan)
    setHistory(nextHistory)
    setSelectedLineId(undefined)
    onSelectLine?.(undefined)
  }

  return (
    <section className="rounded-relume border border-relume-border bg-relume-surface p-4" data-boq-traceability-panel aria-label="Model-linked take-off">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Model-linked take-off</p>
          <p className="mt-1 text-[11px] text-relume-muted">Revision {latest?.revisionId ?? '—'} · fingerprint {latest?.fingerprint ?? '—'}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusStyle[status]}`} data-checker-status={status}>{status}</span>
      </div>

      {stale && latest && (
        <div className="mt-3 rounded-relume border border-rose-300 bg-rose-50 p-3" data-stale-banner>
          <p className="text-xs font-semibold text-rose-900">STALE UPSTREAM DATA — upstream geometry changed since revision {latest.revisionId} was measured. Lines below still show revision {latest.revisionId}&apos;s numbers until recalculated.</p>
          <button type="button" onClick={recalculate} className="mt-2 min-h-9 rounded-full border border-rose-400 bg-white px-3 text-[11px] font-semibold text-rose-900 hover:bg-rose-100">Recalculate from current geometry</button>
        </div>
      )}

      {previous && latest && !stale && delta.some((line) => line.deltaQuantity) && (
        <div className="mt-3 rounded-relume border border-relume-border bg-relume-surface-secondary p-3" data-revision-delta>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Revision impact · rev {previous.revisionId} → rev {latest.revisionId}</p>
          <ul className="mt-2 space-y-1 text-[11px]">
            {delta.filter((line) => line.deltaQuantity).slice(0, 8).map((line) => (
              <li key={`${line.catalogId}:${line.scope}`} className="flex justify-between gap-2 font-mono">
                <span>{line.catalogId} · {scopeLabel(line.scope)}</span>
                <span className={(line.deltaQuantity ?? 0) > 0 ? 'text-emerald-700' : 'text-rose-700'}>{(line.deltaQuantity ?? 0) > 0 ? '+' : ''}{format(line.deltaQuantity ?? 0, 2)} {line.unit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3" data-structural-quantities>
        {structural.map((item) => (
          <div key={item.kind} className="rounded-relume bg-relume-surface-secondary p-3">
            <dt className="text-[10px] uppercase tracking-[0.12em] text-relume-muted">{item.kind.replace(/_/g, ' ')}</dt>
            <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-relume-command">{item.status === 'UNKNOWN' ? 'UNKNOWN' : `${format(item.value ?? 0)} ${item.unit}`}</dd>
            <p className="mt-1 text-[9px] leading-3 text-relume-muted">{item.basis}</p>
          </div>
        ))}
      </div>

      <div className="mt-5" data-boq-lines>
        <p className="text-xs font-semibold">Lines · select to highlight source geometry</p>
        {groups.map((group) => (
          <div key={String(group.scope)} className="mt-3" data-floor-subtotal={String(group.scope)}>
            <div className="flex items-center justify-between border-b border-relume-border pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">{scopeLabel(group.scope)}</p>
              <span className="font-mono text-[10px] text-relume-muted">{group.totalAmountInr === null ? 'Rate required' : `₹${format(group.totalAmountInr)}`}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {group.lines.map((entry) => {
                const selected = selectedLineId === entry.lineId
                return (
                  <li key={entry.lineId}>
                    <button type="button" onClick={() => selectLine(entry)} aria-pressed={selected} data-boq-line-id={entry.lineId} className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-relume border px-2 py-1 text-left text-[11px] ${selected ? 'border-relume-accent bg-orange-50' : 'border-transparent hover:bg-relume-surface-secondary'}`}>
                      <span>{entry.itemName}</span>
                      <span className="font-mono tabular-nums">{format(entry.quantity)} {entry.unit}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {selectedEntry && (
        <div className="mt-4 rounded-relume border border-relume-accent bg-orange-50 p-3" data-selected-line-detail>
          <p className="text-xs font-semibold text-relume-command">{selectedEntry.itemName} · {scopeLabel(selectedEntry.scope)}</p>
          <dl className="mt-2 space-y-1 text-[11px]">
            <div><dt className="inline font-semibold">Formula/basis: </dt><dd className="inline">{selectedEntry.formulaBasis}</dd></div>
            <div><dt className="inline font-semibold">Source elements: </dt><dd className="inline font-mono">{selectedEntry.sourceElementIds.join(', ')}</dd></div>
            {selectedEntry.assumptions.length > 0 && (
              <div><dt className="font-semibold">Assumptions</dt><dd><ul className="list-disc pl-4">{selectedEntry.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></dd></div>
            )}
            {selectedEntry.exclusions.length > 0 && (
              <div><dt className="font-semibold">Exclusions</dt><dd><ul className="list-disc pl-4">{selectedEntry.exclusions.map((exclusion) => <li key={exclusion}>{exclusion}</li>)}</ul></dd></div>
            )}
          </dl>
        </div>
      )}

      <div className="mt-5" data-element-register>
        <p className="text-xs font-semibold">Element register</p>
        <p className="mt-1 text-[10px] leading-4 text-relume-muted">Covers every room and opening the deterministic generator produced. Not covered as discrete structural elements: {UNSUPPORTED_STRUCTURAL_ELEMENT_TYPES.join(', ')} — this plan model does not generate these as separate members.</p>
        <div className="mt-2 max-h-48 overflow-y-auto">
          <table className="w-full text-left text-[10px]">
            <thead><tr className="border-b border-relume-border text-relume-muted"><th className="py-1">Element</th><th className="py-1">Floor</th><th className="py-1">Detail</th></tr></thead>
            <tbody>{register.map((entry) => <tr key={entry.elementId} className="border-b border-relume-border/70"><td className="py-1">{entry.label}</td><td className="py-1">{entry.floor}</td><td className="py-1 text-relume-muted">{entry.detail}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" data-checker-controls>
        <p className="w-full text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Checker status</p>
        {(['DRAFT', 'CHECK REQUIRED', 'CHECKED'] as CheckerStatus[]).map((option) => (
          <button key={option} type="button" disabled={stale} onClick={() => markChecked(option)} aria-pressed={status === option} className={`min-h-9 rounded-full border px-3 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${status === option ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border text-relume-command hover:bg-relume-surface-secondary'}`}>{option}</button>
        ))}
      </div>

      <div className="mt-5" data-revision-history>
        <p className="text-xs font-semibold">Revision history</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left text-[10px]">
            <thead><tr className="border-b border-relume-border text-relume-muted"><th className="py-1">Revision</th><th className="py-1">Geometry fingerprint</th><th className="py-1">Created</th><th className="py-1">Recorded status</th></tr></thead>
            <tbody>{history.slice().reverse().map((revision) => (
              <tr key={revision.revisionId} className="border-b border-relume-border/70">
                <td className="py-1 font-mono">{revision.revisionId}</td>
                <td className="py-1 font-mono">{revision.fingerprint}</td>
                <td className="py-1">{new Date(revision.createdAt).toLocaleString('en-IN')}</td>
                <td className="py-1">{revision.checkerStatus}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 rounded-relume border border-relume-accent bg-orange-50 p-2 text-[10px] font-semibold leading-4 text-relume-command">INDICATIVE — deterministic geometry only. Rates remain blank until independently verified; checker status is a workflow marker, not a certification.</p>
    </section>
  )
}
