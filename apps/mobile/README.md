# Ferrum OS mobile shell

This is the Android Capacitor shell for the deployed Ferrum OS origin:
`https://ferrum-os.shariefsatyala.workers.dev`.

The shell uses a remote HTTPS origin. It does not duplicate the web
application or its data model. Cleartext is disabled and navigation is
constrained to the deployment host.

## Android build prerequisites

- JDK 17
- Android SDK API 35, with a device or emulator running API 26+
- Gradle 8.9 (or Android Studio's matching embedded Gradle)
- Network access to Google Maven and Maven Central for the first build

```powershell
./scripts/verify-android-skeleton.ps1
Set-Location android
gradle :app:assembleDebug
```

The Gradle module pins Capacitor Android core to `7.5.0`. Before a plugin is
added, pin it to the same major version and document its permission/privacy
effect in the launch checklist.

## Offline behaviour

When offline at app launch, `OfflineActivity` shows a native offline notice.
Once CRANE applies the site service-worker wiring in `docs/pwa-wiring.patch`,
the web application can also serve its cached offline route after it has been
visited online.

## Release boundary

This is a Capacitor shell, not a Trusted Web Activity release. A TWA remains
an option only after the production host can serve Android App Links
verification for the final Play signing certificate. See
`docs/APP_LAUNCH_CHECKLIST.md`.
