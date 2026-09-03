export default function CementStorageHumidityPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Cement Storage and Humidity on Site
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Why Cement Age Alone Doesn&apos;t Tell You Whether a Bag Is Usable
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">How Humidity Actually Degrades Cement</h2>
            <p className="text-relume-muted">
              Cement hydrates on contact with moisture, and once that reaction starts in the bag
              rather than in the mix, the resulting lumps and reduced reactivity quietly weaken
              whatever concrete or mortar it goes into. Humid site storage does this faster than
              time alone, which is why a cement bag stored badly for six weeks can be in worse
              condition than one stored well for six months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Storage Conditions That Actually Matter</h2>
            <p className="text-relume-muted">
              Stacking bags on a raised, dry platform away from external walls, keeping stacks
              below the height that risks bag rupture, and sequencing stock on a strict
              first-in-first-out basis are the three controls that do most of the work. A
              covered store with poor ventilation can trap humidity just as effectively as no
              cover at all, so airflow matters as much as keeping rain off.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">When to Reject a Bag</h2>
            <p className="text-relume-muted">
              A field test — checking for lumps that don&apos;t crumble under light hand pressure, or
              a visible loss of the powder&apos;s free-flowing texture — is a faster and more reliable
              signal than the manufacture date alone. Site teams that reject on texture rather
              than age avoid both false confidence in old-but-well-stored cement and false
              rejection of recent-but-badly-stored cement.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
