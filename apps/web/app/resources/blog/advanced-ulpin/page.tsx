export default function AdvancedUlpinPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Advanced ULPIN Workflows
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Going Beyond the Basics of Land Parcel Identification
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Layered Geo-Referencing</h2>
            <p className="text-relume-muted">
              Advanced ULPIN workflows combine the base parcel identifier with high-resolution
              geo-referencing layers, including cadastral maps, drone-captured orthomosaics, and
              surveyed control points. By stacking these sources, teams can resolve boundary
              ambiguities that arise from outdated revenue records and reconcile them against
              ground truth before they escalate into project delays.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Dispute Pre-emption</h2>
            <p className="text-relume-muted">
              When ULPIN records are linked to mutation history, encumbrance certificates, and
              court-pending case data, the resulting parcel profile surfaces ownership conflicts
              long before acquisition. This pre-emption pattern lets project teams walk away from
              high-risk plots early and route diligence effort toward parcels with a clean
              chain-of-title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Integration with Project Tools</h2>
            <p className="text-relume-muted">
              The most useful ULPIN pipelines feed parcel IDs directly into BOQ, permitting, and
              contractor onboarding tools. Once a parcel is selected, downstream artifacts such as
              feasibility reports, site photographs, and approval checklists can be regenerated
              from a single source of truth instead of being re-keyed into spreadsheets by every
              stakeholder.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}