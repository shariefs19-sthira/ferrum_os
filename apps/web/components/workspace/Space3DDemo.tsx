"use client"

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { generateStudioPlan } from '../../lib/plan-gen'
import type { StudioParameters } from '../../lib/types'

const Space3D = dynamic(() => import('./Space3D'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-relume-surface-secondary text-sm text-relume-muted">Loading demonstration…</div>,
})

const sequence: Array<{ label: string; parameters: StudioParameters }> = [
  { label: 'Add one floor', parameters: { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 4 } },
  { label: 'Increase setback to 3 m', parameters: { plotWidthM: 20, plotDepthM: 30, setbackM: 3, floors: 4 } },
  { label: 'Widen plot to 24 m', parameters: { plotWidthM: 24, plotDepthM: 30, setbackM: 3, floors: 4 } },
  { label: 'Return to base massing', parameters: { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 } },
]

export default function Space3DDemo({ intervalMs = 2200 }: { intervalMs?: number }) {
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const plan = useMemo(() => generateStudioPlan(sequence[step].parameters), [step])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPaused(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => setStep(current => (current + 1) % sequence.length), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs, paused])

  return (
    <figure className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface" data-space-demo-embed data-demo-paused={paused}>
      <div className="h-[30rem]"><Space3D plan={plan} demoMode /></div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-relume-border px-4 py-3 text-xs text-relume-muted" aria-live="polite">
        <span><strong className="text-relume-command">Demo intent:</strong> {paused ? 'Paused for reduced-motion preference' : sequence[step].label}</span>
        <span className="font-semibold uppercase tracking-[0.12em] text-relume-command">INDICATIVE · low-cost profile</span>
      </figcaption>
    </figure>
  )
}
