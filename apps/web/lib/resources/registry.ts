// CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE. Single source of truth for
// the /resources hub's six-category taxonomy: category metadata (name, href,
// summary, source scope) plus publication counts derived from the actual
// content lists below, never padded or hand-typed independently on the hub
// page. resourcesRegistry.test.ts cross-checks these counts against the
// real route tree on disk so the two can't drift apart silently.

import { faqs } from '../../app/resources/faq/data'
import { groups as glossaryGroups } from '../../app/resources/glossary/data'

export type ResearchCase = {
  slug: string
  title: string
  summary: string
  source: { label: string; url: string; publisher: string }
  jurisdiction: string
  publicationNote: string
  analysisBoundary: string
  evidenceStatus: string
}

// Each entry cites one source from the operator-approved primary-source
// register (CODEX-SENTINEL-20260918-1714-resource-evidence-seo). No entry
// claims Ferrum delivered, verified, or was involved in the underlying
// government programme -- these are independent explainers of public
// primary-source material, not customer or product-usage evidence.
export const RESEARCH_CASES: ResearchCase[] = [
  {
    slug: 'nbc-2016-scope',
    title: 'National Building Code of India: what NBC actually governs',
    summary:
      'A scope map of the National Building Code -- what it covers, how it relates to state/municipal building bylaws, and where a reader needs the primary text rather than a summary.',
    source: {
      label: 'National Building Code of India',
      url: 'https://www.bis.gov.in/standards/national-building-code/?lang=en',
      publisher: 'Bureau of Indian Standards (BIS)',
    },
    jurisdiction: 'India (national model code; adopted or adapted by state and municipal building bylaws)',
    publicationNote:
      'Published and maintained by BIS as SP 7. Amendment status changes over time -- check the BIS source page directly for the current edition and amendment slips before relying on any specific clause.',
    analysisBoundary:
      'This page explains what the Code covers and how Ferrum OS workflows reference it. It does not reproduce NBC clause text, does not certify any project as NBC-compliant, and is not a substitute for a licensed structural or building-code professional\'s review.',
    evidenceStatus: 'Primary source: official BIS publication page. No proprietary standards text reproduced here.',
  },
  {
    slug: 'rera-act-2016-framework',
    title: 'RERA Act, 2016: the statutory framework, not a compliance verdict',
    summary:
      'An overview of what the central Real Estate (Regulation and Development) Act actually requires -- registration, disclosure, and timeline obligations -- and where state-level RERA rules diverge from the central text.',
    source: {
      label: 'The Real Estate (Regulation and Development) Act, 2016',
      url: 'https://www.indiacode.nic.in/indiacode/handle/123456789/2158?view_type=browse',
      publisher: 'India Code, Legislative Department, Ministry of Law and Justice',
    },
    jurisdiction: 'India (central act; implementing rules and RERA authority procedures vary by state)',
    publicationNote:
      'India Code hosts the authoritative statutory text. This page summarizes structure and intent only -- state RERA authority notifications and amendments are not tracked here and must be checked at the relevant state RERA authority.',
    analysisBoundary:
      'This is a statutory-framework overview, not legal advice and not a compliance certification for any specific project, developer, or transaction. Ferrum OS is a facilitator, not a legal practitioner.',
    evidenceStatus: 'Primary source: India Code statutory text. Independent summary; no clause-by-clause reproduction.',
  },
  {
    slug: 'open-government-data-construction',
    title: "India's open government data ecosystem for land and construction",
    summary:
      'How data.gov.in organizes the open datasets relevant to land, planning, and construction so a diligence team knows where to look for independently verifiable public data.',
    source: {
      label: 'Open Government Data (OGD) Platform India',
      url: 'https://data.gov.in/',
      publisher: 'National Informatics Centre (NIC), Ministry of Electronics and Information Technology (MeitY)',
    },
    jurisdiction: 'India (national open-data portal aggregating central and state datasets)',
    publicationNote:
      'Dataset availability and freshness are set by each contributing department, not by this page. Always confirm a dataset\'s last-updated date on data.gov.in itself before citing a figure from it.',
    analysisBoundary:
      'This page is a navigation aid to the portal\'s structure. It does not claim Ferrum OS has a live data pipeline into data.gov.in, and it does not restate any dataset\'s figures as current.',
    evidenceStatus: 'Primary source: official Government of India open-data portal.',
  },
  {
    slug: 'dilrmp-land-records-modernization',
    title: 'DILRMP: reading a state land-records modernization progress catalog',
    summary:
      'What the Digital India Land Records Modernization Programme progress catalog entry actually publishes, using the Andhra Pradesh state node as a worked example of how to read one of these catalog entries.',
    source: {
      label: 'Digital India Land Records Modernization Programme -- Progress (Andhra Pradesh)',
      url: 'https://ap.data.gov.in/catalog/digital-india-land-records-modernization-programme-progress',
      publisher: 'Government of Andhra Pradesh, published on the Open Government Data (OGD) Platform India (data.gov.in, operated by NIC/MeitY), reflecting DILRMP under the Department of Land Resources',
    },
    jurisdiction: 'Andhra Pradesh state catalog entry, within the national DILRMP scheme (Department of Land Resources, Ministry of Rural Development)',
    publicationNote:
      'Progress figures in the catalog are updated by the contributing department on its own schedule. This page explains the dataset\'s structure and does not restate specific completion percentages as current -- readers should pull the live figures directly from the catalog entry.',
    analysisBoundary:
      'Explains how to read this class of government progress dataset for diligence purposes. It is not an audit of DILRMP outcomes and does not assert any specific district or state\'s current digitization status.',
    evidenceStatus: 'Primary source: official state open-data catalog entry. Figures not independently re-verified in this pass -- cite the live catalog for current numbers.',
  },
  {
    slug: 'survey-of-india-geospatial-guidelines',
    title: 'Survey of India geospatial guidelines: what they mean for parcel mapping',
    summary:
      'A plain-language walk-through of why Survey of India\'s geospatial data guidelines matter to land-parcel mapping and diligence workflows, without restating the guideline text itself.',
    source: {
      label: 'Geospatial Data Guidelines',
      url: 'https://onlinemaps.surveyofindia.gov.in/GeospatialGuidelines.aspx',
      publisher: 'Survey of India, Department of Science & Technology',
    },
    jurisdiction: 'India (national geospatial data policy, applicable to mapping and survey activity)',
    publicationNote:
      'Guideline text and any accuracy-class thresholds are set by Survey of India and can change; this page does not quote specific thresholds and is not updated on the same cadence as the source. Check the source page directly before relying on a specific figure.',
    analysisBoundary:
      'Context for why geospatial guidelines matter to parcel-mapping workflows, not a reproduction of the guidelines and not a certification that any Ferrum OS map output meets a specific accuracy class.',
    evidenceStatus: 'Primary source: official Survey of India publication page.',
  },
]

// Directory names under apps/web/app/resources/blog, excluding the private
// `_template` folder -- kept as an explicit list (not a runtime fs.readdir)
// because this file also has to run in the browser bundle; the test file
// verifies this list against the real directory tree on disk.
export const BLOG_SLUGS = [
  'advanced-ulpin',
  'cement-storage-humidity',
  'construction-insurance-101',
  'formwork-pressure-calculation',
  'foundation-retrofit-costs',
  'gst-for-builders',
  'home-loan-margins',
  'is-1200-vs-cesmm4',
  'monsoon-concreting',
  'monsoon-structural-checks',
  'piling-quality-gates',
  'prefab-connection-detailing',
  'procurement-terms',
  'rera-compliance',
  'seismic-retrofit-timeline',
  'site-safety-checklist',
  'steel-price-hedges',
  'tunnel-form-construction',
  'ulin-explained',
  'weld-inspection-basics',
]

export const CHECKLIST_SLUGS = [
  'concrete-pour-readiness',
  'crane-lift-plan',
  'crane-maintenance',
  'handover-documents',
  'material-receiving',
  'retrofit-handover',
  'scaffold-handover',
  'structural-punch-list',
]

// Legacy customer-story slugs that used to live under /resources/case-studies.
// These are no longer part of public discovery (removed from the hub, footer,
// sitemap, and internal links) -- kept only as a truthful compatibility
// surface at their original URLs so an inbound link or bookmark doesn't 404.
export const LEGACY_CASE_STUDY_SLUGS = [
  'airport-cargo-bay',
  'clinic-retrofit',
  'contractor-fleet',
  'greenfield-developer',
  'infrastructure-contractor',
  'library-retrofit',
  'municipal-market-retrofit',
  'self-build-family',
]

export type StandardRef = {
  /** Exact code + edition, e.g. "IS 456:2000" or "IS 875 (Part 3):2015" -- never a bare series label like "IS 1200" with no edition. */
  code: string
  use: string
  stance: 'Adopt' | 'Hold' | 'Drop'
  /** Ferrum OS's own workflow-fit judgment -- never a claim about the standard's technical merit or legal status. */
  stanceIsFerrumJudgment: true
  note: string
  publisher: string
  /** Must be an exact official BIS publication/detail page for this exact standard+edition -- never the bare BIS homepage or a general portal URL. */
  sourceUrl: string
  sourceLabel: string
  editionNote: string
}

// Every standard displayed anywhere on the Standards Navigator page --
// resourcesRegistry.test.ts asserts the page's displayed standard codes are
// exactly this list, that every sourceUrl is an exact official BIS
// publication/detail link (not the bare homepage), and that no entry's text
// mentions seismic/earthquake loading under IS 875 (Part 3 covers wind
// loads only, explicitly "other than earthquake" per its own title).
//
// IS 1200 was removed from this list: BIS's official registry indexes IS
// 1200 by individual parts (e.g. Part 1, Part 2, ...), and Ferrum OS does
// not hold a verified official link for the specific part this page would
// need to cite -- a generic "IS 1200" series label sourced from one part
// misrepresents the rest of the series as covered. Do not re-add IS 1200
// here without a verified official link to the specific part being
// described.
export const STANDARDS: StandardRef[] = [
  {
    code: 'IS 456:2000',
    use: 'Plain and reinforced concrete design',
    stance: 'Adopt',
    stanceIsFerrumJudgment: true,
    note: 'Remains the default technical rule for concrete design in Indian execution environments -- a Ferrum OS workflow-fit judgment, not a claim about IS 456:2000 itself.',
    publisher: 'Bureau of Indian Standards (BIS)',
    sourceUrl: 'https://standards.bis.gov.in/website/standard-details?encryptedId=eyJpdiI6IklDVkNWRENLWC8rOEVnOTlBMTEyblE9PSIsInZhbHVlIjoiaVR3ZGh2dG05eDg0eXFURHRjMGZkZz09IiwibWFjIjoiZTAzZDE0OTU1MTFiMDlmNTJkMzUyODhhZTg2YTJjN2I5ZTk3ZDk5YzIxZDNlNGYzY2EwMjQ1NmI3MTI0OGJjNiIsInRhZyI6IiJ9',
    sourceLabel: 'Official BIS standard-details page for IS 456:2000',
    editionNote: 'This links to BIS\'s own standard-details page for this exact edition. BIS may amend or supersede a standard over time -- confirm current status on this same official page before relying on any specific clause.',
  },
  {
    code: 'IS 800:2007',
    use: 'General construction in steel',
    stance: 'Adopt',
    stanceIsFerrumJudgment: true,
    note: 'The default for steel buildings, towers, and industrial structures in India -- a Ferrum OS workflow-fit judgment, not a claim about IS 800:2007 itself.',
    publisher: 'Bureau of Indian Standards (BIS)',
    sourceUrl: 'https://standards.bis.gov.in/website/standard-details?encryptedId=eyJpdiI6Im43M0VEUlEzQzJCV1FONEhidC9pcEE9PSIsInZhbHVlIjoiZ0oyd0FvMVFwVFFuQ0g4WHRlNk11dz09IiwibWFjIjoiOWY2NDkwODc0ZjY0OThkOTQ0YTY5YWRlNzc4NTM5MWQ3ZDI4N2ZlZmU1YWU2YjlhOTAxNDc2M2Q3MTU0ZDlkZiIsInRhZyI6IiJ9',
    sourceLabel: 'Official BIS standard-details page for IS 800:2007',
    editionNote: 'This links to BIS\'s own standard-details page for this exact edition. BIS may amend or supersede a standard over time -- confirm current status on this same official page before relying on any specific clause.',
  },
  {
    code: 'IS 875 (Part 3):2015',
    use: 'Wind loads on buildings and structures, other than earthquake. Design loads for earthquake are a separate standard (IS 1893), not covered on this page.',
    stance: 'Adopt',
    stanceIsFerrumJudgment: true,
    note: 'The default wind-load code for Indian buildings and structures -- a Ferrum OS workflow-fit judgment, not a claim about IS 875 (Part 3):2015 itself. Scope is wind loads only, other than earthquake.',
    publisher: 'Bureau of Indian Standards (BIS)',
    sourceUrl: 'https://standards.bis.gov.in/website/standard-details?encryptedId=eyJpdiI6Ik9ZZXZxVC9pWkJhZWorZjFBejJmb3c9PSIsInZhbHVlIjoidjZkeXJEeEpHeS9oT1dPQnR3cWVrdz09IiwibWFjIjoiMWZhYzY4MGUxOGRjNmZkNzQ5ZWUyZWNhM2NhMDZmM2IzNDIxMDc2NTdjMzJkYWEzMzc5ZjM5OTM5OGRkN2NlYSIsInRhZyI6IiJ9',
    sourceLabel: 'Official BIS standard-details page for IS 875 (Part 3):2015',
    editionNote: 'This links to BIS\'s own standard-details page for this exact part and edition. BIS may amend or supersede a standard over time -- confirm current status on this same official page before relying on any specific clause.',
  },
  {
    code: 'IS 2062:2011',
    use: 'Grade-based steel material procurement',
    stance: 'Adopt',
    stanceIsFerrumJudgment: true,
    note: 'Used as the default material-grade reference in steel procurement -- a Ferrum OS workflow-fit judgment, not a claim about IS 2062:2011 itself.',
    publisher: 'Bureau of Indian Standards (BIS)',
    sourceUrl: 'https://www.services.bis.gov.in/tmp/SR2062.pdf',
    sourceLabel: 'Official BIS preview (SR2062.pdf) for IS 2062:2011',
    editionNote: 'This links to BIS\'s own official preview document for this exact edition. BIS may amend or supersede a standard over time -- confirm current status via the BIS standards portal before relying on any specific clause.',
  },
  // CESMM4 is intentionally excluded from this list: Ferrum OS has not
  // verified an official ICES publisher source for it, and an unverified
  // source does not satisfy this page's source-coverage standard. It is
  // discussed informally, as an article rather than a sourced standard, on
  // the blog (/resources/blog/is-1200-vs-cesmm4) -- do not add it back here
  // without a verified official-source URL.
  //
  // IS 1200 is intentionally excluded -- see the comment above this array.
]

// Kept for callers that only need the count/list of codes.
export const STANDARDS_COVERED = STANDARDS.map((s) => s.code)

// A source URL is rejected as "not exact" when it's the bare BIS domain
// homepage or a general/non-deep-link page -- every published standard must
// link to its own specific standard-details/preview page, never a landing
// page a reader would then have to search from. Exported so the test file
// (and any future page reusing this list) shares one definition.
export const BIS_HOMEPAGE_PATTERN = /^https:\/\/(www\.)?bis\.gov\.in\/?(\?.*)?$/i

// Derived directly from glossary/data.ts's `groups` -- never a hand-typed
// number, so it can't drift from what the Glossary page actually renders.
export const GLOSSARY_TERM_COUNT = glossaryGroups.reduce((total, group) => total + group.items.length, 0)

// Derived directly from faq/data.ts's `faqs` -- never a hand-typed number,
// so it can't drift from what the FAQ page actually renders.
export const FAQ_COUNT = faqs.length

export type ResourceCategory = {
  key: string
  label: string
  name: string
  href: string
  summary: string
  sourceScope: string
  count: number
  countLabel: string
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    key: 'blog',
    label: 'Articles',
    name: 'Blog',
    href: '/resources/blog',
    summary: 'Field notes, standards explainers, and operational checklists for land, design, and delivery teams.',
    sourceScope: 'Ferrum OS editorial team, written from published standards and public market context.',
    count: BLOG_SLUGS.length,
    countLabel: `${BLOG_SLUGS.length} articles`,
  },
  {
    key: 'research-cases',
    label: 'Research',
    name: 'Research Cases',
    href: '/resources/research-cases',
    summary:
      'Independent explainers grounded in named primary sources -- government codes, statutes, and open datasets -- with source, jurisdiction, and evidence status stated on every entry.',
    sourceScope: 'Primary official sources only (BIS, India Code, data.gov.in, Survey of India). No customer or product-usage claims.',
    count: RESEARCH_CASES.length,
    countLabel: `${RESEARCH_CASES.length} research cases`,
  },
  {
    key: 'standards-navigator',
    label: 'Standards',
    name: 'Standards Navigator',
    href: '/resources/standards-navigator',
    summary: 'A practical radar for Indian construction standards: what to adopt, hold, or drop in real workflows, with each standard\'s publisher and source status stated -- not a reproduction of any standard\'s text.',
    sourceScope: 'Scope and adoption guidance only -- proprietary BIS/NBC/IS clause text is never reproduced. Adopt/Hold/Drop stances are Ferrum OS workflow judgments, not verdicts from the standards bodies.',
    count: STANDARDS_COVERED.length,
    countLabel: `${STANDARDS_COVERED.length} standards covered`,
  },
  {
    key: 'checklists',
    label: 'Field Tools',
    name: 'Checklists',
    href: '/resources/checklists',
    summary: 'Site-ready checklists for structural handover, retrofit closeout, project handover documents, and concrete pour readiness.',
    sourceScope: 'Ferrum OS field-operations team, built from standard site-handover practice.',
    count: CHECKLIST_SLUGS.length,
    countLabel: `${CHECKLIST_SLUGS.length} checklists`,
  },
  {
    key: 'glossary',
    label: 'Reference',
    name: 'Glossary',
    href: '/resources/glossary',
    summary: 'A working reference for the standards, codes, and operational vocabulary used across Ferrum OS resources.',
    sourceScope: 'Definitions written in-house, cross-referenced against the standards and statutes they describe.',
    count: GLOSSARY_TERM_COUNT,
    countLabel: `${GLOSSARY_TERM_COUNT} terms`,
  },
  {
    key: 'faq',
    label: 'Support',
    name: 'FAQ',
    href: '/resources/faq',
    summary: 'Common questions about the resources library, how it is maintained, and how to read, cite, or contribute to it.',
    sourceScope: 'Editorial policy questions, answered directly by the Ferrum OS team.',
    count: FAQ_COUNT,
    countLabel: `${FAQ_COUNT} questions`,
  },
]
