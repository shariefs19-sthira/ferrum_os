# 320x640 "Model & connections" timeout - diagnosis (MASON)

Verdict: (b) audit / static-host artifact, not a product defect.

Cause. `scripts/sutra-panel-height-audit.mjs` sends six questions, two of which ("what does LandIntel do for a parcel buyer ...")
match SUTRA's deterministic catalog route. `answerWithGrounding` returns `navigateHref: '/products/landintel'` and
`Concierge.handleSend` calls `setTimeout(() => router.push(href), 400)` (apps/web/components/Concierge.tsx). On a host that serves
the RSC payload (`/products/landintel.txt?_rsc=...`) this is a soft navigation: `<Concierge />` lives in the root layout, so the
panel and its messages survive (verified on the local static build and on the deployed preview edge). On a static file server that
cannot serve the payload, Next logs "Failed to fetch RSC payload ... Falling back to browser navigation" and does a full page load;
React state resets, the dialog is gone and the launcher is back, so `getByRole('button', { name: /Model & connections/ })` (inside the
now-`hidden` aside) never appears. The script aborts on the first failed step, and 320x640 is the first viewport, which is why only
320x640 was reported.

Evidence (this directory):
- `320x640-FAILURE.png` - moment of failure with the RSC-less static host: page is /products/landintel, launcher visible, panel closed.
  DOM at that moment: `{"url":"/products/landintel","dialogOpen":false,"asideRole":"complementary","asideHidden":true,"launcherPresent":true,"navEntries":["navigate http://127.0.0.1:4191/products/landintel"],"messageCount":2}`
  (messageCount 2 = conversation reset to the greeting; `navigate` = a full document load).
- `320x640-rsc-served-panel-survives.png` - same flow with RSC payloads served: panel still open, 14 messages.
- Reproduction: `NO_RSC=1 node scripts/audit-static-server.mjs apps/web/out 4191` then the pre-fix audit against :4191 -> timeout at "Model & connections".
  Same audit against a normal host (node server :4189, `python -m http.server` :4190): 165/165.
- Edge check, headless isolated Chromium, 320x640, https://ferrumos-preview.shariefsatyala.workers.dev: `/products/landintel.txt?_rsc=` -> 200 text/plain;
  after the LandIntel question the URL becomes /products/landintel and the dialog stays open with the conversation intact (14 messages).

Fix (audit only, no product change): the audit's questions no longer match a route (so nothing navigates), and a new check
`conversation stays on the home route (no SUTRA navigation)` waits past the 400 ms timer so an accidental route match fails with a clear
message instead of a downstream timeout. Post-fix: 173/173 on :4189 (node), :4190 (python) and :4191 (RSC payloads disabled).
