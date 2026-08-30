export default function HomeLoanMarginsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Home Loan Margins and the Builder's Cash-Flow Curve
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            How Lender Disbursement Stages Shape Working Capital
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Three-Stage Disbursement Pattern</h2>
            <p className="text-gray-600">
              A typical Indian home loan for an under-construction property releases funds in
              three tranches: a small initial disbursement on agreement and the first
              developer milestone, a much larger tranche linked to the slab or superstructure
              completion, and the balance on possession and registration. The exact split
              varies by lender, but the curve almost always sits in the 10-15 / 70-80 / 5-10
              range. Project teams that understand the curve can align their milestone billing
              to the lender's, which keeps the buyer's cash burden flat instead of forcing a
              second- and third-stage balloon payment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Margin Money and the Lender's Risk Window</h2>
            <p className="text-gray-600">
              Banks and housing finance companies fund only a portion of the property value,
              called the loan-to-value ratio, and require the buyer — or the project, in the
              case of bulk tie-ups — to bring the rest as margin money. For under-construction
              properties the lender's risk window is wider because the collateral is still
              being built, and the margin demanded is correspondingly higher, often fifteen to
              twenty-five percent. When a builder offers subvention or pre-EMI schemes, the
              economic effect is the builder financing the buyer's margin until possession, and
              the cost of that finance is not always visible in the headline price.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reconciling Lender Stages with Project Cash Flow</h2>
            <p className="text-gray-600">
              The most common cause of mid-project cash stress is a misalignment between the
              lender's disbursement stages and the project's actual cost curve. A project
              whose cost-weighted midpoint falls on the superstructure slab will feel a squeeze
              if the lender's second tranche is keyed to a later milestone, because construction
              must continue while receivables are still building. The mitigation is to publish
              a disbursement-aligned cash flow that maps each lender stage to the matching
              schedule of values line, and to negotiate with the lender for milestone restatement
              when the project plan moves. Without that map, the project borrows short and pays
              twice for the privilege.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
