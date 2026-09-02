import Link from 'next/link';

// W2-349 MEDIA_HONESTY (RULE 13 extrapolation): presented three specific
// calendar dates as a confirmed "2026 webinar schedule" — no webinar has
// actually been organized or confirmed for any date. Milder than the
// fabricated-named-hosts instance on /resources/webinars (no invented
// people here), but the same defect class: implying a real, scheduled
// event exists when it doesn't. Dates removed, framing changed from a
// confirmed schedule to a planned-topics list.
const webinarTopics = [
  {
    name: 'BOQ drift diagnostics for site teams',
    summary:
      'Detecting cost and quantity drift between the estimate, the site diary, and the running bill.'
  },
  {
    name: 'Formwork pressure calculation, worked through live',
    summary:
      'Calculating design lateral pressure for wall and column pours, with pour-rate and temperature scenarios.'
  },
  {
    name: 'Reading a foundation assessment before you budget',
    summary:
      'How to read a geotechnical assessment and translate it into a realistic foundation retrofit budget.'
  }
];

export const metadata = {
  title: 'Webinar Topics — Ferrum OS Resources',
  description: 'Planned webinar topics — BOQ drift diagnostics, formwork pressure calculation, and foundation assessment budgeting. No session has been scheduled or confirmed yet.',
  openGraph: {
    title: 'Webinar Topics — Ferrum OS Resources',
    description: 'Planned webinar topics — no session has been scheduled or confirmed yet.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function Webinars2026Page() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Resources · Events</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            Planned webinar topics
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            No webinar has been scheduled or confirmed yet. These are the topics we plan to build sessions
            around once we do — each around a real artefact (a BOQ, a calculation, a report), not a product pitch.
          </p>
          <div className="mt-8">
            <Link
              href="/resources/events"
              className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink"
            >
              All events (webinars, field clinics, roundtables)
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {webinarTopics.map((item) => (
            <Link key={item.name} href="/contact" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-relume-ink">
              <article className="h-full rounded-2xl border border-relume-border bg-white p-6 transition hover:-translate-y-0.5 hover:border-relume-ink/40">
                <div className="mb-4 inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
                  Planned
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
      </section>
    </main>
  );
}
