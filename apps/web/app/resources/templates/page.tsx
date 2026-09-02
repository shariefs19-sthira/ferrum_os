import Link from 'next/link';

const templates = [
  { label: 'Feasibility', name: 'Land feasibility one-pager template', summary: 'An indicative structure for separating site observations, assumptions, outstanding evidence, and the next decision.', href: '/assets/templates/land-feasibility-one-pager.pdf' },
  { label: 'Procurement', name: 'Rate-comparison worksheet', summary: 'A printable like-for-like vendor-review worksheet. It does not calculate market rates or recommend a supplier.', href: '/assets/templates/rate-comparison-worksheet.pdf' },
  { label: 'Site', name: 'Daily site diary template', summary: 'A factual daily record for weather, attendance, deliveries, instructions, blockers, and evidence ownership.', href: '/assets/templates/daily-site-diary.pdf' },
  { label: 'Handover', name: 'Project handover checklist', summary: 'An indicative close-out checklist for as-built records, tests, warranties, snags, and operations handover.', href: '/assets/templates/project-handover-checklist.pdf' }
];

export const metadata = { title: 'Templates - Ferrum OS Resources', description: 'Downloadable, indicative templates for land feasibility, procurement comparison, site diaries, and project handover.' };

export default function ResourcesTemplatesPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white"><div className="mx-auto max-w-7xl px-6 py-20 md:px-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Resources / Templates</p><h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">Downloadable working templates</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">Original, indicative working templates for feasibility, procurement comparison, site diaries, and handover. Verify every project-specific fact, rate, and contractual requirement before relying on them.</p></div></section>
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8"><div className="grid gap-6 md:grid-cols-2">{templates.map((item) => <article key={item.name} className="rounded-2xl border border-relume-border bg-white p-6 transition hover:-translate-y-0.5 hover:border-relume-border"><div className="mb-4 flex items-center justify-between gap-3"><div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">{item.label}</div><span className="text-[11px] font-medium uppercase tracking-[0.14em] text-relume-muted">INDICATIVE PDF</span></div><h2 className="text-2xl font-semibold leading-tight text-relume-ink">{item.name}</h2><p className="mt-4 text-sm leading-7 text-relume-muted">{item.summary}</p><div className="mt-6 border-t border-relume-border pt-4"><Link href={item.href} download className="text-sm font-medium text-relume-ink transition hover:text-relume-ink">Download PDF -&gt;</Link></div></article>)}</div><p className="mt-10 max-w-2xl text-sm leading-6 text-relume-muted">Each template is an INDICATIVE starting point, not project-specific advice. Record the source, reviewer, and date for every project decision.</p></section>
    </main>
  );
}
