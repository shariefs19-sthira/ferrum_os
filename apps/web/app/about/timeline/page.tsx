import Link from 'next/link';

type Milestone = {
  year: string;
  phase: string;
  title: string;
  detail: string;
};

const milestones: Milestone[] = [
  {
    year: '2023',
    phase: 'Foundation',
    title: 'Ferrum OS monorepo initialized',
    detail: 'Repository structure, documentation system, and shared design tokens established so product, web, and tooling could ship in lockstep.'
  },
  {
    year: '2024',
    phase: 'Land Intelligence',
    title: 'LandIntel MVP and ULPIN lookup',
    detail: 'First production feature: parcel-level ULPIN lookup, soil and hazard profile, PDF report generation, and a public lookup page at /landintel.'
  },
  {
    year: '2024',
    phase: 'Standards',
    title: 'BOQ Pro and IS-aligned measurement',
    detail: 'BOQ Pro brought quantity takeoff and cost estimation into the platform, grounded in IS 1200 measurement practices and a careful stance on CESMM4.'
  },
  {
    year: '2024',
    phase: 'Procurement',
    title: 'ProcureHub and supplier workflows',
    detail: 'ProcureHub connected the BOQ to real materials, vendor categories, and pricing so that estimates could survive contact with the market.'
  },
  {
    year: '2025',
    phase: 'Execution',
    title: 'BuildOS and Structura go live',
    detail: 'BuildOS gave teams a place to coordinate workfronts and milestones, while Structura brought structural analysis into the same operating model.'
  },
  {
    year: '2025',
    phase: 'Capital',
    title: 'InvestFlow and CommunityBuild',
    detail: 'InvestFlow extended the platform to investment forecasting. CommunityBuild opened the door to fractional and community-led development.'
  },
  {
    year: '2026',
    phase: 'Knowledge',
    title: 'Resources library and code guides',
    detail: 'The /resources hub brought articles, case studies, IS Code Guides, glossary, and FAQ into one home so field knowledge could live next to the product.'
  }
];

export default function TimelinePage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">About</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            How Ferrum OS came together
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            A short timeline of the platforms, releases, and operating decisions that shaped the product from a single lookup tool into a connected construction operating system.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink">
              About Ferrum OS
            </Link>
            <Link href="/resources" className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink">
              Explore resources
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 md:px-8">
        <ol className="relative space-y-12 border-l border-relume-border pl-8">
          {milestones.map((m) => (
            <li key={m.title} className="relative">
              <span className="absolute -left-[2.05rem] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-relume-ink ring-4 ring-white" aria-hidden="true" />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-relume-ink">{m.year}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-relume-muted">{m.phase}</span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-relume-ink">{m.title}</h2>
              <p className="mt-3 text-sm leading-7 text-relume-muted">{m.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
