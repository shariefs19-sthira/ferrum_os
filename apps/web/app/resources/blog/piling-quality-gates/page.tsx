export default function PilingQualityGatesPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Quality Gates for Piling Work
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Catching a Bad Pile Before It&apos;s Buried Under a Foundation
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Verification During Installation</h2>
            <p className="text-relume-muted">
              Piling defects are hardest to fix after the fact, so the real quality control
              happens during installation, not after: monitoring driving resistance or bore
              verticality in real time, checking concrete volume against theoretical pile volume
              during a bored-pile pour, and flagging any pile whose installation record deviates
              from the design assumption before moving to the next one.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Integrity Testing Before Load</h2>
            <p className="text-relume-muted">
              Low-strain integrity testing (sonic echo or similar) on a representative sample of
              piles, before any structural load is applied, is the gate that catches necking,
              voids, or discontinuities that installation records alone might miss. Skipping this
              gate to save schedule time is one of the more expensive mistakes in foundation
              work, since a defective pile discovered after the superstructure loads it is a far
              larger repair.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Documentation That Survives Handover</h2>
            <p className="text-relume-muted">
              Every pile needs an installation record, a concrete volume reconciliation, and an
              integrity test result (where tested) tied to its plan location, not just a summary
              log for the piling package as a whole. This is the record a structural engineer
              needs years later if settlement or performance questions come up, and it&apos;s cheap to
              capture at the time and expensive to reconstruct afterward.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
