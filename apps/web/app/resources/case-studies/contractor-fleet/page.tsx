export default function ContractorFleetPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Contractor Fleet Management
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Optimizing Operations for a Multi-Site Construction Company
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Challenge</h2>
            <p className="text-relume-muted">
              A mid-sized construction company with 25 sites and 150+ vehicles struggled 
              with fleet inefficiency, high maintenance costs, and poor utilization rates. 
              Manual tracking led to delays, disputes, and inconsistent service delivery 
              across multiple projects.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Approach</h2>
            <p className="text-relume-muted">
              We implemented an integrated fleet management system with GPS tracking, 
              automated maintenance scheduling, and utilization analytics. The solution 
              provided real-time visibility into vehicle locations, driver behavior, 
              and equipment performance across all project sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Outcome</h2>
            <p className="text-relume-muted">
              The company achieved 30% improvement in fleet utilization and 25% reduction 
              in maintenance costs within six months. Project timelines improved due to 
              better equipment availability, and client satisfaction increased with 
              more reliable service delivery across all sites.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}