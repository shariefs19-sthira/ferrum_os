"use client"

import { useMemo, useState } from 'react'
import {
  advanceStep, attachPlan, beginProgress, createIntentFromBrief, grantApproval,
  requestApprovals, resolveNeedsYou, startRun,
  type OrchestrationRunState, type OrchestrationStage,
} from '../../lib/sutra/orchestrationStateMachine'

const stages: Array<{ key: OrchestrationStage; label: string }> = [
  { key: 'INTENT', label: 'Intent' }, { key: 'PLAN', label: 'Plan' }, { key: 'PROGRESS', label: 'Progress' },
  { key: 'NEEDS_YOU', label: 'Needs you' }, { key: 'EVIDENCE', label: 'Evidence' },
  { key: 'APPROVALS', label: 'Approvals' }, { key: 'RELEASED', label: 'Released' },
]

function newRun(): OrchestrationRunState {
  return startRun(createIntentFromBrief('local-sutra-review', {
    tenantId: 'local-workspace', projectId: 'current-workspace',
    requestedBy: { actorId: 'current-operator', actorKind: 'HUMAN' },
    goal: 'Bounded review of operator-supplied project evidence.',
  }, new Date().toISOString()))
}

const noStopContext = {
  hasUnknownInputs: false, hasConflictingSources: false, jurisdiction: null, jurisdictionSupported: true,
  withinValidityEnvelope: true, isSafetyCritical: false, isIssueOrReleaseAction: false, involvesExternalAgentProposal: false,
}

export default function SutraWorkflowStatus() {
  const [run, setRun] = useState<OrchestrationRunState>(newRun)
  const [stopped, setStopped] = useState(false)
  const [message, setMessage] = useState('No workflow has started. SUTRA has no external retrieval or release authority.')
  const current = useMemo(() => stages.find((stage) => stage.key === run.stage) ?? stages[0], [run.stage])
  const apply = (result: ReturnType<typeof attachPlan>) => {
    if (result.ok) { setRun(result.state); setMessage(`Workflow is at ${result.state.stage.replace('_', ' ')}.`) }
    else setMessage(result.reasons.join(' '))
  }
  const prepare = () => apply(attachPlan(run, [
    { stepId: 'inspect-inputs', description: 'Inspect operator-supplied inputs without asserting a fact.', assertsFact: false, stopContext: noStopContext },
    { stepId: 'evidence-review', description: 'Review cited evidence before any factual conclusion.', assertsFact: true, stopContext: { ...noStopContext, hasUnknownInputs: true } },
  ], {
    requestId: 'local-sutra-review', tenantId: 'local-workspace', projectId: 'current-workspace', actorId: 'current-operator',
    provider: 'FERRUM_NATIVE', providerModel: 'local-boundary', providerVersion: 'not-live', accessMode: 'READ_ONLY',
    requestedContextIds: [], disclosedContextIds: [], dataRetention: 'FERRUM_MANAGED', trainingConsent: 'DENIED', projectMutationConfirmationId: null,
  }))
  const begin = () => apply(beginProgress(run))
  const advance = () => apply(advanceStep(run))
  const resolve = () => apply(resolveNeedsYou(run, { actorId: 'current-operator', actorKind: 'HUMAN' }, 'Human review acknowledged the UNKNOWN evidence requirement.'))
  const approvals = () => apply(requestApprovals(run))
  const approve = () => apply(grantApproval(run, { actorId: 'current-operator', actorKind: 'HUMAN' }, 'Human approval recorded.'))
  const controls = stopped ? <button type="button" onClick={() => { setRun(newRun()); setStopped(false); setMessage('Workflow reset locally. No project state changed.') }} className="min-h-11 rounded-full border border-white/30 px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">Start new review</button>
    : run.stage === 'INTENT' ? <button type="button" onClick={prepare} className="min-h-11 rounded-full border border-white/30 px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">Prepare bounded review</button>
    : run.stage === 'PLAN' ? <button type="button" onClick={begin} className="min-h-11 rounded-full border border-white/30 px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">Begin review</button>
    : run.stage === 'PROGRESS' ? <button type="button" onClick={advance} className="min-h-11 rounded-full border border-white/30 px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">Advance review</button>
    : run.stage === 'NEEDS_YOU' ? <button type="button" onClick={resolve} className="min-h-11 rounded-full border border-relume-accent px-3 text-xs font-semibold text-relume-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">Record human response</button>
    : run.stage === 'EVIDENCE' ? <button type="button" onClick={approvals} className="min-h-11 rounded-full border border-white/30 px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">Request approval</button>
    : run.stage === 'APPROVALS' ? <button type="button" onClick={approve} className="min-h-11 rounded-full border border-relume-accent px-3 text-xs font-semibold text-relume-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">Human approve release</button> : null
  return <section className="border-b border-white/15 p-4" aria-labelledby="sutra-workflow-heading" data-sutra-workflow-status>
    <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 id="sutra-workflow-heading" className="font-heading text-sm font-semibold">Controlled workflow</h2><p className="mt-1 text-xs text-white/65">{current.label} · no autonomous release</p></div><span className="rounded-full border border-white/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-[.14em]">{stopped ? 'Stopped' : current.label}</span></div>
    <ol className="mt-3 flex flex-wrap gap-1.5" aria-label="Workflow states">{stages.map((stage) => <li key={stage.key} className={`max-w-full rounded-full border px-2 py-1 text-[10px] font-semibold ${stage.key === run.stage && !stopped ? 'border-relume-accent text-relume-accent' : 'border-white/20 text-white/60'}`}>{stage.label}</li>)}</ol>
    <div className="mt-3 space-y-2 rounded-relume border border-white/15 bg-white/5 p-3 text-xs"><p><span className="font-semibold">Intent:</span> {run.intent.goal}</p><p><span className="font-semibold">Evidence:</span> {run.evidence.length ? `${run.evidence.length} cited item(s) recorded.` : 'UNKNOWN — no source citation has been recorded.'}</p>{run.pendingNeedsYou.length > 0 && <p className="text-relume-accent"><span className="font-semibold">Needs you:</span> {run.pendingNeedsYou.map((trigger) => trigger.reason).join(', ')}. Human response is required.</p>}<p><span className="font-semibold">External sensitive access:</span> NOT LIVE. Server-only retrieval remains fail-closed without authoritative consent.</p><p><span className="font-semibold">Source citations:</span> {run.evidence.length ? run.evidence.map((item) => item.citations.map((citation) => citation.title).join(', ')).join('; ') : 'None.'}</p></div>
    <p className="mt-2 text-[11px] text-white/65" role="status" aria-atomic="true">{message}</p><div className="mt-3 flex flex-wrap gap-2">{controls}{!stopped && run.stage !== 'RELEASED' && <button type="button" onClick={() => { setStopped(true); setMessage('Stopped by human. No project state, source, or release changed.') }} className="min-h-11 rounded-full border border-white/30 px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">Stop workflow</button>}</div>
  </section>
}
