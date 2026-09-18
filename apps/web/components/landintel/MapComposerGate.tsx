import { mapComposerRequirements } from '../../lib/landintel/mapComposerRequirements'

export default function MapComposerGate() {
  return (
    <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="map-composer-heading" data-map-composer-gate>
      <div className="rounded-relume border border-relume-border bg-relume-surface p-4 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · governed Map Composer</p><span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Roadmap</span></div>
            <h2 id="map-composer-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-command sm:text-3xl">A map export must pass evidence and cartography checks</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">This is a reproducible quality gate, not an AI “make professional” control. Titles, legends, coordinates, scale and annotations must come from the project model and active evidence layers.</p>
          </div>
          <div className="rounded-relume border border-relume-ink bg-relume-ink px-4 py-3 text-white" aria-label="Map export status"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">Export status</p><p className="mt-1 text-sm font-semibold">BLOCKED · 0 / {mapComposerRequirements.length} checks passed</p></div>
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Map Composer quality checks">
          {mapComposerRequirements.map((item, index) => <li key={item.id} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4" data-map-composer-requirement={item.id}>
            <div className="flex items-start justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Check {String(index + 1).padStart(2, '0')}</span><span className="rounded-full border border-relume-border bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-relume-muted">Required</span></div>
            <h3 className="mt-3 text-sm font-semibold text-relume-command">{item.title}</h3>
            <p className="mt-2 text-xs leading-5 text-relume-muted">{item.requirement}</p>
          </li>)}
        </ol>
        <p className="mt-5 border-t border-relume-border pt-4 text-xs leading-5 text-relume-muted"><strong className="text-relume-command">INDICATIVE — NOT GIS EVIDENCE OR AN APPROVAL DELIVERABLE.</strong> The Map Composer is visible as a governed roadmap specification; export generation and quality-gate execution are not built yet.</p>
      </div>
    </section>
  )
}
