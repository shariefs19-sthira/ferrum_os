// Split out of page.tsx: Next.js's page-typegen only permits a fixed set of
// named exports (default, metadata, generateStaticParams, ...) from a
// page.tsx file, so this data can't live there and also be imported by
// lib/resources/registry.ts for the hub's term count. This is the single
// source of truth for both.

export type Term = {
  term: string
  short: string
  detail: string
}

export type Group = {
  letter: string
  items: Term[]
}

export const groups: Group[] = [
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
        detail: 'Code of practice for design loads (dead, live, wind, snow, special, and load combinations) for buildings and structures, published in parts by loading type -- for example, wind loads (other than earthquake) are covered in Part 3. Seismic/earthquake loads are a separate standard, IS 1893, not part of IS 875.'
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
]
