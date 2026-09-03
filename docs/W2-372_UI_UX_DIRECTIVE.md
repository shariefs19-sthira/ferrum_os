# W2-372 — UI/UX Modernization Directive

**Status:** PROPOSED. Conductor approval is required before any site-wide implementation.

## TARGET

Give Ferrum OS a modern construction-tech character with strong technical roots while preserving its honesty system, Fe·26 identity, accessibility, and Relume spatial discipline.

## MANDATE

Adopt **Technical Minimalism** as the foundation: the skill database's low-risk *Minimalism & Swiss Style* (high contrast, geometric grid, restrained effects) combined with the structural grammar of *AI-Native UI* (minimal chrome, context cards, purposeful reveals) and *Bento Box Grid* (modular, asymmetric information hierarchy). Marketing and resource routes remain predominantly light. Account, Command Deck, and Analysis Engine surfaces may use bounded navy command-deck zones, never a site-wide dark skin. Bento is a hierarchy tool—not a field of decorative cards—and collapses 4 → 2 → 1 columns. Retain the Relume 80rem container, 4rem section rhythm, 2rem card padding, 0.5rem card/input radius, pill buttons, flat borders, and 48rem prose measure.

Reject the database's AI-purple accent, oversized Bento radii/shadows, HUD neon/glow, zero-interface hidden controls, broad glassmorphism, decorative gradients, and all-mono typography. Keep the Fe·26 SVG and footer line unchanged. `INDICATIVE`, `TEST MODE`, and `ROADMAP` remain visible text labels; status never depends on colour alone.

## TOKENS

The selected database palette is **Construction/Architecture** (industrial slate + safety orange). Ferrum substitutes its safety-orange `#EA580C` with the established Fe saffron `#FF9933` to preserve one accent; the rest of the palette remains in-family. Measured pairs meet WCAG AA: ink/saffron 9.45:1, white/navy 16.52:1, foreground/canvas 9.90:1, muted/canvas 7.24:1, white/green 4.61:1, and white/danger 4.83:1.

```css
:root {
  --fe-ink: #070707;
  --fe-command: #0b1f3a;
  --fe-steel: #64748b;
  --fe-steel-soft: #94a3b8;
  --fe-canvas: #f8fafc;
  --fe-surface: #ffffff;
  --fe-surface-muted: #ebf0f5;
  --fe-text: #334155;
  --fe-text-muted: #475569;
  --fe-border: #e2e8f0;
  --fe-accent: #ff9933;
  --fe-success: #138808;
  --fe-danger: #dc2626;
  --fe-on-accent: #070707;
  --fe-on-command: #ffffff;
  --fe-focus: #64748b;
  --fe-focus-dark: #ff9933;

  --font-heading: "Space Grotesk", system-ui, sans-serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --font-data: ui-monospace, "SFMono-Regular", Consolas, monospace;
  --type-display: clamp(2.75rem, 5vw, 4.5rem);
  --type-h1: clamp(2.25rem, 4vw, 3.75rem);
  --type-h2: clamp(1.75rem, 3vw, 2.75rem);
  --type-body: 1rem;
  --leading-body: 1.6;

  --space-section: 4rem;
  --space-card: 2rem;
  --grid-gap: 1rem;
  --container: 80rem;
  --measure: 48rem;
  --radius: 0.5rem;

  --motion-ui: 220ms;
  --motion-enter: 360ms;
  --motion-exit: 240ms;
  --motion-data: 600ms;
  --motion-stagger: 40ms;
  --ease-arrive: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-leave: cubic-bezier(0.4, 0, 1, 1);
}
```

Typography uses the database's **Tech Startup** pairing: Space Grotesk for headings and DM Sans for body/UI. Numeric columns, rates, identifiers, and chart values use tabular system-monospace figures. Body copy stays at least 16px, 1.5–1.75 line height, and 60–75 characters on desktop (35–60 mobile). Font loading must use local/Next font handling with swap/optional behaviour—no CSS `@import` and no package addition.

## MOTION AND DYNAMIC GRAPHICS

One small client observer may set reveal state; CSS handles opacity/transform keyframes. Limit each viewport to one or two meaningful reveal groups, stagger children by 40ms, animate only `transform` and `opacity`, and keep interactions live throughout. Hover feedback applies only where hover exists: border/ink change plus at most a 2px lift; tap, keyboard, and `:focus-visible` remain equivalent. Counters render the truthful final value in the DOM and may use a CSS typed-property/pseudo-element count-up as progressive enhancement. SVG charts may reveal strokes or bars over 600ms. `prefers-reduced-motion: reduce` removes translation, staggering, count-up, and chart drawing and exposes the final state immediately. No parallax, scroll-jacking, autoplay, perpetual pulse, or motion library.

The motion database returned no counter preset after the required broader retry; counter choreography is therefore an explicit synthesis of the skill's duration, transform-only, reduced-motion, and accessibility rules—not represented as a database preset.

## ANALYSIS ENGINE CHARTS

| Analytical question | Chart | Constraint |
|---|---|---|
| Cost/rate or scenario comparison | Sorted horizontal bar | Direct values; ≤15 categories; table beyond that |
| Progress, spend, or forecast over time | Line; confidence band only for a real forecast | Distinct line styles and named uncertainty; stat card if <4 points |
| KPI against target | Bullet chart grid | 3–10 KPIs; print value, target, and status |
| Additive budget/quantity variance | Waterfall | 4–12 components; signed labels and direction icons |
| Rate spread/outliers | Box plot | Only with ≥20 observations per group; label quartiles/outliers |
| Root-cause attribution | Decomposition tree | ≤5 levels and ≤20 visible nodes per level |
| Regional intelligence | Existing Leaflet map plus ranked bar/table | Use only when geography is the insight; never colour-only |

Every chart ships with a concise narrative and visible data-table fallback; hover details must also be reachable by keyboard. Animated or sample figures carry `INDICATIVE`; forecasts identify assumptions and confidence; no chart may imply unavailable production data. Implement with semantic HTML, CSS, and small inline SVG only—no new chart dependency.

## ACCEPTANCE

After approval: capture every route at 1366px and 375px before/after; preserve Fe·26, the footer line, and honesty-label grep counts; verify contrast, visible focus, keyboard use, touch targets, and reduced motion; report zero console errors; pass `pnpm --filter ./apps/web exec tsc --noEmit`, the production build, and `scripts/verify-static.ps1`; confirm `package.json` and `pnpm-lock.yaml` are unchanged. `apps/web/app/boq-pro/**` remains excluded unless the conductor grants a separate explicit RULE 6 exception.

## FAILURE / DEPENDENCY / COST

Any purple-gradient, pervasive-glass, neon-HUD, ornamental-motion, or fabricated-data result fails and must be reverted. Dependency cost is zero packages; implementation cost is one site-wide token/component pass plus route-level responsive visual QA. Proceed only after conductor approval of this directive and any required RULE 6 exception.
