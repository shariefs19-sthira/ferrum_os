export default function PilingQualityGatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Quality Gates for Piling Work
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Catching a Bad Pile Before It's Buried Under a Foundation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification During Installation</h2>
            <p className="text-gray-600">
              Piling defects are hardest to fix after the fact, so the real quality control
              happens during installation, not after: monitoring driving resistance or bore
              verticality in real time, checking concrete volume against theoretical pile volume
              during a bored-pile pour, and flagging any pile whose installation record deviates
              from the design assumption before moving to the next one.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Integrity Testing Before Load</h2>
            <p className="text-gray-600">
              Low-strain integrity testing (sonic echo or similar) on a representative sample of
              piles, before any structural load is applied, is the gate that catches necking,
              voids, or discontinuities that installation records alone might miss. Skipping this
              gate to save schedule time is one of the more expensive mistakes in foundation
              work, since a defective pile discovered after the superstructure loads it is a far
              larger repair.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documentation That Survives Handover</h2>
            <p className="text-gray-600">
              Every pile needs an installation record, a concrete volume reconciliation, and an
              integrity test result (where tested) tied to its plan location, not just a summary
              log for the piling package as a whole. This is the record a structural engineer
              needs years later if settlement or performance questions come up, and it's cheap to
              capture at the time and expensive to reconstruct afterward.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
