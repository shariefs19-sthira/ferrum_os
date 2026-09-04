"use client"

import { useEffect } from "react"
import type { WorkspaceMoreAction, WorkspaceToolCallbacks } from "../../lib/types"

type MoreDrawerProps = Pick<WorkspaceToolCallbacks, "onMoreAction" | "onMoreOpenChange"> & {
  open: boolean
}

const actions: Array<{ id: WorkspaceMoreAction; label: string; description: string }> = [
  { id: "advanced", label: "Advanced controls", description: "Open manual plot, setback, floor, and unit controls." },
  { id: "activity", label: "View activity", description: "Show the project activity ledger." },
  { id: "export", label: "Export current extract", description: "Prepare the visible extract for export." },
  { id: "help", label: "Workspace help", description: "Explain the active product and tools." },
]

export default function MoreDrawer({ onMoreAction, onMoreOpenChange, open }: MoreDrawerProps) {
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMoreOpenChange(false)
    }
    addEventListener("keydown", closeOnEscape)
    return () => removeEventListener("keydown", closeOnEscape)
  }, [onMoreOpenChange, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" role="presentation">
      <button aria-label="Close more options" className="min-h-full flex-1 cursor-default" onClick={() => onMoreOpenChange(false)} type="button" />
      <section aria-label="More workspace options" aria-modal="true" className="h-full w-full max-w-sm border-l border-relume-border bg-relume-surface p-5 sm:p-relume-card" role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Workspace</p><h2 className="mt-2 text-xl font-semibold tracking-relume-tight text-relume-ink">More options</h2></div>
          <button className="min-h-11 rounded-full border border-relume-border px-4 text-sm font-medium text-relume-ink hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" onClick={() => onMoreOpenChange(false)} type="button">Close</button>
        </div>
        <ul className="mt-8 divide-y divide-relume-border border-y border-relume-border">
          {actions.map((action) => (
            <li key={action.id}>
              <button className="w-full py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink" onClick={() => { onMoreAction(action.id); onMoreOpenChange(false) }} type="button">
                <span className="block text-sm font-semibold text-relume-ink">{action.label}</span>
                <span className="mt-1 block text-sm leading-6 text-relume-muted">{action.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
