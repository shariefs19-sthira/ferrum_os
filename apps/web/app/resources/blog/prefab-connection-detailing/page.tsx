export default function PrefabConnectionDetailingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Connection Detailing for Prefabricated Elements
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Where Precast and Prefab Projects Actually Go Wrong
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tolerance Stacking Across Trades</h2>
            <p className="text-gray-600">
              A precast or prefab connection has to absorb manufacturing tolerance, erection
              tolerance, and in-situ foundation tolerance all at the same joint — and each of
              those tolerances is set by a different trade, on a different schedule, often
              without visibility into the others. Connection details that assume a single,
              generous tolerance band instead of stacking the real tolerances from each source
              are the single most common cause of on-site fit-up problems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailing the Connection, Not Just the Element</h2>
            <p className="text-gray-600">
              Shop drawings that fully detail the precast element but leave the connection as a
              generic callout push the real engineering decision onto whoever's erecting the
              piece on site — exactly the wrong point in the process to be resolving load path,
              bearing, and grout-pad specifics. A connection detail needs the same rigor as the
              element itself: bearing pad material and thickness, weld or bolt specification,
              and a stated sequence for grouting or dry-packing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sequencing the Erection to Match the Detail</h2>
            <p className="text-gray-600">
              A connection detail that works on paper can still fail if the erection sequence
              doesn't match the assumptions it was designed around — temporary bracing removed
              too early, or an adjacent element not yet in place to provide the lateral restraint
              the connection relies on during the interim condition. The erection sequence and
              the connection detail need to be reviewed together, not handed off as two separate
              documents.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
