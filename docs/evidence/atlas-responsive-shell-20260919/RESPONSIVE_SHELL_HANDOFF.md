# Ferrum Responsive Shell — ATLAS architecture/UX handoff (read-only audit)

Base: origin/main `badf2e247`. Status: DESIGN HANDOFF, INDICATIVE — no implementation files touched, nothing landed/deployed.
Reference pattern only (map-as-base, top action row, chips, compact bottom nav, expandable sheet, full-height side menu, floating launcher). No third-party trade dress, assets, copy or code; Ferrum tokens (`relume-*`) only.

## 1. Current state (verified in tree)

| Area | Fact | File |
|---|---|---|
| Web nav | Sticky header; desktop links at `lg:` (>=1024); below that a dropdown `MobileMenu` (`aria-modal=false`, popover, no scrim/focus trap, `lg:hidden`). No persistent bottom nav anywhere. | `components/SiteHeader.tsx`, `MobileMenu.tsx` |
| SUTRA (public) | `Concierge` = fixed `bottom-6 right-6` 56px launcher; open = 22rem x 28rem floating dialog, `aria-modal=true`. Only mounted by `SiteShell` on non-workspace routes. No minimize/full-screen state. | `Concierge.tsx`, `SiteShell.tsx` |
| SUTRA (cockpit) | `SutraPanel` dark chip-tree panel inside cockpit; guided fallback toggled via `data-guided-open`. | `workspace/SutraPanel.tsx`, `globals.css` |
| Cockpit shell | `/project-workspace*` bypasses site chrome. `WorkspaceCockpit` grid: 1 col below `xl` (1280); 3-col `xl:[17rem_1fr_18rem]`. Mobile toolbar is a 4-col top strip (`data-mobile-cockpit-toolbar`). Sheets (`options`, `extract`) are `fixed inset-x-2 bottom-[max(.5rem,env(safe-area-inset-bottom))] max-h-[min(82dvh,36rem)] z-[80]`, become right-side panels at `lg`. Scrim `z-[70]`. `FullscreenController` = Fullscreen API + `fixed inset-0 z-[100] h-dvh-safe`. | `WorkspaceCockpit.tsx`, `FullscreenController.tsx`, `CanvasSlot.tsx` |
| LandIntel map | `UlpinMapExplorer` (Leaflet via `ParcelMap`): mode chips row, record card overlay `absolute inset-x-3 top-3 z-[500]` with `data-map-overlay`, tooltips `z-[700]`. Overlay covers the map permanently once a record exists. | `sections/UlpinMapExplorer.tsx`, `ParcelMap.tsx` |
| DesignStudio | Cockpit + `designstudio/*Panel` (ShellCatalog, Suitability, EnvironmentalContext) stacked in page flow; no sheet treatment. | `components/designstudio/*` |
| Native app | `apps/mobile` is a Capacitor wrapper whose `server.url` loads the same Worker origin. Device parity = the web build; there is no separate native UI. | `apps/mobile/capacitor.config.json` |
| Safe area | Sheets already use `env(safe-area-inset-bottom)` but **`app/layout.tsx` exports no viewport / `viewport-fit=cover`** (and `apps/mobile/web/index.html` lacks it), so on notched devices/Capacitor the inset resolves to 0. Header, launcher (`bottom-6`) and Concierge ignore insets entirely. | `app/layout.tsx` |
| Breakpoints | Tailwind defaults (sm640/md768/lg1024/xl1280); no `screens` override, no shared hook. Components disagree: header `lg`, cockpit grid `xl`, sheets `lg`, toolbar labels `sm/md`. | `tailwind.config.js` |
| z-index | Ad hoc: header 40, Concierge 50, MobileMenu 50, MoreDrawer 50, scrim 70, sheets 80, fullscreen 100, map overlay 500, tooltips 700 (Leaflet panes 200-700 collide). | various |

Gaps: (1) no unified sheet state machine, (2) no bottom nav, (3) SUTRA cannot go full-screen/minimize and can overlap sheets, (4) map/canvas obscured by persistent record card, (5) no viewport-fit/safe-area for header/launcher, (6) inconsistent breakpoints/z-scale, (7) MobileMenu lacks focus management.

## 2. Breakpoint contract (single source: `lib/shell/breakpoints.ts` + CSS vars)

| Tier | Width | Layout |
|---|---|---|
| **Compact** (everything below desktop: phones + tablets, portrait/landscape) | 0-1023 | Full-bleed base (map/canvas/page), top action row, chips, bottom nav, sheets, side drawer. |
| **Desktop** | 1024-1439 | Header nav; base + one docked right pane (24rem). SUTRA = docked pane or floating. |
| **Wide** | >=1440 | Three-pane: left context rail 17rem / base / right pane 24rem; SUTRA docked, panes co-exist. |

Rules: 768-1023 tablets get the compact shell (only density changes; `sm` 640+ allows two-column sheet content). Cockpit's `xl` (1280) 3-col moves to `wide` (1440); 1024-1439 uses 2-pane. Landscape phone with height <500px: bottom nav icon-only 48px, sheets cap at `70dvh`. Implement via CSS `@media` + `useShellTier()` (matchMedia, SSR default = compact); no user-agent branching.

## 3. Persistent navigation (compact)

- **Top action row** (48px + `env(safe-area-inset-top)`): menu button (opens drawer), search/command field, one context action (Fullscreen / Layers). Over the base with soft scrim; never taller than 56px.
- **Context chips** under it (horizontal scroll, snap, 44px targets): LandIntel modes, DesignStudio views (Plan/Elevation/3D), workflow stage.
- **Bottom nav** (56px + `env(safe-area-inset-bottom)`, max 5): Map, Design, Evidence, SUTRA, More. Active = `aria-current="page"`. Hidden while SUTRA full-screen or keyboard open (`visualViewport` shrink).
- **Side drawer** (full height, 88vw max 22rem): full site/product nav + account; replaces `MobileMenu` dropdown; modal (scrim, focus trap, Esc, focus return). Marketing routes keep header + drawer; bottom nav only on product/workspace routes.
- **Desktop**: existing header nav (>=1024); bottom nav and drawer not rendered.

## 4. Sheet / full-screen state hierarchy

One `ShellProvider` state machine (single active layer; stack depth max 2):

```
base (map/canvas, always mounted)
  L1 peek sheet     ~96px handle+summary; non-modal; base interactive
  L2 half sheet     50dvh; non-modal; no scrim
  L3 full sheet     calc(100dvh - top row); modal; base inert
  L4 SUTRA full     100dvh; modal; minimizes to launcher chip
  D  side drawer    modal
```

- peek<->half<->full by handle drag **and** buttons ("Expand/Collapse/Close"); every state keyboard-reachable.
- **Minimize SUTRA** returns to the prior layer and leaves a 44px chip above bottom nav (`bottom: calc(56px + inset + 12px)`); keep panel mounted (`inert`/hidden, not unmounted) to preserve draft + scroll.
- **Full-screen SUTRA reading**: L4, sticky header (Minimize, Copy, Citations), reading column max 68ch on desktop, body scroll locked, `overscroll-behavior: contain`.
- Only L3, L4, D are modal. Peek/half never trap focus or dim the base.
- Deep links `?sheet=half|full&panel=<id>&sutra=full` survive reload/Capacitor resume; Back pops one layer (History push on L3/L4/D).
- z-scale tokens replace ad hoc values: base 0, map-controls 10, top-row 20, bottom-nav 30, sheet 40, scrim 45, sheet-modal 50, drawer 60, sutra 70, fullscreen 80, toast 90. Map container gets `isolation:isolate` so Leaflet panes (200-700) stay inside the base.

## 5. Focus, scroll, safe-area

- Export `viewport = { width:'device-width', initialScale:1, viewportFit:'cover' }` from `app/layout.tsx`; mirror in `apps/mobile/web/index.html`; define `--safe-top/right/bottom/left` from `env(safe-area-inset-*)` and use on every fixed surface (header, top row, nav, sheets, launcher, Concierge).
- Heights: keep `.h-dvh-safe` (vh fallback then dvh); sheets in `dvh`; lift inputs via `visualViewport` when keyboard opens; never bare `100vh`.
- Focus: modal layers trap focus + `inert` siblings, initial focus = close/first field, Esc closes top layer only, focus returns to opener. Non-modal sheets: no trap; handle is a `button` with `aria-expanded`/`aria-controls`.
- Scroll: one scroll owner per layer; sheet body `overflow-y:auto; overscroll-behavior:contain`; body scroll lock only for modal layers, restoring position. Drag starts from handle only so it never fights inner scroll.
- Targets >=44x44 (`min-h-11` convention); `motion-reduce:` disables sheet animation; visible focus ring `outline-relume-accent`.
- **Base-unobscured rule**: with no panel active (base/peek) the map/3D canvas has only top row (<=56px), chip row, bottom nav and one 44px SUTRA chip. The LandIntel record card and any `data-map-overlay` moves into the peek/half sheet on compact and docks in the right pane on desktop — never floating over the map centre. Layout via CSS grid `auto 1fr auto`, not absolute overlays, so the render surface is not resized when sheets peek.

## 6. Device parity

- One Worker origin feeds browser and Capacitor shell, so parity comes from one responsive implementation; no forked native UI. Matrix: iOS Safari 15.4+, Android Chrome, Capacitor Android WebView, tablet portrait/landscape, desktop 1024/1440/1920. iOS Capacitor project is absent from repo (gap).
- Capacitor: apply viewport/status-bar decisions in `apps/mobile` only after web tokens ship; hardware Back maps to the layer stack.
- Flag `NEXT_PUBLIC_SHELL_V2` (default off) for staged rollout.

## 7. Reuse map

| Existing | Use |
|---|---|
| `FullscreenController` | Keep for cockpit fullscreen; not for SUTRA (different semantics). |
| `WorkspaceCockpit` mobile sheets (`data-mobile-sheet`, scrim, safe-area bottom) | Migrate onto shared `Sheet` primitive; content unchanged. |
| `MoreDrawer` | Content for the "More" nav destination. |
| `TabRail`, `WorkflowRail`, `CommandBar`, `RegistryControls` | Feed chips/top row; no rewrite. |
| `MobileMenu` | Replace dropdown with side `Drawer`; reuse link list + Esc logic. |
| `Concierge`/`SutraPanel` | Wrap in `SutraLayer` (chip/half/full); message state untouched. |
| `UlpinMapExplorer`/`ParcelMap` | Record card to sheet slot; keep mode chips. |
| `designstudio/*Panel` | Sheet sections on compact, right pane on desktop. |
| `.h-dvh-safe`, `.max-h-dvh-safe-*` | Keep; add `--safe-*` beside them. |
| **New (small)** | `components/shell/{ShellProvider,Sheet,Drawer,BottomNav,TopActionRow,useShellTier}.tsx`, `lib/shell/{breakpoints,layers,zScale}.ts` |

## 8. File ownership / overlap avoidance

| Path | Owner | Note |
|---|---|---|
| `components/shell/**`, `lib/shell/**`, `SiteHeader`, `MobileMenu`, `SiteShell`, `app/layout.tsx` viewport, shell tokens in `globals.css` | Shell seat (MASON per lean-fleet product/client mapping; CRANE lands) | Additive; `app/layout.tsx` is not RULE 6 protected. |
| `WorkspaceCockpit`, `CanvasSlot` | **Current cockpit agent** | Shell only defines a wrapper contract (`layer`, `onLayerChange`); no shell-seat edits until that work lands. |
| `Concierge`, `SutraPanel`, `lib/sutra/**` | **Current Concierge/SUTRA agent** | Shell supplies `SutraLayer` slot API; SUTRA agent adopts it. |
| `Space3D`, slider audit | **Current agents** | Only contract: canvas must not resize on peek/half. |
| `UlpinMapExplorer`, `ParcelMap`, `designstudio/*` | Shell seat, after cockpit/SUTRA PRs land | Sequenced to avoid conflict. |
| `apps/mobile/**` | RIVET/MASON | Viewport/back-button only. |
| RULE 6 paths (`next.config.js`, `middleware.ts`, `package.json`, `boq-pro/**`) | Untouched | No deps needed (CSS + pointer events). |

Sequence: S0 tokens/viewport -> S1 primitives -> S2 marketing nav -> S3 LandIntel -> S4 DesignStudio/cockpit adoption (after owners land) -> S5 SUTRA layer -> S6 desktop multi-pane.

## 9. Staged acceptance tests

Unit (Vitest, existing `*.test.tsx` style): tier hook = compact/desktop/wide at 1023/1024/1439/1440; reducer permits one modal layer, Back pops one; Sheet exposes `aria-expanded`, Esc closes only top modal; scroll lock restores position.
- **S0**: viewport meta has `viewport-fit=cover`; `--safe-*` defined; no visual change with flag off.
- **S1**: Sheet/Drawer axe-clean; focus trap + return; reduced-motion = no transition; no raw `z-[n]` in shell files.
- **S2**: at 390x844, 768x1024, 1023 wide: bottom nav present, header nav absent; at 1024 inverse; drawer full height; nav clears emulated 34px bottom inset.
- **S3**: LandIntel with record selected at 390x844: map visible >=60% of viewport in peek; no `data-map-overlay` inside map rect on compact; tooltips not clipped.
- **S4**: cockpit/DesignStudio canvas bounding rect identical (+-1px) across base/peek; opening half/full does not re-render Space3D.
- **S5**: SUTRA full -> minimize restores prior layer, draft and scroll; chip sits above bottom nav; scroll lock on/off; never two modal layers.
- **S6**: 1024-1439 two-pane, >=1440 three-pane; SUTRA docks; tab order left->base->right; no horizontal page scroll 320-1920.
- **Cross-device** (Playwright + Capacitor Android emulator): matrix in section 6; keyboard-open input stays visible; hardware Back pops layer; rotation keeps layer; 320px no clipping. Gate per RULE 5 (`verify-static.ps1`, `tsc --noEmit`) plus the above.

## 10. Risks / open decisions

1. iOS Capacitor shell absent from repo; iOS parity is web-only until added.
2. Leaflet z-index isolation may require a `ParcelMap` edit (shell seat, after S3 sequencing).
3. Bottom-nav item set (5) needs operator sign-off; proposed: Map, Design, Evidence, SUTRA, More.
4. Sheet drag via pointer events, no library (dependency adds are CRANE-only).

-- ATLAS
