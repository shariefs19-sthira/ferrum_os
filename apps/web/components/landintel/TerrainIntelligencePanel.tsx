import {
  terrainCapabilities,
  terrainEvidenceStates,
  terrainMetadataFields,
  terrainNonClaims,
  terrainProcessingStages,
} from '../../lib/landintel/terrainIntelligence'

export default function TerrainIntelligencePanel() {
  return (
    <section
      className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="terrain-intelligence-heading"
      data-terrain-intelligence-panel
    >
      <div className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface">
        <div className="grid gap-5 border-b border-relume-border p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.45fr)] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · governed terrain intelligence</p>
              <span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Roadmap</span>
            </div>
            <h2 id="terrain-intelligence-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-command sm:text-3xl">
              Terrain decisions must retain their survey evidence
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">
              LandIntel will connect point clouds and terrain models to project boundaries, design levels and traceable decisions. Visual relief alone is not a result: source, reference system, accuracy, resolution and gaps must remain visible.
            </p>
          </div>
          <div className="rounded-relume border border-relume-ink bg-relume-ink p-4 text-white" aria-label="Terrain dataset status">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">Dataset status</p>
            <p className="mt-2 text-lg font-semibold">NO TERRAIN SOURCE CONNECTED</p>
            <p className="mt-2 text-xs leading-5 text-white/70">No terrain surface, anomaly, level, volume or suitability conclusion is asserted.</p>
          </div>
        </div>

        <div className="grid min-w-0 gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,0.34fr)]">
          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex flex-wrap gap-2" aria-label="Terrain evidence states">
              {terrainEvidenceStates.map((state) => (
                <span key={state} className="rounded-full border border-relume-border bg-relume-surface-secondary px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-relume-command">{state}</span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2" aria-label="Terrain intelligence capabilities">
              {terrainCapabilities.map((capability, index) => (
                <article key={capability.id} className="min-w-0 rounded-relume border border-relume-border bg-relume-surface-secondary p-4" data-terrain-capability={capability.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Analysis {String(index + 1).padStart(2, '0')}</p>
                    <span className="rounded-full border border-relume-border bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-relume-muted">Roadmap</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-relume-command">{capability.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-relume-ink">{capability.decision}</p>
                  <p className="mt-3 border-t border-relume-border pt-3 text-[10px] leading-4 text-relume-muted"><strong className="text-relume-command">Evidence required:</strong> {capability.evidence}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="min-w-0 border-t border-relume-border bg-relume-surface-secondary p-4 sm:p-6 xl:border-l xl:border-t-0" aria-label="Terrain evidence record">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Evidence record</p>
            <dl className="mt-4 space-y-2">
              {terrainMetadataFields.map((field) => (
                <div key={field.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-relume-border pb-2 text-[11px] leading-4">
                  <div className="min-w-0"><dt className="font-semibold text-relume-command">{field.label}</dt><dd className="break-words text-relume-muted">{field.value}</dd></div>
                  <dd className="self-start whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.08em] text-relume-muted">{field.status}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="grid gap-5 border-t border-relume-border p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.45fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Governed processing path</p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Terrain processing stages">
              {terrainProcessingStages.map((stage, index) => (
                <li key={stage} className="min-w-0 rounded-relume border border-relume-border px-3 py-3 text-xs leading-5 text-relume-command">
                  <span className="mr-2 font-semibold text-relume-muted">{String(index + 1).padStart(2, '0')}</span>{stage}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LiDAR does not establish</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-relume-ink">
              {terrainNonClaims.map((item) => <li key={item} className="border-l-2 border-relume-command pl-3">{item}</li>)}
            </ul>
          </div>
        </div>

        <p className="border-t border-relume-border px-4 py-4 text-xs leading-5 text-relume-muted sm:px-6">
          <strong className="text-relume-command">INDICATIVE UNTIL VALIDATED AGAINST A PROJECT SURVEY.</strong> The module specification is visible; ingestion, terrain processing, 3D visualization and engineering calculations are not yet connected.
        </p>
      </div>
    </section>
  )
}

