export default function ProcurementTermsPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Procurement Terms for Indian Construction
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Reading the contract language before it reads you
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Rate-Only vs Item-Rate vs Lumpsum</h2>
            <p className="text-relume-muted">
              The three most common Indian procurement forms look interchangeable on paper but carry very
              different risk profiles. Rate-only tenders leave the owner exposed to quantity variation, item-rate
              contracts (measured under IS 1200) transfer that risk to the contractor, and lumpsum deals
              hand it firmly to the builder. The right choice depends on how confident the design is at the
              tender stage — and on who can absorb a 15% quantity swing without litigation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">EPC, PMC, and the Risk Vocabulary</h2>
            <p className="text-relume-muted">
              EPC (Engineering, Procurement, Construction) bundles design and execution under a single
              contractor who carries both delivery and performance risk. PMC (Project Management Consultancy)
              keeps design ownership with the owner and uses the consultant as an extension of the project
              management office. The two words overlap in casual conversation but produce different insurance
              requirements, different approval chains, and different cash-flow curves — pick the model that
              matches the capability you actually have on the owner&apos;s side, not the label that sounds modern.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Clauses That Quietly Decide the Project</h2>
            <p className="text-relume-muted">
              Variation clauses, escalation indices, retention terms, and defect-liability periods decide
              more project outcomes than the headline rate. A 5% retention held for 24 months changes
              contractor cash flow more than a 2% rate concession. A POL-f (price adjustment for fuel and
              linked materials) clause is worth more than half a percentage point on the quote when commodity
              prices move. Read these clauses against your real exposure, not against the template the
              contract team last used.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
