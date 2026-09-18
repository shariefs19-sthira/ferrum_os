"use client"

import Link from 'next/link'
import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import type { FeatureAvailability } from '../../lib/productFeatureRegistry'

export type HomepageJourneyFeature = {
  title: string
  body: string
  availability: FeatureAvailability
}

export type HomepageJourneyStep = {
  id: string
  title: string
  summary: string
  productLabel: string
  productHref: string
  features: HomepageJourneyFeature[]
}

type HomepageJourneyProps = {
  items: HomepageJourneyStep[]
  intervalMs?: number
}

const statusLabel: Record<FeatureAvailability, string> = {
  AVAILABLE: 'LIVE',
  ROADMAP: 'ROADMAP',
  TEST_MODE: 'TEST MODE',
}

export default function HomepageJourney({ items, intervalMs = 7000 }: HomepageJourneyProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [timerVersion, setTimerVersion] = useState(0)
  const [pausedByUser, setPausedByUser] = useState(false)
  const [interactionPaused, setInteractionPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(Boolean(media?.matches))
    syncPreference()
    media?.addEventListener?.('change', syncPreference)
    return () => media?.removeEventListener?.('change', syncPreference)
  }, [])

  const isPaused = reducedMotion || pausedByUser || interactionPaused

  useEffect(() => {
    if (isPaused || items.length < 2) return
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % items.length)
      setTimerVersion((version) => version + 1)
    }, intervalMs)
    return () => window.clearTimeout(timer)
  }, [activeIndex, intervalMs, isPaused, items.length, timerVersion])

  if (items.length === 0) return null

  const active = items[activeIndex]
  const activeStatus = active.features.some((feature) => feature.availability === 'ROADMAP')
    ? 'ROADMAP'
    : active.features.some((feature) => feature.availability === 'TEST_MODE')
      ? 'TEST_MODE'
      : 'AVAILABLE'

  function selectStep(index: number, moveFocus = false) {
    setActiveIndex(index)
    setTimerVersion((version) => version + 1)
    if (moveFocus) tabRefs.current[index]?.focus()
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % items.length
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + items.length) % items.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = items.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    selectStep(nextIndex, true)
  }

  return (
    <div
      className="mt-10 grid min-w-0 gap-5 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] lg:gap-8"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteractionPaused(false)
      }}
      data-homepage-journey
    >
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
            Step {activeIndex + 1} of {items.length}
          </p>
          <button
            type="button"
            className="min-h-11 rounded-full border border-relume-border px-4 text-xs font-medium text-relume-ink transition-colors hover:bg-relume-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
            onClick={() => setPausedByUser((paused) => !paused)}
            aria-pressed={pausedByUser}
          >
            {reducedMotion ? 'Auto-play off' : pausedByUser ? 'Resume steps' : 'Pause steps'}
          </button>
        </div>

        <div role="tablist" aria-label="Project delivery steps" aria-orientation="vertical" className="space-y-2">
          {items.map((item, index) => {
            const selected = index === activeIndex
            return (
              <button
                key={item.id}
                ref={(node) => { tabRefs.current[index] = node }}
                id={`journey-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`journey-panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectStep(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`grid min-h-20 w-full min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3 rounded-relume border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${
                  selected
                    ? 'border-relume-command bg-relume-command text-white'
                    : 'border-relume-border bg-relume-surface text-relume-ink hover:bg-relume-surface-muted'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-10 w-10 place-items-center rounded-full border font-mono text-xs ${selected ? 'border-white/40' : 'border-relume-border'}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className={`block text-xs font-semibold uppercase tracking-[0.14em] ${selected ? 'text-white/70' : 'text-relume-muted'}`}>
                    {item.productLabel}
                  </span>
                  <span className="mt-1 block text-base font-semibold tracking-relume-tight">{item.title}</span>
                  <span className={`mt-1 block text-sm leading-5 ${selected ? 'text-white/80' : 'text-relume-muted'}`}>
                    {item.summary}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <section
        id={`journey-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`journey-tab-${active.id}`}
        aria-live={isPaused ? 'polite' : 'off'}
        className="min-w-0 rounded-relume border border-relume-border bg-relume-surface p-5 sm:p-7 lg:min-h-[31rem]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-relume-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Highlighted product</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-relume-tight text-relume-ink sm:text-3xl">
              {active.productLabel}
            </h3>
          </div>
          <span className="rounded-full border border-relume-border px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.12em] text-relume-ink">
            {statusLabel[activeStatus]}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {active.features.map((feature) => (
            <article key={feature.title} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-semibold tracking-relume-tight text-relume-ink">{feature.title}</h4>
                <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-relume-muted">
                  {statusLabel[feature.availability]}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-relume-muted">{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-relume-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-relume-muted">
            {reducedMotion
              ? 'Automatic step changes are disabled by your motion preference.'
              : isPaused
                ? 'Automatic step changes are paused while you read or interact.'
                : `Next step appears automatically after ${Math.round(intervalMs / 1000)} seconds.`}
          </p>
          <Link
            href={active.productHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-relume-ink px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
          >
            Explore {active.productLabel}
          </Link>
        </div>
      </section>
    </div>
  )
}
