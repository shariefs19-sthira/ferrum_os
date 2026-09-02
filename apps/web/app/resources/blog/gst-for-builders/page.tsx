export default function GstForBuildersPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            GST for Builders and Developers
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Tax Credit, Reverse Charge, and the 80% ITC Rule in Practice
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">When GST Is One Percent and When It Is Five</h2>
            <p className="text-relume-muted">
              Under the GST regime for real estate, affordable housing projects are taxed at
              one percent without input tax credit, while non-affordable projects are taxed at
              five percent, again without ITC. The "affordable" classification tracks the
              carpet-area threshold, the unit value cap, and the central-state definition in
              force on the date of commencement. Project teams that misclassify a tower
              under-charge the tax but lose the right to claim ITC, while teams that over-
              classify pass extra cost to the buyer and invite anti-profiteering scrutiny. The
              safe practice is to lock the classification decision in a written note, signed
              off by finance and the project head, and to revisit it whenever the state notifies
              a new carpet-area or value threshold.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Reverse Charge on Sub-Contractor Work</h2>
            <p className="text-relume-muted">
              Work contracts supplied by an unregistered sub-contractor to a registered builder
              attract reverse charge: the builder pays GST on the value of the sub-contracted
              service and can treat that tax as part of the project's input cost. In practice,
              the reverse-charge invoice must be self-generated, recorded in GSTR-1 as a
              reverse-charge supply, and reflected in GSTR-3B as tax payable. Teams that
              fail to maintain a register of sub-contractor GSTINs end up discovering the
              liability at audit, when the only cure is late payment with interest. A simple
              contractor onboarding checklist that captures GSTIN, status, and the line items
              covered is the cheapest insurance against this exposure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">ITC, Anti-Profiteering, and the Price-Benefit Audit</h2>
            <p className="text-relume-muted">
              For projects that remain on the pre-amendment five-percent-with-ITC regime, the
              builder must pass the tax benefit to the buyer in the form of reduced price. The
              National Anti-Profiteering Authority has repeatedly examined whether the ITC
              claimed by the builder is reflected in the agreement value, and any mismatch is
              treated as profiteering. The defensible workflow is to keep a price-benefit
              ledger that records the base price, the ITC claimed, the ITC passed on, and the
              resulting per-square-foot adjustment. When that ledger is reconciled monthly
              against GSTR-2B, the project can answer an anti-profiteering notice within the
              statutory window without rebuilding numbers from receipts.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
