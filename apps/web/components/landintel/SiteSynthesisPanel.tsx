'use client'

import { useState } from 'react'
import { siteModules, type SiteSynthesis } from '../../lib/landintel/siteAnalysis'
import type { HandoffStatus, SiteHandoff, SiteReview } from '../../lib/landintel/siteAnalysisStore'

export type SiteSynthesisPanelProps = {
  synthesis: SiteSynthesis
  hasParcel: boolean
  review: SiteReview | null
  handoff: SiteHandoff | null
  handoffState: HandoffStatus
  saveError: string
  onReview: (reviewer: string) => void
  onSend: () => void
  onWithdraw: () => void
}

const chip = 'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em]'

export default function SiteSynthesisPanel({ synthesis, hasParcel, review, handoff, handoffState, saveError, onReview, onSend, onWithdraw }: SiteSynthesisPanelProps) {
  const [reviewer, setReviewer] = useState('')
  const [reviewerError, setReviewerError] = useState(false)
  const reviewCurrent = review !== null && review.snapshotHash === synthesis.snapshotHash
  const canSend = hasParcel && reviewCurrent && synthesis.qualified.length > 0
  const sendBlock = !hasParcel ? 'Resolve a site first.' : synthesis.qualified.length === 0 ? 'No qualified record yet — nothing can be handed off.' : !reviewCurrent ? 'Review the current synthesis first; any change to the evidence clears the review.' : ''

  const submitReview = () => {
    if (!reviewer.trim()) { setReviewerError(true); return }
    setReviewerError(false)
    onReview(reviewer.trim())
  }

  return (
    <section className="mt-6 min-w-0 rounded-relume border border-relume-border bg-relume-surface" aria-labelledby="site-synthesis-heading" data-site-synthesis>
      <div className="border-b border-relume-border p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Synthesis · review before design</p>
        <h3 id="site-synthesis-heading" className="mt-2 text-xl font-semibold tracking-relume-tight text-relume-ink">What is known, what is missing, what still needs a professional</h3>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-relume-muted">This synthesis <strong className="text-relume-ink">produces no design recommendation</strong>. It qualifies context, lists gaps and keeps four professional gates OPEN. Only reviewed, qualified records can be handed to DesignStudio and SUTRA, and any later change marks the handoff STALE.</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4" data-site-synthesis-counts>
          <div><dt className="text-relume-muted">Qualified records</dt><dd className="mt-1 text-lg font-semibold text-relume-ink" data-count="qualified">{synthesis.qualified.length}</dd></div>
          <div><dt className="text-relume-muted">Held back</dt><dd className="mt-1 text-lg font-semibold text-relume-ink" data-count="held-back">{synthesis.heldBack.length}</dd></div>
          <div><dt className="text-relume-muted">Topics with a gap or shortfall</dt><dd className="mt-1 text-lg font-semibold text-relume-ink" data-count="missing">{synthesis.missing.length}</dd></div>
          <div><dt className="text-relume-muted">Gates OPEN</dt><dd className="mt-1 text-lg font-semibold text-relume-ink" data-count="gates-open">{synthesis.gates.filter((item) => item.status === 'OPEN').length} of {synthesis.gates.length}</dd></div>
        </dl>
      </div>

      <div className="grid min-w-0 gap-6 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 space-y-6">
          <details open className="rounded-relume border border-relume-border p-3" data-site-missing-list>
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-relume-ink">Missing-evidence list ({synthesis.missing.length})</summary>
            {synthesis.missing.length === 0 ? <p className="mt-2 text-xs leading-5 text-relume-muted">Every topic has a qualified record. Professional gates below remain OPEN.</p> : (
              <div className="mt-2 space-y-4">
                {siteModules.map((module) => {
                  const items = synthesis.missing.filter((item) => item.module === module.id)
                  if (items.length === 0) return null
                  return <div key={module.id}>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">{module.label}</p>
                    <ul className="mt-2 space-y-2">
                      {items.map((item) => <li key={item.topicId} className="rounded-relume border border-dashed border-relume-border p-3" data-missing-topic={item.topicId}>
                        <p className="text-sm font-semibold text-relume-ink">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-relume-ink">{item.reason}</p>
                        {item.gates.length > 0 && <p className="mt-1 text-[11px] leading-4 text-relume-muted">Needs: {item.gates.join(', ')}</p>}
                        <details className="mt-1"><summary className="min-h-8 cursor-pointer text-[11px] font-semibold text-relume-command">Connector status</summary><p className="mt-1 text-[11px] leading-4 text-relume-muted">{item.pendingConnector}</p></details>
                      </li>)}
                    </ul>
                  </div>
                })}
              </div>
            )}
          </details>

          {synthesis.heldBack.length > 0 && (
            <div className="rounded-relume border border-relume-border p-3" data-site-held-back>
              <p className="text-sm font-semibold text-relume-ink">Held back from design ({synthesis.heldBack.length})</p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-relume-ink">
                {synthesis.heldBack.map((item) => <li key={item.record.id}><span className={`${chip} border-relume-border`}>{item.state}</span> {item.record.topic} — {item.heldBackReason}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <div className="rounded-relume border border-relume-border p-3" data-site-gates>
            <p className="text-sm font-semibold text-relume-ink">Professional gates</p>
            <ul className="mt-2 space-y-3">
              {synthesis.gates.map((item) => <li key={item.gate.id} className="border-l-2 border-relume-ink pl-3" data-gate={item.gate.id}>
                <p className="text-xs font-semibold text-relume-ink">{item.gate.label} <span className={`${chip} ml-1 border-relume-ink text-relume-ink`}>{item.status}</span></p>
                <p className="mt-1 text-[11px] leading-4 text-relume-muted">{item.gate.requirement}</p>
                <p className="mt-1 text-[11px] leading-4 text-relume-muted">Affects {item.topicLabels.length} topic{item.topicLabels.length === 1 ? '' : 's'}.</p>
              </li>)}
            </ul>
            <p className="mt-3 text-[11px] leading-4 text-relume-muted">This workspace cannot record a professional determination, so no gate can be cleared here.</p>
          </div>

          <div className="rounded-relume border border-relume-border p-3" data-site-review-handoff>
            <p className="text-sm font-semibold text-relume-ink">Review and hand off</p>
            <p className="mt-2 text-xs leading-5 text-relume-muted" data-review-status>
              {reviewCurrent ? `Reviewed by ${review?.reviewer} on ${review?.reviewedAt}. The review covers exactly the evidence shown now.` : review ? 'A review existed but the evidence has changed since; review again.' : 'Not reviewed.'}
            </p>
            <label htmlFor="site-reviewer" className="mt-3 block text-xs font-semibold text-relume-ink">Reviewer</label>
            <input id="site-reviewer" value={reviewer} onChange={(event) => { setReviewer(event.target.value); setReviewerError(false) }} autoComplete="off" aria-invalid={reviewerError || undefined} aria-describedby={reviewerError ? 'site-reviewer-error' : undefined} className="mt-2 min-h-11 w-full min-w-0 rounded-relume border border-relume-border bg-relume-surface px-3 text-sm text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" />
            {reviewerError && <p id="site-reviewer-error" className="mt-1 text-xs text-relume-danger">Enter who reviewed this synthesis.</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={submitReview} disabled={!hasParcel} className="min-h-11 rounded-full border border-relume-command px-4 text-xs font-semibold text-relume-command hover:bg-relume-surface-secondary disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" data-site-mark-reviewed>Mark synthesis reviewed</button>
              <button type="button" onClick={onSend} disabled={!canSend} className="min-h-11 rounded-full bg-relume-ink px-4 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" data-site-send-handoff>Send qualified context to DesignStudio &amp; SUTRA</button>
            </div>
            {sendBlock && <p className="mt-2 text-[11px] leading-4 text-relume-muted" data-send-blocked>{sendBlock}</p>}
            {saveError && <p role="alert" className="mt-2 text-xs text-relume-danger">{saveError}</p>}

            <div className="mt-4 border-t border-relume-border pt-3" data-handoff-status={handoffState.state}>
              <p className="text-xs font-semibold text-relume-ink">Handoff status: <span className={`${chip} ${handoffState.state === 'STALE' ? 'border-relume-danger text-relume-danger' : 'border-relume-ink text-relume-ink'}`}>{handoffState.state}</span></p>
              {handoffState.state === 'NONE' && <p className="mt-1 text-[11px] leading-4 text-relume-muted">Nothing has been sent. DesignStudio and SUTRA see no site-analysis context.</p>}
              {handoffState.state === 'CURRENT' && handoff && <p className="mt-1 text-[11px] leading-4 text-relume-muted">Sent {handoff.sentAt}: {handoff.qualified.length} qualified record{handoff.qualified.length === 1 ? '' : 's'}, {handoff.missing.length} gap{handoff.missing.length === 1 ? '' : 's'} and {handoff.gates.length} OPEN gates for {handoff.parcelLabel}.</p>}
              {handoffState.state === 'STALE' && <p className="mt-1 text-[11px] leading-4 text-relume-danger" role="status">{handoffState.reason} Downstream consumers show it as STALE until it is reviewed and sent again.</p>}
              {handoff && <button type="button" onClick={onWithdraw} className="mt-2 min-h-11 rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-command hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" data-site-withdraw-handoff>Withdraw handoff</button>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
