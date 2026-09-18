"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ParcelContext } from '../../lib/workspace/parcelContext'
import { buildingShellCatalog, recommendBuildingShells, type BuildingShell } from '../../lib/designstudio/shellCatalog'
import {
  TIME_TO_FIRST_COORDINATED_OPTION_TARGET,
  evaluateTemplateForProject,
  getBuildingTemplateByShellId,
  type ProjectTemplateInputs,
} from '../../lib/designstudio/buildingLibraryKernel'
import { capabilitiesForProduct } from '../../lib/capabilities/openSourceRegistry'

type Props = {
  parcel: ParcelContext | null
  selectedShell: BuildingShell
  projectInputs: ProjectTemplateInputs
  onSelect: (shell: BuildingShell) => void
}

const compactChecksum = (checksum: string) => `${checksum.slice(0, 14)}…${checksum.slice(-6)}`

export default function ShellCatalogPanel({ parcel, selectedShell, projectInputs, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState(false)
  const recommendations = useMemo(() => recommendBuildingShells(parcel, 4), [parcel])
  const primary = recommendations[0]
  const items = expanded ? buildingShellCatalog : recommendations.map((item) => item.shell)
  const template = useMemo(() => getBuildingTemplateByShellId(selectedShell.id), [selectedShell.id])
  const evaluation = useMemo(() => evaluateTemplateForProject(template, projectInputs, new Date().toISOString().slice(0, 10)), [projectInputs, template])
  const designEngines = useMemo(() => capabilitiesForProduct('DesignStudio').filter((entry) => ['three', 'web-ifc', 'ifcopenshell', 'maplibre', 'blender-cycles'].includes(entry.id)), [])
  const activeEngines = designEngines.filter((engine) => engine.maturity === 'ACTIVE DEPENDENCY').length

  useEffect(() => setOpen(window.matchMedia('(min-width: 768px)').matches), [])

  return (
    <aside className="absolute left-3 top-40 z-30 w-[min(25rem,calc(100%-1.5rem))] overflow-hidden rounded-relume border border-relume-border bg-white/95 shadow-xl backdrop-blur-sm md:bottom-14 md:top-auto" aria-label="Building shell catalogue" data-shell-catalog>
      <div className={`${open ? 'border-b' : ''} border-relume-border p-3`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">SUTRA · locality fit</p>
            <p className="mt-1 text-sm font-semibold text-relume-command">{parcel ? `${parcel.district}, ${parcel.state}` : 'Parcel context required'}</p>
          </div>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="min-h-11 rounded-full border border-relume-border bg-white px-3 text-[10px] font-semibold text-relume-command">{open ? 'Hide library' : 'Change shell'}</button>
        </div>
        <span className="mt-1 inline-flex rounded-full border border-relume-border bg-relume-surface-secondary px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-relume-command">INDICATIVE · {selectedShell.name}</span>
        {open && <>
        <p className="mt-2 text-xs leading-5 text-relume-ink" data-sutra-shell-reason>
          {parcel
            ? `${primary?.shell.name ?? selectedShell.name} ranks highest from the recorded region, ${Math.round(parcel.area_sqm)} m² plot area and ${parcel.land_use} use.`
            : 'Lock a LandIntel parcel or enter plot data before relying on locality recommendations. A neutral comparative shell is shown.'}
        </p>
        <p className="mt-1 text-[10px] leading-4 text-relume-muted">Planning controls, orientation, access, terrain and adjoining conditions remain subject to project evidence.</p>
        <div className="mt-3 rounded-relume border border-relume-border bg-relume-surface-secondary p-3" data-template-identity>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
            <strong className="font-mono text-relume-ink">{template.templateId}</strong>
            <span className="text-relume-muted">v{template.version}</span>
            <span className="font-semibold text-relume-ink">{template.releaseState}</span>
          </div>
          <p className="mt-1 font-mono text-[9px] text-relume-muted" aria-label={`Template checksum ${template.identityChecksum}`}>{compactChecksum(template.identityChecksum)}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className="text-relume-muted">Geometry</dt><dd className="mt-0.5 font-semibold">{template.semanticGeometry.geometryStatus}</dd></div>
            <div><dt className="text-relume-muted">Structure</dt><dd className="mt-0.5 font-semibold">{template.structuralSystem.state}</dd></div>
            <div><dt className="text-relume-muted">Analysis</dt><dd className="mt-0.5 font-semibold">{template.analysisEnvelope.state}</dd></div>
            <div><dt className="text-relume-muted">BOQ</dt><dd className="mt-0.5 font-semibold">{template.boqBaseline.state}</dd></div>
          </dl>
        </div>
        <p className="mt-2 text-[10px] leading-4 text-relume-muted" data-option-time-target>
          Target {TIME_TO_FIRST_COORDINATED_OPTION_TARGET.minimumMinutes}–{TIME_TO_FIRST_COORDINATED_OPTION_TARGET.maximumMinutes} min to first coordinated option. This is not a finished, approved or construction-ready building.
        </p>
        </>}
      </div>

      {open && <><div className="max-h-56 space-y-2 overflow-y-auto p-2" data-shell-options>
        {items.map((shell) => {
          const recommendation = recommendations.find((item) => item.shell.id === shell.id)
          const selected = shell.id === selectedShell.id
          return (
            <button key={shell.id} type="button" onClick={() => onSelect(shell)} aria-pressed={selected} className={`min-h-11 w-full rounded-lg border p-3 text-left transition ${selected ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border bg-white text-relume-command hover:bg-relume-surface-secondary'}`} data-shell-id={shell.id}>
              <span className="flex items-center justify-between gap-3"><strong className="text-xs">{shell.name}</strong><span className={`text-[9px] font-semibold uppercase tracking-[0.1em] ${selected ? 'text-relume-accent' : 'text-relume-muted'}`}>{shell.geometry.roof} roof</span></span>
              <span className={`mt-1 block text-[10px] leading-4 ${selected ? 'text-white/75' : 'text-relume-muted'}`}>{recommendation?.reasons[0] ?? shell.region} · original typology study</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-relume-border px-3 py-2">
        <button type="button" onClick={() => setExpanded((value) => !value)} className="min-h-11 text-xs font-semibold text-relume-command" aria-expanded={expanded}>{expanded ? 'Show recommendations' : `Browse all ${buildingShellCatalog.length} shells`}</button>
        <span className="text-right text-[9px] uppercase tracking-[0.1em] text-relume-muted">Three.js active<br />Cycles worker next</span>
      </div>
      <details className="border-t border-relume-border px-3 text-[10px] text-relume-muted" data-template-evidence>
        <summary className="min-h-11 cursor-pointer py-3 font-semibold text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Evidence and reuse limits</summary>
        <div className="space-y-3 pb-3">
          <section aria-labelledby="template-provenance-heading">
            <h3 id="template-provenance-heading" className="font-semibold text-relume-ink">Provenance and licence</h3>
            <p className="mt-1 leading-4">Original template by {template.provenance.authoringOrganisation}; reviewed {template.provenance.reviewedAt}.</p>
            <p className="mt-1 leading-4">{template.provenance.copyrightBoundary}</p>
            <p className="mt-1 leading-4"><strong>{template.provenance.licence.licenceId}</strong> · {template.provenance.licence.rightsBasis}</p>
          </section>
          <section aria-labelledby="template-applicability-heading">
            <h3 id="template-applicability-heading" className="font-semibold text-relume-ink">Applicability and parameter envelope</h3>
            <p className="mt-1 leading-4">{template.buildingTypes.join(', ')} · {template.climateApplicability.join(', ')} · {template.jurisdictionApplicability.join(', ')}</p>
            <dl className="mt-2 grid grid-cols-2 gap-2">
              <div><dt>Plot area</dt><dd className="font-mono text-relume-ink">{template.parametricEnvelope.plotAreaSqm.min}–{template.parametricEnvelope.plotAreaSqm.max} m²</dd></div>
              <div><dt>Floors</dt><dd className="font-mono text-relume-ink">{template.parametricEnvelope.floorCount.min}–{template.parametricEnvelope.floorCount.max}</dd></div>
              <div><dt>Width</dt><dd className="font-mono text-relume-ink">{template.parametricEnvelope.buildingWidthM.min}–{template.parametricEnvelope.buildingWidthM.max} m</dd></div>
              <div><dt>Depth</dt><dd className="font-mono text-relume-ink">{template.parametricEnvelope.buildingDepthM.min}–{template.parametricEnvelope.buildingDepthM.max} m</dd></div>
            </dl>
          </section>
        </div>
      </details>
      <details className="border-t border-relume-border px-3 text-[10px] text-relume-muted" data-recomputation-evidence>
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 py-3 font-semibold text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          <span>Site inputs and recomputation</span><span className="whitespace-nowrap font-mono text-[9px]">{evaluation.state}</span>
        </summary>
        <div className="space-y-3 pb-3">
          <ul className="grid grid-cols-2 gap-2" aria-label="Required site inputs">
            {template.requiredSiteInputs.map((input) => {
              const missing = evaluation.missingInputs.includes(input.id)
              return <li key={input.id} className="flex items-center justify-between gap-2 border-b border-relume-border pb-1"><span className="capitalize">{input.id}</span><strong className="whitespace-nowrap">{missing ? 'UNKNOWN' : 'RECORDED'}</strong></li>
            })}
          </ul>
          {evaluation.triggers.length > 0
            ? <p className="leading-4" data-recompute-triggers><strong className="text-relume-ink">Recompute:</strong> {evaluation.triggers.join(', ')}</p>
            : <p className="leading-4" data-recompute-triggers>No out-of-envelope change has been recorded.</p>}
          <p className="leading-4">{evaluation.reasons[0] ?? 'Recorded inputs remain inside the bounded envelope.'}</p>
        </div>
      </details>
      <details className="border-t border-relume-border px-3 text-[10px] text-relume-muted" data-open-engine-disclosure>
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 py-3 font-semibold text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"><span>Open engine disclosure</span><span className="whitespace-nowrap font-mono text-[9px]">{activeEngines} ACTIVE</span></summary>
        <ul className="space-y-2 pb-3">
          {designEngines.map((engine) => <li key={engine.id} className="flex justify-between gap-3"><span>{engine.name} · {engine.role}</span><strong className="whitespace-nowrap">{engine.maturity}</strong></li>)}
        </ul>
        <p className="pb-3">Planned and evaluation entries are not connected software. D5 and V-Ray remain optional export plugins without Ferrum project write access.</p>
      </details>
      </>}
    </aside>
  )
}
