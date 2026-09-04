"use client"

import BrandMark from './BrandMark'

const features = [
  'Explore product tools without creating an account',
  'Keep credentials off this preview release',
  'Move into the Project Workspace immediately',
]

export default function PreviewGate() {
  const enterPreview = () => {
    window.localStorage.setItem('ferrum-preview-session', 'active')
    window.location.href = '/project-workspace'
  }

  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-12 md:px-8 lg:grid-cols-2">
        <section className="rounded-relume border border-relume-border bg-white p-8 md:p-10" data-preview-gate>
          <div className="flex items-center gap-3">
            <BrandMark size={40} />
            <span className="text-lg font-semibold">Ferrum OS</span>
          </div>
          <span className="mt-8 inline-flex min-h-7 items-center rounded-full border border-relume-accent bg-orange-50 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-command">
            Preview
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-relume-tight md:text-5xl">
            Accounts arrive with the live release — explore everything now in preview
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-relume-muted">
            This release does not ask for your name, email, password, or payment details.
            Preview access is a local browser flag only and creates no account or cloud session.
          </p>
          <button type="button" onClick={enterPreview} className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-relume-command px-6 text-sm font-semibold text-white transition hover:bg-relume-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-command">
            Enter preview
          </button>
        </section>

        <aside className="command-surface rounded-relume border p-8 text-white" aria-label="Preview access details">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">Credential-free release</p>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-relume-tight text-white">Inspect the platform before accounts open</h2>
          <ul className="mt-8 space-y-4">
            {features.map((feature) => <li key={feature} className="flex gap-3 text-sm leading-6 text-white/75"><span aria-hidden="true" className="text-relume-accent">●</span>{feature}</li>)}
          </ul>
        </aside>
      </div>
      <style>{`
        body:has([data-preview-gate]) > header,
        body:has([data-preview-gate]) > footer,
        body:has([data-preview-gate]) > aside[aria-label="Cookie consent"],
        body:has([data-preview-gate]) > button[aria-label="Open Ferrum OS concierge"] {
          display: none;
        }
      `}</style>
    </main>
  )
}
