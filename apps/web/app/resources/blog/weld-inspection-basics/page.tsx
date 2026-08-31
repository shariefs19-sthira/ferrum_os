export default function WeldInspectionBasicsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Weld Inspection Basics for Site Teams
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            What a Non-Destructive Test Actually Tells You
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Visual Inspection First</h2>
            <p className="text-gray-600">
              Most weld defects that matter — undercut, porosity, incomplete fusion at the toe,
              excessive spatter — are visible to a trained inspector before any non-destructive
              test is run. A disciplined visual inspection against the approved weld procedure,
              done on every structural weld rather than a sample, catches most problems at a
              fraction of the cost of instrumented testing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Choosing the Right NDT Method</h2>
            <p className="text-gray-600">
              Ultrasonic testing finds subsurface defects in thicker sections that visual
              inspection can't reach, while dye penetrant and magnetic particle testing are
              better suited to surface-breaking defects on thinner welds. Radiography gives the
              clearest record but is slower and carries safety and access requirements that make
              it impractical for most site welds outside of critical, code-mandated locations.
              Specifying the wrong method for the defect type wastes budget without closing the
              actual risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reading the Result, Not Just Filing It</h2>
            <p className="text-gray-600">
              An NDT report that sits in a file without being reviewed against acceptance
              criteria by someone qualified to interpret it isn't quality control, it's
              paperwork. The reviewer needs to compare each indication against the applicable
              code's acceptance limits and make an explicit accept/repair/reject call — not just
              record that a test was performed.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
