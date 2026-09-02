const monsoonAuditSections = [
  {
    title: 'Site Drainage and Water Management',
    items: [
      'Site drains checked and cleared, confirmed to carry water away from footings and structures',
      'Excavations and open trenches assessed for flooding and side-collapse risk',
      'Temporary works checked for scour risk at footings and shoring',
      'Pump and dewatering equipment tested and staged before the rains start',
    ],
  },
  {
    title: 'Materials and Storage',
    items: [
      'Cement and moisture-sensitive materials moved to raised, ventilated, covered storage',
      'Steel stock protected against surface corrosion during extended wet periods',
      'Formwork and temporary works inspected for water-related degradation risk',
      'Electrical installations and temporary power checked for water ingress protection',
    ],
  },
  {
    title: 'Schedule and Safety Readiness',
    items: [
      'Pour schedule reviewed against the monsoon forecast, with wet-weather contingency built in',
      'Safety briefing delivered on wet-weather site hazards (slips, exposed excavations, electrical)',
      'Emergency contact and evacuation plan confirmed for flood-prone site areas',
      'Site access roads assessed and reinforced where waterlogging is likely',
    ],
  },
]

export default function MonsoonPreparednessAuditPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Monsoon Preparedness Audit Guide
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Getting a Site Ready Before the Rains Start, Not After
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {monsoonAuditSections.map((section) => (
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
