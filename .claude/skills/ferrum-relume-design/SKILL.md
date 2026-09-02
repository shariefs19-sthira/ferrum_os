---
name: ferrum-relume-design
description: Ferrum OS's Relume-derived design tokens, type scale, spacing, and button/card language — as actually implemented in apps/web/tailwind.config.js (W2-344), cross-checked against docs/RELUME_HANDOFF.md/RELUME_SPECS.md. Load before touching any UI in apps/web.
---

# Ferrum OS / Relume design tokens

Two sources exist and they disagree in places — this file reconciles
them and states which one wins:

- `docs/RELUME_HANDOFF.md` §4 "DESIGN TOKENS" — the original Relume
  export spec, monochrome/neutral-only, no brand colors chosen.
- `apps/web/tailwind.config.js` — the actually-implemented tokens,
  updated by W2-344, which derives a few values (`muted`) the handoff
  never specified.

**The Tailwind config is the implementation source of truth for code.**
The handoff doc is the design-intent source of truth for anything not
yet implemented. When they conflict on something already coded, the
Tailwind config is correct and the handoff is stale for that value.

## Color tokens

All under the `relume` namespace in Tailwind (`text-relume-ink`,
`bg-relume-surface`, etc.):

| Token | Value | Use |
|---|---|---|
| `relume.neutral` | `#161616` | brand neutral |
| `relume.ink` | `#070707` | heading, body, and accent text (Relume collapses these three to one value) |
| `relume.border` | `rgba(7,7,7,0.2)` | borders (alpha.20 on ink) |
| `relume.surface` | `#ffffff` | page/card background |
| `relume.surface-secondary` | `#F5F5F5` | secondary section background (neutral.50) |
| `relume.muted` | `rgba(7,7,7,0.66)` | **derived, not in the handoff** — secondary/muted copy. Use this instead of reaching for an off-palette gray like `text-gray-600`; it's ink at reduced alpha, same derivation pattern as the border token. |

No chromatic brand colors exist yet — the site is intentionally
monochrome. `primary`/`success`/`warning` (`#3b82f6`/`#10b981`/`#f59e0b`)
are pre-Relume leftovers explicitly marked in the config as NOT part of
the design system — don't reference them in new work; they're kept only
so nothing breaks, pending a zero-usage grep and deletion.

## Typography

- Font family: **Inter**, both heading and body (`var(--font-inter)`,
  falls back to `system-ui, sans-serif`).
- Heading weight: Semibold. Letter-spacing: **tight** — use the
  `tracking-relume-tight` utility (`-0.01em`), not a raw arbitrary value.
- Body weight: Regular.
- Both heading and body render at `relume.ink` — there is no separate
  heading/body color; hierarchy comes from weight/size, not color, and
  secondary text should use `relume.muted` explicitly rather than a
  lighter heading shade that doesn't exist.

## Spacing

- Section vertical rhythm: `relume-section` (`4rem`) — the value
  `SectionShell` already uses; use the named token, don't hardcode
  `py-16`/`4rem` again elsewhere.
- Card padding: `relume-card` (`2rem`).
- Container width: `max-w-relume-container` (`80rem`) — what
  `SectionShell` uses for its outer width.
- Prose/article reading measure: `max-w-relume-prose` (`48rem`) — for
  resource/blog article bodies, not general page containers.

## Shape

- Corner radius: `rounded-relume` (`0.5rem`). Applies to cards, inputs,
  and buttons uniformly — Relume's "Regular" corner radius token, one
  value site-wide, not a per-component scale.
- Border: `border border-relume-border`, stroke intensity "Regular"
  (alpha.20) per the handoff — containers get a border by default
  ("Container border: on").

## Buttons

Two variants, both already implemented as `PrimaryButton`/
`SecondaryButton` in `apps/web/components/sections/Buttons.tsx` — reuse
those components rather than re-deriving the classes:

- **Primary**: flat fill, `bg-relume-ink text-white`, `rounded-full`
  (not `rounded-relume` — buttons are pill-shaped, a deliberate
  exception to the corner-radius token), `px-6 py-3`, `text-sm
  font-medium`, `hover:opacity-90`.
- **Secondary**: bordered treatment, `border border-relume-border
  text-relume-ink`, same pill shape/padding, `hover:bg-relume-surface-secondary`.
- Link-style button: neutral color, no fill/border, per the handoff —
  not yet a shared component; match Primary/Secondary's font/padding
  language if you add one.

## Cards

- `rounded-relume` (not pill-shaped — cards keep the "Regular" corner
  radius, buttons don't), `border border-relume-border`,
  `bg-relume-surface`, `p-relume-card` (`2rem`) internal padding.
- On `surface-secondary` sections, cards typically sit on
  `bg-relume-surface` (white) to stay visually distinct from the
  section background — check existing sections (`CardGrid`,
  `SectionShell`) for the pattern rather than inventing a new
  card/section background pairing.

## Inputs

- Bordered treatment, `border-relume-border`, `rounded-relume`, color
  matches primary (ink), per the handoff. Existing form inputs across
  the site (login, signup, contact, demo) already follow this — match
  their exact class string rather than re-deriving it.

## Taglines / eyebrows

- Uppercase, Semibold, body font, no background treatment ("from-scheme,
  treatment None"). This is the `Eyebrow` component pattern used above
  section headings site-wide (`text-xs font-semibold uppercase
  tracking-[0.14em]` family of classes) — reuse `Eyebrow`, don't
  hand-roll the uppercase-label pattern again.

## Icons

- Outlined style, weight 400, no fill, colored from the current scheme
  (i.e. `relume.ink` or `relume.muted`, not an arbitrary icon color),
  "treatment Fill" meaning icons sit inside a filled shape (e.g. the
  circular step-number badges used in calculators/case-flow trackers)
  rather than floating bare.

## Shadows

None set — the design is deliberately flat (borders do the separation
work, not drop shadows). Don't add `shadow-*` utilities unless a
specific new pattern genuinely needs it and you're prepared to defend
the deviation.

## What NOT to do

- Don't invent a new color outside the `relume` namespace for anything
  in the current build — the whole site is intentionally monochrome
  until an operator brand decision changes that.
- Don't use `rounded-relume` on buttons or `rounded-full` on cards —
  the pill/rectangle-radius split is deliberate, not inconsistent.
- Don't reach for Tailwind's default gray scale (`text-gray-600`,
  `border-gray-200`, etc.) — use `relume-muted`/`relume-border` so
  everything stays on-token.
- Don't treat `docs/RELUME_HANDOFF.md` as gospel for anything already
  implemented differently in `tailwind.config.js` (e.g. `muted` isn't
  in the handoff at all) — the config is what actually ships.
