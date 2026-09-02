export default function WeldInspectionBasicsPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Weld Inspection Basics for Site Teams
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            What a Non-Destructive Test Actually Tells You
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Visual Inspection First</h2>
            <p className="text-relume-muted">
              Most weld defects that matter — undercut, porosity, incomplete fusion at the toe,
              excessive spatter — are visible to a trained inspector before any non-destructive
              test is run. A disciplined visual inspection against the approved weld procedure,
              done on every structural weld rather than a sample, catches most problems at a
              fraction of the cost of instrumented testing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Choosing the Right NDT Method</h2>
            <p className="text-relume-muted">
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
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Reading the Result, Not Just Filing It</h2>
            <p className="text-relume-muted">
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
