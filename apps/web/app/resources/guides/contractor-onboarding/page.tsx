const onboardingSections = [
  {
    title: 'Pre-Contract Verification',
    items: [
      'Trade licenses, GST registration, and statutory compliance certificates verified',
      'Bank guarantee or security deposit terms confirmed and documented',
      'Insurance coverage (CAR, workmen compensation) validated against project requirements',
      'Reference checks completed for at least two comparable prior projects',
    ],
  },
  {
    title: 'System and Workflow Setup',
    items: [
      'Contractor added to the project BOQ and billing workflow with correct rate schedule',
      'Site access, safety induction, and PPE requirements briefed and acknowledged',
      'Point of contact and escalation path agreed for both sides',
      'Measurement and certification cadence (weekly/fortnightly) confirmed',
    ],
  },
  {
    title: 'First 30 Days',
    items: [
      'First progress claim reviewed jointly to align on measurement conventions',
      'Any onboarding friction (system access, documentation gaps) logged and resolved',
      'Contractor performance checkpoint scheduled at 30 days against the contract KPIs',
      'Change-order and variation process walked through with a live example',
    ],
  },
]

export default function ContractorOnboardingPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Contractor Onboarding Guide
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Getting a New Contractor from Signed Contract to First Certified Claim
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {onboardingSections.map((section) => (
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
