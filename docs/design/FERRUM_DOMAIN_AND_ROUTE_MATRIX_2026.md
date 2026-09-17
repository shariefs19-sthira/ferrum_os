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

## Route classification table

Classification key: **KEEP** (no change needed), **MOVE** (relocates,
doesn't disappear), **REWRITE** (content/structure changes),
**HOLD** (not promoted/not shipped forward as authoritative until a
named gap closes), **CROSS-LINK** (an optional link between two
otherwise-independent surfaces, gated on conditions).

| Route | Classification | Reason |
|---|---|---|
| `/` | REWRITE | Per the Project Decision Console redesign (`docs/design/HOMEPAGE_REDESIGN_2026.md` §5). File exists at `apps/web/app/page.tsx`. |
| `/products` | KEEP | Remains the full product-directory destination. File exists at `apps/web/app/products/page.tsx` (plus `apps/web/app/products/layout.tsx`). The homepage's own duplicated product grid (`page.tsx:12-23`'s `productShowcaseItems`) is what's being relocated/deduplicated per the redesign — this route itself is untouched. |
| `/pricing` | HOLD | File exists at `apps/web/app/pricing/page.tsx`. Both the homepage (`page.tsx:44-64`'s `pricingPlans`) and the dedicated pricing page (`pricing/page.tsx:18-22`'s `tiers`) state ₹499/mo and ₹9,999/mo with no attribution for either figure. `pricing/page.tsx:60` additionally repeats the unverified "60–90% below global tools" comparison already flagged in the homepage doc (`page.tsx:125`). Payment processing falls back to a stub when Razorpay isn't configured: `worker.ts:50-54`'s `getPaymentProvider` returns `new RazorpayProvider(...)` only if `env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET` are both set, otherwise `new StubPaymentProvider()`; `worker.ts:65-69` documents the same fallback in a comment ("them, so getPaymentProvider() falls back to StubPaymentProvider"). Commercial authority (real pricing, real payment collection) is unverified as shipped; held per the operator's decision. |
| `/about` | KEEP | File exists at `apps/web/app/about/page.tsx` (plus `apps/web/app/about/timeline`). |
| `/contact` | KEEP | File exists at `apps/web/app/contact/page.tsx`. |
| `/signup`, `/login` | KEEP, with a nuance | Files exist at `apps/web/app/signup/page.tsx` and `apps/web/app/login/page.tsx`. Unlike pricing, the **auth mechanics are real and already landed**: `worker.ts:602` (`app.post('/api/auth/signup', ...)`) and `worker.ts:630` (`app.post('/api/auth/login', ...)`) are real handlers; `worker.ts:28` imports real password hashing (`hashPassword`, `verifyPassword`, `generateToken`, `hashToken` from `lib/auth/password`), used at `worker.ts:611` and `worker.ts:715`; `worker.ts:29` imports real session handling (`createSession`, `getSessionUser`, `deleteSession`, `setCookieHeader`, `clearCookieHeader`, `parseSessionCookie` from `lib/auth/session`), with `createSession` called at `worker.ts:625` and `worker.ts:648` and a `worker.ts:597` comment confirming sessions are "HttpOnly/Secure cookies (see lib/auth/session.ts)." The routes themselves are real working auth, not fabricated. What's held is **promoting signup/trial as a primary homepage CTA ahead of unverified commercial claims** — consistent with the operator's "sales-oriented calls to action... held wherever functionality or commercial authority is unverified": auth functionality passes that bar, commercial/pricing claims around it (see `/pricing` above) don't. |
| `/products/landintel` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/designstudio` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/structura` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/boq-pro` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/promarket` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/buildos` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/procurehub` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/investflow` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/communitybuild` | KEEP | File exists. See ten-product cross-link note below. |
| `/products/transact` | KEEP | File exists. See ten-product cross-link note below. |
| `/resources` | KEEP | File exists at `apps/web/app/resources/page.tsx`, with an extensive subtree (`blog`, `case-studies`, `checklists`, `events`, `faq`, `glossary`, `guides`, `is-code-guides`, `podcasts`, `reports`, `templates`, `tools`, `videos`, `webinars`, `whitepapers`). |
| `/documentation` | KEEP | File exists at `apps/web/app/documentation/page.tsx`. |
| `/terms`, `/privacy` | KEEP — verified clean | Files exist at `apps/web/app/terms/page.tsx` and `apps/web/app/privacy/page.tsx`. Grepped both for "Ferrum Projects" (case-insensitive): zero matches in either file. They describe Ferrum OS only, already independent of Ferrum Projects. This is a **verified-clean finding from a grep run for this task**, not an assumption carried over from elsewhere. |
| `ferrumprojects.in/` | HOLD | External sister-site holding page. Already built as unlanded work on branch `w2-498-ferrum-projects-gateway-rev2`, commit `235fdd7` — confirmed via `git show 235fdd7 --stat`: `sites/ferrumprojects.in/index.html`, `sites/ferrumprojects.in/styles.css`, `sites/ferrumprojects.in/README.md`, 128 lines added, framework-free static HTML. Confirmed `<meta name="robots" content="noindex, nofollow" />` present in `index.html` line 8. That commit's own message records it was grepped clean against service/construction/pricing/legal-identity claims before committing, and that branch is unlanded and undeployed (no DNS/GoDaddy touched). This satisfies "neutral pre-launch holding presence," but its nav LABEL TEXT does not yet match the operator's now-required exact string — see Ferrum Projects nav label below — and needs updating before that branch is implementation-ready. |

### Ten-product Ferrum Projects cross-link: one shared milestone, not ten bespoke ones

The operator's requirement is evaluated as **one shared milestone
applying uniformly to all ten product routes**, not ten differentiated
bespoke milestones per product. Differentiating per product today would
mean inventing capabilities that don't exist in the repo — none of the
ten product pages were read as part of this task in enough depth to
support ten independently-justified claims, and doing so without that
depth of verification would repeat the exact defect class already found
and fixed in this codebase (W2-345's fabricated testimonials, the W2-347
overstated-capability rewrite cited in the homepage doc's §1).

**The shared milestone.** A product route may show an optional Ferrum
Projects cross-link only when **both**:

- **(a)** Ferrum Projects has supplied its approved post-incorporation
  facts (see the input register below) and its own site
  (`ferrumprojects.in`) no longer holds a bare pre-launch holding page,
  **and**
- **(b)** that specific product route has a real, verified feature that
  produces or receives an execution-handoff artifact Ferrum Projects
  could plausibly act on (e.g. a BOQ export, a project record, a
  construction-readiness artifact) — checked against that product's
  actual current real-vs-roadmap split.

**Condition (b) does not exist today, on any of the ten routes.** A
spot check of `apps/web/app/products/boq-pro/page.tsx` — the product
whose entire premise (bill-of-quantities) is the closest fit for an
"execution-handoff artifact" — found the product's own FAQ states
export is *not yet wired for that purpose*: "Not from this rate
calculator yet — Excel/PDF export from it is on the roadmap. The
separate BOQ Pro take-off tool does have a print/PDF export today, but
it is not connected to this page" (`apps/web/app/products/boq-pro/page.tsx:106`).
Even where an export mechanism exists somewhere in the product, it is
explicitly documented as disconnected from the surface being described.
This task did not exhaustively re-audit every real-vs-roadmap claim on
all ten product pages beyond that spot check — the honest statement is
that condition (b) is not satisfied on the one product most likely to
satisfy it, and nothing found elsewhere in this task's research
suggests a stronger candidate exists among the other nine. **CROSS-LINK
is therefore HELD for all ten product routes right now, uniformly — not
partially available on some subset.**

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
| Independent legal pages/copyright/accounts/identity | Each domain has its own terms, privacy notice, copyright line, and account system; neither borrows the other's. | `/terms` and `/privacy` verified independent of Ferrum Projects (see route table above). Ferrum OS's own auth/account system (`worker.ts:602,630`, `lib/auth/*`) is real and specific to Ferrum OS; nothing in the code reviewed suggests any shared-account mechanism with `ferrumprojects.in` (which, per the W2-498 commit, is a static holding page with no backend at all — "Not wired into the pnpm workspace... not built or deployed by anything in this repo"). Independence is the current state; no fix needed, only preservation. |

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
