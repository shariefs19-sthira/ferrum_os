param(
    [string]$RepoRoot = "D:\ferrum_os_recovered",
    [ValidateSet("plan", "canary", "cycle", "daemon")]
    [string]$Mode = "plan",
    [int]$IntervalSeconds = 300,
    [int]$MaxTasksPerCycle = 1,
    [switch]$Execute,
    [switch]$Land
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path -LiteralPath $RepoRoot).Path
$env:PYTHONPATH = if ($env:PYTHONPATH) { "$(Join-Path $repo 'scripts');$env:PYTHONPATH" } else { Join-Path $repo "scripts" }
$arguments = @("-m", "fleet.runner", $Mode, "--repo-root", $repo)
if ($Mode -ne "plan") {
    $arguments += @("--interval-seconds", [string]$IntervalSeconds, "--max-tasks", [string]$MaxTasksPerCycle)
}
if ($Execute) { $arguments += "--execute" }
if ($Land) { $arguments += "--land" }

& python @arguments
exit $LASTEXITCODE
