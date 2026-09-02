import Link from 'next/link';

// W2-349 MEDIA_HONESTY: no video has ever been recorded for Ferrum OS.
// These entries previously presented specific runtimes ("24 min") and
// named speakers ("Aarti Krishnan, head of delivery", "Vikram Iyer,
// principal engineer") who do not exist anywhere else in this codebase —
// fabricated media metadata for footage that was never shot, the same
// class of defect as the fabricated home-page testimonials W2-345 removed.
// Converted to honest topic notes: no runtime, no invented speaker, no
// implication that a recording exists. "status" replaces "length"/"speaker".
const videos = [
  {
    slug: 'boq-drift-walkthrough',
    title: 'BOQ drift walkthrough: estimate, diary, running bill',
    status: 'Planned',
    summary:
      'How an estimate, a site diary, and a running bill can drift apart over the life of a project — and what a reconciliation process to close that gap looks like.'
  },
  {
    slug: 'standards-procurement-roundtable',
    title: 'Standards as a procurement filter',
    status: 'Planned',
    summary:
      'On using IS Code alignment as a vendor-evaluation signal, and how that filter can change award decisions.'
  },
  {
    slug: 'monsoon-concreting-field-clinic',
    title: 'Monsoon concreting field clinic',
    status: 'Planned',
    summary:
      'Applying a monsoon-concreting decision tree to a live pour sequence, with the trade-offs and documentation points that come up on site.'
  },
  {
    slug: 'plot-estimator-demo',
    title: 'Plot estimator demo: feasibility in under ten minutes',
    status: 'Planned',
    summary:
      'A walkthrough of the Ferrum OS plot estimator — input a parcel, a use, and a city, and get a feasibility range plus the assumptions behind it.'
  },
  {
    slug: 'careers-at-ferrum-os',
    title: 'Careers at Ferrum OS: a working day',
    status: 'Planned',
    summary:
      'What a working day at Ferrum OS looks like across engineering, construction, and design.'
  }
];

export const metadata = {
  title: 'Videos — Ferrum OS Resources',
  description:
    'Planned video topics from the Ferrum OS team — no video has been recorded yet.',
  openGraph: {
    title: 'Videos — Ferrum OS Resources',
    description:
      'Planned video topics from the Ferrum OS team — no video has been recorded yet.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Videos
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Planned video topics — no video has been recorded yet
          </p>
        </div>

        <div className="mb-8 rounded-relume border border-relume-border bg-relume-surface-secondary p-4 text-sm text-relume-muted">
          No video content has been produced. The topics below describe what
          we plan to cover once we do — treat this as a roadmap, not a
          library.
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {videos.map((video) => (
            <article key={video.slug} className="border-b border-relume-border pb-8 last:border-b-0 last:pb-0">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink">{video.title}</h2>
                <span className="rounded-full border border-relume-border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
                  {video.status}
                </span>
              </div>
              <p className="mt-3 text-relume-muted">{video.summary}</p>
              <p className="mt-4 text-sm text-relume-muted">
                Reference this topic with its Ferrum OS slug:{' '}
                <code className="font-mono text-relume-muted">{video.slug}</code>
              </p>
            </article>
          ))}

          <div className="pt-4 border-t border-relume-border text-sm text-relume-muted">
            <p>
              Prefer to read? Start with the{' '}
              <Link href="/resources/blog" className="text-relume-ink hover:underline">
                blog
              </Link>{' '}
              or the{' '}
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
