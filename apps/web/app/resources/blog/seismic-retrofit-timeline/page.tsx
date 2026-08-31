export default function SeismicRetrofitTimelinePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Seismic Retrofit Timelines for Occupied Structures
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Sequencing Structural Work Without Emptying the Building
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Before Sequencing</h2>
            <p className="text-gray-600">
              A retrofit timeline is only as reliable as the structural assessment it is built on.
              Rapid visual screening under IS 13935 gives a first-pass vulnerability rating, but
              committing a phased schedule against occupied floors requires the detailed
              engineering evaluation — column capacity checks, soft-storey identification, and a
              confirmed retrofit technique (jacketing, bracing, or base isolation) — before a
              single milestone is published to tenants or owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Phasing Work Around Occupancy</h2>
            <p className="text-gray-600">
              Occupied retrofits succeed or fail on sequencing discipline: isolating one structural
              bay or floor plate at a time, scheduling the noisiest and most disruptive work
              (core drilling, jacket pours) for off-hours, and holding a hard gate before moving
              to the next zone until inspection sign-off is recorded. Treating each zone as its
              own mini-project — with its own start, inspection, and handback date — keeps the
              published timeline honest instead of collapsing into a single undifferentiated
              "retrofit in progress" period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Communicating Slippage Early</h2>
            <p className="text-gray-600">
              Retrofit schedules slip more often from access and utility-shutdown conflicts than
              from the structural work itself. The teams that hold credibility with occupants are
              the ones that flag a zone delay the day it happens, not at the next scheduled
              update, and that keep a visible buffer between the retrofit engineer's technical
              milestone dates and the dates communicated to building occupants.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
