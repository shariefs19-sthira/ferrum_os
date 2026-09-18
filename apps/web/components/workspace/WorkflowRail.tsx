"use client"

import { useEffect, useRef, useState } from 'react'
import type { WorkspaceProduct, WorkspaceToolCallbacks } from '../../lib/types'
import { advancedWorkflowProducts, workflowStageForProduct, workflowStages, type WorkflowSignal } from '../../lib/workspace/workflowNavigation'
import { CapabilityStatusBadge, EvidenceStatusBadge } from '../status/GovernanceStatusBadge'

type WorkflowRailProps = Pick<WorkspaceToolCallbacks, 'onProductChange'> & {
  activeProduct: WorkspaceProduct
  staleProducts?: readonly WorkspaceProduct[]
}

const signalTone: Record<WorkflowSignal, string> = {
  ready: 'bg-relume-success',
  stale: 'bg-relume-danger',
  issue: 'bg-relume-accent',
}

function Signal({ label, signal }: { label: string; signal: WorkflowSignal }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-relume-muted">
      <span className={`h-2 w-2 rounded-full ${signalTone[signal]}`} aria-hidden="true" />
      {signal === 'ready' ? 'Ready' : signal === 'stale' ? 'Stale' : 'Issue'}
      <span className="sr-only">: {label}</span>
    </span>
  )
}

function ActiveStatus({ product, stale }: { product: WorkspaceProduct; stale: boolean }) {
  const stage = workflowStageForProduct(product)
  if (!stage) return <CapabilityStatusBadge value={product === 'Community' ? 'ROADMAP' : 'LIMITED PREVIEW'} />
  if (stale) return <EvidenceStatusBadge value="STALE UPSTREAM DATA" />
  return stage.status.kind === 'capability'
    ? <CapabilityStatusBadge value={stage.status.value} />
    : <EvidenceStatusBadge value={stage.status.value} />
}

export default function WorkflowRail({ activeProduct, onProductChange, staleProducts = [] }: WorkflowRailProps) {
  const mobileDetailsRef = useRef<HTMLDetailsElement | null>(null)
  const advancedDetailsRef = useRef<HTMLDetailsElement | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const activeStage = workflowStageForProduct(activeProduct)
  const activeIsStale = staleProducts.includes(activeProduct)
  const activeLabel = activeStage?.label ?? advancedWorkflowProducts.find((item) => item.product === activeProduct)?.label ?? activeProduct
  const staleCount = workflowStages.filter((stage) => staleProducts.includes(stage.product)).length
  const issueCount = workflowStages.filter((stage) => !staleProducts.includes(stage.product) && stage.signal === 'issue').length
  const readyCount = workflowStages.length - staleCount - issueCount

  const choose = (product: WorkspaceProduct) => {
    onProductChange(product)
    setMobileOpen(false)
    setAdvancedOpen(false)
  }

  const closeDisclosures = () => {
    const returnTarget = mobileOpen ? mobileDetailsRef.current : advancedDetailsRef.current
    setMobileOpen(false)
    setAdvancedOpen(false)
    window.setTimeout(() => returnTarget?.querySelector<HTMLElement>('summary')?.focus(), 0)
  }

  useEffect(() => {
    if (!mobileOpen && !advancedOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeDisclosures()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [advancedOpen, mobileOpen]) // eslint-disable-line react-hooks/exhaustive-deps -- closeDisclosures intentionally uses the current disclosure state

  return (
    <nav aria-label="Project workflow" className="relative z-[90] overflow-visible border-b border-relume-border bg-relume-surface px-3 py-2 sm:px-4" data-workflow-rail>
      {(mobileOpen || advancedOpen) && <button type="button" aria-label="Close workflow menu" onClick={closeDisclosures} className="fixed inset-0 z-[80] cursor-default bg-black/20" data-workflow-backdrop />}
      <div className="mx-auto max-w-relume-container">
        <div className="hidden min-[1280px]:flex min-[1280px]:items-center min-[1280px]:gap-1">
          <ol className="flex min-w-0 flex-1 items-stretch" aria-label="Project stages">
            {workflowStages.map((stage) => {
              const active = stage.product === activeProduct
              const signal: WorkflowSignal = staleProducts.includes(stage.product) ? 'stale' : stage.signal
              return (
                <li className="min-w-0 flex-1" key={stage.id}>
                  <button
                    type="button"
                    aria-current={active ? 'step' : undefined}
                    aria-label={`${stage.label}. ${signal === 'ready' ? 'Ready' : signal === 'stale' ? 'Stale' : 'Issue'}: ${signal === 'stale' ? 'Upstream data changed; refresh required' : stage.signalLabel}`}
                    onClick={() => choose(stage.product)}
                    className={`flex min-h-14 w-full flex-col justify-center border-b-2 px-2 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-relume-ink ${active ? 'border-relume-ink text-relume-ink' : 'border-transparent text-relume-muted hover:border-relume-border hover:text-relume-ink'}`}
                  >
                    <span className="truncate text-xs font-semibold">{stage.label}</span>
                    <Signal signal={signal} label={signal === 'stale' ? 'Upstream data changed; refresh required' : stage.signalLabel} />
                  </button>
                </li>
              )
            })}
          </ol>

          <details ref={advancedDetailsRef} open={advancedOpen} onToggle={(event) => { const open=event.currentTarget.open; setAdvancedOpen(open); if(open) setMobileOpen(false) }} className="relative z-[100] ml-2" data-advanced-workflows>
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-ink hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
              More workflows <span className="ml-2" aria-hidden="true">▾</span>
            </summary>
            <div className="absolute right-0 top-full z-[110] mt-2 w-72 rounded-relume border border-relume-border bg-relume-surface p-2 shadow-xl">
              {advancedWorkflowProducts.map((item) => (
                <button key={item.product} type="button" onClick={() => choose(item.product)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-relume px-3 text-left hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-relume-ink">
                  <span><span className="block text-sm font-semibold text-relume-ink">{item.label}</span><span className="block text-xs text-relume-muted">{item.description}</span></span>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${item.roadmap ? signalTone.issue : signalTone.ready}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </details>
          <div className="ml-2 shrink-0"><ActiveStatus product={activeProduct} stale={activeIsStale} /></div>
        </div>

        <div className="flex items-center gap-2 min-[1280px]:hidden">
          <details ref={mobileDetailsRef} open={mobileOpen} onToggle={(event) => { const open=event.currentTarget.open; setMobileOpen(open); if(open) setAdvancedOpen(false) }} className="relative z-[100] min-w-0 flex-1" data-mobile-workflow>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-full border border-relume-border px-4 text-sm font-semibold text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
              <span className="min-w-0"><span className="block truncate">{activeLabel}</span><span className="block text-[10px] font-medium text-relume-muted" aria-label={`${readyCount} ready, ${staleCount} stale, ${issueCount} issues`}>{readyCount} ready · {staleCount} stale · {issueCount} issues</span></span><span aria-hidden="true">▾</span>
            </summary>
            <div className="absolute left-0 top-full z-[110] mt-2 max-h-[min(70dvh,34rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-relume border border-relume-border bg-relume-surface p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-xl">
              <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Project stages</p>
              {workflowStages.map((stage) => {
                const signal: WorkflowSignal = staleProducts.includes(stage.product) ? 'stale' : stage.signal
                return (
                  <button key={stage.id} type="button" aria-current={stage.product === activeProduct ? 'step' : undefined} onClick={() => choose(stage.product)} className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-relume px-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-relume-ink ${stage.product === activeProduct ? 'bg-relume-command text-white' : 'text-relume-ink hover:bg-relume-surface-secondary'}`}>
                    <span><span className="block text-sm font-semibold">{stage.label}</span><span className={`block text-xs ${stage.product === activeProduct ? 'text-white/70' : 'text-relume-muted'}`}>{stage.description}</span></span>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${signalTone[signal]}`} aria-label={signal} />
                  </button>
                )
              })}
              <p className="mt-2 border-t border-relume-border px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">More workflows</p>
              {advancedWorkflowProducts.map((item) => (
                <button key={item.product} type="button" onClick={() => choose(item.product)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-relume px-3 text-left text-relume-ink hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-relume-ink">
                  <span><span className="block text-sm font-semibold">{item.label}</span><span className="block text-xs text-relume-muted">{item.description}</span></span>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${item.roadmap ? signalTone.issue : signalTone.ready}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </details>
          <div className="shrink-0"><ActiveStatus product={activeProduct} stale={activeIsStale} /></div>
        </div>
      </div>
    </nav>
  )
}
