const pourReadinessSections = [
  {
    title: 'Formwork and Reinforcement',
    items: [
      'Formwork designed against a calculated lateral pressure for the actual pour rate and mix',
      'Rebar cover, spacing, and lap lengths checked against approved drawings',
      'Construction joints and waterstops positioned per the approved pour sequence',
      'Formwork ties, bracing, and shoring inspected and signed off',
    ],
  },
  {
    title: 'Concrete and Site Conditions',
    items: [
      'Mix design confirmed against the approved specification for this pour',
      'Slump and temperature test plan agreed with the batching plant',
      'Ambient temperature and weather forecast checked against pour window',
      'Pour rate and sequence communicated to the pump and placing crew',
    ],
  },
  {
    title: 'Sign-Off and Records',
    items: [
      'Pre-pour inspection checklist signed by site engineer and QA/QC',
      'Curing method and duration confirmed and resourced before the pour starts',
      'Test cube schedule set and labelled for this pour',
      'As-poured record (date, mix, volume, weather) filed against the pour location',
    ],
  },
]

export default function ConcretePourReadinessPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-relume-ink sm:text-5xl">
            Concrete Pour Readiness Checklist
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Confirming a Pour Is Actually Ready Before It Starts
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {pourReadinessSections.map((section) => (
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
