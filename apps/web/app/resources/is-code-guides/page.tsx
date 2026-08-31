import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IS Code Guides - Ferrum OS',
  description: 'A practical radar for Indian construction standards: what to adopt, hold, or drop across IS 1200, CESMM4, IS 456/875/800, and proprietary estimating templates.',
  openGraph: {
    title: 'IS Code Guides - Ferrum OS',
    description: 'A practical radar for Indian construction standards: what to adopt, hold, or drop across IS 1200, CESMM4, IS 456/875/800, and proprietary estimating templates.',
    type: 'article',
    locale: 'en_US',
  },
}

const measurementRows = [
  {
    standard: 'IS 1200',
    use: 'Measurement and billing for civil works',
    stance: 'Adopt',
    note: 'Best fit for Indian BOQ practices, easy to align with site measurement, and familiar to public works teams.',
  },
  {
    standard: 'CESMM4',
    use: 'Civil engineering measurement rules for contract administration',
    stance: 'Hold',
    note: 'Useful as a reference model for method statements and risk allocation, but not a direct replacement for Indian project standards without localization.',
  },
  {
    standard: 'IS 456 / IS 875 / IS 800',
    use: 'Structural and material design controls',
    stance: 'Adopt',
    note: 'These remain the default technical rules for concrete, steel and loading design in Indian execution environments.',
  },
  {
    standard: 'Custom proprietary estimating templates',
    use: 'Internal workflow templates and vendor-specific forms',
    stance: 'Drop',
    note: 'Keep only if they are wrapped by an internal review layer and mapped back to the Indian code baseline.',
  },
];

const steelRadar = [
  {
    category: 'Adopt',
    items: ['IS 800: General construction in steel', 'IS 875: Loading standards', 'IS 2062 / grade-based material procurement'],
  },
  {
    category: 'Hold',
    items: ['Eurocode-derived detailing without Indian compatibility review', 'Vendor-only fabrication assumptions without local QA acceptance'],
  },
  {
    category: 'Drop',
    items: ['Non-Indian steel design sheets used without code mapping', 'Custom rebar or detailing conventions that bypass authority approval'],
  },
];

export default function IsCodeGuidesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Resources</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">IS Code Guides</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            A practical radar for Indian construction standards, including when to adopt, hold, or drop specific code regimes in estimator and design workflows.
          </p>
        </header>

        <section className="mb-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">IS 1200 vs CESMM4</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-sm uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-3 font-semibold">Standard</th>
                  <th className="px-4 py-3 font-semibold">Primary use</th>
                  <th className="px-4 py-3 font-semibold">Stance</th>
                  <th className="px-4 py-3 font-semibold">Decision note</th>
                </tr>
              </thead>
              <tbody>
                {measurementRows.map((row) => (
                  <tr key={row.standard} className="rounded-2xl bg-slate-50 align-top">
                    <td className="rounded-l-2xl border border-slate-200 px-4 py-4 font-semibold text-slate-900">{row.standard}</td>
                    <td className="border-y border-slate-200 px-4 py-4 text-slate-700">{row.use}</td>
                    <td className="border-y border-slate-200 px-4 py-4">
                      <span
                        className={
                          row.stance === 'Adopt'
                            ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800'
                            : row.stance === 'Hold'
                              ? 'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-800'
                              : 'inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-800'
                        }
                      >
                        {row.stance}
                      </span>
                    </td>
                    <td className="rounded-r-2xl border border-slate-200 px-4 py-4 text-slate-700">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {steelRadar.map((group) => (
            <div key={group.category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span
                className={
                  group.category === 'Adopt'
                    ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800'
                    : group.category === 'Hold'
                      ? 'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800'
                      : 'inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800'
                }
              >
                {group.category}
              </span>

              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
