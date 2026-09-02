export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Information We Collect</h2>
            <p className="text-relume-muted">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include your name, email address, 
              and other relevant details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">How We Use Your Information</h2>
            <p className="text-relume-muted">
              We use the information we collect to provide, maintain, and improve our services, 
              to process transactions, and to communicate with you about your use of our platform. 
              We may also use this information for analytics and to develop new products and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Data Security</h2>
            <p className="text-relume-muted">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. We use industry-standard 
              encryption and security protocols to safeguard your data.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-sm text-relume-muted">
          <p>
            For questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@ferrum_os.com" className="text-relume-ink hover:text-relume-ink">
              privacy@ferrum_os.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}