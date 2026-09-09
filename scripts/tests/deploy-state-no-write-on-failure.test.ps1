<#
Regression test for the auto-deploy state-write invariant (added
2026-09-10, per operator ask, alongside the headless `npx wrangler
deploy` install-confirmation-prompt fix in scripts/FLEET_WATCH.ps1).

Invariant under test: a FAILED deploy attempt must never record its
target SHA as deployed. Invoke-AutoDeployIfAdvanced only writes
$state.LastDeployedSha (via Save-DeployState) AFTER the `wrangler
deploy` exit-code check succeeds; a failure throws straight to the
catch block, which never touches deploy state - so the next cycle
still sees the SHA as "not yet deployed" and retries automatically.

This test does not invoke the real, heavy Invoke-AutoDeployIfAdvanced
(real git fetch / pnpm type-check / pnpm build / wrangler deploy would
make it slow, network-dependent, and unsuitable as a fast regression
check). Instead it reproduces the exact success/failure control-flow
shape - Get-DeployState / Save-DeployState copied verbatim from
scripts/FLEET_WATCH.ps1, and the identical try/throw/catch pattern
around the state write - with a stubbed deploy step whose exit code
this test controls directly. If scripts/FLEET_WATCH.ps1's real
Get-DeployState, Save-DeployState, or the position of the state-write
relative to the deploy throw ever diverges from what's copied here,
this test's assertions will not reflect the real file - that drift
risk is the accepted tradeoff for a fast, deterministic test; the
inline ASSERTION comment left in FLEET_WATCH.ps1 next to the real
throw is the other half of "assert in code + test."

Run directly: powershell -File scripts/tests/deploy-state-no-write-on-failure.test.ps1
Exits 0 on success, throws (non-zero exit) on any failed assertion.
#>

$ErrorActionPreference = "Stop"

$tmp = Join-Path $env:TEMP "deploy-state-test-$([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
$deployStateFile = Join-Path $tmp ".fleet-deploy-state.json"

# --- Copied verbatim from scripts/FLEET_WATCH.ps1 (see file header) ---
function Get-DeployState {
    if (Test-Path $deployStateFile) {
        try {
            $loaded = Get-Content $deployStateFile -Raw | ConvertFrom-Json
            if (-not ($loaded.PSObject.Properties.Name -contains 'DeployHistory')) {
                $loaded | Add-Member -NotePropertyName DeployHistory -NotePropertyValue @() -Force
            }
            return $loaded
        } catch { }
    }
    return [PSCustomObject]@{ LastDeployedSha = $null; LastVersionId = $null; DeployHistory = @() }
}

function Save-DeployState($State) {
    $State | ConvertTo-Json -Depth 6 | Set-Content -Path $deployStateFile -Encoding utf8
}
# --- end verbatim copy ---

# Reproduces Invoke-AutoDeployIfAdvanced's exact control flow: a
# deploy-step exit code is checked and throws on failure BEFORE any
# state write; the caller's catch block never writes state either.
# $DeploySucceeds simulates wrangler's own exit code for this test.
function Invoke-SimulatedDeployAttempt([string]$Sha, [bool]$DeploySucceeds) {
    $state = Get-DeployState
    try {
        $deployExitCode = if ($DeploySucceeds) { 0 } else { 1 }
        if ($deployExitCode -ne 0) { throw "wrangler deploy failed (simulated)" }
        $state.LastDeployedSha = $Sha
        Save-DeployState -State $state
    } catch {
        # Matches the real catch block: logs/alerts only, never a
        # state write. (Real code also fires Send-NtfyAlert here - not
        # reproduced, not relevant to this invariant.)
    }
}

# --- Test 1: a failed deploy attempt leaves LastDeployedSha unchanged ---
Save-DeployState -State ([PSCustomObject]@{ LastDeployedSha = "aaa111"; LastVersionId = "v1"; DeployHistory = @() })
Invoke-SimulatedDeployAttempt -Sha "bbb222" -DeploySucceeds $false
$afterFailure = Get-DeployState
if ($afterFailure.LastDeployedSha -ne "aaa111") {
    throw "FAIL: a failed deploy attempt changed LastDeployedSha from 'aaa111' to '$($afterFailure.LastDeployedSha)' - a failed deploy must never be recorded as deployed."
}
Write-Host "PASS: a failed deploy attempt leaves LastDeployedSha unchanged (still 'aaa111') - the next cycle will correctly retry 'bbb222'"

# --- Test 2: a successful deploy attempt DOES update LastDeployedSha (proves the harness isn't just permanently frozen) ---
Invoke-SimulatedDeployAttempt -Sha "bbb222" -DeploySucceeds $true
$afterSuccess = Get-DeployState
if ($afterSuccess.LastDeployedSha -ne "bbb222") {
    throw "FAIL: a successful deploy attempt should update LastDeployedSha to 'bbb222', got '$($afterSuccess.LastDeployedSha)'"
}
Write-Host "PASS: a successful deploy attempt updates LastDeployedSha to the new SHA"

# --- Test 3: repeated failures never accumulate a false-positive state ---
Invoke-SimulatedDeployAttempt -Sha "ccc333" -DeploySucceeds $false
Invoke-SimulatedDeployAttempt -Sha "ccc333" -DeploySucceeds $false
Invoke-SimulatedDeployAttempt -Sha "ccc333" -DeploySucceeds $false
$afterRepeatedFailures = Get-DeployState
if ($afterRepeatedFailures.LastDeployedSha -ne "bbb222") {
    throw "FAIL: three repeated failed attempts at 'ccc333' should leave LastDeployedSha at the last real success ('bbb222'), got '$($afterRepeatedFailures.LastDeployedSha)'"
}
Write-Host "PASS: repeated failed attempts never accumulate a false 'deployed' state - retries indefinitely until a real success"

Write-Host "ALL TESTS PASSED"
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
