export default function InfrastructureContractorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Infrastructure Contractor Engagement
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Coordinating Multi-Site Civil Works with Real-Time BoQ Tracking
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge</h2>
            <p className="text-gray-600">
              A mid-sized infrastructure contractor was running 14 active civil-works sites
              simultaneously, with BoQs spread across spreadsheets, WhatsApp forwards, and
              three different ERP modules. Quantity surveying and progress certification lagged
              by 10-15 days, blocking monthly client invoices and triggering retention
              disputes on 3 of the 14 sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Approach</h2>
            <p className="text-gray-600">
              The contractor onboarded their entire project-controls team onto Ferrum OS
              BoQ-Pro, consolidating every running BoQ into a single live ledger. Site engineers
              logged measured quantities from mobile against GPS-tagged line items; PMs reviewed
              and approved within 48 hours; client-facing progress reports were auto-generated
              from approved quantities, replacing the manual Excel pack.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Outcome</h2>
            <p className="text-gray-600">
              Within one quarter, the certification cycle dropped from 10-15 days to 3 days.
              Monthly invoicing cleared on time across all 14 sites, recovering roughly 6% of
              revenue that had previously been held in retention disputes. The contractor
              won two new tenders citing their BoQ-Pro turnaround as a differentiator, and
              retired two of the three legacy ERP modules.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
