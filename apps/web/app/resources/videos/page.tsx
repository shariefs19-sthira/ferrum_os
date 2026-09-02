import Link from 'next/link';

const videos = [
  {
    slug: 'boq-drift-walkthrough',
    title: 'BOQ drift walkthrough: estimate, diary, running bill',
    length: '24 min',
    speaker: 'Aarti Krishnan, head of delivery',
    summary:
      'A narrated walkthrough of one mid-rise residential project where the estimate, the site diary, and the running bill drifted apart over five months — and the reconciliation process that closed the gap.'
  },
  {
    slug: 'standards-procurement-roundtable',
    title: 'Standards as a procurement filter (roundtable)',
    length: '52 min',
    speaker: 'Developers, contractors, and PMC leads',
    summary:
      'A 52-minute closed-door roundtable on using IS Code alignment as a vendor-evaluation signal. Three project owners describe what changed in their award decisions after the filter was introduced.'
  },
  {
    slug: 'monsoon-concreting-field-clinic',
    title: 'Monsoon concreting field clinic, Bengaluru',
    length: '38 min',
    speaker: 'Vikram Iyer, principal engineer',
    summary:
      'Footage from an on-site field clinic applying the monsoon-concreting decision tree to a live pour sequence, with a running commentary on the trade-offs and documentation points.'
  },
  {
    slug: 'plot-estimator-demo',
    title: 'Plot estimator demo: feasibility in under ten minutes',
    length: '9 min',
    speaker: 'Ferrum OS product team',
    summary:
      'A short demo of the Ferrum OS plot estimator — input a parcel, a use, and a city, and walk out with a feasibility range and a short list of the assumptions behind it.'
  },
  {
    slug: 'careers-at-ferrum-os',
    title: 'Careers at Ferrum OS: a working day',
    length: '6 min',
    speaker: 'Ferrum OS team',
    summary:
      'Six minutes with the people who build Ferrum OS — what a working day looks like, what we argue about, and what we expect from new joiners across engineering, construction, and design.'
  }
];

export const metadata = {
  title: 'Videos — Ferrum OS Resources',
  description:
    'Recorded walkthroughs, roundtables, field-clinic footage, and product demos from the Ferrum OS team.',
  openGraph: {
    title: 'Videos — Ferrum OS Resources',
    description:
      'Recorded walkthroughs, roundtables, field clinics, and product demos from the Ferrum OS team.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-relume-ink sm:text-5xl">
            Videos
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Recorded walkthroughs, roundtables, and product demos
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {videos.map((video) => (
            <article key={video.slug} className="border-b border-relume-border pb-8 last:border-b-0 last:pb-0">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h2 className="text-2xl font-bold text-relume-ink">{video.title}</h2>
                <span className="text-sm font-medium text-relume-muted">{video.length}</span>
              </div>
              <p className="mt-2 text-sm text-relume-muted">{video.speaker}</p>
              <p className="mt-3 text-relume-muted">{video.summary}</p>
              <p className="mt-4 text-sm text-relume-muted">
                Reference this video with its Ferrum OS slug:{' '}
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
