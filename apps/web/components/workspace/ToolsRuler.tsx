"use client"

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
  { id: "extract", label: "Data extract", description: "Open product data" },
]

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
    if (tool === "extract") onExtractOpenChange(true)
  }

  return (
    <aside aria-label="Workspace tools" className={`border-relume-border bg-relume-surface-secondary ${rail ? "border-b lg:border-b-0 lg:border-l" : "border-b"}`}>
      <div className={`flex items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 ${rail ? "lg:h-full lg:flex-col lg:overflow-y-auto lg:px-2 lg:py-4" : "mx-auto max-w-relume-container"}`}>
        <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
          Tools
        </span>
        {tools.map((tool) => {
          const active = tool.id === activeTool
          return (
            <button
              aria-pressed={active}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${
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
        })}
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
