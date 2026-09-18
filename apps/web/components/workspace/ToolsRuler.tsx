"use client"

import { useEffect, useRef, useState } from "react"
import type { WorkspaceTool, WorkspaceToolCallbacks } from "../../lib/types"

type ToolsRulerProps = Pick<
  WorkspaceToolCallbacks,
  "onExtractOpenChange" | "onMoreOpenChange" | "onToolChange"
> & {
  activeTool: WorkspaceTool
  extractOpen: boolean
  rail?: boolean
}

const tools: Array<{ id: WorkspaceTool; label: string; description: string }> = [
  { id: "select", label: "Select", description: "Choose an attached output" },
  { id: "measure", label: "Measure", description: "Read dimensions in both units" },
  { id: "compare", label: "Compare", description: "Compare product outputs" },
]

// W2-503: `rail=false` has no render path anywhere in the app today
// (project-workspace/cockpit/page.tsx, this component's only call site,
// always passes `rail`) - confirmed again this session - but the
// operator's acceptance criterion is a literal repo-wide grep for
// overflow-x-auto/overflow-x-scroll, so this dead branch still needs a
// real fix rather than being left as matching-but-unreachable code.
// Reuses the same trigger+listbox pattern HomepageCockpitHero.tsx/
// TabRail.tsx already ship for their own horizontal-row-of-tools
// collapse, rather than inventing a third variant.
export default function ToolsRuler({
  activeTool,
  extractOpen,
  onExtractOpenChange,
  onMoreOpenChange,
  onToolChange,
  rail = false,
}: ToolsRulerProps) {
  const chooseTool = (tool: WorkspaceTool) => {
    onToolChange(tool)
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [focusedTool, setFocusedTool] = useState<WorkspaceTool>(activeTool)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<Partial<Record<WorkspaceTool, HTMLDivElement | null>>>({})

  function selectTool(tool: WorkspaceTool) {
    chooseTool(tool)
    setIsMenuOpen(false)
    triggerRef.current?.focus()
  }

  function toggleMenu() {
    setIsMenuOpen((current) => {
      const next = !current
      if (next) setFocusedTool(activeTool)
      return next
    })
  }

  function closeMenu() {
    setIsMenuOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (rail || !isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeMenu()
        return
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
        event.preventDefault()
        setFocusedTool((current) => {
          const index = tools.findIndex((tool) => tool.id === current)
          if (event.key === "ArrowDown") return tools[(index + 1) % tools.length].id
          if (event.key === "ArrowUp") return tools[(index - 1 + tools.length) % tools.length].id
          if (event.key === "Home") return tools[0].id
          return tools[tools.length - 1].id
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rail, isMenuOpen])

  useEffect(() => {
    if (rail || !isMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [rail, isMenuOpen])

  useEffect(() => {
    if (rail || !isMenuOpen) return
    const el = optionRefs.current[focusedTool]
    const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    el?.focus()
    el?.scrollIntoView?.({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" })
  }, [rail, isMenuOpen, focusedTool])

  function handleOptionKeyDown(event: React.KeyboardEvent<HTMLDivElement>, tool: WorkspaceTool) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      selectTool(tool)
    }
  }

  const activeToolMeta = tools.find((tool) => tool.id === activeTool) ?? tools[0]

  return (
    <aside aria-label="Workspace tools" className={`border-relume-border bg-relume-surface-secondary ${rail ? "border-b lg:border-b-0 lg:border-l" : "border-b"}`}>
      <div className={`flex items-center gap-2 px-4 py-2 sm:px-6 ${rail ? "h-full flex-col overflow-x-hidden overflow-y-auto px-1 py-3 sm:px-1" : "mx-auto max-w-relume-container"}`}>
        <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
          Tools
        </span>
        {rail ? (
          tools.map((tool) => {
            const active = tool.id === activeTool
            return (
              <button
                aria-pressed={active}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${rail ? "w-full min-w-0 whitespace-normal px-1 text-[11px] leading-tight" : ""} ${
                  active
                    ? "border-relume-ink bg-relume-ink text-white"
                    : "border-relume-border bg-relume-surface text-relume-ink hover:bg-relume-surface-secondary"
                }`}
                key={tool.id}
                onClick={() => chooseTool(tool.id)}
                title={tool.description}
                type="button"
              >
                {tool.label}
              </button>
            )
          })
        ) : (
          <div ref={menuRef} className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isMenuOpen}
              aria-controls="tools-ruler-listbox"
              onClick={toggleMenu}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-relume-border bg-relume-surface px-4 py-2 text-sm font-medium text-relume-ink transition-colors hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
            >
              <span>{activeToolMeta.label}</span>
              <span aria-hidden="true">▾</span>
            </button>

            {isMenuOpen && (
              <div
                id="tools-ruler-listbox"
                role="listbox"
                aria-label="Workspace tools"
                className="absolute left-0 top-full z-30 mt-2 max-h-80 w-56 overflow-y-auto rounded-2xl border border-relume-border bg-relume-surface p-2 shadow-xl"
              >
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    ref={(el) => {
                      optionRefs.current[tool.id] = el
                    }}
                    role="option"
                    aria-selected={activeTool === tool.id}
                    tabIndex={focusedTool === tool.id ? 0 : -1}
                    onClick={() => selectTool(tool.id)}
                    onKeyDown={(event) => handleOptionKeyDown(event, tool.id)}
                    title={tool.description}
                    className={`flex min-h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${
                      activeTool === tool.id
                        ? "bg-relume-ink text-white"
                        : "text-relume-ink hover:bg-relume-surface-secondary"
                    }`}
                  >
                    {tool.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          aria-expanded={extractOpen}
          className={`${rail ? "lg:mt-auto" : "ml-auto"} min-h-11 shrink-0 rounded-full border border-relume-border bg-relume-surface px-4 text-sm font-medium text-relume-ink hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink`}
          onClick={() => onExtractOpenChange(!extractOpen)}
          type="button"
        >
          {extractOpen ? "Hide extract" : "Open extract"}
        </button>
        <button
          aria-haspopup="dialog"
          className="min-h-11 shrink-0 rounded-full border border-relume-border bg-relume-surface px-4 text-sm font-medium text-relume-ink hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
          onClick={() => onMoreOpenChange(true)}
          type="button"
        >
          More
        </button>
      </div>
    </aside>
  )
}
