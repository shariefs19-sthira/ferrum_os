export default function LibraryRetrofitPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Public Library Foundation Retrofit
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Budgeting a Foundation Retrofit After the Geotechnical Surprise
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge</h2>
            <p className="text-gray-600">
              A public library's foundation assessment uncovered soil conditions worse than the
              original design assumed, well after the retrofit budget had already been set
              against a materials-only estimate. The project needed a revised budget that could
              absorb the underpinning scope without stalling the wider building programme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Approach</h2>
            <p className="text-gray-600">
              The team re-costed the foundation line item separately from the rest of the
              retrofit, pricing the underpinning access and sequencing constraints explicitly
              rather than folding them into a general contingency line. A larger, dedicated
              contingency was set against the foundation work specifically, sized to the
              geotechnical uncertainty rather than spread thinly across the whole project.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Outcome</h2>
            <p className="text-gray-600">
              The revised budget held through the underpinning work without a further scope cut
              elsewhere in the project, and the library reopened on the reset schedule. The
              separated foundation-contingency approach is now the team's standard practice for
              any retrofit where the below-grade condition isn't fully known before design.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
