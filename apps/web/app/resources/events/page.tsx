import Link from 'next/link';

const events = [
  {
    label: 'Webinar',
    date: '2026-09-18',
    city: 'Online',
    name: 'BOQ drift diagnostics for site teams',
    summary:
      'A 60-minute working session on detecting cost and quantity drift between the estimate, the site diary, and the running bill.'
  },
  {
    label: 'Field clinic',
    date: '2026-10-09',
    city: 'Bengaluru',
    name: 'Field clinic: monsoon concreting decision tree',
    summary:
      'On-site walkthrough of the same monsoon-concreting decision tree we publish in our blog, applied to a live pour sequence.'
  },
  {
    label: 'Roundtable',
    date: '2026-11-06',
    city: 'Mumbai',
    name: 'Roundtable: standards as a procurement filter, not a checkbox',
    summary:
      'Closed-door session with developers, contractors, and PMC leads on using IS Code alignment as a vendor-evaluation signal.'
  }
];

export const metadata = {
  title: 'Events — Ferrum OS Resources',
  description:
    'Upcoming webinars, field clinics, and roundtables where the Ferrum OS team works through land, design, and delivery decisions in public.',
  openGraph: {
    title: 'Events — Ferrum OS Resources',
    description:
      'Upcoming webinars, field clinics, and roundtables from the Ferrum OS team.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function ResourcesEventsPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Resources · Events</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            Working sessions, not slide decks
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            Webinars, field clinics, and roundtables where the team walks through real land, design, and delivery
            decisions. Each session is built around a working artefact — a BOQ, a memo, a decision tree — not a
            product pitch.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {events.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-relume-border bg-white p-6 transition hover:-translate-y-0.5 hover:border border-relume-border"
            >
              <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {item.label}
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-relume-muted">
                {item.date} · {item.city}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-relume-ink">{item.name}</h2>
              <p className="mt-4 text-sm leading-7 text-relume-muted">{item.summary}</p>
              <div className="mt-6 border-t border-relume-border pt-4">
                <Link
                  href="/contact"
                  className="text-sm font-medium text-relume-ink transition hover:text-relume-ink"
                >
                  Request seat →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-6 text-relume-muted">
          Sessions are free for working teams in land, design, and delivery. Recording links and written summaries
          are published under{' '}
          <Link href="/resources/blog" className="text-relume-ink hover:text-relume-ink">
            the blog
          </Link>{' '}
          after each event.
        </p>
      </section>
    </main>
  );
}
