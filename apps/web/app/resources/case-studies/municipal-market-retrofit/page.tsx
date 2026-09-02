export default function MunicipalMarketRetrofitPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Municipal Market Structural Retrofit
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Retrofitting a Trading Hall Without Closing the Traders' Livelihoods
          </p>
          <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Illustrative case study — composite scenario, not an actual named client
          </span>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Challenge</h2>
            <p className="text-relume-muted">
              A municipal market's ageing structural frame needed retrofit work, but the trading
              hall generated daily income for hundreds of vendors who could not simply relocate
              for the duration of construction. The retrofit had to be sequenced around active
              trading hours in a building with no real spare capacity to shift vendors out of a
              work zone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Approach</h2>
            <p className="text-relume-muted">
              The project team mapped the trading hall into rotating work zones, closing one
              section at a time during the market's lowest-trading hours and temporarily
              relocating affected vendors to an adjacent open zone rather than off-site. Each
              zone's structural work was compressed into the shortest defensible window and
              signed off before vendors returned, with the next zone's closure announced well in
              advance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Outcome</h2>
            <p className="text-relume-muted">
              The retrofit was completed with every vendor able to continue trading throughout,
              moved zone-to-zone rather than displaced. The rotating-zone approach, built around
              the market's actual trading patterns rather than a generic construction sequence,
              is now the reference model for retrofit work on other occupied public markets.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
