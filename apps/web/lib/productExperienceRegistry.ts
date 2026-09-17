import type { CockpitProduct } from '../components/workspace/ProductCockpitPreview'
import type { EvidenceState } from '../components/sections/EvidenceStateBadge'
import type { StudioView } from './types'
import { stageForProduct, type LifecycleStage } from './homepageStages'

/**
 * W2-500 (Project Decision Console). Single source of truth for the
 * homepage cockpit hero's ten products, replacing the inline `products`
 * array that previously lived in HomepageCockpitHero.tsx. Every field
 * below is grounded in something that already exists elsewhere in this
 * codebase (a product page's own copy/FAQ, `apps/web/worker.ts`'s real
 * routes, or `docs/api/ENDPOINT_REFERENCE.md`'s citations of them) —
 * nothing here is invented. Where a product page's own claim differs by
 * product, this registry keeps that difference; it never derives all ten
 * entries from one shared formula.
 */

/**
 * A restrained, SECONDARY accent — a thin left-border or small dot only,
 * never a full background recolor. `relume-ink` (selected-state) and
 * `relume-accent` (evidence badges) are reserved for their existing
 * purposes and never reused here (apps/web/tailwind.config.js has the
 * full token list). Deliberately NOT "ten cosmetic colour themes over the
 * same generic model" (the operator's own words): the seven products with
 * a real, working cockpit share one token (`relume-command`, the same
 * navy already used as this app's second-most-common structural color),
 * and the three ROADMAP/no-live-tool products share a second token
 * (`relume-steel`) that already carries "roadmap" meaning — it's the same
 * token `EvidenceStateBadge` uses for the ROADMAP state. The accent
 * reinforces an existing distinction (real tool vs. no tool) instead of
 * inventing a new one per product.
 */
export type ProductAccentToken = 'relume-command' | 'relume-steel'

/**
 * Either the real, working tool that renders for this product today
 * (every product except BuildOS/ProcureHub/CommunityBuild routes through
 * ProductCockpitPreview -> WorkspaceCockpit, confirmed live by reading
 * apps/web/worker.ts's routes it calls into), or an explicit roadmap/gap
 * marker with a one-line reason — never a fake interactive substitute.
 */
export type ProductTool =
  | { kind: 'live-cockpit'; component: 'ProductCockpitPreview' }
  | { kind: 'ROADMAP' | 'GAP'; reason: string }

export type ProductExperience = {
  id: CockpitProduct
  label: string
  /** Sourced from lib/homepageStages.ts's stageForProduct — not duplicated here. */
  stage: LifecycleStage
  /** Who this product's cockpit view is for, in their own words where possible. */
  persona: string
  /** The one decision this product's cockpit helps that persona make. */
  lens: string
  accent: ProductAccentToken
  /**
   * Which WorkspaceCockpit view (StudioView, apps/web/lib/types.ts) this
   * product's real tool opens on by default. Wired through as a real prop
   * (WorkspaceCockpit.tsx's new `initialView`, threaded via
   * ProductCockpitPreview.tsx's new `defaultView`) — not a cosmetic label
   * with no effect. For the three ROADMAP products this field is inert
   * (no real cockpit ever mounts for them from the homepage hero), kept
   * as 'space' only so the type stays total; it is never read for those
   * three.
   */
  defaultView: StudioView
  tool: ProductTool
  /** What's actually adjustable today. Empty for ROADMAP products — nothing invented. */
  controls: string[]
  /** What this product's cockpit actually shows as output. Empty for ROADMAP products. */
  outputCards: string[]
  evidenceState: EvidenceState
  /** One-line, product-specific truth disclosure. */
  provenance: string
  primaryCta: { label: string; href: string }
}

const roadmapReason = (label: string) =>
  `${label}'s own product page (apps/web/app/products/${label.toLowerCase().replace(/\s+/g, '')}/page.tsx) discloses zero "(live)" features — every workflow on it is explicitly roadmap.`

export const productExperienceRegistry: Record<CockpitProduct, ProductExperience> = {
  landintel: {
    id: 'landintel',
    label: 'LandIntel',
    stage: stageForProduct.landintel,
    persona: 'Land buyer/developer deciding whether to buy or build on a specific plot',
    lens: 'Is this parcel viable — what does the record say, and what does it allow?',
    accent: 'relume-command',
    // Plot/site orientation is the natural default for a land-evaluation tool.
    defaultView: 'plan',
    tool: { kind: 'live-cockpit', component: 'ProductCockpitPreview' },
    controls: ['ULPIN sample-record selector', 'open-ground / setback slider'],
    outputCards: ['ULPIN parcel record (state, district, area, land use)', 'sample FAR/coverage scenario'],
    evidenceState: 'INDICATIVE',
    provenance: 'ULPIN lookup returns 3 seeded, indicative records only (GET /api/ulpin/:id) — not an official land-record integration; the FAR scenario applies a disclosed sample Karnataka ruleset.',
    primaryCta: { label: 'Open LandIntel cockpit', href: '/products/landintel' },
  },
  designstudio: {
    id: 'designstudio',
    label: 'DesignStudio',
    stage: stageForProduct.designstudio,
    persona: 'Developer/homeowner starting a building design from plot dimensions',
    lens: 'Will this massing fit my plot at the floor count I want?',
    accent: 'relume-command',
    // 3D massing exploration is DesignStudio's stated core value prop.
    defaultView: 'space',
    tool: { kind: 'live-cockpit', component: 'ProductCockpitPreview' },
    controls: ['plot width / depth / setback / floors sliders (test-fit massing)'],
    outputCards: ['buildable-area massing result', 'DXF export'],
    evidenceState: 'INDICATIVE',
    provenance: 'Test-fit massing (POST /api/testfit) is real; AI plan generation, elevation library, plan editor and 3D viewer are all roadmap — no AI/LLM generation exists anywhere in this codebase.',
    primaryCta: { label: 'Open DesignStudio cockpit', href: '/products/designstudio' },
  },
  structura: {
    id: 'structura',
    label: 'Structura',
    stage: stageForProduct.structura,
    persona: 'Structural engineer/designer sanity-checking a beam or column section',
    lens: 'Does this section pass the relevant IS 456/IS 800 clause?',
    accent: 'relume-command',
    // Plan view surfaces the governing span per floor that the live IS 456 check reads.
    defaultView: 'plan',
    tool: { kind: 'live-cockpit', component: 'ProductCockpitPreview' },
    controls: ['beam span/depth (IS 456) and column slenderness/load (IS 800) parameters'],
    outputCards: ['IS 456 RCC beam span/depth check (pass/review, clause cited)', 'IS 800 steel column check'],
    evidenceState: 'INDICATIVE',
    provenance: 'Two textbook clause checks are real (POST /api/is-check) — not comprehensive code coverage; model import, FEA, sign-off workflow and drawing generation are all roadmap.',
    primaryCta: { label: 'Open Structura cockpit', href: '/products/structura' },
  },
  'boq-pro': {
    id: 'boq-pro',
    label: 'BOQ Pro',
    stage: stageForProduct['boq-pro'],
    persona: 'Developer/contractor budgeting a build before committing to it',
    lens: 'Roughly what will this build cost, split by material, labour and GST?',
    accent: 'relume-command',
    // Room-by-room measured quantities read most naturally in plan view.
    defaultView: 'plan',
    tool: { kind: 'live-cockpit', component: 'ProductCockpitPreview' },
    controls: ['built-up area slider', 'sample construction-grade selector'],
    outputCards: ['material / labour / 18% GST cost split', 'P25/P50/P75 Ferrum rate band', 'measured quantities (rates blank until verified)'],
    evidenceState: 'INDICATIVE',
    provenance: 'City-wise cost-split scenario is real (POST /api/boq-estimate, POST /api/ferrum-rate, seeded Bengaluru/Pune/Chennai rates) — not a measured take-off; brand-wise materials and connected export are roadmap.',
    primaryCta: { label: 'Open BOQ Pro cockpit', href: '/products/boq-pro' },
  },
  promarket: {
    id: 'promarket',
    label: 'ProMarket',
    stage: stageForProduct.promarket,
    persona: 'Developer sanity-checking a contractor or supplier quote',
    lens: 'Is this quoted rate reasonable compared to other cities?',
    accent: 'relume-command',
    defaultView: 'space',
    tool: { kind: 'live-cockpit', component: 'ProductCockpitPreview' },
    controls: ['material/labour category selector', 'sample-city comparison'],
    outputCards: ['cross-city rate comparison'],
    evidenceState: 'INDICATIVE',
    provenance: 'Rate comparison across sample cities is real (GET /api/rates/compare) — the professionals marketplace itself (profiles, job posting, proposals, escrow, reviews) has not launched.',
    primaryCta: { label: 'Open ProMarket cockpit', href: '/products/promarket' },
  },
  buildos: {
    id: 'buildos',
    label: 'BuildOS',
    stage: stageForProduct.buildos,
    persona: 'Construction project manager / site team',
    lens: 'Not applicable yet — no live workflow exists to make a decision with.',
    accent: 'relume-steel',
    defaultView: 'space',
    tool: { kind: 'ROADMAP', reason: roadmapReason('BuildOS') },
    controls: [],
    outputCards: [],
    evidenceState: 'ROADMAP',
    provenance: "BuildOS's own product page states plainly: \"nothing on it is buildable or usable today.\" No task management, RFIs, QA/QC, progress tracking or MB/RA billing exist anywhere in this codebase.",
    primaryCta: { label: 'See the BuildOS roadmap', href: '/products/buildos' },
  },
  procurehub: {
    id: 'procurehub',
    label: 'ProcureHub',
    stage: stageForProduct.procurehub,
    persona: 'Site / procurement manager',
    lens: 'Not applicable yet — no live workflow exists to make a decision with.',
    accent: 'relume-steel',
    defaultView: 'space',
    tool: { kind: 'ROADMAP', reason: roadmapReason('ProcureHub') },
    controls: [],
    outputCards: [],
    evidenceState: 'ROADMAP',
    provenance: 'No feature on ProcureHub\'s own product page is labeled "(live)". Material requests, purchase orders, delivery tracking, supplier directory, bill reconciliation and payment integration are all unbuilt.',
    primaryCta: { label: 'See the ProcureHub roadmap', href: '/products/procurehub' },
  },
  investflow: {
    id: 'investflow',
    label: 'InvestFlow',
    stage: stageForProduct.investflow,
    persona: 'Investor/developer modelling whether a deal is worth committing capital to',
    lens: 'What is this project\'s IRR/NPV, and is that return worth it?',
    accent: 'relume-command',
    defaultView: 'space',
    tool: { kind: 'live-cockpit', component: 'ProductCockpitPreview' },
    controls: ['cash-flow schedule inputs', 'discount rate'],
    outputCards: ['IRR', 'NPV (yield is not computed)'],
    evidenceState: 'INDICATIVE',
    provenance: 'Cash-flow modelling and IRR/NPV are real (POST /api/irr-npv, lib/finance/irrNpv.ts) — yield is not computed; sensitivity analysis, investor dashboards, capital-commitment tracking and scenario planning are all roadmap.',
    primaryCta: { label: 'Open InvestFlow cockpit', href: '/products/investflow' },
  },
  communitybuild: {
    id: 'communitybuild',
    label: 'CommunityBuild',
    stage: stageForProduct.communitybuild,
    persona: 'Fractional/community real-estate investor',
    lens: 'Not applicable yet — SPV creation and investor commitments are unbuilt.',
    accent: 'relume-steel',
    defaultView: 'space',
    // CommunityBuild contradiction resolution (docs/design/
    // FERRUM_DOMAIN_AND_ROUTE_MATRIX_2026.md's finding, carried through
    // here): the product page's own "Construction status (demo)" feature
    // item has a title that says "(demo)" but a body that says "A fixed
    // sample status, not live per-project tracking — not yet built" — the
    // title and body disagree about whether a demo exists at all. Reading
    // the actual component (CdeStatusMock, wrapping GET
    // /api/cde-status/:project_id) resolves it: that route "ignores
    // project_id" and "always returns the same fixed indicative payload"
    // (docs/api/ENDPOINT_REFERENCE.md) for ANY project — there is no real
    // per-project demo, just one hardcoded response reused everywhere.
    // That is roadmap-grade, not a working sample worth a separate
    // "SAMPLE" evidence state: EvidenceState was NOT extended for this.
    // ROADMAP already says exactly the true thing ("no live workflow");
    // inventing SAMPLE risks recreating the same title/body mismatch this
    // registry exists to fix, so ROADMAP is the closer honest fit.
    tool: { kind: 'ROADMAP', reason: 'SPV creation, investor commitments, KYC/AML, profit distribution and investor reporting are all unbuilt; the one on-page widget (CdeStatusMock) returns a single fixed status for any project_id, not real per-project tracking.' },
    controls: [],
    outputCards: [],
    evidenceState: 'ROADMAP',
    provenance: 'CommunityBuild\'s "Construction status (demo)" widget always returns the same fixed payload for any project (GET /api/cde-status/:project_id ignores its own project_id, per apps/web/worker.ts) — not a live demo of anything project-specific.',
    primaryCta: { label: 'See the CommunityBuild roadmap', href: '/products/communitybuild' },
  },
  transact: {
    id: 'transact',
    label: 'Transact',
    stage: stageForProduct.transact,
    persona: 'Property buyer/seller close to a transaction',
    lens: 'Roughly what will stamp duty cost, and what\'s a reasonable ask/offer band?',
    accent: 'relume-command',
    defaultView: 'plan',
    tool: { kind: 'live-cockpit', component: 'ProductCockpitPreview' },
    controls: ['state selector (stamp duty)', 'base value + urgency slider (ask band)'],
    outputCards: ['indicative stamp duty + registration fee', 'indicative ask-band range'],
    evidenceState: 'INDICATIVE',
    // Test-mode disclosure, verified rather than assumed: Transact itself
    // has no payment coupling in its two live calculators (GET
    // /api/stamp-duty/:state, POST /api/ask-band are pure calculators,
    // no payment call). The real test-mode disclosure on this product is
    // its case-flow token-payment step (POST /api/payments/order falls
    // back to StubPaymentProvider whenever RAZORPAY_KEY_ID/SECRET are
    // unset, apps/web/worker.ts:50-55), which Transact's own FAQ already
    // states in plain language: "test mode only — no live payment
    // integration exists yet, and no funds move."
    provenance: 'Stamp-duty/ask-band figures are indicative sample rates (D1StampDutyProvider seed data, GET /api/stamp-duty/:state, POST /api/ask-band). Separately, Transact\'s case-flow token-payment step is test mode only (StubPaymentProvider) — no live payment integration exists, no funds move.',
    primaryCta: { label: 'Open Transact cockpit', href: '/products/transact' },
  },
}

export const productExperienceList: ProductExperience[] = [
  productExperienceRegistry.landintel,
  productExperienceRegistry.designstudio,
  productExperienceRegistry.structura,
  productExperienceRegistry['boq-pro'],
  productExperienceRegistry.promarket,
  productExperienceRegistry.buildos,
  productExperienceRegistry.procurehub,
  productExperienceRegistry.investflow,
  productExperienceRegistry.communitybuild,
  productExperienceRegistry.transact,
]
