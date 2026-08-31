export default function MonsoonStructuralChecksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Structural Checks Before and After Monsoon
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            What to Inspect on an Active Site Once the Rains Start
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Before the First Heavy Rain</h2>
            <p className="text-gray-600">
              Pre-monsoon structural checks focus on anything that could trap or channel water
              against a structural member: exposed rebar cages awaiting a pour, open construction
              joints without waterstops, and temporary shoring whose footing hasn't been checked
              for scour risk. A site walk before the first heavy rain, with a punch list closed
              out rather than just noted, is far cheaper than a post-storm repair.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">During an Active Monsoon Spell</h2>
            <p className="text-gray-600">
              Once the rains are running, the checks shift to drainage and load: are site drains
              actually carrying water away from footings and retaining structures, is backfill
              against basement walls seeing standing water it wasn't designed for, and is any
              temporary shoring or scaffolding showing settlement after saturated ground softens
              underneath it. These are daily checks during an active spell, not weekly ones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">After the Rains Clear</h2>
            <p className="text-gray-600">
              Post-monsoon inspection should treat every exposed structural element the same way
              a defects walk would: check for new cracking in recently cast concrete, verify
              that curing wasn't disrupted in a way that affects strength, and re-survey any
              temporary works for movement. Documenting this inspection against the pre-monsoon
              baseline is what lets a team tell the difference between cosmetic weathering and a
              real structural concern.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
