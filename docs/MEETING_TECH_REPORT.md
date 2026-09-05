# Ferrum OS — Technical Brief

*Prepared for an external industry technical meeting. Every figure below is sourced directly from the codebase, its build output, or a live response from the deployed system as of the version noted in the footer — nothing is estimated or inferred. Where a fact could not be verified on disk, it is marked **UNKNOWN** rather than assumed.*

---

# 1. Executive Summary

Ferrum OS is an India-first, AI-native construction platform covering the full project lifecycle: land intelligence, design, structural checks, cost estimation, procurement, and project finance. It is delivered as a web application running on a global edge network (Cloudflare Workers), with a lightweight SQLite-compatible database (D1) at the edge for low-latency data access anywhere in India.

The platform's current development focus is the **Project Workspace** — a single-screen "cockpit" combining a 3D visual canvas, a conversational command interface, and structured data extraction, designed to let a user describe what they want ("add a floor," "set setback 3 metres") and see a compliant building model update live, rather than filling out forms.

All computed outputs (costs, rates, structural checks, feasibility scores) come from deterministic, testable calculation engines — not from a language model guessing a number. A conversational assistant layer exists to route requests to those engines and cite the source of any regulatory figure, never to invent one.

---

# 2. Product Scope + Live Feature Inventory

Live URL: `https://ferrumos-preview.shariefsatyala.workers.dev` (single source of truth: `docs/FLEET_SEATS.json`'s `deployment` block, RULE 47/W-64 — updated 2026-09-05 after the worker rename in `crane/rename-worker-privacy`; the prior `ferrum-os.shariefsatyala.workers.dev` URL now returns 404, verified directly, not assumed)

| Feature | Status | Where to see it |
|---|---|---|
| ULPIN (parcel ID) lookup with data-source labels | **Live** | `/products/landintel` |
| Project Workspace cockpit (10-product tab rail, 3D canvas, tools panel, data-extract panel) | **Live (route)** | `/project-workspace/cockpit` |
| Conversational assistant panel ("SUTRA") — text + voice input | **Live, explicitly labeled as a demo** | Visible in the cockpit; carries a "DEMO · INDICATIVE" badge |
| 3D visual canvas (three.js) | **Live**; multi-viewport claim **UNKNOWN** — not independently confirmed this pass | Cockpit |
| Guided option-chip flow (tap constrained choices instead of typing) | **Not yet live** | In development |
| Data-extract panel with dual measurement units (metric + local) | **Partially live** — panel exists; full dual-unit behavior not re-verified this pass | Cockpit |
| DXF export | **Live** | Cockpit export control |
| IFC (BIM) export | **Blocked** — a technical packaging issue currently prevents this format from working in the browser; tracked as an open item, not silently dropped | — |
| Save / Share artifacts | **Live, independently tested end-to-end**: save → 200 OK, share link generates and opens with no login required | `/project-workspace/projects` |
| Rename / delete artifacts | Exists in the API; **not independently re-tested this pass** | — |
| Per-product page previews (10 products) | **Re-snapshotted this pass: 7 of 10 now show a shared "stepped forecast" preview module (sample-data-driven) rather than each product's own dedicated tool** — a platform-wide version of a known regression (see below). 1 (CommunityBuild) shows its own dedicated tool; 1 (Transact) shows its own dedicated tool; 1 (BuildOS) honestly displays "Roadmap — not yet built." LandIntel additionally still surfaces its real ULPIN lookup tool alongside the shared module. | All `/products/*` pages |
| LandIntel/product-tool regression | **Known, tracked issue, in progress** — a prior redesign pass replaced several products' dedicated real tools (structural check, rate comparison, IRR/NPV modeler, test-fit calculator) with a shared generic forecast preview in the hero position. A fix for LandIntel specifically is queued as next priority (see §9); the same pattern now affects Structura, BOQ Pro, ProMarket, InvestFlow, DesignStudio, and ProcureHub | `/products/{structura,boq-pro,promarket,investflow,designstudio,procurehub}` |
| Sign-up / login | **Intentionally gated to preview mode** — no credential collection live yet (see §8) | `/signup`, `/login` |
| Satellite imagery overlay | **Not live** — licensing not yet purchased (see §6); a unified "one ground" design (shared live imagery base layer across all cockpit tabs and product previews) is planned but not yet built | — |

---

# 3. System Architecture

- **Edge delivery.** The application is a statically built site served through Cloudflare's global edge network, with a thin serverless function layer (a "Worker") handling all data operations — currently **60 distinct API routes**.
- **Database.** Cloudflare D1 (a managed, SQLite-compatible database) running at the edge. **14 schema migrations** have been applied to date.
- **Calculation engines.** Every user-facing number (rate bands, IRR/NPV, structural checks, feasibility scoring, file export geometry) is produced by a dedicated, independently testable calculation module — not by the conversational layer.
- **Conversational / agent layer.** A single assistant panel routes typed or spoken requests to the deterministic engines above and attaches a citation to any regulatory figure it references. It does not calculate numbers itself. **A formal multi-layer agent architecture is referenced in internal planning but not yet documented on disk — status UNKNOWN beyond the single working panel described above.**
- **Geospatial.** Interactive mapping via Leaflet/OpenStreetMap is live for parcel lookup. A satellite-imagery data source (EOX/Sentinel-2) has been built as a code-level integration but is deliberately not switched on pending a commercial license (see §6).
- **Export pipeline.** DXF (2D CAD) export is live. IFC (industry BIM standard) export code exists but currently fails to package correctly for browser delivery — a known, tracked blocker, not a silent gap.
- **Layout system.** The cockpit interface adapts its layout by screen size, collapsing side panels into drawers, bottom sheets, or swipeable cards below tablet width, per a documented responsive standard (see §7).

---

# 4. Tech Stack

| Component | Technology | Why |
|---|---|---|
| Web framework | Next.js 14 (static export) | Pre-built, fast-loading pages; no server render step needed per request |
| Hosting / edge compute | Cloudflare Workers | Global low-latency edge network; serverless, scales automatically |
| UI library | React 18 | Industry-standard component model |
| Language | TypeScript 5 | Compile-time type safety across a large, multi-contributor codebase |
| Database | Cloudflare D1 (SQLite-compatible) | Colocated with edge compute, low read/write latency, no separate DB hosting |
| 3D rendering | three.js | Mature, widely-used WebGL library for the interactive design canvas |
| BIM export | web-ifc | Open-source IFC (industry BIM format) toolkit |
| Mapping | Leaflet + OpenStreetMap | Open-source, no per-request licensing cost for base map tiles |
| Voice input | Browser-native Web Speech API | Zero external service dependency; degrades gracefully where unsupported |
| Testing | Vitest (unit) + Playwright (end-to-end, live-site verification) | Automated correctness checks plus real-browser verification against the live deployment |
| Deployment tooling | Wrangler (Cloudflare's CLI) | Official deployment/migration tool for the Workers + D1 platform |
| Package management | pnpm, monorepo workspace | Efficient dependency management across multiple internal packages |
| Development process | Parallel git worktrees (**85 active at time of writing, re-counted this pass**) across a multi-agent build team, governed by a written pull-queue and drain-until-blocked operating discipline | Enables many workstreams to progress concurrently without blocking each other; the pull-queue prevents idle capacity between tasks |
| Fleet health monitoring | An automated idle-detection harness flags a silently-stalled workstream and auto-dispatches its next queued task | Prevents silent stalls in a 24/7 multi-agent operation from going unnoticed |

---

# 5. Implementation Status per Module

Percentages are a count of completed vs. total tracked work items per module (a workload-count proxy, not a weighted engineering estimate) — computed from the internal task ledger (270 total tracked items, 169 marked complete — **62.6% platform-wide**).

| Module | Status | % Complete | Note |
|---|---|---|---|
| Cockpit UI | In active development | ~17% of currently-tracked cockpit work items | Core shell live; conversational-primary flow and guided options in progress |
| Conversational assistant | Demo stage | UNKNOWN precise % | Working demo panel; not yet grounded in a full knowledge base |
| Knowledge base / regulatory data | Early | UNKNOWN % | One real rate-calculation engine live; structured code/regulation corpus not yet built |
| Compliance engine | Not yet started as a standalone module | 0% or UNKNOWN | Referenced as a dependency by three in-progress items; no landed implementation found |
| Geospatial | Partial | — | Interactive parcel map live; satellite imagery licensed-but-inactive |
| File export | Partial | — | DXF live; IFC blocked (see §3) |
| Authentication | Backend complete, frontend deliberately hidden | Backend 100%; frontend 0% by design | See §8 |

---

# 6. Data Strategy + Licensing

| Data source | Status | Cost / License note |
|---|---|---|
| Parcel/ULPIN sample data | Indicative/sample only, clearly labeled throughout the product | No license cost — internally authored sample set; not yet connected to a live government registry |
| Government reference rate data | Indicative sample set | No cost currently; real feed integration not yet built |
| EOX Sentinel-2 satellite imagery (s2maps.eu) | **Built, not switched on** | Non-commercial license (CC BY-NC-SA 4.0) does not cover this commercial product; EOX's paid "Commercial Attribution-RestrictedUse 1.1" license has **not been purchased**. The code path always returns no data rather than fetching under a license the company doesn't hold. |
| Vendor/material price APIs | **Not yet integrated** | No named vendor or cost on record — open item |
| Regulatory code corpus (building codes, standards) | Not yet built as a structured, versioned dataset | — |

**Standing policy:** no data point is ever presented as verified/authoritative when it is actually a sample or placeholder — every such figure carries a visible "Indicative," "Sample," or "Roadmap" label. This is an enforced internal engineering standard (see §8), demonstrated repeatedly in the product surface (e.g. product pages that explicitly say a feature "isn't built yet" rather than showing a fabricated preview).

---

# 7. Performance + QA

**Bundle size (cockpit route), from the production build output — the authoritative figure:**
- Cockpit route first-load JavaScript: **104 KB** — well within the internal budget ceiling of 600 KB for this route. *(An earlier same-day browser-based measurement of ~975 KB was investigated and found to be a test-script artifact — it double-counted shared code across repeated page loads rather than measuring one real first load. The build tool's own number above is authoritative.)*

**Responsive layout check:** zero horizontal-overflow at all 5 tested screen widths (375 / 768 / 1024 / 1366 / 1920 px) — **pass**.

**Rendering performance (internal lab measurements, not yet independently re-verified externally):**
- Reduced/software rendering profile: 60 FPS, 9 draw calls per frame
- Full GPU rendering profile: 60 FPS, 42 draw calls per frame

**Internal performance standards (targets, not all yet enforced automatically in CI):**
- Largest Contentful Paint ≤ 2.5s on a simulated 4G connection
- Cumulative Layout Shift ≤ 0.1
- Interaction latency ≤ 200ms
- Minimum 30 FPS on a 2022 mid-range Android device / 2018-era laptop; 60 FPS on modern desktop hardware
- *Automatic CI enforcement of these budgets is planned but not yet wired up — currently checked manually.*

**Automated test suite:** 15 test files covering core calculation engines and UI components. Two suites spot-verified this session by direct re-run: a numeric-display sanity suite (6/6 passing) and a 3D-file-export round-trip suite (6/6 passing, verified against real file-parsing, not a mock). Exact current total test count across all files: **UNKNOWN** without a fresh full run (prior session logs cite varying totals — 103, 109, 115 — at different points as the suite grew).

**End-to-end product battery (8-step user-journey test against the live site), most recent run:**

| Step | Result |
|---|---|
| Save artifact | Pass |
| Saved artifact appears in list | Pass |
| Switch tabs | Pass |
| Modify the 3D model | Pass |
| Data-extract panel updates | **Fail** |
| Command bar executes an instruction | Pass |
| Export downloads | Pass |
| Share link opens without login | Pass |

7 of 8 steps currently pass on the live site; the data-extract auto-update step is a known, tracked issue.

---

# 8. Security, Auth & Compliance Posture

- **Authentication backend:** fully built — password hashing (PBKDF2 via WebCrypto), session management, email verification and password-reset flows, rate-limited endpoints.
- **Authentication frontend:** **deliberately hidden behind a "Preview Mode" gate** at present — a company decision, not a technical gap. Visitors currently explore the full product via a local, credential-free preview session rather than creating a real account. This is a temporary state pending a company-set public launch date; the backend is untouched and ready to be re-exposed at that time.
- **No-fabrication policy (an enforced internal engineering standard):** any figure shown to a user that is not backed by verified data must be visibly labeled as sample/indicative/roadmap. This is checked at build time and independently audited; it is demonstrated in practice throughout the product (e.g. a cost-estimation page that explicitly states which of its features are live vs. not yet built, rather than presenting a uniform confident front).
- **Data handling:** no real user financial or identity data is collected while the platform is in preview mode (see above).

---

# 9. Roadmap — 30 / 60 / 90 Days

*(Sequencing reflects current internal priority order; specific dates are not fixed on disk and are marked accordingly.)*

**Next (immediate priority):**
- Restore the real parcel-lookup tool to its primary position on the LandIntel page (a recent internal redesign inadvertently demoted it — already identified and queued for a fix), and apply the same fix across the other six affected product pages (see §2).
- Complete the command-first cockpit interface and constrained guided-option flow (replacing free-form sliders with tap-to-choose, ruleset-derived options) — a platform-wide "remove every manual slider, all input via the assistant" pass is queued directly behind this.
- Make the cockpit a full-screen, maximized workspace surface (canvas fills the viewport; chat, extract, and reference panels become collapsible overlays) with a working, visible fullscreen toggle.
- Consolidate the on-screen data-source/status indicators (currently rendered as several stacked boxes) into one compact status bar, consistently across the cockpit and every product preview.
- Build the unified "one ground" base layer — one real satellite/map imagery layer shared across all ten cockpit views and every product preview, so each view differs only in what's overlaid on top of the same real site data.
- Fix the data-extract panel's live-update behavior (the one open item in the 8-step battery above).
- Stand up automated performance-budget enforcement in the build pipeline.

**Following (~30–60 days, sequencing not date-locked on disk):**
- Resolve the IFC export packaging issue (browser-only rewrite in progress).
- Build the structured, versioned regulatory/building-code data module with per-fact source citations.
- Extend the conversational layer's vocabulary and parameter coverage.

**Roadmap / dependent on external decisions (~90 days+, not yet scheduled):**
- A retrieval-grounded language-model layer over the existing deterministic engines (explicitly gated on a future internal trial approval — not started).
- Vendor material-price API integrations (no vendor selected yet).
- Satellite imagery activation (gated on EOX license purchase).
- Real government ULPIN registry integration (replacing current sample data).
- Public re-launch of live sign-up/login (see §8).

---

# 10. Open Decisions + Asks

| # | Decision needed | Owner | Blocking |
|---|---|---|---|
| 1 | Approve budget for EOX satellite-imagery commercial license | Business | Satellite overlay feature |
| 2 | Approve/scope a trial for a language-model-assisted conversational layer | Business + Engineering | Grounded LLM roadmap item |
| 3 | Select and onboard a vendor material-pricing data provider | Business | Vendor price API integration |
| 4 | Set a public launch date to re-enable live sign-up | Business | Real account creation, current preview-mode gate |
| 5 | Confirm Cloudflare account secrets / production access provisioning for any new external integration | Engineering + IT | Any new third-party API wiring |

---

# 11. Risks + Mitigations

| Risk | Mitigation in place / proposed |
|---|---|
| Sample/placeholder data mistaken for verified data by a user | Enforced, audited labeling standard (INDICATIVE/ROADMAP/VERIFIED chips) on every relevant figure — not just a policy, checked in practice |
| IFC export currently non-functional | Tracked as an explicit blocker with a known root cause (a packaging/bundling issue) and a planned fix path, not silently dropped |
| Bundle-size/performance regression as features are added | A performance budget standard exists; automated CI enforcement is the near-term fix for the current manual-check gap |
| Satellite imagery used without proper license | Code-level safeguard: the integration returns no data at all rather than fetching under an unlicensed tier |
| Multi-team/multi-agent concurrent development causing conflicting changes | Structured branch-based workflow with a single integration point; one historical incident (a merged change briefly reverted) was caught and recovered, and stricter post-push verification was adopted afterward |
| Data-extract panel reliability | Known open defect, already scoped as next-priority work (§9) |

---

# 12. Appendix

## 12a. Glossary

| Term used internally | Plain-language meaning |
|---|---|
| Cockpit | The main Project Workspace screen combining 3D view, chat-style controls, and data panels |
| SUTRA | The name of the conversational assistant panel in the cockpit |
| ULPIN | India's Unique Land Parcel Identification Number — the parcel ID system the platform looks up |
| Deterministic engine | A calculation module that always produces the same, explainable output for the same input — as opposed to a language model's probabilistic output |
| INDICATIVE / ROADMAP / VERIFIED | Visible labels distinguishing sample data, planned-but-unbuilt features, and confirmed real data, respectively |
| D1 | Cloudflare's managed edge database product (SQLite-compatible) |
| Worker | Cloudflare's serverless compute product running the platform's backend logic |
| IFC / DXF | Industry-standard file formats for exchanging building/design data with other CAD or BIM software |
| Preview Mode | The current no-login exploration mode standing in for full account creation until public launch |
| Battery (internal term) | A scripted, repeatable end-to-end test sequence run against the live product |

## 12b. Condensed Work Ledger

| Milestone | Reference |
|---|---|
| Core authentication backend | Complete |
| Land-parcel lookup with data provenance labeling | Complete |
| Real-tool-in-hero redesign across 8 of 10 product pages | Superseded — a later redesign pass replaced most of these with a shared preview module (see §2); restoration queued |
| Idle-workstream auto-detection + auto-revive harness | Complete |
| Structured artifact save/share system | Complete (share independently re-verified this session) |
| Intent-routing API for the cockpit | Complete, independently verified end-to-end against the live system |
| 3D file export (IFC) engine — core logic | Complete; browser packaging still blocked |
| Numeric-display correctness safeguards (e.g. percentage sliders always summing to 100) | Complete, independently verified |
| Cockpit route becomes the default workspace view | Complete |
| Command-first UI + constrained guided options | In progress |
| Performance-budget CI enforcement | Not yet started |
| LandIntel primary-tool restoration | Queued, next priority |

*Full internal ledger (270 tracked work items, git-commit-level detail) available on request.*

---

**Confidential — internal + invited external technical audience only.**
Date: 2026-09-05 · Version: `9ddea512` (source snapshot) · Prepared by: ATLAS (technical audit function)
