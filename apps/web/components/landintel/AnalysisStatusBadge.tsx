import type { ParcelAnalysisStatus } from '../../lib/workspace/parcelContext'

const STATUS_LABEL: Record<ParcelAnalysisStatus, string> = {
  QUEUED: 'Queued',
  RUNNING: 'Running',
  COMPLETE: 'Completed',
  FAILED: 'Failed',
}

const STATUS_CLASS: Record<ParcelAnalysisStatus, string> = {
  QUEUED: 'border-relume-border bg-white text-relume-muted',
  RUNNING: 'border-relume-command bg-relume-command/10 text-relume-command',
  COMPLETE: 'border-relume-command bg-relume-command text-white',
  FAILED: 'border-relume-command bg-relume-surface-secondary text-relume-command',
}

/** Renders the explicit deeper-analysis lifecycle (queued/running/completed/failed); omits entirely once nothing has ever been requested. */
export function AsyncAnalysisStatus({ status }: { status: ParcelAnalysisStatus | undefined }) {
  if (!status) return null
  return (
    <span
      role="status"
      aria-label={`Deeper analysis: ${STATUS_LABEL[status]}`}
      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${STATUS_CLASS[status]}`}
      data-analysis-status={status}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

/** Renders a STALE chip when a downstream output no longer matches the currently active site. */
export function StaleBadge({ stale }: { stale: boolean }) {
  if (!stale) return null
  return (
    <span
      role="status"
      aria-label="Stale: the active site has changed since this was generated"
      className="rounded-full border border-relume-command bg-relume-surface-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-relume-command"
      data-stale-badge
    >
      Stale · recompute
    </span>
  )
}
