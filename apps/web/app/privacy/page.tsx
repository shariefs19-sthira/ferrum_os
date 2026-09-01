export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Last updated: September 1, 2026
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include your name, email address, 
              and other relevant details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the information we collect to provide, maintain, and improve our services, 
              to process transactions, and to communicate with you about your use of our platform. 
              We may also use this information for analytics and to develop new products and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. We use industry-standard 
              encryption and security protocols to safeguard your data.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            For questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@ferrum_os.com" className="text-blue-600 hover:text-blue-500">
              privacy@ferrum_os.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}