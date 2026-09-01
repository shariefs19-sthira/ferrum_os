export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Last updated: September 1, 2026
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using the Ferrum OS platform, you accept and agree to be bound 
              by the terms and provision of this agreement. If you do not agree to these terms, 
              you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-600">
              All content included on this site, such as text, graphics, logos, images, and 
              software, is the property of Ferrum OS or its content suppliers and is protected 
              by international copyright laws. The compilation of all content on this site is 
              the exclusive property of Ferrum OS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600">
              Ferrum OS shall not be liable for any damages arising out of or related to your 
              use of or inability to use the platform, including but not limited to direct, 
              indirect, incidental, punitive, and consequential damages.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            For questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@ferrum_os.com" className="text-blue-600 hover:text-blue-500">
              legal@ferrum_os.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}