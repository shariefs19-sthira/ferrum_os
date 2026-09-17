# Ferrum OS Homepage Redesign — Specification (2026)

Status: proposal / spec only. No application code changes are included in
this document. Scope is `apps/web/app/page.tsx` and the components it
composes. Written against the code in this worktree
(`w2-499-homepage-redesign-spec`) as of 2026-09-17.

## 0. Ground-truth corrections before reading further

Two factual corrections to the brief this doc was commissioned under —
stated up front because everything below depends on them:

1. **The site is not on Inter.** `apps/web/app/layout.tsx:2,14-15` loads
   `DM_Sans` (body, `--font-dm-sans`) and `Space_Grotesk` (heading,
   `--font-space-grotesk`) via `next/font/google`, and
   `apps/web/tailwind.config.js:51-55` maps `font-sans`/`font-heading` to
   those two variables. There is no `--font-inter` reference anywhere in
   `apps/web/app/globals.css`. `docs/skills/ferrum-relume-design/SKILL.md`
   (§Typography) and this task's own brief both describe Inter — that's
   stale relative to the shipped config.
2. **The `relume` Tailwind namespace is not monochrome-only.**
   `apps/web/tailwind.config.js:30-49` defines, inside the `relume`
   namespace itself: `relume-command` (`#0B1F3A`, navy), `relume-steel` /
   `relume-steel-soft` (blue-greys), `relume-accent` (`#FF9933`,
   saffron), `relume-success` (`#138808`), `relume-danger` (`#DC2626`) —
   added under a "W2-372 Construction/Architecture palette" comment.
   `relume-muted` is a literal `#475569`, not an ink-alpha derivation as
   the design skill states. This palette is already live on the homepage
   render path today: `text-relume-command` styles the "INDICATIVE" label
   in `apps/web/components/workspace/ProductCockpitPreview.tsx:49`, which
   `HomepageCockpitHero.tsx` renders directly. Separately,
   `apps/web/components/ProvenanceStrip.tsx:16-26`'s `IndicativeChip` —
   the sitewide trust/status affordance — uses hardcoded Tailwind
   `amber-300/amber-50/amber-800`, not even the in-namespace
   `relume-accent`, a second, independent off-token instance.

   The design skill states its own precedence rule: *"The Tailwind
   config is the implementation source of truth for code... When they
   conflict on something already coded, the Tailwind config is correct
   and the handoff is stale."* Applying that rule here, this spec treats
   the config as ground truth and flags the skill doc and task brief as
   stale on these two points, rather than silently picking a side. See
   §6 (Selected direction) for how this changes the color/type guidance,
   and the Assumptions note at the end.

3. **No "quiet Ferrum Projects header link" exists to preserve.**
   `apps/web/components/SiteHeader.tsx:20-26` (desktop nav) and
   `apps/web/components/MobileMenu.tsx:6-24` (mobile nav) were both read
   in full; neither contains any reference to Ferrum Projects. Ferrum
   Projects Private Limited is real but exists only as an
   unincorporated, separate-entity execution company in
   `docs/corporate/**` (e.g. `docs/corporate/entities/REGISTRY.md:7`) —
   it has no surface on the current homepage or its nav at all. This
   spec's baseline is therefore "introduce nothing new," not "preserve
   an existing link" — there is nothing to preserve.
4. **No performance-budget file exists in the repo** (searched for
   `budgets.json` and equivalent — no match). Acceptance criteria in §6
   are phrased structurally/qualitatively rather than against an invented
   millisecond or KB number, per the task's own fallback instruction.

## 1. Current-state audit

### What's real and working

- **The cockpit hero is a genuine, working product demo, not a mockup.**
  `HomepageCockpitHero.tsx:20-73` renders a live tab switcher across all
  10 products (`products` array, lines 7-18); each tab mounts
  `ProductCockpitPreview` → `WorkspaceCockpit`, which includes a real
  Three.js massing view (`WorkspaceCockpit.tsx:33-40`, dynamically
  imported). Per-product parameter state persists to `localStorage`
  (`HomepageCockpitHero.tsx:64`, `ProductCockpitPreview.tsx:31-33`), and
  an "INDICATIVE — deterministic geometry" disclaimer sits directly under
  the demo (`ProductCockpitPreview.tsx:48-50`). Most SaaS homepages fake
  their hero demo with a video loop or static screenshot; this one is the
  actual running product.
- **The three.js weight is already code-split.** A dated comment at
  `WorkspaceCockpit.tsx:27-32` ("Perf (W-27 TASK A)") records that three.js
  (~591KB raw / ~148KB gz across two chunks) was pulled out of the
  cockpit's first-load bundle via `next/dynamic(() => import('./Space3D'),
  { ssr: false })` (`WorkspaceCockpit.tsx:33-40`) — real code-splitting,
  already landed, not something this redesign has to invent.
- **The live-vs-roadmap honesty pattern is already established sitewide,**
  not just in the deleted testimonials' wake. `page.tsx:36-42` (the
  `howItWorksSteps` data, W2-347 comment) explicitly splits each step into
  what's live today vs. what's roadmap. `ProductCockpitPreview.tsx:49`
  repeats the same discipline at the component level. Any credibility
  mechanism this redesign proposes should extend this existing pattern,
  not invent a new one.
- **The testimonials deletion is well-documented, not just absent.**
  `page.tsx:153-160` keeps a dated comment (W2-345 SITEWIDE_CLAIM_TRUTH)
  explaining three fabricated quotes were removed and why reinstatement
  requires real attributed quotes, not a rewrite. This is a durable record
  a future implementer can find; the same discipline should extend to
  whatever fills the credibility gap.
- **Baseline accessibility groundwork is already in place sitewide:**
  `focus-visible` rings on every interactive element
  (`Buttons.tsx:14,26`, `HomepageCockpitHero.tsx:38,41,56`); 44px minimum
  touch targets via `min-h-11` used consistently
  (`MobileMenu.tsx` throughout, `BookingConsultCta.tsx:9`,
  `HomepageCockpitHero.tsx:38,41,49`); a real focus trap + Escape +
  click-outside handling in the mobile menu (`MobileMenu.tsx:31-80`); a
  stretched-link card pattern that keeps one real `<a>` per card instead
  of a fake clickable `<div>` (`CardGrid.tsx:21-46`, W2-358 comment);
  `prefers-reduced-motion` already respected in two independent places
  (`MotionObserver.tsx:7` early-return, `globals.css:190-193` media
  query).

### What's weak

- **Sections 2–4 are generic Relume template card grids with no visual
  differentiation** from the live cockpit that precedes them or from any
  other Relume-derived SaaS site: value-prop (`page.tsx:72-85`, a 4-card
  `CardGrid`), product showcase (`page.tsx:87-103`, a 10-card `CardGrid`),
  how-it-works (`page.tsx:105-117`, a `SliderLeaf` carousel) all use the
  same centered-eyebrow-heading-paragraph-then-grid shell
  (`SectionShell.tsx`) with identical card chrome (`CardGrid.tsx:33-35`:
  `rounded-lg border border-relume-border bg-relume-surface p-6`). The
  site's one truly differentiated asset is immediately followed by three
  sections a visitor has seen on a hundred other B2B templates.
- **Naming inconsistency, confirmed in code.** The header brand reads
  "Ferrum OS" (`SiteHeader.tsx:34`); the final CTA heading reads "Start
  building with **Ferrum Build**" (`page.tsx:166`). Same product, two
  names, one page load apart.
- **Pricing sits with nothing establishing trust in front of it.**
  Pricing (`page.tsx:119-151`) is the second-to-last content section —
  immediately after How It Works and immediately before the final CTA —
  with the testimonials gap (`page.tsx:153-160`) sitting exactly between
  "here's the product" and "here's the price," filled with nothing. A
  visitor is asked to pick a ₹499/mo or ₹9,999/mo plan right after five
  short roadmap-flagged bullets, with no credibility content in between.
- **A pricing claim worth independent verification before it ships
  forward.** `page.tsx:125`: *"Plans from ₹499/month — 60–90% below
  global tools."* That's a comparative numeric claim about competitors'
  pricing. `docs/skills/ferrum-discipline/SKILL.md` (Compliance
  discipline, and RULE 13's "one flagged instance → inventory the whole
  defect class") is explicit that *"Any government rate... or technical
  claim must be independently verifiable — never invented,"* and this is
  the same defect class (an unverified quantitative claim) that produced
  the W2-345 testimonials deletion. This spec does not assert the figure
  is fabricated — only that it hasn't been verified in anything read for
  this task — and flags it as something the implementer should source or
  soften before the redesign carries it into a more prominent position.
- **Design-token drift (see §0) is itself a current-state weakness**: two
  disagreeing accounts of the type/color system exist in the repo
  (skill doc vs. shipped config), and the redesign has to pick one
  explicitly rather than inherit the ambiguity.

## 2. Three directions

Each is a different bet about what should carry the page's persuasive
weight, not a palette variant of the others.

### A — Demo-first

Lead with the live cockpit even harder; treat every other section as
supporting evidence for a decision the visitor is already most of the way
through making by the time they scroll past the hero.

- **Desktop sequence:** (1) Cockpit hero, enlarged/immersive, minimal
  marketing copy above it — a one-line premise, not a paragraph; (2) a
  thin "what you just used" strip translating the demo into the 4-stage
  framing in ~1 line each; (3) 10-product grid as a directory, de-styled
  down to a dense link list rather than a card grid (removes the visual
  "look, more of the same cards" repetition); (4) pricing; (5) final CTA.
  How-it-works is folded into micro-copy inside the hero itself (e.g. tab
  captions) rather than a separate section.
- **Mobile sequence:** same order; cockpit hero becomes the single most
  expensive mobile section (3D view on mobile GPUs/thermal budgets is a
  real risk — see Accessibility/Performance below) — likely needs a
  lighter fallback (static massing snapshot + "open on desktop for full
  3D") rather than shipping the full Three.js view unmodified to phones.
- **Information hierarchy:** product-first, narrative second. Visitors
  who don't immediately understand what they're looking at (a real risk
  for a first-time visitor with zero context) get comparatively little
  hand-holding.
- **Typography/spacing/color/imagery/motion:** stays inside the existing
  token set almost entirely (§0); no new illustration work needed since
  the demo *is* the imagery. Motion is limited to the demo's own
  interactions — no new scroll-driven motion needed.
- **Product-demonstration strategy:** the demo *is* the strategy; nothing
  else is asked to persuade.
- **Credibility/trust structure:** the demo being real, live, and running
  actual code, restated explicitly in copy ("this is the real product,
  not a video") + existing INDICATIVE labeling
  (`ProductCockpitPreview.tsx:49`). Thin outside of the demo itself.
- **Primary/secondary CTA:** Primary "Try it now" (scroll-to or in-place,
  not a separate page); Secondary "See pricing."
- **Component/asset requirements:** heavy rework of
  `HomepageCockpitHero.tsx` (enlarge, reduce surrounding copy), a new
  compact product-directory component (not `CardGrid`), no new
  illustration assets.
- **Accessibility:** biggest risk of the three — a visitor relying on a
  screen reader or on reduced-motion gets almost no alternative content
  if the demo is the whole pitch; needs a genuinely complete non-visual
  fallback description of what the cockpit does, not just an `aria-label`
  on the tabs.
- **Cost:** **Low–Medium** — mostly subtraction (cut sections 2–4's copy
  weight) plus one new directory component; the hardest part is the
  mobile 3D fallback, which is real engineering work.

### B — Narrative/outcome-led

Restructure around the four real stages (Land → Design → Build → Invest,
already the existing `valuePropItems` framing at `page.tsx:25-30`) as a
guided story, with the cockpit demo embedded mid-scroll as proof at the
moment it's earned, not as the opening move.

- **Desktop sequence:** (1) short editorial opening (headline + one-line
  premise, no demo yet); (2) Stage 1 — Land (narrative block + IS-code /
  ULPIN data citation); (3) Stage 2 — Design (narrative block); (4) **the
  cockpit demo**, introduced as "see it live" proof right after the
  visitor has context for what Land+Design mean; (5) Stage 3 — Build; (6)
  Stage 4 — Invest; (7) product directory (10-card grid, kept, now serving
  returning/detail-seeking visitors rather than being the page's main
  argument); (8) credibility/trust strip (technical rigor, not fabricated
  social proof — see below); (9) pricing; (10) final CTA.
- **Mobile sequence:** same relative order; the cockpit demo section
  becomes the natural place to insert a "open full cockpit" deep link
  instead of trying to keep the entire desktop-weight 3D interaction
  in-line on a phone screen.
- **Information hierarchy:** narrative-first, product-proof-second,
  detail-third — a visitor understands *why* before being asked to
  operate anything.
- **Typography/spacing/color/imagery/motion:** editorial B2B feel within
  the existing token set (see §6 for exact values); each stage gets a
  small line-diagram (not stock photography — none exists pre-launch).
  Scroll-triggered reveals extend the existing `data-reveal`/
  `MotionObserver.tsx` pattern per stage, respecting the existing
  reduced-motion guard.
- **Product-demonstration strategy:** demo as proof-in-context, placed
  after two stages of narrative build-up, not as the entire pitch.
- **Credibility/trust structure:** per-stage technical citation (IS 456 /
  IS 800 references, ULPIN as a real government identifier scheme) using
  the existing `ProvenanceStrip`/`IndicativeChip` pattern, plus a
  dedicated but honest trust strip before pricing — no invented
  quotes/logos/numbers.
- **Primary/secondary CTA:** Primary "See it live" at the demo beat,
  "Start Free Trial" at the end; Secondary "Explore all 10 products."
- **Component/asset requirements:** new `StageNarrativeSection`
  component (×4), relocates `HomepageCockpitHero` mid-page (light
  restructure, not a rebuild), reuses `CardGrid`, `SliderLeaf` (or
  retires it — see §6), `ProvenanceStrip`. New assets: 4 simple
  monochrome/on-token line diagrams (SVG), no photography.
- **Accessibility:** heading hierarchy must stay linear across 4
  new stage sections (h2 per stage, not nested skips); any alternating
  left/right editorial layout must keep DOM order == visual order for
  screen-reader/keyboard users (no CSS-order tricks that reverse it).
- **Cost:** **Medium** — four new narrative sections plus relocation and
  partial restyle of the existing hero; most supporting components
  (`CardGrid`, buttons, `SectionShell`) are reused as-is.

### C — Technical-credibility-led

Since no social proof is honestly available pre-launch, lean entirely
into IS-code compliance, real government data sourcing, and verifiable
technical rigor as the trust mechanism — position Ferrum as the
technically rigorous choice for professionals (engineers, architects,
serious investors) rather than a mass-market SaaS pitch.

- **Desktop sequence:** (1) hero, but copy-led with technical framing
  ("Deterministic massing, IS-code checks, government-sourced land data" —
  not aspirational marketing language) with the cockpit demo present but
  smaller/secondary; (2) a "how we verify" section — IS-code references,
  ULPIN/government data provenance, the live-vs-roadmap split surfaced as
  a *feature* ("we tell you exactly what's live"); (3) value-prop stages
  as a dense reference table rather than a card grid; (4) product
  showcase; (5) pricing; (6) final CTA, addressed to a professional
  audience ("Talk to an engineer" alongside "Start Free Trial").
- **Mobile sequence:** same order; the reference-table stage section
  becomes the highest mobile-layout risk (dense tables don't reflow well)
  and needs a stacked-card fallback.
- **Information hierarchy:** rigor-first, narrative second, product
  demo third — the opposite emphasis of A.
- **Typography/spacing/color/imagery/motion:** most restrained of the
  three — near-zero decorative motion, mono/tabular numerals for any
  code citations (the existing `font-mono` token and `tabular-nums`
  pattern already used in `WorkspaceCockpit.tsx:42,48,55,57` extend
  naturally here), minimal imagery.
- **Product-demonstration strategy:** demo as one proof point among
  several, not the centerpiece.
- **Credibility/trust structure:** the strongest fit for the
  no-fabrication constraint by construction — nothing here requires
  inventing people, companies, or numbers; risk is the opposite,
  reading as dry/spec-sheet and under-selling the fact that a working
  product exists at all.
- **Primary/secondary CTA:** Primary "See the compliance model" or "Talk
  to an engineer"; Secondary "Start Free Trial."
- **Component/asset requirements:** new dense reference-table component,
  new "verification" section reusing `ProvenanceStrip`/`IndicativeChip`
  extensively, no new illustration.
- **Accessibility:** the reference table needs a real `<table>` with
  proper headers/scope (not a div-grid), plus a stacked-card fallback for
  narrow viewports — two implementations of the same data is more
  accessibility surface area to get right, not less.
- **Cost:** **Medium–High** — the new table component and its mobile
  fallback are more engineering than any single section in A or B, even
  though the visual system itself is the most restrained.

## 3. Comparison

| | A — Demo-first | B — Narrative/outcome-led | C — Technical-credibility-led |
|---|---|---|---|
| Premium B2B positioning | Strong if visitor already understands the category; weak on-ramp otherwise | Strongest — editorial pacing matches how considered B2B purchases are actually made | Strong for a technical buyer persona; risks reading as a spec sheet for a broader one |
| Differentiation from generic SaaS templates | Highest ceiling (nothing else leads with a real demo like this) but the directory/pricing tail can regress to generic if not restyled | High — narrative structure itself is the differentiator, not just the demo | Medium — technical rigor is differentiating but the pattern (docs-heavy B2B site) is itself a template too |
| Honesty given no-fake-social-proof constraint | Satisfied — demo is real proof | Satisfied — demo + per-stage IS-code citation, no invented numbers | Satisfied most cleanly — by construction, nothing here needs a fabricated data point |
| Implementation cost | Low–Medium | Medium | Medium–High |
| Accessibility / performance risk | Highest — mobile 3D fallback and non-visual demo alternative are both real open problems | Medium — mostly standard editorial-section accessibility discipline (heading order, DOM==visual order) | Medium — dense reference table needs a real `<table>` + reflow fallback, two implementations to keep in sync |
| Treats Ferrum Projects correctly | Neutral — doesn't touch nav | Neutral — doesn't touch nav | Neutral — doesn't touch nav |

All three satisfy the "don't add or elevate Ferrum Projects" requirement
by simple omission — none of them touch `SiteHeader.tsx`/`MobileMenu.tsx`,
and per §0.3 there is nothing there today to preserve or avoid amplifying.

## 4. Selected direction: B — Narrative/outcome-led

**Reasoning.** A's ceiling is highest but its floor is the riskiest — it
bets the entire page on a visitor already having category context, and
its mobile-3D and non-visual-fallback problems are real engineering
unknowns, not just design decisions. C is the safest fit for the
no-fabrication constraint by construction, but on its own undersells the
one asset that's genuinely rare (a real, live, working demo) by making it
one bullet among several rather than a moment in the story. B is the only
one of the three that (a) reuses the existing `valuePropItems` framing
(`page.tsx:25-30`) as its spine — the smallest structural pivot from what
already exists that still produces real differentiation — (b) gives the
demo a *narrative reason to exist* at the point it appears, which is what
"premium B2B" pacing actually looks like, and (c) can absorb C's
technical-credibility mechanism as a per-stage citation pattern rather
than needing to choose between them. It is the medium-cost, medium-risk
option, which given this is a redesign of the entire homepage — not a
one-section experiment — is the right place to be.

### Desktop section sequence

1. **Opening** (new, small) — one-line premise + primary CTA, no demo yet.
2. **Stage 1 — Land** (new `StageNarrativeSection`) — narrative + IS-code/ULPIN citation.
3. **Stage 2 — Design** (new `StageNarrativeSection`) — narrative.
4. **Live proof** — the cockpit demo (`HomepageCockpitHero.tsx`, relocated and lightly restyled — see Components below), introduced with a one-line "this is the actual product" framing.
5. **Stage 3 — Build** (new `StageNarrativeSection`) — narrative.
6. **Stage 4 — Invest** (new `StageNarrativeSection`) — narrative.
7. **Product directory** — existing 10-card `CardGrid` (`page.tsx:87-103`), kept, reframed as "explore each product in depth" rather than the page's main argument.
8. **Credibility strip** (new, small) — technical-rigor summary: live-vs-roadmap honesty as a stated principle, IS-code/government-data sourcing, INDICATIVE/roadmap labeling restated as a feature, not hidden fine print. No testimonials, logos, counts, or case studies (see Credibility below).
9. **Pricing** — existing 3-tier block (`page.tsx:119-151`), moved later so it follows trust content instead of immediately following How It Works.
10. **Final CTA** — existing block (`page.tsx:162-176`), copy-fixed (see Removals below).

### Mobile section sequence

Same 10 beats, same order — nothing reorders between breakpoints, which
keeps the narrative logic intact (a story that reorders on mobile stops
being a story). What changes on mobile:

- The live-proof beat (4) drops the always-on desktop tab bar in favor of
  a single default product tab plus an explicit "Switch product" control,
  to avoid a 10-item horizontal-scroll tab strip competing with the 3D
  canvas for a small viewport (the desktop version already handles this
  with `overflow-x-auto` at `HomepageCockpitHero.tsx:47`; mobile needs a
  deliberately narrower default, not just the same markup shrunk).
- Each `StageNarrativeSection`'s optional line-diagram stacks below its
  copy instead of beside it (no alternating left/right layout on narrow
  viewports — removes the DOM-order/visual-order accessibility risk
  entirely below the breakpoint where it matters most).

### Information hierarchy and narrative

The page argues, in order: *here is the journey (Land→Design→Build→Invest)
→ here is proof it's real, not slideware → here is the full catalog if
you want depth → here is why you should trust the rigor behind it → here
is the price → here is the ask.* Every stage section answers one question
("what does this stage actually do") before the demo is asked to prove
it, and the credibility strip is deliberately positioned as the last
thing before price, closing the exact gap identified in §1.

### Typography / spacing / color / imagery / motion

Per §0, this spec uses the tokens as actually shipped in
`apps/web/tailwind.config.js`, not the stale Inter/pure-monochrome
description in the design skill:

- **Type:** `font-sans` (DM Sans) for body, `font-heading` (Space
  Grotesk) for headings, `tracking-relume-tight` on headings — as
  already used by `SectionHeading.tsx:12`. No new typeface introduced.
- **Color:** primarily `relume-ink` (#070707) / `relume-surface`
  (#FFFFFF) / `relume-surface-secondary` (#F8FAFC) / `relume-muted`
  (#475569) / `relume-border` (#E2E8F0), matching every existing section.
  Stage badges/numerals may use `relume-command` (#0B1F3A) sparingly,
  since it's already live on this exact page's hero
  (`ProductCockpitPreview.tsx:49`) — this is using an existing,
  already-shipped in-namespace token, not inventing a new color. Do not
  introduce `relume-accent`/`success`/`danger` on the homepage without a
  specific, defensible reason (e.g. a genuine status/error state) — their
  presence in the config doesn't mean every surface should reach for
  them.
- **Spacing:** `py-relume-section` (4rem) between sections via
  `SectionShell`, `p-relume-card` (2rem) for card padding, `max-w-relume-
  container` (80rem) outer width, `max-w-relume-prose` (48rem) for each
  `StageNarrativeSection`'s body copy — matches the existing prose-measure
  convention.
- **Shape:** `rounded-relume` (0.5rem) for cards/diagrams, pill
  (`rounded-full`) for buttons — unchanged from the existing system
  (`docs/skills/ferrum-relume-design/SKILL.md` §Shape/§Buttons, confirmed
  against `Buttons.tsx:14,26`).
- **Imagery:** four new monochrome/on-token line diagrams (Land parcel,
  Design massing, Build BOQ/Gantt, Invest IRR curve), one per stage — see
  Components below. No photography exists pre-launch and none should be
  implied to exist.
- **Motion:** extend the existing `data-reveal`/`MotionObserver.tsx`
  pattern to each new `StageNarrativeSection` (same
  `IntersectionObserver`-driven reveal, same `prefers-reduced-motion`
  early-return at `MotionObserver.tsx:7`, same CSS guard at
  `globals.css:190-193`). No new motion primitive needed.

### Product-demonstration strategy

The cockpit demo keeps its full desktop capability
(`HomepageCockpitHero.tsx`/`WorkspaceCockpit.tsx`/`Space3D.tsx`)
unchanged in function, only relocated in the page and given a
lazy-mount gate: wrap its mount point in the same
`IntersectionObserver` pattern `MotionObserver.tsx` already uses for
`data-reveal`, so the `next/dynamic` Three.js chunk
(`WorkspaceCockpit.tsx:33-40`, ~148KB gz per the existing W-27 comment)
isn't fetched until the visitor scrolls near beat 4 — a real, specifiable
improvement over today's behavior, where the cockpit sits at the very top
of the page. On mobile, default to a single product tab (see Mobile
sequence above) rather than removing 3D capability outright.

### Credibility and trust structure

**This section must not reinstate testimonials, client logos, user
counts, case studies, or any other social-proof element requiring
invented people, companies, or numbers.** Ferrum OS is pre-launch with no
real customers (`page.tsx:153-160`, W2-345). The credibility strip (beat
8) is built entirely from things that are honestly available today:

- **The product itself as proof** — restating, explicitly, that the
  cockpit demo just shown is the real, running product, not a mockup.
- **Transparent INDICATIVE/ROADMAP labeling**, extending the pattern
  already live at `ProductCockpitPreview.tsx:48-50` and in the
  `howItWorksSteps` copy (`page.tsx:36-42`) — surfaced as a stated
  principle ("we show you exactly what's live vs. planned"), not just
  inline fine print.
- **Technical credibility** — IS-code citations (IS 456, IS 800, matching
  what `howItWorksSteps` at `page.tsx:39` already claims is checked
  today) and real government data sourcing (ULPIN).
- **Founder-led narrative** — a short, honest statement of why the
  product exists and who's building it, with no invented metrics
  attached.
- Reuse `ProvenanceStrip`/`IndicativeChip` (`ProvenanceStrip.tsx`) as the
  visual language for this section — it's already the sitewide pattern
  for "this is indicative, here's the source." Its off-token amber color
  (§0/§1) should be reconciled to an in-namespace token
  (`relume-accent` is the closest existing candidate) as part of this
  work, or explicitly kept as a deliberate, documented exception —
  either is acceptable, silence is not.

### Primary and secondary CTAs (suggested copy)

- Opening beat: Primary **"See how it works"** (scrolls to Stage 1) /
  Secondary **"Start Free Trial"**.
- Live-proof beat: Primary **"Open the cockpit"** (matches the existing
  per-product pattern "Open {label} cockpit" at
  `HomepageCockpitHero.tsx:39`) / Secondary **"Explore all 10 products"**.
- Credibility strip: Secondary only — **"Read our compliance approach"**
  (link to a resources/technical page, if one exists — verify before
  implementation) — no primary CTA here, this section's job is trust, not
  conversion.
- Pricing: unchanged — **"Start Free Trial"** / **"Contact sales"**
  (`page.tsx:49,56,62`).
- Final CTA: **"Start Free Trial"** (`page.tsx:171`, kept) /
  **"Talk to sales"** (`page.tsx:172`, kept) / `BookingConsultCta`
  (`page.tsx:173`, kept, conditional on `healthyBookingUrl` per
  `BookingConsultCta.tsx:4`) — **heading text fixed** to say "Start
  building with Ferrum OS," not "Ferrum Build" (see Removals).

### Component and asset requirements

**Reuse as-is:** `SectionShell.tsx`, `Eyebrow.tsx`, `SectionHeading.tsx`,
`Buttons.tsx` (`PrimaryButton`/`SecondaryButton`), `CardGrid.tsx` (product
directory, beat 7), `BookingConsultCta.tsx`, `MotionObserver.tsx` (extend
its existing pattern, no changes to the component itself),
`ProvenanceStrip.tsx` (credibility strip, beat 8, with the color caveat
above).

**Reuse with relocation/light restyle:** `HomepageCockpitHero.tsx` /
`ProductCockpitPreview.tsx` / `WorkspaceCockpit.tsx` — move out of the
hero position into beat 4; add the `IntersectionObserver` lazy-mount gate
described above; no changes to `Space3D.tsx` or the underlying cockpit
logic.

**New components needed:**
- `StageNarrativeSection` (×4 instances: Land/Design/Build/Invest) —
  editorial block: eyebrow + heading + prose (reusing `Eyebrow`/
  `SectionHeading` internally) + one line-diagram + an inline IS-code/
  data-source citation using the `ProvenanceStrip` pattern.
- A small `CredibilityStrip` component for beat 8 (founder narrative +
  restated INDICATIVE/ROADMAP principle + technical citations) — new
  layout, but built from existing typographic/color primitives, no new
  design language.

**Component likely retired from the homepage:** `SliderLeaf.tsx`'s
current usage as the How It Works carousel (`page.tsx:105-117`) is
superseded by the four `StageNarrativeSection`s, which fold "how it
works" into the narrative itself instead of a separate click-through
step list. `SliderLeaf.tsx` itself is not deleted — it may still be used
elsewhere in the site — only its homepage usage goes away.

**New assets:** four SVG line diagrams (Land parcel outline, Design
massing block, Build BOQ/Gantt strip, Invest IRR curve), monochrome,
on-token stroke color (`relume-ink` or `relume-muted`), no photography —
none exists pre-launch and none should be implied to.

### Accessibility constraints

- **Heading hierarchy:** one `h1` (already `HomepageCockpitHero.tsx:30`,
  moves with the relocated component), `h2` per major section including
  each `StageNarrativeSection` — no skipped levels.
- **Focus visibility:** every new interactive element (stage section
  links, credibility strip CTA) must carry the same
  `focus-visible:outline focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-relume-ink`
  pattern already used throughout (`HomepageCockpitHero.tsx:38,41,56`,
  `Buttons.tsx`).
- **Reduced motion:** the four new `StageNarrativeSection` reveals must
  use the existing `data-reveal`/`MotionObserver.tsx` gate — a
  reduced-motion visitor sees no scroll-triggered animation, per the
  existing early-return at `MotionObserver.tsx:7`.
- **Touch targets:** ≥44px (`min-h-11`) on every new interactive element,
  matching the sitewide convention.
- **DOM order == visual order:** any alternating left/right layout in
  `StageNarrativeSection` on desktop must not use a CSS `order` utility
  that diverges from source order — screen-reader and keyboard users must
  encounter content in the same sequence sighted mouse users see.
- **Color contrast:** if `relume-accent` (#FF9933) is adopted for the
  credibility strip's status chips (replacing `IndicativeChip`'s current
  off-token amber), its contrast as *text* on `relume-surface` white must
  be checked against WCAG AA (saffron-on-white is a plausible fail as
  body text; it is more likely acceptable as a background behind dark
  text, or restricted to non-text chip fills) — this needs an explicit
  contrast check during implementation, not an assumption either way.
- **Table/diagram alt content:** each new line diagram is informational,
  not decorative — needs a real text alternative (visible caption or
  `aria-label`), not an empty `alt=""`.

### Performance constraints

This is a static-exported Next.js site behind a Cloudflare Worker.
Relevant knowns from the code actually read for this spec:

- The heaviest asset on the page is Three.js via `Space3D.tsx`, already
  isolated into its own chunk by `next/dynamic(..., { ssr: false })`
  (`WorkspaceCockpit.tsx:33-40`), documented at ~591KB raw / ~148KB gz
  (W-27 TASK A comment, same file). This redesign does not need to
  re-solve that — it needs to change *when* that chunk fetches.
- Recommended change: gate the cockpit's **mount**, not just its dynamic
  import, behind the same `IntersectionObserver` pattern
  `MotionObserver.tsx` already implements for `data-reveal`. Today the
  chunk fetch is triggered as soon as the hero (page position 1) mounts,
  i.e. on first paint. Moving the cockpit to beat 4 without a mount gate
  would still fetch it early if it's pre-rendered off-screen; with a
  mount gate, the fetch is deferred until the visitor scrolls near it —
  a genuine improvement over the current behavior, not just a wash from
  moving the section.
- Each `StageNarrativeSection`'s SVG diagram should be inlined or served
  as a static asset, not another client-side chart library — no new
  runtime dependency is needed for four static line diagrams.
- No performance-budget file exists in this repo to cite a target number
  against (checked, see §0.4); acceptance criteria below are therefore
  structural/qualitative rather than a specific millisecond figure.

### Material to remove from the existing homepage

1. **"Start building with Ferrum Build" → "Start building with Ferrum
   OS."** `page.tsx:166` contradicts the header brand "Ferrum OS"
   (`SiteHeader.tsx:34`) one page-load apart. Fix the string; no other
   change needed to that section.
2. **The How It Works `SliderLeaf` carousel as a homepage section**
   (`page.tsx:105-117`) — superseded by folding its content into the four
   `StageNarrativeSection`s (see Components above). Its generic
   click-through-carousel presentation is exactly the "looks like every
   other template" pattern flagged in §1.
3. **The value-prop and product-showcase `CardGrid` sections' role as the
   page's primary argument** (`page.tsx:72-103`) — the product-showcase
   grid itself is kept (as beat 7, a directory), but the value-prop
   4-card grid (`page.tsx:72-85`) is fully replaced by the four narrative
   sections; keeping both would be redundant.
4. **Pricing's current position directly after How It Works and directly
   before the (now-removed) testimonials gap** (`page.tsx:119-151`) —
   relocated later, after the credibility strip, per the sequence above.
5. **Flag, don't silently carry forward, the "60–90% below global tools"
   claim** (`page.tsx:125`) — verify or source it before this redesign
   gives it a more prominent position than it has today; see §1 for why.

### Measurable implementation acceptance criteria

- Zero horizontal overflow at 375px, 430px, 1366px, and 1728px viewport
  widths, across every new section.
- Every interactive element (stage links, cockpit tabs, credibility CTA,
  pricing buttons, final CTA buttons) is reachable via keyboard in visual
  order, with a visible focus ring at each stop.
- With `prefers-reduced-motion: reduce` set, no new section produces any
  scroll-triggered reveal animation — verified against the existing
  `MotionObserver.tsx:7` guard extended to the new sections.
- Exactly one `<h1>` renders on the page; each major section (opening,
  4 stages, live-proof, directory, credibility, pricing, final CTA) uses
  exactly one `<h2>`, with no level skipped.
- The Three.js chunk (`Space3D.tsx` via `WorkspaceCockpit.tsx:33-40`)
  does not begin fetching until the live-proof section (beat 4) is
  scrolled within the `IntersectionObserver` root margin — verifiable via
  a network trace on page load showing no `Space3D`-chunk request until
  that scroll point.
- No new homepage copy introduces a named person, company, testimonial,
  user count, or case study — a straightforward text diff against this
  spec's credibility-strip content is sufficient to verify.
- No new reference to Ferrum Projects is introduced anywhere on the
  homepage or in its nav components (consistent with §0.3's finding that
  none exists today).
- The "Ferrum Build"/"Ferrum OS" string mismatch (`page.tsx:166`) no
  longer exists anywhere on the rendered homepage.
- Every new interactive element has a computed touch target ≥44×44px.

## 5. Reconciliation against the operator's Project Decision Console decision (supersedes §4's selection)

### 5.1 The operator's stated requirement

Since §4 was written, the operator has given explicit, direct product
requirements for a **"Project Decision Console"** concept. These
requirements take precedence over the three abstract directions weighed
in §2 — they are the operator's own stated decision about what the
homepage must do, not a fourth candidate to be scored against A/B/C on
equal footing. Reproduced in full below, compiled from the requirements
as given to this task (every clause maps to language the operator
specified; nothing here is invented):

> **Project Decision Console — operator requirements**
> - Lead with **one** project decision and its evidence immediately in
>   the hero — not ten equal products.
> - An interactive product switcher changes preview/task/CTA/evidence
>   state on selection.
> - LandIntel is the initial INDICATIVE preview shown before any user
>   interaction.
> - Image-first hero: load expensive interaction only after user
>   intent. The initial visual must not require 3D JavaScript.
> - One primary hero CTA and one secondary product-discovery CTA.
> - The four lifecycle stages (Land / Design / Build / Invest) are
>   shown as a structural element.
> - The full ten-product map is moved below the working preview — not
>   omitted, not the primary structure.
> - One consistent visual system for LIVE / INDICATIVE /
>   SOURCE-VERIFIED / GAP / ROADMAP states.
> - Remove duplicated product navigation, generic trial/sales actions,
>   unsupported superlatives, and initial decorative 3D dependencies.
> - Sales-oriented calls to action are held wherever functionality or
>   commercial authority is unverified.
> - Acceptance bar: 375/430/1366/1440px with zero horizontal overflow,
>   44×44px touch targets, visible keyboard focus, reduced-motion
>   support, one clear task-primary hero CTA, no 3D JS dependency in
>   the initial visual, and production LCP ≤2.5s at p75 as a stated —
>   currently unverifiable — target.

### 5.2 Direction B against the Project Decision Console requirements, criterion by criterion

**1. Lead with the decision, in the hero, with a live product
switcher.** This is structurally close to what already exists today.
`HomepageCockpitHero.tsx` is already mounted first on the page
(`page.tsx:69-70`, the `{/* 1. Product-led cockpit hero */}` comment
and `<HomepageCockpitHero />` call), already renders a real tab
switcher across all 10 products (`HomepageCockpitHero.tsx:7-18`), and
already changes the mounted `ProductCockpitPreview` on selection
(`HomepageCockpitHero.tsx:68-70`, keyed by `active.id`). Direction B's
own plan does the opposite of what Console asks: it explicitly
relocates this same hero out of position 1 and into beat 4, behind two
new narrative `StageNarrativeSection`s (§4, "Desktop section sequence,"
items 1-4). Moving the decision *away* from the hero is the reverse of
"lead with the decision and its evidence."

**2. Image-first hero; no 3D JS before user intent.** This is a direct,
explicit fix for the exact two open risks §3's comparison table flagged
against Direction A — "mobile 3D fallback and non-visual demo
alternative are both real open problems," rated "Highest risk" (§3,
Accessibility/performance row). Checked against the code: today the 3D
chunk is *not* gated behind interaction at all. `WorkspaceCockpit.tsx`
defaults its view state to `'space'` (`WorkspaceCockpit.tsx:101`,
`useState<StudioView>('space')`), and the JSX branch that renders
`Space3D` fires on that default (`WorkspaceCockpit.tsx:378`,
`{view === 'space' ? <Space3D .../> : <PlanElevationView .../>}`).
Because `HomepageCockpitHero.tsx:68-70` mounts `ProductCockpitPreview` →
`WorkspaceCockpit` unconditionally as soon as the hero — the page's
first section — renders, the `next/dynamic(..., { ssr: false })`
Space3D chunk (`WorkspaceCockpit.tsx:33-40`, ~148KB gz per the existing
W-27 comment) fetches on first paint today, with zero user interaction.
The operator's requirement is a concrete engineering fix for precisely
the risk that made Direction A "riskiest floor" in §4's own selection
reasoning — it supplies the missing discipline (defer 3D, image-first
initial paint) that A lacked, which removes the original reason B was
preferred over a demo-led approach.

**3. Ten-product map moved below the working preview, not omitted.**
Compatible with keeping `productShowcaseItems`
(`page.tsx:12-23`) largely as-is, just relocated — a smaller structural
change than B's plan to build four new `StageNarrativeSection`
components for Land/Design/Build/Invest as a narrative spine the
visitor must scroll through before any product interaction happens
(§4, "New components needed"). Console's version needs one relocation;
B's version needs four new components plus a relocation.

**4. One consistent LIVE/INDICATIVE/SOURCE-VERIFIED/GAP/ROADMAP visual
system.** This is a more rigorous, more explicit version of what §1's
"what's weak" section already flagged: `ProvenanceStrip.tsx:16-26`'s
`IndicativeChip` hardcodes `amber-300`/`amber-50`/`amber-800`, not the
in-namespace `relume-accent` used elsewhere for the same concept. Reading
further for this reconciliation surfaces the defect class is wider than
§0/§1 already caught: `WorkspaceCockpit.tsx:316`'s header "INDICATIVE"
badge uses a *third* independent treatment
(`border-relume-accent bg-orange-50`), `WorkspaceCockpit.tsx:317-319`'s
"IS 456 PASS/REVIEW" badge uses a *fourth* ad-hoc pairing
(`bg-emerald-100 text-emerald-900` / `bg-amber-100 text-amber-950`), and
`ProductCockpitPreview.tsx:49` renders "INDICATIVE" as plain
`text-relume-command` inline text with no chip at all — a fifth,
unstyled variant. Four independent visual treatments of the same
underlying concept, all on the cockpit render path alone. Project
Decision Console doesn't just tolerate fixing this — it requires it as
infrastructure. This is a real improvement over B's plan, which used
per-stage IS-code citations as its credibility mechanism (§4,
"Credibility and trust structure") — a content strategy that does
nothing by itself to address this token-consistency defect.

**5. Where the two converge, not conflict.** B's insight that the site
needs the four Land/Design/Build/Invest stages as an organizing device
is not discarded — Console lists the same four lifecycle stages as a
required structural element too. The real difference is sequencing: B
tells the story first and arrives at proof (§4, "Information hierarchy
and narrative": "here is the journey... → here is proof it's real...");
Console puts the proof (one live, selected project decision) first and
uses the four stages to organize what's reachable from there, not as a
prerequisite narrative gate before interaction. B's thinking was not
wrong — the operator's explicit product requirement resolves the
sequencing question B and Console differ on, in Console's favor, for
the concrete reasons above (the fix for A's floor risk, the smaller
structural diff, the more rigorous evidence-labeling requirement), not
merely because the operator said so.

### 5.3 Final decision

**Project Decision Console is selected**, superseding §4's Direction B
selection for actual implementation purposes. §2-§4 are left unchanged
above as the honest record of how the decision was reached — both
analyses remain in this document; neither is deleted or rewritten to
make the outcome look predetermined.

### 5.4 Specification — Project Decision Console

#### Desktop section sequence

1. **Hero — the Project Decision Console.** One product's decision plus
   its evidence, immediately visible, no scroll required. Default
   selected product: **LandIntel** — this already matches current
   behavior (`HomepageCockpitHero.tsx:21`,
   `useState<CockpitProduct>('landintel')`); no code change needed on
   this specific point, only confirmation it should stay this way, which
   it should. Product switcher (`HomepageCockpitHero.tsx:47-61`) is
   kept. New: an initial **image-first** state per product (see
   Imagery below) shown before the visitor interacts with the tab bar
   or the embedded cockpit; a **stage indicator** row tied to the
   selected product (see Information hierarchy below); one primary CTA
   + one secondary CTA (see CTAs below); the 3D chunk gate (see
   Performance below).
2. **Ten-product map** — the existing `productShowcaseItems` grid
   (`page.tsx:12-23`), relocated to sit directly below the hero. This
   replaces the current second section (Value Prop,
   `page.tsx:72-85`) in page order — the Value Prop section's
   Land/Design/Build/Invest framing (`valuePropItems`, `page.tsx:25-30`)
   moves into the hero's new stage indicator (item 1) instead of
   persisting as a separate, subsequent section that repeats the same
   four labels a second time. This directly satisfies the operator's
   "remove duplicated product navigation" instruction: today a visitor
   sees the Land/Design/Build/Invest framing once as prose
   (`valuePropItems`) and, functionally, a second time as the product
   grid's implicit grouping — folding the former into the hero's stage
   indicator removes that duplication rather than adding a third
   representation of it.
3. **How It Works** — the existing `SliderLeaf`/`howItWorksSteps`
   section (`page.tsx:36-42`, `page.tsx:105-117`) is kept as-is. Console
   does not require removing it, and per the smaller-structural-diff
   reasoning in §5.2 item 3, the default here is "keep unless the
   operator's requirements say otherwise" rather than folding it into a
   new component the way B did.
4. **Pricing** — the existing 3-tier block (`page.tsx:119-151`) stays in
   its current position. The operator's requirements don't direct a
   relocation, and Console's model addresses the credibility gap §1
   flagged (pricing with "nothing establishing trust in front of it")
   differently from B: by attaching evidence directly to the decision in
   the hero (item 1) and to each product-map entry (item 2) via the new
   `EvidenceStateBadge` (see Credibility below), rather than by
   inserting a dedicated trust section later in the scroll. This residual
   §1 concern is addressed by the badge system, not left open.
5. **Final CTA** — existing block (`page.tsx:162-176`), with the same
   "Ferrum Build" → "Ferrum OS" string fix §4 already specified
   (`page.tsx:166`) — this fix is direction-independent and still
   applies.

#### Mobile section sequence

Same 5 beats, same order. What changes on mobile:

- The hero's product switcher keeps `overflow-x-auto`
  (`HomepageCockpitHero.tsx:47`) for the 10-tab strip; the image-first
  initial state (item 1 above) is what keeps this affordable on mobile
  — the visitor sees a static image and a tab bar first, not a live 3D
  canvas competing for a small viewport and a mobile GPU/thermal budget.
- The stage indicator collapses from a row to a compact
  label-plus-dot pattern under the product name, consistent with the
  44×44px touch-target minimum applied to its interactive elements (if
  any stage becomes independently tappable) or, if purely indicative
  (not clickable), no touch-target constraint applies to it at all.
- The ten-product map (item 2) reflows from `CardGrid`'s desktop column
  count down to 1 column, matching `CardGrid.tsx`'s existing responsive
  behavior — no new component needed for this.

#### Information hierarchy and narrative

The page argues, in order: *here is one real decision, with its
evidence, right now → here are the other nine if this one isn't your
project → here is how the whole workflow fits together, if you want
detail → here is the price → here is the ask.* Unlike B, there is no
narrative gate the visitor must pass before the product is usable — the
four lifecycle stages are present as a structural orientation device
(the stage indicator, item 1) rather than as sequential prose sections
that have to be read in order. This is the sequencing choice reasoned
through in §5.2 item 5: proof first, stages as an organizing frame
around it, not a prerequisite gate before it.

**Stage indicator — new mapping required.** No product-to-stage mapping
exists in code today. `ProductControlId` (`controlRegistry.ts`) has no
stage field, and the only 10-value product enum in the codebase,
`WorkspaceProduct` (`lib/types.ts:6-17`: `Land, Design, Structure, Cost,
Market, Procure, Invest, Build, Community, Transact`), is a set of
per-product short names — not a 4-stage grouping, despite two of its
values ("Land," "Build") sharing words with the `valuePropItems` stage
names. (This is worth stating explicitly because the overlap in wording
invites misreading it as an existing stage map; it is not one — it's
used for per-product compliance-permission scoping in
`WorkspaceCockpit.tsx:131-135`, unrelated to the journey stages.) The
following product→stage mapping is therefore **new work**, proposed
here as a suggestion for operator/implementer confirmation before
building it, grounded in each product's own tagline in
`productShowcaseItems` (`page.tsx:12-23`) and each stage's own body copy
in `valuePropItems` (`page.tsx:25-30`):

| Stage (`valuePropItems`) | Products |
|---|---|
| Land | LandIntel |
| Design (`page.tsx:27`: "...get them engineered to IS codes" — already bundles design + structural engineering in one stage) | DesignStudio, Structura |
| Build (`page.tsx:28`: "Estimate, procure, manage and track...") | BOQ Pro, ProMarket, BuildOS, ProcureHub |
| Invest (`page.tsx:29`: "Model returns and raise capital...") | InvestFlow, CommunityBuild, Transact |

#### Typography / spacing / color / imagery / motion

Type, spacing, and shape tokens are unchanged from §4's guidance — same
`font-sans`/`font-heading`, same `relume-ink`/`relume-surface`/
`relume-muted`/`relume-border` palette, same `py-relume-section`/
`p-relume-card`/`max-w-relume-container` spacing scale, same
`rounded-relume`/pill-button shape system, all per §0's ground-truth
correction (`apps/web/tailwind.config.js`) rather than the stale
Inter/pure-monochrome description. What's different from §4:

- **Color — the new evidence-state system.** A new shared
  `EvidenceStateBadge` component (see Credibility below) standardizes on
  a single token pairing per state (LIVE / INDICATIVE /
  SOURCE-VERIFIED / GAP / ROADMAP) instead of the five treatments
  currently in the codebase (§5.2 item 4). Exact token assignment needs
  the same WCAG-AA contrast check §4 already flagged for
  `relume-accent`-as-text — that constraint is unchanged and repeated
  under Accessibility below.
- **Imagery — new asset requirement.** Each of the 10 products needs a
  static preview image/illustration for the hero's pre-interaction
  state. Checked: no such imagery exists today.
  `apps/web/public` contains only `favicon.svg`, `social-card.png`,
  `llms.txt`, `sw.js`, `_headers`, and `_redirects` — zero per-product
  preview assets. This is a new asset requirement, not a relabeling of
  something that already exists; do not assume placeholder imagery is
  available.
- **Motion — reduced, not added.** Unlike B, this direction introduces
  no new scroll-triggered reveal pattern; the existing
  `MotionObserver.tsx`/`data-reveal` pattern and its
  `prefers-reduced-motion` guard (`MotionObserver.tsx:7`,
  `globals.css:190-193`) remain available for the relocated product-map
  section if a subtle reveal is wanted there, but nothing here requires
  it.

#### Product-demonstration strategy

The cockpit demo's full desktop capability
(`HomepageCockpitHero.tsx`/`ProductCockpitPreview.tsx`/
`WorkspaceCockpit.tsx`/`Space3D.tsx`) is unchanged in function and stays
in the hero position it already occupies today (`page.tsx:69-70`) — no
relocation, unlike B. What's new:

- **Already there, unchanged:** the per-product tab switcher
  (`HomepageCockpitHero.tsx:47-61`), the state-per-tab behavior via
  `ProductCockpitPreview`'s keyed remount (`HomepageCockpitHero.tsx:69`,
  `key={active.id}`), `localStorage`-persisted parameters
  (`ProductCockpitPreview.tsx:31-33`), and the primary/secondary CTA
  pattern that already changes with the active tab
  (`HomepageCockpitHero.tsx:38-43`, `Open {active.label} cockpit`).
  Console's "selecting a product changes preview/task/CTA/evidence
  state" requirement is therefore **largely already true** of this
  component today — it is not a new interaction model to invent.
- **New:** (a) the pre-interaction image-first state (Imagery above),
  shown until the visitor picks a tab or the embedded cockpit is
  scrolled into view; (b) the 3D-chunk mount gate (Performance below),
  which is genuinely new — today the chunk fetches unconditionally on
  page load, not "already largely there" like the tab-switching
  behavior; (c) the `EvidenceStateBadge` attached per-product so
  "evidence state" changes with the tab as explicitly as
  "preview/task/CTA" already do.

#### Credibility and trust structure

No testimonials, client logos, user counts, or case studies — same
constraint §4 already established and still binding
(`page.tsx:153-160`, W2-345). What's new for this direction:

- **`EvidenceStateBadge`** — a new shared component replacing both
  `ProvenanceStrip.tsx`'s off-token `IndicativeChip` (amber-300/50/800,
  `ProvenanceStrip.tsx:16-26`) and the ad-hoc "INDICATIVE" text/chip
  instances found across the cockpit render path
  (`ProductCockpitPreview.tsx:49`; `WorkspaceCockpit.tsx:316`,
  `border-relume-accent bg-orange-50`; `WorkspaceCockpit.tsx:317-319`,
  ad-hoc emerald/amber). One component, one set of tokens, five states
  (LIVE / INDICATIVE / SOURCE-VERIFIED / GAP / ROADMAP) rendered as
  visible text plus color, never color alone (continuing the existing
  `ProvenanceStrip.tsx` discipline stated in its own file header
  comment, lines 1-6). **Flag this as bigger than cosmetic work**: it
  touches at minimum `ProvenanceStrip.tsx`, `ProductCockpitPreview.tsx`,
  and `WorkspaceCockpit.tsx` (three files, four call sites already
  identified), and any other sitewide use of the current
  `IndicativeChip` not audited as part of this homepage-scoped spec —
  an implementer should grep for `IndicativeChip` usage sitewide before
  starting, not assume the homepage is the only consumer.
- **The product itself as evidence** — each hero state and each
  product-map card cites what's actually live vs. roadmap for that
  specific product, extending the existing `howItWorksSteps`
  (`page.tsx:36-42`) discipline down to the per-product level rather
  than only the workflow-step level.
- **No dedicated new "trust section"** — unlike B's `CredibilityStrip`
  (§4, "New components needed"), Console's model distributes evidence to
  where the decision is made (the hero, the product cards) instead of
  concentrating it in one later section. This is the direct
  consequence of §5.2's sequencing conclusion: proof attached to the
  decision, not proof as a separate later beat.

#### Primary and secondary CTAs (suggested copy)

- **Hero primary:** **"Open [product] cockpit"** — this already exists
  in substance (`HomepageCockpitHero.tsx:38-40`, "Open {active.label}
  cockpit"); keep the pattern, it already satisfies "one clear
  task-primary hero CTA."
- **Hero secondary:** **"See all 10 products"** — a copy change from
  the current "Explore products" (`HomepageCockpitHero.tsx:41-43`) to
  match the operator's product-discovery framing more explicitly;
  functionally the same link target (`/products`), copy-only change,
  suggestion labeled as such.
- **Pricing / Final CTA:** unchanged from §4 — **"Start Free Trial"** /
  **"Contact sales"** (`page.tsx:49,56,62`), **"Talk to sales"**
  (`page.tsx:172`), `BookingConsultCta` (`page.tsx:173`, conditional on
  `healthyBookingUrl`), with the same "Ferrum Build" → "Ferrum OS"
  heading fix (`page.tsx:166`).
- Per the operator's "sales-oriented CTAs held wherever functionality
  or commercial authority is unverified" instruction: this direction
  does **not** add any new trial/signup CTA beyond what already exists
  in Pricing and Final CTA — see
  `docs/design/FERRUM_DOMAIN_AND_ROUTE_MATRIX_2026.md`'s route matrix
  for why `/signup`/`/login` are themselves fine (real, working auth)
  while promoting them ahead of unverified commercial claims is not.

#### Component and asset requirements

**Reuse as-is, unchanged in function:** `HomepageCockpitHero.tsx`,
`ProductCockpitPreview.tsx`, `WorkspaceCockpit.tsx`, `Space3D.tsx`
(logic untouched; only the mount gate below is new),
`SectionShell.tsx`, `Eyebrow.tsx`, `SectionHeading.tsx`, `Buttons.tsx`,
`CardGrid.tsx` (product map, relocated but not restyled), `SliderLeaf.tsx`
(How It Works, kept — unlike B, not retired), `BookingConsultCta.tsx`.

**Reuse with modification:**
- `ProvenanceStrip.tsx` — `IndicativeChip` replaced by
  `EvidenceStateBadge` (see Credibility above); `ProvenanceStrip`'s
  outer component keeps its source/freshness text pattern.
- `HomepageCockpitHero.tsx` — add the image-first pre-interaction state,
  the stage indicator, and the updated secondary CTA copy; no change to
  its position in `page.tsx` or to the tab-switching logic itself.
- `WorkspaceCockpit.tsx` — add the 3D-mount gate (see Performance
  below); the `IndicativeChip`/ad-hoc badge instances at lines 316-319
  are replaced by `EvidenceStateBadge`.

**New components needed:**
- `EvidenceStateBadge` — the cross-cutting evidence-state system
  described under Credibility above. The single largest net-new piece
  of engineering in this spec.
- A stage-indicator component (name suggested: `StageIndicator`) — small,
  tied to the active product via the new product→stage mapping
  (Information hierarchy above), rendered in the hero.
- A minimal pre-interaction image component for the hero (could be as
  simple as a conditionally-rendered `<img>`/`next/image` swapped for
  the live cockpit on interaction — no new design language, just new
  markup and new image assets).

**New assets:** 10 static product preview images (one per product;
confirmed none exist today — see Imagery above).

#### Accessibility constraints

- **Heading hierarchy:** one `h1` (`HomepageCockpitHero.tsx:30`,
  unchanged position), `h2` per major section (product map, how it
  works, pricing, final CTA) — no skipped levels, same rule as §4.
- **Focus visibility:** every new interactive element (stage indicator,
  if any part of it is interactive; the badge component if it ever
  carries a tooltip/expand affordance) carries the same
  `focus-visible:outline focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-relume-ink`
  pattern already used throughout
  (`HomepageCockpitHero.tsx:38,41,56`, `Buttons.tsx`).
- **Reduced motion:** the image-to-live-cockpit transition on
  interaction must not itself be an animated transition that ignores
  `prefers-reduced-motion` — a reduced-motion visitor gets an
  instant swap, using the same guard pattern as
  `MotionObserver.tsx:7`/`globals.css:190-193`.
- **Touch targets:** ≥44px (`min-h-11`) on every new interactive
  element, matching the sitewide convention and the operator's stated
  44×44px bar.
- **Non-visual equivalent for the pre-interaction image:** each static
  preview image needs real alt text describing what the product does
  (not `alt=""`), since — unlike B's live-demo-as-imagery approach —
  this is genuinely new decorative-vs-informational imagery that must
  be classified correctly.
- **Color contrast:** the same WCAG-AA contrast check §4 flagged for
  `relume-accent` as text applies directly to `EvidenceStateBadge`'s
  token choice — this needs an explicit check during implementation,
  across all five states, not an assumption either way.

#### Performance constraints

This is a static-exported Next.js site behind a Cloudflare Worker; same
platform facts as §4.

- **The 3D-mount gate is the core new performance requirement.** Today,
  confirmed by reading the code (not assumed): `WorkspaceCockpit.tsx:101`
  defaults `view` to `'space'`, and `WorkspaceCockpit.tsx:378` renders
  `Space3D` on that default — meaning the `next/dynamic(..., { ssr:
  false })` Space3D chunk (`WorkspaceCockpit.tsx:33-40`, ~591KB raw /
  ~148KB gz per the existing W-27 comment) fetches as soon as the hero
  mounts, i.e., on first paint, with no user interaction required. The
  operator's "initial visual has no 3D JS dependency" requirement means
  this must change: gate the Space3D chunk's fetch behind an explicit
  user action (selecting a product tab, or an explicit "view live 3D"
  affordance on the pre-interaction image) — **extending**, not
  replacing, the existing `next/dynamic(..., { ssr: false })` pattern
  at `WorkspaceCockpit.tsx:33-40` with an additional interaction gate on
  top of it. The dynamic-import code-splitting stays exactly as it is;
  what's new is *when* the import is triggered.
- No performance-budget file exists in this repo (checked, consistent
  with §0.4's finding) — acceptance criteria below are structural where
  no repo-verifiable number exists.
- **Production LCP ≤2.5s at p75 — stated but not currently
  verifiable.** This repo has no live traffic or Real User Monitoring
  data (per the research already done for §0.4's `budgets.json` search
  and confirmed again here). State this honestly: it is a target for
  production, not a claim this spec can certify against anything in
  this repository today.

#### Material to remove from the existing homepage

1. **"Start building with Ferrum Build" → "Start building with Ferrum
   OS."** Same fix as §4 (`page.tsx:166`); direction-independent.
2. **The unattributed "60–90% below global tools" claim**
   (`page.tsx:125`) — same flag as §1/§4, carried forward unchanged.
   Also present, not previously flagged in this document: the identical
   claim is repeated on the dedicated pricing page
   (`apps/web/app/pricing/page.tsx:60`, "pricing runs 60–90% below
   global construction-tech tools"); whatever verification/softening
   decision is made for the homepage instance should extend to this one
   too, since it's the same unverified comparative figure in two
   places, not two independent claims.
3. **Duplicated product-navigation framing** — the current Value Prop
   section (`page.tsx:72-85`) and product-showcase grid
   (`page.tsx:87-103`) both implicitly present the Land/Design/Build/
   Invest grouping (the former as prose, the latter as an ungrouped
   10-card list); folding the former into the hero's stage indicator
   (Information hierarchy above) removes this duplication.
4. **Initial 3D dependency on first paint** — see Performance above;
   this is the concrete instance of the operator's "initial decorative
   3D dependencies" removal instruction.
5. **No change required to `SiteHeader.tsx`/`MobileMenu.tsx`** — same
   as §3's finding that no direction in this document touches Ferrum
   Projects nav content; still true here. See
   `docs/design/FERRUM_DOMAIN_AND_ROUTE_MATRIX_2026.md` for the
   separate, already-drafted W2-498 nav-link work and its own open
   items.

#### Measurable implementation acceptance criteria

- Zero horizontal overflow at 375px, 430px, 1366px, and 1440px viewport
  widths, across every changed section (widths per the operator's
  stated acceptance bar; note this supersedes §4's 1728px figure with
  1440px, per the operator's explicit list — both are reasonable desktop
  checkpoints and testing both would not be wrong, but 1440px is what
  Console's own acceptance bar specifies).
- Every interactive element (product tabs, hero CTAs, badge component if
  interactive, pricing buttons, final CTA buttons) is reachable via
  keyboard in visual order, with a visible focus ring at each stop.
- With `prefers-reduced-motion: reduce` set, the image-to-cockpit
  transition and any relocated product-map reveal produce no animated
  transition.
- Exactly one `<h1>` renders on the page; each major section uses
  exactly one `<h2>`, no level skipped.
- **The Space3D chunk does not begin fetching on initial page load.** A
  network trace of a fresh page load must show zero `Space3D`-chunk
  requests until the visitor selects a product tab or otherwise
  triggers the 3D view — this is the direct, verifiable form of "initial
  visual has no 3D JS dependency" and is a stricter, more specific
  criterion than §4's beat-4-scroll-trigger version, since here there is
  no scroll distance to rely on at all (the hero is position 1).
- One clear task-primary hero CTA (`Open [product] cockpit`) — verified
  by inspecting the hero markup for exactly one primary-styled CTA.
- No new homepage copy introduces a named person, company, testimonial,
  user count, or case study.
- Every new interactive element has a computed touch target ≥44×44px.
- **Production LCP ≤2.5s at p75 is recorded as a target, not verified**
  — this criterion cannot be checked against anything in this repository
  (no RUM/production traffic exists) and must not be marked complete
  until real production measurement exists; stating it as met without
  that data would repeat the same defect class (an unverifiable
  quantitative claim asserted as fact) this document has flagged
  elsewhere (§1, the "60–90% below global tools" claim).

## Assumptions made where the repo didn't give a clean answer

- **Design-token source of truth (§0.1–0.2):** treated
  `apps/web/tailwind.config.js` as ground truth over
  `docs/skills/ferrum-relume-design/SKILL.md` and the task brief's
  Inter/pure-monochrome framing, per the skill doc's own stated
  precedence rule. If the actual intent is to *move toward* Inter/pure
  monochrome and the current config is itself the thing that's wrong,
  that's an operator decision this spec can't make unilaterally — flagged
  rather than resolved.
- **Ferrum Projects header link (§0.3):** the brief describes "the
  existing quiet header link" as something to preserve; no such link was
  found in `SiteHeader.tsx` or `MobileMenu.tsx`. Treated the current
  state as "nothing to preserve" rather than assuming the link exists
  somewhere unread — worth a second look if the operator believes it
  exists elsewhere (e.g. the footer, which was also read in full and also
  contains no Ferrum Projects reference).
- **Performance budget numbers (§0.4, acceptance criteria):** no
  `budgets.json` or equivalent exists in this repo; all performance
  criteria above are structural (chunk-fetch timing relative to scroll
  position) rather than tied to an invented millisecond/KB target.
- **"Read our compliance approach" secondary CTA (credibility strip):**
  assumes a resources/technical page exists or will exist to link to;
  not verified against the live `/resources` routes as part of this
  task — check before implementation.
