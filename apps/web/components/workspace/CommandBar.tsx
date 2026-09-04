"use client"

import { useEffect, useRef, useState } from "react"

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

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
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState("Type a change or choose a suggestion over the canvas.")
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => () => recognitionRef.current?.stop(), [])

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setStatus(`Applied: ${trimmed}`)
    setValue("")
  }

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const scope = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
    const SpeechRecognition = scope.SpeechRecognition ?? scope.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setStatus("Voice input is not available in this browser. Type the command instead.")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-IN"
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ""
      setValue(transcript)
      setStatus(transcript ? `Heard: ${transcript}. Review, then run.` : "No speech detected.")
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => { setListening(false); setStatus("Voice input stopped. Type the command instead.") }
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
    setStatus("Listening…")
  }

  return (
    <form
      className="border-y border-relume-border bg-relume-command px-4 py-3 text-white shadow-lg sm:px-6"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="mx-auto flex max-w-relume-container items-center gap-2">
        <label className="sr-only" htmlFor="workspace-command-bar">Command</label>
        <input id="workspace-command-bar" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Describe a change — “add a floor” or “show plan”" className="min-h-12 flex-1 rounded-full border border-white/25 bg-white px-5 text-base text-relume-ink placeholder:text-relume-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent" />
        <button type="button" aria-pressed={listening} aria-label={listening ? "Stop voice input" : "Start voice input"} title={listening ? "Stop voice input" : "Start voice input"} onClick={toggleVoice} className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${listening ? 'border-relume-accent bg-relume-accent text-relume-command' : 'border-white/35 bg-white/10 text-white hover:bg-white/20'}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8"><rect x="8" y="3" width="8" height="12" rx="4" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg>
        </button>
        <button type="submit" className="min-h-12 shrink-0 rounded-full bg-relume-accent px-6 text-sm font-semibold text-relume-command hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Run</button>
      </div>
      <p className="mx-auto mt-2 max-w-relume-container text-xs text-white/70" aria-live="polite" data-command-status>{status}</p>
    </form>
  )
}
