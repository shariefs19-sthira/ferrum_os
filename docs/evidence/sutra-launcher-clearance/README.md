# SUTRA launcher vs cookie bar / hero CTAs (MASON)

Cause: Concierge launcher kept `sm:bottom-6 sm:right-6`, overriding the cookie-aware base offset (`+ var(--cookie-consent-h)`), so at >=640px it sat over the consent bar ("Got it" hit-tested to the launcher; a real click opened SUTRA and never dismissed the bar).

Fix (Concierge.tsx only): drop the sm overrides; on phones (<sm) while the consent bar is showing the launcher collapses to a 48px icon-only button so it stays off hero CTA labels.

Audit: `FERRUM_AUDIT_BASE_URL=... node scripts/sutra-launcher-clearance-audit.mjs <outDir>` (7 viewports x cookie visible/dismissed, real click on Got it, elementFromPoint hit tests).
- `../sutra-launcher-clearance-before/` — b1c4f839: 7 FAIL (768/1024 launcher covers Got it; 1366/1440 sits over the bar; 375 covers hero CTA label).
- `./` — fix only: ALL PASS.
- `../sutra-launcher-clearance-merge-candidate/` — fix + afe09eb6 ProjectFirstHero (isolated build, that branch untouched): ALL PASS; at 320/375 the icon only overlaps empty right padding of full-width hero CTAs, never their centre or label.
