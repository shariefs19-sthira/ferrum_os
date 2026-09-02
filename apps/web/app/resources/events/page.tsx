import Link from 'next/link';

// W2-349 MEDIA_HONESTY (RULE 13 extrapolation): presented specific dates
// and cities (Bengaluru, Mumbai) for a webinar, field clinic, and
// roundtable, as if confirmed events — none have been organized, held, or
// scheduled. Dates/cities removed, framing changed to planned topics.
const events = [
  {
    label: 'Webinar',
    name: 'BOQ drift diagnostics for site teams',
    summary:
      'A working session on detecting cost and quantity drift between the estimate, the site diary, and the running bill.'
  },
  {
    label: 'Field clinic',
    name: 'Field clinic: monsoon concreting decision tree',
    summary:
      'On-site walkthrough of the same monsoon-concreting decision tree we publish in our blog, applied to a live pour sequence.'
  },
  {
    label: 'Roundtable',
    name: 'Roundtable: standards as a procurement filter, not a checkbox',
    summary:
      'A session with developers, contractors, and PMC leads on using IS Code alignment as a vendor-evaluation signal.'
  }
];

export const metadata = {
  title: 'Event Topics — Ferrum OS Resources',
  description:
    'Planned webinars, field clinics, and roundtables — no session has been scheduled or confirmed yet.',
  openGraph: {
    title: 'Event Topics — Ferrum OS Resources',
    description:
      'Planned webinars, field clinics, and roundtables — no session has been scheduled or confirmed yet.',
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
            Planned event topics
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            No webinar, field clinic, or roundtable has been scheduled or held yet. These are the topics we plan
            to build sessions around — each around a working artefact (a BOQ, a memo, a decision tree), not a
            product pitch.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {events.map((item) => (
            <Link key={item.name} href="/contact" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-relume-ink">
              <article className="h-full rounded-2xl border border-relume-border bg-white p-6 transition hover:-translate-y-0.5 hover:border-relume-ink/40">
                <div className="mb-4 inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
                  {item.label} · Planned
                </div>
                <h2 className="mt-3 text-2xl font-semibold leading-tight text-relume-ink">{item.name}</h2>
                <p className="mt-4 text-sm leading-7 text-relume-muted">{item.summary}</p>
                <div className="mt-6 border-t border-relume-border pt-4">
                  <span className="text-sm font-medium text-relume-ink">
                  Ask about this topic →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-6 text-relume-muted">
          None of these have been scheduled yet. Our written content on these topics lives in{' '}
          <Link href="/resources/blog" className="text-relume-ink hover:text-relume-ink">
            the blog
          </Link>{' '}
          today.
        </p>
      </section>
    </main>
  );
}
