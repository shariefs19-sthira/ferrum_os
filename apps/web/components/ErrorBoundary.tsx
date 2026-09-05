"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { children: ReactNode }
type State = { error: Error | null; copied: boolean }

/**
 * White-screen insurance: wraps every route in the root layout. A
 * render-time exception anywhere below this (a lost WebGL context that
 * still throws somewhere, an unguarded browser API, anything) shows a
 * friendly recovery panel instead of a blank page - progressive
 * failure, not total failure. This is a genuine React error boundary
 * (class component + componentDidCatch/getDerivedStateFromError - the
 * only mechanism React actually supports for this; a hook cannot do it).
 *
 * Does not attempt to auto-recover the broken subtree (React error
 * boundaries can't safely re-render past a caught error without a key
 * change) - "Reload page" is the real recovery action; "Try again"
 * only clears the boundary's own state for a transient case.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, copied: false }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] caught a render error:", error, info.componentStack)
  }

  private reportDetails() {
    const { error } = this.state
    const details = [
      `Ferrum OS error report`,
      `Time: ${new Date().toISOString()}`,
      `URL: ${typeof window !== "undefined" ? window.location.href : "unknown"}`,
      `User agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "unknown"}`,
      `Message: ${error?.message ?? "unknown"}`,
      `Stack: ${error?.stack ?? "unavailable"}`,
    ].join("\n")
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(details).then(
        () => this.setState({ copied: true }),
        () => this.setState({ copied: false }),
      )
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-relume-surface-secondary px-6">
        <div className="max-w-md rounded-relume border border-relume-border bg-relume-surface p-8 text-center shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-command">Something didn&apos;t load</p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-relume-ink">This page hit a snag</h1>
          <p className="mt-3 text-sm leading-6 text-relume-muted">
            The rest of Ferrum OS is unaffected — reloading this page usually clears it.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-full bg-relume-command px-5 text-sm font-semibold text-white hover:bg-relume-steel"
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={() => this.setState({ error: null, copied: false })}
              className="min-h-11 rounded-full border border-relume-border px-5 text-sm font-semibold text-relume-ink hover:bg-relume-surface-secondary"
            >
              Try again
            </button>
          </div>
          <button
            type="button"
            onClick={() => this.reportDetails()}
            className="mt-4 inline-flex min-h-9 items-center rounded-full border border-relume-border px-4 text-xs font-medium text-relume-muted hover:bg-relume-surface-secondary"
            data-report-error-chip
          >
            {this.state.copied ? "Details copied — paste into a message to the team" : "Report this"}
          </button>
        </div>
      </div>
    )
  }
}
