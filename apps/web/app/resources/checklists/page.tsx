import Link from 'next/link';
import PrintButton from '../../../components/PrintButton';

const checklists = [
  {
    name: 'Structural Punch List',
    href: '/resources/checklists/structural-punch-list',
    summary: 'A closeout checklist for structural handover: foundation, superstructure, and closeout documentation.'
  },
  {
    name: 'Retrofit Handover',
    href: '/resources/checklists/retrofit-handover',
    summary: 'Closing out a seismic or structural retrofit on an occupied building: structural sign-off, access, and owner handback.'
  },
  {
    name: 'Handover Documents',
    href: '/resources/checklists/handover-documents',
    summary: 'The document package a clean project handover needs: as-built records, compliance certification, and owner handback.'
  },
  {
    name: 'Concrete Pour Readiness',
    href: '/resources/checklists/concrete-pour-readiness',
    summary: 'A pre-pour readiness checklist: formwork and reinforcement, concrete and site conditions, and sign-off records.'
  }
];

export const metadata = {
  title: 'Checklists — Ferrum OS Resources',
  description: 'Site-ready checklists for structural handover, retrofit closeout, project handover documents, and concrete pour readiness.',
  openGraph: {
    title: 'Checklists — Ferrum OS Resources',
    description: 'Site-ready checklists for structural handover, retrofit closeout, project handover documents, and concrete pour readiness.',
    type: 'article',
    locale: 'en_US'
  }
};

export default function ResourcesChecklistsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Resources · Checklists</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Site-ready checklists
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Structural handover, retrofit closeout, project documentation, and pre-pour readiness — each one built to
            be printed and carried to site.
          </p>
          <div className="mt-8">
            <PrintButton />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {checklists.map((checklist) => (
            <article
              key={checklist.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-2xl font-semibold leading-tight text-slate-900">{checklist.name}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{checklist.summary}</p>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <Link
                  href={checklist.href}
                  className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
                >
                  Open {checklist.name.toLowerCase()} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
