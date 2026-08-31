import Link from 'next/link';

const webinars2026 = [
  {
    date: '2026-09-18',
    name: 'BOQ drift diagnostics for site teams',
    summary:
      'A 60-minute working session on detecting cost and quantity drift between the estimate, the site diary, and the running bill.'
  },
  {
    date: '2026-11-20',
    name: 'Formwork pressure calculation, worked through live',
    summary:
      'A working session on calculating design lateral pressure for wall and column pours, with pour-rate and temperature scenarios worked through on screen.'
  },
  {
    date: '2027-01-15',
    name: 'Reading a foundation assessment before you budget',
    summary:
      'How to read a geotechnical assessment and translate it into a realistic foundation retrofit budget, with a worked cost-driver breakdown.'
  }
];

export const metadata = {
  title: 'Webinars 2026 — Ferrum OS Resources',
  description: 'The 2026 webinar schedule: working sessions on BOQ drift diagnostics, formwork pressure calculation, and foundation assessment budgeting.',
  openGraph: {
    title: 'Webinars 2026 — Ferrum OS Resources',
    description: 'The 2026 webinar schedule: working sessions on BOQ drift diagnostics, formwork pressure calculation, and foundation assessment budgeting.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function Webinars2026Page() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Resources · Events</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            2026 webinar schedule
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Online-only working sessions, each built around a real artefact — a BOQ, a calculation, a report —
            not a product pitch.
          </p>
          <div className="mt-8">
            <Link
              href="/resources/events"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              All events (webinars, field clinics, roundtables)
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {webinars2026.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Webinar
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.date} · Online</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900">{item.name}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <Link
                  href="/contact"
                  className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
                >
                  Request seat →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
