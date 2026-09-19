# SUTRA launcher accessibility (MASON)

`node scripts/sutra-launcher-a11y-audit.mjs` - 8 viewports (320x568, 320x640, 375x667, 390x844, 768x1024, 1024x768, 1366x768, 1440x900), headless isolated Chromium, static-export build. 184/184 checks in `results.json`.
Verified per viewport: aria-label "Open SUTRA" (also while the label is sr-only on phones); hit box >= 44x44 (launcher 48x48 icon-only / 110x48 labelled; Got it 78x44); launcher then Got it each reachable by Tab exactly once in DOM order; closed panel adds no tab stops; Tab / Shift+Tab leave the launcher (no trap) and the tab order terminates; visible 2px outline on keyboard focus; Enter opens the dialog with focus inside, Escape closes it and returns focus to the launcher; Got it works by Enter and by real click; reload with consent accepted -> no banner, --cookie-consent-h unset, launcher at the 24px base offset.
Observation, not a failure: after Got it is activated the button unmounts and document.activeElement becomes <body>.
