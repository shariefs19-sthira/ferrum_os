export default function DisclaimersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Disclaimers
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Last updated: September 1, 2026
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">General</h2>
            <p className="text-gray-600">
              Ferrum OS provides software tools that estimate, calculate, and
              summarize construction, structural, land, and financial data.
              These tools are decision-support aids, not professional advice.
              Where a page or output is labeled{' '}
              <strong>INDICATIVE</strong>, the figures shown are derived from
              sample, seeded, or illustrative data and do not represent a
              verified, live, or guaranteed value for your specific project
              or location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Structural checks (Structura)</h2>
            <p className="text-gray-600">
              Structura's IS 456 / IS 800 clause checks are calculated
              outputs based on the inputs you provide and published Indian
              Standard clause formulas. They are not a substitute for review
              and sign-off by a licensed structural engineer, and do not
              constitute a structural design certificate. Ferrum OS is not
              liable for construction decisions made solely on the basis of
              these outputs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">BOQ, rate, and financial estimators</h2>
            <p className="text-gray-600">
              BOQ Pro's three-mode rate calculator, ProMarket's rate
              comparison tool, InvestFlow's IRR/NPV modeler, and Transact's
              stamp-duty and ask-band estimators produce indicative figures
              for planning purposes only. Government-reference and
              Ferrum-band rates are drawn from a limited, periodically
              updated sample dataset and may not reflect current market or
              government rates for your city, category, or state. Always
              verify rates, stamp duty, and registration fees with the
              relevant government authority before making a financial
              commitment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Land intelligence (LandIntel)</h2>
            <p className="text-gray-600">
              LandIntel's ULPIN/parcel lookup currently returns a small set
              of sample parcel records for demonstration purposes and is not
              connected to a live government land-records system. Do not
              rely on LandIntel output as a substitute for an official land
              record, title search, or encumbrance certificate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ferrum Transact — facilitator disclaimer</h2>
            <p className="text-gray-600">
              Ferrum Transact is a facilitation and due-diligence-aid
              service, not a licensed legal practitioner, advocate, or
              real-estate agent, and does not issue legal opinions. Any
              document, checklist, or report Transact produces is a
              due-diligence aid, not legal advice or title insurance, and
              any statement that a matter is "legally green" or similar
              describes workflow status only — it is never a warranty or
              guarantee of legal validity. Where a licensed advocate's
              opinion is involved, that opinion is authored and signed by
              the advocate, not by Ferrum OS. Stamp duty and registration
              fees are paid by the user directly to the relevant government
              authority; Ferrum OS does not collect, hold, or process
              statutory duties on the user's behalf. Any token or deposit
              money handled through Transact is held via a regulated
              escrow arrangement, never pooled in a Ferrum OS company
              account. Transact currently operates in an informational,
              Stage-1 capacity only; transactional (Stage-2) features are
              not yet live.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No guarantee language</h2>
            <p className="text-gray-600">
              Ferrum OS makes no guarantee, warranty, or promise of outcome —
              financial, legal, structural, or otherwise — arising from the
              use of any calculator, estimator, or report on this platform.
              All outputs should be independently verified with a qualified
              professional before you rely on them for a real decision.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            For questions about these disclaimers, contact us at{' '}
            <a href="mailto:legal@ferrum_os.com" className="text-blue-600 hover:text-blue-500">
              legal@ferrum_os.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
