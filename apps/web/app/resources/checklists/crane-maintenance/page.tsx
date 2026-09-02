const craneMaintenanceSections = [
  {
    title: 'Daily Pre-Shift Checks',
    items: [
      'Wire rope, hooks, and slings visually inspected for wear or damage',
      'Brakes, limit switches, and safety devices function-tested',
      'Hydraulic and lubrication fluid levels checked',
      'Outriggers, base, and ground bearing condition inspected before setup',
    ],
  },
  {
    title: 'Periodic Maintenance and Certification',
    items: [
      'Scheduled maintenance completed and logged against the manufacturer interval',
      'Load test and third-party inspection certificate current and on file',
      'Structural components (boom, jib, mast sections) inspected per the periodic schedule',
      'Electrical and control system checks completed by a qualified technician',
    ],
  },
  {
    title: 'Records and Sign-Off',
    items: [
      'Daily check log signed by the operator before each shift',
      'Maintenance and repair history maintained against the crane\'s service record',
      'Any defect logged, tagged out of service, and closed out before return to use',
      'Operator certification and site-specific induction current and on file',
    ],
  },
]

export default function CraneMaintenancePage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-relume-ink sm:text-5xl">
            Crane Maintenance Checklist
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Daily Checks, Periodic Maintenance, and the Records That Back Them Up
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {craneMaintenanceSections.map((section) => (
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
