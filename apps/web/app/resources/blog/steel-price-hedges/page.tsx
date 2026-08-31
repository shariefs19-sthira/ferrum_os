export default function SteelPriceHedgesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Hedging Steel Price Risk on Fixed-Price Contracts
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Why Steel Volatility Is a Contract Problem, Not Just a Market Problem
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Where the Exposure Actually Sits</h2>
            <p className="text-gray-600">
              A fixed-price contract signed before a long procurement lead time locks the
              contractor into today's steel rate for tomorrow's delivery, and the gap between
              those two dates is exactly where margin gets eaten. The exposure is largest on
              projects with a long gap between bid submission and steel procurement, and smallest
              where reinforcement is bought and fixed in price early in the project timeline.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contractual Tools Before Financial Ones</h2>
            <p className="text-gray-600">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When a Financial Hedge Makes Sense</h2>
            <p className="text-gray-600">
              A financial hedge — forward contracts or futures against a steel index — is
              worth the complexity only when the tonnage at risk is large enough that a bad move
              in price would materially damage the project's margin, and when no contractual
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
