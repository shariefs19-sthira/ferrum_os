"use client"

import { useState, useRef } from "react"

/**
 * Transact Stage-1: client-side OCR spike — W2-310. Uses tesseract.js
 * (Apache-2.0) entirely in-browser; the image never leaves the
 * device. Explicitly a spike (exploratory prototype, not a production
 * document-processing pipeline) — extracted text is shown as-is, with
 * no claim that it's been legally verified, matching
 * docs/COMPLIANCE_GATE.md's "not a legal opinion" register.
 */
export default function OcrSpike() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setStatus("running")
    setProgress(0)
    setText("")
    try {
      const { createWorker } = await import("tesseract.js")
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100))
        },
      })
      const { data } = await worker.recognize(file)
      await worker.terminate()
      setText(data.text)
      setStatus("done")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">Experimental spike</p>
      <p className="mt-2 text-sm text-relume-ink">
        Extract text from a document image. Processing happens entirely in your browser — the image is never uploaded anywhere.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Upload a document image"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        className="mt-4 block w-full text-sm text-relume-ink"
      />
      {status === "running" && (
        <p className="mt-3 text-sm text-relume-ink">Reading image... {progress}%</p>
      )}
      {status === "error" && <p className="mt-3 text-sm text-red-600">Could not read that image — try another.</p>}
      {status === "done" && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">Extracted text</p>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-relume-border bg-relume-surface-secondary p-3 text-xs text-relume-ink">{text || "(no text detected)"}</pre>
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-relume-ink">
            This is raw OCR output, not verified against any document. It is not a legal opinion and should not be relied on without checking the original document.
          </p>
        </div>
      )}
    </div>
  )
}
