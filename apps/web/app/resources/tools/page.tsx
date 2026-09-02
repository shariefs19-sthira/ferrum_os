const tools = [
  {
    name: 'Plot Estimator',
    badge: 'Feasibility',
    href: '/products/landintel',
    summary:
      'Guided calculator that turns a parcel polygon, an FAR, and a buildable mix into a buildable-area estimate, a revenue envelope, and a first-pass land-cost ceiling. Lives inside LandIntel so the same inputs feed the parcel record, the BOQ, and the team handoff.',
    inputs: 'Parcel area, Road width, FSI / FAR, Land cost, Construction rate',
    outputs: 'Buildable area (sqft), Revenue envelope (INR), Indicative land ceiling (INR)'
  },
  {
    name: 'Beam Section Table',
    badge: 'Structural',
    href: '/products/structura',
    summary:
      'Printable quick-reference for RCC beam sizing that maps span, breadth, and depth to steel area and moment capacity using IS 456 working-stress assumptions. Designed to be checked against the project structural schedule before a bar-bending schedule is released.',
    inputs: 'Span (m), Breadth (mm), Depth (mm), Concrete grade, Steel grade',
    outputs: 'Effective depth (mm), Moment capacity (kN.m), Required Ast (mm2)'
  },
  {
    name: 'Sample BOQ Calculator',
    badge: 'Procurement',
    href: '/products/boq-pro',
    summary:
      'Small worked example that takes a four-line item-rate BOQ (excavation, PCC, RCC M25, brickwork) and returns a unit-rate summary, a tax split, and a grand total. Useful for vendor onboarding and for sanity-checking the master BOQ when a new rate is keyed in.',
    inputs: 'Item, Quantity, Unit, Unit rate (INR)',
    outputs: 'Line total (INR), Tax split (CGST/SGST/IGST), Grand total (INR)'
  }
];

export const metadata = {
  title: 'Tools — Ferrum OS Resources',
  description:
    'Calculator hubs and quick-reference tables for plot feasibility, beam sizing, and BOQ sampling. Each tool feeds the same data model that powers Ferrum OS.'
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">
            Tools
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-5xl">
            Calculators and quick-reference tables
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-relume-muted">
            Every tool on this page is wired to the same data model that powers
            Ferrum OS. Use them as a starting point for feasibility, structural
            sizing, and procurement sanity-checks.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool) => (
            <article
              key={tool.name}
              className="flex flex-col rounded-2xl border border-relume-border bg-white p-6"
            >
              <span className="inline-flex w-fit items-center rounded-full bg-relume-surface-secondary px-3 py-1 text-xs font-semibold text-relume-ink">
                {tool.badge}
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-relume-ink">{tool.name}</h2>
              <p className="mt-3 text-sm leading-7 text-relume-muted">{tool.summary}</p>
              <div className="mt-5 space-y-2 text-sm text-relume-muted">
                <p>
                  <span className="text-xs font-semibold uppercase tracking-wider text-relume-muted">
                    Inputs:
                  </span>{' '}
                  {tool.inputs}
                </p>
                <p>
                  <span className="text-xs font-semibold uppercase tracking-wider text-relume-muted">
                    Outputs:
                  </span>{' '}
                  {tool.outputs}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-relume-border">
                <a
                  href={tool.href}
                  className="inline-flex items-center text-sm font-semibold text-relume-ink hover:text-relume-ink"
                >
                  Open {tool.name} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-relume-border">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink">How the tools stay in sync</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-relume-ink">Same data model</h3>
              <p className="mt-2 text-sm leading-6 text-relume-muted">
                Tool inputs are typed against the Ferrum OS schema, so a parcel area keyed into Plot Estimator is the same field that drives the BOQ.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-relume-ink">Auditable calculations</h3>
              <p className="mt-2 text-sm leading-6 text-relume-muted">
                Every output is versioned with the formula reference (IS 456, IS 1200, FAR rules) and a date stamp so audit trails stay clean.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-relume-ink">Exportable</h3>
              <p className="mt-2 text-sm leading-6 text-relume-muted">
                Each tool returns a JSON or CSV payload that drops straight into a feasibility note, a vendor email, or a working spreadsheet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
