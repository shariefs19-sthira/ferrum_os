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
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Structural Punch List Checklist
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            A Closeout Checklist for Structural Handover
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {punchListSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">{section.title}</h2>
              <ul className="list-disc list-inside space-y-2 text-relume-muted">
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
