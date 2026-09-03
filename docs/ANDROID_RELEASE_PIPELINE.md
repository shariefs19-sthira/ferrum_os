# Android release pipeline

## 1. Scope

This runbook releases the W2-356 Capacitor shell. It is not a TWA runbook:
TWA remains blocked until the production origin serves a verified
`assetlinks.json` for the final signing certificate.

## 2. Verified shell baseline

| Item | Value |
| --- | --- |
| Application ID | `dev.ferrumos.shell` |
| Runtime origin | `https://ferrum-os.shariefsatyala.workers.dev` |
| Cleartext traffic | Disabled |
| SDK range | min 26, target/compile 35 |
| Java level | 17 |
| Gradle wrapper | 8.9 |
| Android Gradle Plugin | 8.7.3 |
| Current version | code `1`, name `0.1.0` |

The only declared permissions are Internet and network-state access. Do not
add permissions, SDKs, plugins, or signing material as part of a release
routine without an approved task.

## 3. Release inputs and ownership

The operator provides the release version, Play Console account, privacy and
Data safety declarations, support contact, and approved secret-management
location for the signing key. The release workstation receives JDK 17 and an
Android SDK with API 35. The signing key, passwords, aliases, fingerprints,
and Play credentials must never enter Git, build logs, or issue text.

## 4. Preflight

1. Start from the intended, reviewed commit; record its SHA in the release
   ticket.
2. Run `apps/mobile/scripts/verify-android-skeleton.ps1` and stop on any
   failure.
3. Reconfirm both Capacitor config copies still pin the one HTTPS host and
   retain `cleartext: false`.
4. Confirm the release version is higher than the latest Play artifact before
   editing `versionCode` and `versionName` in the approved release change.
5. Confirm the signed launcher and splash assets are the current Fe·26 mark.

## 5. Build and sign

1. Load signing credentials only through the release workstation's approved
   secret mechanism.
2. Add or select the approved release signing configuration outside source
   control; W2-356 intentionally contains no signing configuration.
3. From `apps/mobile/android`, run:

   ```powershell
   .\gradlew.bat :app:assembleRelease :app:bundleRelease
   ```

4. Archive the signed APK/AAB with the commit SHA and version in the release
   system, not in the repository.
5. Verify the signed APK with `apksigner verify --verbose --print-certs` and
   compare the displayed certificate fingerprint with the operator-approved
   release record.

## 6. Device acceptance

Install the signed build on at least one API 26+ device and one current Android
device. Exercise:

- first online cold start and first offline cold start;
- reconnect after offline startup;
- rotation, background/foreground return, and process recreation;
- external links and back navigation;
- authenticated session continuity inside the WebView; and
- adaptive/round launcher rendering plus Android 12+ splash rendering.

Record actual device model, Android version, result, and any failed case. A
cached offline page requires web-owned service-worker wiring and a prior online
visit; do not represent the native offline notice as a full offline PWA.

## 7. Play submission gate

Before internal testing upload, confirm the package name, release version,
certificate, Data safety declaration, privacy URL, support contact, content
rating, and testing-track audience with the operator. Upload only the signed
AAB. The Play Console's validation result and internal-test install are release
evidence; a locally built artifact alone is not a release.

## 8. Rollback

Do not overwrite or delete a live Play artifact. Halt rollout or use Play
Console rollback controls; then ship a higher `versionCode` containing the
correction. For source rollback, use `git revert <release-commit-sha>` in a
reviewed branch and repeat this runbook.

## 9. Evidence checklist

- [ ] Commit SHA and diff reviewed.
- [ ] Shell verifier passed.
- [ ] Signed APK certificate verified.
- [ ] Signed AAB accepted by the intended Play track.
- [ ] Device matrix recorded.
- [ ] Privacy, support, Data safety, and content-rating records approved.
- [ ] Rollout decision recorded by the operator.

## 10. Playbook lesson

A web shell's static build passing proves neither its release identity nor its
device behaviour: signing, Play validation, cold-start connectivity, and
WebView session continuity are separate evidence gates. Keep generated build
outputs and signing configuration out of commits, and treat the exact artifact
hash, certificate fingerprint, and device results as the release record rather
than inferring a release from a successful web build.
