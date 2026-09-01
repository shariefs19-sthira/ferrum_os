import { Metadata } from 'next'
import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'

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
]

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
]

// Adopt/Hold/Drop keep semantic emerald/amber/rose coding — the color carries real
// decision meaning here, unlike the decorative badges restyled to relume-ink elsewhere.
function stanceClass(stance: string) {
  if (stance === 'Adopt') return 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800'
  if (stance === 'Hold') return 'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-800'
  return 'inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-800'
}

export default function IsCodeGuidesPage() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-3xl">
          <Eyebrow>Resources</Eyebrow>
          <SectionHeading as="h1" className="mt-4">IS Code Guides</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A practical radar for Indian construction standards, including when to adopt, hold, or drop specific code regimes in estimator and design workflows.
          </p>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="rounded-lg border border-relume-border bg-relume-surface p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-relume-tight text-relume-ink">IS 1200 vs CESMM4</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-sm uppercase tracking-[0.12em] text-relume-ink">
                  <th className="px-4 py-3 font-semibold">Standard</th>
                  <th className="px-4 py-3 font-semibold">Primary use</th>
                  <th className="px-4 py-3 font-semibold">Stance</th>
                  <th className="px-4 py-3 font-semibold">Decision note</th>
                </tr>
              </thead>
              <tbody>
                {measurementRows.map((row) => (
                  <tr key={row.standard} className="align-top">
                    <td className="rounded-l-lg border border-relume-border px-4 py-4 font-semibold text-relume-ink">{row.standard}</td>
                    <td className="border-y border-relume-border px-4 py-4 text-relume-ink">{row.use}</td>
                    <td className="border-y border-relume-border px-4 py-4">
                      <span className={stanceClass(row.stance)}>{row.stance}</span>
                    </td>
                    <td className="rounded-r-lg border border-relume-border px-4 py-4 text-relume-ink">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-6 lg:grid-cols-3">
          {steelRadar.map((group) => (
            <div key={group.category} className="rounded-lg border border-relume-border bg-relume-surface p-6">
              <span className={stanceClass(group.category)}>{group.category}</span>

              <ul className="mt-5 space-y-3 text-sm leading-6 text-relume-ink">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-relume-ink" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionShell>
    </main>
  )
}
