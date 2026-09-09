[CmdletBinding()]
param(
    [ValidateSet("ATLAS", "MASON")]
    [string]$Runner,
    [int]$ProbeTimeoutSeconds = 45
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$date = Get-Date -Format "yyyy-MM-dd"
$ledger = Join-Path $repoRoot "docs\intel\TOOLING_INTEL_LEDGER.md"
$dailyFile = Join-Path $repoRoot "docs\intel\DAILY_TOOLING_$date.md"
$logFile = Join-Path $repoRoot ".fleet-trigger-daemon-log.ndjson"

if (-not (Test-Path -LiteralPath $ledger)) { throw "RULE 60 ledger missing: $ledger" }

function Invoke-CapturedProcess {
    param([string]$FilePath, [string[]]$Arguments, [int]$TimeoutSeconds)
    $stdout = [IO.Path]::GetTempFileName()
    $stderr = [IO.Path]::GetTempFileName()
    try {
        $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $repoRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
        if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
            $process.Kill()
            return [PSCustomObject]@{ ExitCode = 124; Output = "TIMEOUT" }
        }
        $output = ((Get-Content -LiteralPath $stdout -Raw -ErrorAction SilentlyContinue) + "`n" + (Get-Content -LiteralPath $stderr -Raw -ErrorAction SilentlyContinue)).Trim()
        return [PSCustomObject]@{ ExitCode = $process.ExitCode; Output = $output }
    } finally {
        Remove-Item -LiteralPath $stdout, $stderr -Force -ErrorAction SilentlyContinue
    }
}

$adapter = $null
if ($Runner) {
    $adapter = if ($Runner -eq "ATLAS") { "claude" } else { "codex" }
} else {
    $claude = Get-Command claude -ErrorAction SilentlyContinue
    if ($claude) {
        $probe = Invoke-CapturedProcess -FilePath $claude.Source -Arguments @("-p", "Reply exactly AVAILABLE") -TimeoutSeconds $ProbeTimeoutSeconds
        if ($probe.ExitCode -eq 0 -and $probe.Output -notmatch "(?i)rate.?limit|usage.?limit|reset|capacity|overloaded") {
            $Runner = "ATLAS"
            $adapter = "claude"
        }
    }
    if (-not $adapter) {
        $Runner = "MASON"
        $adapter = "codex"
    }
}

$prompt = "Read $ledger FIRST. Research only new or version-delta Claude Code and Codex ecosystem tooling. Never re-research unchanged ledger rows. Write $dailyFile from docs/intel/DAILY_TOOLING_TEMPLATE.md even when there are no findings. Append only genuinely new/version-delta rows to the ledger with runner $Runner. Verify licenses from primary sources; never guess."
$startedAt = (Get-Date).ToUniversalTime().ToString("o")
if (Test-Path -LiteralPath $dailyFile) {
    $result = [PSCustomObject]@{ ExitCode = 0; Output = "ALREADY_FILED" }
} elseif ($adapter -eq "claude") {
    $result = Invoke-CapturedProcess -FilePath "claude" -Arguments @("-p", $prompt) -TimeoutSeconds 900
} else {
    $result = Invoke-CapturedProcess -FilePath "codex" -Arguments @("exec", "--sandbox", "workspace-write", "--ask-for-approval", "never", $prompt) -TimeoutSeconds 900
}
$record = [ordered]@{
    event = "daily-tooling-intel"; date = $date; runner = $Runner; adapter = $adapter
    startedAt = $startedAt; endedAt = (Get-Date).ToUniversalTime().ToString("o")
    exitCode = $result.ExitCode; dailyFile = $dailyFile
    result = $result.Output.Substring(0, [Math]::Min(500, $result.Output.Length))
}
Add-Content -LiteralPath $logFile -Value ($record | ConvertTo-Json -Compress) -Encoding utf8
if ($result.ExitCode -ne 0) { throw "Daily intel runner failed with exit code $($result.ExitCode): $($result.Output)" }
if (-not (Test-Path -LiteralPath $dailyFile)) { throw "Daily intel output missing after runner completed: $dailyFile" }
Write-Output "DAILY_INTEL runner=$Runner adapter=$adapter file=$dailyFile ledger=$ledger"
