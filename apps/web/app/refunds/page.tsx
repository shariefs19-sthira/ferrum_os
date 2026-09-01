export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Refund Policy
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Last updated: September 1, 2026
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current status</h2>
            <p className="text-gray-600">
              Ferrum OS's paid subscription tiers (Pro, Enterprise) are not yet
              processing live payments. Where a plan is described as a paid
              tier on our pricing page, checkout is currently in test mode
              only, and no real charge is made. This policy describes the
              refund terms that will apply once live billing is enabled, and
              will be updated to reflect the actual live-billing start date
              at that time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription refunds</h2>
            <p className="text-gray-600">
              Once live billing is active, subscription fees are billed in
              advance for the billing period selected (monthly or annual).
              If you cancel a subscription, you retain access to paid
              features through the end of the billing period you already
              paid for; we do not provide prorated refunds for the unused
              portion of a billing period, except where required by
              applicable Indian consumer-protection law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erroneous or duplicate charges</h2>
            <p className="text-gray-600">
              If you are charged in error — for example, a duplicate charge
              caused by a payment-processing fault, or a charge after you
              cancelled — contact us and we will investigate and refund the
              erroneous amount to your original payment method, typically
              within 7–10 business days of confirming the error.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Transact token/deposit money</h2>
            <p className="text-gray-600">
              Ferrum Transact's token or deposit payment flow is separate
              from subscription billing and is governed by its own
              escrow-based terms (see our{' '}
              <a href="/disclaimers" className="text-blue-600 hover:text-blue-500">
                Disclaimers
              </a>{' '}
              page and the Transact product page for current disclaimers).
              Token/deposit money is never pooled in a Ferrum OS company
              account; release or return of such funds follows the escrow
              arrangement's own terms, not this subscription refund policy.
              As of this policy's last-updated date, Transact's transactional
              (Stage-2) flows have not launched.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to request a refund</h2>
            <p className="text-gray-600">
              Email us with your account details and the reason for the
              request; we aim to respond within 3 business days.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            For refund requests or questions, contact us at{' '}
            <a href="mailto:billing@ferrum_os.com" className="text-blue-600 hover:text-blue-500">
              billing@ferrum_os.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
