export const metadata = {
  title: 'Partners — Ferrum OS',
  description: 'Three ways to partner with Ferrum OS: technology, implementation, and channel. Build with the operating system for construction.',
  openGraph: {
    title: 'Partners — Ferrum OS',
    description: 'Three partner tiers: technology, implementation, and channel. Build with the operating system for construction.',
    type: 'article',
    locale: 'en_US'
  }
}

const tiers = [
  {
    id: 'technology',
    name: 'Technology partners',
    tagline: 'Build on the Ferrum OS data model',
    intro: 'For software vendors, BIM/CAD platforms, and data providers who want their product to read and write the same structured data the rest of the platform uses.',
    perks: [
      'Sandbox API access with the full BOQ, schedule, and decision-log model',
      'Joint data-schema reviews with our platform team',
      'Co-marketing on the Ferrum OS partner directory once GA-cleared',
      'Webhook and web-component embedding guides'
    ],
    fit: 'You sell software or data to contractors, owners, or consultancies and you want a clean integration path into a system that is already running on real projects.',
    cta: 'Apply to the technology track'
  },
  {
    id: 'implementation',
    name: 'Implementation partners',
    tagline: 'Deliver Ferrum OS on real projects',
    intro: 'For consultancies, PMC firms, and quantity-surveying practices who configure, deploy, and run Ferrum OS on behalf of their clients.',
    perks: [
      'Certified practitioner training (4-week cohort, quarterly)',
      'Co-branded proposal and statement-of-work templates',
      'Tiered project referral fees for in-region work',
      'Direct engineering channel for edge-case configurations'
    ],
    fit: 'You already own the client relationship and need a defensible platform behind your delivery — without rebuilding the data model yourself.',
    cta: 'Apply to the implementation track'
  },
  {
    id: 'channel',
    name: 'Channel partners',
    tagline: 'Resell and refer in your region',
    intro: 'For resellers, regional integrators, and trade associations who want to introduce Ferrum OS into their market under a commercial agreement that rewards outcomes.',
    perks: [
      'Up to 25% revenue share on multi-year contracts you source',
      'Region-locked lead routing and a co-managed pipeline',
      'Quarterly business reviews with the channel team',
      'Localised marketing collateral and translation support'
    ],
    fit: 'You have the relationships and the regulatory familiarity to open a market; we bring the product, the engineering, and the platform economics.',
    cta: 'Apply to the channel track'
  }
]

const faqs = [
  {
    q: 'Is there a fee to apply?',
    a: 'No. Application is free across all three tiers. We assess fit on the data you already have and the projects you intend to deploy against.'
  },
  {
    q: 'How long does the review take?',
    a: 'Technology and implementation tracks review within 10 business days. Channel track reviews within 5 business days once the territory brief is filed.'
  },
  {
    q: 'Do partners get access to the source data model?',
    a: 'Yes — under NDA. The full schedule-of-values, BOQ, and decision-log schema is published to certified partners along with changelog history.'
  }
]



export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">
            Partners
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            Build with the operating system for construction
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            We work with software vendors, delivery consultancies, and regional
            resellers who want to plug into a platform that is already running
            on real projects. Three partner tiers, one data model, one source of
            truth.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#tiers" className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink">
              See the tiers
            </a>
            <a href="mailto:partners@ferrum_os.com" className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink">
              Email partners@ferrum_os.com
            </a>
          </div>
        </div>
      </section>

      <section id="tiers" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">
              The tiers
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-relume-tight text-relume-ink">
              Three ways to partner
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-relume-muted">
              Pick the track that matches what your organisation already does best.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <article key={tier.id} className="flex flex-col rounded-2xl border border-relume-border bg-relume-surface-secondary p-6">
                <span className="inline-flex w-fit items-center rounded-full bg-relume-surface-secondary px-3 py-1 text-xs font-semibold text-relume-ink">
                  {tier.tagline}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-relume-ink">
                  {tier.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-relume-muted">
                  {tier.intro}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-relume-muted">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start">
                      <svg className="mt-0.5 h-4 w-4 flex-none text-relume-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-2">{perk}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-md border border-relume-border bg-white p-3 text-sm leading-6 text-relume-muted">
                  <span className="font-semibold text-relume-ink">Best fit: </span>
                  {tier.fit}
                </p>
                <a href={`mailto:partners@ferrum_os.com?subject=Partner%20application%3A%20${encodeURIComponent(tier.name)}`} className="mt-6 inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-relume-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-relume-ink">
                  {tier.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-relume-surface-secondary">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">
              Questions
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-relume-tight text-relume-ink">
              Partner FAQ
            </h2>
          </div>
          <dl className="space-y-6">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-relume-border bg-white p-6">
                <dt className="text-base font-semibold text-relume-ink">{item.q}</dt>
                <dd className="mt-2 text-sm leading-7 text-relume-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  )
}
