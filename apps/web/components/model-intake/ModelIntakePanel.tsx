'use client'

import { useState } from 'react'
import { inspectIfcFile } from '../../lib/ifcIntake'
import { machineReleaseChecks, modelReleaseStates, supportedModelFormatIntent, type ModelIntakeReport } from '../../lib/modelIntake'

const inputClass = 'min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 py-2 text-sm text-relume-ink'

export default function ModelIntakePanel() {
  const [file, setFile] = useState<File | null>(null)
  const [revision, setRevision] = useState('')
  const [source, setSource] = useState('')
  const [responsibleParty, setResponsibleParty] = useState('')
  const [report, setReport] = useState<ModelIntakeReport | null>(null)
  const [status, setStatus] = useState<'idle' | 'reading' | 'error'>('idle')
  const [error, setError] = useState('')

  async function inspect() {
    if (!file) return
    setStatus('reading'); setError(''); setReport(null)
    try {
      setReport(await inspectIfcFile(file, { revision, source, responsibleParty }))
      setStatus('idle')
    } catch (caught) {
      setStatus('error')
      setError(caught instanceof Error ? caught.message : 'The IFC intake failed.')
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="model-intake-heading" data-model-intake-panel>
      <div className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface">
        <header className="grid gap-5 border-b border-relume-border p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">DesignStudio · OpenBIM intake</p>
              <span className="rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">Local browser processing</span>
            </div>
            <h2 id="model-intake-heading" className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-command sm:text-3xl">Know what entered the project before using the model</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-relume-ink">Select an IFC revision to compute its SHA-256 and inspect schema and entity counts with web-ifc. The file stays in this browser session. Geometry viewing, CRS verification and engineering acceptance remain separate controls.</p>
          </div>
          <StatusCard report={report} status={status} />
        </header>

        <div className="grid min-w-0 xl:grid-cols-[minmax(20rem,0.42fr)_minmax(0,1fr)]">
          <div className="border-b border-relume-border bg-relume-surface-secondary p-4 sm:p-6 xl:border-b-0 xl:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">1 · Identify the revision</p>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-semibold">IFC file<input aria-label="IFC file" type="file" accept=".ifc,application/x-step" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setReport(null); setError('') }} className={`${inputClass} mt-2 file:mr-3 file:rounded-full file:border-0 file:bg-relume-command file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white`} /></label>
              <label className="block text-xs font-semibold">Revision<input aria-label="Revision" value={revision} onChange={(event) => setRevision(event.target.value)} placeholder="e.g. P03" className={`${inputClass} mt-2`} /></label>
              <label className="block text-xs font-semibold">Source organization<input aria-label="Source organization" value={source} onChange={(event) => setSource(event.target.value)} placeholder="Organization or author" className={`${inputClass} mt-2`} /></label>
              <label className="block text-xs font-semibold">Responsible party<input aria-label="Responsible party" value={responsibleParty} onChange={(event) => setResponsibleParty(event.target.value)} placeholder="Accountable model owner" className={`${inputClass} mt-2`} /></label>
              <button type="button" onClick={() => void inspect()} disabled={!file || status === 'reading'} className="min-h-11 w-full rounded-full bg-relume-command px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{status === 'reading' ? 'Inspecting locally…' : 'Create intake report'}</button>
              <p className="text-[10px] leading-4 text-relume-muted">Maximum 50 MB. The current slice reads IFC only. It does not upload, retain, render or approve the model.</p>
              {error && <p role="alert" className="rounded-relume border border-relume-border bg-white p-3 text-xs leading-5 text-relume-ink"><strong>REJECTED:</strong> {error}</p>}
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Supported model formats">
              {supportedModelFormatIntent.map((item) => <span key={item.format} title={item.note} className="rounded-full border border-relume-border bg-white px-3 py-1.5 text-[10px] font-semibold">{item.format} · {item.state}</span>)}
            </div>
          </div>

          <div className="min-w-0 p-4 sm:p-6" aria-live="polite">
            {report ? <Report report={report} /> : <EmptyReport />}
          </div>
        </div>

        <div className="border-t border-relume-border p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Controlled release states</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {modelReleaseStates.map((item) => <article key={item.state} className="rounded-relume border border-relume-border p-4"><h3 className="text-xs font-semibold">{item.state}</h3><p className="mt-2 text-xs leading-5">{item.meaning}</p><p className="mt-2 text-[10px] leading-4 text-relume-muted">{item.gate}</p></article>)}
          </div>
        </div>

        <div className="grid gap-4 border-t border-relume-border bg-relume-surface-secondary p-4 sm:p-6 lg:grid-cols-[18rem_1fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Machine release</p><p className="mt-2 text-lg font-semibold">BLOCKED · 0 / {machineReleaseChecks.length}</p></div>
          <ul className="grid gap-2 sm:grid-cols-2">{machineReleaseChecks.map((check) => <li key={check} className="rounded-relume border border-relume-border bg-white p-3 text-xs">{check}</li>)}</ul>
        </div>
        <p className="border-t border-relume-border px-4 py-4 text-xs leading-5 text-relume-muted sm:px-6"><strong className="text-relume-command">A PARSE OR RENDER DOES NOT MEAN GEOGRAPHICALLY, DIMENSIONALLY OR ENGINEERING VALIDATED.</strong> Plan, 3D and cross-section synchronization, geometry bounds, measurements, revision overlays and machine export remain roadmap work.</p>
      </div>
    </section>
  )
}

function StatusCard({ report, status }: { report: ModelIntakeReport | null; status: string }) {
  const title = status === 'reading' ? 'UPLOADED · INSPECTING' : report?.state ?? 'NO MODEL INGESTED'
  return <div className="rounded-relume border border-relume-ink bg-relume-ink p-4 text-white"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">Current intake status</p><p className="mt-2 text-lg font-semibold">{title}</p><p className="mt-2 text-xs leading-5 text-white/70">{report ? 'Metadata parsed. Validation and every downstream release remain blocked.' : 'No file has been parsed, previewed, validated or approved.'}</p></div>
}

function EmptyReport() {
  return <div className="flex min-h-80 items-center justify-center rounded-relume border border-dashed border-relume-border bg-relume-surface-secondary p-6 text-center"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">2 · Intake report</p><p className="mt-3 text-lg font-semibold">Awaiting an IFC revision</p><p className="mt-2 max-w-md text-xs leading-5 text-relume-muted">The report will expose file identity, schema, units, origin, entity counts, unresolved spatial reference, warnings, revision-comparison status and downstream holds.</p></div></div>
}

function Report({ report }: { report: ModelIntakeReport }) {
  const rows = [
    ['File', report.file.name, 'OBSERVED'], ['SHA-256', report.file.sha256, 'OBSERVED'],
    ['Revision', report.file.revision.value ?? 'UNKNOWN', report.file.revision.status],
    ['Source', report.file.source.value ?? 'UNKNOWN', report.file.source.status],
    ['Responsible party', report.file.responsibleParty.value ?? 'UNKNOWN', report.file.responsibleParty.status],
    ['IFC schema', report.parser.schema.value ?? 'UNKNOWN', report.parser.schema.status],
    ['Length unit', report.spatialReference.units.value ?? 'UNKNOWN', report.spatialReference.units.status],
    ['CRS / EPSG', report.spatialReference.crs.value ?? 'UNKNOWN', report.spatialReference.crs.status],
    ['Vertical datum', report.spatialReference.verticalDatum.value ?? 'UNKNOWN', report.spatialReference.verticalDatum.status],
    ['Model origin', report.spatialReference.origin.value?.join(', ') ?? 'UNKNOWN', report.spatialReference.origin.status],
    ['Bounds', 'UNKNOWN', report.spatialReference.bounds.status],
    ['Unsupported entities', report.unsupportedEntities.value?.join(', ') ?? 'NOT EVALUATED', report.unsupportedEntities.status],
    ['Approval state', report.approval.state, report.approval.reviewer ? 'REVIEWED' : 'NO REVIEWER'],
  ]
  return <div data-intake-report>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">2 · Machine-readable intake report</p><h3 className="mt-2 text-xl font-semibold">Validation required</h3></div><span className="rounded-full bg-relume-command px-3 py-2 text-[10px] font-semibold text-white">{report.parser.engine} {report.parser.engineVersion}</span></div>
    <dl className="mt-5 grid gap-px overflow-hidden rounded-relume border border-relume-border bg-relume-border sm:grid-cols-2">
      {rows.map(([label, value, state]) => <div key={label} className="min-w-0 bg-white p-3"><dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">{label} · {state}</dt><dd className={`mt-1 break-all text-xs ${label === 'SHA-256' ? 'font-mono' : 'font-semibold'}`}>{value}</dd></div>)}
    </dl>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <article className="rounded-relume border border-relume-border p-4"><h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Parsed object types · {report.parsedObjectTypes.length}</h4><ul className="mt-3 grid grid-cols-2 gap-2">{report.parsedObjectTypes.slice(0, 12).map((item) => <li key={item.type} className="flex justify-between gap-2 text-xs"><span className="truncate">{item.type}</span><strong>{item.count}</strong></li>)}</ul></article>
      <article className="rounded-relume border border-relume-border p-4"><h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Geometry warnings</h4><ul className="mt-3 space-y-2">{report.geometryWarnings.map((warning) => <li key={warning} className="text-xs leading-5">• {warning}</li>)}</ul></article>
    </div>
    <article className="mt-4 rounded-relume border border-relume-border bg-relume-surface-secondary p-4"><h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Previous revision · {report.previousRevisionComparison.status}</h4><p className="mt-2 text-xs leading-5">{report.previousRevisionComparison.note}</p></article>
    <div className="mt-4"><h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Downstream consumers</h4><ul className="mt-3 grid gap-2 sm:grid-cols-2">{report.downstreamConsumers.map((consumer) => <li key={consumer.product} className="rounded-relume border border-relume-border p-3"><div className="flex justify-between gap-2 text-xs font-semibold"><span>{consumer.product}</span><span>{consumer.state}</span></div><p className="mt-2 text-[10px] leading-4 text-relume-muted">{consumer.reason}</p></li>)}</ul></div>
  </div>
}
