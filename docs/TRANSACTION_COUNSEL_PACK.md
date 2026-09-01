# TRANSACTION COUNSEL PACK (CRANE-authored, 2026-09-01)

## 0. What this document is and is not

This is prep material for the counsel review `docs/COMPLIANCE_GATE.md`
requires before Stage-2 (transactional Transact) can ship. It expands
each item of `COMPLIANCE_GATE.md`'s six-point counsel checklist into
the concrete questions, known facts, and open decisions counsel would
need to actually answer them — organized so a first meeting with
counsel has a real agenda instead of a blank page.

**This is not legal advice, not a substitute for counsel review, and
does not authorize Stage-2 to ship.** `COMPLIANCE_GATE.md`'s Stage-2
block stays in force exactly as written until real counsel sign-off
is recorded there (§5 of that document). Nothing here should be read
as Ferrum OS's legal position on any of these questions — it's the
homework before asking a lawyer, not the answer.

## 1. RERA registration scope, per operating state

**What RERA Section 9 requires (as understood, not as verified):**
real-estate agents facilitating a transaction generally need state
RERA registration. RERA is implemented state-by-state — each state's
Real Estate Regulatory Authority runs its own registration process,
fee schedule, and renewal cycle, and the exact activities that trigger
"agent" status can differ by state's rules under the central Act.

**Questions counsel needs to answer:**
- Does Transact's actual activity (stamp-duty/ask-band estimation,
  demand-token waitlist today; buyer/seller matching, document
  handling, and scheduling if Stage-2 ships) cross the threshold that
  triggers RERA agent registration in each state Ferrum OS operates
  in, or does Stage-1's "informational only" framing keep it below
  that line?
- If registration is triggered: which states first (the same
  Karnataka/Maharashtra/Tamil Nadu set the rest of Transact's sample
  data already uses, or a different launch-state set)?
- Registration is per-state and non-transferable — does Ferrum OS
  register as a company, or do individual staff need to register
  separately in each state?
- What's the renewal cadence and cost per state, and does it change
  if Transact expands to more states later?

## 2. Advocate empanelment process (Advocates Act 1961)

**What's already decided:** Ferrum OS does not itself issue legal
opinions — `COMPLIANCE_GATE.md` states this explicitly. Any due-
diligence opinion a Transact user relies on comes from a licensed
advocate, empaneled via ProMarket (Ferrum's professionals marketplace
product), not generated or signed by Ferrum OS.

**Questions counsel needs to answer:**
- What are the actual empanelment criteria — bar council registration
  verification, minimum years of practice, area-of-practice
  specialization (property law specifically), a conflict-of-interest
  screen?
- What's Ferrum OS's liability exposure for an empaneled advocate's
  bad opinion — does empanelment itself create any implied endorsement
  liability, and if so what disclaimer language on the ProMarket
  listing addresses that?
- Fee structure: does the advocate bill the user directly (matching
  `COMPLIANCE_GATE.md`'s "Ferrum makes no commission/pricing claims"
  Stage-1 rule), or does a Stage-2 model introduce a referral fee —
  and if the latter, does that itself trigger a different regulatory
  question (real-estate agent commission rules, RERA implications)?

## 3. Escrow structure for token/deposit money

**What's already decided:** `COMPLIANCE_GATE.md` item 4 is explicit —
Ferrum OS never pools client funds in company accounts; any token or
deposit money goes through a bank or NBFC escrow partner. This is a
hard constraint, not a question to re-litigate with counsel — the
open question is how to implement it correctly, not whether to.

**Questions counsel needs to answer:**
- Which escrow structure fits: a licensed payment aggregator's escrow
  product (RBI-regulated payment aggregators are required to route
  funds through a nodal/escrow account under RBI's PA/PG guidelines),
  or a dedicated bank escrow account per transaction?
- Does W2-329's Razorpay integration (test-mode, per the architecture
  wave's PaymentProvider abstraction) already provide RBI-compliant
  escrow/nodal-account handling for the payment-aggregator path, or
  does Transact's token-money flow need a separate escrow arrangement
  on top of ordinary payment processing?
- What triggers release of escrowed funds (a document milestone, a
  time period, mutual buyer/seller confirmation) — and who has
  authority to release, dispute, or reverse a release?

## 4. KYC/AML procedure (PMLA 2002)

**What's already decided:** `COMPLIANCE_GATE.md` item 5 requires KYC
maintenance for intermediaries under PMLA. W2-330 (TRANSACT_LIFECYCLE)
scopes KYC capture as part of the buyer/seller state machine, with
document uploads via R2 — the technical capture mechanism, not the
compliance procedure itself.

**Questions counsel needs to answer:**
- What KYC documents are actually required for Ferrum OS's specific
  role (facilitator, not the transacting party) — is this the same
  KYC bar as a payment aggregator, a lighter facilitator-tier
  requirement, or does it depend on transaction value?
- Retention period and access-control requirements for KYC documents
  under PMLA — does Ferrum's existing D1 `leads` table design pattern
  (from `docs/AGENT_INTERFACE.md` §3) extend to KYC data, or does PMLA
  retention/access-control obligations require a stricter, separate
  data store?
- Reporting obligations: does Ferrum OS have any suspicious-transaction
  reporting duty as an intermediary, and if so what threshold triggers
  it and who is the designated reporting officer?

## 5. Advertising rules

**What's already decided:** `COMPLIANCE_GATE.md` item 6 rules out
"guaranteed" claims in advertising, and requires due-diligence
guidance to be subject to advocate sign-off — this mirrors the same
no-guarantee-language rule the Stage-1 UI copy already follows
(`apps/web/app/products/transact/page.tsx`'s compliance section).

**Questions counsel needs to answer:**
- Does RERA's advertising provisions (project promoters' RERA
  registration number disclosure requirements, etc.) apply to Ferrum
  OS's own marketing of the Transact product, or only to the
  underlying property listings a user might bring to the platform?
- Scope of "guaranteed" language to avoid — does this extend to
  Transact's existing Stage-1 estimator copy (already reviewed against
  `COMPLIANCE_GATE.md`'s no-guarantee rule in W2-283..286), or does
  Stage-2 introduce new marketing surfaces (e.g., success-story case
  studies) that need separate review?

## 6. What's out of scope for this pack

- Any actual legal opinion on the six items above — this pack states
  the questions, not answers.
- Payment-processor-specific compliance details for Razorpay
  specifically (PCI-DSS, RBI payment-aggregator authorization status)
  — a W2-329 implementation-level question, though §3's escrow
  question overlaps with it.
- A sign-off log — that lives in `docs/COMPLIANCE_GATE.md` §5, and
  stays empty until real counsel review happens.
