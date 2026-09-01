export default function AirportCargoBayPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Airport Cargo Bay Expansion
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Sequencing Structural Work Around a Live Cargo Operation
          </p>
          <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Illustrative case study — composite scenario, not an actual named client
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge</h2>
            <p className="text-gray-600">
              A cargo terminal operator needed to add a new bay to an active airside facility
              without interrupting freight throughput. Every structural pour, crane lift, and
              utility tie-in had to be scheduled around live aircraft turnaround windows, and a
              single missed handback deadline risked cascading delays across the terminal's
              existing bays.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Approach</h2>
            <p className="text-gray-600">
              The project team used Ferrum OS BuildOS to run the structural sequence as
              zone-locked work packages tied directly to airside curfew windows, with each
              package requiring a hard inspection sign-off before the adjacent zone could open.
              Formwork pressure calculations, pour schedules, and crane bookings were all logged
              against the same zone reference so any slippage in one showed up immediately in the
              others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Outcome</h2>
            <p className="text-gray-600">
              The new bay was handed back to cargo operations on the scheduled date with no
              disruption to existing freight throughput during construction. The zone-locked
              sequencing model built for this project became the team's standard approach for
              subsequent live-airside structural work.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
