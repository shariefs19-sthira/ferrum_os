const upcoming = [
  { id: 'wb-001', date: '2026-09-18', time: '15:00 IST', duration: '60 min', title: 'Pre-monsoon concreting: the schedule that actually holds', track: 'Construction operations', speaker: 'Anita K. — Senior Implementation Engineer, Ferrum OS', summary: 'A working session on sequencing pours, curing windows, and inspection holds for the South Asian monsoon. We walk through a real 12-tower schedule and the seven decision points that decide whether the pour happens on day three or slips a week.' },
  { id: 'wb-002', date: '2026-10-02', time: '11:00 IST', duration: '45 min', title: 'Tender-stage rate analysis with IS 1200 vs CESMM4', track: 'Procurement', speaker: 'Rohan M. — Lead Quantity Surveyor, Ferrum OS', summary: 'A side-by-side walkthrough of two rate-built line items (earthwork and RCC M25) under IS 1200 and CESMM4, including the cost-impact of the methodology choice on the same project estimate.' },
  { id: 'wb-003', date: '2026-10-22', time: '16:30 IST', duration: '60 min', title: 'RERA quarterly reporting without the late-night panic', track: 'Compliance', speaker: 'Priya S. — Director, Compliance Practice, Ferrum OS', summary: 'A practical session on the data inputs and review cadence that keep Form-B, the CAR, and the bank reconciliation aligned. Includes a checklist that maps each RERA upload to the Ferrum OS artefact that produces it.' }
];

const onDemand = [
  { id: 'wb-archive-001', length: '38 min', title: 'Site diaries that survive an audit', track: 'Construction operations' },
  { id: 'wb-archive-002', length: '52 min', title: 'GST classification for builders: the 1% vs 5% decision', track: 'Tax & finance' },
  { id: 'wb-archive-003', length: '41 min', title: 'Lender disbursement stages and the working-capital curve', track: 'Tax & finance' },
  { id: 'wb-archive-004', length: '47 min', title: 'Layered geo-referencing with ULPIN', track: 'Land & feasibility' }
];

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

export const metadata = {
  title: 'Webinars — Ferrum OS Resources',
  description: 'Upcoming live sessions and on-demand recordings on construction operations, procurement, compliance, and feasibility — hosted by the Ferrum OS practice team.'
};

export default function WebinarsPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Webinars</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-5xl">Live sessions and on-demand recordings</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-relume-muted">The Ferrum OS practice team hosts working sessions on the operational, financial, and compliance questions that show up in real projects. Register for an upcoming live session or watch a recording.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <h2 className="text-2xl font-bold text-relume-ink">Upcoming live sessions</h2>
        <p className="mt-1 text-sm text-relume-muted">All times shown in India Standard Time. Sessions are recorded and added to the on-demand library within 48 hours.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {upcoming.map((w) => (
            <article key={w.id} className="flex flex-col rounded-2xl border border-relume-border bg-white p-6">
              <div className="flex items-center justify-between text-xs text-relume-muted">
                <span className="inline-flex items-center rounded-full bg-relume-surface-secondary px-2.5 py-0.5 font-semibold text-relume-ink">{w.track}</span>
                <span>{w.duration}</span>
              </div>
              <p className="mt-4 text-sm font-medium text-relume-ink">{formatDate(w.date)} · {w.time}</p>
              <h3 className="mt-2 text-lg font-semibold text-relume-ink">{w.title}</h3>
              <p className="mt-3 text-sm leading-6 text-relume-muted">{w.summary}</p>
              <p className="mt-4 text-xs text-relume-muted">Hosted by {w.speaker}</p>
              <div className="mt-6 pt-4 border-t border-relume-border">
                <a href={`mailto:webinars@ferrum_os.com?subject=Register%20for%20${w.id}`} className="inline-flex items-center text-sm font-semibold text-relume-ink hover:text-relume-ink">Register for this session →</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-relume-border">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <h2 className="text-2xl font-bold text-relume-ink">On-demand library</h2>
          <p className="mt-1 text-sm text-relume-muted">Recordings of past sessions. Drop in for the relevant minute.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {onDemand.map((w) => (
              <a key={w.id} href={`mailto:webinars@ferrum_os.com?subject=Recording%20request%3A%20${encodeURIComponent(w.id)}`} className="flex items-center justify-between rounded-xl border border-relume-border bg-relume-surface-secondary px-5 py-4 hover:border-relume-border hover:bg-white">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-relume-muted">{w.track} · {w.length}</p>
                  <p className="mt-1 text-sm font-semibold text-relume-ink">{w.title}</p>
                </div>
                <span className="text-relume-ink text-sm font-semibold">Request recording →</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
