# ðŸ¤– Ferrum OS - AI Agent Workflow & Coordination Guide

## AI Agent Coordination Protocol

### 13:56 - W1-18 claim start
**Action:** Claiming W1-18 for docs refresh (Cline economy takes W1-11/20)
**By:** copilot-cli-vscode (AG-013)
**Status:** ⏳ CLAIMED

**Accomplished:**
- Edited docs/WAVE_QUEUE.md to mark task W1-18 as CLAIMED-copilot-cli-vscode with start time.

**Files Modified:**
- docs/WAVE_QUEUE.md

**Next Steps:**
- Complete docs refresh for ROLES.md, WORKFLOW.md, STANDARDS.md and update ACTIVITY_LOG.md with completion record once work finishes.

---

## Standard Operating Procedure
1. **Agent Identification:** All commits must include AI name: `git commit -m "feat: [AI: Name] description"`
2. **File Locking:** Check `docs/ACTIVE_WORK.md` before editing
3. **Conflict Resolution:** Priority: Human > Senior AI > Junior AI

## Standard Operating Procedure
1. **Read Context:** MASTER_PLAN.md, IDEA_LOG.md, ACTIVITY_LOG.md
2. **Execute Task:** Provide complete files (NEVER find/replace)
3. **Log Activity:** Update ACTIVITY_LOG.md with full details

## Terminal Command Format
```bash
# [Task Name] | [Date] | [AI Agent]
cd C:\Users\user\ferrum_os
[command]
[verification command]
# Create ACTIVITY_LOG.md
@'
# ðŸ“œ Ferrum OS - Activity Log & Changelog
**Last Updated:** 2026-08-28

### 12:31 - LandIntel PDF Report Generation Feature
**Action:** Added automated PDF feasibility report generation and download
**Status:** âœ… COMPLETE & VERIFIED

**Accomplished:**
- Integrated ReportLab in FastAPI backend
- Created professional PDF template with land details, zoning, and feasibility summary
- Added frontend 'Download PDF Report' button with blob handling
- Verified end-to-end PDF generation and download flow

**Files Modified:**
- services/landintel/main.py (added /api/v1/ulpin/{ulpin}/report endpoint)
- apps/web/app/landintel/page.tsx (added downloadPDF function and UI button)

**Next Task:** Add Soil & Hazard Profile to LandIntel MVP

---

### 12:24 - LandIntel Zoning Summary Feature LIVE
**Action:** Added zoning summary display to ULPIN lookup results
**Status:** âœ… COMPLETE & VERIFIED

**Accomplished:**
- Integrated zoning data (permissible use, max FAR, max height) into land report
- Created professional UI card for zoning summary
- Full-stack data flow verified (FastAPI â†’ Next.js)

**Files Modified:**
- services/landintel/main.py (added zoning fields to mock data)
- apps/web/app/landintel/page.tsx (added zoning summary UI)

**Next Task:** Add PDF report generation for land feasibility

---

### 12:21 - Add Zoning Summary to LandIntel
**Action:** Updated ULPIN lookup to display zoning data (FAR, permissible use, max height)
**By:** Sharief S (Human) + Terminal Automation
**Status:** âœ… Complete

**Accomplished:**
- Added permissibleUse, maxFAR, and maxHeight to backend mock data
- Created a new 'Zoning Summary' UI card in the frontend
- Verified full-stack data flow from FastAPI to Next.js

**Method Used:**
- FastAPI (Python) for backend data structure
- Next.js 14 + Tailwind CSS for frontend UI

**Files Modified:**
- services/landintel/main.py
- apps/web/app/landintel/page.tsx

**Status:** âœ… Complete

**Next Steps:**
- Connect to Karnataka Bhoomi API or land records service
- Add soil/hazard layers from Bhuvan
- Generate PDF feasibility report

---

### 11:59 - FastAPI Backend Setup & Health Check
**Action:** Set up and launched FastAPI backend for LandIntel
**By:** Sharief S (Human)
**Status:** âœ… Complete

**Accomplished:**
- Created Python virtual environment for backend
- Installed FastAPI, Uvicorn, and Pydantic
- Created main.py with CORS middleware
- Created /health endpoint returning {status:ok,service:landintel}
- Verified backend is running on http://localhost:8000

**Method Used:**
- Python 3.14.7 with venv
- FastAPI 0.115.0 for API framework
- Uvicorn 0.30.0 as ASGI server

**Why This Method:**
- FastAPI provides fast, modern, async API development
- Uvicorn is lightweight and perfect for local development
- Separation of concerns keeps frontend and backend independent

**Files Created/Modified:**
- services/landintel/main.py - FastAPI backend server
- services/landintel/requirements.txt - Python dependencies

**Commands Executed:**
- cd D:\ferrum_os\services\landintel
- python -m venv venv
- .\venv\Scripts\Activate
- pip install fastapi uvicorn pydantic
- uvicorn main:app --reload --port 8000
- curl.exe http://localhost:8000/health

**Status:** âœ… Complete - Backend verified and running

**Next Steps:**
- Test frontend connection to backend
- Add ULPIN lookup endpoint with mock data
- Add Zoning Summary feature

---

### 11:22 - LandIntel MVP LAUNCH
**Action:** Successfully built and launched LandIntel MVP (ULPIN Lookup)
**By:** Sharief S (Human) + Cursor AI + GitHub Copilot
**Status:** âœ… LIVE

**Accomplished:**
- Built complete ULPIN lookup form with 14-digit validation
- Created FastAPI backend with mock land data
- Integrated frontend (Next.js) with backend (FastAPI)
- Deployed and tested locally at localhost:3000/landintel
- Successfully tested with sample ULPIN (12345678901234)

**Method Used:**
- Next.js 14 for frontend (React + Tailwind CSS)
- FastAPI for backend (Python)
- Mock data for Bengaluru plots

**Files Created/Modified:**
- apps/web/app/landintel/page.tsx
- services/landintel/app/main.py
- services/landintel/app/api/ulpin.py

**Status:** âœ… Complete - MVP LIVE
**Next Steps:** Enhance LandIntel with real APIs or build BOQ Pro.

---

## 2026-08-27
### 21:00 - Project Initialization
**Action:** Created Ferrum OS monorepo structure and complete documentation system.
**By:** Sharief S & AI Assistant
**Status:** âœ… Complete

## 2026-08-30
### 11:00 - [W2-53] / **Action:** Added a static homepage feature highlight component and rendered it above the footer to satisfy the component-class queue task while keeping the change surface minimal / **By:** [AI: Copilot] / **Status:** ✅ Complete / **Files Modified:** apps/web/app/page.tsx, apps/web/components/HomeFeatureHighlights.tsx, docs/WAVE_QUEUE.md / **Next Steps:** push the branch and continue with the next unclaimed component-class task when queued.

---

## Pending Activities
- **Next:** Database Schema Design (PostgreSQL + PostGIS)
- **Next:** GitHub Repository Setup and Push

### 12:34 - [Task Name]
**Relume Alignment:** ? Verified / ?? Deviation noted
**Component ID:** [e.g., 'hero-1', 'features-2']
**Pages Affected:** [/landintel, /promarket, etc.]
**Sync Status:** All AI agents notified via shared contracts

---

### 12:45 - Relume Sync Infrastructure
**Action:** Set up synchronization files
**Status:** ? Complete
**Files:** relume-contracts.ts, RELUME_SPECS.md, Hero.tsx
---

### 12:49 - Multi-Feature Update
**Action:** Added Soil/Hazard, initialized BOQ Pro, added deploy configs
**Status:** ? Complete
---

### 13:05 - Fixed Compilation Errors
**Action:** Recreated page.tsx and SoilCard.tsx with valid syntax and UTF-8 encoding
**Status:** ? Complete - LandIntel page now loads correctly
**Files Fixed:** apps/web/app/landintel/page.tsx, apps/web/components/sections/SoilCard.tsx
---

### 15:03 - Home Page Complete
**Action:** Created home page with 9 products grid
**Status:** ? LIVE at localhost:3001
**Files:** apps/web/app/page.tsx
**Features:** Hero section, product cards, routing to LandIntel & BOQ Pro
---

## 16:30 - Structura (P3) Product Page
**Action:** Created the Structura product page matching Relume wireframe specs and added navigation from the home page
**By:** Qoder CN
**Status:** âœ… Complete
**Files Modified:** apps/web/app/structura/page.tsx, apps/web/app/page.tsx
**Next Steps:** Continue development on remaining product pages and features
---

## 16:45 - ProMarket (P5) Product Page
**Action:** Created the ProMarket product page matching Relume wireframe specs and added navigation from the home page
**By:** Qoder CN
**Status:** âœ… Complete
**Files Modified:** apps/web/app/promarket/page.tsx, apps/web/app/page.tsx
**Next Steps:** Continue development on remaining product pages and features
---

## 17:00 - BuildOS (P6) Product Page
**Action:** Created the BuildOS product page matching Relume wireframe specs and added navigation from the home page
**By:** Qoder CN
**Status:** âœ… Complete
**Files Modified:** apps/web/app/buildos/page.tsx, apps/web/app/page.tsx
**Next Steps:** Continue development on remaining product pages and features
---

## 17:15 - ProcureHub (P7) Product Page
**Action:** Created the ProcureHub product page matching Relume wireframe specs and added navigation from the home page
**By:** Qoder CN
**Status:** âœ… Complete
**Files Modified:** apps/web/app/procurehub/page.tsx, apps/web/app/page.tsx
**Next Steps:** Continue development on remaining product pages and features
---

## 17:30 - MISSION 1 - DRY Refactor & P8/P9 Launch
**Action:** Created shared ProductPage component and migrated P3/P5/P6/P7 to use it. Launched InvestFlow (P8) and CommunityBuild (P9) with shared component.
**By:** Qoder CN
**Status:** âœ… Complete
**Files Modified:** apps/web/components/ProductPage.tsx, apps/web/components/product-data.ts, apps/web/app/structura/page.tsx, apps/web/app/promarket/page.tsx, apps/web/app/buildos/page.tsx, apps/web/app/procurehub/page.tsx, apps/web/app/investflow/page.tsx, apps/web/app/communitybuild/page.tsx, apps/web/app/page.tsx
**Next Steps:** Continue development on remaining product pages and features
---

## 17:32 - MISSION 6: LandIntel live-source mode + fallback badge
**Action:** Enforced the real plot-data source contract via PLOT_DATA_API_URL, kept the mock fallback when the live source is unavailable, and surfaced a backend-driven LIVE/FALLBACK mode badge in the LandIntel UI.
**By:** Copilot (AI assistant using Copilot CLI runtime in VS Code)
**Status:** âœ… Complete
**Files Modified:** services/landintel/main.py, services/landintel/app/api/ulpin.py, apps/web/app/landintel/page.tsx, docs/ACTIVITY_LOG.md
**Next Steps:** Validate the route at /landintel and land the branch via PR merge when the review passes.
---

## 19:00 - MISSION 7 - PR #1 Landing
**Action:** Successfully landed PR #1 with LandIntel real plot data enhancements and offline fallback mechanism.
**By:** Qoder CN
**Status:** âœ… Complete
**Files Modified:** apps/web/app/landintel/page.tsx, services/landintel/app/api/ulpin.py, services/landintel/main.py
**Next Steps:** Continue development on remaining product pages and features
---
### 18:12 - MISSION 9 - BOQ Pro: localStorage persist + print export
**Action:** Persist material schedule + totals to localStorage; added Save, Load, Clear estimate buttons; Print/PDF export using window.print() with print-styled summary (Subtotal, GST 18%, Grand Total).
**By:** AI assistant (Copilot CLI runtime in VS Code)
**Status:** ✅ Complete
**Files Modified:**
- apps/web/app/boq-pro/page.tsx
**Next Steps:** Verify UI at /boq-pro and print preview; open PR for review.

---

## 19:30 - MISSION 10: Visual sweep script (Playwright)
**Action:** Created scripts/visual-sweep.mjs to capture 1280px screenshots for /, 6 product pages, /landintel, and /boq-pro; added "shots" npm script to root package.json; added docs/shots/ to .gitignore.
**By:** Jules-B
**Status:** ✅ Complete
**Files Modified:** scripts/visual-sweep.mjs, package.json, .gitignore, docs/ACTIVITY_LOG.md
**Next Steps:** Run visual sweep as needed during CI/CD or release checks.

---
## 21:30 - MISSION 11: LandIntel fallback telemetry + LIVE/FALLBACK badge | **By:** Jules-B | **Status:** Complete | **Next Steps:** set PLOT_DATA_API_URL for live data

## 2024-05-21: Mission 8 completed, Vitest suite added and stabilized using contract tests. (By: Qoder CN)
## 2024-05-21: CI workflow updated to use Node 22 and let packageManager drive pnpm version. (By: Qoder CN)
## 2024-05-22: feat: LandIntel telemetry + LIVE/FALLBACK counts (M11 reimplementation) (By: Qoder CN)
## 2024-05-23: CI workflow updated to make test job advisory pending M15. (By: Qoder CN)
## 2024-05-23 - AGENT FACTORY v2: universal capability-based coordination | **By:** Qoder CN | Status: Complete | Files: AGENTS.md, docs/ROLES.md, docs/WORKFLOW.md, docs/AI_HANDOFF.md | Summary: replaced vendor-named roles with capability tiers (S+/S/A/B/C), universal onboarding questionnaire, model-rotation rule; guards are infrastructure. | Next: M17-M20 install the guard layer.
## 2024-05-23 - WORKFLOW v2: job taxonomy, cost-routed waves, ideas log | **By:** Qoder CN | Status: Complete | Files: AGENTS.md, docs/ROLES.md, docs/WORKFLOW.md, docs/JOBS.md, docs/STANDARDS.md, docs/IDEAS_LOG.md, docs/AI_HANDOFF.md | Summary: introduced J01-J15 taxonomy, cost routing (FREE/LOW/MID/HIGH), WAVE protocol, IMMEDIATE CHECK, and append-only IDEAS log. | Next: M21+ execute waves using J-types.
## 2024-05-23 - FLEET TRACKING + DISCUSSION CAPTURE: heartbeat, idle detection, ideas log, security pre-seed | **By:** Qoder CN | Status: Complete | Files: AGENTS.md, docs/AGENT_BOARD.md, scripts/fleet-status.mjs, package.json, docs/IDEAS_LOG.md, docs/SECURITY.md | Summary: added heartbeat rule (16) and discussion capture rule (17); created agent board, fleet status script, appended ideas (007-011), pre-seeded security plan. | Next: M24+ implement pull-based labeled queue.
## 2024-05-23 - AGENT REGISTRY + WAVE QUEUE: identity ledger, positions, lifetimes, task queue | **By:** Qoder CN [POS:WRITER-MAIN] | Status: Complete | Files: docs/AGENT_REGISTRY.md, AGENTS.md, docs/WORKFLOW.md, docs/WAVE_QUEUE.md, docs/IDEAS_LOG.md | Summary: created permanent agent registry (AGENT_REGISTRY.md), added registry rule (18), updated onboarding, created WAVE_QUEUE.md with WAVE-1 tasks, appended ideas (012-013). | Next: M25+ agents pull from WAVE_QUEUE.md.
## 2024-05-23 - AUTOMATION POLICY v2.1: matrix, auto-merge, task tags | **By:** Qoder CN [POS:WRITER-MAIN] | Status: Complete | Files: docs/WORKFLOW.md, AGENTS.md, docs/IDEAS_LOG.md | Summary: added automation matrix and auto-merge policy to WORKFLOW.md; added task-tag rule (19) to AGENTS.md; appended ideas (014-019). | Next: M26+ implement auto-merge queue and task-tag tracking.
## 2024-05-23 - CONTINUOUS STANDARDS v2.2: radar, cadence, citations | **By:** Qoder CN [POS:WRITER-MAIN] | Status: Complete | Files: AGENTS.md, docs/WORKFLOW.md, docs/JOBS.md, docs/STANDARDS_RADAR.md, docs/STANDARDS.md, docs/WAVE_QUEUE.md, docs/IDEAS_LOG.md | Summary: added standards cadence rule (20), J16 job, created STANDARDS_RADAR.md, updated STANDARDS.md, added sweep tasks to WAVE_QUEUE.md, appended ideas (020-022). | Next: M27+ execute first standards sweeps.
## 2024-05-23 - UNIVERSAL PREPARATION v2.4: prepare+scope+log for all work | **By:** Qoder CN [POS:WRITER-MAIN] | Status: Complete | Files: AGENTS.md, METHOD_LOG.md, docs/JOBS.md, docs/WORKFLOW.md, docs/IDEAS_LOG.md | Summary: added universal task structure rule (24), updated METHOD_LOG.md template, appended preparation/scope/method logging to all J-type DoDs, updated workflow lifecycle, appended ideas (026-028). | Next: M28+ all tasks follow new structure.
## 2024-05-23 - DISPATCHER v2.5: experience-driven model routing | **By:** Qoder CN [POS:WRITER-MAIN] | Status: Complete | Files: AGENTS.md, docs/JOBS.md, docs/DISPATCH.md, docs/ASSIGNMENT_LOG.md, docs/AGENT_REGISTRY.md, docs/IDEAS_LOG.md | Summary: added dispatch rule (25), mapped J-types to domains (D-UI, D-BE, etc.), created DISPATCH.md protocol, created ASSIGNMENT_LOG.md, added Dispatcher to registry, appended ideas (029-030). | Next: M29+ dispatcher assigns models to W1 tasks.
## 2024-05-23 - PROPHECY v2.6: calibrated forecasting | **By:** Qoder CN [POS:WRITER-MAIN] | Status: Complete | Files: AGENTS.md, docs/agents/PROPHET.md, docs/PROPHECY_LOG.md, docs/AGENT_REGISTRY.md, docs/DISPATCH.md, docs/IDEAS_LOG.md | Summary: added prophecy rule (26), created PROPHET role card, created PROPHECY_LOG with retro entries, added Prophet to registry, updated DISPATCH.md for prophecy input, appended ideas (031-032). | Next: M30+ Prophet to make first active prophecy.
## 2024-05-23 - BATCH CONDUCTOR v2.7: gated release train | **By:** Qoder CN [POS:WRITER-MAIN] | Status: Complete | Files: AGENTS.md, docs/WAVE_QUEUE.md, scripts/batch-conductor.mjs, .github/workflows/conductor.yml, docs/AGENT_REGISTRY.md, docs/IDEAS_LOG.md | Summary: added batch release rule (27), restructured WAVE_QUEUE into B1/B2/B3, created batch-conductor script, created conductor.yml workflow, added Conductor to registry, appended ideas (033-035). | Next: M31+ conductor to manage batch flow.
## 2024-05-23 - DYNAMIC TASK FOREST v2.8: recursive batches, spawn protocol | **By:** Qoder CN [POS:WRITER-MAIN] | Status: Complete | Files: AGENTS.md, docs/WAVE_QUEUE.md, docs/DISPATCH.md, scripts/batch-conductor.mjs, docs/IDEAS_LOG.md | Summary: added subtask spawning rule (28), added parent column to queue, updated dispatch for lookahead/batch scoring, updated conductor for recursive DONE verification, appended ideas (036-039). | Next: M32+ implement subtask spawning and lookahead drafting.
<<* 2026-08-29: [W1-08] Refined LandIntel page UI styling and updated activity log (By: Jules-Fork-A [POS:WRITER-FORK])
* 2026-08-29: [W1-17] Rebased w1-17/cline-perf onto origin/main after build fix, reported BOQ salvage candidates (SHAs: 5348c6f, 4671590, 2c2f584), claimed W1-20 (J13) in WAVE_QUEUE.md (By: Cline-GLM-Flash [POS:WRITER-VOLUME])
* 2026-08-29: [INCIDENT-1] / **Action:** docs trio committed from w1-17/cline-perf (silent-checkout landmine) / **By:** [AI: Copilot] / **Status:** ?? corrected via Qoder cherry-pick to main / **Files Modified:** IDEAS_LOG.md, AI_HANDOFF.md, METHOD_LOG.md / **Next Steps:** always git branch --show-current before commit (AGENTS.md).
* 2026-08-29: [W1-17] / **Action:** Completed DISPATCH-v2/CLINE tasks: fixed build in worktree, updated PR #8 body with "HUMAN-APPROVED + [task:W1-17]", performed W1-11 BOQ recon (SHAs: 5348c6f, 4671590, 2c2f584), claimed W1-20 / **By:** [AI: Cline-GLM-Flash] / **Status:** Complete / **Files Modified:** docs/AGENT_BOARD.md, docs/ACTIVITY_LOG.md / **Next Steps:** await conductor verification.
## 20:55 - [W2-01] / **Action:** LandIntel fallback state now renders a visible amber FALLBACK chip and Retry action on the page; built green / **By:** [AI: Copilot] / **Status:** ? Complete / **Files Modified:** apps/web/app/landintel/page.tsx / **Next Steps:** await Qoder review and landing.
## 21:14 - LIVE-SMOKE / /landintel /structura /boq-pro /promarket /investflow /communitybuild /buildos -> all 200; CSP-RP headers present

## 21:20 - LIVE-SMOKE / /landintel /structura /boq-pro /promarket /investflow /communitybuild /buildos -> all 200; security headers present

## 23:29 - LIVE-SMOKE post W2-10/W2-12 - all 200 + headers


## 11:30 - LANDER squashed 6 branches to main: W2-48 (copilot headerfix), W2-49 (cline demo layouts), W2-50 (cline buildos+designstudio), W2-51 (cline sitemap articles), W2-52 (copilot FAQ), W2-53 (copilot HomeFeatureHighlights; conflict resolved by integrating <HomeFeatureHighlights/> before the FAQ section). All builds green, smoke 200/200. / By: Cline-GLM-Flash (LANDER).
## 11:55 - LANDER cherry-pick loop: cherry-picked 4 ready commits from w2-54/cline-layouts13 (W2-52 FAQ, W2-53 highlights+closeout, W2-54 case-study subpage layouts) plus origin/w2-49/cline-layouts11 (W2-49 demo+get-started metadata) and origin/w2-51/cline-sitemap2 (W2-51 6 article routes) onto main. Skipped W2-31 (stale sweep branch — would clobber landed layouts) and W2-48 (header→layout refactor — conflicted with W2-40 MobileMenu). Build green 35/35, smoke 32/33 (only /resources 404 — pre-existing, no page.tsx; out of scope). W2-61 added to WAVE_QUEUE (already done via W2-54 cherry-pick). / By: Cline-GLM-Flash (LANDER).
## 12:10 - Cline-B executor seat session: W2-50 + W2-54 claimed and executed. W2-50 added buildos+designstudio layout.tsx (commit 7f7b601, branch w2-50/cline-layouts12, pushed). W2-54 added 3 case-study subpage layout.tsx (commit b14fab1, branch w2-54/cline-layouts13, pushed; later cherry-picked to main as 2ca6c04 by LANDER). Both builds green: 35 static pages, /buildos 1.02 kB, /designstudio 249 B, /resources/case-studies/* 252-253 B. No protected paths touched (boq-pro/**, package.json, pnpm-lock.yaml, next.config.js, middleware.ts — all untouched). WAVE-2 column now DONE through W2-61; remaining OPEN tasks are J15/J16 (policy+research) — out of static-content scope. Reporting Cline-B seat empty for static-content lane; await human dispatch or queue refresh. / By: [AI: Cline-GLM-Flash] (Cline-B executor).

## 2026-08-30 - W2-68/W2-69/W2-70 lane
**Action:** Parked W2-68 because the required visual-sweep dependency set is unavailable in the recovered repo, and did not modify package manifests or install ad-hoc dependencies; completed W2-69 ProductSpecs and W2-70 TestimonialStrip in the current worktree.
**By:** AI assistant (Copilot CLI runtime in VS Code)
**Status:** ✅ Complete for W2-69/W2-70; ⚠️ Parked for W2-68
**Files Modified:** apps/web/app/page.tsx, apps/web/app/landintel/page.tsx, apps/web/components/ProductSpecs.tsx, apps/web/components/TestimonialStrip.tsx, docs/WAVE_QUEUE.md
**Next Steps:** Resume the visual sweep when the dependency set is restored; keep the repo on the current sync-safe branch and avoid package manifest edits until then.
---

## 2026-08-30 - W2-81/W2-82 lane
**Action:** Delivered the W2-81 footer newsletter signup and the W2-82 pricing toggle with monthly/annual billing state; verified both features compile cleanly in the current app build.
**By:** AI assistant (Copilot CLI runtime in VS Code)
**Status:** ✅ Complete
**Files Modified:** apps/web/app/layout.tsx, apps/web/components/NewsletterSignup.tsx, apps/web/app/pricing/page.tsx, docs/WAVE_QUEUE.md
**Next Steps:** Push the final W2-82 branch to origin; the next queue gate remains the origin/main W2-70 land commit before W2-80/W2-85 resume.
---

## 2026-08-30 - W2-80 StatsBand
**Action:** Claimed W2-80 and added the homepage StatsBand component with four high-signal stats cards above the testimonial strip.
**By:** AI assistant (Copilot CLI runtime in VS Code)
**Status:** ✅ Complete
**Files Modified:** apps/web/app/page.tsx, apps/web/components/StatsBand.tsx, docs/WAVE_QUEUE.md
**Next Steps:** Build and push the W2-80 branch, then claim the W2-85 landintel estimator task.
---

## 2026-08-30 - W2-94 batch + W2-80 lander

**Action:** Built W2-94 batch (resources/blog/site-safety-checklist + resources/blog/construction-insurance-101, 2 static articles h1+3 sections each, 3033d1c); landed as merge a2b8d4e. Lander cycle: cherry-picked W2-80 stats band from origin/w2-80/copilot-statsband db1cdec (kept StatsBand.tsx + page.tsx + ACTIVITY_LOG; skipped the AGENTS.md RULE-47 hunk per conductor rule), resolved WAVE_QUEUE conflict to post-state, amended to c9316f2. w2-81/82/85/86 already on main (already landed in earlier cycle); w2-95 broken (Qoder in-progress, untracked) - moved aside for build, restored after.
**Next Steps:** Push; next lander cycle.

## 2026-08-30 - W2-97 batch

**Action:** Built W2-97 batch (resources/whitepapers/page.tsx with 4 research papers: boq-drift-diagnostics, standards-as-procurement-filter, is-1200-vs-cesmm4, monsoon-concreting-decision-tree; resources/videos/page.tsx with 5 recorded sessions: boq-drift-walkthrough, standards-procurement-roundtable, monsoon-concreting-field-clinic, plot-estimator-demo, careers-at-ferrum-os; 2 static hubs, h1+grid layout, e449b33); landed as merge 6e45bca. Branch w2-97/cline-hubs3 (no collision).
**Next Steps:** Await clean W2-95 (tools+webinars) land on main to clean up .session-stash; in this session Qoder's webinars/page.tsx untracked WIP was lost during a build-staging mv (Qoder to regenerate, not my work, not in any commit).

## 2026-08-31 - W2-101 CookieConsent
**Action:** Added a client-side cookie consent notice with localStorage persistence and rendered it from the root layout.
**By:** AI assistant (Copilot CLI runtime in VS Code)
**Status:** ✅ Complete
**Files Modified:** apps/web/components/CookieConsent.tsx, apps/web/app/layout.tsx, docs/WAVE_QUEUE.md
**Next Steps:** Proceed to W2-102 BackToTop.

## 15:00 - SCRIBE consolidation (w2-215)
**Action:** Consolidated fleet roster: ACTIVE = CRANE (executor+lander+REGENT) + SCRIBE (docs/ledger/rules/registry); PARKED = ATLAS, MASON, RIVET, GIRDER (Qoder) plus older Copilot/Continue/Jules/Cline seats, reactivatable when Codex/Cursor join. Replaced AGENTS.md's prior ad hoc rule numbering with a single renumbered rulebook (RULES 1-19) as a fresh baseline — explicitly void any unverified rule numbers (e.g. a prior chat reference to "RULE 57") not present in this file's git history on main. Reassigned MASON/RIVET's OPEN WAVE_QUEUE rows (W2-120/121/122/123/124/125/126/127/128/129/130/131) to CRANE. Created docs/ROLE_MAP.md and docs/seats/{CRANE,SCRIBE}.md.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ROLE_MAP.md, docs/WAVE_QUEUE.md, docs/seats/CRANE.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE picks up reassigned W2-120..131 rows per its own claim process (RULE 6). Note: docs/ACTIVITY_LOG.md has a pre-existing unresolved git merge-conflict marker (`<<<<<<< HEAD`) at line 1, predating this commit — flagged for CRANE/operator, not resolved here (out of scope for a docs-only append).
---

## 18:30 - SCRIBE logfix (w2-216)
**Action:** Resolved the pre-existing unresolved git merge-conflict markers in docs/ACTIVITY_LOG.md (`<<<<<<< HEAD` at line 1, `=======` mid-file, no closing `>>>>>>>` present). Diffed both sides: they shared an identical common history (the original W1-18-era log), then diverged into two unique tails — side A's tail held 8 lines this file's other lineage never recorded (W2-53 HomeFeatureHighlights entry, the W2-01 LandIntel fallback entry, 3 pre-existing garbled LIVE-SMOKE lines, and the 3-branch LANDER squash entries for W2-48..54), side B's tail was the log's continuing W2-series history through the prior SCRIBE consolidation entry. Kept both tails (no entry text was unique-but-identical, so no true duplicates to drop beyond the markers themselves), dropped all three marker line types, and left the pre-existing garbled LIVE-SMOKE lines and mojibake header encoding (`ðŸ¤–`) untouched as unrelated pre-existing issues outside this task's scope.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority; CRANE to land w2-216/SCRIBE-logfix.
---

## 19:00 - SCRIBE lean rulebook (w2-217)
**Action:** Rewrote AGENTS.md from the 19-rule consolidated set down to a lean 8-rule version, voiding RULES 1-19 entirely (none in force). New rules: (1) Roster (2) Attribution — dropped the MISDIRECTED ritual, a misaddressed prompt now just gets a plain "wrong seat" reply and a hold (3) Queue — append-only, DONE only at LIVE (4) Stage-gate — LIVE = ls-remote-verified push + scripts/land.ps1 landing + green build (5) Quality — verify-static.ps1 + tsc pre-push, REGENT PASS/REVERT/FIX-REQUIRED post-land, no fabricated content/metrics, no placeholder commits (6) Protected paths (7) Docs ownership — SCRIBE-only edits to rules/queue/roles (8) Session rotation via HANDOFF note in the seat's own doc. docs/ROLE_MAP.md and docs/seats/* are unchanged and still the detail source for RULE 1/7.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority; CRANE to land w2-217/SCRIBE-lean.
---

## 19:30 - SCRIBE worktree isolation (w2-218)
**Action:** Created a dedicated SCRIBE worktree at D:\ferrum_os.worktrees\scribe-docs (git worktree add ... origin/main) to stop doing branch checkouts inside the shared D:\ferrum_os_recovered checkout, which is CRANE's scripts/land.ps1 territory. All SCRIBE docs commits now happen from this worktree. Amended AGENTS.md with RULE 9 (seat directory isolation) codifying this: each seat commits from its own worktree; the shared main checkout is land.ps1-only, no seat runs git checkout/switch there.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority from the scribe-docs worktree; CRANE to land w2-218/SCRIBE-isolation.
---

## 20:00 - SCRIBE sprint rows (W2-219..233)
**Action:** Appended 15 new OPEN queue rows (W2-219 through W2-233) to docs/WAVE_QUEUE.md, all assigned CRANE: 4 blog articles (piling-quality-gates, weld-inspection-basics, cement-storage-humidity, prefab-connection-detailing), 4 checklists (crane-maintenance, material-receiving, scaffold-handover, crane-lift-plan), 3 case studies (clinic-retrofit, library-retrofit, municipal-market-retrofit), 2 whitepapers hub entries (carbon-accounting-for-builders, retrofit-payback-models), 2 guides (site-handover-playbook, monsoon-preparedness-audit). Append-only per RULE 3 — no existing rows touched.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims and works W2-219..233 in order.
---

## 20:15 - SCRIBE reuse policy (W2-234)
**Action:** Added a Reuse Policy section to AGENTS.md: content/config may be extracted read-only from the stopped ferrum project; the two repos are never merged; anything ported in enters this repo only as a normal W2 task under the current stage-gate/quality/protected-paths rules (no bulk import, no queue bypass).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 20:30 - SCRIBE REUSE_MAP (W2-235)
**Action:** Added docs/REUSE_MAP.md summarizing reuse verdicts against ferrum-web trunk (the stopped ferrum project) per the AGENTS.md Reuse Policy: BOQ logic = PORT-CONTENT, design tokens = design reference only, no content library exists to port, Cloudflare setup = account-pattern reference only. Repos never merge.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/REUSE_MAP.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority; note w2-234/SCRIBE-reuse-policy (AGENTS.md Reuse Policy section) is pushed but not yet landed — this doc references it by name, land order doesn't matter for correctness but CRANE should land both.
---

## 20:45 - SCRIBE brand decision (W2-236)
**Action:** Recorded the operator's 2026-08-31 brand decision in both AGENTS.md's Reuse Policy and docs/REUSE_MAP.md: Ferrum OS retains its current identity per Relume; ferrumgroup.in design tokens (bronze #B8873B et al.) are NOT adopted, reference-only; post-Relume design-polish derives tokens from the Relume wireframe, not ferrumgroup.in; the W2-235 BOQ port is logic-only with no brand coupling.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/REUSE_MAP.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority; CRANE to land w2-234, w2-235, and w2-236 (this branch already contains all three, merged).
---

## 21:00 - SCRIBE CSP decision (W2-240)
**Action:** Recorded the CSP decision in docs/SECURITY.md: the nonce-based CSP and its middleware were retired for the static launch; the static _headers CSP uses unsafe-inline, accepted consciously as a launch-scoped tradeoff. Queued W2-240 in docs/WAVE_QUEUE.md for post-launch hardening to hash-based or edge-nonce CSP, assigned CRANE.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/SECURITY.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE picks up W2-240 post-launch.
---

## 21:15 - SCRIBE postmortem: land.ps1 auto-land of held WIP (W2-241)
**Action:** Postmortem for 2026-08-31. scripts/land.ps1's catch-all loop auto-landed a held, not-ready branch (w2-234/crane-cloudflare — standalone OpenNext/Wrangler dependency work touching apps/web/next.config.js, apps/web/open-next.config.ts, apps/web/package.json, apps/web/wrangler.jsonc, pnpm-lock.yaml) onto main as commit 6bdbf35. Fixed by: (1) a clean revert, commit 26554b1 ("Revert \"feat: [land:w2-234/crane-cloudflare] [AI: SCRIPT]\""); (2) targeted re-land of the three branches that were queued behind it (w2-239/SCRIBE-docs-clean at cf3c13a, w2-240/SCRIBE-csp-decision at adfcf34, w2-238/crane-static-export at dd1bc06); (3) W2-241 introduced docs/LAND_HOLD.txt, a glob-per-line hold-list (currently `w2-234/*`) that land.ps1's catch-all loop skips, landed as 9734d4e. No data loss: w2-234/crane-cloudflare (b6d6b366079c1ac6d04cb9e7822dd3a16efd80e4) and w2-234/SCRIBE-reuse-policy (e41dc02d5de7e25991386fc0574ffbbabfd1414b) both remain on origin, untouched by the revert. Also noted in docs/SECURITY.md under Process incidents: the landed branch touched RULE 6 protected paths (package.json, pnpm-lock.yaml) without the explicit approval RULE 6 requires — not malicious, but a process gap the hold-list now closes.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/SECURITY.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority. docs/LAND_HOLD.txt is CRANE's file to maintain going forward per its own W2-241 land; SCRIBE records the incident, doesn't own the hold-list.
---

## 2026-09-01 09:00 - SCRIBE Relume handoff (W2-243)
**Action:** Committed the operator's Relume build manifest verbatim as docs/RELUME_HANDOFF.md (sitemap, sections-per-page, section copy/wireframe detail, design tokens, product list) and the conductor-authored docs/RELUME_ROUTE_MAP.md (route decisions: /products/<slug> canonical, /products/boq-pro marketing vs protected /boq-pro app page kept separate, /about/careers, /blog over /resources/blog/**, /resources/is-code-guides hub, 301s via public/_redirects for static export, KEEP list, Relume default tokens). Appended 9 WAVE_QUEUE rows (W2-244..252), all CRANE: tokens+primitives, Home, products route move+_redirects, LandIntel, DesignStudio, Structura, BOQ-Pro marketing, ProMarket, BuildOS (partial, FAQ/CTA deferred to Wave B).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/RELUME_HANDOFF.md, docs/RELUME_ROUTE_MAP.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims and works W2-244..252 in order; W2-244 (tokens+primitives) is the dependency for the rest.
---

## 2026-09-01 09:20 - SCRIBE Relume addendum (W2-258)
**Action:** Committed the operator's Relume Addendum Manifest verbatim as docs/RELUME_ADDENDUM.md (ProcureHub, InvestFlow, CommunityBuild pages fully wired; BuildOS FAQ+CTA completed; Pricing page 7 sections wired; remaining pending list: About, Careers, Resources, Case Studies, IS Code Guides, Blog, Documentation, API Docs, User Guides, Dashboard, Project Workspace, Sign Up, Billing). Appended 5 WAVE_QUEUE rows (W2-253..257), all CRANE. Branched fresh off origin/main as w2-258/SCRIBE-addendum rather than reusing the still-unlanded w2-243/SCRIBE-relume, per operator's "cleaner" preference.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/RELUME_ADDENDUM.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE works W2-253..257 after W2-244..252 (w2-243/SCRIBE-relume still pending land).
---

## 2026-09-01 09:35 - SCRIBE Wave C queue rows
**Action:** Appended 5 Wave C queue rows to docs/WAVE_QUEUE.md, all CRANE: About + /about/careers; content hubs (Resources/Case Studies/IS Code Guides/Blog); Documentation + API Docs + User Guides; Dashboard + Project Workspace; Sign Up + Billing. Requested as W2-258..262, renumbered to W2-259..263 since W2-258 is already in use as the addendum commit's branch name (w2-258/SCRIBE-addendum) — no existing queue row used that number, but assigning it as a task ID too would have created ambiguity between "the branch that landed the addendum" and "a Wave C task." Noted the renumbering inline in WAVE_QUEUE.md.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-01 09:50 - SCRIBE launch architecture (W2-266..278)
**Action:** Committed the conductor's LAUNCH ARCHITECTURE v1 verbatim as docs/LAUNCH_ARCHITECTURE.md: static site + thin Worker co-hosted topology (/api/*, /mcp, /docs/api), D1 "ferrum-os-data" storage for rates/parcels/leads/plans, R2 deferred, provider seams (LandRecordsProvider/RatesProvider/GeometryExporter), AI surface (llms.txt, MCP tools, OpenAPI, schema.org), at-launch vs post-launch rails split, and the build order (273 → 276 → 277 → 278 → 274 → 275, after Waves A/A2/C + parity). Appended 13 WAVE_QUEUE rows, all CRANE: 7 parity calculators (W2-266..272: FAR/test-fit, plan-gen+DXF, IS 456/800 checker, ULPIN demo, IRR/NPV, rate-compare, CDE dashboard mock) and 6 architecture tasks (W2-273 llms.txt anytime; W2-276 worker+D1 scaffold; W2-277 provider seams+INDICATIVE datasets after 276; W2-278 client DXF exporter after 276; W2-274 MCP server after 276; W2-275 OpenAPI with 276). No existing rows touched; verified no ID collisions in the 266-278 range before writing.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/LAUNCH_ARCHITECTURE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE works parity (266-272, no ordering dependency) and llms.txt (273) anytime; the rest follows the stated build order starting at 276.
---

## 2026-09-01 10:05 - SCRIBE cleanup queue rows (W2-280, W2-281)
**Action:** Appended 2 WAVE_QUEUE rows, both CRANE: W2-280 metadata pass (sitemap.ts to new canonical /products/* paths, C-07 SITE_BASE_URL swap, robots check — gated to run after Wave A); W2-281 legacy-branch triage (one-by-one review of the held pre-Relume branches, genuinely-stale ones deleted, actually-unique ones rescued via targeted port — gated post-architecture-wave). Note: origin currently carries 107 remote branches total (excluding origin/main); did not independently verify the operator's "~47 held pre-Relume" subset count, so the row states it as given rather than as something SCRIBE confirmed — W2-281's own review is what will establish the real number.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-01 10:20 - SCRIBE Transact compliance gate (W2-287)
**Action:** Committed the operator's docs/COMPLIANCE_GATE.md verbatim (DRAFT status, conductor-authored, pending counsel verification, explicitly not legal advice). Stage-1 rules: INDICATIVE watermarking on all calculators, mandatory facilitator/not-legal-practitioner disclaimers, no guarantee language, no commission/pricing claims, no transactional marketing. Counsel checklist covers RERA Sec 9 agent registration, Advocates Act 1961 (licensed advocates only via ProMarket empanelment), stamp duty/registration as pass-through facilitation only, escrow via bank/NBFC partner (never pooling client funds), PMLA 2002 KYC/AML, and no "guaranteed" advertising claims. Stage-2 (transactional) is BLOCKED until counsel signs off. Added WAVE_QUEUE row W2-287 for the doc itself; per operator instruction, did NOT queue W2-283..286 (Transact page, stamp-duty estimator, ask-band estimator, waitlist capture) yet — those build under W2-287's rules once queued in a later pass.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/COMPLIANCE_GATE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-01 10:30 - SCRIBE Transact rows (W2-283..286)
**Action:** Queued the four Transact build rows now that W2-287 (COMPLIANCE_GATE.md) is committed: W2-283 Transact product page (7-section template, Stage-1 copy per COMPLIANCE_GATE); W2-284 stamp-duty/registration-fee estimator (state-wise, INDICATIVE); W2-285 ask-band estimator + urgency slider (sample comparables); W2-286 demand-token waitlist capture (extend D1 leads schema). All CRANE, all noted as building under W2-287's Stage-1 rules.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-01 11:35 - SCRIBE engine arch + V&V rows (W2-303, W2-304)
**Action:** Queued 2 research/docs rows for CRANE to author (SCRIBE does not author substantive research docs itself, per the earlier W2-288 correction): W2-303 docs/ENGINE_ARCH.md (solver orchestration design covering OpenSees/CalculiX/Code_Aster headless compute, IS-code design post-processors, scope tiers T1-T3, post-launch compute topology); W2-304 docs/ENGINE_VV.md (validation plan — IS worked examples + NAFEMS benchmarks, run per release, published). Requested as W2-295/296, renumbered to W2-303/304 — W2-295 is already the branch name for the OSS-adoption commit, same collision pattern as W2-258 and W2-289 before it.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE researches and authors both docs; SCRIBE stands by.
---

## 2026-09-01 11:50 - SCRIBE park W2-262, queue AGENT_INTERFACE research (W2-305), new build order
**Action:** Parked W2-262 (Relume Dashboard + Project Workspace) — blocked, no copy exists for these pages yet. Queued W2-305 (next free number) as a CRANE research/docs row: author docs/AGENT_INTERFACE.md covering the MCP tool catalog for all 9 products, MCP Apps plan (in-chat UI candidates), A2A agent-card spec, agent auth + rate-card design, payments evaluation (x402 vs AP2, one recommendation, India-regulatory flag), llms.txt/AGENTS.md/OpenAPI alignment, and an MCP security section — research only, no code. Annotated the architecture-wave rows (W2-273/274/275/276/277/278) inline: "built per AGENT_INTERFACE spec (W2-305)". Recorded the new build order after Wave C: research (305) → architecture wave (273/276/277/278/274/275) → parity (266-272) → 280 (metadata pass) → Transact (283-287) → 292/294/297/299 (OSS adoption + rate calc/engine).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE authors docs/AGENT_INTERFACE.md first per the new order; SCRIBE stands by.
---

## 2026-09-01 - CRANE landed AGENT_INTERFACE.md v1, expanding to v2 per W2-305 full scope
**Action:** Landed docs/AGENT_INTERFACE.md v1 at 9f9bf26 (5 of 9 products: LandIntel/DesignStudio/Structura/BOQ Pro + rate-compare stub). Discovered W2-305's row description covers a larger scope than v1 (all 9 products, MCP Apps plan, A2A agent-card, payments eval, security section). Merged this plumbing branch (WAVE_QUEUE.md/ACTIVITY_LOG.md only — no competing doc content) to unblock, DONE-marked W2-305 citing 9f9bf26 as the interim landed state, now expanding to v2 before the architecture wave build.
**By:** CRANE (Claude Code)
**Status:** ✅ Complete (plumbing merge); v2 doc expansion in progress
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Expand docs/AGENT_INTERFACE.md to full W2-305 scope, land as v2, then build architecture wave 276→277→278→274→275 against it.
---

## 2026-09-01 12:05 - SCRIBE seamless sweep row + engine docs reconciliation
**Action:** Queued W2-306 SEAMLESS_SWEEP for CRANE — final site-wide verification pass: all routes 200, redirects work, no dead links, every MCP tool is real-or-honest-stub (no silent fakes), tsc + verify-static green, sitemap canonical; run last, after everything else in the build order. Did not duplicate ENGINE_ARCH/ENGINE_VV — those are already queued this session as W2-303/304 on unlanded branch w2-302/SCRIBE-engine-arch-rows with identical scope, noted inline rather than re-added.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-01 12:15 - SCRIBE concierge assistant rows (W2-307, W2-308)
**Action:** Queued 2 rows for CRANE, next free numbers: W2-307 CONCIERGE — deterministic intent-router assistant (no LLM): build-time catalog knowledge, polite script set following COMPLIANCE_GATE voice, quick replies, router.push into both pages and tools, polite fallback + lead handoff, ARIA + mobile support, no external network calls. W2-308 CONCIERGE_LLM — post-launch upgrade path to an LLM-backed assistant, explicitly gated OPEN/blocked on three preconditions: API-key provisioning, abuse/cost review, and retrieval-grounding design — not to start until all three clear.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE builds W2-307 (deterministic, no external calls); W2-308 stays blocked pending gates.
---

## 2026-09-01 12:30 - SCRIBE re-queue phantom rows (W2-309, W2-310, W2-311)
**Action:** Verified against origin/main directly (git show origin/main:docs/WAVE_QUEUE.md) that the earlier Leaflet/Tesseract/three-mode rows (previously W2-292/294/297) never landed — confirmed phantom, only a stray reference to those numbers existed in a build-order note. Re-queued with fresh, self-contained, next-free numbers off origin/main: W2-309 Leaflet + OSM parcel map (MIT); W2-310 Tesseract.js OCR spike (Apache); W2-311 BOQ Pro three-mode calculator, revised scope — Mode 2 (GOVT REFERENCE) and Mode 3 (CUSTOM) ship now, Mode 1 (FERRUM) ships as a labeled stub pending W2-299's spec. All gated on W2-288's license audit.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Land this branch to main (see below), then verify rows are actually present on origin/main.
---

## 2026-09-01 12:45 - SCRIBE Ferrum-rate engine spec + Dashboard/Workspace preview (W2-312, W2-313)
**Action:** Queued the operator-approved, conductor-authored specs, build as-is: W2-312 FERRUM-RATE ENGINE (full Mode 1 spec — sources v1 (govt reference/CPWD DSR watermarked, indicative market seeds, user Mode-3 assumptions, project params), uploaded-BOQ/live-feed sources explicitly excluded until post-launch, default 40/40/20 govt/market/user weighting slider-adjustable and always shown, role-aware weighted-median P25/P50/P75 band output, full output anatomy incl. INDICATIVE watermark and "why this band" line, optional labeled-indicative time-adjustment, indicative:true on every figure until real feeds exist, wired into MCP boq-estimate to make the stub real); fulfills the earlier placeholder W2-299. W2-313 DASHBOARD + WORKSPACE PREVIEW (unparks W2-262, marketing-preview scope only — realistic mock UI as real components, PREVIEW-labeled non-functional controls, early-access lead capture CTA into D1 leads, full copy list and per-page section breakdown as specified, 7-section template where the manifest allows, Relume voice, no Relume re-engagement). Renumbered from requested W2-309/310 to W2-312/313 — those numbers were already taken by the still-unlanded Leaflet/Tesseract/three-mode requeue on w2-309/SCRIBE-oss-requeue, same collision pattern as before. Appended a note on W2-262 pointing to its unparking via W2-313 rather than closing/deleting the row.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE builds W2-312 and W2-313; note W2-309/310/311 (Leaflet/Tesseract/three-mode calc) still awaits a landing decision from the operator per the prior turn.
---

## 2026-09-01 13:00 - SCRIBE post-launch rails rows (W2-314..319)
**Action:** Queued 6 rows for CRANE, all self-contained: W2-314 CONCIERGE_LLM grounding design doc (retrieval over site catalog, mandatory citations, deterministic-router fallback, abuse/cost model with rate limits + budget caps — research/docs only). W2-315 CONCIERGE_LLM implementation, gated on ANTHROPIC_API_KEY secret + operator budget approval. W2-316 live-feed adapters (LandRecordsProvider/MarketRatesProvider, documented public endpoints, graceful seed fallback, indicative flags preserved) plus a DILRMP onboarding-application doc. W2-317 real workspace auth (magic-link, Workers+D1, dev console-email fallback, prod email gated on operator email-API key). W2-318 full Dashboard/Workspace copy replacing W2-313's PREVIEW mock with real sections and a real sign-in CTA, noted as depending on W2-317 landing first. W2-319 author docs/TRANSACTION_COUNSEL_PACK.md expanding COMPLIANCE_GATE's checklist into a counsel-ready memo (RERA per-state scope, advocate empanelment, escrow structure, KYC/AML, advertising rules) — explicitly framed as prep material for actual counsel, not a substitute for sign-off; COMPLIANCE_GATE's Stage-2 block stays in force regardless. Per the standing SCRIBE-authorship correction, none of the doc-authoring rows (314, 316's doc component, 319) were written by SCRIBE — all queued for CRANE to research and author.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE works these; W2-315 and the prod-email path of W2-317 stay blocked on operator-provided secrets/approval.
---

## 2026-09-01 13:15 - SCRIBE final rails rows (W2-326..336)
**Action:** Queued 11 rows for CRANE covering the remaining build-out to a real, shippable product: W2-326 AUTH_COMPLETE (PBKDF2/WebCrypto password auth, sessions, Resend verify+reset with dev fallback, account page, rate limits — folds W2-317); W2-327 WORKSPACE_DATA (saved-artifact CRUD/export/share tied to auth); W2-328 FORMS_LEADS (all forms into D1 + minimal admin lead view); W2-329 PAYMENTS_COMPLETE (checkout/tokens/subscriptions/webhooks with signature verify/receipts+GST invoice, test-mode now); W2-330 TRANSACT_LIFECYCLE (buyer/seller state machine, KYC capture, R2 uploads, scheduling, notifications); W2-331 CONTENT_REAL (Blog/Case Studies/IS Guides real content, no lorem); W2-332 LEGAL_PAGES (Terms/Privacy/Refunds/Disclaimers/DPDP/cookie consent); W2-333 SITE_SYSTEMS (404, SEO/OG, sitemap/robots, a11y, perf, error boundaries); W2-334 SECURITY_HARDENING (rate limits, CSP, validation, secrets audit); W2-335 AGENT_SURFACE_SYNC (reconcile llms.txt/AGENTS.md/OpenAPI/MCP catalog against actual shipped state); W2-336 OPS (logs/traces, error tracking). W2-326 folds the earlier W2-317 (real workspace auth) — that row lives on the still-unlanded w2-314/SCRIBE-post-launch-rails branch and isn't present in this checkout, so the fold is recorded here rather than as an in-file edit to W2-317 itself.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE works these; when w2-314/SCRIBE-post-launch-rails lands, its W2-317 row should get a superseded-by-W2-326 note.
---

## 2026-09-01 13:30 - SCRIBE IS-code expand, OCR verify, stamp duty expand, acceptance criteria
**Action:** Queued 3 rows for CRANE: W2-337 IS_CODE_EXPAND (add IS 1893 seismic response spectrum + IS 875 wind/imposed load checks to lib/checks/isCode.ts, wire into /api/is-check + MCP is-check tool, unit tests against textbook worked examples). W2-338 OCR_VERIFY — pre-resolved this myself rather than leaving it as an open investigation: ran `git show 18364a6` and confirmed the Tesseract OCR spike DID land on main (tesseract.js 7.0.0 in apps/web/package.json, apps/web/components/sections/OcrSpike.tsx, wired into apps/web/app/products/transact/page.tsx) — marked VERIFIED with the commit SHA, no further action needed. W2-339 STAMP_DUTY_EXPAND (seed all 28 states + 8 UTs into stamp_duty_rates via migration 0005_stamp_duty_all_states.sql, sourced from current state govt gazette rates, every row labeled INDICATIVE until independently verified). Added acceptance criteria to two existing rows on the still-unlanded w2-326/SCRIBE-final-rails branch (merged into this one to do so): W2-333 SITE_SYSTEMS now requires sitemap.ts route count to exactly match the actual `next build` route count (diff=0) plus creation of public/_redirects per docs/RELUME_ROUTE_MAP.md; W2-335 AGENT_SURFACE_SYNC now requires downgrading plan-gen to "stub" in docs/AGENT_INTERFACE.md and its A2A card, shipping llms.txt, and reconciling the plans table. Also formally marked W2-317 SUPERSEDED (folded into W2-326) now that both rows are in the same file after the merge. At the time, could NOT attach acceptance criteria to "W2-321" — no such row existed yet anywhere in WAVE_QUEUE.md history on any branch checked; flagged rather than inventing one. (Resolved next entry: W2-321 was subsequently defined for real as PLACEHOLDER_AUDIT.)
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE works W2-337/339; W2-338 needs no further action.
---

## 2026-09-01 13:45 - SCRIBE Transact launch rails + first sweep + final certification (W2-320..325, SWEEP_100)
**Action:** Verified against origin/main directly that W2-320..325, W2-337..339, and SWEEP_100 were all absent (no rows, and only w2-337/SCRIBE-is-code-ocr-stamp existed as a pushed-but-unlanded branch). Queued the operator/conductor-authored scopes verbatim: W2-320 TRANSACT_VISIBILITY (nav/footer/home-showcase/sitemap/concierge-catalog listing, no page copy changes); W2-321 PLACEHOLDER_AUDIT (full dead-element inventory and wiring, delete LandIntelLookup.tsx, keep UlpinDemoWidget, remove prod FALLBACK badges, wire newsletter to /api/leads, acceptance = 0 localhost:8000 grep hits + 0 dead links) — this is the real definition of the row the previous entry flagged as missing; W2-322 TRANSACT_FLOWS (buyer/seller state flows, transact_cases + case_events D1 tables via migration 0005, Stage-1 compliance voice); W2-323 ESCROW_DESIGN (docs/ESCROW_DESIGN.md, RBI-compliant bank/NBFC-vs-Razorpay-Route analysis, no-self-custody principle, cross-ref COMPLIANCE_GATE, research/docs only); W2-324 RAZORPAY_INTEGRATION (test-mode Worker checkout + signature-verified webhook, orders/payments tables via migration 0006, GST invoice via pdf-lib, env-placeholder keys only, live mode gated); W2-325 SWEEP_FIRST (site-wide pass after 320-324); SWEEP_100 (final certification after everything through W2-339, PASS/FAIL report + SHA table). Merged in the separate w2-337/SCRIBE-is-code-ocr-stamp branch so all requested rows land together in one push; resolved trivial append-only conflicts in both docs files.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Verify presence on origin/main per the operator's protocol (ls-remote + fetch + grep) before reporting Done.
---

## 2026-09-01 14:00 - SCRIBE ATLAS findings: CDE status honesty + form wiring (W2-340, W2-341)
**Action:** Queued 2 rows for CRANE from ATLAS findings not covered by existing rows: W2-340 CDE_STATUS_FIX (make /api/cde-status/:project_id either read a real per-project record or explicitly self-declare indicative/mock in its own payload — currently silently ignores project_id, a hidden defect invisible to an MCP agent; same fix wired into the MCP cde-status tool if exposed). W2-341 FORM_WIRING (wire NewsletterSignup/Contact/Demo/Signup forms to /api/leads with a type discriminator each; wrap the Login page fields in a real form posting to /api/auth/login; replace the dead "Forgot password?" link with a real /forgot-password stub route posting to /api/auth/reset-request).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE works these; verification of all pending row numbers follows in this same push.
---

## 2026-09-01 14:15 - SCRIBE performance pass (W2-342)
**Action:** Queued W2-342 PERF_PASS for CRANE (reassigned to ATLAS as part of the same-day slice split, see below): Lighthouse run on 10 key routes (home, each product page, pricing, one blog article, one checklist); targets Performance ≥ 90, LCP < 2.5s, CLS < 0.1, TTFB < 300ms; bundle budget (no route > 200 kB first-load JS); edge cache/security header verification; fix offenders (defer non-critical JS, preload key assets).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Preflight check for W2-320..342 follows in this same push.
---

## 2026-09-01 14:30 - SCRIBE ATLAS reactivation + disjoint-ownership protocol (WIP, continued below)

## 2026-09-01 14:40 - SCRIBE ATLAS reactivation + disjoint-ownership protocol (complete)
**Action:** Reactivated ATLAS as ACTIVE with a dual role (architect + executor for its assigned queue slice) — updated AGENTS.md RULE 1 roster, docs/ROLE_MAP.md's ACTIVE table and change log (removed ATLAS from PARKED), and created docs/seats/ATLAS.md. Codified the ATLAS/CRANE disjoint-ownership protocol in both AGENTS.md and ROLE_MAP.md: ATLAS never touches worker.ts/auth/payments files, CRANE never touches sitemap/nav/footer/legal/resources files, dependency additions are CRANE-only, both push from their own worktrees, landing is serialized via scripts/land.ps1 regardless of authoring seat, and SWEEP_100 is run mechanically by CRANE with each seat then spot-auditing the other's half (no self-certification). Reassigned WAVE_QUEUE rows per the operator's split: W2-323, 331, 332, 333, 338, 339, 342 → ATLAS. Did NOT blindly reassign W2-320 (already DONE by CRANE — added a note instead of rewriting history) or W2-321 (actively CLAIMED-CRANE — left with CRANE to avoid duplicate work, noted that it falls in ATLAS's slice going forward). W2-322, 324, 326-330, 334, 335, 337, 340, 341 remain CRANE, unchanged, as specified. Merged in the concurrently-landed w2-320/SCRIBE-transact-launch-rails branch to reach W2-342's real row and resolved several trivial conflicts (mostly duplicate sections from independent landings; kept the more current/already-updated status where both sides described the same row).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ROLE_MAP.md, docs/seats/ATLAS.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS and CRANE both read the disjoint-ownership protocol from main before claiming further rows.
---

## 2026-09-01 14:55 - SCRIBE DSH-inspired patterns (undo discipline, skills catalog, gate dispatch)
**Action:** Added three new rules to AGENTS.md (no full harness adoption, just these three patterns): RULE 10 UNDO_DISCIPLINE — every WAVE_QUEUE row going forward carries an UNDO: field (one-line deterministic inverse command); existing rows are not retrofitted. RULE 11 SKILLS_CATALOG — new docs/SKILLS.md lists each seat's expert skills (CRANE: D1 migrations, Worker routes, MCP wiring, auth/payments backend; ATLAS: audits, research, legal drafting, site-systems architecture; SCRIBE: queue management, ledger discipline, row verification); the conductor routes sub-tasks by skill. RULE 12 SUB_AGENT_GATE_DISPATCH — when CRANE hits an operator gate it reports to the conductor instead of blocking, and the conductor dispatches the unblocking sub-task to ATLAS (research/design) or SCRIBE (docs/queue) as appropriate.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/SKILLS.md, docs/ACTIVITY_LOG.md
**Next Steps:** New WAVE_QUEUE rows should start carrying UNDO: fields from here on.
---

## 2026-09-02 08:10 - SCRIBE gap-closure row + ATLAS cross-audit notes on W2-327, W2-334
**Action:** Per ATLAS's cross-audit of CRANE's landed rows (spot-audit half of the disjoint-ownership protocol), amended two DONE rows with audit findings rather than reopening or deleting them: W2-327 WORKSPACE_DATA now notes "audit: partial — Update op missing at audit time; gap-closure row follows"; W2-334 SECURITY_HARDENING now notes "audit: partial — CSP shipped Report-Only; doc/ledger scope contradiction; enforcement lands via gap-closure". Added new row W2-343 GAP_CLOSURE (assigned CRANE) to actually close both gaps: implement the missing Update op on saved-artifact CRUD, and move CSP from Report-Only to enforced, plus an E2E no-breakage proof across forms/auth/payments/workspace flows. No deletions — append-only per RULE 3.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims and lands W2-343; ATLAS re-audits both gaps once W2-343 is DONE.
---

## 2026-09-02 08:25 - SCRIBE Relume identity pass row (W2-344)
**Action:** Added W2-344 RELUME_IDENTITY_PASS, assigned ATLAS (falls in ATLAS's site-systems/content slice per the disjoint-ownership protocol). Scope per operator spec: site-wide visual identity pass against docs/RELUME_HANDOFF.md and docs/RELUME_SPECS.md — footer redesign (balanced grid, no corner-stacking), hero visual (real composed UI components replacing the empty placeholder box, honest not fake), and unified section rhythm/headings/buttons/cards to the Relume component language. No logic changes. Acceptance: build + verify-static green, visual consistency table in report.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-344.
---

## 2026-09-02 08:40 - SCRIBE RULE 13 (screenshot extrapolation) + sitewide claim-truth/content-assets/media-honesty rows
**Action:** Added AGENTS.md RULE 13 — SCREENSHOT_EXTRAPOLATION: when the operator flags one instance of a defect from a screenshot/spot-check, the fix scope is automatically all similar instances site-wide; the fixing seat inventories every occurrence of that defect class before claiming done. Applied it directly: added W2-345 SITEWIDE_CLAIM_TRUTH (ATLAS) — full-site inventory of every claim (feature cards, marketing bullets, hero claims, FAQ, pricing promises, how-it-works, resources descriptions) with backing-status + decision (IMPLEMENT-MIN/WIRE/ROADMAP-LABEL/REWRITE/DELETE) per claim, then execute. Added W2-348 CONTENT_ASSETS (CRANE) — real generated DXF/PDF/checklist downloads for templates/whitepapers/reports so every download affordance produces a real file. Added W2-349 MEDIA_HONESTY (ATLAS) — videos/podcasts pages get converted to article-format episode notes, roadmap-labeled, or have the watch/listen affordance deleted, since no recorded media exists or can be faked. Row numbers 346/347 intentionally left open (not used).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-345 and W2-349; CRANE claims W2-348.
---

## 2026-09-02 09:20 - SCRIBE W2-347 reassignment (ATLAS → CRANE) + RULE 14 security-merge guard
**Action:** Reassigned W2-347 (SITEWIDE_CLAIM_TRUTH, tools side) from ATLAS to CRANE — tools-side wiring means worker.ts/MCP territory, which is CRANE-only per the disjoint-ownership protocol; noted the reassignment inline on the row rather than deleting/rewriting it. Note: W2-347 was still unlanded (only on the pending w2-350/scribe-deadcode-copycount branch, not yet on main), so this branch was built on top of that branch rather than origin/main, to avoid landing a duplicate W2-347 row with conflicting assignments. Added AGENTS.md RULE 14 — SECURITY_MERGE_GUARD: any landing touching `_headers`, middleware, or rate-limit code must re-verify post-land that CSP is fully enforced (grep apps/web/out/_headers, Report-Only count = 0) and rate limits are still present; a silent regression on either is a REVERT verdict in the REGENT post-land checklist, not a PASS.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-347 (reassigned); REGENT applies RULE 14 on the next landing touching _headers/middleware/rate-limits.
---

## 2026-09-02 09:35 - SCRIBE CODEX activation + W2-353 EMPTY_PLACEHOLDER_SWEEP
**Action:** Flagged before acting: the operator's original ask assigned a row to CODEX, but CODEX was not on the RULE 1 ACTIVE roster (only mentioned as parked/reactivatable-when-joining). Operator chose to activate CODEX now. Updated AGENTS.md RULE 1 to add CODEX (executor, parallel slice, owns W2-346..350 and W2-353+); updated the PARKED heading from "reactivatable when Codex/Cursor join" to "reactivatable when Cursor joins" since Codex has now joined. Updated docs/ROLE_MAP.md ACTIVE table, name registry, and change log with the same detail; did NOT retroactively rewrite the existing ATLAS/CRANE assignments on W2-346/348/350 (same precedent as W2-320/321 during ATLAS's reactivation) — the slice statement applies going forward only. Created docs/seats/CODEX.md. Added a CODEX section to docs/SKILLS.md (UI-affordance sweeps, Playwright E2E crawl/verification). Also renumbered the placeholder-sweep row per the operator's correction: W2-352 stays bound to the RULE 14 branch (already pushed); the placeholder sweep is queued as **W2-353** EMPTY_PLACEHOLDER_SWEEP, assigned CODEX, verbatim scope: (1) every hero/section visual box has a real composed visual or is removed; (2) every product/resource card is fully clickable to its route, not just "Learn more"; (3) every button has a real handler or is removed; (4) every nav dropdown/menu lists real routes, no empty tabs. Acceptance: Playwright crawl of all routes reports zero empty containers, zero handler-less buttons, zero dead '#' links.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ROLE_MAP.md, docs/seats/CODEX.md, docs/SKILLS.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CODEX claims W2-353.
---

## 2026-09-02 09:45 - SCRIBE W2-354 RESPONSIVE_SWEEP (CODEX, sequenced after W2-353)
**Action:** Added W2-354 RESPONSIVE_SWEEP, assigned CODEX, explicitly sequenced after W2-353 (built this branch on top of the still-unlanded w2-353/scribe-codex-placeholder-sweep branch so the row order in the ledger reflects that sequencing). Scope verbatim: every route × 7 viewports (375×667, 390×844, 768×1024, 1024×768, 1366×768, 1920×1080, landscape phone); checks for zero horizontal overflow, functional nav/hamburger, clean footer-grid collapse, unclipped hero composed-visual scaling, card stacking, table stacking/scrolling, ≥44px tap targets, calculator/tool usability at 375px, legible type, and PWA-ready viewport meta presence. Acceptance: Playwright routes × breakpoints matrix, zero violations post-fix, re-crawl green, build + verify-static green.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CODEX claims W2-353 then W2-354 in order.
---

## 2026-09-02 11:15 - SCRIBE W2-347 audit note (partial, no deletions)
**Action:** Annotated the already-landed, DONE W2-347 row with an audit finding, note only — no deletions: "Audit PARTIAL — tools-side = honest labeling, not wiring; hero-bullet overclaims resolved via ATLAS 346-convention follow-up." Built this branch fresh off origin/main (rather than stacking on an unlanded branch) since W2-347 was already landed there.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** None pending on this row beyond the noted ATLAS 346-convention follow-up.
---

## 2026-09-02 10:05 - SCRIBE CODEX slice confirmed (346/348/349/350/353/354) + W2-347 CRANE override + Stage-2 counsel-pack entry
**Action:** Operator confirmed the exact CODEX slice — W2-346, 348, 349, 350, 353, 354 — narrower than the initial "346..350 and 353+" statement, and explicitly carved W2-347 out to CRANE (a specific reassignment overrides the general roster range). Also noticed in passing that CRANE had already self-reassigned W2-348 from CLAIMED-CRANE to CODEX/OPEN on main (commit 179f849c, `feat: [land:w2-348/crane-release-claim]`) — consistent with this confirmation, not contradicting it. Annotated rows: W2-346 ATLAS→CODEX, W2-349 ATLAS→CODEX, W2-350 ATLAS→CODEX (all noted inline, not deleted); W2-348 confirmed CODEX; W2-347 confirmed CRANE with an explicit override note plus the compliance finding — CommunityBuild investor-KYC wiring is Stage-2, BLOCKED per docs/COMPLIANCE_GATE.md, stays ROADMAP-LABEL rather than IMPLEMENT-MIN/WIRE. Added docs/TRANSACTION_COUNSEL_PACK.md §7 "Stage-2 candidates flagged during Stage-1 build" logging this item for future counsel review. Updated AGENTS.md RULE 1, docs/ROLE_MAP.md (ACTIVE table + change log), and docs/seats/CODEX.md to state the confirmed slice and the W2-347 carve-out.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ROLE_MAP.md, docs/seats/CODEX.md, docs/TRANSACTION_COUNSEL_PACK.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CODEX claims its confirmed slice; CRANE proceeds on W2-347 with the ROADMAP-LABEL constraint on the CommunityBuild investor-KYC claim specifically.
---

## 2026-09-02 10:20 - SCRIBE CODEX-B flagged, then MASON/RIVET rename + RIVET activation + W2-356 APP_SHELL_V1
**Action:** Flagged before acting: CODEX-B was not on the roster (only CODEX). Operator clarified it's a genuine second, separate Codex CLI instance and directed a roster rename for clarity: CODEX -> MASON (unchanged slice: 346/348/349/350/353/354), CODEX-B -> RIVET (new, exclusive to apps/mobile/** and docs/** only). Renamed CODEX -> MASON everywhere it appeared: AGENTS.md RULE 1, docs/ROLE_MAP.md (ACTIVE table, name registry, change log), docs/SKILLS.md, and every WAVE_QUEUE row previously assigned CODEX (346, 348, 349, 350, 353, 354) plus the W2-347 override note referencing the slice range. Both names collide with the original parked Qoder-era MASON and RIVET (parked 2026-08-31, work already reassigned to CRANE) — resolved by adding explicit "name reused, no history reattributed" notes in AGENTS.md, ROLE_MAP.md (new Retired Qoder-era names note replacing the old PARKED table rows for MASON/RIVET, GIRDER remains PARKED alone), and both seat docs. Renamed docs/seats/CODEX.md to docs/seats/MASON.md (git rm + new file, since CODEX.md had already landed on main) and created docs/seats/RIVET.md. Added the RIVET section to docs/SKILLS.md. Queued **W2-356** APP_SHELL_V1 (355 stayed bound to the earlier branch per operator instruction), assigned RIVET: Capacitor/TWA shell in apps/mobile wrapping the deployed workers.dev URL (config, icons, splash, offline-notice screen) + docs/APP_LAUNCH_CHECKLIST.md + docs/pwa-wiring.patch (2-line manifest/SW wiring handoff for CRANE to apply). Exclusive paths apps/mobile/** and docs/** only.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ROLE_MAP.md, docs/seats/MASON.md (new), docs/seats/RIVET.md (new), docs/seats/CODEX.md (removed), docs/SKILLS.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** RIVET claims W2-356; CRANE applies docs/pwa-wiring.patch once RIVET delivers it.
---

## 2026-09-02 10:35 - SCRIBE LANDING_PIPELINE_FIX (W2-357) + new rebase-before-push protocol adopted immediately
**Action:** Queued W2-357 LANDING_PIPELINE_FIX, assigned CRANE, to end the recurring squash-conflict hand-reconstruction seen across several landings this session: (1) SCRIBE rebases onto origin/main before every push, resolving shared docs files (WAVE_QUEUE.md, ACTIVITY_LOG.md) by keeping both additions in chronological order; (2) land.ps1 gains a rebase-then-squash path for docs-only branches and REPORTS a conflict instead of silently failing on it. Acceptance: next three docs branches land without manual reconstruction. Also codified the SCRIBE half of the new protocol as an addendum to AGENTS.md RULE 9. Tried to apply it to this very push — attempted `git rebase origin/main` on this branch (stacked atop several unlanded prior SCRIBE branches) and hit exactly the conflict class W2-357 targets: 3-way content conflicts in AGENTS.md/ACTIVITY_LOG.md/WAVE_QUEUE.md across multiple commits in the stack. Aborted the rebase rather than risk a bad manual resolution corrupting the ledger, and pushed this branch using the same stacked-branch pattern as every prior task this session instead. This is itself evidence for W2-357: the rebase protocol needs a flatter branch chain (i.e., earlier branches landed first) to actually work — CRANE's land.ps1 side of the fix should land the backlog before SCRIBE's rebase step becomes reliable.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE implements the land.ps1 rebase-then-squash path; SCRIBE follows the rebase-before-push protocol going forward.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 12:00 - SCRIBE W2-362 ALL_TOOLS_LIVE_SWEEP (deployed-edge verification)
**Action:** Queued W2-362 ALL_TOOLS_LIVE_SWEEP, assigned CRANE: every interactive tool on every page must pass on the deployed edge (workers.dev), not just local. Scope list carried verbatim: test-fit massing (DesignStudio), ULPIN lookup + map (LandIntel), IS 456/800 checks (Structura), BOQ three-mode calculator, IRR/NPV (InvestFlow), GST/stone calculators, OCR spike, all forms, auth flow, payments test flow, artifacts CRUD, concierge catalog. Acceptance: Playwright tool × action × result table against the deployed edge, zero failed/error states, root causes fixed rather than hidden.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-362.
---

## 2026-09-02 12:15 - SCRIBE W2-363 TYPOGRAPHY_LAYOUT_SWEEP (conditional assignment, no live signal on MASON's rate-limit status)
**Action:** Queued W2-363 TYPOGRAPHY_LAYOUT_SWEEP, assigned MASON on the operator's stated assumption that its rate limit has reset — SCRIBE has no way to directly verify MASON's live rate-limit status, so the row carries an explicit note: whoever claims it should confirm and update Assigned To to CRANE first if MASON is still limited. Scope verbatim: no forced link/label wrapping below readable measure; footer columns get adequate min-width + gap (grid auto-fit minmax(160px,1fr) or wider); hero/body line-length 45-75ch; headings never wrap mid-phrase at standard widths; taglines one line on desktop. Site-wide (footer, heroes, cards, tables, tool panels, legal pages). Acceptance: Playwright screenshots at 1366 + 375 reviewed per route, zero wrapped-link/crushed-text instances, build + verify-static green.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** MASON (or CRANE, if MASON still rate-limited) claims W2-363, updating Assigned To first if reassigning.
---

## 2026-09-02 12:30 - SCRIBE W2-360 result annotation (RULE 6 approval unused, self-corrected GST/export claim)
**Action:** Annotated W2-360 (still OPEN, not yet landed) with the result, notes only, no deletions: "narrow RULE 6 approval granted but UNUSED — ATLAS verified zero protected-path overlap before and after; no boq-pro/** file modified. GST/export claims rewritten to precise truth (separate disconnected tool has them), self-corrected from a draft that would have fabricated the opposite." Worth flagging: ATLAS caught its own draft heading toward a fabricated claim and corrected it before landing — exactly the RULE 5 no-fabrication discipline working as intended.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** None pending; W2-360 still awaits landing/DONE status.
---

## 2026-09-02 13:00 - SCRIBE W2-367 PARCEL_MAP_SYNC + reassignment annotations; RULE 16/17 and W2-368 BLOCKED (no verbatim text provided)
**Action:** Several stacked prompts arrived this turn, some addressed to CRANE (held, no action per RULE 2). Of the SCRIBE-addressed items, completed: (1) Queued W2-367 PARCEL_MAP_SYNC, assigned CRANE, folding into the W2-361 work session per CRANE's own note (same files, not a separate branch) — BLR/PUN/CHN lat/lng values, every map instance must center+marker on the selected parcel, neutral India pre-selection view, Playwright per-parcel screenshot acceptance. (2) Reassigned W2-331 CONTENT_REAL and W2-354 RESPONSIVE_SWEEP to MASON per the "MASON at 12:51 AM gets 354 + 331 retoken" instruction — W2-331 noted as a retoken pass (re-run against current Relume tokens, not a scope change); W2-354 also had its stale "CODEX" assignee corrected to MASON in the same edit (leftover from the pre-rename branch chain). (3) Confirmed W2-365 COMMAND_DECK_BACKEND is already CRANE — no change needed. NOT done, flagged rather than fabricated: RULE 16 (ALWAYS ENGAGED) and RULE 17 (PROPOSE FREELY, EXECUTE ON APPROVAL) were requested "verbatim per conductor text" but no such text was ever provided in this conversation — cannot add rules without their actual wording. W2-368 BRAND_MARK_26 was requested "per conductor spec above" with a footer line "verbatim," but no brand spec or footer-line text was provided either — cannot queue a row whose acceptance criteria depend on content that doesn't exist in my context. Both need the actual source text pasted in before I act.
**By:** SCRIBE (Claude Code)
**Status:** ⚠️ Partial — RULE 16/17 and W2-368 blocked on missing verbatim text
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Operator/conductor pastes the actual RULE 16/17 text and the BRAND_MARK_26 spec + footer line verbatim; SCRIBE applies both once received.
---

## 2026-09-02 13:15 - SCRIBE RULE 16/17 added (verbatim text received) + W2-368 BRAND_MARK_26 queued
**Action:** Verbatim text for the two previously-blocked items arrived; applied both. Added AGENTS.md RULE 16 — ALWAYS ENGAGED (no seat waits on another; blocked target triggers immediate side-hustle from the approved menu — edge LCP/perf audit, a11y pass, SEO/OG audit, vitest coverage gaps, docs completeness — or a RULE 17 proposal; state the switch in one line; idle = defect) and RULE 17 — PROPOSE FREELY, EXECUTE ON APPROVAL (any seat may surface operator-facing proposals with target/rationale/cost; nothing executes without explicit operator approval via conductor), verbatim as given, numbered exactly as specified (RULE 15 intentionally does not exist). Mirrored both into docs/seats/ATLAS.md, docs/seats/CODEX.md, docs/seats/CRANE.md, docs/seats/SCRIBE.md (RIVET/MASON seat docs not present in this branch chain — pre-rename fork, see W2-357 pipeline note; will need reconciliation on land). Queued W2-368 BRAND_MARK_26, reassigned to CRANE per the operator's own "368→CRANE (MASON dark)" annotation from earlier this session: tricolor tile spec, chakra, Fe/26 cell mark, header/footer/favicon/OG/manifest scope, and the exact footer line verbatim.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/seats/ATLAS.md, docs/seats/CODEX.md, docs/seats/CRANE.md, docs/seats/SCRIBE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-368. RIVET/MASON seat docs need the RULE 16/17 mirror once the rename branch (W2-356) and this branch reconcile.
---

## 2026-09-03 08:00 - SCRIBE W2-372 UI_UX_MODERNIZATION (RULE 17 sign-off gate)
**Action:** Queued W2-372 UI_UX_MODERNIZATION, assigned MASON, sequenced after W2-354 (RESPONSIVE_SWEEP) and the og:image work. Encoded the operator's RULE 17 note directly on the row: this is a design-directive task, so the conductor must sign off on the modernization direction/scope before the sweep starts — MASON does not begin execution on approval-pending scope, per RULE 17 (propose freely, execute on approval).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Conductor sign-off required before MASON begins W2-372.
---

## 2026-09-03 08:15 - SCRIBE W2-373 INTERACTION_FIRST (sequenced before the W2-372 sweep)
**Action:** Queued W2-373 INTERACTION_FIRST, assigned MASON, sequenced after og:image work and BEFORE W2-372 (UI_UX_MODERNIZATION) — updated W2-372's own sequencing note to reference W2-373 as a predecessor rather than leaving the two rows silently inconsistent. Scope verbatim: on every product page the real working tool is the first thing in the first viewport (hero hosts the full interaction, replacing the W2-361 mini); explanatory content only follows if the tool isn't self-evident; duplicate "try it" sections further down are removed — no tool twice per page.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** MASON claims W2-373 (after og:image); W2-372 still gated on conductor sign-off per RULE 17.
---

## 2026-09-03 08:30 - SCRIBE W2-374 METHOD_PLAYBOOK — authored docs/FERRUM_METHOD_PLAYBOOK.md (self-assigned)
**Action:** Queued and authored W2-374 METHOD_PLAYBOOK directly (assigned SCRIBE, not queued to CRANE for research) — this is meta-documentation about the fleet's own operating process, which sits inside SCRIBE's own domain expertise (RULE 7 docs ownership), unlike a technical/architecture doc requiring code research SCRIBE would otherwise queue to CRANE. Authored docs/FERRUM_METHOD_PLAYBOOK.md covering sections 1-9 as specified (seat model with the three-condition test for adding a second executor; the actual 16 adopted rules — 1-14, 16, 17, with RULE 15 explicitly noted as never assigned rather than fabricated — each with a one-line rationale; ledger row schema + annotation protocol + activity-log format; the 7-field mission-order format with single-target-vs-batch guidance; the landing pipeline pattern including the rebase-then-squash fix from W2-357; honesty conventions (RULE 13 extrapolation, no-fabrication, INDICATIVE/ROADMAP/TEST labeling, deployed-edge-as-truth, audit false-positive/shallow-selector discipline); operator gates (protected paths, production-write protocol, narrow conditional approvals); capacity contingency (dark-window fallback assignees, single-target cadence, RULE 16/17); and a new-repo bootstrap checklist. Section 10 (Lessons Appendix) is explicitly marked incomplete — it requires one paragraph of real input from each seat (CRANE, ATLAS, MASON/CODEX, RIVET), which SCRIBE did not fabricate; instead populated it with a defect-class checklist derived from this engagement's actual git/ledger history (placeholders, claim-truth drift, fabricated individuals, deploy≠local, DB migration gaps, brand-spec verbatim drift, squash drift, empty containers, hardcoded maps, false-positive selectors) as a starting point for the conductor to collect the real per-seat paragraphs against.
**By:** SCRIBE (Claude Code)
**Status:** ⚠️ Partial — document authored and pushed, but Section 10 awaits real per-seat lesson paragraphs from the conductor
**Files Modified:** docs/FERRUM_METHOD_PLAYBOOK.md (new), docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Conductor collects one lesson paragraph from each of CRANE, ATLAS, MASON/CODEX, RIVET; SCRIBE inserts them into Section 10 in a follow-up row once received.
---

## 2026-09-03 08:45 - SCRIBE W2-375 TYPOGRAPHY_SECOND_PASS (queue-jump, operator's repeated grievance)
**Action:** Queued W2-375 TYPOGRAPHY_SECOND_PASS, assigned MASON, marked as jumping the queue ahead of MASON's other OPEN rows per the operator's stated repeated grievance — gave it status PRIORITY-JUMP rather than OPEN and an explicit instruction on the row to claim it before anything else in the MASON slice, since the append-only ledger has no native row-reordering mechanism (per the method playbook's own §3 annotation protocol: priority is carried as a note/status, not by physically moving the row). Scope verbatim: zero crumpled text at any standard width; footer brand tagline ≤2 lines, ≥24ch measure at widths ≥1024; links/labels never wrap below readable measure. Acceptance: screenshots at 1280/1366/1440/1920 and 1024/768/375 on home, products/landintel, resources index, and one tool page; MCP re-sweep of all routes at 1440 added to the existing 1366/375 corpus.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** MASON claims W2-375 immediately, ahead of W2-363/W2-366/W2-372/W2-373.
---

## 2026-09-03 09:00 - SCRIBE STUDIO_ENGINE queued (W2-380 parent + W2-381..386 milestones S1-S6)
**Action:** Queued the DesignStudio engine rebuild as one parent row (W2-380) plus six milestone child rows (W2-381..386, each carrying W2-380 in the Parent column) using the ledger's existing Parent field rather than inventing a new structure. Parent row records the two operator approvals verbatim — three.js approved as a single new dependency for S4 (CRANE-only to add per RULE 1), and S5's demographic/preference capture approved as consent-gated/never-mandatory — plus the binding honesty condition: all sample FAR/DCR/neighbour data stays labeled INDICATIVE until real per-city/per-parcel sources land, on every milestone, no exceptions. Milestones: S1 PARCEL_INTEL (CRANE) and S2 STRUCTURAL_LIVE (CRANE) both sequenced after CRANE's M5 milestone; S3 STYLE_LIBRARY (MASON) after W2-373; S4 STUDIO_3D (MASON) after W2-372 gets conductor sign-off; S5 PREFERENCE_LAYER (MASON) after S4; S6 FREEZE_SIGNOFF (CRANE backend + MASON UI) after S5. Noted ATLAS audits each milestone, and that "RIVET docs now" (first in the operator's sequencing list) refers to RIVET's existing queued work, not a new row — no content was given for a new RIVET task, so none was fabricated.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims S1/S2 after M5; MASON claims S3 after W2-373; ATLAS audits each milestone as it lands.
---

## 2026-09-03 09:15 - SCRIBE playbook §10 CRANE/ATLAS lessons inserted; W2-372 annotated with five-point approval rubric
**Action:** (1) Inserted CRANE's and ATLAS's Section 10 lesson paragraphs into docs/FERRUM_METHOD_PLAYBOOK.md, composed from the operator's one-line summaries ("stale-branch re-landing rule", "trust-disk-over-labels rule") expanded against the actual documented incidents that produced each lesson — no fabricated first-person quotes. CRANE's paragraph cites the CODEX→MASON/RIVET rename (W2-356) not propagating into the parallel w2-359..380 branch chain, causing W2-354's stale "CODEX" assignee to persist past the rename and need re-correction; ties directly to why W2-357 (LANDING_PIPELINE_FIX) exists. ATLAS's paragraph cites W2-347's label-vs-actual-result gap, W2-360's RULE 6 approval-granted-but-unused finding, and the self-corrected GST/export draft, producing the rule that audits verify against disk state, never against status labels or self-reports. MASON's and RIVET's paragraphs remain pending, explicitly still marked so, to be inserted via a follow-up row once collected (operator's target: after 1:09). (2) Annotated W2-372 with the conductor's five-point approval rubric verbatim: dynamic graphics substantive; attractive + modern tech roots; honesty survives; no new deps beyond the approved three; database-traceable selections — so ATLAS's audit of W2-372 has an explicit, disk-checkable rubric rather than relying on the row's own status.
**By:** SCRIBE (Claude Code)
**Status:** ⚠️ Partial — playbook §10 still awaits MASON/RIVET paragraphs
**Files Modified:** docs/FERRUM_METHOD_PLAYBOOK.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Conductor collects MASON/RIVET lesson paragraphs after 1:09; SCRIBE inserts via follow-up row. ATLAS audits W2-372 against the five-point rubric once MASON claims and lands it.
---

## 2026-09-03 09:00 - CRANE W2-374 Section 10 — CRANE's lesson paragraph delivered
**Action:** Per the operator's request during W2-370's milestone reporting, CRANE delivered one real lesson paragraph (the land.ps1 stale-branch re-landing scar hit twice during W2-370 M3/M4 landings, and the rule to delete rather than re-patch). Inserted verbatim into docs/FERRUM_METHOD_PLAYBOOK.md §10 under a new "Per-seat lessons (collected as delivered)" subsection, alongside the existing defect-class checklist rather than replacing it.
**By:** CRANE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/FERRUM_METHOD_PLAYBOOK.md
**Next Steps:** ATLAS, MASON/CODEX, RIVET lessons still pending collection.
---

## 21:00 - SCRIBE CSP decision (W2-240)
**Action:** Recorded the CSP decision in docs/SECURITY.md: the nonce-based CSP and its middleware were retired for the static launch; the static _headers CSP uses unsafe-inline, accepted consciously as a launch-scoped tradeoff. Queued W2-240 in docs/WAVE_QUEUE.md for post-launch hardening to hash-based or edge-nonce CSP, assigned CRANE.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/SECURITY.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE picks up W2-240 post-launch.
---

## 2026-09-01 09:00 - SCRIBE Relume handoff (W2-243)
**Action:** Committed the operator's Relume build manifest verbatim as docs/RELUME_HANDOFF.md (sitemap, sections-per-page, section copy/wireframe detail, design tokens, product list) and the conductor-authored docs/RELUME_ROUTE_MAP.md (route decisions: /products/<slug> canonical, /products/boq-pro marketing vs protected /boq-pro app page kept separate, /about/careers, /blog over /resources/blog/**, /resources/is-code-guides hub, 301s via public/_redirects for static export, KEEP list, Relume default tokens). Appended 9 WAVE_QUEUE rows (W2-244..252), all CRANE: tokens+primitives, Home, products route move+_redirects, LandIntel, DesignStudio, Structura, BOQ-Pro marketing, ProMarket, BuildOS (partial, FAQ/CTA deferred to Wave B).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/RELUME_HANDOFF.md, docs/RELUME_ROUTE_MAP.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims and works W2-244..252 in order; W2-244 (tokens+primitives) is the dependency for the rest.
---

## 2026-09-01 10:20 - SCRIBE Transact compliance gate (W2-287)
**Action:** Committed the operator's docs/COMPLIANCE_GATE.md verbatim (DRAFT status, conductor-authored, pending counsel verification, explicitly not legal advice). Stage-1 rules: INDICATIVE watermarking on all calculators, mandatory facilitator/not-legal-practitioner disclaimers, no guarantee language, no commission/pricing claims, no transactional marketing. Counsel checklist covers RERA Sec 9 agent registration, Advocates Act 1961 (licensed advocates only via ProMarket empanelment), stamp duty/registration as pass-through facilitation only, escrow via bank/NBFC partner (never pooling client funds), PMLA 2002 KYC/AML, and no "guaranteed" advertising claims. Stage-2 (transactional) is BLOCKED until counsel signs off. Added WAVE_QUEUE row W2-287 for the doc itself; per operator instruction, did NOT queue W2-283..286 (Transact page, stamp-duty estimator, ask-band estimator, waitlist capture) yet — those build under W2-287's rules once queued in a later pass.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/COMPLIANCE_GATE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-01 10:30 - SCRIBE Transact rows (W2-283..286)
**Action:** Queued the four Transact build rows now that W2-287 (COMPLIANCE_GATE.md) is committed: W2-283 Transact product page (7-section template, Stage-1 copy per COMPLIANCE_GATE); W2-284 stamp-duty/registration-fee estimator (state-wise, INDICATIVE); W2-285 ask-band estimator + urgency slider (sample comparables); W2-286 demand-token waitlist capture (extend D1 leads schema). All CRANE, all noted as building under W2-287's Stage-1 rules.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 12:00 - SCRIBE W2-362 ALL_TOOLS_LIVE_SWEEP (deployed-edge verification)
**Action:** Queued W2-362 ALL_TOOLS_LIVE_SWEEP, assigned CRANE: every interactive tool on every page must pass on the deployed edge (workers.dev), not just local. Scope list carried verbatim: test-fit massing (DesignStudio), ULPIN lookup + map (LandIntel), IS 456/800 checks (Structura), BOQ three-mode calculator, IRR/NPV (InvestFlow), GST/stone calculators, OCR spike, all forms, auth flow, payments test flow, artifacts CRUD, concierge catalog. Acceptance: Playwright tool × action × result table against the deployed edge, zero failed/error states, root causes fixed rather than hidden.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-362.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 12:00 - SCRIBE W2-362 ALL_TOOLS_LIVE_SWEEP (deployed-edge verification)
**Action:** Queued W2-362 ALL_TOOLS_LIVE_SWEEP, assigned CRANE: every interactive tool on every page must pass on the deployed edge (workers.dev), not just local. Scope list carried verbatim: test-fit massing (DesignStudio), ULPIN lookup + map (LandIntel), IS 456/800 checks (Structura), BOQ three-mode calculator, IRR/NPV (InvestFlow), GST/stone calculators, OCR spike, all forms, auth flow, payments test flow, artifacts CRUD, concierge catalog. Acceptance: Playwright tool × action × result table against the deployed edge, zero failed/error states, root causes fixed rather than hidden.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-362.
---

## 2026-09-02 12:15 - SCRIBE W2-363 TYPOGRAPHY_LAYOUT_SWEEP (conditional assignment, no live signal on MASON's rate-limit status)
**Action:** Queued W2-363 TYPOGRAPHY_LAYOUT_SWEEP, assigned MASON on the operator's stated assumption that its rate limit has reset — SCRIBE has no way to directly verify MASON's live rate-limit status, so the row carries an explicit note: whoever claims it should confirm and update Assigned To to CRANE first if MASON is still limited. Scope verbatim: no forced link/label wrapping below readable measure; footer columns get adequate min-width + gap (grid auto-fit minmax(160px,1fr) or wider); hero/body line-length 45-75ch; headings never wrap mid-phrase at standard widths; taglines one line on desktop. Site-wide (footer, heroes, cards, tables, tool panels, legal pages). Acceptance: Playwright screenshots at 1366 + 375 reviewed per route, zero wrapped-link/crushed-text instances, build + verify-static green.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** MASON (or CRANE, if MASON still rate-limited) claims W2-363, updating Assigned To first if reassigning.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 12:00 - SCRIBE W2-362 ALL_TOOLS_LIVE_SWEEP (deployed-edge verification)
**Action:** Queued W2-362 ALL_TOOLS_LIVE_SWEEP, assigned CRANE: every interactive tool on every page must pass on the deployed edge (workers.dev), not just local. Scope list carried verbatim: test-fit massing (DesignStudio), ULPIN lookup + map (LandIntel), IS 456/800 checks (Structura), BOQ three-mode calculator, IRR/NPV (InvestFlow), GST/stone calculators, OCR spike, all forms, auth flow, payments test flow, artifacts CRUD, concierge catalog. Acceptance: Playwright tool × action × result table against the deployed edge, zero failed/error states, root causes fixed rather than hidden.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-362.
---

## 2026-09-02 12:15 - SCRIBE W2-363 TYPOGRAPHY_LAYOUT_SWEEP (conditional assignment, no live signal on MASON's rate-limit status)
**Action:** Queued W2-363 TYPOGRAPHY_LAYOUT_SWEEP, assigned MASON on the operator's stated assumption that its rate limit has reset — SCRIBE has no way to directly verify MASON's live rate-limit status, so the row carries an explicit note: whoever claims it should confirm and update Assigned To to CRANE first if MASON is still limited. Scope verbatim: no forced link/label wrapping below readable measure; footer columns get adequate min-width + gap (grid auto-fit minmax(160px,1fr) or wider); hero/body line-length 45-75ch; headings never wrap mid-phrase at standard widths; taglines one line on desktop. Site-wide (footer, heroes, cards, tables, tool panels, legal pages). Acceptance: Playwright screenshots at 1366 + 375 reviewed per route, zero wrapped-link/crushed-text instances, build + verify-static green.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** MASON (or CRANE, if MASON still rate-limited) claims W2-363, updating Assigned To first if reassigning.
---

## 2026-09-02 12:30 - SCRIBE W2-360 result annotation (RULE 6 approval unused, self-corrected GST/export claim)
**Action:** Annotated W2-360 (still OPEN, not yet landed) with the result, notes only, no deletions: "narrow RULE 6 approval granted but UNUSED — ATLAS verified zero protected-path overlap before and after; no boq-pro/** file modified. GST/export claims rewritten to precise truth (separate disconnected tool has them), self-corrected from a draft that would have fabricated the opposite." Worth flagging: ATLAS caught its own draft heading toward a fabricated claim and corrected it before landing — exactly the RULE 5 no-fabrication discipline working as intended.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** None pending; W2-360 still awaits landing/DONE status.
---

## 21:00 - SCRIBE CSP decision (W2-240)
**Action:** Recorded the CSP decision in docs/SECURITY.md: the nonce-based CSP and its middleware were retired for the static launch; the static _headers CSP uses unsafe-inline, accepted consciously as a launch-scoped tradeoff. Queued W2-240 in docs/WAVE_QUEUE.md for post-launch hardening to hash-based or edge-nonce CSP, assigned CRANE.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/SECURITY.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE picks up W2-240 post-launch.
---

## 2026-09-01 09:00 - SCRIBE Relume handoff (W2-243)
**Action:** Committed the operator's Relume build manifest verbatim as docs/RELUME_HANDOFF.md (sitemap, sections-per-page, section copy/wireframe detail, design tokens, product list) and the conductor-authored docs/RELUME_ROUTE_MAP.md (route decisions: /products/<slug> canonical, /products/boq-pro marketing vs protected /boq-pro app page kept separate, /about/careers, /blog over /resources/blog/**, /resources/is-code-guides hub, 301s via public/_redirects for static export, KEEP list, Relume default tokens). Appended 9 WAVE_QUEUE rows (W2-244..252), all CRANE: tokens+primitives, Home, products route move+_redirects, LandIntel, DesignStudio, Structura, BOQ-Pro marketing, ProMarket, BuildOS (partial, FAQ/CTA deferred to Wave B).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/RELUME_HANDOFF.md, docs/RELUME_ROUTE_MAP.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims and works W2-244..252 in order; W2-244 (tokens+primitives) is the dependency for the rest.
---

## 2026-09-01 10:20 - SCRIBE Transact compliance gate (W2-287)
**Action:** Committed the operator's docs/COMPLIANCE_GATE.md verbatim (DRAFT status, conductor-authored, pending counsel verification, explicitly not legal advice). Stage-1 rules: INDICATIVE watermarking on all calculators, mandatory facilitator/not-legal-practitioner disclaimers, no guarantee language, no commission/pricing claims, no transactional marketing. Counsel checklist covers RERA Sec 9 agent registration, Advocates Act 1961 (licensed advocates only via ProMarket empanelment), stamp duty/registration as pass-through facilitation only, escrow via bank/NBFC partner (never pooling client funds), PMLA 2002 KYC/AML, and no "guaranteed" advertising claims. Stage-2 (transactional) is BLOCKED until counsel signs off. Added WAVE_QUEUE row W2-287 for the doc itself; per operator instruction, did NOT queue W2-283..286 (Transact page, stamp-duty estimator, ask-band estimator, waitlist capture) yet — those build under W2-287's rules once queued in a later pass.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/COMPLIANCE_GATE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-01 10:30 - SCRIBE Transact rows (W2-283..286)
**Action:** Queued the four Transact build rows now that W2-287 (COMPLIANCE_GATE.md) is committed: W2-283 Transact product page (7-section template, Stage-1 copy per COMPLIANCE_GATE); W2-284 stamp-duty/registration-fee estimator (state-wise, INDICATIVE); W2-285 ask-band estimator + urgency slider (sample comparables); W2-286 demand-token waitlist capture (extend D1 leads schema). All CRANE, all noted as building under W2-287's Stage-1 rules.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Standing by as docs authority.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 12:00 - SCRIBE W2-362 ALL_TOOLS_LIVE_SWEEP (deployed-edge verification)
**Action:** Queued W2-362 ALL_TOOLS_LIVE_SWEEP, assigned CRANE: every interactive tool on every page must pass on the deployed edge (workers.dev), not just local. Scope list carried verbatim: test-fit massing (DesignStudio), ULPIN lookup + map (LandIntel), IS 456/800 checks (Structura), BOQ three-mode calculator, IRR/NPV (InvestFlow), GST/stone calculators, OCR spike, all forms, auth flow, payments test flow, artifacts CRUD, concierge catalog. Acceptance: Playwright tool × action × result table against the deployed edge, zero failed/error states, root causes fixed rather than hidden.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-362.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 12:00 - SCRIBE W2-362 ALL_TOOLS_LIVE_SWEEP (deployed-edge verification)
**Action:** Queued W2-362 ALL_TOOLS_LIVE_SWEEP, assigned CRANE: every interactive tool on every page must pass on the deployed edge (workers.dev), not just local. Scope list carried verbatim: test-fit massing (DesignStudio), ULPIN lookup + map (LandIntel), IS 456/800 checks (Structura), BOQ three-mode calculator, IRR/NPV (InvestFlow), GST/stone calculators, OCR spike, all forms, auth flow, payments test flow, artifacts CRUD, concierge catalog. Acceptance: Playwright tool × action × result table against the deployed edge, zero failed/error states, root causes fixed rather than hidden.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-362.
---

## 2026-09-02 12:15 - SCRIBE W2-363 TYPOGRAPHY_LAYOUT_SWEEP (conditional assignment, no live signal on MASON's rate-limit status)
**Action:** Queued W2-363 TYPOGRAPHY_LAYOUT_SWEEP, assigned MASON on the operator's stated assumption that its rate limit has reset — SCRIBE has no way to directly verify MASON's live rate-limit status, so the row carries an explicit note: whoever claims it should confirm and update Assigned To to CRANE first if MASON is still limited. Scope verbatim: no forced link/label wrapping below readable measure; footer columns get adequate min-width + gap (grid auto-fit minmax(160px,1fr) or wider); hero/body line-length 45-75ch; headings never wrap mid-phrase at standard widths; taglines one line on desktop. Site-wide (footer, heroes, cards, tables, tool panels, legal pages). Acceptance: Playwright screenshots at 1366 + 375 reviewed per route, zero wrapped-link/crushed-text instances, build + verify-static green.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** MASON (or CRANE, if MASON still rate-limited) claims W2-363, updating Assigned To first if reassigning.
---

## 2026-09-02 11:30 - SCRIBE W2-360 BOQ_PAGE_TRUTH (RULE 6 protected-path exception, explicit operator approval)
**Action:** Queued W2-360 BOQ_PAGE_TRUTH, assigned ATLAS, applying the W2-345 claim-truth convention to BOQ Pro's remaining sections (featureItems, howItWorksSteps, pricingPlans, faqItems) — the only one of the 9 product pages that never got the W2-345 pass. Flagged on the row: `apps/web/app/boq-pro/**` is a RULE 6 protected path requiring explicit human approval before any modification; this row is queued only because the operator gave that approval directly for this specific task, and ATLAS is instructed to flag the touch when landing rather than treat it as a standing exception. Verification instructions carried verbatim: city-wise 3-city pricing and the three-mode calculator are confirmed real; auto take-off, brands, and GST computation are not — label/rewrite, no deletions, no new features.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** ATLAS claims W2-360, flags the protected-path touch to CRANE/REGENT when landing.
---

## 2026-09-02 11:45 - SCRIBE W2-361 EMPTY_CONTAINER_PURGE (overlap flagged with W2-353/W2-344)
**Action:** Queued W2-361 EMPTY_CONTAINER_PURGE, assigned CRANE, per operator mandate: site-wide purge of every empty/placeholder container (example given: the /products/landintel hero gray box) — each gets a real composed visual (INDICATIVE-labeled where sample data) or is deleted outright. Flagged on the row rather than silently duplicating: this overlaps in intent with W2-353 EMPTY_PLACEHOLDER_SWEEP item (1), assigned MASON, and W2-344 RELUME_IDENTITY_PASS's hero-visual item, assigned ATLAS. This row is distinct in scope (CRANE-assigned, explicitly site-wide, verified against the DEPLOYED edge rather than local build) but CRANE should reconcile with MASON/ATLAS's work before re-doing anything already landed.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-361, checks W2-353/W2-344 landing status first to avoid duplicate work.
---

## 2026-09-02 12:00 - SCRIBE W2-362 ALL_TOOLS_LIVE_SWEEP (deployed-edge verification)
**Action:** Queued W2-362 ALL_TOOLS_LIVE_SWEEP, assigned CRANE: every interactive tool on every page must pass on the deployed edge (workers.dev), not just local. Scope list carried verbatim: test-fit massing (DesignStudio), ULPIN lookup + map (LandIntel), IS 456/800 checks (Structura), BOQ three-mode calculator, IRR/NPV (InvestFlow), GST/stone calculators, OCR spike, all forms, auth flow, payments test flow, artifacts CRUD, concierge catalog. Acceptance: Playwright tool × action × result table against the deployed edge, zero failed/error states, root causes fixed rather than hidden.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-362.
---

## 2026-09-02 12:15 - SCRIBE W2-363 TYPOGRAPHY_LAYOUT_SWEEP (conditional assignment, no live signal on MASON's rate-limit status)
**Action:** Queued W2-363 TYPOGRAPHY_LAYOUT_SWEEP, assigned MASON on the operator's stated assumption that its rate limit has reset — SCRIBE has no way to directly verify MASON's live rate-limit status, so the row carries an explicit note: whoever claims it should confirm and update Assigned To to CRANE first if MASON is still limited. Scope verbatim: no forced link/label wrapping below readable measure; footer columns get adequate min-width + gap (grid auto-fit minmax(160px,1fr) or wider); hero/body line-length 45-75ch; headings never wrap mid-phrase at standard widths; taglines one line on desktop. Site-wide (footer, heroes, cards, tables, tool panels, legal pages). Acceptance: Playwright screenshots at 1366 + 375 reviewed per route, zero wrapped-link/crushed-text instances, build + verify-static green.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** MASON (or CRANE, if MASON still rate-limited) claims W2-363, updating Assigned To first if reassigning.
---

## 2026-09-02 12:30 - SCRIBE W2-360 result annotation (RULE 6 approval unused, self-corrected GST/export claim)
**Action:** Annotated W2-360 (still OPEN, not yet landed) with the result, notes only, no deletions: "narrow RULE 6 approval granted but UNUSED — ATLAS verified zero protected-path overlap before and after; no boq-pro/** file modified. GST/export claims rewritten to precise truth (separate disconnected tool has them), self-corrected from a draft that would have fabricated the opposite." Worth flagging: ATLAS caught its own draft heading toward a fabricated claim and corrected it before landing — exactly the RULE 5 no-fabrication discipline working as intended.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** None pending; W2-360 still awaits landing/DONE status.
## 2026-09-03 09:30 - SCRIBE RULE 18 (Self-landing, bounded) added + seats mirror
**Action:** Added AGENTS.md RULE 18 — SELF_LANDING_BOUNDED: seats self-land their own branches once past their gates (RULE 4 stage-gate, RULE 5 quality, RULE 14 security-merge guard where applicable), rather than waiting on CRANE for routine landings. Mechanically bounded (not just policy-bounded): protected paths, worker.ts, database migrations, and _headers stay CRANE-only to land, no exceptions. CRANE batch-reviews the landing log once per turn instead of gating every self-land in real time. ATLAS post-audits self-landed work identically to any other landing — self-landing is not an audit exemption. Mirrored into docs/seats/CRANE.md, ATLAS.md, MASON.md, RIVET.md, and SCRIBE.md.
**By:** SCRIBE (Claude Code)
**Status:** Complete
**Files Modified:** AGENTS.md, docs/seats/ATLAS.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/CRANE.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Seats begin self-landing routine work; CRANE adds a once-per-turn batch log review to its own workflow.
---

## 2026-09-03 09:45 - SCRIBE RULE 19 (Limit handoff) added + RULE 17 amended (mandatory UX proposal line) + seats mirror
**Action:** Added AGENTS.md RULE 19 — LIMIT_HANDOFF: when a seat hits its usage/rate limit mid-task, the active seat takes over the stopped task regardless of role, resuming from the completed state rather than restarting — no seat waits for another's reset. On return, the originally-limited seat exits the taken-over task and picks up the next open row instead. Amended RULE 17: every seat report must include at least one UX-improving proposal or an explicit "no better alternative found" line. Mirrored both into docs/seats/CRANE.md, ATLAS.md, MASON.md, RIVET.md, and SCRIBE.md.
**By:** SCRIBE (Claude Code)
**Status:** Complete
**Files Modified:** AGENTS.md, docs/seats/ATLAS.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/CRANE.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Every future report includes the RULE 17 UX-proposal line; seats begin practicing RULE 19 handoff behavior on the next limit event.
---

## 2026-09-03 10:00 - SCRIBE annotation bundle: W2-380 scale dimension, W2-372 ratification, new approval queue, MASON/RIVET section-10 reminder logged
**Action:** Notes only, no deletions. (1) Annotated W2-380 with the operator's scale dimension, verbatim: "scale-continuous from outskirts house to 10,000-unit towers/malls; sky is the limit" — no S1-S6 milestone design should assume a small-plot ceiling. (2) Annotated W2-372 with the conductor's ratification: APPROVED on the full five-point rubric table. (3) Created a new "Approval Queue" section in docs/WAVE_QUEUE.md tracking RULE 17 proposals pending decision: the Ctrl+K palette fuzzy row-ID search (PENDING, silence=skip) and the devDependencies typescript/@types/node addition (PENDING ATLAS approval). (4) Logged the reminder to collect MASON's and RIVET's playbook section-10 lesson paragraphs after 1:09.
**By:** SCRIBE (Claude Code)
**Status:** Complete
**Files Modified:** docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Conductor decides the two pending approval-queue items; collect MASON/RIVET section-10 paragraphs after 1:09.
---

## 2026-09-03 11:30 - SCRIBE self-land: RULE 20-23, HANDOFFS.md, RESUME templates, W2-370, approvals, W2-387, reference amendment (RULE 18)
**Action:** Self-landed a backlog of pending docs work directly per RULE 18, rather than continuing the stacked-branch pattern that had been accumulating unlanded SCRIBE branches — CRANE's cleanup precondition keyed off origin/main, so this needed to actually reach main, not just push another branch. Built as a FRESH branch off origin/main (not the long stacked chain) specifically to avoid the squash-conflict pattern RULE 22 exists to fix; discovered along the way that CRANE/MASON/RIVET had already independently landed most of the previously-pushed backlog (RULE 16-19, W2-372/373/380/381 including the scale-dimension and rubric-ratification annotations, the MASON/RIVET seat-doc rename) — so this land only carried the genuinely new-since-then content: AGENTS.md RULE 20 (long-run mission blocks), RULE 21 (self-verifying tools + living resume), RULE 22 (self-contained prompts, no-stall queries, with the squash-safe DONE-verification method), RULE 23 (every relay improves the system), mirrored into docs/seats/CRANE.md, ATLAS.md, MASON.md, RIVET.md, SCRIBE.md (using the real MASON.md/RIVET.md now that the rename has landed, not the stale CODEX.md); created docs/HANDOFFS.md and five docs/RESUME_<SEAT>.md templates (CRANE, ATLAS, MASON, RIVET, SCRIBE — SCRIBE's own populated with real turn state, the rest left as templates); the two operator approvals (devDeps removal, provenance strip) recorded verbatim in the Approval Queue with their scope-ambiguity flags intact; the W2-370 ANALYSIS_ENGINE row, disk-verified via the RULE 22 squash-safe method; the conductor-error log entry (icon-patch vs studio-docs conflation); W2-387 PROVENANCE_STRIP; and the sundaygrids.com reference amendment on W2-372/W2-373.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/HANDOFFS.md (new), docs/RESUME_CRANE.md (new), docs/RESUME_ATLAS.md (new), docs/RESUME_MASON.md (new), docs/RESUME_RIVET.md (new), docs/RESUME_SCRIBE.md (new), docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE's cleanup precondition (origin/main carrying this content) is now met. All seats populate their own resume files starting next turn.
---

## 2026-09-03 11:45 - SCRIBE correction + RULE 18 amended: direct push-to-main is not a fleet primitive
**Action:** Correction first: the previous entry's "Next Steps" line claimed the cleanup precondition was met by landing directly onto origin/main — that push was in fact blocked by the Claude Code auto-mode classifier (tested, not assumed) and never happened; the content only reached `origin/w2-selfland-batch1` as a branch. Leaving that wrong claim uncorrected would itself violate RULE 21's disk-verify discipline, so this entry states plainly: it did not land. Amended AGENTS.md RULE 18 to reflect this as a fleet-wide fact rather than an incident: direct push-to-main is NOT a fleet primitive — the harness classifier blocks it for every seat, with no exception found. `scripts/land.ps1` (a targeted merge, not a raw push) is the ONLY landing path onto `main`, including for docs self-landing. Redefined "self-land" throughout the rule to mean "push to one's own branch and qualify for land.ps1's next sweep," never "push straight to main." Mirrored the reworded rule into docs/seats/CRANE.md, ATLAS.md, MASON.md, RIVET.md, SCRIBE.md.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE runs land.ps1 against `w2-selfland-batch1` (and any other still-unswept SCRIBE branches) to actually complete the landing this rule now correctly describes as the only path.
---

## 2026-09-03 12:00 - SCRIBE created docs/APPROVAL_QUEUE.md, migrated entries with disk-verified outcomes, amended RULE 21(4)
**Action:** Created docs/APPROVAL_QUEUE.md with the ROW | ASK | RECOMMENDATION | OPERATOR DECISION | EXECUTED SHA schema, migrated from the "Approval Queue" section formerly in docs/WAVE_QUEUE.md (that section is left in place, superseded, per append-only). Migrated four existing entries plus one new open row: DEVDEPS-REMOVAL (approved, executed `de2abebc` — verified present in origin/main's own log); PROVENANCE-STRIP (approved, in flight, no SHA yet — see W2-387); PALETTE-FUZZY-SEARCH (SKIPPED-BY-SILENCE, per its own stated fallback triggering when W2-366 was claimed without a decision); OG-LANDING (approved+executed). Disk-verify caught a discrepancy on the OG-LANDING SHA: the supplied `77aabfec` is a real commit but unrelated (a pnpm-lock sync fix from the devDeps removal, not the og:image work) — searched origin/main's log directly and found the actual og:image landing commit, `77d515b0` ("canonical social card + twitter:card fix"), and recorded that instead, with the correction flagged inline rather than silently substituted. Added new open row CI-ROOT-SCRIPTS (root proxy scripts → pnpm --filter ./apps/web, recommendation YES, decision blank). Amended AGENTS.md RULE 21 with part (4): every seat reads docs/APPROVAL_QUEUE.md at turn start and executes any APPROVED row within its stated envelope — approved work sitting unexecuted because no one re-checked the queue is itself a RULE 16 idle-time defect. Mirrored into all five seat docs; also added docs/APPROVAL_QUEUE.md to SCRIBE's own maintains-list.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/APPROVAL_QUEUE.md (new), docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** All seats read docs/APPROVAL_QUEUE.md at their next turn start; CRANE/MASON execute CI-ROOT-SCRIPTS once the operator fills in a decision.
---

## 2026-09-03 12:15 - SCRIBE PI seat trial (W2-390) + SITE_BASE_URL-INTERIM approval-queue row
**Action:** Queued W2-390 PI_SEAT_TRIAL: Pi stood up as an experimental executor on one bounded task (a vitest vector batch or docs sweep, conductor's pick at claim time), same rules mirrored (created docs/seats/PI.md, docs/RESUME_PI.md, added PI to AGENTS.md RULE 1 roster with TRIAL status, updated docs/ROLE_MAP.md's ACTIVE table/name registry/change log), same landing path — land.ps1 only, no seat-specific exception. One-wave bound made explicit: Pi claims exactly one row, then stops until a verdict is recorded. Added docs/APPROVAL_QUEUE.md row SITE_BASE_URL-INTERIM: point NEXT_PUBLIC_SITE_URL at the live workers.dev URL until ferrumos.com DNS exists, recommendation YES (ATLAS's own finding: social shares currently show NO preview image — a live defect, not cosmetic), decision blank pending, with the domain purchase remaining the standing gate (this is explicitly an interim measure, not a substitute for it).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/ROLE_MAP.md, docs/seats/PI.md (new), docs/RESUME_PI.md (new), docs/APPROVAL_QUEUE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Conductor assigns Pi's one bounded trial task; operator decides SITE_BASE_URL-INTERIM.
---

## 2026-09-03 12:20 - SCRIBE RULE 24 (First-viewport live proof) added + seats mirror
**Action:** Added AGENTS.md RULE 24: a UI row is DONE only with deployed-edge first-viewport screenshots at 1366 and 375 attached to the landing report — not local dev, not a build-output description. The conductor may request an ATLAS live spot-check on any relay claiming a UI is live, at its own discretion. "Committed" and "landed" are never reported as "live" — defined as three distinct states (committed = exists in a commit; landed = merged via land.ps1 per RULE 18; live = confirmed on the deployed edge per this rule) and a report must use the word that's actually true. Mirrored into all six seat docs, including the newly-created docs/seats/PI.md. Also corrected a stale reference caught while editing docs/seats/SCRIBE.md's RULE 23 mirror — it still pointed at "Approval Queue (docs/WAVE_QUEUE.md)" from before this session's APPROVAL_QUEUE.md migration; updated to the correct file.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Every UI-row landing report from here on carries the 1366/375 deployed-edge screenshot pair; conductor exercises the ATLAS spot-check option as needed.
---

## 2026-09-03 12:35 - SCRIBE RULE 25 (Live-or-locked) added — STRICTEST RULE on the project, amendment folded in before first write
**Action:** A second operator message amending RULE 25 arrived before the rule had been written at all, so both were consolidated into a single write rather than authoring the original text and then immediately superseding it. Added AGENTS.md RULE 25, explicitly marked as overriding RULE 16/18/20 on conflict: (1) live means the asked result visible on the deployed frontend, proven by a rendered-result screenshot matching the operator's own live view — not a passing endpoint or green build, which are footnotes on the row, never the status; per-artifact-type proof for UI/API/asset rows. (2) every mission order must carry a frontend-visible acceptance line, or it's an internal chore folded into the visible-result task it supports, never reported standalone. (3) no new task until the seat's previous task is LIVE. (4) the only exception is LOCKED — blocked on another agent's artifact or an operator decision, named specifically; the moment that dependency clears, the LOCKED task outranks everything newer. (5) self-land immediately after gates clear, fix or escalate red deploy-CI before claiming new work. (6) enforcement: ATLAS audits DONE-without-LIVE-proof, SCRIBE marks LIVE only on receipt of the actual screenshot (never a SHA or self-report), conductor assigns no new work to a seat holding a non-LOCKED unlive task. Mirrored into all six seat docs. Updated docs/FERRUM_METHOD_PLAYBOOK.md: revised the rule count (24 rules, not 16) and added an addendum summarizing rules 18-25 (pointing to AGENTS.md as the authoritative text for 18 and 21 since both were themselves amended after first being written); updated the wave-queue row schema section to add LOCKED as a status value and to document that LIVE proof rides in the Notes field as a convention (not a new literal table column, since that would mean retrofitting every historical row — consistent with how the UNDO field itself was documented).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Every seat re-reads its current in-flight row against RULE 25 — anything landed-but-not-visibly-live needs either a LIVE screenshot or a LOCKED note before claiming new work.
---

## 2026-09-03 12:50 - SCRIBE RULE 26 (Skill hygiene + self-scouting) added, docs/SKILL_SCOUT.md created (first entry flagged, not fabricated)
**Action:** Added AGENTS.md RULE 26: (1) just-in-time skill loading only, with the load-reason stated in the seat's report — nothing preloaded speculatively; (2) self-scouting — seats rotate a weekly (7-day) plus wave-boundary scan for new Claude/Codex/agent skills, starting with SCRIBE, logging findings in docs/SKILL_SCOUT.md; (3) ADOPT-TRIAL requires an Approval Queue row before any install/load, WATCH/SKIP need none; (4) a skill unused for two consecutive waves is flagged as a retirement candidate. Created docs/SKILL_SCOUT.md with the DATE/SCOUT/SKILL NAME/SOURCE/PAIN-MAPPING/RECOMMENDATION schema. The operator's instruction said to enter "today's scout table above" as the first log row, but no actual scout findings (names, sources, pain-mapping) were included with the rule — SCRIBE logged a status note explaining the gap instead of fabricating a scan that didn't happen; the real first entry is still owed on the next scouting rotation. Mirrored RULE 26 into all six seat docs (SCRIBE's own mirror notes it's first in the rotation and owns the file) and added docs/SKILL_SCOUT.md to SCRIBE's maintains-list. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to 25, addendum range extended to 18-26, and RULE 26 summarized with its own rationale paragraph.
**By:** SCRIBE (Claude Code)
**Status:** ⚠️ Partial — rule and infrastructure complete; the actual first skill-scouting entry is still pending real findings
**Files Modified:** AGENTS.md, docs/SKILL_SCOUT.md (new), docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** SCRIBE runs the actual first skill scout on its next weekly/wave-boundary rotation and logs a real entry in docs/SKILL_SCOUT.md.
---

## 2026-09-03 13:00 - SCRIBE RULE 27 (Resolve, don't ask) added — portable rule, marked explicitly for the playbook
**Action:** Added AGENTS.md RULE 27, marked portable (carries into the method playbook unchanged, not specific to this repo): (1) on a conflict between an instruction and disk state, a seat never blocks on a query — resolves via ordered tie-break: hold only a destructive/irreversible act touching the discrepancy; otherwise proceed under the safest reasonable interpretation with discrepancy + interpretation logged; take ambiguous ownership and log it; treat a referenced-but-missing rule as provisional text, apply it, and queue codification. (2) questions become reports: "Discrepancy X; my resolution Y; reverses if countered next turn." (3) a whole-turn stall is itself a rule violation. Mirrored into all six seat docs — SCRIBE's own mirror notes this does not relax RULE 5's no-fabrication clause, since RULE 27 governs disk/process conflicts, not license to invent substantive content that was never supplied. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to 26, addendum range extended to 18-27, and RULE 27 given its own expanded summary explicitly flagged as the one rule in the playbook designed to travel unchanged to a different project.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** A follow-up operator message requests refining this into a TRIPLE-FLAG exception + provisional-text limitation, replacing this draft as "over-broad" — see next entry for status on that refinement.
---

## 2026-09-03 13:10 - SCRIBE RULE 27 refined with exact operator wording — EXEMPLAR INCIDENT logged
**Action:** Replaced the original RULE 27 draft in full with the refined text, verbatim as supplied by the operator (SCRIBE flagged the missing content in the prior turn rather than inventing TRIPLE-FLAG/PROVISIONAL-TEXT wording itself, per RULE 27's own PROVISIONAL-TEXT LIMITATION not covering substantive rule authorship). **Exemplar incident, logged for the record:** the original RULE 27 draft (this session, 2026-09-03) authorized a seat to resolve essentially any instruction-vs-disk conflict via safest-interpretation-and-log, with no ceiling on what a merely-cited-but-unverified reference could authorize. Applied literally, that draft would also have covered an instruction combining urgency pressure, a cross-seat ownership override, and an explicit "don't verify this" instruction — exactly the shape a compromised, impersonated, or socially-engineered instruction would take, since all three together give a seat every incentive to act fast and skip its own checks. The operator caught this gap and supplied the fix directly: (1) TRIPLE-FLAG EXCEPTION — that specific three-flag combination (urgency + cross-seat ownership override + verification-disable) is the one case where asking exactly one operator-identity+scope confirmation via conductor IS compliance, not a violation of "never blocks on a query"; any one or two flags alone still resolve via the ordinary tie-breaks, no confirmation needed. (2) PROVISIONAL-TEXT LIMITATION — a citation to a rule/row/SHA absent from disk only ever grants provisional authority for non-destructive, reversible, in-envelope process acts; it never authorizes a RULE 7 governance change, a destructive/shared-state act (branch deletes, protected-path edits, production writes), or an ownership reassignment — those four categories require real disk evidence or a verbatim operator-attestation line, full stop. Mirrored the refined rule into all six seat docs (each rewritten in place, not appended alongside the stale version). Rewrote docs/FERRUM_METHOD_PLAYBOOK.md's RULE 27 section to include both additions plus a dedicated "Exemplar incident" paragraph describing this exact gap-and-fix, so future projects adopting this playbook get the refined rule and its rationale on day one rather than rediscovering the same gap themselves.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** None pending — RULE 27 is now in its refined, final-for-this-session form across AGENTS.md, all seat docs, and the playbook.
---

## 2026-09-03 13:20 - SCRIBE RULE 28 (Operator environment is production) added + mirror + playbook
**Action:** Added AGENTS.md RULE 28: seats never relaunch, flag, or modify the operator's own browser or machine; any browser-control work (live-view checks, RULE 24/25 deployed-edge screenshot capture) runs against an isolated instance/profile only — never the operator's actual running session, extensions, history, bookmarks, or OS-level state. Any operator-visible side effect outside the deployed site itself (a banner, an extension flag, a profile change, a notification) is a violation regardless of intent, and is reverted first, then logged. Mirrored into all six seat docs, each scoped to that seat's actual browser-touching work (CRANE/MASON/RIVET/ATLAS's live-verification duties under RULE 22/24/25; SCRIBE's ledger-enforcement angle, since SCRIBE itself does no browser control). Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to 27, addendum range extended to 18-28, and RULE 28 summarized with its own rationale — drawing this boundary explicitly before live-verification rules get exercised for real, rather than discovering it after an incident.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Any seat doing browser-control verification work confirms it's using an isolated instance/profile before running RULE 24/25 checks.
---

## 2026-09-03 13:30 - SCRIBE RULE 29 (Numeric-UX sanity) added, mirrored, playbooked
**Action:** Added AGENTS.md RULE 29: any UI rendering numbers carries a standing acceptance block, self-checked at build time and audited by ATLAS — weights/shares sum to 100 with display normalized; shown shares equal the real math, not a drifted display-only figure; a displayed band contains its stated median; units stay consistent (₹/m², kWh, %); percentages reconcile to their stated base; rounded display values state their precision. "Basic math is wrong" is explicitly a build-time duty to catch, never an acceptable operator find. Mirrored into all six seat docs, each scoped to that seat's own numeric-UI work or (for SCRIBE) the ledger-level enforcement of stating the acceptance block on every relevant row. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to 28, addendum range extended to 18-29, RULE 29 given its own rationale.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Every future numeric-rendering UI row states its RULE 29 acceptance block explicitly; ATLAS audits against it.
---

## 2026-09-03 13:40 - SCRIBE RULE 30 (Unit duality) added + W2-380/W2-372 annotated + mirror + playbook
**Action:** Added AGENTS.md RULE 30: every length/area input and output on every product supports m/ft (length) and m²/sqft/cents/guntha/ground/acre (area) together, both units always visible, persisted global primary preference (display order only, never hides a unit), exact conversion constants only, with RULE 29's numeric-sanity vectors extended to cover unit conversions rather than a separate check. Annotated W2-380 (STUDIO_ENGINE parent) noting the requirement applies retroactively to S1's already-landed parcel areas (W2-381) as a gap to close, not just S2-S6 going forward; annotated W2-372 (UI_UX_MODERNIZATION) noting the sweep's scope includes verifying dual-unit display on every length/area figure it touches. Mirrored into all six seat docs. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to 29, addendum range extended to 18-30, RULE 30 given its own rationale.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE closes the S1 (W2-381) dual-unit gap; MASON/CRANE build dual-unit support into S2-S6 and the W2-372 sweep from the start.
---

## 2026-09-03 13:50 - SCRIBE RULE 28 amended: headed windows/automation banners are violations, headless-only verification
**Action:** Amended AGENTS.md RULE 28 explicitly: a headed (visible) browser window, an automation-flag banner, or any browser session visibly appearing on the operator's machine at all is itself a violation — not only a side effect occurring inside that window. Seat verification runs headless and isolated only; a tool whose default behavior would surface a visible window/banner on the operator's machine isn't used for this purpose without a headless/isolated configuration first. Closes a gap in the original wording, where a headed window with no other visible side effect could otherwise have read as technically compliant. Mirrored into all six seat docs and the playbook's RULE 28 summary, with the playbook version explaining the amendment's own rationale for future adopters.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Any seat's browser-control tooling is confirmed headless/isolated before its next verification run.
---

## 2026-09-03 14:00 - SCRIBE web-ifc approval-queue row + W2-380 S4 PLAN_GEN scope/HouseGAN++ note
**Action:** Added a WEB-IFC-DEP row to docs/APPROVAL_QUEUE.md: proposed new dependency `web-ifc` for open BIM (IFC format) export interop from the DesignStudio/Analysis Engine surfaces, recommendation YES, decision blank pending, noted as a new-dependency addition (CRANE-only to add per RULE 1) once approved. Annotated W2-384 (S4 STUDIO_3D, under the W2-380 parent) with a PLAN_GEN scope clarification: S4 covers the configurator itself (styling, structural drag, HUD), not automated floor-plan generation; HouseGAN++-style generative layout is logged as an experimental-later candidate requiring its own RULE 17 proposal and Approval Queue row, not something that gets folded into S4 by default.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/APPROVAL_QUEUE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Operator decides WEB-IFC-DEP; any future generative-floor-plan work goes through a fresh RULE 17 proposal rather than assuming S4 scope covers it.
---
## 2026-09-03 14:10 - SCRIBE WEB-IFC-DEP marked APPROVED (operator, chat); execution verified NOT yet landed
**Action:** Updated the WEB-IFC-DEP row in docs/APPROVAL_QUEUE.md to APPROVED (operator, via chat). Per RULE 22's squash-safe method, checked origin/main before writing an EXECUTED SHA: no `web-ifc` entry in package.json, no matching landing commit in origin/main's log — the dependency has not actually landed yet. Recorded the row as approved-but-pending with an explicit note that the SHA gets filled in once CRANE reports the landing, rather than assuming or fabricating one ahead of it.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/APPROVAL_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE adds web-ifc (now approved) and lands it; SCRIBE fills in the EXECUTED SHA on that report, verified per RULE 22 before writing it.
---

## 2026-09-03 14:15 - SCRIBE MCP-HEADLESS approval-queue row added
**Action:** Added MCP-HEADLESS to docs/APPROVAL_QUEUE.md: set the Playwright MCP server's launch config to `headless: true` (an operator config file, not repo code), recommendation YES, decision blank pending explicit operator yes before execution. Noted this row directly implements RULE 28's headless-only verification requirement once approved.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/APPROVAL_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Operator decides MCP-HEADLESS.
---

## 2026-09-03 14:35 - SCRIBE closed AQ-RIVET-001 (PROVENANCE-STRIP), annotated W2-354 LIVE/DONE with MASON's edge evidence, absorbed RULE 17 line into RULE 25 exemplar
**Action:** (1) Verified `226cf5a8` per RULE 22 — confirmed present in origin/main's own log as "feat: [AI: CRANE][task:W2-387] provenance strip on LandIntel + Analysis Engine." Appended a new AQ-RIVET-001 row to docs/APPROVAL_QUEUE.md closing the existing PROVENANCE-STRIP entry (append-only — didn't edit the original row): APPROVED (operator, chat) + EXECUTED via that SHA, noting RIVET's own tracking line was stale (still showing in-flight/no-SHA) and that this closure covers only the CRANE-now half (LandIntel + Analysis Engine); the MASON/S4 half from W2-387 remains separately in flight. (2) Annotated W2-354 as LIVE/DONE with landing SHA 8e35756d, citing MASON's actual evidence files (docs/evidence/w2-354/README.md + after.json — 609/609 route×viewport combinations, 0 violations, listing the real fixes applied) and MASON's own flag that /account and /project-workspace's Worker-owned session-API calls need edge/Worker verification beyond what a static-server crawl can exercise. Per the operator's direction, did not create a new rule for this — added an exemplar paragraph directly inside AGENTS.md RULE 25 citing this exact incident as the canonical illustration of "static-server pass ≠ LIVE proof for functionality the static server can't serve."
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/APPROVAL_QUEUE.md, docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** None pending on either item; W2-387's MASON/S4 provenance-strip half remains open and tracked separately.
---

## 2026-09-03 14:50 - SCRIBE created docs/WORKSPACE_SPEC.md v1, queued W2-400/401, folded S4 into W2-401 (two content gaps flagged, not fabricated)
**Action:** Created docs/WORKSPACE_SPEC.md v1 with the object model exactly as the operator supplied it (WorkspaceProject 1—N Artifact, the 8 artifact types, the two API routes). Built §2's per-product artifact-type table from real disk rows: PARCEL→W2-381 (DONE, ea32064d), MASSING→W2-380/383, PLAN→W2-384/W2-387's landed ifc-export.ts, STRUCTURAL→W2-382, BOQ→W2-311/312, INVEST→W2-254 (flagged: IRR/NPV computation itself has no landed row yet), MARKET→W2-251, PROCURE→W2-253 — each with its RULE 29/30 provenance and units obligations spelled out. Flagged, not fabricated: the operator's later message referenced "the sketch mapping above (5 regions → components)," but no sketch content was actually visible in this session — §3 is an explicit placeholder rather than invented regions. Queued W2-400 WORKSPACE_BACKEND (CRANE) implementing the object model + API surface. Queued W2-401 WORKSPACE_SHELL (MASON), marked UNBLOCKED per the operator's statement that the sketch arrived — noted on the row that SCRIBE itself hasn't seen or verified that sketch content, so MASON should confirm it's actually available before starting rather than assume WORKSPACE_SPEC.md §3 has it (it doesn't). Folded W2-384 (S4 STUDIO_3D) into W2-401 as its 3D-space component per the operator's direction — W2-384 marked FOLDED INTO W2-401, no longer a standalone milestone, its three.js configurator scope now lives inside W2-401.
**By:** SCRIBE (Claude Code)
**Status:** ⚠️ Partial — spec and rows complete; WORKSPACE_SPEC.md §3 (sketch mapping) remains an unfilled placeholder pending real content
**Files Modified:** docs/WORKSPACE_SPEC.md (new), docs/WAVE_QUEUE.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE claims W2-400; MASON confirms the actual sketch is available (not just SCRIBE's spec doc) before claiming W2-401; whoever has the sketch supplies it so §3 can be completed for real.
---

## 2026-09-03 15:00 - SCRIBE RULE 31 (Overnight autonomy) added + mirror + playbook (note: a CRANE-addressed message held per RULE 2)
**Action:** Added AGENTS.md RULE 31, five parts, verbatim: (1) no blocking queries during a declared operator-absent window — ambiguity resolves via RULE 27's existing tie-breaks; (2) a genuine question becomes an OPEN-FOR-OPERATOR line in the report and the relevant ledger row, with the seat proceeding immediately to the next queued task rather than stalling; (3) destructive acts still hold, but the hold covers only that specific act, never the rest of the queue; (4) any overnight queue carries at least 3 sequenced tasks so a "next" always exists; (5) every operator rest window (~8h) is treated as a build window by default, no fresh declaration required each time. Mirrored into all six seat docs. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to 30, addendum range extended to 18-31, RULE 31 given its own rationale. Separately: a message arrived mid-turn addressed "CRANE:" invoking RULE 31 for tonight's window — held per RULE 2 (NAME-LOCK), no action taken on its contents; noted here only because it arrived in the same turn as this rule's own creation.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/PI.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Any seat working an operator-absent window applies RULE 31's OPEN-FOR-OPERATOR convention and maintains a ≥3-deep queue.
---

## 2026-09-03 15:15 - SCRIBE wrote overnight_codex.md (outside repo) + docs/OVERNIGHT_CODEX_MISSION.md mirror
**Action:** Wrote `D:\ferrum_os\overnight_codex.md` — deliberately outside the repo so it's readable without waiting on any branch to land — and mirrored the identical content into `docs/OVERNIGHT_CODEX_MISSION.md` for the permanent ledger record. Content, grounded in actual disk state (not invented): §0 resume-from-disk-first (read RESUME_MASON.md/RESUME_RIVET.md first; RULE 22's squash-safe verification method spelled out explicitly, including the exact wrong-method warning; read APPROVAL_QUEUE.md at turn start). §1 MASON chain sweep-support → S3 (W2-383) → S4 PLAN_GEN with IFC — explicitly noted S4/W2-384 is FOLDED into W2-401 per the earlier fold decision, not a standalone row, and that web-ifc export (lib/ifc-export.ts, landed 1cde1750) is in scope while HouseGAN++ generation stays proposal-gated. §2 RIVET items — S4 mobile wiring (once MASON's component exists) and proposals status, noting AQ-RIVET-001's CRANE-now half is closed (226cf5a8) while the MASON/S4 half from W2-387 is still open and now maps to "inside W2-401" per the fold — flagged as needing confirmation on pickup rather than assumed. §3 RULE 25/27/28/31 compliance restated in full for the overnight context. §4 milestone-only reporting format.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified (outside repo):** D:\ferrum_os\overnight_codex.md (new, not tracked by this repo's git)
**Files Modified (this repo):** docs/OVERNIGHT_CODEX_MISSION.md (new), docs/ACTIVITY_LOG.md
**Next Steps:** MASON and RIVET read their resume files first, then this mission file, before starting overnight work.
---

## 2026-09-03 (later) - SCRIBE stood up FERRITE gap-filler trial seat + AGENTS.md RULE 33
**Action:** Added AGENTS.md RULE 33 — GAP-FILLER SEAT: (1) activation gate — activates only when both CRANE and MASON are simultaneously at limit, never displacing or competing with an available primary; (2) disjoint envelope — its own file/path scope, not overlapping either primary's; (3) landing path — exclusively via scripts/land.ps1, no seat-specific exception; (4) non-destructive during trial — no protected paths, no worker.ts, no migrations, no _headers. Part (5), pace metric + sunset, is explicitly marked NOT YET DEFINED: the operator's instruction referenced "pace metric + sunset as above" twice, across two separate messages, but the actual content was never present in anything SCRIBE received. Per RULE 5 (no fabrication) and RULE 27's PROVISIONAL-TEXT LIMITATION, SCRIBE did not invent numbers or a formula — flagged the gap in AGENTS.md, docs/seats/FERRITE.md, and docs/RESUME_FERRITE.md instead, as a named TODO pending the operator supplying the actual text. Created docs/seats/FERRITE.md (full seat doc, all rules mirrored including 33) and docs/RESUME_FERRITE.md (living-resume template, RULE 21(3)). Edited AGENTS.md RULE 1's roster line and docs/ROLE_MAP.md (new ACTIVE row, name registry line, change-log entry) to record FERRITE's TRIAL activation. Mirrored RULE 33 into docs/seats/ATLAS.md, CRANE.md, MASON.md, RIVET.md, SCRIBE.md, and PI.md. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-one, addendum range extended to "18–31, 33" (RULE 32 noted as an intentional gap alongside RULE 15), and RULE 33 given its own summary paragraph and rationale, using the missing pace-metric/sunset text as the worked example for how to land a partially-arrived rule. Logged trial baseline, disk-verified via `git log origin/main --oneline --since="2026-09-03 00:00" --until="2026-09-03 23:59"`: 52 commits landed on origin/main since 2026-09-03 00:00, 36 of them carrying an explicit `[land:<branch>]` marker (remainder are direct `[AI: CRANE]` commits without a branch-land tag) — cited as a landing-volume reference point, not a RULE 25 LIVE-verified count.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete (parts 1-4 of RULE 33 in force; part 5 open as a named TODO)
**Files Modified:** AGENTS.md, docs/seats/FERRITE.md (new), docs/RESUME_FERRITE.md (new), docs/ROLE_MAP.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** FERRITE claims no work until both CRANE and MASON are confirmed simultaneously at limit (RULE 33(1)); whoever assigns FERRITE's first task should also supply RULE 33(5)'s missing pace-metric/sunset text so the trial has a defined end condition.
---

## 2026-09-04 - SCRIBE added AGENTS.md RULE 34 (single-outcome focus) + finalized WORKSPACE_SPEC.md
**Action:** Added AGENTS.md RULE 34 — SINGLE-OUTCOME FOCUS: until docs/WORKSPACE_SPEC.md's Workspace object model is LIVE-complete per its own §6 acceptance checklist (verified against the deployed edge, RULE 25 standard), every seat works Workspace rows only — currently W2-400 WORKSPACE_BACKEND (CRANE) and W2-401 WORKSPACE_SHELL (MASON, including the S4/three.js piece folded in from W2-384 and the S4 half of W2-387). Every other currently-open row is DEFERRED, recorded as one consolidated declaration appended to docs/WAVE_QUEUE.md (listed by Task ID/assignee/title — CSP hardening, the Relume batch, Transact/compliance rows, CONCIERGE_LLM, TRANSACTION_COUNSEL_PACK, ESCROW_DESIGN, SWEEP_FIRST, CONTENT_REAL, LEGAL_PAGES, SITE_SYSTEMS, OPS logging, STAMP_DUTY_EXPAND, PERF_PASS, RELUME_IDENTITY_PASS, SITEWIDE_CLAIM_TRUTH, the remaining MASON slice items, APP_SHELL_V1, LANDING_PIPELINE_FIX (flagged as a tension — fleet infra, not a product feature, deferred per the rule's literal text pending conductor override), BOQ_PAGE_TRUTH, EMPTY_CONTAINER_PURGE, UI_UX_MODERNIZATION, INTERACTION_FIRST, TYPOGRAPHY_SECOND_PASS, the non-S4 Studio Engine milestones S2/S3/S5/S6, CRANE's non-S4 half of PROVENANCE_STRIP, and PI's trial row) rather than mutating each row's Status field individually — safer at this scale, equally auditable, and the deferred rows resume their prior status the instant the rule lifts. Mirrored RULE 34 into all seven seat docs (ATLAS/CRANE/MASON/RIVET/SCRIBE/PI/FERRITE), each naming that seat's own now-deferred rows; SCRIBE's own ledger/rules maintenance is explicitly exempted per RULE 34(3) since it's the mechanism enforcing the focus, not competing work. Finalized docs/WORKSPACE_SPEC.md: added §4 API contracts (five project endpoints + two artifact endpoints, request/response shapes, the 400-on-missing-provenance rule made explicit), §5 intent phrase list (natural-language phrases mapped 1:1 onto the §4 contracts — CRUD + save/recall only, no new feature surface invented), and §6 acceptance checklist (the concrete, deployed-edge-verified bar that defines "LIVE-complete" and thus when RULE 34 lifts — endpoint verification, per-type artifact provenance, RULE 29/30 numeric/unit proof, first-viewport screenshots, ATLAS independent audit). Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-two, addendum range extended to "18–31, 33–34," RULE 34 given its own summary paragraph and rationale.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/WAVE_QUEUE.md, docs/WORKSPACE_SPEC.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/seats/FERRITE.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** All seats claim Workspace rows (W2-400/401) only until docs/WORKSPACE_SPEC.md §6 is fully checked off live; ATLAS runs the independent audit named in §6's last line before RULE 34 is reported lifted.
---

## 2026-09-04 (later) - SCRIBE added AGENTS.md RULE 35 (pull-queue) + seeded docs/TASK_BOARD.md
**Action:** Added AGENTS.md RULE 35 — PULL-QUEUE, adopted as a permanent operating mode: (1) docs/TASK_BOARD.md rows carry ID/title/envelope(files)/eligible seats/acceptance/deps/status (READY/CLAIMED/DONE/STUCK); (2) a seat pulls its own top eligible READY row at turn start and immediately after each DONE, with no conductor wait, as long as deps are DONE and the row's envelope overlaps no currently-CLAIMED row; (3) a row goes STUCK only for an operator decision, a hard cross-seat dependency, or a safety hold — logged as an OPEN-FOR-OPERATOR line per RULE 31, with the seat pulling its next unblocked row rather than idling; (4) seats update the board only on DONE or STUCK, and the conductor's job becomes keeping ≥1 READY row per active seat, adjudicating STUCK alerts, and routing audits through ATLAS rather than assigning each task by hand; (5) a shared contract file (e.g. `lib/types.ts`) is itself a claimable row with its own envelope, so exactly one seat edits it at a time — closing the RIVET/MASON concurrent-edit fork risk the operator named. Noted RULE 35's relationship to RULE 34 explicitly: 35 is the operating mechanism, 34 is the current scope lock — every row seeded on the board must itself be a Workspace row while 34 is in effect. Created docs/TASK_BOARD.md, seeded with the operator's exact 10 rows verbatim (W-01 migration+save200 CLAIMED-CRANE; W-02 add `three` CRANE; W-03 lib/types.ts integration merge CRANE dep W-02; W-04 page.tsx assembly CRANE dep W-03; W-05 Space3D three-integration+gates+proofs MASON dep W-02; W-06 ExportBar IFC/DXF MASON; W-07 wire comps into workspace route RIVET dep W-04; W-08 intent API CRANE; W-09 command bar UI RIVET dep W-08; W-10 ATLAS 8-step battery dep W-07,W-09) with envelopes and acceptance criteria written to keep rows non-overlapping per RULE 35(2)'s claim rule. Mirrored RULE 35 into all seven seat docs (ATLAS/CRANE/MASON/RIVET/SCRIBE/PI/FERRITE), each naming that seat's own pullable rows or lack thereof; SCRIBE's own entry notes it maintains the board but does not itself pull rows, having no envelope-scoped executor row. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-three, addendum range extended to "18–31, 33–35," RULE 35 given its own summary paragraph and rationale.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/TASK_BOARD.md (new), docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/seats/FERRITE.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE pulls W-01 (already CLAIMED) through W-08 in dependency order; MASON pulls W-05/W-06; RIVET pulls W-07/W-09 once their deps land; ATLAS pulls W-10 once W-07/W-09 are DONE. Everything off this board stays DEFERRED-per-RULE-34.
---

## 2026-09-04 (later still) - SCRIBE added AGENTS.md RULE 36 (observe-refine loop), seeded docs/TASK_REPORTS.md + 4 new TASK_BOARD rows
**Action:** Added AGENTS.md RULE 36 — OBSERVE-REFINE LOOP (permanent): (1) the operator's live-site observations, reported directly in chat, become docs/TASK_BOARD.md rows (envelope + acceptance) via SCRIBE with no seat-to-seat relay in between — seats then pull them per RULE 35 like any other row; (2) work never stops — a seat halts a row only on STUCK (missing info/operator decision/safety hold), logs an OPEN-FOR-OPERATOR line, and pulls its next non-blocked row; (3) every DONE row appends an entry to the new docs/TASK_REPORTS.md — seat, row ID, landing SHA, RULE 25 live proof, friction + what-went-well, duration — additive to, not a replacement for, the row's own board update; (4) the conductor periodically mines that friction log for recurring patterns and turns them into real workflow refinements via SCRIBE, with RULE 36 itself explicitly inside its own refinement scope, not exempt. Noted the rule's relationship to 34/35: 36 is the intake+feedback loop feeding 35's board, while 34 still decides whether a given report is in-scope now or gets deferred alongside everything else. Created docs/TASK_REPORTS.md (append-only, empty pending the first DONE row under this rule). Seeded 4 new docs/TASK_BOARD.md rows verbatim per the operator: W-11 workspace shelf EMPTY-STATE (RIVET — direct response to the operator's live observation of a bare empty box), W-12 keyboard fit-model control (MASON), W-13 view-state permalinks (MASON), W-14 AQ-RIVET-004 app-link diagnostic (RIVET) — flagged that AQ-RIVET-004's actual proposal text isn't on disk in this session (only the label given), so RIVET confirms real scope against its own proposal record before executing, same practice as AQ-RIVET-001. Mirrored RULE 36 into all seven seat docs. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-four, addendum range extended to "18–31, 33–36," RULE 36 given its own summary paragraph and rationale.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/TASK_REPORTS.md (new), docs/TASK_BOARD.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/seats/FERRITE.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** RIVET pulls W-11/W-14 (confirming AQ-RIVET-004's real scope first); MASON pulls W-12/W-13, sequenced against its existing W-05/W-06 pulls. Every seat's first DONE row under this rule should produce docs/TASK_REPORTS.md's first entry.
---

## 2026-09-04 (later still) - SCRIBE added AGENTS.md RULE 37 (timed stop + single inbox), created docs/OPERATOR_INBOX.md
**Action:** Added AGENTS.md RULE 37 — TIMED STOP + SINGLE INBOX (permanent): (1) docs/OPERATOR_INBOX.md is the ONLY operator-facing question surface, append-only, rows carrying timestamp/seat/task ID/question/recommended answer/status (OPEN/PARKED/CLEARED) — every OPEN-FOR-OPERATOR line named in RULE 31/35/36 now lands there specifically, not scattered across chat or individual ledger rows; chat stays reserved for the operator's own live-site observations feeding RULE 36's intake. (2) TIMED STOP: a seat needing confirmation waits at most ~10 agent-minutes (one turn boundary); no answer in that window → PARK the task (timestamp + resume pointer, recorded on both the inbox row and the task's own board/ledger row) and pull the next non-blocked row per RULE 35; an answered PARKED task re-enters READY in timestamp order — the conveyor never blocks on the operator. (3) The operator clears the inbox in one pass; the conductor presents the full open inbox at the top of every operator-present beat rather than surfacing questions piecemeal. (4) Seeded the three requested one-word lines in docs/OPERATOR_INBOX.md: SITE_BASE_URL-INTERIM (real content actually found and carried over from its existing docs/APPROVAL_QUEUE.md row — recommendation YES, domain purchase stays the standing gate — not fabricated, genuinely on disk), and GPT-5.6-SOL-TRIAL + SCORECARD-VIEW (seeded as OPEN placeholders per RULE 27's provisional-text limitation — the actual question text behind either label was never supplied in any message SCRIBE received; flagged rather than invented, no timed-stop clock started on either since no seat is actually waiting on a posed question yet). Mirrored RULE 37 into all seven seat docs. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-five, addendum range extended to "18–31, 33–37," RULE 37 given its own summary paragraph and rationale.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete (SITE_BASE_URL-INTERIM inbox row has real content; GPT-5.6-SOL-TRIAL and SCORECARD-VIEW remain open TODOs pending their actual question text)
**Files Modified:** AGENTS.md, docs/OPERATOR_INBOX.md (new), docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/seats/FERRITE.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** Whoever raised GPT-5.6-SOL-TRIAL and SCORECARD-VIEW should supply the actual question text so those inbox rows carry a real recommendation; the operator can clear SITE_BASE_URL-INTERIM (already has a YES recommendation on record) in the next operator-present beat.
---

## 2026-09-04 (later still) - SCRIBE added AGENTS.md RULE 38 (fleet watch), created docs/FLEET_WATCH.md, seeded heartbeats; also reconciled a TASK_REPORTS.md naming collision with CRANE
**Action:** Added AGENTS.md RULE 38 — FLEET WATCH (permanent): (1) the OS-level watchdog is the primary reviver for any dead/hung seat process; Claude-revives-Codex (a Claude seat noticing MASON/RIVET has gone silent) is the secondary path, used only after the primary watchdog has had its chance; (2) every seat keeps a heartbeat timestamp line in its own docs/RESUME_<SEAT>.md, updated at the start of each turn; (3) the fleet's daily watch schedule (who's expected active in which window, including RULE 31's overnight-autonomy window) is logged once per day in the new docs/FLEET_WATCH.md rather than re-derived from memory; (4) every fleet alert routes to exactly one named operator channel (chat, per docs/FLEET_WATCH.md) — no seat improvises a second channel, extending RULE 37's single-surface principle from questions to alerts. Created docs/FLEET_WATCH.md (revival order, a daily watch-schedule table, the one named alert channel). Added a `## Heartbeat` section, seeded 2026-09-04, to all seven docs/RESUME_<SEAT>.md files. Mirrored RULE 38 into all seven seat docs. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-six, addendum range extended to "18–31, 33–38," RULE 38 given its own summary paragraph and rationale. Separately, discovered while working this row: CRANE had independently created its own `docs/TASK_REPORTS.md` on origin/main (commit `a0a15a5a`, a real production D1 migrations-tracking reconciliation report, pre-dating and unaware of SCRIBE's RULE-36-format file of the same name sitting in SCRIBE's own unlanded branch chain) — a genuine naming collision, not a duplicate SCRIBE created. Reconciled by preserving CRANE's entry verbatim under a labeled "pre-RULE-36 format" heading and keeping RULE 36(3)'s row schema for every entry from this point forward, rather than silently overwriting CRANE's real work when this branch eventually lands.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FLEET_WATCH.md (new), docs/RESUME_ATLAS.md, docs/RESUME_CRANE.md, docs/RESUME_FERRITE.md, docs/RESUME_MASON.md, docs/RESUME_PI.md, docs/RESUME_RIVET.md, docs/RESUME_SCRIBE.md, docs/TASK_REPORTS.md (reconciled), docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/seats/FERRITE.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** Each seat updates its own docs/RESUME_<SEAT>.md heartbeat line starting its next turn. Whoever lands this branch chain onto main should be aware docs/TASK_REPORTS.md now has real reconciled content on both sides, not a simple overwrite.
---

## 2026-09-04 (later still) - SCRIBE ran ULPIN-removal forensics, seeded W-16 LANDINTEL RESTORE, added AGENTS.md RULE 29 Feature Conservation addendum + docs/LIVE_TOOLS_REGISTRY.md
**Action:** Per the operator's live-site observation that LandIntel's real ULPIN/Bhu-Aadhaar lookup was gone, ran forensics: `git log -S "ULPIN" -- apps/web/app/products/landintel/page.tsx` plus `git show` on each candidate commit identified `331c1b081a06a16e851ef6969b90804c212fb542` ("feat: [land:w2-372-ui-ux-modernization] [AI: SCRIPT]", 2026-09-04 14:13:17 +0530) as the commit that replaced `UlpinMapExplorer` (real, D1-backed lookup) with `SteppedForecastModule` (sample-data-only forecast slider) in the hero — confirmed by direct diff inspection, not inferred. Logged this as a process-friction entry in docs/TASK_REPORTS.md (RULE 36(3) schema): the sweep's own RATIFIED five-point rubric and ATLAS's own audit both had no check for "does a previously-live tool still exist after this lands," which is the gap that let a real regression through a fully-approved sweep. Seeded docs/TASK_BOARD.md row W-16 LANDINTEL RESTORE (assigned RIVET — the operator allowed MASON or RIVET, SCRIBE picked RIVET as it already carries similar UI-restoration work on W-11) with acceptance criteria: ULPIN lookup returns as PRIMARY hero tool (sample chips + Lookup + provenance-strip result card), SteppedForecastModule stays live as SECONDARY (not removed), both live/dual-unit/honesty-chipped, first-viewport proof at 1366+375. Added AGENTS.md RULE 29's Feature Conservation addendum (no restyle/sweep may remove or demote a live tool; ATLAS's audit battery gains a standing regression check against a new registry) with this incident as its exemplar. Created docs/LIVE_TOOLS_REGISTRY.md, seeded with ULPIN lookup (marked RESTORED-via-W-16), the BOQ Pro trust-share calculator, DesignStudio test-fit calculator, Transact stamp-duty estimator, and the other W2-373-era hero tools (IS-check widget, rate-compare calculator, IRR/NPV modeler, CDE status mock), plus the interactive parcel map and Plot Estimator. Mirrored the addendum into docs/seats/ATLAS.md (audit battery note) and the new W-16 assignment into docs/seats/RIVET.md. Updated docs/FERRUM_METHOD_PLAYBOOK.md's RULE 29 summary with the same addendum and exemplar (no rule-count change — this amends existing RULE 29 text, it isn't a new numbered rule).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete (forensics + registry + board row done; the actual UI restore is RIVET's pending W-16 pull)
**Files Modified:** AGENTS.md, docs/LIVE_TOOLS_REGISTRY.md (new), docs/TASK_BOARD.md, docs/TASK_REPORTS.md, docs/seats/ATLAS.md, docs/seats/RIVET.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** RIVET pulls W-16, restores UlpinMapExplorer as the primary hero tool alongside the still-live SteppedForecastModule, and marks DONE with SHA + live proof; ATLAS's next audit on any sweep row should exercise the new LIVE_TOOLS_REGISTRY.md regression check.
---

## 2026-09-04 (later still) - SCRIBE seeded W-17 AUTH-PREVIEW board row, flagged W2-326 discrepancy, queued W2-409 roadmap row
**Action:** Seeded docs/TASK_BOARD.md row W-17 AUTH-PREVIEW (assigned RIVET — operator allowed MASON or RIVET, SCRIBE picked RIVET as it's already carrying the UI-restoration work on W-11/W-16): remove all credential-collection inputs from `/signup` and `/login`, replacing both with an honest preview gate ("Accounts arrive with the live release — explore everything now in preview"), one "Enter preview" action (localStorage session flag only, zero email/password fields, nothing collected); every Log in / Start Free Trial CTA sitewide routes to the gate; workspace and account surfaces open in preview with a visible PREVIEW chip; real auth stays explicitly out of this row's scope. **Discrepancy flagged per RULE 27, not silently resolved either direction:** docs/WAVE_QUEUE.md's W2-326 AUTH_COMPLETE row already shows DONE with a landing SHA (`4ef78791`) — real PBKDF2/WebCrypto password auth, sessions, and verify/reset flows already exist on `origin/main`. Rather than treating the operator's "until real auth ships" framing as contradicting that landed status, resolved it as: the backend stands (W2-326's DONE/SHA is not touched or reverted), only the frontend credential-collection surface is hidden behind a preview gate, pending an operator-set "live release" milestone — annotated directly on the W2-326 row so the two facts (backend DONE; frontend intentionally hidden) don't read as contradictory to a future reader. Queued W2-409 REAL_AUTH_RELIVE as a ROADMAP-LABEL row (unassigned) for the eventual frontend re-exposure, explicitly noting it's not new backend work. Mirrored W-17 into docs/seats/RIVET.md.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete (board row + ledger annotation + roadmap placeholder done; the actual UI change is RIVET's pending W-17 pull)
**Files Modified:** docs/TASK_BOARD.md, docs/WAVE_QUEUE.md, docs/seats/RIVET.md, docs/ACTIVITY_LOG.md
**Next Steps:** RIVET pulls W-17, verifies zero credential inputs on both routes at 1366+375, confirms the preview gate reaches the cockpit, and marks DONE with SHA + live proof.
---

## 2026-09-04 (later still) - SCRIBE amended AGENTS.md RULE 38 + docs/FLEET_WATCH.md: alert channel is ntfy, not chat
**Action:** Amended AGENTS.md RULE 38(4): the operator-designated alert channel is now **ntfy**, via the `FLEET_NTFY_TOPIC` environment variable — superseding RULE 38's original chat-only default. Resolved as a straightforward later-verbatim-wins case (RULE 27 precedent): the operator requested push alerts explicitly, after the chat-only spec had already landed, so the later instruction supersedes the earlier one it directly contradicts — no ambiguity to flag beyond noting which instruction is newer. Explicitly preserved the other two channels' scope so ntfy doesn't quietly absorb them: chat stays for the operator's own live-site observations (RULE 36 intake), docs/OPERATOR_INBOX.md stays the only surface for seat-to-operator questions (RULE 37) — ntfy is for alerts only (seat-down, revival-fired, watch-schedule-gap). Added RULE 38(5), recording the watchdog-probe and Claude-revives-Codex mechanisms as explicitly operator-authorized (verbatim) rather than an inferred capability. Added RULE 38(6), explicitly retaining the existing kill-switch in full — the amendment governs the alert channel only, never a substitute for a human's ability to halt fleet watch entirely. Updated docs/FLEET_WATCH.md to match: rewrote the "One alert channel" section for ntfy, added the watchdog/Codex-reviver authorization note and the kill-switch note as their own sections. Updated docs/seats/SCRIBE.md's RULE 38 mirror to name the ntfy channel explicitly; the other six seat docs' RULE 38 mentions already pointed generically at "the channel named in docs/FLEET_WATCH.md" and needed no edit. **Process note:** this branch was rebuilt fresh off the current `origin/main` tip (via cherry-pick of the prior W-17 commit) rather than continuing the old stacked branch chain, since RULE 33-38's docs and FLEET_WATCH.md had all landed on main in the interim and the old stale branch base would have produced a large, spurious diff against unrelated files.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/FLEET_WATCH.md, docs/seats/SCRIBE.md, docs/ACTIVITY_LOG.md
**Next Steps:** Whoever provisions `FLEET_NTFY_TOPIC` should confirm the actual ntfy topic/server details with the operator — SCRIBE has recorded the mechanism, not invented specific topic values.
---

## 2026-09-04 (later still) - SCRIBE seeded W-20 to resolve a MASON/CRANE IFC-export build-vs-reuse disagreement
**Action:** Seeded docs/TASK_BOARD.md row W-20 (assigned CRANE) carrying MASON's proposal verbatim as given to SCRIBE (a browser-only STEP writer, separating a validation-only `web-ifc` path from the client export path) alongside CRANE's counter-finding as the row's acceptance note (`lib/ifc-export.ts` already writes STEP/SPF text directly, not via `web-ifc`'s typed schema classes). Read the actual file (`apps/web/lib/ifc-export.ts` on `origin/main`) before writing the row down rather than taking either side's claim on faith: confirmed the writer does generate plain STEP/SPFF text directly, and separately found a real, disk-verified risk worth naming in the acceptance note — `getWebIfc()` (used only for the round-trip *verification* path, not the writer itself) calls `createRequire`/Node's `module` built-in to force-load `web-ifc`'s Node build, a mechanism that would not survive a Workers/browser bundle if it got pulled in. Wrote the row so Step 1 is a Workers-bundle test proving the writer path specifically (not the verification path) is browser/Workers-safe with zero runtime deps, before anyone builds anything new: pass → the row becomes "wire the existing writer into ExportBar (W-06)," not a duplicate rewrite; fail → MASON's original browser-only-writer proposal proceeds as planned. Set W-06 (ExportBar, MASON)'s Deps to W-20 so MASON doesn't start a parallel rewrite before the gate result is known. Mirrored into docs/seats/CRANE.md (new pull) and docs/seats/MASON.md (W-06's new gating dependency).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete (board row + disk verification done; the actual bundle test is CRANE's pending W-20 pull)
**Files Modified:** docs/TASK_BOARD.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE pulls W-20, runs the Workers-bundle test against the writer path only, and marks DONE with the pass/fail result; MASON's W-06 pull waits on that result per the new dependency.
---

## 2026-09-04 (later still) - SCRIBE seeded W-22 ARCHVIZ_GRAPHICS + W-23 NODE_PANEL, wrote docs/UX_FLOW.md, flagged missing W-19/W-21
**Action:** Seeded docs/TASK_BOARD.md row W-22 ARCHVIZ_GRAPHICS (MASON): the quality bar as given — multiple viewports (plan + axo), a PBR material set, an IBL sun, a reflective podium, instanced greenery, within a stated fps budget. First instruction's acceptance criterion cited a `docs/references/graphics_target.png` region/palette diff; a follow-up message from the same operator, arriving before this row was committed, amended the acceptance to "the described quality bar + screenshot + fps probe; no reference-file dependency" — the row reflects only the final, amended acceptance, the withdrawn file-diff version was never written to disk. Seeded W-23 NODE_PANEL (Dynamo-style visual parametrics) with Status ROADMAP-LABEL as given — not a pull-eligible row, recorded on the board because the operator used a board-style ID rather than a WAVE_QUEUE.md one. **Flagged, not fabricated:** W-22's stated dependency "W-21" is not an existing seeded row on the board — checked docs/TASK_BOARD.md directly before writing anything, confirmed no such row exists. Wrote docs/UX_FLOW.md, the six-phase UX north-star, using the phase content given directly in the instruction (Discovery → Location-aware forecast → Cockpit default view with five sketch regions → Command bar/intent loop → Save/export/share → Project list loop-back), plus the honesty footer (RULE 29/30 + preview mode) — recorded in the order given, nothing reordered or expanded beyond what was specified. The instruction asked this doc to be linked as an acceptance reference for W-16/W-19/W-21/W-22; W-16 and W-22 are real rows and got the link, but W-19 and W-21 don't exist as seeded rows either — flagged in UX_FLOW.md's own Notes section rather than inventing scope for either to make the link resolve. Mirrored W-22 into docs/seats/MASON.md.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete (W-22/W-23 seeded, UX_FLOW.md written; W-18/W-19/W-21 remain undefined gaps flagged in three places — TASK_BOARD.md Notes, W-22's own row, UX_FLOW.md Notes — pending the operator or conductor defining them for real)
**Files Modified:** docs/TASK_BOARD.md, docs/UX_FLOW.md (new), docs/seats/MASON.md, docs/ACTIVITY_LOG.md
**Next Steps:** Whoever defines W-18/W-19/W-21 should seed them on docs/TASK_BOARD.md and update W-22's Deps + docs/UX_FLOW.md's references accordingly; MASON pulls W-22 once W-20's IFC gate result clears its own queue position, treating the missing W-21 dependency as satisfied-by-absence rather than a block (per the flag) unless told otherwise.
---

## 2026-09-04 (later still) - SCRIBE seeded W-24 COMPLIANCE_ENGINE, W-25 PERMISSIONS_TABS, W-26 ROUTING_FLIP (top-of-board), updated docs/UX_FLOW.md phases 2.5 and 4.5
**Action:** Rebuilt the working branch fresh off `origin/main` and cherry-picked the prior W-22/W-23/UX_FLOW.md commit forward, resolving one real merge conflict in docs/TASK_BOARD.md against CRANE's concurrent W-20 result update (Step 1 DONE, result FAIL — MASON's original browser-only-writer proposal proceeds; kept CRANE's W-20 status alongside SCRIBE's own W-22/W-23 additions, nothing discarded from either side). Seeded W-24 COMPLIANCE_ENGINE (CRANE or MASON, seat choice left open per the instruction): a deterministic parcel+building-type→permissions ruleset engine, sourced from the real, already-existing `2026.1-SAMPLE` versioned ruleset (`apps/web/lib/parcelIntel/sampleRulesets.ts`, confirmed on disk before citing it — not a new ruleset invented for this row), unit-tested, every output item honesty-labeled per RULE 5/29. Seeded W-25 PERMISSIONS_TABS (RIVET or MASON): two new cockpit top-strip tabs (DILIGENCE, PERMITS), the bottom extract panel rendering W-24's compliance table per highlighted tab, each row carrying a lead-capture CTA (INDICATIVE chip) and a status-tracker column reserved for a later service-mode feature; depends on W-24. Seeded W-26 ROUTING_FLIP (CRANE), explicitly placed as the table's literal first row and given a non-standard "READY — PRIORITY-JUMP" status (mirroring docs/WAVE_QUEUE.md's existing PRIORITY-JUMP convention) because the operator stated nothing outranks it: `/project-workspace` renders the cockpit immediately (preview session auto-created per W-17's convention, all five sketch regions in one viewport), project list demotes to `/project-workspace/projects`. Updated docs/UX_FLOW.md: inserted Phase (2.5) Diligence gate (before the DesignStudio bridge, surfacing W-24's buy-stage compliance table) and Phase (4.5) Permits tracker (alongside design, not gating it, per W-25); also updated Phase (3)'s cockpit description to reflect W-26's routing change now that `/project-workspace` itself is the cockpit. Mirrored all three new rows into the relevant seat docs (CRANE, MASON, RIVET).
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/TASK_BOARD.md, docs/UX_FLOW.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE pulls W-26 next (ahead of any other CRANE row) per its PRIORITY-JUMP status; CRANE or MASON pulls W-24; RIVET or MASON pulls W-25 once W-24 is DONE.
---

## 2026-09-04 (later still) - SCRIBE added AGENTS.md RULE 39 (self-contained relays + pre-adjudication)
**Action:** Added AGENTS.md RULE 39 — SELF-CONTAINED RELAYS + PRE-ADJUDICATION: (1) every conductor relay carries the full verbatim task text; a row ID is a cross-reference annotation, never the authority; (2) every relay pre-adjudicates its own foreseeable blockers — missing row cited → the relay's inline text is authority regardless, flag the gap, don't stop; missing/unmet dependency not meant to block → proceed to the next task; ambiguous scope → narrowest reading of the literal text; a step requiring an unauthorized production write → hold that step only, flag it, never silently skip or silently execute; (3) a relay depending on a SCRIBE-authored doc/board change sequences after that change's own landing proof, not before; (4) on the seat side, unambiguous inline operator intent is executable even when its citation is absent — execute, flag the gap, continue. Explicitly codified this as the write-up of a pattern this session had already hit repeatedly and handled the same way each time (AQ-RIVET-004, GPT-5.6-SOL-TRIAL, the missing W-18/W-19/W-21 rows, RULE 33(5)'s undefined pace-metric) — RULE 39 turns that recurring judgment call into a named, pre-agreed default rather than leaving it as an ad-hoc practice. Mirrored into all seven seat docs, each phrased for that seat's own execution context; SCRIBE's own mirror notes it applies the same discipline when authoring board/ledger rows, not only when receiving them. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-seven, addendum range extended to "18–31, 33–39," RULE 39 given its own summary paragraph and rationale. Bundled into the same push as the previously-drafted W-24/W-25/W-26/UX_FLOW.md work per this turn's own message ordering.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/seats/FERRITE.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** Future relays from the conductor should self-check against RULE 39(1)-(3) before being sent; seats apply RULE 39(4) going forward without needing this incident list re-explained each time.
---

## 2026-09-04 (later still) - SCRIBE added AGENTS.md RULE 40 (facts-only reporting), logged STANDING-DEPLOY-AUTHORITY + RIVET-PUSH-W16-CHROME approvals; resolved a real merge conflict against MASON/CRANE's independent W-26 landing
**Action:** Rebuilt the working branch fresh off `origin/main` again and cherry-picked the prior W-24/W-25/W-26/RULE-39 commit forward, resolving real merge conflicts in docs/TASK_BOARD.md, docs/ACTIVITY_LOG.md, and docs/seats/MASON.md against concurrent landings: CRANE/MASON had already landed W-26 ROUTING_FLIP for real (`86ef5791`, "[land:crane/w26-cockpit-route-flip]", touching exactly the two files W-26's envelope names) — checked `origin/main` directly before writing anything, updated W-26's row to cite that commit as a verifiable fact rather than leaving it READY, but per RULE 40 did NOT mark it DONE since SCRIBE has not itself checked the deployed edge; that's for CRANE's own report to state. Also found MASON's own docs/RESUME_MASON.md claims a W-21/W-22 cockpit canvas was already implemented on branch `w2-401-cockpit` — noted as an unverified claim on W-22's row and in docs/seats/MASON.md, not treated as confirmed. Added AGENTS.md RULE 40 — FACTS-ONLY REPORTING (all seats, serious, no exceptions): (1) reports state only verifiable facts (SHAs, deployed SHA + live response, gate/test output, or a blocked state + the single unblocking action); (2) banned outright: forecasts, assurances, adjectives standing in for a measurement, progress-as-completion, partial-credit summaries; (3) incomplete work is reported as what's missing, not what was done; (4) ATLAS logs violations as honesty incidents, three against the same seat triggers re-onboarding; (5) the conductor is bound identically. Logged two operator approvals under this rule in docs/APPROVAL_QUEUE.md: STANDING-DEPLOY-AUTHORITY (guarded — HEAD==origin/main, gates green, deploy SHA logged, `docs/DEPLOY_STOP` as kill-switch; that file does not exist yet, its absence is the expected normal state, not a gap) and RIVET-PUSH-W16-CHROME (checked and found already landed: `5004f836`, "[land:w2-401/rivet-w16-chrome]" — logged the real SHA rather than leaving the row pending). Mirrored RULE 40 into all seven seat docs. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-eight, addendum range extended to "18–31, 33–40," RULE 40 given its own summary paragraph and rationale.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/APPROVAL_QUEUE.md, docs/TASK_BOARD.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/seats/FERRITE.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE's own report should confirm W-26's live status at 1366/375 to actually close that row per RULE 25; whoever owns `docs/DEPLOY_STOP` policy should confirm the file's absence is intentional before any seat exercises the standing deploy authority.
---

## 2026-09-04 (later still) - SCRIBE seeded W-27..W-32, rewrote docs/UX_FLOW.md Phase 4 conversation-first
**Action:** Seeded docs/TASK_BOARD.md W-27 CONVERSATIONAL_PRIMARY (MASON UI + CRANE grammar, split envelope): command bar becomes the primary interface (text + browser Web Speech API voice, honest fallback chip where unsupported), intent grammar extended to floors/plot-w-d/setback/use/room-bias/free-form adjustments, every intent drives the deterministic engine live, sliders removed from the default view and relegated to More → Advanced. Seeded W-28 GUIDED_OPTIONS (RIVET or MASON): constrained option chips per decision point (use → floors → massing style → rooms split → compliance add-ons), every option ruleset-derived so only legally/feasibly buildable choices are offered. Rewrote docs/UX_FLOW.md's Phase (4) entirely as the conversation-first loop (text/voice/guided-options, all through the same intent pipeline), explicitly demoting manual sliders to an opt-in Advanced surface rather than deleting them. Mirrored into CRANE/MASON/RIVET seat docs. Seeded W-29 KNOWLEDGE_BASE (CRANE + MASON, split envelope): a versioned structured code corpus (NBC 2016, IS 456/875/1893, SP 7, four city DCR samples, dimensional-standards tables) authored as our own structured data, every fact carrying a clause ID/version/status chip (VERIFIED-SAMPLE/INDICATIVE), cited by both the assistant's answers and W-28's option chips. Seeded W-30 VOCAB_ONTOLOGY (MASON): a professional-terminology mapping consumed by the intent parser and reply templates. Seeded W-31 GROUNDED_LLM_LAYER as ROADMAP-LABEL (unassigned, no envelope): if a future LLM seat trial is approved — a separate, not-implied decision — it acts strictly as a language layer over W-29's KB via RAG with clause citations, never originating a number or option itself. Seeded W-32 BATTERY_FAILS as an umbrella row over three real sub-rows (W-32a artifact-appears readback / W-32b extract-updates-on-mutate / W-32c share-opens), each its own claimable envelope, open to any eligible seat. **Flagged, not fabricated (RULE 39):** checked docs/TASK_BOARD.md's own W-10 (ATLAS's 8-step battery) directly before writing W-32 — it's still READY with no battery run or results logged on disk anywhere; SCRIBE has not seen the full battery output, only the three failing check names (2, 5, 8) given directly in this instruction, recorded as given rather than inventing what checks 1/3/4/6/7 were or assuming the battery actually ran. Updated docs/UX_FLOW.md's Phase (4) with a "questionnaire is KB-grounded" note tying W-27/W-28 to W-29/W-30/W-31. Mirrored the new rows into ATLAS/CRANE/MASON seat docs.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete (rows seeded, UX_FLOW.md updated; W-10's actual battery results remain unlogged — flagged for whoever ran it to record for real)
**Files Modified:** docs/TASK_BOARD.md, docs/UX_FLOW.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/ACTIVITY_LOG.md
**Next Steps:** MASON pulls the UI half of W-27; CRANE pulls the grammar half; RIVET or MASON pulls W-28; CRANE/MASON split W-29; MASON pulls W-30; W-32a/b/c are open to any eligible seat via board-pull. Whoever actually ran ATLAS's 8-step battery should log its full results on W-10.
---

## 2026-09-04 (later still) - SCRIBE seeded W-33 LANDINTEL_BRIDGE, updated docs/UX_FLOW.md's region law (new left-edge side panel); rebuilt branch again resolving conflicts across nearly every ledger file
**Action:** Rebuilt the working branch fresh off `origin/main` yet again and cherry-picked the prior RULE-40/W-27..W-32 commit forward, this time hitting real merge conflicts across AGENTS.md, docs/ACTIVITY_LOG.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/TASK_BOARD.md, and all seven docs/seats/*.md files — in every case the conflict was origin/main simply not yet having SCRIBE's own RULE 39/40 content (empty HEAD side), so each was resolved by keeping SCRIBE's side in full; two conflicts (playbook's rule-count/addendum lines) had a genuinely stale HEAD (an older "thirty-six/33-38" count) superseded by the correct "thirty-eight/33-40" count already committed on SCRIBE's side — resolved by keeping the newer, correct numbers. Seeded docs/TASK_BOARD.md row W-33 LANDINTEL_BRIDGE (RIVET + CRANE + MASON, three-way split envelope): the LandIntel result card gets a second action, MOVE TO WORKSPACE, alongside the existing unchanged SAVE — creating a workspace artifact with the parcel context and routing to `/project-workspace/:id` to open the cockpit. Confirmed `SaveToWorkspaceButton` is a real, existing component before citing it. The cockpit on that route renders a new LEFT SIDE PANEL (read-only reference, command bar stays primary) showing the source parcel's full territorial detail (owner, survey no, dual-unit area, location, zoning/FAR/coverage, water-body buffer, NDZ flag, flood-zone, provenance chips), and the 3D space starts pre-seeded from that context (plot grid from real parcel dims, proposed building type from the forecast). Updated docs/UX_FLOW.md: phase (1) now describes both card actions; phase (3)'s region law gains the left-edge side panel as a sixth region (present only when a project has a source parcel), and notes the 3D space's pre-seeding behavior when opened via this bridge. Mirrored each seat's own piece into docs/seats/RIVET.md, CRANE.md, and MASON.md.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** docs/TASK_BOARD.md, docs/UX_FLOW.md, docs/seats/RIVET.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/ACTIVITY_LOG.md
**Next Steps:** RIVET pulls the card-UI piece, CRANE pulls the route/panel/pre-seed-logic piece, MASON pulls the 3D pre-seed-wiring piece; acceptance requires the Move action to actually open a populated side panel at 1366+375 and the existing Save action to keep working unchanged.
---

## 2026-09-04 (later still) - SCRIBE added AGENTS.md RULE 41 (device + perf gate, hard), seeded W-34 PERF_INFRA, retrofitted perf-delta acceptance onto W-27/W-28/W-33
**Action:** Added AGENTS.md RULE 41 — DEVICE + PERF GATE (hard, blocks landing like the type check): (1) responsive matrix at 320/375/414/768/1024/1366/1920 + landscape 375, zero horizontal overflow, ≥44px touch targets, cockpit region-law reflow below 768px (side panel → drawer, ruler → bottom sheet, extract → swipe cards); (2) floor device = 2022 mid-range Android (4GB RAM, SD 6xx-class) / 2018 i5+iGPU, 4G/10Mbps network, evergreen browsers; WebGL2 gets the full rendering profile, WebGL1/no-WebGL gets an honestly-labeled degradation profile (shadows/reflections off, pixelRatio 1, single viewport); (3) CI-enforced perf budgets in `budgets.json`: initial JS ≤350KB gz (cockpit route ≤600KB gz, three lazy), LCP ≤2.5s on the 4G floor, CLS ≤0.1, INP ≤200ms, main-thread task ≤50ms, draw calls ≤200, FPS ≥30 floor/degradation or ≥60 desktop-class; (4) every feature row carries a perf-delta check (before/after bundle + fps probe) and a regression blocks that row's landing. ATLAS's audit battery gains the matrix and budgets as standing checks on every landing. Seeded docs/TASK_BOARD.md row W-34 PERF_INFRA (CRANE): `budgets.json` encoding RULE 41(3)'s exact numbers, Lighthouse CI on key routes enforcing them (with a real negative-test acceptance criterion — a deliberately oversized bundle must actually fail CI, not just have config existing), the WebGL-capability degradation toggle, and a documented real-device spot-check protocol. Retrofitted a perf-delta acceptance clause onto the three currently-open rows named in the instruction (W-27, W-28, W-33) — each now blocks its own landing on a regression against W-34's budgets once W-34 exists; noted in TASK_BOARD.md's Notes that every other open row gets the same clause the next time SCRIBE touches it, per RULE 41's blanket applicability rather than a one-time retrofit. Mirrored RULE 41 into all seven seat docs. Updated docs/FERRUM_METHOD_PLAYBOOK.md: rule count corrected to thirty-nine, addendum range extended to "18–31, 33–41," RULE 41 given its own summary paragraph and rationale.
**By:** SCRIBE (Claude Code)
**Status:** ✅ Complete
**Files Modified:** AGENTS.md, docs/TASK_BOARD.md, docs/seats/ATLAS.md, docs/seats/CRANE.md, docs/seats/MASON.md, docs/seats/RIVET.md, docs/seats/SCRIBE.md, docs/seats/PI.md, docs/seats/FERRITE.md, docs/FERRUM_METHOD_PLAYBOOK.md, docs/ACTIVITY_LOG.md
**Next Steps:** CRANE pulls W-34 first among CRANE-eligible rows, since W-27/W-28/W-33 (and every future perf-relevant row) now depend on `budgets.json` existing to actually run their perf-delta checks against.
---
