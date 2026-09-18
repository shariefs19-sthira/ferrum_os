import {
  machineReleaseChecks,
  modelInspectionCapabilities,
  modelIntakeFields,
  modelReleaseStates,
  supportedModelFormatIntent,
} from '../../lib/modelIntake'

export default function ModelIntakePanel() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="model-intake-heading" data-model-intake-panel>
      <div className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface">
        <div className="grid gap-5 border-b border-relume-border p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">DesignStudio + Ferrum Projects · preview on ingestion</p>
              <span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Roadmap contract</span>
            </div>
            <h2 id="model-intake-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-command sm:text-3xl">A rendered model is inspected, not automatically validated</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">Every ingested technical model must produce a browser preview and a machine-readable intake report. A successful render cannot conceal incorrect units, displaced origins, obsolete revisions, unsupported entities or unresolved geometry warnings.</p>
          </div>
          <div className="rounded-relume border border-relume-ink bg-relume-ink p-4 text-white" aria-label="Current model intake status">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">Current intake status</p>
            <p className="mt-2 text-lg font-semibold">NO MODEL INGESTED</p>
            <p className="mt-2 text-xs leading-5 text-white/70">No file has been parsed, previewed, validated or approved for machine use.</p>
          </div>
        </div>

        <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,0.38fr)]">
          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2" aria-label="Model format intent">
              {supportedModelFormatIntent.map((item) => (
                <span key={item.format} title={item.note} className="rounded-full border border-relume-border bg-relume-surface-secondary px-3 py-1.5 text-[10px] font-semibold text-relume-command">{item.format} · {item.state}</span>
              ))}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2" aria-label="Model inspection capabilities">
              {modelInspectionCapabilities.map((capability, index) => (
                <article key={capability.id} className="min-w-0 rounded-relume border border-relume-border bg-relume-surface-secondary p-4" data-model-inspection-capability={capability.id}>
                  <div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Inspection {String(index + 1).padStart(2, '0')}</p><span className="rounded-full border border-relume-border bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-relume-muted">Roadmap</span></div>
                  <h3 className="mt-3 text-sm font-semibold text-relume-command">{capability.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-relume-ink">{capability.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="min-w-0 border-t border-relume-border bg-relume-surface-secondary p-4 sm:p-6 xl:border-l xl:border-t-0" aria-label="Required model intake report">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Required intake report</p>
            <p className="mt-2 text-sm font-semibold text-relume-command">0 / {modelIntakeFields.length} fields populated</p>
            <dl className="mt-4 space-y-2">
              {modelIntakeFields.map((field) => (
                <div key={field.id} className="min-w-0 border-b border-relume-border pb-2" data-model-intake-field={field.id}>
                  <div className="flex items-start justify-between gap-3"><dt className="text-[11px] font-semibold text-relume-command">{field.label}</dt><dd className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.08em] text-relume-muted">UNKNOWN</dd></div>
                  <dd className="mt-1 text-[10px] leading-4 text-relume-muted">{field.requirement}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="border-t border-relume-border p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Controlled release states</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3" aria-label="Model release states">
            {modelReleaseStates.map((item, index) => (
              <article key={item.state} className="rounded-relume border border-relume-border p-4" data-model-release-state={item.state}>
                <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-relume-command text-[10px] font-semibold text-white">{index + 1}</span><h3 className="text-sm font-semibold text-relume-command">{item.state}</h3></div>
                <p className="mt-3 text-xs leading-5 text-relume-ink">{item.meaning}</p>
                <p className="mt-3 border-t border-relume-border pt-3 text-[10px] leading-4 text-relume-muted">{item.gate}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-5 border-t border-relume-border bg-relume-surface-secondary p-4 sm:p-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-start">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Machine release gate</p><p className="mt-2 text-lg font-semibold text-relume-command">BLOCKED · 0 / {machineReleaseChecks.length} checks passed</p></div>
          <ul className="grid gap-2 sm:grid-cols-2" aria-label="Machine release checks">
            {machineReleaseChecks.map((check) => <li key={check} className="rounded-relume border border-relume-border bg-white px-3 py-3 text-xs leading-5 text-relume-ink">{check}</li>)}
          </ul>
        </div>

        <p className="border-t border-relume-border px-4 py-4 text-xs leading-5 text-relume-muted sm:px-6"><strong className="text-relume-command">PREVIEW DOES NOT MEAN VALIDATED OR APPROVED FOR MACHINE.</strong> XML/LandXML and DXF ingestion, model parsing, comparison, measurement and release execution are roadmap work; this visible contract makes the required controls explicit without implying they already run.</p>
      </div>
    </section>
  )
}

