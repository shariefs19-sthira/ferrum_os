"use client"

export type WalkthroughStatus = "idle" | "playing" | "paused" | "ended"
export type RecordingState = "off" | "armed" | "recording" | "saved" | "failed"
export type WalkthroughView = { status: WalkthroughStatus; progress: number; elapsedS: number; durationS: number; stepped: boolean }

const button = "min-h-11 min-w-11 rounded-full border border-relume-border px-3 text-[10px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-command"
const statusText: Record<WalkthroughStatus, string> = { idle: "Ready", playing: "Playing", paused: "Paused", ended: "Finished" }

// Lives in the bar BELOW the canvas, never over it, so the model stays fully
// visible at every viewport. Purely presentational: Space3D owns the camera.
export default function WalkthroughControl({ view, recordingSupported, recording, onPlay, onPause, onRestart, onExport, onToggleRecording, exportNote }: {
  view: WalkthroughView
  recordingSupported: boolean
  recording: RecordingState
  onPlay: () => void
  onPause: () => void
  onRestart: () => void
  onExport: () => void
  onToggleRecording: () => void
  exportNote: string
}) {
  const playing = view.status === "playing"
  const pct = Math.round(view.progress * 100)
  return (
    <div className="flex basis-full flex-wrap items-center gap-2 border-t border-relume-border pt-1" role="group" aria-label="Camera walkthrough" data-walkthrough>
      <button type="button" onClick={playing ? onPause : onPlay} aria-label={playing ? "Pause walkthrough" : view.status === "ended" ? "Replay walkthrough" : view.status === "paused" ? "Resume walkthrough" : "Play walkthrough"} className={`${button} bg-relume-command text-white`} data-walkthrough-toggle>
        {playing ? "Pause" : view.status === "ended" ? "Replay" : view.status === "paused" ? "Resume" : "Play walkthrough"}
      </button>
      <button type="button" onClick={onRestart} aria-label="Restart walkthrough from the default view" className={`${button} bg-white text-relume-command`} data-walkthrough-restart>Restart</button>
      <button type="button" onClick={onExport} aria-label="Export walkthrough manifest as JSON" className={`${button} bg-white text-relume-command`} data-walkthrough-export>Export manifest</button>
      {recordingSupported && <button type="button" onClick={onToggleRecording} aria-pressed={recording === "armed" || recording === "recording"} aria-label="Optional: record the walkthrough to a local WebM file" className={`${button} ${recording === "armed" || recording === "recording" ? "bg-relume-command text-white" : "bg-white text-relume-command"}`} data-walkthrough-record>
        {recording === "recording" ? "Recording…" : recording === "armed" ? "Record on" : "Record (local)"}
      </button>}
      <div className="flex min-w-32 flex-1 basis-40 items-center gap-2">
        <progress className="h-1.5 min-w-0 flex-1 accent-relume-ink" value={pct} max={100} aria-label="Walkthrough progress" data-walkthrough-progress />
        <span className="shrink-0 text-[10px] font-semibold tabular-nums text-relume-muted" data-walkthrough-status>{statusText[view.status]} · {Math.round(view.elapsedS)}s / {view.durationS}s</span>
      </div>
      <p className="basis-full text-[9px] leading-4 text-relume-muted" role="status" data-walkthrough-note>
        {view.stepped ? "Reduced motion: stepped viewpoints. " : ""}
        {!recordingSupported ? "Video recording is not available in this browser; the manifest export still works. " : ""}
        {recording === "saved" ? "Recording saved locally. " : recording === "failed" ? "Recording failed; the walkthrough itself is unaffected. " : ""}
        {exportNote}
      </p>
    </div>
  )
}
