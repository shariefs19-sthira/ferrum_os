# Ferrum OS app launch checklist

## Scope and current decision

W2-356 creates an Android Capacitor shell, originally targeting
`https://ferrum-os.shariefsatyala.workers.dev` (verified HTTP 200/HTML/manifest
on 2026-09-02). **Stale as of 2026-09-06: that host was operator-renamed and
retired on 2026-09-05 (now dead, per docs/FLEET_SEATS.json's `deployment`
block) — the shell's actual config still points at the dead host, tracked as
a live defect on docs/TASK_BOARD.md's W-83 row.** The current live host is
`https://ferrumos-preview.shariefsatyala.workers.dev`, per that same single
source of truth. The shell permits only its configured HTTPS host and
disables cleartext traffic. It uses no native device permissions beyond
Internet and network-state detection.

The launch vehicle for v1 is **Capacitor**, not TWA. Capacitor retains a
controlled upgrade path for native capabilities while leaving the deployed web
origin as the single application surface.

## PWA vs native decision matrix

| Decision area | Installable PWA | Capacitor shell (W2-356) | Trusted Web Activity |
| --- | --- | --- | --- |
| Primary runtime | Browser | Android WebView through Capacitor | User's browser in full-screen Android mode |
| Web release cadence | Immediate | Immediate for remote web content; native changes require app release | Immediate |
| Native API growth path | Browser APIs only | Capacitor plugins and native code | Very limited; delegate to browser/web APIs |
| Play Store identity | Optional | Standard Android application | Standard Android application |
| Offline entry state | Requires service-worker cache | Native offline notice at cold start; cached web flow requires site service worker | Requires service-worker cache |
| Android App Links verification | Optional | Optional for v1 | Required; production `assetlinks.json` must match release signing certificate |
| Suitable v1 choice | Yes, alongside the shell | **Selected** | Not selected until ownership verification is available |

## Pre-build

- [x] Confirm the target URL is HTTPS and reachable.
- [x] Pin the shell to the production deployment host; prohibit cleartext navigation.
- [x] Add adaptive launcher icon, Android 12+ splash configuration, and cold-start offline notice.
- [x] Run `apps/mobile/scripts/verify-android-skeleton.ps1`.
- [ ] Install Android SDK API 35 and JDK 17 on the release workstation.
- [ ] Run `gradle :app:assembleDebug` from `apps/mobile/android` and test on an API 26+ device.

## Release readiness

- [ ] Create the final Android signing key in approved secret management; do not commit keys or fingerprints.
- [ ] Set release version code/name.
- [ ] Test online/offline cold launch, reconnect, rotation, lifecycle return, and external links.
- [ ] Test authentication/session continuity inside Android WebView.
- [ ] Confirm actual error reporting, privacy disclosures, support contact, and Play Data safety declarations.
- [ ] Apply and verify the two web-owned lines in `docs/pwa-wiring.patch`, then test the cached offline route after a successful online visit.
- [ ] Produce a signed release build and install it on a clean device before Play submission.

## TWA gate (not a v1 launch condition)

Do not build a TWA until CRANE can serve `/.well-known/assetlinks.json` from
the production origin with the final release certificate SHA-256 fingerprint.
That value is not available in this repository and must not be invented. The
TWA choice is explicitly blocked, not partially configured.

## Undo

`git revert <W2-356 commit SHA>`
