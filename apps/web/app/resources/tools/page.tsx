const tools = [
  {
    name: 'Plot Estimator',
    badge: 'Feasibility',
    href: '/landintel',
    summary:
      'Guided calculator that turns a parcel polygon, an FAR, and a buildable mix into a buildable-area estimate, a revenue envelope, and a first-pass land-cost ceiling. Lives inside LandIntel so the same inputs feed the parcel record, the BOQ, and the team handoff.',
    inputs: 'Parcel area, Road width, FSI / FAR, Land cost, Construction rate',
    outputs: 'Buildable area (sqft), Revenue envelope (INR), Indicative land ceiling (INR)'
  },
  {
    name: 'Beam Section Table',
    badge: 'Structural',
    href: '/resources/tools/beam-table',
    summary:
      'Printable quick-reference for RCC beam sizing that maps span, breadth, and depth to steel area and moment capacity using IS 456 working-stress assumptions. Designed to be checked against the project structural schedule before a bar-bending schedule is released.',
    inputs: 'Span (m), Breadth (mm), Depth (mm), Concrete grade, Steel grade',
    outputs: 'Effective depth (mm), Moment capacity (kN.m), Required Ast (mm2)'
  },
  {
    name: 'Sample BOQ Calculator',
    badge: 'Procurement',
    href: '/resources/tools/sample-calc',
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
            Tools
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Calculators and quick-reference tables
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
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
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {tool.badge}
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">{tool.name}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{tool.summary}</p>
              <div className="mt-5 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Inputs:
                  </span>{' '}
                  {tool.inputs}
                </p>
                <p>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Outputs:
                  </span>{' '}
                  {tool.outputs}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={tool.href}
                  className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  Open {tool.name} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <h2 className="text-2xl font-bold text-slate-900">How the tools stay in sync</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Same data model</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tool inputs are typed against the Ferrum OS schema, so a parcel area keyed into Plot Estimator is the same field that drives the BOQ.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Auditable calculations</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Every output is versioned with the formula reference (IS 456, IS 1200, FAR rules) and a date stamp so audit trails stay clean.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Exportable</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Each tool returns a JSON or CSV payload that drops straight into a feasibility note, a vendor email, or a working spreadsheet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
