export default function FormworkPressureCalculationPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Formwork Pressure Calculation for Wall and Column Pours
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Getting the Design Pressure Right Before You Spec the Formwork
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Why Lateral Pressure Governs the Design</h2>
            <p className="text-relume-muted">
              Fresh concrete behaves as a fluid until it sets, and the formwork has to resist the
              full lateral pressure of that fluid at the point of maximum head. Underestimating
              this pressure is one of the most common causes of formwork failure on site — a
              blowout mid-pour is expensive, dangerous, and always traces back to a design
              pressure that didn't account for real pour rate, concrete temperature, or mix
              consistency.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">The Variables That Actually Move the Number</h2>
            <p className="text-relume-muted">
              Pour rate is the single biggest lever: a faster pour rate means less time for the
              lower lifts to begin stiffening before the next lift adds load, so pressure rises
              with rate rather than staying constant with total pour height. Concrete temperature
              works the opposite way — colder concrete sets slower and generates higher pressure
              for the same pour rate, which is why winter pours need a more conservative pressure
              assumption than the same mix poured in summer. Retarders and high-slump mixes push
              the pressure envelope further and should be flagged to the formwork designer before,
              not after, the pour is scheduled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Building in a Margin, Not a Guess</h2>
            <p className="text-relume-muted">
              Reliable formwork design doesn't use a single fixed pressure value across every
              pour on a project — it recalculates for each pour's actual conditions and applies a
              documented safety margin on top of the calculated peak pressure, not on top of a
              rule-of-thumb number carried over from a different mix or season. Recording the
              pour rate, mix design, and ambient temperature against each formwork calculation
              also gives the next similar pour a real baseline instead of another guess.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
