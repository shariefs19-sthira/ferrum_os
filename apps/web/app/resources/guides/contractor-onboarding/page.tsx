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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Contractor Onboarding Guide
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Getting a New Contractor from Signed Contract to First Certified Claim
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {onboardingSections.map((section) => (
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
