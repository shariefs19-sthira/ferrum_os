"use client"

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink"
    >
      Print this page
    </button>
  )
}
