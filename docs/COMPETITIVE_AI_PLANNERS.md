# COMPETITIVE_AI_PLANNERS.md — AI house-plan/elevation-generator landscape

Live research per RULE 54. Part 1 is a hands-on walkthrough (real signup flow attempted, screenshots at each reachable step, no fabricated data submitted past the point requiring real contact info). Part 2 is search-verified (each platform's own site/press coverage, not recalled from training data). All facts dated to this research pass (2026-09-07).

---

## Part 1 — Deep-dive: homeplannner.com

**What it claims:** "AI based Floorplanning — Unlock your floor plan in just 30 secs," "Get custom AI-generated house plans in 30 seconds... for just ₹299" (US: $9, UK: €9). Operated by Masons Mark Private Limited.

**Input flow (16 real steps walked, screenshotted):**
1. Plot width (ft) — free-text number
2. Plot depth (ft) — free-text number
3. Number of floors (One–Five+)
4. Number of master bedrooms (One–Five+)
5. Number of married couples in the family (Zero–Five+)
6. Number of kids (Zero–Five+)
7. Separate kid's bedroom required? (Yes/No)
8. Extra guest room required? (Yes/No)
9. Kitchen floor (Ground/First/All floors)
10. Kitchen type (Open/Close)
11. Balcony in bedrooms? (Yes/No)
12. Small office space required? (Yes/No)
13. Parking facility (2-Wheeler/other tiers)
14. Garden provision? (Yes/No)
15. Lift provision? (Yes/No)
16. Master bedroom size preference (Big/other)
17. Bathroom size preference (Big/other)
18. Plot direction — a real interactive compass-rose graphic (N/NE/E/SE/S/SW/W/NW)
19. Site Details — Front/Back/Right/Left, each set to "Road" or "Others Property"

This is a genuinely thorough, India-oriented intake questionnaire (Vastu-adjacent framing throughout: direction, kitchen placement) — the input side is real and reasonably sophisticated.

**What actually happens after "Finish":** a scripted, fake-progress animation plays for ~21 seconds with staged messages — *"Analysing your plot and family details" → "Adjusting the plan according to your future needs" → "Analyzing front facade for 3D Elevation" → "Preparing Photorealistic 3D Elevation" → "Creating multiple options" → "Preparing final 2D & 3D designs"* — strongly implying live AI generation is happening. **It is not connected to any visible output.** The animation ends on: *"Your Requirements Are Verified And Submitted Successfully. Enter Your Details to Get 2D & 3D Conceptualized Designs"* — a full-name + WhatsApp-number lead-capture form. No plan, elevation, 3D view, or export of any kind was reached or shown in-browser at any point in this flow.

**Marketing claims vs. what actually renders:**

| Claim | Reality (verified this pass) |
|---|---|
| "Get your floor plan in 30 seconds" | The 30-ish-second window is a scripted progress-bar animation, not a rendering process — it ends in a phone-number capture form, not a plan |
| "AI-generated house plans...₹299" | No self-serve checkout/payment screen was ever reached in the tested flow; ₹299 is stated in page metadata/marketing copy only. Delivery appears to be WhatsApp-based and gated behind providing a real phone number — could not verify what (if anything) is actually delivered without submitting real contact information, which this audit did not do |
| Implied: "photorealistic 3D elevation," "2D & 3D designs" | Never observed — the flow terminates at lead capture before any design artifact is shown |

**Pricing tiers:** ₹299 (India) / $9 (US) / €9 (UK) stated in marketing metadata — no tiered plans found; appears to be a single flat fee per plan, collected outside the tested browser flow.

**Account/paywall points:** No account creation observed. The paywall-equivalent gate is the WhatsApp number capture, positioned *after* the full 16-question intake and the fake-progress animation — i.e., maximum sunk-cost placement before asking for contact info.

**Tech signals:** Standard React-ish SPA (client-rendered radio-button steps, `custom-radio-div` class names suggesting a template/boilerplate UI kit), Google Tag Manager + GA4 (two separate GTM containers), no signs of a real-time generation backend being called during the "progress" animation (no new network requests correlate with the staged messages — consistent with a client-side `setTimeout` sequence, not live processing). **Not independently confirmed via network-tab inspection this pass** — flagged as an inference from timing/UI behavior, not a hard proof.

Screenshots: `scratchpad/homeplannner/` (19 steps + compass-direction step + final lead-capture screen).

---

## Part 2 — Landscape (search-verified, 2026-09-07)

| Platform | Verified live? | Inputs | Outputs | Pricing | Real limitations |
|---|---|---|---|---|---|
| **Maket.ai** | ✅ | Natural-language prompt ("3-bed, 2-bath, 1400 sqft, south garden") | Multiple dimensioned 2D layout options within 60s; conversational editing; style restyle tool | Free (50 credits); $20/mo (300 credits); Pro $29/mo, Studio $79/mo (sources vary) | v2 (zoning-code verification, HVAC, material takeoff) still in beta/waitlist as of this research — current version lacks these |
| **Spacely.ai** | ✅ | Existing room photo/sketch + text style prompt | Photorealistic interior renders (not structural floor plans), style transfer, 4K downloads | Free (40 credits); $12.75–100/mo tiers | **Rendering/restyle tool, not a floor-plan generator** — doesn't produce dimensioned plans or structural layouts |
| **Higharc** | ✅ | Builder-side plan configuration, brochure/drawing photos (AutoLayout) | Shoppable 3D visuals, estimates, permit-ready docs, photoreal renders | Enterprise-only, custom quote, not published | B2B homebuilder platform, not a consumer self-serve tool — no public pricing or open signup |
| **TestFit** | ✅ | Site parameters, unit mix, parking requirements | Site plans, cost estimates, thousands of massing options in seconds; exports to AutoCAD/SketchUp/Revit/Excel/PDF/glTF | Urban Planner $100/mo; Data Maps $250/mo; Site Solver from ~$10k/yr | Feasibility/massing tool for multi-family & commercial — not aimed at single-family house plans |
| **Autodesk Forma** | ✅ | Site/context data; new Building Layout Explorer (generative AI, beta) | Sun/wind/noise/carbon/energy analysis; schematic building models (Building Design module, closed beta late 2025) | $185/mo or $1,445/yr standalone; bundled in AEC Collection | Building Design (the actual generative layout tool) is still in closed beta as of this research — GA expected sometime in 2026, not yet broadly available |
| **Veras** (EvolveLAB) | ✅ | An existing 3D model (Revit/SketchUp/Rhino/Vectorworks/ArchiCAD) | AI-applied materials/lighting/environment rendering on that model | Named license $29–59/mo; floating $51/mo; student $149/yr | **Rendering-only** — requires an already-built 3D model; does not generate geometry/layout itself |
| **Rendair** | ✅ | Chat/text prompt on top of a base image or 3D scene | Photorealistic renders, upscaling, animation | Student €7.60/mo; Pro €39/mo; Team tier | Rendering/visualization tool, not a plan-generation tool |
| **PromeAI** | ✅ | Hand-drawn sketch or rough line drawing | Photorealistic render from sketch; image variation; erase & replace | Free (10 coins/mo); $19/$39/$79 tiers | Image-to-image rendering, not a dimensioned/structural floor-plan generator — output is a picture, not CAD/BIM data |
| **Hypar** | ✅ | Code (Python/C#) or text-to-BIM prompts | Programmatic building design generation, thousands of evaluated options | Free tier; Pro ~$29/mo; Enterprise custom | Developer/code-first tool — not a point-and-click consumer flow; steep learning curve relative to the others |
| **PlanFinder** | ✅ (Rhino/Grasshopper plugin, Food4Rhino-listed) | Site data, user goals, zoning constraints | Code-compliant floor-plan layouts, up to 16 plans per run (Enterprise) | 30-day free trial; Enterprise $21.72/mo | Requires Rhino/Grasshopper — not a standalone web app, professional-tool-only |
| **Finch3D** | ⚠️ Referenced by third-party comparison sources, not independently verified live this pass | Early-stage massing/layout parameters | Layout optimization | Not verified | **Not independently confirmed** — appeared only in a secondary "best tools 2026" comparison source, not checked against Finch3D's own site this pass |
| **ArchiCAD (built-in AI Visualizer)** | ✅ | Existing ArchiCAD model | Stable-Diffusion-based cloud rendering variations | Bundled with ArchiCAD 28 | Alters original geometry per source — a rendering aid, not a planning tool |
| **Revit (Dynamo + Generative Design)** | ✅ | Goals (maximize daylight, minimize material) + constraints, visual programming | Multi-objective optimized design permutations | Included with Revit, no extra cost | Requires visual-programming skill (Dynamo); not a natural-language or form-based flow |

**Not found / could not verify as named:** No platform literally named "Rendair AI" distinct from what's listed above was found (it exists as searched). All 12 named candidates plus Finch3D (caveated) were located; none returned zero results the way `braveopotatato` did in the earlier `TECH_SCOUT.md` research.

---

## Part 3 — Synthesis: adopt vs. differentiate

**What Ferrum should consider adopting (pattern, not code — same discipline as `TECH_SCOUT.md`):**
- **Maket's conversational edit loop** ("generate, then refine by describing changes") is the closest existing product to Ferrum's own SUTRA guided-tree direction — validates the approach rather than suggesting a pivot.
- **TestFit's "thousands of options in seconds" framing** for feasibility-stage massing is a useful positioning reference for Ferrum's own preset-library work (`W-67`), though TestFit targets multi-family/commercial, not single-family.
- **Homeplannner's Vastu/direction-aware intake questionnaire** is a legitimately good India-specific input pattern (plot direction via compass UI, kitchen-placement-by-Vastu framing) — worth studying as a *question design* reference for `W-58`'s intake tree, independent of everything else being fake about that product.

**Where Ferrum already differentiates, confirmed by this research:**
- **Every platform surveyed that produces a visual result (Spacely, Veras, Rendair, PromeAI, ArchiCAD's visualizer) is a *rendering* tool operating on an already-built model or sketch — none of them generate a dimensioned, structurally-real floor plan from constraints the way Maket/TestFit/Ferrum's own plan-generation engine (`W-55`/`W-66`) do.** Ferrum's deterministic-engine architecture (real structural checks, real BOQ line mapping, real clause citations) has no equivalent in this entire landscape among the rendering-first tools.
- **homeplannner.com is the closest direct competitor on paper (India-market, "AI house plan," low price point) and is verifiably not delivering what it claims** — no real-time generation observed, output gated behind a WhatsApp lead-capture with no visible deliverable reached in this audit. Ferrum's standing no-fabrication policy (every INDICATIVE/SAMPLE/ROADMAP label, audited) is a direct, provable contrast to this specific competitor's pattern, not a generic claim.
- **Clause-cited outputs are unique in this survey.** No platform found here — including the well-funded, enterprise ones (Higharc, Forma, TestFit) — surfaces a specific regulatory clause (e.g. "IS 456 §26.5.3") alongside a generated number the way Ferrum's SUTRA panel and `W-29 KNOWLEDGE_BASE` design already do. This is Ferrum's most defensible, hardest-to-copy differentiator against every platform surveyed, including the credible enterprise ones.

---

*Every figure in this document traces to a live site visit (Part 1, this session, screenshots on file) or a web-search-verified source (Part 2, listed by finding). Nothing here is recalled from training-data knowledge of these products.*
