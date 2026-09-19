# SUTRA open-panel height audit (MASON)

`node scripts/sutra-panel-height-audit.mjs` (dev or static-export server on FERRUM_AUDIT_BASE_URL; see scripts/audit-static-server.mjs) — 173/173 checks in `results.json`.
Viewports: 320x640, 375x667, 390x844 (+ keyboard approximation: viewport shrunk to 320px tall with input focused), 768x1024, 1024x768, 1366x768, 1440x900, 1280x480 (short). Stages: initial, open with cookie bar, conversation, chrome expanded, minimized, reopen.
sm+ : right-side panel from below the 77px site header (top 5rem) to 1.5rem + cookie bar above the bottom; width clamp(24rem,36vw,36rem). Phones: unchanged full-screen sheet. Secondary chrome collapsed by default and capped at 35% of the panel.
Keyboard is approximated by viewport resize, not a real on-screen keyboard.
Audit fix (MASON, r2): questions no longer match a catalog route, so SUTRA never calls router.push mid-run; a route guard check was added (165 -> 173 checks). Cause and evidence of the earlier 320x640 timeout: `../sutra-panel-diagnosis/`.
