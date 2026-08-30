export default function SiteSafetyChecklistPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Site Safety Checklist for Working Project Teams
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            What a Foreman-Grade Safety Walk Actually Looks Like
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Daily Walk Beats the Quarterly Audit</h2>
            <p className="text-gray-600">
              Most site accidents are not caused by absent safety policy; they are caused by
              absent daily attention. A written safety manual that lives in a binder on the
              site office shelf does not prevent a falling object. A fifteen-minute walk by
              the site engineer or the safety officer at the start of every shift, with a
              short checklist in hand, does. The walk is not a paper exercise; it is a
              visible behaviour that tells every worker on site that safety is the first
              thing that gets verified, not the last. The discipline that turns a checklist
              from a binder into a habit is keeping it short, keeping it visible, and making
              sure the same person signs it every day.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What the Checklist Should Cover, and What it Should Not</h2>
            <p className="text-gray-600">
              A working checklist is not a copy of the BOCW Act. It is a one-page artefact
              with the five or six things that go wrong most often on a real site: edge
              protection on every open floor, scaffold tags current and dated, electrical
              panels locked, excavations barricaded, lifting gear inspected, and PPE actually
              being worn and not just distributed. Everything else — statutory registers,
              method statements, training records — belongs in a separate compliance file
              that the safety officer maintains, not on the daily walk. Confusing the two is
              the most common reason checklists get abandoned: the foreman cannot finish a
              two-page form before the next pour, so the form stops getting filled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Closing the Loop with the Project Manager</h2>
            <p className="text-gray-600">
              A checklist that nobody reads is a liability. The signed daily sheet should
              reach the project manager the same evening, and any item marked red should
              produce a dated closure note within twenty-four hours. If a hazard is recorded
              and not closed in two days, it is a project-management problem, not a safety
              problem, and it should be tracked the way a snag or a running bill item is
              tracked. The teams that run safe sites do not run them because their workers
              are more careful; they run them because the safety walk is plugged into the
              same daily reporting rhythm as labour attendance and material receipts, and a
              red item cannot hide in that rhythm.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
