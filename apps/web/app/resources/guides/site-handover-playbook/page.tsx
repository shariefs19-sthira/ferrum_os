const handoverPlaybookSections = [
  {
    title: 'Before the Handover Meeting',
    items: [
      'Structural, MEP, and finishes as-built drawings reconciled and complete',
      'Defects register closed out, or every open item scheduled with an owner and date',
      'Statutory approvals, certificates, and occupancy documents collected',
      'Warranty and maintenance documentation assembled by system',
    ],
  },
  {
    title: 'At the Handover Walkthrough',
    items: [
      'Owner walkthrough covers every floor and system, not a sample',
      'Load limits, use restrictions, and maintenance obligations communicated verbally and in writing',
      'Keys, access credentials, and system manuals transferred and logged item by item',
      'Any punch-list item raised during the walkthrough logged with a committed close-out date',
    ],
  },
  {
    title: 'After Handover',
    items: [
      'Document package archived in a location the owner can access without contacting the contractor',
      'Post-handover punch list tracked to closure, not left open indefinitely',
      'Defect-liability period start date confirmed in writing with both parties',
      'A single point of contact named for any post-handover issue during the defect-liability period',
    ],
  },
]

export default function SiteHandoverPlaybookPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Site Handover Playbook
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            A Working Guide to Closing Out a Project Cleanly
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          {handoverPlaybookSections.map((section) => (
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
