"use client"

import { useState } from "react"

/**
 * W2-401 shell chrome — command bar, the text entry point into the
 * assistant intent API (enumerated intents: add-floor, set-setback,
 * show-BOQ, check-structura, save, switch-tab, units). Placeholder:
 * captures input and calls onSubmit; the intent API itself (parsing
 * text into one of the seven enumerated intents and dispatching to the
 * real engine calls) is separate, not-yet-built work — this component
 * does not parse or guess an intent on its own.
 */
export default function CommandBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("")

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue("")
  }

  return (
    <form
      className="flex items-center gap-2 border-t border-relume-border bg-relume-surface px-4 py-3 sm:px-6"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <label className="sr-only" htmlFor="workspace-command-bar">
        Command
      </label>
      <input
        id="workspace-command-bar"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. add a floor, show BOQ, save"
        className="min-h-11 flex-1 rounded-full border border-relume-border px-4 text-sm"
      />
      <button
        type="submit"
        className="min-h-11 shrink-0 rounded-full bg-relume-ink px-5 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
      >
        Run
      </button>
    </form>
  )
}
