# ESCROW_DESIGN — Token/Deposit Money Handling for Ferrum Transact (W2-323)

**Status: DRAFT, ATLAS-authored, research/design only — not legal advice,
not an implementation ticket by itself.** This resolves the "which
structure" half of `docs/TRANSACTION_COUNSEL_PACK.md` §3's open question
with a recommendation; it does not override `docs/COMPLIANCE_GATE.md`'s
Stage-2 block, and no Stage-2 code should land against this document alone
— counsel sign-off is still the gate.

## 0. The constraint this design must satisfy

`docs/COMPLIANCE_GATE.md` item 4, verbatim: *"Token money: bank/NBFC escrow
partner; never pool client funds in company accounts (RBI/payment-
aggregator exposure)."* This is non-negotiable and pre-decided — the only
open question is which lawful structure satisfies it, not whether to use
one. Restated as a hard invariant for every option below:

> **No-self-custody principle:** at no point does a Ferrum OS-controlled
> bank account (operating account, current account, or any account Ferrum
> OS is the beneficial owner of) hold buyer token/deposit money, even
> transiently. Money moves buyer → regulated intermediary/escrow → seller
> (or back to buyer on cancellation), and Ferrum OS's own balance sheet is
> never in that path.

## 1. Options analysis

### Option A — Razorpay Route (payment-aggregator escrow/nodal account)

Razorpay is an RBI-authorized Payment Aggregator. Under RBI's PA/PG
(Payment Aggregator/Payment Gateway) guidelines, a licensed PA is required
to settle merchant funds through a nodal/escrow account it maintains at a
scheduled commercial bank — the PA itself cannot commingle customer
payments with its own operating funds either. Razorpay Route is Razorpay's
product for split/marketplace payments: it lets a payment collected from
a buyer be routed to one or more "linked accounts" (Ferrum OS would
configure the seller, or an advocate/escrow-hold destination, as a linked
account) according to a payout schedule Ferrum OS controls via API,
instead of settling the full amount into Ferrum OS's own settlement
account.

**How it satisfies the no-self-custody principle:** the buyer's payment
lands in Razorpay's RBI-mandated nodal/escrow account, not in any Ferrum
OS bank account. Route's linked-account/transfer mechanism controls *when*
and *to whom* the held funds are released, but the funds themselves are
never in Ferrum OS's custody at any point — Ferrum OS only ever holds API-
level authority to trigger a transfer, the same authority level a
marketplace operator has over its sellers' payouts.

**Strengths:**
- Already the integration path W2-322/W2-324 are building (test-mode
  Razorpay checkout, `PaymentProvider` abstraction) — reuses infrastructure
  instead of standing up a second, unrelated payment rail.
- RBI-authorized-PA status means the nodal/escrow requirement is Razorpay's
  regulatory obligation to maintain, not a bespoke arrangement Ferrum OS
  has to negotiate and audit itself.
- Programmable release conditions (via API calls Ferrum OS's Worker makes)
  map cleanly onto Transact's existing buyer/seller state machine
  milestones (W2-322's `transact_cases`/`case_events` tables).
- Faster time-to-launch: no separate bank/NBFC relationship, contract
  negotiation, or reconciliation system to build before Stage-2 can ship.

**Weaknesses / open questions for counsel:**
- Route is designed for marketplace payment splitting generally, not
  purpose-built as a real-estate transaction escrow product — whether its
  standard terms of service and dispute/hold mechanics meet the specific
  legal bar for "escrow" in the real-estate transaction sense (as opposed
  to "held pending a scheduled payout") is exactly the kind of question
  `TRANSACTION_COUNSEL_PACK.md` §3 flags as unresolved.
- Release-trigger flexibility is bounded by what Route's API supports —
  if a real-estate-specific escrow arrangement needs conditions Route
  can't express (e.g., a third-party document-verification checkpoint
  before release), that's a real limitation.
- Dispute resolution and reversal authority default to Razorpay's
  marketplace-dispute process, which may not match what a real-estate
  token-money dispute actually needs.

### Option B — Dedicated bank/NBFC escrow account per transaction

A traditional real-estate escrow arrangement: Ferrum OS partners with a
bank or NBFC that offers a purpose-built escrow product, and each
transaction (or each buyer/seller pair) gets its own escrow account (or
sub-account of a pooled escrow arrangement with per-transaction ledger
tracking) governed by a tripartite escrow agreement (buyer, seller,
escrow agent) with release conditions defined in that agreement.

**How it satisfies the no-self-custody principle:** most directly and
unambiguously — the money never touches any Ferrum OS-adjacent payment
rail at all, only the buyer, the bank/NBFC, and (on release) the seller.

**Strengths:**
- The cleanest, most legally conventional answer — this is literally what
  "escrow" means in Indian real-estate practice, and it's the structure
  RERA's own escrow provisions (for project accounts) are modeled on, so
  counsel and any external auditor will recognize the pattern immediately.
- Release conditions can be as bespoke as the tripartite agreement
  specifies — not bounded by a payment processor's API surface.
- No dependency on Razorpay's PA authorization status or Route product
  roadmap.

**Weaknesses:**
- Requires actually selecting and contracting with a bank/NBFC escrow
  partner — a real operator gate (see `docs/COMPLIANCE_GATE.md`'s counsel
  checklist item 4, and the G. Gate List in the current audit), with its
  own onboarding timeline, minimum-volume/fee negotiations, and likely a
  requirement that Ferrum OS itself hit certain compliance/capitalization
  bars before a bank will offer this arrangement to an early-stage
  platform.
- No existing infrastructure to build on — this is a second, parallel
  payment/settlement integration on top of whatever Razorpay handles for
  ordinary paid features (subscriptions, etc.), roughly doubling the
  payments-integration surface area Ferrum OS has to build and maintain.
- Materially slower to launch — bank/NBFC partner selection and contract
  negotiation is a multi-week-to-multi-month process, not an API
  integration.

## 2. Recommendation

**Recommended: Option A (Razorpay Route) for initial Stage-2 launch, with
Option B kept explicitly open as the target architecture to revisit once
transaction volume or counsel guidance warrants it.**

Rationale:

1. **It satisfies the hard constraint today.** Route's nodal/escrow
   account model is not a workaround of the no-self-custody principle —
   it is the RBI-mandated implementation of "an intermediary regulated
   entity holds the money, not Ferrum OS," which is exactly what
   `COMPLIANCE_GATE.md` item 4 requires. This is not "cheaper but less
   compliant" — it is a lawful, RBI-supervised structure, just one with a
   narrower dispute/release feature set than a bespoke bank escrow.
2. **It reuses committed infrastructure.** W2-322 and W2-324 are already
   building the Razorpay `PaymentProvider` abstraction and test-mode
   checkout. Extending that same provider to support Route's linked-
   account/transfer API is incremental work; standing up a second,
   unrelated bank/NBFC integration in parallel is not — and Ferrum OS has
   no existing bank/NBFC relationship to build on.
3. **Token amounts at Stage-1/early-Stage-2 launch are indicative and
   modest** (per `docs/COMPLIANCE_GATE.md`, Transact's current scope is
   informational/facilitation-only) — the transaction sizes where a
   bespoke bank escrow's stronger dispute/release guarantees become
   materially more important than Route's are more likely to appear as
   Transact's volume and average deal size grow, which is exactly when
   Option B should be revisited.
4. **This recommendation does not resolve `TRANSACTION_COUNSEL_PACK.md`
   §3's open questions** — it narrows them. Counsel still needs to confirm
   Route's terms of service and dispute mechanics meet the legal bar for
   this specific use case before Stage-2 ships; this document gives
   counsel one concrete structure to evaluate instead of two abstract
   options.

**When to revisit Option B:** if counsel determines Route's dispute/
release mechanics don't meet the bar for real-estate token money
specifically, or once Transact's transaction volume/average deal size
makes a dedicated bank/NBFC relationship commercially justified — treat
that as a re-opened design decision, not a failure of this
recommendation.

## 3. Integration sequence (assuming Option A, pending counsel sign-off)

This sequence assumes W2-324's Razorpay test-mode `PaymentProvider`
abstraction has landed. No step here should execute against real funds or
real Razorpay Route linked accounts until `docs/COMPLIANCE_GATE.md` §
counsel checklist item 4 is signed off — every step below stays in
Razorpay test mode until that gate clears, exactly like the rest of
Transact Stage-2.

1. **Extend `PaymentProvider` for Route.** Add linked-account creation and
   transfer-on-checkout support to the existing provider abstraction
   (test-mode Razorpay Route sandbox), rather than a separate payments
   module — keeps one payments code path, not two.
2. **Model release conditions against `transact_cases`/`case_events`
   (W2-322 schema).** A token payment's Route transfer should be created
   in a held/pending state tied to a specific `case_events` milestone
   (e.g., "registration slot confirmed"), not released automatically on
   payment capture — the transfer-trigger logic lives in the Worker, keyed
   off case-state transitions Ferrum OS already tracks.
3. **Design the dispute/reversal path before building release.** Because
   Route's dispute mechanics are a marketplace default rather than a
   real-estate-specific one (see §1 weaknesses), define Ferrum OS's own
   dispute-hold state in `case_events` (e.g., a manual-hold flag that
   blocks the automatic release trigger) so a human-in-the-loop override
   exists independent of what Route's own dispute API offers.
4. **KYC/AML gate the linked-account creation, not just the checkout.**
   Per `TRANSACTION_COUNSEL_PACK.md` §4, PMLA obligations apply to Ferrum
   OS as an intermediary — a seller's Route linked-account should only be
   creatable after their KYC capture step in the buyer/seller lifecycle
   (W2-330 scope) is complete, not before.
5. **Test-mode-only until counsel sign-off, then a staged real-money
   pilot.** Ship and validate the full flow (checkout → held transfer →
   milestone-triggered release → GST invoice) entirely in Razorpay test
   mode first. Once `docs/COMPLIANCE_GATE.md` records counsel sign-off,
   pilot with live keys on a small, monitored transaction volume before
   removing any test-mode gating — this mirrors the same test-mode-then-
   flip pattern already used for the rest of Razorpay integration (see the
   Gated-Item Policy in the current site audit).

## 4. Cross-reference summary

| `COMPLIANCE_GATE.md` item | How this design addresses it |
|---|---|
| Item 4 (escrow, no self-custody) | §1–2: Route's nodal/escrow account is the mechanism; §0 states the invariant explicitly |
| Item 5 (PMLA/KYC) | §3 step 4: linked-account creation gated on KYC completion |
| "GATE" section (Stage-2 blocked pending counsel) | This entire document is explicitly non-authorizing — §3's every step is prefixed on sign-off, and the document opens by saying so |
| `TRANSACTION_COUNSEL_PACK.md` §3 | This document is the direct answer to §3's "which escrow structure fits" question, escalated with a recommendation rather than left open |
