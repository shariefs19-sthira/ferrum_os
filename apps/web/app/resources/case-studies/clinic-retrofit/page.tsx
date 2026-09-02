export default function ClinicRetrofitPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Community Clinic Seismic Retrofit
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Keeping a Clinic Open Through Its Own Structural Retrofit
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Challenge</h2>
            <p className="text-relume-muted">
              A community clinic needed a seismic retrofit of its structural frame but could not
              close for the duration of the work — patient care had to continue on the same
              floors the retrofit was touching. Every structural intervention had to be sequenced
              around clinic hours and patient areas rather than the reverse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Approach</h2>
            <p className="text-relume-muted">
              The project team used Ferrum OS BuildOS to run the retrofit as zone-locked work
              packages, isolating one structural bay at a time and scheduling the noisiest work
              — core drilling, jacket pours — for after-hours windows. Each zone required a
              signed inspection before the adjacent zone opened, and a documented handback to
              clinic staff before that area returned to patient use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Outcome</h2>
            <p className="text-relume-muted">
              The clinic remained operational throughout the retrofit with no interruption to
              patient care. The zone-by-zone handback process, with its explicit inspection and
              sign-off gate before each area reopened, became the reference model the team now
              applies to other occupied-building retrofit projects.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
