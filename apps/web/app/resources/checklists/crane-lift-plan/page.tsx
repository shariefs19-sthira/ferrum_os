const craneLiftPlanSections = [
  {
    title: 'Lift Planning',
    items: [
      'Load weight, centre of gravity, and rigging configuration confirmed against the crane\'s rated capacity',
      'Ground bearing capacity checked against outrigger loads for the planned crane position',
      'Lift radius and boom angle confirmed against the load chart for the actual configuration',
      'Exclusion zone defined and communicated to all site personnel before the lift',
    ],
  },
  {
    title: 'Pre-Lift Checks',
    items: [
      'Rigging gear (slings, shackles, spreader bars) inspected and rated for the load',
      'Weather conditions (wind speed, visibility) checked against the crane\'s operating limits',
      'Signaller and operator communication method confirmed and tested',
      'Overhead and underground services checked and cleared from the lift path',
    ],
  },
  {
    title: 'Sign-Off and Records',
    items: [
      'Lift plan reviewed and signed by a competent person before the lift proceeds',
      'Operator certification and crane inspection/load-test certificate current and on file',
      'Any deviation from the planned lift logged and re-approved before proceeding',
      'Post-lift record completed, including any incident or near-miss noted during the operation',
    ],
  },
]

export default function CraneLiftPlanPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Crane Lift Plan Checklist
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Planning and Signing Off a Lift Before the Crane Moves
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {craneLiftPlanSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
