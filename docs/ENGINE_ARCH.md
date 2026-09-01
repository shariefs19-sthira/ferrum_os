# ENGINE ARCHITECTURE (CRANE-authored, 2026-09-01)

## 0. Scope and status

This document is a design for Ferrum OS's structural analysis compute
engine — the real solver layer behind Structura's IS-code checks,
beyond the two textbook checks `is-check` implements today
(`docs/AGENT_INTERFACE.md` §3, `lib/checks/isCode.ts`). It is a
**post-launch rail** per `docs/LAUNCH_ARCHITECTURE.md` — nothing here
is a build task for the current wave; it is the design a future wave
builds from. No code lands from this document; it is research only.

## 1. Why headless open-source solvers, not a from-scratch FEA engine

Building a finite-element solver from scratch is a multi-year
undertaking with a large correctness-verification burden (see
`docs/ENGINE_VV.md` for what that burden looks like). Three mature,
open-source, headless-capable solvers already cover the analysis types
Ferrum's product surface needs:

- **OpenSees** (Open System for Earthquake Engineering Simulation) —
  nonlinear structural and geotechnical analysis, purpose-built for
  seismic behavior. Fits Structura's seismic-check surface and
  BuildOS-adjacent retrofit workflows. Runs headless via its Tcl or
  Python (OpenSeesPy) interpreter — no GUI dependency, scriptable from
  a batch job.
- **CalculiX** — general-purpose linear/nonlinear FEA (Abaqus-compatible
  input format), strong for static structural analysis: beams, slabs,
  frames — the bulk of ordinary building design checks. Headless via
  its `ccx` solver binary, driven by a generated `.inp` deck.
- **Code_Aster** — EDF's general FEA code, broader nonlinear/thermal/
  coupled-physics capability than CalculiX, heavier to operate.
  Reserved for the T3 tier (§3) where CalculiX's simpler nonlinear
  support isn't enough — not the default path for ordinary checks.

Each is independently maintained, independently verified against its
own benchmark suites, and each has a large existing user base outside
Ferrum OS — using them means Ferrum's compute layer inherits
correctness work the ecosystem has already done, and the V&V plan
(`ENGINE_VV.md`) verifies Ferrum's *use* of them, not the solvers
themselves from scratch.

## 2. IS-code design post-processors

None of the three solvers speak "IS 456" or "IS 800" natively — they
output raw stresses, strains, and forces. The design post-processor
layer sits between raw solver output and a pass/fail IS-code check:

1. **Solver runs**, produces member forces/moments/stresses in its
   native output format.
2. **Post-processor parses** that output into a normalized internal
   shape (member id → {axial, shear, moment, ...}).
3. **Code-check rules** (the same pattern `lib/checks/isCode.ts`
   already establishes for the two textbook checks it runs today)
   apply the relevant IS 456 (RCC) or IS 800 (steel) clause against
   each member's forces, producing the same `{ rule, pass, note }`
   shape the `is-check` tool already returns.

This means the *existing* `is-check` tool contract
(`docs/AGENT_INTERFACE.md` §3) doesn't change when this rail lands —
its inputs grow richer (a full structural model instead of four scalar
params) and its rule table grows deeper (real clause-by-clause checks
instead of two), but the shape an agent or the UI receives stays the
same. That's a deliberate design constraint: this rail is additive to
what's already shipped, not a breaking replacement of it.

## 3. Scope tiers T1–T3

Not every check needs the same solver weight. Three tiers, escalating
by structural complexity and nonlinearity:

- **T1 — hand-check parity.** Single members, linear, closed-form
  checkable (the beam/column checks `is-check` already runs). No
  solver invocation at all — pure formula, as today. Instant response.
- **T2 — linear frame/slab analysis.** Multi-member structures,
  linear-elastic, static loads. CalculiX is the default solver here —
  fast, well-suited to this class, headless-friendly for a batch job
  with a bounded runtime.
- **T3 — nonlinear/seismic/advanced.** Nonlinear material behavior,
  seismic time-history, soil-structure interaction, or coupled
  physics. OpenSees for seismic-specific nonlinear work; Code_Aster
  where CalculiX's nonlinear support or Code_Aster's broader coupled-
  physics capability is actually needed. Longest-running tier, the one
  most likely to need async job handling rather than a synchronous
  request/response.

A request routes to the lowest tier that can answer it correctly —
T1 first, escalating only when the structure/load case genuinely needs
more solver capability. This keeps the common case (most of Structura's
real-world checks are T1/T2-shaped) fast and cheap, and reserves the
expensive tier for the load cases that actually require it.

## 4. Compute topology

Cloudflare Workers cannot run these solvers directly — they're native
binaries with real runtime requirements (memory, CPU-bound numerical
work, filesystem I/O for their input/output decks) that don't fit the
Workers isolate model `docs/AGENT_INTERFACE.md`'s Worker already runs
in. The compute topology this rail needs:

- **T1 stays in the Worker** — it's pure JS/TS formula evaluation
  (already true today), no external compute needed.
- **T2/T3 run on a separate compute tier** — a container or VM-based
  job runner (not specified further here; the concrete platform choice
  — Cloudflare Containers, a queue-backed worker pool on another cloud,
  etc. — is an implementation decision for whenever this rail is
  actually scheduled, not a commitment this design doc makes).
- **The Worker's role for T2/T3 becomes orchestration, not execution:**
  accept the request, validate/queue it, and either poll or receive a
  callback when the job tier finishes, returning the same normalized
  `{ rule, pass, note }` shape §2 describes regardless of which tier
  answered.
- **Async by default for T2/T3.** A CalculiX or OpenSees run is not
  guaranteed to finish inside a single request/response cycle. The
  existing MCP `is-check` tool's stateless, single-round-trip shape
  (`docs/AGENT_INTERFACE.md` §5's "every launch tool is stateless
  per-call") holds for T1 as-is; T2/T3 need either a job-id-then-poll
  pattern or, if the MCP protocol's task-support extension is mature
  enough by the time this rail is built, that mechanism instead —
  this is a decision for the rail's own build task, not this doc.

## 5. What this document does not cover

- Concrete input-deck generation code (translating Ferrum's internal
  structural model into OpenSees Tcl/Python, CalculiX `.inp`, or
  Code_Aster `.comm` format) — implementation detail for the build
  task, not a design commitment here.
- The specific compute platform for T2/T3 (§4) — deliberately left
  open; whoever builds this rail chooses based on the infra options
  available at that time.
- Licensing/compliance review of bundling or invoking these
  solvers in a commercial product — OpenSees (BSD-like), CalculiX
  (GPL v2), and Code_Aster (GPL v2/v3, EDF-maintained) all have
  different license postures; a real legal review of how Ferrum OS
  invokes each (as a subprocess vs. statically linked, etc.) is a
  prerequisite for building this rail, not something this design doc
  resolves.
- Cost modeling for T2/T3 compute — real infra cost is a build-time
  concern once a compute platform (§4) is chosen.
