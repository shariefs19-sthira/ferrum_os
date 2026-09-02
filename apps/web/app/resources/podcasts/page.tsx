import Link from 'next/link';

// W2-349 MEDIA_HONESTY: no podcast episode has ever been recorded for
// Ferrum OS. These entries previously presented specific fabricated episode
// counts ("24 episodes", "Bi-weekly") and phrases like "on the record" that
// implied real recorded audio interviews exist — none do. Converted to
// honest topic notes: no episode count, no cadence claim, no implication
// that a recording exists.
const podcasts = [
  {
    slug: 'boq-confessions',
    title: 'BOQ Confessions',
    status: 'Planned',
    summary:
      'Project owners, contractors, and quantity surveyors on the most expensive line items they have gotten wrong, and what the correction cycle looked like.'
  },
  {
    slug: 'site-diaries',
    title: 'Site Diaries',
    status: 'Planned',
    summary:
      'A working project narrated by site engineers — the decisions, weather deviations, and procurement surprises of one ongoing build, through to handover.'
  },
  {
    slug: 'standards-after-five',
    title: 'Standards After Five',
    status: 'Planned',
    summary:
      'How IS Codes, CESMM, NBC, and other standards actually get applied inside Indian project teams — working-practitioner conversations, not academic ones.'
  },
  {
    slug: 'the-procurement-table',
    title: 'The Procurement Table',
    status: 'Planned',
    summary:
      'Procurement discipline: how vendor shortlists get built, how awards get defended after the fact, and how the cycle compresses without cutting corners.'
  }
];

export const metadata = {
  title: 'Podcasts — Ferrum OS Resources',
  description:
    'Planned podcast topics from the Ferrum OS team — no episode has been recorded yet.',
  openGraph: {
    title: 'Podcasts — Ferrum OS Resources',
    description:
      'Planned podcast topics from the Ferrum OS team — no episode has been recorded yet.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function PodcastsPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Podcasts
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Planned podcast topics — no episode has been recorded yet
          </p>
        </div>

        <div className="mb-8 rounded-relume border border-relume-border bg-relume-surface-secondary p-4 text-sm text-relume-muted">
          No podcast episode has been produced. The shows below describe what
          we plan to cover once we do — treat this as a roadmap, not a
          library.
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {podcasts.map((show) => (
            <article key={show.slug} className="border-b border-relume-border pb-8 last:border-b-0 last:pb-0">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink">{show.title}</h2>
                <span className="rounded-full border border-relume-border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
                  {show.status}
                </span>
              </div>
              <p className="mt-3 text-relume-muted">{show.summary}</p>
              <p className="mt-4 text-sm text-relume-muted">
                Reference this topic with its Ferrum OS slug:{' '}
                <code className="font-mono text-relume-muted">{show.slug}</code>
              </p>
            </article>
          ))}

          <div className="pt-4 border-t border-relume-border text-sm text-relume-muted">
            <p>
              Prefer to read or watch? See the{' '}
              <Link href="/resources/blog" className="text-relume-ink hover:underline">
                blog
              </Link>
              ,{' '}
              <Link href="/resources/videos" className="text-relume-ink hover:underline">
                videos
              </Link>
              , or the{' '}
              <Link href="/resources/whitepapers" className="text-relume-ink hover:underline">
                whitepapers
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
