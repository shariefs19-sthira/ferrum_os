export default function FoundationRetrofitCostsPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            What Drives Foundation Retrofit Costs
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Reading a Foundation Assessment Before You Budget the Fix
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Assessment Scope Sets the Floor</h2>
            <p className="text-relume-muted">
              The single biggest cost driver in a foundation retrofit is how much of the
              foundation needs investigation before a fix can even be designed: a soil report and
              a handful of test pits cost far less than the underpinning or piling work a bad
              soil condition can trigger. Budgets built before the geotechnical assessment is
              complete are budgets built on a guess, and that guess is usually optimistic.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Access and Sequencing Costs More Than Materials</h2>
            <p className="text-relume-muted">
              Underpinning or piling beneath an occupied or structurally sensitive building costs
              more for access and sequencing than for the concrete and steel themselves — cramped
              working zones, staged excavation to avoid destabilising the existing footing, and
              extended timelines to keep the structure safe throughout. A retrofit costed only
              against material quantities, without pricing the access constraint, will come in
              under budget on paper and over budget on site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Where Contingency Actually Belongs</h2>
            <p className="text-relume-muted">
              Foundation work carries more uncertainty than almost any other structural retrofit
              category, because the actual soil and existing-footing condition is only fully
              known once excavation starts. A realistic budget puts a larger, explicit contingency
              against the foundation line item specifically — not spread thinly across the whole
              retrofit — so a genuine surprise below grade doesn't force a scope cut somewhere
              else in the project.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
