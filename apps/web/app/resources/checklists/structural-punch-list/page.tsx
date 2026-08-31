const punchListSections = [
  {
    title: 'Foundation and Substructure',
    items: [
      'Footing dimensions and reinforcement match approved structural drawings',
      'Anchor bolt positions verified against column base plate templates',
      'Waterproofing membrane continuous at all foundation penetrations',
      'Backfill compaction test reports on file for each lift',
    ],
  },
  {
    title: 'Superstructure and Frame',
    items: [
      'Column and beam cover blocks intact, no exposed reinforcement',
      'Construction joints treated per approved method statement',
      'Slab levels within tolerance at all structural grid intersections',
      'Shear wall and bracing connections torqued to specification',
    ],
  },
  {
    title: 'Closeout and Handover',
    items: [
      'As-built structural drawings reconciled against site measurements',
      'Non-destructive test reports (rebound hammer, UPV) archived with location tags',
      'Defects register closed out or carried into the defect liability schedule',
      'Structural completion certificate signed by the engineer of record',
    ],
  },
]

export default function StructuralPunchListPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Structural Punch List Checklist
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            A Closeout Checklist for Structural Handover
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {punchListSections.map((section) => (
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
