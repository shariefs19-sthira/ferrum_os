import Link from 'next/link';

const podcasts = [
  {
    slug: 'boq-confessions',
    title: 'BOQ Confessions',
    episodes: 24,
    cadence: 'Bi-weekly',
    summary:
      'A bi-weekly audio series where project owners, contractors, and quantity surveyors talk — on the record — about the most expensive line items they have ever got wrong, and what the correction cycle looked like.'
  },
  {
    slug: 'site-diaries',
    title: 'Site Diaries',
    episodes: 18,
    cadence: 'Weekly',
    summary:
      'A weekly audio series narrated by working site engineers, recording the actual decisions, weather deviations, and procurement surprises of one ongoing project, week by week, until handover.'
  },
  {
    slug: 'standards-after-five',
    title: 'Standards After Five',
    episodes: 12,
    cadence: 'Monthly',
    summary:
      'A monthly long-form interview series on how IS Codes, CESMM, NBC, and other standards actually get applied inside Indian project teams — with a strict no-academia rule and a working-practitioner guest list.'
  },
  {
    slug: 'the-procurement-table',
    title: 'The Procurement Table',
    episodes: 9,
    cadence: 'Monthly',
    summary:
      'A monthly audio series on procurement discipline: how vendor shortlists are built, how awards are defended after the fact, and how the cycle is compressed without cutting corners.'
  }
];

export const metadata = {
  title: 'Podcasts — Ferrum OS Resources',
  description:
    'Audio series from the Ferrum OS team on cost, schedule, standards, and procurement discipline, recorded in working teams, not in studios.',
  openGraph: {
    title: 'Podcasts — Ferrum OS Resources',
    description:
      'Audio series from the Ferrum OS team on cost, schedule, standards, and procurement discipline.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function PodcastsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Podcasts
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Audio series on cost, schedule, standards, and procurement discipline
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {podcasts.map((show) => (
            <article key={show.slug} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{show.title}</h2>
                <span className="text-sm font-medium text-gray-500">
                  {show.episodes} episodes · {show.cadence}
                </span>
              </div>
              <p className="mt-3 text-gray-600">{show.summary}</p>
              <p className="mt-4 text-sm text-gray-500">
                Reference this show with its Ferrum OS slug:{' '}
                <code className="font-mono text-gray-700">{show.slug}</code>
              </p>
            </article>
          ))}

          <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              Prefer to read or watch? See the{' '}
              <Link href="/resources/blog" className="text-blue-700 hover:underline">
                blog
              </Link>
              ,{' '}
              <Link href="/resources/videos" className="text-blue-700 hover:underline">
                videos
              </Link>
              , or the{' '}
              <Link href="/resources/whitepapers" className="text-blue-700 hover:underline">
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
