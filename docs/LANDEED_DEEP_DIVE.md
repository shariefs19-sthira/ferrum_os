# LANDEED_DEEP_DIVE.md — landeed.com competitive research

Live research per RULE 54, `www.landeed.com` (marketing) + `web.landeed.com` (product app) — the same private aggregator flagged as UNVERIFIED in `docs/PLOT_TRUTH_ENGINE_SPEC.md`'s source map, now researched directly. Company is **John Salt Private Limited** (per site footer). Data current as of 2026-09-07.

---

## 1. What they actually do — full feature inventory

Landeed is not a single tool — it's a property-document/title-verification platform with five distinct product lines, each its own page:

| Product | What it does | Turnaround claim |
|---|---|---|
| **Document Retrieval Platform** | Search + retrieve 200+ official property document types (EC, Sale Deed, RoR, 7/12, Patta, Khata, FMB, etc.) by owner name, document number, survey ID, or map/address | "Days, not months" (this page) — inconsistent with the AI Title Report page's "minutes" claim; the two products have genuinely different turnarounds and the marketing doesn't always make that distinction obvious |
| **Document Fetch API** | Same document universe, but programmatic REST endpoints for enterprise integration (inputs: survey no., village no., etc.) | Not separately stated; positioned as "at scale" |
| **AI Title Reports** ("Terra Black") | An AI agent reviews deeds + revenue records, searches litigation and CERSAI (the central charge registry for secured lending), and produces a "lawyer-ready" structured report, normalized across regional languages and jurisdictions, citing sources, covering both 13-year and 30-year diligence horizons | "Minutes, not days" — the fastest-claimed product, and the one they've published an actual benchmark for (see §5) |
| **Encumbrance Monitor & Downtime Management** | Ongoing monitoring of EC changes on a property (post-purchase/post-loan tracking) | Not stated |
| **Registration & Post-Registration Services** | Agreement-to-mutation handling — i.e. they'll execute the paperwork, not just retrieve it | Not stated |
| **Bill & Utility Payments** | Property-tax and utility bill payment, one platform | Not stated |
| **Pulse** (new, Aug 2026) | Market-intelligence layer — 5-year price-movement tracking across Hyderabad villages/apartments, classified into Growth (≥8% CAGR)/Stability (4-8%)/Deal (<4%) segments | Hyderabad-only so far, explicitly framed as a new launch |
| **LEX** | "Effortless property document management and seamless registrations" — appears to be a lawyer/legal-team-facing variant of the retrieval + registration products | Not independently distinguished from the main retrieval product in the pages checked |

**User flow (input → output), as observed:** the homepage's primary CTA is a natural-language search box ("Type an address, project name, survey number or paste a listing link") paired with pre-written prompt chips ("Whose name is this property in right now?", "Will this property get a loan approved?", "Does the seller's story match the records?") — a conversational/agentic framing over the retrieval + title-report products, not a traditional form-fill flow. The actual document-search product (`web.landeed.com`) is a separate app; this research pass reached its landing page but the app itself timed out under automated navigation (likely a persistent-connection SPA) — **the live search flow itself was not walked to a sample-report output this pass**, unlike `homeplannner.com` last pass. This is a real gap in this research, flagged rather than glossed over.

**What a sample report contains (per the AI Title Reports page's own description, not independently observed as an actual generated report):** a structured document citing source documents for each claim, covering litigation search + CERSAI charges + EC/ownership-gap/RoR-anomaly surfacing, across both a 13-year and a 30-year diligence horizon — this describes the report's claimed contents, not a report this research actually obtained.

---

## 2. Coverage

**23+ Indian states**, explicitly claimed with "deep rural and urban reach." Named states with dedicated document pages seen this pass: Andhra Pradesh, Tamil Nadu, Karnataka, Telangana, Maharashtra, Delhi, Assam, Gujarat, Haryana, West Bengal (via stamp-duty calculator pages) — **depth per state was not independently quantified this pass** (no per-state document-type-count table found); the "23+ states" figure is a company claim, not independently verified against a published state list.

---

## 3. Pricing tiers + paywall points

**No public self-serve pricing was found anywhere in this research pass.** Every product page's primary CTA is "Book a demo" (AI Title Reports, Document Fetch API, Document Retrieval) rather than a price list or self-serve signup — this is consistent across all product lines checked, strongly indicating an **enterprise/B2B sales-led model**, not a consumer self-serve product, despite the consumer-facing marketing tone on the homepage ("I want to buy a new property," "I am applying for a home loan"). The paywall point, functionally, is the sales conversation itself — no price is disclosed pre-contact.

---

## 4. Data sources claimed + legal-access posture

**Claimed sources:** "Registration, Revenue, Panchayat & Survey" departments (per the Document Retrieval page's own description), plus litigation records and **CERSAI** (Central Registry of Securitisation Asset Reconstruction and Security Interest — India's official charge/mortgage registry) for the AI Title Report product.

**How they claim to legally obtain them:** the site states **"Partnership with Government... helps in improving the digital land records"** — a direct claim of an official government relationship, not purely a scraping operation. This is corroborated by two hiring signals (§5): a **Head of Corporate Affairs, Public Policy & Government Relations** role (suggests active, ongoing government-relationship management, not a one-time deal) and a **Legal Associate** role. However, the simultaneous **Web Automation Engineer** opening is a real, honest technical signal that at least part of their retrieval pipeline is browser-automation/scraping-based, not purely API-based government access — the two are not mutually exclusive (a government partnership can coexist with automation-based retrieval for states/document-types where no clean API exists). **Their exact per-state legal basis (formal API license vs. automated portal retrieval vs. RTI-style request) was not disclosed on any page found this pass** — flagged as unverified detail, not assumed.

---

## 5. Tech + company signals

| Signal | Detail |
|---|---|
| **Company** | John Salt Private Limited |
| **Founder/CEO** | Sanjay Mandava — 2x Y Combinator founder (prior: GoLorry), background as a proprietary trader/investment analyst at Knight Vinke (an activist hedge fund) and as a real-estate developer |
| **Funding** | ₹19.5 Cr (~$2.3M) pre-seed round — reported via multiple press mentions found on their own "In News" section |
| **Scale claim** | "50 Lakhs+ documents provided to 10 Lakhs+ people" (5M+ documents, 1M+ users) |
| **Clients** | "20+ clients" — NBFCs, developers, energy firms, large land aggregators; also claims Fortune 500 India companies as customers ("Trusted by Fortune 500 India Companies") |
| **HQ / hiring** | Hyderabad, Telangana — every open role listed is Hyderabad-based |
| **Open roles (engineering)** | Founding Backend Engineer, Founding Frontend Engineer, **Founding GIS Engineer**, Senior AI/ML Engineer, Web Automation Engineer, Founding Full-Stack Engineer (React Native + backend) — the GIS + AI/ML + Web Automation combination directly matches a document-retrieval-and-title-analysis product; "Founding" prefixes on multiple 2026 roles suggest these functions are still being built out, not mature |
| **Own AI model** | **"Terra Black"** — Landeed's own title-verification AI agent, with a T2 version. They published a self-run benchmark (Aug 2026) comparing Terra Black T2 against four frontier models — **Sonnet-5, Gemini-3.6, Opus-4.8, GPT-5.6** — on "100 real Indian title-verification matters" across "8 legal dimensions," claiming Terra Black T2 ranked #1 with a macro score of 0.891 (next: Sonnet-5 at 0.863) and a stricter "all-criteria-pass" count of 26/100 vs. 14/100 for the next-best model. **This is a self-published, self-run benchmark — not independently reproduced or audited by this research pass** — a real, notable technical claim, but one whose methodology (rubric design, matter selection, potential conflicts of interest in self-grading) was not independently verified. |

---

## 6. Marketing claims vs. observable reality

| Claim | Observed |
|---|---|
| "India's Fastest Online Document Search" (page `<title>`) | Consistent with the product's positioning, but no independently timed retrieval was performed this pass — **not verified end-to-end** (the app itself couldn't be walked to a result this pass, see §1) |
| "Documents in Days, Not Months" (Document Retrieval page) vs. "Minutes, Not Days" (AI Title Reports page) | These are **two different products with two different turnaround claims** presented on the same homepage flow without a clear up-front distinction — a real potential for user confusion between "get a raw document" (days) and "get an AI-analyzed report" (minutes), though this may be an intentional and reasonable product-tiering, not necessarily deceptive |
| "Trusted by Fortune 500 India Companies" | No specific named client logos were captured in this research pass to cross-check |
| Terra Black T2 "#1 of 5 systems" | Real, specific, methodologically-described benchmark exists — **more substantive and more falsifiable than a generic marketing claim**, a meaningfully higher bar than most AI-product marketing; still self-published |

**Unlike `homeplannner.com` last pass, no outright fake-progress-bar or misleading no-output pattern was found in this research** — Landeed's claims, while unverified in places, are not contradicted by anything directly observed this pass. This is a materially more credible competitor than the prior deep-dive subject.

Screenshots: `scratchpad/landeed/` (home, ai-title-reports, document-retrieval, document-fetch-api, careers, about, terra-black pages).

---

## 1b. Follow-up (W-97, 2026-09-08): live search app walked, per-state coverage independently quantified

The `web.landeed.com` SPA-timeout blocker from the prior pass was resolved by waiting on `domcontentloaded` instead of `networkidle` (the app holds persistent connections that never let `networkidle` fire). This reached real product content the marketing site didn't show:

**Real per-state document-type counts (badge counts shown in-app, independently observed, not company-claimed):** Andhra Pradesh 28, Telangana 6, Madhya Pradesh 3, Maharashtra/Karnataka/Tamil Nadu/Gujarat/Haryana/Delhi/West Bengal/Kerala/Rajasthan/Chandigarh/Goa/Odisha/Punjab/Pondicherry/Bihar/Uttar Pradesh 2 each, and **Chhattisgarh, Jharkhand, Uttarakhand, Himachal Pradesh, Assam, Manipur, Jammu & Kashmir, Arunachal Pradesh, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura, Andaman & Nicobar, Dadra & Nagar Haveli, Lakshadweep, and Ladakh all show 0** — no document product listed for these states/UTs at all. This directly quantifies and meaningfully qualifies the "23+ states" marketing claim: the state *appears in a list* but a large share of India's North-East and hill states/UTs have zero actual product depth.

**Andhra Pradesh's document list, opened directly:** the "28" badge undercounts the actual list — **~48 distinct offerings** were visible when the AP entry was opened, including document types (EC, Adangal, ROR-1B, Village Maps/FMB-LP, CERSAI Mortgage Report) **and a much larger tier of professional/consultation services** not mentioned anywhere on the marketing site: Legal Opinion, Physical Land Survey, Registered Will, Power of Attorney, Notary and Indemnity Bond, Tenant Background Verification, Property Valuation Report, Family Partition/Declaration Consultation, and more. Landeed's actual AP-market product is closer to a full legal/property-services marketplace than the "document search platform" framing on `www.landeed.com` suggests.

**A direct claim contradiction found:** the product app's own footer states verbatim — *"Landeed is not a government entity and is not affiliated with any government agency."* This sits in tension with the marketing site's Document Retrieval page claim of a **"Partnership with Government"** that "helps in improving the digital land records" (quoted in §4 above). Both statements are from Landeed's own properties; they are not easily reconciled as written — either "partnership" is being used loosely (informal cooperation, not a formal affiliation) or the two pages are inconsistent. **Corrects §4's earlier framing**, which took the "Partnership with Government" claim at face value without this counter-signal.

**New product surfaces observed in-app, not on the marketing site:** "Ask Terra" (a chat entry point, presumably surfacing the Terra Black model directly to end users), "Vault" (document storage), "Pulse" (market intelligence, matches marketing site), a map-click-based property-selection flow ("Click Anywhere around the map"), and a visible version number **v0.73.1** — a real product-maturity signal (pre-1.0, actively versioned).

**Acceptance status vs. W-97's stated criteria:** ✅ live search flow walked to real product content (state list → AP's full 48-item catalog, not a "sample report" in the AI-Title-Report sense, but a genuine reachable output, the deepest state's actual product surface); ✅ per-state document-count independently confirmed (18 states/UTs at exactly 2, 3 with more depth, 17 states/UTs at zero) — not company-claimed.

---

## 7. Synthesis vs. Ferrum

**What Landeed owns that Ferrum can't easily replicate:**
- **A claimed government relationship** for land-records access (see the caveat in §1b — this claim is in tension with the product app's own "not affiliated with any government agency" disclaimer, so its exact nature is unclear) — if genuine and durable in some form, this is a regulatory/relationship consideration, not a technical one, and not something Ferrum can build by writing better code.
- **Multi-year operating history and 5M+ documents delivered** — real production-scale exposure to the messiness of India's actual land-record variability across 23+ states, which is exactly the long tail `docs/PLOT_TRUTH_ENGINE_SPEC.md` flags as unverified/state-by-state uncertain for Ferrum today.
- **A self-benchmarked, purpose-built title-verification AI model (Terra Black)** — a real, specific technical asset, even if the benchmark is self-published.

**What Ferrum should consider adopting (pattern-level, not code/data — same discipline as prior research docs):**
- Landeed's **13-year vs. 30-year diligence-horizon framing** for title checks is a concrete, legally-meaningful distinction worth reflecting in Ferrum's own LandIntel/Transact copy once real title-diligence features exist.
- The **CERSAI cross-check** (central charge registry) is a specific, named, checkable data source Ferrum's own `PLOT_TRUTH_ENGINE_SPEC.md` source map does not yet include — worth adding to that map's next revision.
- Landeed's **explicit two-tier turnaround split** (raw document retrieval vs. AI-analyzed report) is a reasonable product-shape lesson: don't market a single "instant" number across two different-latency operations, the same discipline Ferrum's own `PLOT_TRUTH_ENGINE_SPEC.md` attribute classification (instant/request-time/unavailable) already encodes independently.

**Where Ferrum's deterministic + provenance model beats them, on what's observable:**
- **Landeed's AI Title Report is a black-box agent output** — "lawyer-ready report," "citations back to source documents" as a feature claim, but the underlying reasoning is an LLM agent (Terra Black), not a deterministic, independently-auditable engine. Ferrum's standing architecture (deterministic calculation engines, SUTRA as a routing/citation layer only, never the source of a number) is structurally different and more auditable by design, not just by marketing claim.
- **No public pricing, no self-serve product** — every Landeed product page terminates in "Book a demo." Ferrum's product is (or is intended to be) self-serve and transparent about what's live vs. roadmap on every page, a genuinely different go-to-market posture that's also a real product-trust differentiator.
- **Ferrum's honesty-labeling discipline (INDICATIVE/SAMPLE/VERIFIED, audited)** has no visible equivalent on any Landeed page reviewed — their claims are presented uniformly confidently (document counts, turnaround times, benchmark rankings) with no visible "this is provisional" signal anywhere, which is a real point of contrast, not a criticism of their product quality.

---

*Every fact above traces to a live page visited this session (screenshots on file, `scratchpad/landeed/`) or the page's own stated content — nothing is recalled from training-data knowledge of this company. Two explicit gaps: the live document-search app (`web.landeed.com`) was not walked to a sample output (SPA timeout), and per-state document-type depth was not independently quantified — both flagged, not glossed over.*
