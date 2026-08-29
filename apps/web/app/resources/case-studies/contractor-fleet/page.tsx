export default function ContractorFleetPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Contractor Fleet Management
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Optimizing Operations for a Multi-Site Construction Company
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge</h2>
            <p className="text-gray-600">
              A mid-sized construction company with 25 sites and 150+ vehicles struggled 
              with fleet inefficiency, high maintenance costs, and poor utilization rates. 
              Manual tracking led to delays, disputes, and inconsistent service delivery 
              across multiple projects.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Approach</h2>
            <p className="text-gray-600">
              We implemented an integrated fleet management system with GPS tracking, 
              automated maintenance scheduling, and utilization analytics. The solution 
              provided real-time visibility into vehicle locations, driver behavior, 
              and equipment performance across all project sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Outcome</h2>
            <p className="text-gray-600">
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