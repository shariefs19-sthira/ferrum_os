# Homepage hero vs cookie strip (MASON, 2026-09-19)
Root cause: `ProjectFirstHero` used `lg:items-center`, so the hero copy was vertically centred against the ~700px path-card aside; at 1024/1366/1440 this pushed the CTA row ~250px down, into (or below) the fixed cookie strip at first paint. Below `lg` the CTAs sat under the strip only on very short phones (320x568), where the copy stack is tall.
Fix (scoped to `components/sections/ProjectFirstHero.tsx`): top-align columns at `lg`, plus media-query (height) compaction on short viewports. No reserved gap: nothing persists after the banner is dismissed.
Probe: `apps/web/scripts/home-cookie-hero-audit.mjs` (real Chromium, real click / keypress dismissal, hit-test of every hero control, overflowX, screenshot at scroll 0).

BEFORE (main b0c8b4645): FAIL 320x568 (Start overlaps banner, Explore below fold), 1024x768 (CTAs y=868, below fold), 1366x768 (CTAs y=763-807 overlap banner 707-768). 375/390/768/1440x900 passed.
AFTER: ALL PASS at 320x568, 375x667, 390x844, 768x1024, 1024x768, 1366x768, 1440x900, cookie visible and dismissed, overflowX=0. See after-results.txt.

Not fixed (out of scope, global `Concierge.tsx`, reported to owner): the SUTRA launcher's `sm:bottom-6` drops the `--cookie-consent-h` offset, so at >=640px it sits on top of the banner and covers the "Got it" button (visible in after-1024x768-cookie-visible.png); at 320 it overlaps the right of the "Explore the building library" button.
