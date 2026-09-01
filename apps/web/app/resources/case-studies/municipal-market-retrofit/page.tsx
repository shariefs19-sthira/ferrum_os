export default function MunicipalMarketRetrofitPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Municipal Market Structural Retrofit
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Retrofitting a Trading Hall Without Closing the Traders' Livelihoods
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge</h2>
            <p className="text-gray-600">
              A municipal market's ageing structural frame needed retrofit work, but the trading
              hall generated daily income for hundreds of vendors who could not simply relocate
              for the duration of construction. The retrofit had to be sequenced around active
              trading hours in a building with no real spare capacity to shift vendors out of a
              work zone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Approach</h2>
            <p className="text-gray-600">
              The project team mapped the trading hall into rotating work zones, closing one
              section at a time during the market's lowest-trading hours and temporarily
              relocating affected vendors to an adjacent open zone rather than off-site. Each
              zone's structural work was compressed into the shortest defensible window and
              signed off before vendors returned, with the next zone's closure announced well in
              advance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Outcome</h2>
            <p className="text-gray-600">
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
