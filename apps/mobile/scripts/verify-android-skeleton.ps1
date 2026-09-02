$ErrorActionPreference = 'Stop'
$mobileRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $mobileRoot 'capacitor.config.json'
$androidConfigPath = Join-Path $mobileRoot 'android/app/src/main/assets/capacitor.config.json'
$manifestPath = Join-Path $mobileRoot 'android/app/src/main/AndroidManifest.xml'
$mainActivityPath = Join-Path $mobileRoot 'android/app/src/main/java/dev/ferrumos/shell/MainActivity.java'
$offlineActivityPath = Join-Path $mobileRoot 'android/app/src/main/java/dev/ferrumos/shell/OfflineActivity.java'
$offlineLayoutPath = Join-Path $mobileRoot 'android/app/src/main/res/layout/offline_notice.xml'
$splashPath = Join-Path $mobileRoot 'android/app/src/main/res/drawable/splash_screen.xml'
$expectedUrl = 'https://ferrum-os.shariefsatyala.workers.dev'
$config = Get-Content -Raw $configPath | ConvertFrom-Json
$androidConfig = Get-Content -Raw $androidConfigPath | ConvertFrom-Json
foreach ($candidate in @($config, $androidConfig)) {
    if ($candidate.appId -ne 'dev.ferrumos.shell') { throw 'Unexpected Capacitor application ID.' }
    if ($candidate.server.url -ne $expectedUrl) { throw 'Unexpected Capacitor server URL.' }
    if ($candidate.server.cleartext -ne $false) { throw 'Cleartext traffic must remain disabled.' }
    if ($candidate.server.androidScheme -ne 'https') { throw 'Android scheme must remain HTTPS.' }
    if ($candidate.server.allowNavigation -notcontains 'ferrum-os.shariefsatyala.workers.dev') { throw 'Navigation host is invalid.' }
}
$manifest = Get-Content -Raw $manifestPath
if ($manifest -notmatch 'android.permission.INTERNET') { throw 'Internet permission is required.' }
if ($manifest -notmatch 'android:usesCleartextTraffic="false"') { throw 'Manifest must prohibit cleartext traffic.' }
if ($manifest -notmatch 'OfflineActivity') { throw 'Offline activity is not registered.' }
if ((Get-Content -Raw $mainActivityPath) -notmatch 'extends BridgeActivity') { throw 'Main activity must remain a Capacitor BridgeActivity.' }
if ((Get-Content -Raw $offlineActivityPath) -notmatch 'setContentView\(R.layout.offline_notice\)') { throw 'Offline activity must render the offline notice.' }
foreach ($requiredFile in @($offlineLayoutPath, $splashPath)) {
    if (-not (Test-Path $requiredFile)) { throw "Missing required shell asset: $requiredFile" }
}
Write-Output 'Android shell configuration: PASS'
