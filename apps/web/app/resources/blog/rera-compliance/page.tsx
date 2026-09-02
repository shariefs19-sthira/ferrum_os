export default function ReraCompliancePage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-relume-ink sm:text-5xl">
            RERA Compliance for Project Teams
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Turning Statutory Reporting into a Continuous Discipline
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-relume-ink mb-4">Quarterly Progress and Form-B Discipline</h2>
            <p className="text-relume-muted">
              The Real Estate (Regulation and Development) Act, 2016 obliges every registered
              project to publish quarterly progress on the state RERA portal, including the
              certified Form-B statement of receivables, construction status, and timeline
              deviations. Project teams that treat Form-B as a one-off upload at quarter-end
              almost always end up reconciling rushed figures against their schedule of values.
              The disciplined approach is to keep a single source of truth — a structured
              schedule linked to the BOQ and the contractor billing cycle — so that the same
              numbers that drive invoicing feed the statutory upload.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-relume-ink mb-4">Escrow, CAR, and the Seventy-Percent Rule</h2>
            <p className="text-relume-muted">
              RERA's escrow mandate requires promoters to deposit seventy percent of buyer
              receivables into a designated project account, drawn against a Chartered Accountant
              certificate and a project-wise Cost of Construction (CAR) report. Mismanaging the
              CAR is the single most common cause of RERA non-compliance penalties, because the
              bank, the CA, and the state RERA authority all need the same numbers in slightly
              different formats. A reliable workflow stores the CAR as a versioned artefact
              alongside the BOQ and the bank reconciliation so that any party can be satisfied
              within a working day.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-relume-ink mb-4">Defect Liability, Title, and Post-Handover Records</h2>
            <p className="text-relume-muted">
              RERA's five-year defect liability window and its title-disclosure rules make
              handover-day documentation as important as the construction record itself. Project
              teams that close out the project with a structured defects register, a verified
              encumbrance certificate dated to the day of registration, and a digital copy of the
              approved building plan avoid the disputes that otherwise surface in months seven,
              thirteen, and forty-three. Treating the handover package as a deliverable on the
              master schedule — not a side-task for the project manager — is the difference
              between a clean closure and a series of avoidable consumer forum cases.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
