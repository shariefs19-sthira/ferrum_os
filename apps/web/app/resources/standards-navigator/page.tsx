import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { STANDARDS } from '../../../lib/resources/registry'

// Adopt/Hold/Drop keep semantic emerald/amber/rose coding — the color carries real
// decision meaning here, unlike the decorative badges restyled to relume-ink elsewhere.
function stanceClass(stance: string) {
  if (stance === 'Adopt') return 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800'
  if (stance === 'Hold') return 'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-800'
  return 'inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-800'
}

export default function StandardsNavigatorPage() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-3xl">
          <Eyebrow>Resources</Eyebrow>
          <SectionHeading as="h1" className="mt-4">Standards Navigator</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A practical radar for Indian construction standards, including when to adopt, hold, or
            drop specific code regimes in estimator and design workflows. This page explains scope
            and adoption stance only -- it does not reproduce proprietary BIS/NBC/IS clause text.
            For the actual standard, use the official publisher links below.
          </p>
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong className="font-semibold">Evidence boundary:</strong> every Adopt / Hold / Drop
            stance below is Ferrum OS&rsquo;s own workflow-fit recommendation, not a statement of a
            standard&rsquo;s technical merit, legal status, or universal applicability. A different
            project context can reasonably reach a different stance -- these are starting points
            for a team&rsquo;s own review, not a verdict from the standards body itself.
          </div>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="rounded-lg border border-relume-border bg-relume-surface p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-relume-tight text-relume-ink">Standards covered</h2>
          <ul className="mt-6 space-y-4">
            {STANDARDS.map((standard) => (
              <li key={standard.code} className="rounded-lg border border-relume-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-relume-ink">{standard.code}</p>
                  <span className={stanceClass(standard.stance)}>{standard.stance}</span>
                </div>
                <p className="mt-2 text-sm text-relume-ink"><span className="font-medium">Primary use: </span>{standard.use}</p>
                <p className="mt-2 text-sm text-relume-ink"><span className="font-medium">Ferrum workflow note: </span>{standard.note}</p>
                <p className="mt-3 text-xs text-relume-muted">
                  <span className="font-medium text-relume-ink">Publisher: </span>{standard.publisher}
                </p>
                {/* A <div>, not a <p>: main p a { white-space: nowrap } (app/globals.css,
                    W2-363) is meant for short "Read more →" style links inside prose
                    paragraphs -- applied to this row's long source-label anchor text it
                    forced a single unbreakable line and overflowed at 375px. */}
                <div className="mt-1 text-xs text-relume-muted">
                  <span className="font-medium text-relume-ink">Source: </span>
                  <a
                    href={standard.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline underline-offset-4"
                  >
                    {standard.sourceLabel}
                  </a>
                </div>
                <p className="mt-1 text-xs text-relume-muted">
                  <span className="font-medium text-relume-ink">Edition / currency: </span>{standard.editionNote}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="max-w-3xl space-y-4">
          <div className="rounded-lg border border-relume-border bg-relume-surface p-6 text-sm leading-6 text-relume-muted sm:p-8">
            <strong className="font-semibold text-relume-ink">Note on CESMM4:</strong> earlier
            versions of this page discussed CESMM4 alongside the standards above. It has been
            removed from this sourced list because Ferrum OS has not verified an official ICES
            (Institution of Civil Engineering Surveyors) publication link for it -- an unverified
            source doesn&rsquo;t meet the bar every other entry here holds to. CESMM4 is still
            discussed, informally and as an article rather than a sourced standard, in{' '}
            <a href="/resources/blog/is-1200-vs-cesmm4" className="underline underline-offset-4">
              IS 1200 vs CESMM4
            </a>
            .
          </div>
          <div className="rounded-lg border border-relume-border bg-relume-surface p-6 text-sm leading-6 text-relume-muted sm:p-8">
            <strong className="font-semibold text-relume-ink">Note on IS 1200:</strong> earlier
            versions of this page also discussed IS 1200 as a single, series-wide entry. BIS
            publishes IS 1200 as a series of individually numbered parts, and Ferrum OS does not
            hold a verified official link to the specific part a series-wide entry would need to
            cite -- so it has been removed rather than sourced to just one part while implying
            coverage of the whole series. IS 1200 is still discussed, informally and as an
            article, in{' '}
            <a href="/resources/blog/is-1200-vs-cesmm4" className="underline underline-offset-4">
              IS 1200 vs CESMM4
            </a>
            .
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
