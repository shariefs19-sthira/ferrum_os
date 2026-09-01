# ENGINE VERIFICATION & VALIDATION PLAN (CRANE-authored, 2026-09-01)

## 0. Scope and status

This document defines how the compute engine described in
`docs/ENGINE_ARCH.md` gets verified before its output is trusted for a
real IS-code pass/fail decision. Like `ENGINE_ARCH.md`, this is a
**post-launch rail** — research only, no code lands from this
document, and no V&V run happens until the engine it verifies actually
exists.

Verification and validation are two different questions, and this plan
keeps them separate:

- **Verification** — did we implement the math correctly? (Does the
  solver invocation, input-deck generation, and post-processor produce
  the number the underlying theory says it should?)
- **Validation** — is the underlying theory the right one for this
  problem? (Is IS 456's clause interpretation correct, is the solver
  configuration appropriate for the structure type?)

## 1. IS worked examples

Indian structural design textbooks and IS-code commentary publish
fully worked numerical examples — a defined structure, defined loads,
and a defined, hand-calculated answer per the relevant clause. These
are the primary verification fixture: run the same structure and loads
through Ferrum's engine, and check the engine's output against the
published hand-calculated answer within a defined tolerance.

- **Coverage target:** at minimum one worked example per IS-code check
  the engine implements — starting with the two `is-check` already
  runs today (IS 456 Cl 26.5.1.1 minimum reinforcement, IS 800 Cl 3.8
  slenderness ratio) so T1's existing formula-based checks have a
  documented published-example match, not just an internally-derived
  formula. Growing alongside `ENGINE_ARCH.md`'s tier rollout — a new
  T2/T3 check doesn't ship without a worked-example fixture backing it.
- **Tolerance:** a percentage tolerance per check type (tight for
  simple closed-form checks like T1's, wider for T2/T3's iterative
  nonlinear solutions where exact convergence to a hand-calculated
  number isn't the right bar) — the specific tolerance number per
  check is a decision made when that check's fixture is actually
  built, not fixed here in the abstract.
- **Source discipline:** every worked example cites its source
  (textbook title/edition, or the IS-code commentary document and
  clause) in the fixture itself — matching the same source-citation
  discipline `docs/COMPLIANCE_GATE.md` applies to the Transact
  product's rate data. A worked example with no citable source is not
  a valid fixture.

## 2. NAFEMS benchmarks

NAFEMS (the international association for the engineering modelling,
analysis and simulation community) publishes benchmark problems
specifically designed to verify FEA solver correctness — independent
of any particular code, IS or otherwise. These verify the *solver
layer itself* (OpenSees/CalculiX/Code_Aster, per `ENGINE_ARCH.md` §1),
distinct from §1's IS-specific worked examples which verify Ferrum's
*use* of the solver against Indian code requirements.

- **Purpose:** catch a solver misconfiguration, mesh error, or
  input-deck generation bug that a correctly-verified IS worked example
  might not surface — a NAFEMS benchmark is chosen precisely because
  its correct answer is known and independent of any IS-code
  interpretation question.
- **Selection:** benchmarks matched to the structural analysis classes
  `ENGINE_ARCH.md` §3's tiers actually use — linear static (T2) and
  representative nonlinear/dynamic (T3) benchmark problems, not the
  full NAFEMS catalog. Picking the subset that maps to Ferrum's actual
  usage is part of the build task, not fixed here.
- **Independence from IS worked examples:** a NAFEMS benchmark passing
  says the solver invocation is mechanically correct; it does not say
  an IS-code clause was interpreted correctly. Both fixture types are
  required — one without the other leaves a real gap.

## 3. Run cadence: per release, published

Every release that touches the engine (a solver version bump, a
post-processor change, a new IS-code check) re-runs the full fixture
set (§1 + §2) before that release ships. Results are published — not
buried in a CI log only the build task's author sees. This mirrors the
transparency stance already established for other indicative/sample
data in this product (`docs/AGENT_INTERFACE.md`'s `indicative: true`
fields, `docs/COMPLIANCE_GATE.md`'s cited sample rates): if a user or
an agent is going to trust an IS-code pass/fail result, the evidence
that result is trustworthy needs to be as visible as the result itself.

**What "published" means concretely** (exact mechanism is a build-task
decision, not fixed here): a results page or file listing every
fixture, its expected value, its actual value, the tolerance band, and
pass/fail — versioned alongside the release it validates, so a past
release's V&V record stays inspectable after a later release changes
the fixture set.

## 4. What triggers a re-run outside the normal release cadence

- A solver version upgrade (OpenSees/CalculiX/Code_Aster) — a solver's
  own bug fixes or behavior changes can silently shift results.
- A change to the IS-code post-processor (`ENGINE_ARCH.md` §2) — any
  edit to how raw solver output maps to a pass/fail rule.
- A newly-added worked example or benchmark, run once against the
  *current* engine before being accepted into the permanent fixture
  set — a fixture that doesn't pass against a known-good engine state
  is a broken fixture, not a real regression signal.

## 5. What this document does not cover

- The specific worked examples and NAFEMS benchmark IDs to use —
  selected when each IS-code check or solver tier is actually built
  (§1, §2).
- The exact publishing mechanism/format for results (§3) — a build-
  task implementation decision.
- CI/automation details for triggering re-runs (§4) — decided
  alongside whatever compute topology `ENGINE_ARCH.md` §4 settles on,
  since the V&V run itself needs the same T2/T3 compute tier the
  engine does.
