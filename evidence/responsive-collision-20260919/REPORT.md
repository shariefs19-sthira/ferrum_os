# SENTINEL responsive collision audit — 2026-09-19

Read-only. Base: `origin/main` @ `badf2e247`. Local `next dev` (port 3917). Playwright/Chromium.
Widths 320/360/375/390/430/768/1024/1440 x 33 routes (home, project-workspace{,/cockpit,/demo,/projects}, all `/products/*`,
`/boq-pro`, pricing, demo, get-started, contact, login, dashboard, about, partners, careers, documentation, account, resources).
Plus state sweep (open each toolbar/menu control, hit-test every control) at heights 568/664/800.
Scripts: `scripts/audit/*.mjs`. Raw: `results.json`, `../responsive-collision-20260919-state/state-results.json`.
Caveat: audits committed `main` only; uncommitted MASON edits to WorkspaceCockpit/RegistryControls are NOT included.
Caveat: 390px marketing-page rows partly errored (concurrent runs interrupted navigation); 375/430 cover the same layout.

## F1 (P1) Export DXF / IFC bar is unreachable on any phone shorter than ~826px  [primary repro of the screenshot]
- Repro: `/project-workspace`, 390x664 (typical iOS/Android browser viewport). Screenshot `shots/pw_390x664_initial.png`: the dark export bar is gone.
  DOM: `elementFromPoint` at Export DXF centre = `<canvas aria-label="Architectural model…">`; Export IFC centre = the `data-mobile-canvas-status` strip.
  568/664/700 all unreachable; 844 OK (`pw-short-viewport.mjs`).
- Root cause: `components/workspace/Space3D.tsx:416` frame is `flex h-full min-h-[24rem] flex-col` (384px min incl. status strip).
  It is mounted in `WorkspaceCockpit.tsx:569` `data-cockpit-canvas` = `absolute inset-x-0 bottom-0 top-[7.25rem]` whose height is
  viewport − 170 (header) − 116 (top offset) − 33 (result line) − 121 (ExportBar). Below ~826px the wrapper (e.g. 222px at 664) is shorter
  than the 384px min-height, the frame overflows the wrapper, and because the wrapper is `absolute` (positioned) it paints ABOVE the
  static `ExportBar` / result line siblings → canvas swallows taps and hides the bar.
- Fix (owner MASON, WorkspaceCockpit + Space3D): drop `min-h-[24rem]` from the canvas-first case (use `min-h-0`), add `overflow-hidden`
  to `[data-cockpit-canvas]`, and give the ExportBar `relative z-10` (or make the canvas wrapper `z-0` + bar `z-10`). Better: make
  ExportBar a flex child of the section (not under an absolute sibling) and let the canvas fill the remaining flex space instead of `top-[7.25rem]`.
  Also 121px export bar is tall on 320–430 (wraps to 2 rows); make it `flex-nowrap` + compact labels.

## F2 (P1) Desktop tool rail hidden under canvas toolbar and overlays Export bar (1024–1440)
- Route `/project-workspace` and `/project-workspace/cockpit`. Screenshot `shots/pw_1024_top.png`: "Select" and "Measure" white round buttons are
  hidden/clipped under the toolbar ("Comp…" cut), rail buttons are 34px wide (`Select` label squeezed), rail column runs down over the Export bar.
- Geometry @1024: rail wrapper `[8,117,80,775]`; canvas toolbar rows `[1,110,670,109]` + task toolbar `[1,219,670,45]` (z-40, in front) → Select `hitBy: Copy view link`, Measure `hitBy: Controls`. Export bar `[1,830,670,69]` is inside rail extent (rail bottom 892). @1280/1440 Select is still covered (by `Controls`).
- Root cause: `app/project-workspace/cockpit/page.tsx:209` `absolute bottom-2 left-2 top-2 z-30 hidden w-20 lg:block` pins the rail to the whole `main`, but `WorkspaceCockpit`'s own toolbar (`relative z-40`, wraps to 3 rows at lg) occupies the top 110–264px of that same area; the rail spans past `data-export-bar`.
  Also `ToolsRuler` rail mode gives buttons `w-full min-w-0 px-1` inside `w-20`.
- Fix (owner CRANE — cockpit/page.tsx, or MASON if cockpit toolbar moves): place the rail in the canvas-column grid (`grid-cols-[5rem_1fr]`) or
  offset it `top-[calc(var(--cockpit-toolbar-h))]`/`bottom-[ExportBar h]`; simplest: `top-[17rem] bottom-[5rem]` is brittle, prefer layout column. Ensure rail is not over ExportBar/status.

## F3 (P2) Cookie banner (z-50) vs SUTRA FAB (z-50): 27 routes, all widths
- `CookieConsent.tsx` `fixed inset-x-4 bottom-4 z-50` and the "Open SUTRA" FAB `fixed bottom-6 right-6 z-50` occupy the same corner at the same z-index; "Got it" sits over the FAB (`/` @1024: Got it [901,817] vs FAB [944,820]); on ≤430px the 150px banner also covers footer links and page CTAs until dismissed.
- On `/project-workspace*` the banner is entirely under the workspace `fixed inset-0 z-70` layer (Got it hit-tests to Export bar) → banner can never be dismissed there, but no visible collision. 
- Fix (owner CRANE/ATLAS shared chrome): FAB `bottom-[calc(theme(spacing.6)+var(--cookie-h,0px))]` or move banner to `z-[60]` and hide FAB while banner shown; on workspace render banner above z-70 or defer until leaving.

## F4 (P2) Mobile toolbar row clips "Copy view link"/"Fullscreen" (320–430)
- `/project-workspace` 320: Copy view link `x=354` > viewport 320 (in Plan view Fullscreen too, at all ≤430). Row scrolls but shows a mid-word cut ("Cop") with no affordance — `shots/pw_390x844_initial.png`. Owner MASON (WorkspaceCockpit toolbar at ~L510–520): wrap or shorten to icon buttons.

## F5 (P2) Plan view: window/opening hit targets 1–2px tall under toolbar (≤390x568, 768)
- "Select window, 1.50 metre wide" targets `[179,295,6,1]`, covered by `[data-mobile-cockpit-toolbar]`. Degenerate targets from plan view geometry; owner MASON (plan overlay) — enforce min 44px hit area or hide when collapsed.

## F6 (P3) PrecisionControl steppers wrap: "+" drops to its own row from "−" (390) — `components/controls/PrecisionControl.tsx:7` (`flex flex-wrap`; number input `w-24`, unit label and unit toggle push "+"). Fix: put `−`, input, `+` in a no-wrap group, unit toggle below. Screenshot `shots/pw_390x664_controls.png`.

## F7 (info) Controls sheet itself is sound on main
- `RegistryControls` mobile sheet (`fixed inset-x-2 bottom-… z-[80] max-h-[min(82dvh,40rem)]`) hit-tests OK at 320–430 x 568–844: all 6 controls reachable, slider `<output>` label aligned. I could NOT reproduce a slider labelled "3.5 m" over the export bar from a clean state; the closest match to the user's screenshot is F1 (bar hidden under canvas at phone heights) combined with the bottom sheet, or uncommitted MASON edits in the shared checkout. Ask for the screenshot's device height / product tab to pin it.

## Non-findings (scripts flag these; verified benign)
- Marketing header/footer "covered" reports are footer/hero links scrolling under the sticky header — expected. No horizontal overflow on any page/width. No `≥400` responses. Closed `<details>` (workflow menu) renders geometry but is `content-visibility: hidden` — not a defect.
- Product pages (`/products/*`, marketing pages): only F3 (cookie/FAB) is material.
