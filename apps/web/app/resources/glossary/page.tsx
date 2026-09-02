import Link from 'next/link';

type Term = {
  term: string;
  short: string;
  detail: string;
};

type Group = {
  letter: string;
  items: Term[];
};

const groups: Group[] = [
  {
    letter: 'B',
    items: [
      {
        term: 'BOQ',
        short: 'Bill of Quantities',
        detail: 'A structured document listing every work item, quantity, and rate used to price, procure, and measure a construction project.'
      }
    ]
  },
  {
    letter: 'C',
    items: [
      {
        term: 'CESMM4',
        short: 'Civil Engineering Standard Method of Measurement, 4th edition',
        detail: 'A UK-origin method-of-measurement standard often used as a reference model for civil works, method statements, and risk allocation. In India it is usually held as a reference rather than a direct replacement for IS 1200.'
      },
      {
        term: 'Curing',
        short: 'Controlled moisture and temperature regime for concrete',
        detail: 'Keeping concrete moist and at a stable temperature after placement so cement hydration proceeds properly. Critical for strength, durability, and finish quality, especially during monsoon pours.'
      }
    ]
  },
  {
    letter: 'I',
    items: [
      {
        term: 'IS 1200',
        short: 'Indian Standard method of measurement for civil works',
        detail: 'The most common method-of-measurement standard for Indian BOQs. Familiar to public-works teams, easy to align with site measurement, and the default baseline for civil and structural estimating.'
      },
      {
        term: 'IS 456',
        short: 'Indian Standard for plain and reinforced concrete',
        detail: 'Code of practice for concrete design and construction in India. Covers material, durability, structural, and detailing requirements.'
      },
      {
        term: 'IS 800',
        short: 'Indian Standard for general construction in steel',
        detail: 'Code of practice for structural steel design. Used as the default for steel buildings, towers, and industrial structures in India.'
      },
      {
        term: 'IS 875',
        short: 'Indian Standard for structural loading',
        detail: 'Code of practice for design loads (dead, live, wind, seismic, snow, special) for buildings and structures.'
      }
    ]
  },
  {
    letter: 'L',
    items: [
      {
        term: 'LandIQ',
        short: 'Internal classification of land readiness and risk',
        detail: 'A Ferrum OS shorthand for a parcels readiness score, blending zoning, encumbrance, soil, hazard, and access signals into one comparable view.'
      }
    ]
  },
  {
    letter: 'M',
    items: [
      {
        term: 'Monsoon concreting',
        short: 'Pouring and curing concrete during wet-season conditions',
        detail: 'Concrete work carried out under active or forecast rain. Requires extra protection for fresh pours, controlled water addition, and adjusted curing to maintain quality.'
      }
    ]
  },
  {
    letter: 'R',
    items: [
      {
        term: 'RERA',
        short: 'Real Estate (Regulation and Development) Act',
        detail: 'Indian regulation governing registration, disclosures, timelines, and consumer protection for real estate projects.'
      }
    ]
  },
  {
    letter: 'U',
    items: [
      {
        term: 'ULPIN',
        short: 'Unique Land Parcel Identification Number',
        detail: 'A 14-character geographic identifier assigned to every land parcel in India. Improves parcel identity, reduces record ambiguity, and supports digital verification during diligence.'
      }
    ]
  }
];

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            Glossary of land, design, and delivery terms
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            A working reference for the standards, codes, and operational vocabulary we use across Ferrum OS articles, case studies, and code guides.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/resources" className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink">
              Back to Resources
            </Link>
            <Link href="/resources/is-code-guides" className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink">
              See IS Code Guides
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="space-y-12">
          {groups.map((group) => (
            <div key={group.letter}>
              <h2 className="text-3xl font-bold tracking-tight text-relume-ink">{group.letter}</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {group.items.map((item) => (
                  <article key={item.term} className="rounded-2xl border border-relume-border bg-white p-6">
                    <div className="mb-3 inline-flex rounded-full bg-relume-surface-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
                      {item.short}
                    </div>
                    <h3 className="text-xl font-semibold leading-tight text-relume-ink">{item.term}</h3>
                    <p className="mt-3 text-sm leading-7 text-relume-muted">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
