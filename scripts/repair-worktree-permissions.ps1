[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory = $true)]
    [string]$WorktreePath,
    [string]$RelativePath = 'apps\web\lib\telemetry'
)

$ErrorActionPreference = 'Stop'

$resolved = [System.IO.Path]::GetFullPath($WorktreePath).TrimEnd('\')
$allowedRoots = @(
    [System.IO.Path]::GetFullPath('D:\ferrum_os.worktrees').TrimEnd('\'),
    [System.IO.Path]::GetFullPath('D:\ferrum_os_recovered\.worktrees').TrimEnd('\')
)

$insideAllowedRoot = $false
foreach ($root in $allowedRoots) {
    if ($resolved.StartsWith($root + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        $insideAllowedRoot = $true
        break
    }
}

if (-not $insideAllowedRoot) {
    throw "Refusing path outside approved MASON worktree roots: $resolved"
}
if (-not (Test-Path -LiteralPath $resolved -PathType Container)) {
    throw "Worktree does not exist: $resolved"
}
if (-not (Test-Path -LiteralPath (Join-Path $resolved '.git'))) {
    throw "Target is not a Git worktree: $resolved"
}

$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$target = [System.IO.Path]::GetFullPath((Join-Path $resolved $RelativePath))
if (-not $target.StartsWith($resolved + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Relative target escapes the worktree: $target"
}

if ($PSCmdlet.ShouldProcess($target, "create the directory, enable inherited ACLs, and grant Modify to $identity")) {
    if (-not (Test-Path -LiteralPath $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }
    & icacls.exe $target /inheritance:e /grant:r "${identity}:(OI)(CI)M"
    if ($LASTEXITCODE -ne 0) { throw "icacls failed with exit code $LASTEXITCODE" }

    $probe = Join-Path $target '.mason-write-probe.tmp'
    try {
        [System.IO.File]::WriteAllText($probe, 'permission-probe')
        if (-not (Test-Path -LiteralPath $probe)) { throw 'Write probe was not created.' }
    }
    finally {
        if (Test-Path -LiteralPath $probe) { Remove-Item -LiteralPath $probe -Force }
    }
}

if ($WhatIfPreference) { Write-Output "WORKTREE_PERMISSIONS_PLAN $target" }
else { Write-Output "WORKTREE_PERMISSIONS_OK $target" }
