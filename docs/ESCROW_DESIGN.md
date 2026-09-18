# ESCROW_DESIGN — Token/Deposit Money Handling for Ferrum Transact (W2-323)

**Status: DESIGN RECOMMENDATION, ATLAS-authored, research only. Not legal
advice and not authority to process money.** `docs/COMPLIANCE_GATE.md`
continues to block every Stage-2 transactional flow until qualified counsel
signs off. Provider underwriting, a written provider confirmation and the
operator's live-funds approval are separate gates.

## 1. Non-negotiable invariant

Ferrum must not receive, hold, pool or temporarily route buyer token/deposit
money through an account that Ferrum owns or controls as beneficial owner.
The target flow is:

`buyer → regulated payment/escrow arrangement → seller or buyer refund`

Ferrum may orchestrate case state and submit an authorised instruction, but
the regulated provider must remain responsible for custody, permitted debits,
settlement and reconciliation. Product copy must not call a flow "escrow" or
"protected" until counsel and the selected provider confirm that description
for the contracted arrangement.

This restates `docs/COMPLIANCE_GATE.md` checklist item 4. It does not decide
the legal classification of Ferrum, the transaction or the provider product.

## 2. Evidence boundary

The following facts are established for this design:

- RBI materials require regulated payment aggregators to operate settlement
  funds through restricted escrow arrangements and describe permitted
  settlement activity. This establishes the payment-aggregator regulatory
  context; it does **not** establish that an ordinary PA checkout is a
  real-estate token escrow.
- Razorpay's Route documentation describes linked accounts, transfers,
  settlement schedules, settlement holds and reversals for marketplace-style
  fund distribution. This establishes technical capabilities; it does **not**
  establish legal suitability for Ferrum's real-estate token/deposit use case.
- Ferrum's current `PaymentProvider` supports order creation, payment and
  webhook signature verification, subscriptions and cancellation. It has no
  linked-account, transfer, settlement-hold, release or reversal contract.
- `transact_cases` and `case_events` provide case-state history, but no current
  schema or service makes those records a money-custody ledger or an approved
  release instruction.

Everything else remains `UNKNOWN` until evidenced by the responsible party.

## 3. Options analysis

### Option A — Razorpay Route as a gated marketplace-transfer rail

Route can technically represent a seller or other permitted recipient as a
linked account, create a transfer from an incoming payment, defer settlement
and later release or reverse it. That aligns well with Ferrum's existing
Razorpay and Worker architecture.

**Advantages**

- Extends the current provider abstraction instead of introducing an unrelated
  integration.
- Offers API-visible linked accounts, transfers, settlement states and webhook
  events that can be reconciled against a Ferrum case.
- Supports held settlement at the product-capability level, allowing a release
  service to remain disabled until a governed case milestone is satisfied.
- Has test-mode documentation suitable for a non-monetary technical pilot.

**Unresolved gates**

- Counsel must determine whether Route's contracted structure and terms are
  suitable for real-estate token/deposit money and whether Ferrum's actions
  create additional RERA, PMLA, payment-aggregation or other obligations.
- Razorpay must confirm in writing that the proposed merchant category, fund
  flow, hold duration, release authority, refund path and dispute model are
  supported under Ferrum's account and onboarding profile.
- The product must establish who is the merchant/beneficiary, who may issue a
  release, what evidence authorises it and what happens during a dispute.
- A payment-aggregator escrow account is part of the provider's regulated
  settlement architecture. Its existence alone does not make Ferrum's user
  transaction a bespoke or fiduciary escrow arrangement.

### Option B — Dedicated bank/NBFC-arranged escrow structure

A bank or appropriately regulated provider establishes a dedicated escrow
arrangement governed by executed agreements. Counsel and the provider define
the account structure, parties, permitted credits/debits, release evidence,
refunds, disputes, reconciliation and reporting. Whether an NBFC may act in a
particular role, or must arrange an account with a bank, is a counsel/provider
question rather than an assumption in this design.

**Advantages**

- Release conditions and dispute handling can be documented for the specific
  real-estate transaction rather than inherited from a general marketplace
  product.
- Custody, authority and beneficiary roles can be stated expressly in the
  executed agreement.
- Better fit where transaction value, hold duration or counterparty risk
  requires transaction-specific controls.

**Costs and dependencies**

- Requires partner selection, underwriting, contracting, operating procedures
  and reconciliation design before implementation can be scoped accurately.
- Introduces a second integration and operating model alongside the current
  Razorpay checkout path.
- Timeline, minimum volume, fees, API support and per-transaction account or
  sub-ledger availability are `UNKNOWN` until providers respond.

## 4. Recommendation

**Use Razorpay Route only as the first technical and commercial due-diligence
candidate; do not select it as the production escrow structure until counsel
and Razorpay close the unresolved gates. If either party cannot confirm the
proposed real-estate token flow in writing, adopt a dedicated bank/provider
escrow arrangement before enabling live funds.**

This recommendation preserves the fastest credible path without converting a
marketplace-transfer feature into an unsupported legal conclusion. It also
provides a deterministic fallback: absence of affirmative evidence selects
Option B; it never silently relaxes the no-self-custody invariant.

## 5. Decision matrix

| Criterion | Razorpay Route candidate | Dedicated bank/provider escrow |
|---|---|---|
| Reuses current Ferrum payment code | Strong | Weak |
| Linked-account and transfer APIs | Documented | Provider-specific / `UNKNOWN` |
| Settlement hold capability | Documented product capability | Agreement-specific / `UNKNOWN` |
| Real-estate token legal sufficiency | `UNKNOWN` pending counsel and provider | `UNKNOWN` pending counsel and provider |
| Bespoke release/dispute rules | Bounded by provider contract and APIs | Potentially strong, subject to agreement |
| Time to validated pilot | Likely shorter, not yet measured | Likely longer, not yet measured |
| Production selection today | **BLOCKED** | **BLOCKED** |

## 6. Integration sequence after gate closure

1. **Freeze the approved fund-flow contract.** Record parties, merchant and
   beneficiary identity, custody boundary, release authority, permitted hold
   duration, refund/reversal path, dispute process, fees and reconciliation.
2. **Extend rather than bypass `PaymentProvider`.** Add provider-neutral
   linked-account, transfer, hold, release, reversal and status-query methods.
   Do not place Route-specific calls directly in case UI code.
3. **Separate payment state from case state.** Store provider identifiers,
   immutable amount/currency, state transitions, idempotency keys, webhook
   evidence and reconciliation status in a dedicated money-movement ledger.
   `case_events` may reference those records but must not replace them.
4. **Default every transfer to non-release.** A captured payment must not
   automatically release. Release requires the approved milestone, required
   evidence, an authorised human decision and a recorded provider response.
5. **Make webhook processing authoritative and idempotent.** Verify signatures,
   reject replayed events, retain raw event identifiers, reconcile provider
   status and escalate mismatches without advancing the case silently.
6. **Implement dispute and refund paths before release.** A hold must block
   automated release. Refund/reversal failure must create an operational alert
   and remain visible until reconciled.
7. **Gate onboarding and data handling.** Implement only the identity/KYC/AML
   process confirmed by counsel and the provider; apply least privilege,
   retention and access controls to every collected document.
8. **Prove the flow without real money.** Test success, duplicate webhook,
   timeout, partial failure, hold, release, reversal, refund and reconciliation
   scenarios. Record evidence against one synthetic case.
9. **Run a separately approved live pilot.** Live credentials, live linked
   accounts and real money remain disabled until counsel sign-off, provider
   approval, security review, operational ownership and operator approval are
   all recorded.

## 7. Required decision record before implementation

The implementation ticket must link evidence for each item below:

- qualified counsel opinion and permitted product wording;
- provider contract/confirmation for the exact fund flow;
- named merchant, beneficiary, release and dispute roles;
- approved state diagram and release evidence;
- data-retention, KYC/AML and access-control requirements;
- settlement, reconciliation and exception ownership;
- fees, limits, hold duration and refund/reversal constraints;
- test-mode acceptance results and security review;
- operator approval for any live-funds pilot.

Until all items are present, the only permitted implementation is isolated
test-mode prototyping with synthetic identities and no real money.

## 8. Repository cross-reference

| Repository source | Consequence for this design |
|---|---|
| `docs/COMPLIANCE_GATE.md` item 4 and GATE | No self-custody; Stage-2 remains blocked pending counsel |
| `docs/TRANSACTION_COUNSEL_PACK.md` §3 | Counsel must decide structure, release authority, disputes and reversals |
| `apps/web/lib/payments/PaymentProvider.ts` | Current contract has no Route/escrow operations |
| `apps/web/lib/payments/RazorpayProvider.ts` | Current integration covers orders, signatures and subscriptions only |
| `apps/web/worker.ts` | Current case events and payment routes are not an escrow ledger |
| `docs/WAVE_QUEUE.md` W2-323 | This document fulfils research/design scope only; it does not authorise code |

## 9. Primary references reviewed

- Reserve Bank of India, payment-aggregator regulatory and escrow-account
  context: <https://www.rbi.org.in/Scripts/PublicationReportDetails.aspx?ID=1214>
- Razorpay Route product overview (linked accounts, transfers, settlement
  plans and settlement holds): <https://razorpay.com/route/>
- Razorpay Route linked-account documentation:
  <https://razorpay.com/docs/payments/route/linked-account/>
- Razorpay Route settlement scheduling and holds:
  <https://razorpay.com/docs/payments/route/schedule-settlement/>

References reviewed 2026-09-18. Provider documentation is evidence of stated
product capability, not independent validation or legal approval.
