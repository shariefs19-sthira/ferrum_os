import SectionShell from './SectionShell'
import Eyebrow from './Eyebrow'
import SectionHeading from './SectionHeading'
import { governedAiQuestions, governedOrchestrationStages } from '../../lib/governedOrchestration'

export default function GovernedOrchestrationChain() {
  return (
    <SectionShell>
      <section aria-label="Governed orchestration" data-governed-orchestration>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.34fr)] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>Governed orchestration</Eyebrow>
              <span className="rounded-full border border-relume-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-command">Roadmap contract</span>
            </div>
            <SectionHeading className="mt-4">One revision. Every consequence traced to closure.</SectionHeading>
            <p className="mt-5 max-w-4xl text-base leading-7 text-relume-ink">Ferrum’s platform promise is a governed chain of project decisions. Common screens alone do not establish coordination; shared evidence, accountable state transitions and controlled approval do.</p>
          </div>
          <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Current status</p>
            <p className="mt-2 text-sm font-semibold text-relume-command">Specification visible · end-to-end execution not built</p>
          </div>
        </div>

        <ol className="mt-8 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Governed cross-functional chain">
          {governedOrchestrationStages.map((stage, index) => (
            <li key={stage.id} className="min-w-0 rounded-relume border border-relume-border bg-relume-surface-secondary p-4" data-orchestration-stage={stage.id}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Step {String(index + 1).padStart(2, '0')}</span>
                <span className="max-w-[65%] text-right text-[10px] font-semibold text-relume-command">{stage.product}</span>
              </div>
              <h3 className="mt-3 text-base font-semibold tracking-relume-tight text-relume-command">{stage.title}</h3>
              <p className="mt-2 text-xs leading-5 text-relume-ink">{stage.stateChange}</p>
              <p className="mt-3 border-t border-relume-border pt-3 text-[10px] leading-4 text-relume-muted"><strong className="text-relume-command">Required evidence:</strong> {stage.evidence}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-5 rounded-relume border border-relume-command bg-relume-command p-5 text-white lg:grid-cols-[minmax(14rem,0.32fr)_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-accent">AI accountability record</p>
            <p className="mt-3 text-lg font-semibold">Every recommendation must answer six questions.</p>
          </div>
          <ul className="grid min-w-0 gap-2 sm:grid-cols-2" aria-label="AI accountability questions">
            {governedAiQuestions.map((question) => <li key={question} className="min-w-0 rounded-relume border border-white/20 bg-white/5 px-3 py-2 text-xs leading-5">{question}</li>)}
          </ul>
        </div>
      </section>
    </SectionShell>
  )
}
