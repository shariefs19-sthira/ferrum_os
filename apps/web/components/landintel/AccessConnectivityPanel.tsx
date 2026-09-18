import {
  accessCapabilities,
  accessEvidenceStates,
  accessMetadataFields,
  accessNonClaims,
} from '../../lib/landintel/accessConnectivity'

export default function AccessConnectivityPanel() {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="access-connectivity-heading"
      data-access-connectivity-panel
    >
      <div className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface">
        <div className="grid gap-5 border-b border-relume-border p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.45fr)] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · access &amp; connectivity</p>
              <span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Roadmap</span>
            </div>
            <h2 id="access-connectivity-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-command sm:text-3xl">
              Access must be legal, not just adjacent
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">
              Road frontage, right of way, transit proximity and utility connectivity each need their own verified source. Map-visible adjacency to a road is never treated as proof of lawful access.
            </p>
          </div>
          <div className="rounded-relume border border-relume-ink bg-relume-ink p-4 text-white" aria-label="Access dataset status">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">Dataset status</p>
            <p className="mt-2 text-lg font-semibold">NO ACCESS SOURCE CONNECTED</p>
            <p className="mt-2 text-xs leading-5 text-white/70">No frontage, right-of-way, transit or utility conclusion is asserted.</p>
          </div>
        </div>

        <div className="grid min-w-0 gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,0.34fr)]">
          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex flex-wrap gap-2" aria-label="Access evidence states">
              {accessEvidenceStates.map((state) => (
                <span key={state} className="rounded-full border border-relume-border bg-relume-surface-secondary px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-relume-command">{state}</span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2" aria-label="Access connectivity capabilities">
              {accessCapabilities.map((capability, index) => (
                <article key={capability.id} className="min-w-0 rounded-relume border border-relume-border bg-relume-surface-secondary p-4" data-access-capability={capability.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Check {String(index + 1).padStart(2, '0')}</p>
                    <span className="rounded-full border border-relume-border bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-relume-muted">Roadmap</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-relume-command">{capability.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-relume-ink">{capability.decision}</p>
                  <p className="mt-3 border-t border-relume-border pt-3 text-[10px] leading-4 text-relume-muted"><strong className="text-relume-command">Evidence required:</strong> {capability.evidence}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="min-w-0 border-t border-relume-border bg-relume-surface-secondary p-4 sm:p-6 xl:border-l xl:border-t-0" aria-label="Access evidence record">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Evidence record</p>
            <dl className="mt-4 space-y-2">
              {accessMetadataFields.map((field) => (
                <div key={field.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-relume-border pb-2 text-[11px] leading-4">
                  <div className="min-w-0"><dt className="font-semibold text-relume-command">{field.label}</dt><dd className="break-words text-relume-muted">{field.value}</dd></div>
                  <dd className="self-start whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.08em] text-relume-muted">{field.status}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="grid gap-5 border-t border-relume-border p-4 sm:p-6">
          <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Access does not establish</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-relume-ink">
              {accessNonClaims.map((item) => <li key={item} className="border-l-2 border-relume-command pl-3">{item}</li>)}
            </ul>
          </div>
        </div>

        <p className="border-t border-relume-border px-4 py-4 text-xs leading-5 text-relume-muted sm:px-6">
          <strong className="text-relume-command">INDICATIVE UNTIL VERIFIED AGAINST A RECORDED RIGHT OF WAY.</strong> No travel-time, transit-proximity or utility-availability figure is generated by this module today.
        </p>
      </div>
    </section>
  )
}
