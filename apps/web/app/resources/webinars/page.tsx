// W2-349 MEDIA_HONESTY (RULE 13 extrapolation from videos/podcasts to the
// same defect class here): no webinar has ever been hosted, scheduled, or
// recorded for Ferrum OS. This page previously invented specific named
// employees with fake job titles ("Anita K. — Senior Implementation
// Engineer, Ferrum OS", "Rohan M. — Lead Quantity Surveyor, Ferrum OS",
// "Priya S. — Director, Compliance Practice, Ferrum OS") hosting sessions
// on specific fabricated future calendar dates, plus a fabricated
// "on-demand library" of past-session recordings with invented runtimes.
// This is the same fabrication class as the home-page testimonials W2-345
// removed — invented named individuals — compounded with fake scheduled
// events and a fake recordings archive. Converted to honest topic notes
// with no invented people, no fabricated dates, no claimed recordings.
const plannedTopics = [
  { id: 'wb-001', track: 'Construction operations', title: 'Pre-monsoon concreting: the schedule that actually holds', summary: 'Sequencing pours, curing windows, and inspection holds for the South Asian monsoon.' },
  { id: 'wb-002', track: 'Procurement', title: 'Tender-stage rate analysis with IS 1200 vs CESMM4', summary: 'A side-by-side look at rate-built line items under IS 1200 and CESMM4, and the cost impact of the methodology choice.' },
  { id: 'wb-003', track: 'Compliance', title: 'RERA quarterly reporting without the late-night panic', summary: 'The data inputs and review cadence that keep Form-B, the CAR, and the bank reconciliation aligned.' },
  { id: 'wb-archive-001', track: 'Construction operations', title: 'Site diaries that survive an audit', summary: 'What a site diary needs to record to hold up under audit scrutiny.' },
  { id: 'wb-archive-002', track: 'Tax & finance', title: 'GST classification for builders: the 1% vs 5% decision', summary: 'How the GST rate decision gets made for builder transactions, and what drives it.' },
  { id: 'wb-archive-003', track: 'Tax & finance', title: 'Lender disbursement stages and the working-capital curve', summary: 'How disbursement stages line up against a project’s working-capital needs.' },
  { id: 'wb-archive-004', track: 'Land & feasibility', title: 'Layered geo-referencing with ULPIN', summary: 'Using ULPIN as a base layer for geo-referencing parcel and feasibility data.' }
];

export const metadata = {
  title: 'Webinars — Ferrum OS Resources',
  description: 'Planned webinar topics on construction operations, procurement, compliance, and feasibility — no session has been hosted or recorded yet.'
};

export default function WebinarsPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Webinars</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-5xl">Planned webinar topics</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-relume-muted">No webinar has been hosted or recorded yet. The topics below describe what we plan to cover once we do — treat this as a roadmap, not a schedule or a library.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink">Topics</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plannedTopics.map((w) => (
            <article key={w.id} className="flex flex-col rounded-2xl border border-relume-border bg-white p-6">
              <div className="flex items-center justify-between text-xs text-relume-muted">
                <span className="inline-flex items-center rounded-full bg-relume-surface-secondary px-2.5 py-0.5 font-semibold text-relume-ink">{w.track}</span>
                <span className="rounded-full border border-relume-border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Planned</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-relume-ink">{w.title}</h3>
              <p className="mt-3 text-sm leading-6 text-relume-muted">{w.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
