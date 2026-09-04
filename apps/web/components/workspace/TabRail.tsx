"use client"

import type { WorkspaceProduct, WorkspaceToolCallbacks } from "../../lib/types"
import { workspaceProducts } from "../../lib/types"

type TabRailProps = Pick<WorkspaceToolCallbacks, "onProductChange"> & {
  activeProduct: WorkspaceProduct
}

export default function TabRail({ activeProduct, onProductChange }: TabRailProps) {
  return (
    <nav aria-label="Workspace product rail" className="border-b border-relume-border bg-relume-surface">
      <div className="mx-auto flex max-w-relume-container gap-1 overflow-x-auto px-4 sm:px-6">
        {workspaceProducts.map((product) => {
          const active = product === activeProduct
          return (
            <button
              aria-current={active ? "page" : undefined}
              className={`min-h-11 shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-relume-ink ${
                active
                  ? "border-relume-ink text-relume-ink"
                  : "border-transparent text-relume-muted hover:border-relume-border hover:text-relume-ink"
              }`}
              key={product}
              onClick={() => onProductChange(product)}
              type="button"
            >
              {product}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
