"use client"

import { useEffect, useRef, useState } from "react"
import type { WorkspaceProduct, WorkspaceToolCallbacks } from "../../lib/types"
import { workspaceProducts } from "../../lib/types"

type TabRailProps = Pick<WorkspaceToolCallbacks, "onProductChange"> & {
  activeProduct: WorkspaceProduct
}

// W2-502: the ten-item WorkspaceProduct rail used to be a horizontally
// scrolling row (overflow-x-auto) - the same defect class fixed this
// session on the homepage hero's ten-tab rail (HomepageCockpitHero.tsx).
// `flex-wrap` was considered instead of a trigger+listbox collapse, since
// ten items sits right on the "wrap small sets / collapse larger sets"
// boundary the task calls out - but rejected specifically for THIS rail:
// TabRail lives in a fixed-height app-bar strip between the workspace
// header and the canvas region inside a 100dvh fullscreen shell
// (project-workspace/cockpit/page.tsx). Several labels here are wide
// ("Community", "Transact", "Procure"), so wrapping would push the rail
// to two lines at most widths below roughly 900px, visibly growing the
// chrome and shrinking the canvas - reintroducing a version of the exact
// "dead/reserved space" defect this task exists to remove. Reusing the
// homepage's already-shipped trigger+listbox pattern (itself built on
// MobileMenu.tsx's Escape/click-outside shape) keeps this rail's height
// constant at every viewport width instead, so it's reused verbatim in
// spirit here rather than reinvented a third time.
export default function TabRail({ activeProduct, onProductChange }: TabRailProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [focusedProduct, setFocusedProduct] = useState<WorkspaceProduct>(activeProduct)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<Partial<Record<WorkspaceProduct, HTMLDivElement | null>>>({})

  function selectProduct(product: WorkspaceProduct) {
    onProductChange(product)
    setIsMenuOpen(false)
    triggerRef.current?.focus()
  }

  function toggleMenu() {
    setIsMenuOpen((current) => {
      const next = !current
      if (next) setFocusedProduct(activeProduct)
      return next
    })
  }

  function closeMenu() {
    setIsMenuOpen(false)
    triggerRef.current?.focus()
  }

  // Escape closes the listbox and returns focus to its trigger; Arrow/
  // Home/End move the roving-tabindex focus among the ten options - the
  // same document-level-listener-while-open shape MobileMenu.tsx uses,
  // via the copy HomepageCockpitHero.tsx already made of it.
  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeMenu()
        return
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
        event.preventDefault()
        setFocusedProduct((current) => {
          const index = workspaceProducts.indexOf(current)
          if (event.key === "ArrowDown") return workspaceProducts[(index + 1) % workspaceProducts.length]
          if (event.key === "ArrowUp") return workspaceProducts[(index - 1 + workspaceProducts.length) % workspaceProducts.length]
          if (event.key === "Home") return workspaceProducts[0]
          return workspaceProducts[workspaceProducts.length - 1]
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen])

  // Click-outside close - same containerRef-wraps-trigger-and-panel /
  // `mousedown` + `!ref.contains(target)` shape as MobileMenu.tsx.
  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  // Moves real DOM focus to the roving-tabindex option and scrolls it
  // into view, honouring prefers-reduced-motion.
  useEffect(() => {
    if (!isMenuOpen) return
    const el = optionRefs.current[focusedProduct]
    const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    el?.focus()
    el?.scrollIntoView?.({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" })
  }, [isMenuOpen, focusedProduct])

  function handleOptionKeyDown(event: React.KeyboardEvent<HTMLDivElement>, product: WorkspaceProduct) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      selectProduct(product)
    }
  }

  return (
    <nav aria-label="Workspace product rail" className="border-b border-relume-border bg-relume-surface px-4 py-2 sm:px-6">
      {/* Wide viewports: the full ten-tab row fits with no scroll and no
          wrap, so it renders plainly - same min-[1366px] cutoff the
          homepage rail uses. */}
      <div role="tablist" aria-label="Workspace products" className="mx-auto hidden max-w-relume-container min-[1366px]:flex min-[1366px]:gap-1">
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

      {/* Below 1366px: compact trigger ("<Label> ▾") + floating vertical
          role="listbox" / role="option" menu. */}
      <div ref={menuRef} className="relative min-[1366px]:hidden">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isMenuOpen}
          aria-controls="workspace-tab-rail-listbox"
          onClick={toggleMenu}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-relume-border bg-relume-surface px-4 py-2 text-sm font-medium text-relume-ink transition-colors hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
        >
          <span>{activeProduct}</span>
          <span aria-hidden="true">▾</span>
        </button>

        {isMenuOpen && (
          <div
            id="workspace-tab-rail-listbox"
            role="listbox"
            aria-label="Workspace products"
            className="absolute left-0 top-full z-30 mt-2 max-h-80 w-56 overflow-y-auto rounded-2xl border border-relume-border bg-relume-surface p-2 shadow-xl"
          >
            {workspaceProducts.map((product) => (
              <div
                key={product}
                ref={(el) => {
                  optionRefs.current[product] = el
                }}
                role="option"
                aria-selected={activeProduct === product}
                tabIndex={focusedProduct === product ? 0 : -1}
                onClick={() => selectProduct(product)}
                onKeyDown={(event) => handleOptionKeyDown(event, product)}
                className={`flex min-h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${
                  activeProduct === product
                    ? "bg-relume-ink text-white"
                    : "text-relume-ink hover:bg-relume-surface-secondary"
                }`}
              >
                {product}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
