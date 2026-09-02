export default function UlpinExplainedPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            ULPIN Explained
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Understanding Unique Land Parcel Identification Number
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">What is ULPIN?</h2>
            <p className="text-relume-muted">
              ULPIN (Unique Land Parcel Identification Number) is a standardized system for 
              identifying land parcels across India. This unique alphanumeric code helps in 
              accurately identifying and tracking land records, reducing disputes and improving 
              transparency in land transactions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Benefits of ULPIN</h2>
            <p className="text-relume-muted">
              The ULPIN system provides numerous benefits including prevention of land fraud, 
              streamlined property transactions, and easier access to land records. It helps 
              in maintaining accurate land records and reduces the scope of illegal land grabbing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Implementation Process</h2>
            <p className="text-relume-muted">
              The implementation of ULPIN involves digitization of land records, survey of 
              land parcels, and assigning unique identification numbers. This process is 
              carried out in collaboration with state revenue departments and survey authorities.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}