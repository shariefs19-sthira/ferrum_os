const scaffoldHandoverSections = [
  {
    title: 'Structural Sign-Off',
    items: [
      'Scaffold erected per the approved design and loading class for its intended use',
      'Base plates, sole boards, and ties inspected and confirmed against the design',
      'Bracing complete and secure at all required locations',
      'Scafftag or equivalent inspection tag current and displayed at access points',
    ],
  },
  {
    title: 'Access and Safety',
    items: [
      'Guardrails, toe boards, and platform decking complete with no gaps',
      'Access ladders secured and extending the required height above the platform',
      'Load capacity signage displayed and visible at each level',
      'Exclusion zone and public protection measures confirmed where scaffold is near a public area',
    ],
  },
  {
    title: 'Records and Handover',
    items: [
      'Handover inspection completed and signed by a competent person',
      'Weekly inspection schedule confirmed and responsibility assigned',
      'As-erected drawing or design reference filed against the scaffold record',
      'Client or site team briefed on load limits and any use restrictions before handover',
    ],
  },
]

export default function ScaffoldHandoverPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-relume-ink sm:text-5xl">
            Scaffold Handover Checklist
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Confirming a Scaffold Is Ready Before It's Handed Over for Use
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {scaffoldHandoverSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold text-relume-ink mb-4">{section.title}</h2>
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
