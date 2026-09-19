<#
run-gated.ps1 - run one heavy command under a named resource-slot pool.

  scripts\run-gated.ps1 -Kind build -Label 'my-task' -- pnpm --filter ./apps/web exec tsc --noEmit
  scripts\run-gated.ps1 -Kind install -Label 'x' -WorkingDirectory D:\ferrum_os.worktrees\foo -- pnpm install --frozen-lockfile
  scripts\run-gated.ps1 -Status

Kinds and default capacities: install=2 build=2 test=3 browser=3 edge=4
(override: env FERRUM_SLOTS_<KIND>; slot root: env FERRUM_SLOTS_DIR).
Acquires a slot (FIFO-ish wait, 'waiting' line every -WaitLineSec, -TimeoutSec
bound), runs the command through Invoke-Tool (real .exe/.cmd, never a bare
Start-Process on an npm shim), ALWAYS releases the slot, and exits with the
command's own exit code. Gate-level failures use distinct codes:
  125 = could not acquire a slot (timeout / bad kind)   127 = tool not resolvable / failed to start
  2   = usage error (no command)
The last output line is machine-readable:
  [gate-result] kind=.. label=.. slot=.. exit=.. wait_s=.. run_s=..
-Status prints per-pool used/capacity, holders + ages, and a CPU/free-RAM/disk snapshot.

INVOCATION: call it from PowerShell with the call operator
  & scripts\run-gated.ps1 -Kind build -Label x -- cmd args
The `--` terminator keeps the command's own dashes (-e, -t, --filter) away from
this script's parameter binder. From another process use
  powershell -NoProfile -Command "& 'scripts\run-gated.ps1' -Kind build -Label x -- cmd args; exit $LASTEXITCODE"
`powershell -File` does not understand `--` and only works when the command has
no single-dash tokens.
#>
[CmdletBinding(PositionalBinding = $false)]
param(
    [string]$Kind,
    [string]$Label = 'unlabeled',
    [string]$WorkingDirectory,
    [int]$TimeoutSec = 3600,
    [int]$WaitLineSec = 30,
    [int]$PollMs = 500,
    [switch]$Status,
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$Command
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\tool-runner.ps1')
. (Join-Path $PSScriptRoot 'lib\resource-gate.ps1')

if ($Status) { Show-GateStatus; exit 0 }

$cmd = @($Command | Where-Object { $null -ne $_ })
if ($cmd.Count -gt 0 -and $cmd[0] -eq '--') { $cmd = @($cmd | Select-Object -Skip 1) }
if (-not $Kind -or $cmd.Count -eq 0) {
    Write-Host "usage: run-gated.ps1 -Kind <install|build|test|browser|edge> -Label <text> [-WorkingDirectory <dir>] -- <command> [args...]   |   run-gated.ps1 -Status"
    exit 2
}

$slot = $null
try {
    $slot = Enter-Gate -Kind $Kind -Label $Label -TimeoutSec $TimeoutSec -PollMs $PollMs -WaitLineSec $WaitLineSec
}
catch {
    Write-Host "[gate] FAILED to acquire '$Kind' slot: $($_.Exception.Message)"
    Write-Host "[gate-result] kind=$Kind label=$Label slot=none exit=125 wait_s=na run_s=0"
    exit 125
}

$exitCode = 127
$runSeconds = 0
try {
    Write-Host "[gate] acquired '$Kind' slot $($slot.Slot)/$($slot.Capacity) after $($slot.WaitSeconds)s wait (label '$Label', pid $PID)"
    $rest = @($cmd | Select-Object -Skip 1)
    $iv = @{ Name = $cmd[0]; ArgumentList = $rest }
    if ($WorkingDirectory) { $iv.WorkingDirectory = $WorkingDirectory }
    $r = Invoke-Tool @iv
    $exitCode = $r.ExitCode
    $runSeconds = $r.Seconds
}
catch {
    Write-Host "[gate] tool error: $($_.Exception.Message)"
    $exitCode = 127
}
finally {
    Exit-Gate $slot
    Write-Host "[gate] released '$Kind' slot $($slot.Slot)"
}
Write-Host "[gate-result] kind=$Kind label=$Label slot=$($slot.Slot) exit=$exitCode wait_s=$($slot.WaitSeconds) run_s=$runSeconds"
exit $exitCode
