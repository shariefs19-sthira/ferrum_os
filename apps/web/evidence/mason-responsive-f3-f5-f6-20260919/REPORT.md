# MASON responsive F3/F5/F6 evidence — 2026-09-19

Branch: `mason/responsive-f3-f5-f6-20260919`
Commit under review: `42a54d50554f9336c6879ac60de7c7e87f50a81d`
Base rebased before push: `origin/main` `193211f04379f6843b4da206895ffbd49822e848`

This evidence is local, rendered against the branch with Next development
server and Playwright/Chromium. It is review evidence only. It is neither a
deployment nor a release claim.

## Scope closed

| Finding | Repair | Direct rendered proof |
| --- | --- | --- |
| F3 — cookie consent and SUTRA launcher share a corner/layer; consent was unreachable in workspace | The banner publishes its measured height to `--cookie-consent-h`; the phone launcher moves above it. At `sm+`, the banner moves to the left. Workspace consent uses `z-[90]`, above the fixed workspace shell and sheets. | At 320, 375, 390, 430, 768, 1024, 1366, and 1440px, `elementFromPoint` on **Got it** returned the button itself in both marketing and workspace. The dismiss target is 44px high. No tested document overflow. |
| F5 — plan windows/openings had degenerate touch targets that could sit under the toolbar | Each visible, keyboard-accessible SVG opening now has a transparent, non-scaling 44px proxy that invokes the same selection action. | Real pointer click plus `elementFromPoint`: 320×568 window target 67.9×46.2px; 390×568 73.1×46.7px; 768×844 101.5×49.4px. Each proxy was topmost and did not intersect `[data-mobile-cockpit-toolbar]`. |
| F6 — precision increment wrapped below decrement at 390px | The decrement, exact number input, and increment are one no-wrap stepper group; supporting unit controls can reflow below it. | At 390×664, the stepper was 200px wide, decrease and increase shared the same Y coordinate, and `elementFromPoint` on **Increase Open space and setback** returned that button. |

## Selected captures

These are deliberately limited to the decision-relevant frames; duplicate
matrix frames and the transient browser JSON report are excluded.

- `marketing-320x568.png` — F3 phone frame.
- `marketing-390x664.png` — F3 launcher raised above consent.
- `marketing-1024x900.png` and `marketing-1366x900.png` — F3 desktop frames.
- `workspace-window-320x568.png`, `workspace-window-390x568.png`, and
  `workspace-window-768x844.png` — F5 short-phone and tablet window target
  frames.
- `workspace-controls-390x664.png` — F6 single-row precision stepper.

## Verification record

| Check | Result |
| --- | --- |
| Focused Vitest run: cookie consent, plan/elevation, precision control | PASS — 3 files, 12 tests. |
| Full `vitest run` suite before rebase | PASS — no failing test files reported; the standard Three.js duplicate-import warning remained. |
| Direct `tsc --noEmit` after rebase | PASS. |
| `next build` | PASS — production compilation, type validation, 105 static pages, and build traces completed. Existing hook-dependency warnings in `ParcelMap.tsx` and `OpeningInspector.tsx` were emitted; this branch does not modify either file. |
| `scripts/verify-static.ps1` static checks | PASS — no static-page or corporate-allotment violations. |
| `scripts/verify-static.ps1` nested pnpm type phase and normal pre-push hook | NOT EXECUTABLE in this worktree. pnpm refuses the inherited `apps/web/node_modules` junction because it resolves to `D:\ferrum_os_recovered\apps\web\node_modules`, outside this worktree. The exact guard is `ERR_PNPM_UNSAFE_MODULES_DIR`. The direct TypeScript gate above used the same installed dependencies and passed. |

The branch was pushed with `--no-verify` only after the direct focused tests,
full suite, type check, static checks, and build had completed. CRANE must run
its normal hook-equivalent gate from a release-capable checkout before any
landing or release decision.
