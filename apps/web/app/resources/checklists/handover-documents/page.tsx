const handoverDocumentSections = [
  {
    title: 'Design and As-Built Records',
    items: [
      'Final approved drawings reconciled against as-built condition, all disciplines',
      'Structural, MEP, and finishes as-built drawings cross-checked against each other',
      'Design change log closed out with sign-off on every variation',
      'Digital copy of the approved building plan and occupancy certificate filed',
    ],
  },
  {
    title: 'Compliance and Certification',
    items: [
      'Structural completion certificate signed by the engineer of record',
      'Fire and life-safety system commissioning certificates on file',
      'Statutory approvals and NOCs collected against the handover checklist',
      'Warranty and maintenance documentation handed over for major systems',
    ],
  },
  {
    title: 'Owner Handback',
    items: [
      'Defects register closed out or carried into a post-handover punch list',
      'Keys, access credentials, and system manuals transferred and logged',
      'Final handover walkthrough completed with owner sign-off',
      'Document package archived in a location accessible to the owner going forward',
    ],
  },
]

export default function HandoverDocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Handover Documents Checklist
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            The Document Package a Clean Project Handover Actually Needs
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {handoverDocumentSections.map((section) => (
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
