export default function Is1200VsCesmm4Page() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            IS 1200 vs CESMM4
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Comparing Indian and International Standards
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Overview of Standards</h2>
            <p className="text-relume-muted">
              IS 1200 is the standard code of practice for architectural and building works in India, 
              while CESMM4 (Civil Engineering Standard Method of Measurement) is the international 
              standard for measurement of civil engineering works. Both standards provide guidelines 
              for measurement and billing of construction works.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Key Differences</h2>
            <p className="text-relume-muted">
              The main differences between IS 1200 and CESMM4 lie in their scope, classification 
              systems, and measurement procedures. IS 1200 is more focused on building construction 
              with specific Indian context, while CESMM4 covers a broader range of civil engineering 
              works with international applicability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Application in Projects</h2>
            <p className="text-relume-muted">
              The choice between IS 1200 and CESMM4 depends on project requirements, location, 
              and client specifications. International projects often prefer CESMM4 for its 
              global acceptance, while domestic projects in India typically follow IS 1200 for 
              compliance with local regulations and practices.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}