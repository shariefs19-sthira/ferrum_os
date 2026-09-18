"use client"

import { useState, type KeyboardEvent, type ReactNode } from 'react'

export type EvidenceTheme = {
  id: string
  label: string
  description: string
  content: ReactNode
}

/**
 * Organizes LandIntel's evidence surfaces into explicit analytical themes
 * (land, access, environment, regulation, market) behind one accessible
 * tablist, reusing existing panel components as each theme's content rather
 * than duplicating them. A theme with no wired panel is never hidden by
 * omission from the tab strip — every theme mission-listed must appear here,
 * even one whose own content is still roadmap-labeled internally.
 */
export default function EvidenceThemeTabs({ themes }: { themes: EvidenceTheme[] }) {
  const [activeId, setActiveId] = useState(themes[0]?.id)
  const activeIndex = Math.max(0, themes.findIndex((theme) => theme.id === activeId))

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const lastIndex = themes.length - 1
    const nextIndex = event.key === 'ArrowLeft' ? Math.max(0, activeIndex - 1)
      : event.key === 'ArrowRight' ? Math.min(lastIndex, activeIndex + 1)
      : event.key === 'Home' ? 0
      : lastIndex
    const next = themes[nextIndex]
    if (!next) return
    setActiveId(next.id)
    document.getElementById(`landintel-theme-tab-${next.id}`)?.focus()
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="evidence-theme-heading" data-evidence-theme-tabs>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="evidence-theme-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Analytical themes</h2>
        <p className="text-xs text-relume-muted">Every theme below reuses an existing Ferrum capability {'—'} an unsupported layer reads UNKNOWN or Roadmap, never a synthesized result.</p>
      </div>
      <div role="tablist" aria-label="LandIntel evidence themes" className="mt-3 flex flex-wrap gap-2 border-b border-relume-border pb-3">
        {themes.map((theme) => {
          const selected = theme.id === activeId
          return (
            <button
              key={theme.id}
              id={`landintel-theme-tab-${theme.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`landintel-theme-panel-${theme.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(theme.id)}
              onKeyDown={onKeyDown}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${selected ? 'border-relume-command bg-relume-command text-white' : 'border-relume-border text-relume-command hover:bg-relume-surface-secondary'}`}
              data-evidence-theme-tab={theme.id}
            >
              {theme.label}
            </button>
          )
        })}
      </div>
      {themes.map((theme) => (
        <div
          key={theme.id}
          id={`landintel-theme-panel-${theme.id}`}
          role="tabpanel"
          aria-labelledby={`landintel-theme-tab-${theme.id}`}
          hidden={theme.id !== activeId}
          className="mt-6 space-y-6"
          data-evidence-theme-panel={theme.id}
        >
          <p className="text-sm leading-6 text-relume-ink">{theme.description}</p>
          {theme.content}
        </div>
      ))}
    </section>
  )
}
