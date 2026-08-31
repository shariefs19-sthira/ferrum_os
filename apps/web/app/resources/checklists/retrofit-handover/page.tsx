const retrofitHandoverSections = [
  {
    title: 'Structural Sign-Off',
    items: [
      'Retrofit engineer of record has signed the completion certificate for each treated zone',
      'Jacketing, bracing, or isolation work matches the approved retrofit drawings with no open deviations',
      'Non-destructive test reports filed against as-built zone references',
      'Original vulnerability assessment reconciled against final as-built condition',
    ],
  },
  {
    title: 'Access and Utilities Restored',
    items: [
      'All temporary shoring, hoarding, and access restrictions removed from occupied areas',
      'Utility shutdowns from the retrofit sequence reversed and verified live',
      'Common-area finishes disturbed during retrofit work restored to pre-work condition',
      'Fire and life-safety systems re-tested after any structural penetration work',
    ],
  },
  {
    title: 'Documentation and Owner Handback',
    items: [
      'Updated as-built structural drawings issued to the building owner',
      'Warranty and maintenance schedule for retrofit materials handed over',
      'Defects register closed out or carried into a post-handover punch list',
      'Occupant communication log archived alongside the final completion certificate',
    ],
  },
]

export default function RetrofitHandoverPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Retrofit Handover Checklist
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Closing Out a Seismic or Structural Retrofit on an Occupied Building
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {retrofitHandoverSections.map((section) => (
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
