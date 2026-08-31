export default function TunnelFormConstructionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Tunnel-Form Construction for Repetitive Floor Plates
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Cycle Time, Formwork Turnaround, and Where the Method Pays Off
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When Tunnel-Form Earns Its Setup Cost</h2>
            <p className="text-gray-600">
              Tunnel-form casts walls and slabs as a single monolithic pour, which cuts joints,
              speeds up waterproofing, and produces a stiffer structure than conventional
              column-and-slab framing. The setup and crane cost only pays off on projects with
              enough repetitive floor plates — typically 80 or more identical units across a
              residential or hospitality tower — to amortize the formwork investment across many
              cycles rather than a handful.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Holding a One-Day Cycle</h2>
            <p className="text-gray-600">
              The method's economics live or die on cycle time: strip, clean, oil, reposition, pour,
              cure, strip again. A disciplined crew holds a 24-hour cycle by running curing
              accelerators, staging rebar cages a full cycle ahead, and treating any deviation from
              the sequence — a late concrete pour, a crane conflict — as a scheduling emergency
              rather than a routine delay, because a single missed cycle compounds across every
              subsequent floor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quality Control Inside the Tunnel</h2>
            <p className="text-gray-600">
              Because tunnel-form pours conceal both wall faces and the slab soffit simultaneously,
              defects are harder to catch mid-cycle than with open formwork. Reliable projects run a
              fixed pre-pour checklist — rebar cover, conduit and sleeve placement, form cleanliness
              — signed off by a second engineer before each pour, since the cost of reopening a
              stripped and cured unit is far higher than the minute spent on the checklist.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
