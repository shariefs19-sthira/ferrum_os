# Seat: RIVET

**Role:** Executor, exclusive paths.
**Status:** ACTIVE (activated 2026-09-02, operator directive).
**Underlying tool:** Codex CLI (second parallel instance, distinct from MASON).

## Scope

Exclusive to `apps/mobile/**` and `docs/**` only. RIVET does not touch
`apps/web/**`, `worker.ts`, auth, or payments files. The seat pushes from its
own worktree; landing remains serialized through `scripts/land.ps1`.

## Assigned slice

W2-356+ (app-shell / mobile-wrapper work). W2-356 APP_SHELL_V1 is RIVET's
first assigned row.

## S4 mobile asset manifest — LOCKED-adjacent preparation

**Purpose:** make the Android shell treatment mechanically traceable when
MASON's W2-384 S4 STUDIO_3D lands. This is an inventory and wiring plan only:
no Android resource changes are authorized before that dependency clears.

**S4 dependency:** W2-384 is MASON-owned and follows conductor sign-off of
W2-372. The S4 surface is the plot-anchored Studio configurator, with
INDICATIVE OSM-neighbour massing, structural HUD, style comparison,
accessibility, and reduced-motion support. The corresponding provenance-strip
extension is W2-387's separately sequenced S4 scope.

| Variant / density | Current Android source | Existing shell hook | S4 wiring hook | W2-372 token treatment |
| --- | --- | --- | --- | --- |
| Standard launcher foreground, density-independent | `android/app/src/main/res/drawable/ic_launcher_foreground.xml` | `@drawable/ic_launcher_foreground`; also referenced by `splash_screen.xml` and Android 12 `windowSplashScreenAnimatedIcon` | Keep as the non-maskable/splash-safe Fe·26 mark. Regenerate only if S4 changes the approved mark geometry. | `--fe-surface` `#ffffff` background; `--fe-ink` `#070707` foreground baseline; Fe saffron `--fe-accent` `#ff9933`; Fe green `--fe-success` `#138808`. |
| Maskable adaptive foreground, density-independent safe-zone art | `android/app/src/main/res/drawable/ic_launcher_foreground_maskable.xml` | Both API-26 adaptive launcher XMLs reference it | Preserve the larger safe-zone composition for Studio deep-link launcher entry; use only after S4-approved mark changes. | Same tricolour identity treatment; no navy command-deck canvas baked into the adaptive icon. |
| Square adaptive launcher, API 26+ | `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` | `AndroidManifest.xml` `android:icon="@mipmap/ic_launcher"` | The mechanical launcher hook for any S4 icon-resource update; retain its background/foreground split. | Background remains `--fe-surface`; foreground must preserve contrast and not rely on colour alone. |
| Round adaptive launcher, API 26+ | `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml` | `AndroidManifest.xml` `android:roundIcon="@mipmap/ic_launcher_round"` | Mirror the square adaptive update exactly; verify circular crop safe zone. | Same as square launcher; no separate palette or status-only meaning. |
| Legacy launcher density variants | None currently committed | No manifest fallback resource is present | If S4's Android support matrix requires pre-26 launcher bitmaps, add `mipmap-mdpi`/`hdpi`/`xhdpi`/`xxhdpi`/`xxxhdpi` from the same approved canonical master and point an explicit fallback only after acceptance is set. | Export colours only from the listed 372 tokens; do not introduce a new orange, navy, or grey. |
| Branded splash layer | `android/app/src/main/res/drawable/splash_screen.xml` | Background `@color/splash_background`; centered standard foreground | Keep the splash independent of WebView/three.js readiness; S4 must not substitute a loading spinner or unlabelled mock render for the mark. | Light canvas: `--fe-surface` `#ffffff`; icon uses the same Fe saffron/green identity. Motion must obey `--motion-enter` 360ms / reduced-motion rules if any S4 transition is added. |
| Android 12 system splash | `android/app/src/main/res/values/styles.xml` | `windowSplashScreenBackground` and `windowSplashScreenAnimatedIcon` | Mechanical hook for S4: retain `@drawable/ic_launcher_foreground`; any post-splash Studio handoff must be truthful and reduced-motion safe. | Background maps to `--fe-surface`; focus/handoff treatment maps to `--fe-focus` `#64748b` on light and `--fe-focus-dark` `#ff9933` in a dark command zone. |
| Light colours / system bars | `android/app/src/main/res/values/colors.xml` and `values/styles.xml` | `splash_background` and `icon_background` are both `#FFFFFF`; status bar uses splash background | Keep as the current default until S4 establishes a specific mobile command-deck zone. | `#ffffff` = `--fe-surface`; any copy/control above it uses contrast-compliant `--fe-ink` / `--fe-text`, never a colour-only state. |
| Dark colours / night-qualified variants | **Not implemented**: no `values-night/`, night-qualified drawable, or dark splash resource exists | No current wiring hook | S4 decision gate: add night-qualified `colors.xml` / styles and any needed drawable variant only if its mobile visual acceptance explicitly calls for a bounded dark Studio zone; otherwise retain the white brand splash. | Candidate bounded dark surface only: `--fe-command` `#0b1f3a` with `--fe-on-command` `#ffffff`; preserve `INDICATIVE` as visible text and maintain WCAG-checked contrast. |
| Offline fallback mark | `android/app/src/main/res/layout/offline_notice.xml` | Uses `@drawable/ic_launcher_foreground` on `@color/splash_background` | Check after S4 wiring so offline/deep-link failure never shows an obsolete mark or an implied live 3D scene. | Same light surface and Fe identity; status text remains explicit, not colour-only. |

### S4 mechanical wiring checklist

1. Confirm S4's landed mark/design decision and use the canonical source before
   changing any vector or adding raster density fallbacks.
2. Trace the three resource chains: manifest icon/roundIcon → adaptive XML →
   maskable foreground; splash theme → foreground; offline notice → standard
   foreground.
3. Add dark-qualified resources only if the S4 acceptance explicitly selects a
   bounded command-zone treatment; otherwise leave the implemented light-only
   configuration intact.
4. Verify each changed launcher crop at the Android safe zone and verify splash,
   offline, deep-link, and reduced-motion behaviour on the resulting S4 path.
5. Extend `apps/mobile/scripts/verify-android-skeleton.ps1` only when an S4
   resource change occurs, so it asserts the final resource graph rather than
   this preparatory inventory.

**Status:** LOCKED on W2-384 S4 implementation and its visual acceptance. This
manifest is a docs-only preparation record, not evidence that S4 or dark mode
is implemented.
