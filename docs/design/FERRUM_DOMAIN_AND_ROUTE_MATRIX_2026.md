# Ferrum Domain and Route Matrix (2026)

Status: proposal / documentation only. No application code changes are
included in this document. Written against the code in the
`w2-499-homepage-redesign-spec` worktree as of 2026-09-17, as a companion
to `docs/design/HOMEPAGE_REDESIGN_2026.md` (the Project Decision Console
redesign, §5 of that document).

Scope: how each `apps/web/app/**` route and the external
`ferrumprojects.in` holding site should be classified, and what domain
and privacy controls the operator's stated decision requires, given the
current state of the two-site (`ferrumos.*` / `ferrumprojects.in`)
posture.

**Correction pass (2026-09-17):** the previous version of this document
classified several routes KEEP on weak evidence — a route existing, a
legal page merely not mentioning "Ferrum Projects," or source-level code
existing — rather than on verified content, claims, or deployed state.
This version re-inspects every route against a stricter standard: route
existence alone never justifies KEEP; absence of "Ferrum Projects" from
a legal page does not establish that the page is legally or
product-specifically adequate; source-level authentication code does
not establish deployed account readiness; and evidence from one product
route is never extrapolated across all ten. Every classification below
was re-derived under that standard, and every place this pass could
only do a shallow/grep-level check rather than a full content
verification says so explicitly, rather than implying a deeper check
than was actually done.

## Route classification table

Classification key: **KEEP** (no change needed, verified), **MOVE**
(relocates, doesn't disappear), **REWRITE** (content/structure changes
needed), **HOLD** (not promoted/not shipped forward as authoritative
until a named gap closes), **CROSS-LINK** (an optional link between two
otherwise-independent surfaces, gated on conditions), **UNKNOWN**
(existing content was inspected but only at a shallow/grep level —
claim-labeling discipline was checked, not each individual factual
claim against backend/deployed evidence — so KEEP is not yet earned and
no defect was found either).

| Route | Classification | Reason |
|---|---|---|
| `/` | REWRITE | Per the Project Decision Console redesign (`docs/design/HOMEPAGE_REDESIGN_2026.md` §5). File exists at `apps/web/app/page.tsx`. |
| `/products` | REWRITE | Changed from KEEP in the previous version. Per `docs/design/HOMEPAGE_REDESIGN_2026.md` §5.4 item 2, the homepage's `productShowcaseItems` grid (`apps/web/app/page.tsx:12-23`) is relocated to sit directly below the hero as the Project Decision Console's "ten-product map." `apps/web/app/products/page.tsx:11-22` maintains its own, separately-authored ten-product array (same ten products, different copy per entry) rendered through the same `CardGrid` component (`page.tsx:4,37`) that the relocated homepage section also uses. Once the redesign ships, the site has two independently-styled, independently-maintained product-map surfaces describing the same ten products with different summaries — this route's role needs to be reconciled with the Console hierarchy (e.g. as the deeper/canonical listing the homepage's map links into, with a single shared data source), not left as an untouched duplicate. |
| `/pricing` | HOLD | File exists at `apps/web/app/pricing/page.tsx`. Both the homepage (`page.tsx:44-64`'s `pricingPlans`) and the dedicated pricing page (`pricing/page.tsx:18-22`'s `tiers`) state ₹499/mo and ₹9,999/mo with no attribution for either figure. `pricing/page.tsx:60` additionally repeats the unverified "60–90% below global tools" comparison already flagged in the homepage doc (`page.tsx:125`). Payment processing falls back to a stub when Razorpay isn't configured: `worker.ts:50-54`'s `getPaymentProvider` returns `new RazorpayProvider(...)` only if `env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET` are both set, otherwise `new StubPaymentProvider()`; `worker.ts:65-69` documents the same fallback in a comment. Commercial authority (real pricing, real payment collection) is unverified as shipped; held per the operator's decision. |
| `/about` | REWRITE | Changed from KEEP. File read in full: `apps/web/app/about/page.tsx`. The page states unsourced company statistics as fact — "50+ Team Members," "200+ Projects Completed," "15+ Years Experience" (`page.tsx:6-19`) — with no attribution, and names eight specific people with titles ("Alex Johnson, CEO & Founder"; "Sarah Chen, CTO"; and six more, `page.tsx:44-53`) rendered as a real team roster with initials-in-a-circle avatars (`page.tsx:107-119`). Nothing in this task's research establishes these are real people, a real founding story, or verified company facts — this is the same pattern already identified and corrected elsewhere in this codebase as fabricated content (the homepage doc's §1 references to W2-345's fabricated testimonials and the W2-347 overstated-capability rewrite). REWRITE pending verified company, team, customer, capability, and identity facts — the page cannot simply stay live as-is. |
| `/contact` | REWRITE | Changed from KEEP. File read in full: `apps/web/app/contact/page.tsx`. Two different, inconsistent sets of contact information are both live on the same page: (1) a generic placeholder-pattern block — "123 Construction Avenue, Tech District, TD 12345, Innovation City" and phone "+1 (555) 123-4567" (`page.tsx:53-58,74,239-242`) — the `555` prefix and "Innovation City"/"Tech District" naming match the standard fictional-placeholder pattern, not a real address; and (2) a separate, much more specific three-office block — Bengaluru HQ at "4th Floor, Ferrum Tower, Outer Ring Road, Marathahalli, Bengaluru, KA 560037" with phone "+91 80 4000 2200," plus Mumbai and London offices with their own addresses and phone numbers (`page.tsx:88-130`). Both blocks appear on the same page with no indication which (if either) is real, and the building name "Ferrum Tower" for a company whose own incorporation is still pending (per the post-incorporation input register below) is itself a claim needing verification, not an assumption. The contact emails use the domain `ferrum_os.com` (`page.tsx:68,135-136`) — an underscore is not a valid character in a real domain name, and this does not match the `ferrumos.*` domain family this document otherwise uses throughout, which is a concrete, checkable defect independent of the authority question. This is not merely "pending approval" (which would support HOLD) — it is actively publishing at least one placeholder address/phone and a malformed email domain as if live. REWRITE pending approved public email, telephone, office status/address, and support ownership, not HOLD, because what's currently shown is demonstrably wrong, not merely unapproved. |
| `/terms`, `/privacy` | HOLD — drafts only, authority claims unverified | Files read in full: `apps/web/app/terms/page.tsx` and `apps/web/app/privacy/page.tsx`. The previous version of this document treated "grepped clean of 'Ferrum Projects'" as sufficient evidence these pages are adequate on their own terms — it was not. Reading both in full: neither page names a real legal entity (both refer only to "Ferrum OS" as a platform, never a company/registered name), neither states a jurisdiction or governing law, neither names a data controller or processor, neither states a data-retention period, and neither describes a user-rights process (no access/deletion/correction request mechanism, no reference to any applicable law such as India's DPDP Act or GDPR). Both are three-section generic templates (Terms: Acceptance of Terms / Intellectual Property / Limitation of Liability, `terms/page.tsx:16-41`; Privacy: Information We Collect / How We Use Your Information / Data Security, `privacy/page.tsx:16-40`) with a static "Last updated: January 1, 2024" (`terms/page.tsx:10`, `privacy/page.tsx:10`) and contact addresses at the same malformed `ferrum_os.com` domain flagged on the contact page (`terms/page.tsx:47-48`, `privacy/page.tsx:46-47` — `legal@ferrum_os.com`, `privacy@ferrum_os.com`), which is now a confirmed site-wide pattern across three routes, not an isolated typo. These are placeholder/generic legal templates, not pages adequate on their own terms. They stay live as **DRAFTS ONLY** until approved jurisdiction, entity, controller, processor, retention, rights, and policy facts are supplied — held per the operator's exact instruction, not weakened. |
| `/signup`, `/login` | KEEP, with the source-vs-deployed distinction made explicit | Files exist at `apps/web/app/signup/page.tsx` and `apps/web/app/login/page.tsx`. **What's real and verified (source-level):** `worker.ts:602` (`app.post('/api/auth/signup', ...)`) and `worker.ts:630` (`app.post('/api/auth/login', ...)`) are genuine handlers — email validation, D1-backed rate limiting (`worker.ts:608,636`), real password hashing and verification (`hashPassword`/`verifyPassword`, used at `worker.ts:611,645`), session creation as HttpOnly/Secure cookies (`createSession`, `worker.ts:625,648`; comment at `worker.ts:597` confirms the cookie mechanism), and a full email-verification + password-reset flow (`worker.ts:667-720`, using Resend). This is real working implementation, not a stub. **What is NOT established (deployed-account readiness):** this task searched `docs/ACTIVITY_LOG.md` and `docs/TASK_BOARD.md` for any record of the deployed edge's signup/login flow actually being exercised end-to-end — a real account created and logged into on the live URL. The only relevant record found is W2-362 "ALL_TOOLS_LIVE_SWEEP (deployed-edge verification)" (`ACTIVITY_LOG.md:722`), whose scope explicitly includes "auth flow" against the deployed workers.dev edge — but every occurrence of that entry in the log (searched, seven near-duplicate copies) is the *queuing* action only ("Files Modified: docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md," "Next Steps: CRANE claims W2-362"), never a completion/results entry, and `docs/TASK_BOARD.md` has zero occurrences of W2-362 at all. **No deployed verification record exists — stated plainly, not assumed either way.** Source implementation existing and deployed account readiness being verified are two different claims; only the first is true today. Classified KEEP as a route (it's real, not fabricated), but neither route should be promoted as a CTA ahead of that missing deployed verification. |
| `/products/landintel` | UNKNOWN | File exists at `apps/web/app/products/landintel/page.tsx`, own independent inspection (grep-level only). Labeling is consistent: ULPIN lookup, scenario forecast, and the interactive map are marked "(live)" (`page.tsx:21-23`), but the FAQ (`page.tsx:71`) and hero copy (`page.tsx:92`) qualify the lookup as "seeded, indicative records only... not an official land-record integration," and zoning/soil/hazard/feasibility/investment-forecast claims are explicitly "not yet built" (`page.tsx:24-27`). This task confirmed the labeling is present and internally consistent; it did not independently verify that the D1-backed lookup or scenario math actually function correctly on the deployed edge — that remains unchecked. |
| `/products/designstudio` | UNKNOWN | File exists, own independent inspection (grep-level only). One feature marked "(live)" — test-fit massing with DXF export (`page.tsx:19`); AI generation, elevation library, plan editor, and 3D viewer are explicitly "(roadmap)"/"not yet built" (`page.tsx:20-23`), and a source comment (`page.tsx:15`) states no 3D viewer is implemented anywhere in the codebase, consistent with that label. FAQ (`page.tsx:66,70,74`) repeats the same split in plain language. Labeling holds up at grep level; the massing calculator's actual correctness was not independently re-verified. |
| `/products/structura` | UNKNOWN | File exists, own independent inspection (grep-level only). One feature marked "(live)" — IS 456/IS 800 clause checks with cited results (`page.tsx:22`); model import, FEA, sign-off workflow, and drawing generation are "(roadmap)" (`page.tsx:23-26`). Elsewhere on the page (`page.tsx:166,174`), RC beam sizing is separately labeled "indicative" and "rounded," distinguished from the live clause checks rather than conflated with them. Labeling holds up at grep level; the correctness of the two live clause checks against actual IS 456/IS 800 text was not independently re-verified. |
| `/products/boq-pro` | UNKNOWN | File exists, own independent inspection. This is the one route the previous version of this document spot-checked: its FAQ (`page.tsx:106`) confirms export is "not yet wired for that purpose" from this rate calculator, and the separate BOQ Pro take-off tool's print/PDF export "is not connected to this page" — that specific finding is carried forward unchanged, not re-litigated. Beyond it, the rest of the page's labeling was checked at grep level only this pass: cost-split scenario marked "(live)" (`page.tsx:37-39`), quantity take-off/brand-wise materials/cross-product integrations (DesignStudio, ProcureHub, BuildOS) marked "not yet built"/"roadmap" (`page.tsx:40-41,60-62`). Labeling is consistent; claims beyond the already-verified export disconnect were not independently re-verified. |
| `/products/promarket` | UNKNOWN | File exists, own independent inspection (grep-level only). One feature marked "(live)" — rate comparison across sample cities (`page.tsx:17`); verified profiles, job posting, proposals, escrow, and reviews are all "(roadmap)" (`page.tsx:18-22`), and the FAQ (`page.tsx:66-67`) states plainly the professionals marketplace "is not live yet," pointing to `docs/ESCROW_DESIGN.md` as a design doc rather than a shipped feature. Labeling holds up at grep level; the rate-comparison tool's own accuracy was not independently re-verified. |
| `/products/buildos` | UNKNOWN — notably 0% live | File exists, own independent inspection (grep-level only), and worth flagging distinctly from the other nine: no feature on this page is labeled "(live)" anywhere in it (`page.tsx:17-22`) — common data environment, task management, RFIs/submittals, QA/QC & HSE, progress tracking, and measurement books/RA bills are all "not yet built"; both pricing tiers are themselves labeled "(roadmap)" (`page.tsx:41,47`); and the FAQ states outright "nothing on it is buildable or usable today" (`page.tsx:67`). The labeling is internally honest about being entirely roadmap, which is a genuine positive signal, but it also means this route currently has zero live product functionality behind it — worth the operator's attention as a distinct fact from the labeling-discipline question. |
| `/products/procurehub` | UNKNOWN — notably 0% live | File exists, own independent inspection (grep-level only), same flag as BuildOS: no feature is labeled "(live)" anywhere (`page.tsx:15-20`) — material requests, purchase orders, delivery tracking, supplier directory, bill reconciliation, and payment integration are all "not yet built," and a source comment (`page.tsx:11`) confirms no payment integration exists anywhere in the codebase, consistent with the label. Labeling is internally consistent but describes a route with zero live functionality today. |
| `/products/investflow` | UNKNOWN | File exists, own independent inspection (grep-level only). Cash-flow modeling and IRR/NPV are marked "(live)" (`page.tsx:15-16`), but the page's own feature list caveats the IRR/NPV line with "yield is not computed" even while calling it live (`page.tsx:58`) — a live calculation that discloses its own scope gap rather than overclaiming. Sensitivity analysis, investor dashboards, capital commitment, and scenario planning are "not yet built" (`page.tsx:17-20`). Labeling holds up at grep level; the cash-flow/IRR/NPV math itself was not independently re-verified. |
| `/products/communitybuild` | UNKNOWN — one internally ambiguous item found | File exists, own independent inspection (grep-level only). No feature is clearly labeled "(live)." Worth flagging specifically: the "Construction status (demo)" item's own title says "(demo)" but its body text says "A fixed sample status, not live per-project tracking — not yet built" (`page.tsx:23`) — title and body disagree about whether any demo currently exists, which this pass did not resolve. SPV creation, investor commitments, KYC/AML (explicitly noted as existing elsewhere on the platform for Transact only, not for CommunityBuild, `page.tsx:22`), profit distribution, and investor reporting are all "not yet built." This route needs a closer look at that one ambiguous line specifically, beyond what a grep-level pass can settle. |
| `/products/transact` | UNKNOWN | File exists, own independent inspection (grep-level only). This is the clearest labeling discipline among the ten: every rupee figure is explicitly marked "INDICATIVE" in copy and FAQ alike (`page.tsx:16,20-21,35,106`), and the token payment step is explicitly disclosed as "test mode only — no live payment integration exists yet, and no funds move" (`page.tsx:51`). Labeling holds up at grep level; the stamp-duty/ask-band estimation logic itself was not independently re-verified. |
| `/resources` | KEEP | File exists at `apps/web/app/resources/page.tsx`, read in full. This is a real content hub, not a stub: it renders three genuinely distinct sections (Blog, Case Studies, IS Code Guides) each with specific, non-generic summary copy (`page.tsx:6-25`) and links into an extensive real subtree (`blog`, `case-studies`, `checklists`, `events`, `faq`, `glossary`, `guides`, `is-code-guides`, `podcasts`, `reports`, `templates`, `tools`, `videos`, `webinars`, `whitepapers`). This check read the index page in full but did not audit every individual article under each subsection — that remains a shallower check than a full content audit of the whole subtree, stated plainly. |
| `/documentation` | KEEP | File exists at `apps/web/app/documentation/page.tsx`, read in full. It links to specific real content with concrete topic names — IS 456, IS 1200, IS 800, IS 875, CESMM4 code primers; blog posts on monsoon concreting, ULPIN/ULIN, and IS 1200 vs CESMM4 (`page.tsx:20-56`) — rather than generic placeholder text, which distinguishes it from a stub page. As with `/resources`, this check confirmed the page itself and its linked topics are real and specific but did not audit the full depth of every linked article. |
| `ferrumprojects.in/` | HOLD | External sister-site holding page. Already built as unlanded work on branch `w2-498-ferrum-projects-gateway-rev2`, commit `235fdd7` — confirmed via `git show 235fdd7 --stat`: `sites/ferrumprojects.in/index.html`, `sites/ferrumprojects.in/styles.css`, `sites/ferrumprojects.in/README.md`, 128 lines added, framework-free static HTML. Confirmed `<meta name="robots" content="noindex, nofollow" />` present in `index.html` line 8. That commit's own message records it was grepped clean against service/construction/pricing/legal-identity claims before committing, and that branch is unlanded and undeployed (no DNS/GoDaddy touched). This satisfies "neutral pre-launch holding presence," but its nav LABEL TEXT does not yet match the operator's now-required exact string — see Ferrum Projects nav label below — and needs updating before that branch is implementation-ready. |

### Ten-product Ferrum Projects cross-link: now checked per-product, conclusion unchanged

The previous version of this document evaluated the cross-link
condition as one shared milestone based on a single spot check of
`boq-pro`, explicitly flagging that it had not read the other nine
product pages in enough depth to justify per-product claims. This pass
corrects that: all ten product pages were read individually (see the
UNKNOWN rows above, each with its own citations), at a grep level for
claim-labeling discipline specifically — checking whether each page
consistently marks INDICATIVE/ROADMAP claims rather than making
unqualified claims that don't match what actually exists elsewhere in
the codebase.

**The shared milestone, unchanged.** A product route may show an
optional Ferrum Projects cross-link only when **both**:

- **(a)** Ferrum Projects has supplied its approved post-incorporation
  facts (see the input register below) and its own site
  (`ferrumprojects.in`) no longer holds a bare pre-launch holding page,
  **and**
- **(b)** that specific product route has a real, verified feature that
  produces or receives an execution-handoff artifact Ferrum Projects
  could plausibly act on (e.g. a BOQ export, a project record, a
  construction-readiness artifact) — checked against that product's
  actual current real-vs-roadmap split.

**Condition (b) does not exist today, on any of the ten routes —
verified independently per route this pass, not extrapolated from one.**
Every candidate execution-handoff feature found across all ten pages is
explicitly roadmap or explicitly disconnected, in that page's own
words: BOQ Pro's export is "not yet wired for that purpose" from the
rate calculator (`boq-pro/page.tsx:106`); ProcureHub's purchase
orders/delivery tracking/bill reconciliation are all "not yet built"
(`procurehub/page.tsx:15-19`); Structura's drawing generation is
"(roadmap)" (`structura/page.tsx:26`); CommunityBuild's SPV
creation/investor commitments are "not yet built"
(`communitybuild/page.tsx:20-21`); InvestFlow's capital
commitment/investor dashboards are "not yet built"
(`investflow/page.tsx:18-19`); LandIntel's feasibility report is "not
yet built" (`landintel/page.tsx:26`); the remaining four (DesignStudio,
ProMarket, BuildOS, Transact) have no execution-handoff-shaped feature
at all, live or roadmap. **This is a stronger, independently-verified
version of the same conclusion the previous document reached from one
spot check — not a weakened one. CROSS-LINK remains HELD for all ten
product routes, uniformly, until both (a) and (b) are satisfied.**

This pass's per-route grep-level checks establish labeling discipline
(whether each page is honest about live-vs-roadmap), which is a
narrower claim than fully verifying condition (b) would require if any
route's roadmap status ever changed — a future pass revisiting this
section after a status change should re-verify the specific claim
directly, not rely on this document's grep-level pass as if it were a
feature audit.

## Domain and privacy controls

Each of the operator's stated controls, as a concrete implementation
requirement, with a check against what the codebase actually has today
(not assumed):

| Control | Requirement | Current state in this codebase |
|---|---|---|
| Self-referential canonicals per domain | Each domain's pages declare their own canonical URL, pointing to themselves. | **Entirely new work.** Grepped `apps/web` for `canonical`: the only match in `apps/web/app/layout.tsx` is a code comment ("canonical social card belongs in the shared document head," `layout.tsx:47`) — not an actual `<link rel="canonical">` tag or Next.js `alternates.canonical` metadata field. `metadataBase` is set (`layout.tsx:19`, `new URL(SITE_BASE_URL)`), which affects relative-URL resolution for Open Graph/Twitter images, but does not itself emit a canonical tag. No canonical infrastructure exists to extend — this must be built. |
| No cross-canonicalization | Neither domain's pages point their canonical at the other domain. | Not applicable today (no canonical tags exist at all, on either domain — `ferrumprojects.in`'s `index.html` was read in the W2-498 commit diff and also has no canonical tag). New work, alongside the item above. |
| No redirects between domains | Neither site 30x-redirects into the other. | No evidence of any such redirect in `worker.ts` or `apps/web/app/**`; nothing found suggests this exists. Should be stated as a constraint on future work, not a fix to anything currently broken. |
| Separate analytics/consent by default | Each domain's analytics and consent state are independent; no shared session/analytics identity across domains. | Grepped `apps/web/app/layout.tsx` and `apps/web/components/CookieConsent.tsx` for analytics vendor signatures (`gtag`, `google-analytics`, `plausible`, `analytics`, `posthog`, `segment`, `mixpanel`): zero matches in either file. `CookieConsent.tsx` exists (41 lines) but no analytics script was found wired to it in the files checked. This suggests analytics is either not yet integrated on `ferrumos.*` at all, or integrated somewhere not covered by this check — **flagged as unverified rather than assumed absent**; an implementer should re-confirm before relying on "there is no analytics to separate." |
| Ferrum OS may record an outbound-link event only for the external control | Clicking the Ferrum Projects nav link may fire an analytics event on the Ferrum OS side; nothing about the visit inside `ferrumprojects.in` may be measured from the Ferrum OS side. | No outbound-link event handler exists on the W2-498 nav link today — `git show 235fdd7` shows the link is a plain `<a href="https://ferrumprojects.in" target="_blank" rel="noopener noreferrer">` with no `onClick` analytics call in `SiteHeader.tsx`, and only a `closeMenu` `onClick` (unrelated to analytics) on the `MobileMenu.tsx` variant. New work, if this event is wanted, and only after the "separate analytics" item above has real infrastructure to hook into. |
| No cross-domain measurement without an approved lawful basis + disclosures | Any future cross-domain analytics needs a documented lawful basis and disclosure, not silent instrumentation. | Organizational/legal requirement, not a code state to check — recorded here as a standing constraint on any future analytics work touching both domains. |
| No user identifiers/project info/query-string context crossing domains without deliberate user action + approved privacy basis | Links between the domains must not silently carry session tokens, user IDs, or project state in the URL or via shared storage. | The W2-498 nav link (`SiteHeader.tsx`, `MobileMenu.tsx`) is a plain `href` with no query-string construction, no token attachment — consistent with this requirement as shipped. This is a constraint to preserve going forward, not a defect to fix. |
| Independent legal pages/copyright/accounts/identity | Each domain has its own terms, privacy notice, copyright line, and account system; neither borrows the other's. | `/terms` and `/privacy` are independent of Ferrum Projects in the narrow sense that neither page names Ferrum Projects (see route table above) — but per the corrected `/terms`/`/privacy` finding above, "independent of Ferrum Projects" is not the same claim as "adequate," and both remain HOLD as drafts. Ferrum OS's own auth/account system (`worker.ts:602,630`, `lib/auth/*`) is real and specific to Ferrum OS; nothing in the code reviewed suggests any shared-account mechanism with `ferrumprojects.in` (which, per the W2-498 commit, is a static holding page with no backend at all — "Not wired into the pnpm workspace... not built or deployed by anything in this repo"). Structural independence from Ferrum Projects is the current state; the pages' own adequacy is a separate, still-open question tracked in the route table. |

## Post-incorporation input register

The following operator inputs remain unresolved and are listed here
without elaboration, per the operator's own framing of them as inputs
still pending, not conclusions this document can reach on its own:

- Approved legal name and CIN
- Operating/service entity
- Registered office and public contacts
- Service regions
- Execution/PMC/procurement scope
- Responsible professionals
- Insurance and contractual boundaries
- Pricing or lead model
- Terms and privacy notice
- Consent model
- Statutory disclosures

## Ferrum Projects nav label

The operator's exact required visible label:

> `Ferrum Projects ↗ — separate website · pre-launch`

Compared against what W2-498 actually shipped (`git show 235fdd7`, diff
of `SiteHeader.tsx` and `MobileMenu.tsx`):

- **Link text:** just `Ferrum Projects` — no `↗` glyph, no "separate
  website · pre-launch" qualifier, in either the desktop
  (`SiteHeader.tsx`) or mobile (`MobileMenu.tsx`) implementation.
- **`aria-label`:** `"Ferrum Projects, sister site (opens in a new
  tab)"` — conveys similar substance (external, separate) but not the
  operator's exact required string, and uses "sister site" rather than
  "separate website · pre-launch."

This is a **concrete, specific mismatch** to fix before branch
`w2-498-ferrum-projects-gateway-rev2` is implementation-ready — both the
visible link text and the `aria-label` need to be brought in line with
the operator's exact required string (or a close accessible paraphrase
of it, if the `↗` glyph needs a text equivalent for screen readers)
before that branch lands.

## Acceptance requirements

Carried from the operator's stated requirements, applying across this
document's scope (the homepage redesign and the domain/route posture
together):

- 375px, 430px, 1366px, and 1440px viewport widths, zero horizontal
  overflow at each.
- 44×44px minimum touch targets on every interactive element.
- Visible keyboard focus on every interactive element.
- `prefers-reduced-motion` respected wherever motion is introduced.
- One task-primary hero CTA on the homepage (see
  `docs/design/HOMEPAGE_REDESIGN_2026.md` §5.4).
- No 3D JavaScript dependency in the homepage's initial visual (see
  `docs/design/HOMEPAGE_REDESIGN_2026.md` §5.4, Performance
  constraints).
- Production LCP ≤2.5s at p75 — **stated as a target, not claimable as
  met** until a production deployment with real traffic/RUM data
  exists; this repository has none today.
- Truthful evidence-state preservation — every LIVE / INDICATIVE /
  SOURCE-VERIFIED / GAP / ROADMAP label continues to reflect the real
  state of the underlying feature, consistent with the W2-345/W2-347
  discipline already established in this codebase and extended by the
  `EvidenceStateBadge` work specified in
  `docs/design/HOMEPAGE_REDESIGN_2026.md` §5.4.
