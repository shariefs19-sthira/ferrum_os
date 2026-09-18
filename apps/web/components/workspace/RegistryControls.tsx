"use client"

import { useState } from 'react'
import type { StudioParameters } from '../../lib/types'
import { productControlRegistry, resolveControlValue, type ProductControlId } from '../../lib/workspace/controlRegistry'
import type { SiteConstraintsEvidence } from '../../lib/parcelIntel/siteConstraints'
import PrecisionControl from '../controls/PrecisionControl'

type Props = {
  product: ProductControlId
  parameters: StudioParameters
  context: { maxFloors: number; minSetbackM: number; maxSetbackM: number }
  onChange: (param: keyof StudioParameters, value: number) => void
  authorityEvidence?: SiteConstraintsEvidence
}

function ProductControls({ product, parameters, context, onChange, onModified }: Props & { onModified?: () => void }) {
  return <>{productControlRegistry[product].map((control) => {
    const value = parameters[control.param]
    const min = resolveControlValue(control.min, context, 0)
    const max = resolveControlValue(control.max, context, 100)
    const commit = (next: number) => { onModified?.(); onChange(control.param, next) }
    return <div key={control.id} data-control-id={control.id}>
      {control.type === 'slider' && <PrecisionControl id={control.id} label={product === 'landintel' ? 'Open space and setback' : control.label} value={value} min={min} max={max} step={control.step ?? 1} unit={control.param === 'setbackM' ? 'length' : 'count'} detents={[min, max]} onChange={commit} />}
      {control.type === 'chip' && <><p className="text-xs font-semibold">{control.label}</p><div id={control.id} className="mt-2 flex gap-2">{control.options?.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => commit(option.value)} className={`min-h-11 rounded-full px-3 text-xs font-semibold ${value === option.value ? 'bg-relume-command text-white' : 'border border-relume-border'}`}>{option.label}</button>)}</div></>}
      {control.type === 'toggle' && <button id={control.id} type="button" aria-pressed={value === control.onValue} onClick={() => commit(value === control.onValue ? (control.offValue ?? 0) : (control.onValue ?? 1))} className="mt-2 min-h-11 rounded-full border border-relume-border px-4">{value === control.onValue ? 'On' : 'Off'}</button>}
      <p className="mt-1 text-[10px] leading-4 text-relume-muted">{control.help}</p>
    </div>
  })}</>
}

export default function RegistryControls(props: Props) {
  const [open, setOpen] = useState(false)
  const [modified, setModified] = useState(false)

  // CODEX-SENTINEL-20260918-1708-sutra-command-cockpit-output: this used to
  // sit at `left-3`, directly underneath the left tool rail (ToolsRuler,
  // rendered by project-workspace/cockpit/page.tsx as `absolute bottom-2
  // left-2 top-2 z-30 w-20`) -- a literal, persistent overlap, not just a
  // z-index fight. Moved to the right edge of the canvas, which has no
  // other persistent overlay, to remove that collision.
  if (props.product !== 'landintel') {
    return <aside className="absolute bottom-14 right-3 z-20 w-[min(22rem,calc(100%-1.5rem))] rounded-relume border border-relume-border bg-white p-3" aria-label={`${props.product} controls`} data-control-registry={props.product}>
      <ProductControls {...props} />
    </aside>
  }

  const evidence = props.authorityEvidence
  const selected = open || modified
  // bottom-14, not bottom-3: Space3D's own canvas status bar
  // (data-canvas-status-bar, "INDICATIVE · rendering profile · context ·
  // OSM attribution...") is a full-width `absolute bottom-3 left-3
  // right-3` strip -- sitting at bottom-3 here put the Site Constraints
  // toggle directly on top of it (z-30 over z-10), visually truncating
  // that attribution text. Clears it with room to spare.
  return <div className="absolute bottom-14 right-3 z-30 max-w-[calc(100%-1.5rem)]" data-control-registry={props.product} data-site-constraints-state={open ? 'open' : modified ? 'modified' : 'closed'}>
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      aria-expanded={open}
      aria-controls="site-constraints-panel"
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${selected ? 'border-relume-ink bg-relume-ink text-white' : 'border-relume-border bg-white text-relume-ink'}`}
      data-site-constraints-toggle
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" /></svg>
      Site Constraints{modified && !open ? ' · modified' : ''}
    </button>

    {open && <aside id="site-constraints-panel" aria-label="Site Constraints" className="mt-2 max-h-[min(70dvh,34rem)] w-[min(24rem,calc(100vw-1.5rem))] overflow-y-auto rounded-relume border border-relume-border bg-white p-4" data-site-constraints-panel>
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-semibold text-relume-command">Site Constraints</p><p className="mt-1 text-xs text-relume-muted">{evidence?.locationLabel ?? 'Location evidence unavailable'}</p></div>
        <span className="rounded-full border border-relume-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">{evidence?.status ?? 'GAP'}</span>
      </div>
      <div className="mt-4"><ProductControls {...props} onModified={() => setModified(true)} /></div>
      <section className="mt-5 border-t border-relume-border pt-4" aria-labelledby="authority-guidance-heading">
        <h3 id="authority-guidance-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-command">Authority guidance</h3>
        <dl className="mt-3 grid gap-2 text-xs">
          <div className="flex justify-between gap-3"><dt className="text-relume-muted">Planning authority</dt><dd>{evidence?.planningAuthority ?? 'GAP'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-relume-muted">Governing document</dt><dd>{evidence?.governingDocument ?? 'GAP'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-relume-muted">Version / effective date</dt><dd>{evidence?.documentVersion && evidence.effectiveDate ? `${evidence.documentVersion} · ${evidence.effectiveDate}` : 'GAP'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-relume-muted">Applicable clause</dt><dd>{evidence?.clause ?? 'GAP'}</dd></div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-relume-muted">{evidence?.applicability ?? 'No authority evidence is loaded.'}</p>
        {(evidence?.sources.length ?? 0) > 0 && <div className="mt-3 space-y-2"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Official source candidates</p>{evidence?.sources.map((source) => <a key={source.officialUrl} href={source.officialUrl} target="_blank" rel="noreferrer" className="block rounded-relume border border-relume-border p-3 text-xs font-medium text-relume-command underline underline-offset-4">{source.label}<span className="mt-1 block font-normal no-underline text-relume-muted">Applicability: GAP · checked {source.lastChecked}</span></a>)}</div>}
        <p className="mt-3 text-[10px] leading-4 text-relume-muted">No regulatory value is applied until authority, document version, effective date, clause and parcel applicability are verified.</p>
      </section>
    </aside>}
  </div>
}
