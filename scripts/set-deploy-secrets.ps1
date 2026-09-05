<#
scripts/set-deploy-secrets.ps1

Sets the two GitHub Actions repo secrets the CI auto-deploy job
(.github/workflows/ci.yml's `deploy` job) needs: CLOUDFLARE_API_TOKEN
and CLOUDFLARE_ACCOUNT_ID. See docs/DEPLOY_SECRETS.md for how to
generate the token and find the account ID.

SECURITY MODEL: both values are read via a LOCAL secure prompt only
(Read-Host -AsSecureString) - never echoed to the console, never
written to a file by this script, never included in a commit, and held
in plaintext only as long as this process needs them in memory (cleared
- set to $null - immediately after use).

Two paths to actually set them, tried in this order:
  1. gh CLI, if authenticated (`gh auth status`). `gh secret set` does
     its own client-side encryption against GitHub's public key
     internally; this script only pipes the plaintext to its stdin over
     a local process pipe, never over a network call this script makes
     itself.
  2. GitHub REST API with a prompted PAT (also local, also
     -AsSecureString, used once and discarded) - fetches this repo's
     Actions public key, encrypts each secret value client-side via
     libsodium's crypto_box_seal (GitHub's own documented method for
     this API - https://docs.github.com/en/rest/actions/secrets), PUTs
     the encrypted value. Only ciphertext crosses the network; the
     plaintext value and the PAT exist only in this script's memory and
     a short-lived Node child process used purely for the sealed-box
     encryption math (no crypto primitive this reliable is built into
     PowerShell itself). NOTE: this fallback path has not been live-run
     this session (gh was already authenticated, so path 1 was used and
     tested) - reviewed for correctness against GitHub's documented
     API contract, not verified end-to-end.

-CheckOnly skips prompting and setting entirely and only runs the
verification half (ci.yml wiring check + the non-leaking presence
status), so this is safely exercisable in automation/dry-run contexts
without a terminal or real credentials.
#>

param(
    [switch]$CheckOnly,
    [string]$Owner = "shariefs19-sthira",
    [string]$Repo = "ferrum_os"
)

$ErrorActionPreference = "Stop"
$repoSlug = "$Owner/$Repo"
$ciYmlPath = Join-Path (Split-Path $PSScriptRoot -Parent) ".github\workflows\ci.yml"
$secretNames = @("CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID")

function Test-CiYmlConsumesSecrets {
    if (-not (Test-Path $ciYmlPath)) {
        Write-Host "VERIFY: $ciYmlPath not found."
        return $false
    }
    $content = Get-Content $ciYmlPath -Raw
    $allFound = $true
    foreach ($name in $secretNames) {
        $pattern = [regex]::Escape("secrets.$name")
        if ($content -match $pattern) {
            Write-Host "VERIFY: ci.yml deploy job references secrets.$name - OK"
        } else {
            Write-Host "VERIFY: ci.yml does NOT reference secrets.$name - MISSING"
            $allFound = $false
        }
    }
    return $allFound
}

# Non-leaking by construction, not just by care: `gh secret list` (and
# the equivalent REST endpoint) return only a secret's NAME and its
# last-updated timestamp - GitHub never returns a secret's value once
# set, for anyone, including this script. There is no value to redact
# here because the API this reads from cannot produce one.
function Get-DeploySecretsPresentStatus {
    $existing = $null
    try {
        $existing = gh secret list --repo $repoSlug 2>$null
    } catch {
        Write-Host "STATUS: could not query gh secret list ($($_.Exception.Message)) - treating as absent."
    }
    $present = @{}
    foreach ($name in $secretNames) {
        $present[$name] = [bool]($existing -match "^$([regex]::Escape($name))\s")
    }
    return $present
}

function Write-SecretsStatusLine {
    $present = Get-DeploySecretsPresentStatus
    $allPresent = $true
    foreach ($name in $secretNames) {
        $flag = $present[$name]
        Write-Host "secrets present: $name = $flag"
        if (-not $flag) { $allPresent = $false }
    }
    Write-Host "secrets present (both): $allPresent"
    return $allPresent
}

function Read-SecureValue([string]$Prompt) {
    $secure = Read-Host -Prompt $Prompt -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

if ($CheckOnly) {
    Write-Host "=== set-deploy-secrets.ps1 -CheckOnly (verification only - no prompt, no secret set) ==="
    $wired = Test-CiYmlConsumesSecrets
    $present = Write-SecretsStatusLine
    Write-Host "CI wiring OK: $wired"
    exit 0
}

Write-Host "=== set-deploy-secrets.ps1 ==="
Write-Host "Values are read locally via a secure prompt; never echoed, logged, or written to disk by this script."

$ghAuthed = $false
try {
    gh auth status 2>$null | Out-Null
    $ghAuthed = ($LASTEXITCODE -eq 0)
} catch { $ghAuthed = $false }

$apiToken = Read-SecureValue "Cloudflare API token (Workers Scripts:Edit + Account Settings:Read)"
$accountId = Read-SecureValue "Cloudflare Account ID (Cloudflare dashboard, right sidebar)"

try {
    if ($ghAuthed) {
        Write-Host "gh CLI is authenticated - setting secrets via gh secret set."
        $apiToken | gh secret set CLOUDFLARE_API_TOKEN --repo $repoSlug
        $accountId | gh secret set CLOUDFLARE_ACCOUNT_ID --repo $repoSlug
    } else {
        Write-Host "gh CLI not authenticated - falling back to the GitHub REST API with a prompted PAT."
        $pat = Read-SecureValue "GitHub Personal Access Token (repo scope; used once this run, not stored)"
        try {
            $pubKey = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoSlug/actions/secrets/public-key" `
                -Headers @{ Authorization = "Bearer $pat"; Accept = "application/vnd.github+json" }
            $nodeScriptPath = Join-Path ([System.IO.Path]::GetTempPath()) "seal-$([guid]::NewGuid()).mjs"
            @'
import sodium from "libsodium-wrappers";
await sodium.ready;
const keyB64 = process.argv[2];
const value = process.argv[3];
const keyBytes = sodium.from_base64(keyB64, sodium.base64_variants.ORIGINAL);
const msgBytes = sodium.from_string(value);
const sealed = sodium.crypto_box_seal(msgBytes, keyBytes);
process.stdout.write(sodium.to_base64(sealed, sodium.base64_variants.ORIGINAL));
'@ | Set-Content -Path $nodeScriptPath -Encoding utf8
            foreach ($pair in @(
                @{ Name = "CLOUDFLARE_API_TOKEN"; Value = $apiToken },
                @{ Name = "CLOUDFLARE_ACCOUNT_ID"; Value = $accountId }
            )) {
                $encrypted = npx --yes --package libsodium-wrappers -- node $nodeScriptPath $pubKey.key $pair.Value
                $body = @{ encrypted_value = $encrypted; key_id = $pubKey.key_id } | ConvertTo-Json
                Invoke-RestMethod -Uri "https://api.github.com/repos/$repoSlug/actions/secrets/$($pair.Name)" `
                    -Method Put -Headers @{ Authorization = "Bearer $pat"; Accept = "application/vnd.github+json" } `
                    -Body $body -ContentType "application/json"
                Write-Host "Set $($pair.Name) via REST API."
            }
        } finally {
            if (Test-Path $nodeScriptPath) { Remove-Item $nodeScriptPath -Force -ErrorAction SilentlyContinue }
            $pat = $null
        }
    }
} finally {
    $apiToken = $null
    $accountId = $null
}

Write-Host ""
$wired = Test-CiYmlConsumesSecrets
$present = Write-SecretsStatusLine
Write-Host "CI wiring OK: $wired"
