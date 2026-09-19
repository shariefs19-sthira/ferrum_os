"use client"

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { splitterKeyAction, widthFromDrag } from "../../lib/workspace/panelLayout"

type PanelSplitterProps = {
  label: string
  /** Current, min and max size of the panel this splitter resizes (px). */
  value: number
  min: number
  max: number
  /** +1: dragging right grows the panel (panel is left of the splitter). -1: panel is right of it. */
  direction: 1 | -1
  onResize: (width: number) => void
  onReset: () => void
  onDraggingChange?: (dragging: boolean) => void
  /** id of the panel this splitter controls (aria-controls). */
  controls?: string
  className?: string
  style?: React.CSSProperties
  testId?: string
}

/**
 * WAI-ARIA window splitter. Pointer drag (with capture, so the drag survives
 * leaving the 12px bar or crossing an iframe/canvas) plus keyboard: arrows
 * resize by 16px (Shift 64px), Home/End jump to min/max, Enter or double-click
 * resets. The parent owns the numbers and clamps; this only reports intent.
 */
export default function PanelSplitter({ label, value, min, max, direction, onResize, onReset, onDraggingChange, controls, className = "", style, testId }: PanelSplitterProps) {
  const drag = useRef<{ startX: number; startWidth: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const growKey = direction === 1 ? "ArrowRight" : "ArrowLeft"

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drag.current = { startX: event.clientX, startWidth: value }
    setDragging(true)
    onDraggingChange?.(true)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    onResize(widthFromDrag(drag.current.startWidth, drag.current.startX, event.clientX, direction))
  }
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    onDraggingChange?.(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const action = splitterKeyAction(event.key, event.shiftKey, growKey)
    if (!action) return
    event.preventDefault()
    if (action.kind === "delta") onResize(value + action.delta)
    else if (action.kind === "min") onResize(min)
    else if (action.kind === "max") onResize(max)
    else onReset()
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-controls={controls}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onKeyDown={onKeyDown}
      onDoubleClick={onReset}
      data-panel-splitter={testId}
      data-dragging={dragging ? "true" : "false"}
      className={`group relative z-30 touch-none select-none outline-none before:absolute before:inset-y-0 before:-inset-x-2 before:content-[''] focus-visible:ring-2 focus-visible:ring-relume-accent ${dragging ? "bg-relume-accent" : "bg-relume-border hover:bg-relume-accent"} cursor-col-resize ${className}`}
      style={style}
    >
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-relume-ink/40 group-hover:bg-relume-ink/70" />
    </div>
  )
}
