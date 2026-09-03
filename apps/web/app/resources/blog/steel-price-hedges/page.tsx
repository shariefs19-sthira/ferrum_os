export default function SteelPriceHedgesPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Hedging Steel Price Risk on Fixed-Price Contracts
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Why Steel Volatility Is a Contract Problem, Not Just a Market Problem
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Where the Exposure Actually Sits</h2>
            <p className="text-relume-muted">
              A fixed-price contract signed before a long procurement lead time locks the
              contractor into today&apos;s steel rate for tomorrow&apos;s delivery, and the gap between
              those two dates is exactly where margin gets eaten. The exposure is largest on
              projects with a long gap between bid submission and steel procurement, and smallest
              where reinforcement is bought and fixed in price early in the project timeline.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Contractual Tools Before Financial Ones</h2>
            <p className="text-relume-muted">
              Before reaching for a financial hedge, the cheaper protection is contractual: a
              price-escalation clause tied to a published steel index, a defined procurement
              window written into the schedule, or early-purchase authority that lets the
              contractor lock a rate as soon as the contract is awarded rather than waiting for
              the scheduled delivery date. Owners resist escalation clauses more than they resist
              early-purchase authority, so negotiating for the latter is often the more realistic
              win.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">When a Financial Hedge Makes Sense</h2>
            <p className="text-relume-muted">
              A financial hedge — forward contracts or futures against a steel index — is
              worth the complexity only when the tonnage at risk is large enough that a bad move
              in price would materially damage the project&apos;s margin, and when no contractual
              protection is available. Smaller contractors rarely have the treasury function to
              manage a hedge position correctly, so for most fixed-price work, the priority is
              getting the contractual protection right before treating price risk as a market
              trade.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
