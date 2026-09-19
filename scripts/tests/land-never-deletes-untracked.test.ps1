<#
Regression test for scripts/land.ps1 failure-path safety (added 2026-09-19).

Incident: a failed `git merge --squash` reported "files=none reported by git"
(git's real error was swallowed) and the failure path then ran
`git reset --hard HEAD; git clean -fd`, deleting untracked files in the shared
checkout. This test drives the REAL scripts/land.ps1 against a throwaway
bare-remote + clone and asserts:
  1. an untracked file colliding with a path the branch adds -> REPORT
     phase=untracked-collision, nothing merged, the untracked file survives;
  2. a genuine squash conflict -> REPORT carries git_exit and the verbatim git
     output (GIT-OUTPUT-BEGIN/END), unrelated untracked files survive, the
     tracked tree is restored to HEAD, and the script exits nonzero;
  3. land.ps1 contains no `git clean` invocation at all.
A fake `pnpm` shim on PATH stands in for the type-check step (not under test).

Run directly: powershell -File scripts/tests/land-never-deletes-untracked.test.ps1
Exits 0 on success, throws (non-zero exit) on any failed assertion.
#>

$ErrorActionPreference = "Stop"

$landScript = Join-Path (Split-Path -Parent (Split-Path -Parent $PSCommandPath)) "land.ps1"
if (-not (Test-Path $landScript)) { throw "land.ps1 not found at $landScript" }

function Assert-True($cond, $message) {
    if (-not $cond) { throw "ASSERTION FAILED: $message" }
    Write-Host "ok: $message"
}

function Invoke-Git([string]$dir, [string[]]$GitArgs) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { & git -C $dir @GitArgs 2>&1 | Out-Null } finally { $ErrorActionPreference = $prev }
    if ($LASTEXITCODE -ne 0) { throw "git -C $dir $($GitArgs -join ' ') failed ($LASTEXITCODE)" }
}

$tmp = Join-Path $env:TEMP "land-untracked-test-$([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
try {
    $remote = Join-Path $tmp "remote.git"
    $seed = Join-Path $tmp "seed"
    $co = Join-Path $tmp "checkout"
    $bin = Join-Path $tmp "bin"
    New-Item -ItemType Directory -Path $bin -Force | Out-Null
    Set-Content -Path (Join-Path $bin "pnpm.cmd") -Value "@echo off`r`nexit /b 0`r`n" -Encoding ASCII

    Invoke-Git $tmp @('init', '--bare', '-b', 'main', $remote)
    Invoke-Git $tmp @('init', '-b', 'main', $seed)
    foreach ($d in @($seed)) {
        Invoke-Git $d @('config', 'user.email', 'test@example.invalid')
        Invoke-Git $d @('config', 'user.name', 'land-test')
    }
    New-Item -ItemType Directory -Path (Join-Path $seed "apps\web") -Force | Out-Null
    Set-Content -Path (Join-Path $seed "apps\web\conf.txt") -Value "base" -Encoding ASCII
    Invoke-Git $seed @('add', '-A')
    Invoke-Git $seed @('commit', '-m', 'base')
    Invoke-Git $seed @('remote', 'add', 'origin', $remote)
    Invoke-Git $seed @('push', 'origin', 'main')

    # collide: adds apps/web/evidence/x.png
    Invoke-Git $seed @('checkout', '-b', 'collide')
    New-Item -ItemType Directory -Path (Join-Path $seed "apps\web\evidence") -Force | Out-Null
    Set-Content -Path (Join-Path $seed "apps\web\evidence\x.png") -Value "branch-side" -Encoding ASCII
    Invoke-Git $seed @('add', '-A'); Invoke-Git $seed @('commit', '-m', 'collide'); Invoke-Git $seed @('push', 'origin', 'collide')

    # conflict: edits conf.txt; main then edits it differently
    Invoke-Git $seed @('checkout', 'main'); Invoke-Git $seed @('checkout', '-b', 'conflict')
    Set-Content -Path (Join-Path $seed "apps\web\conf.txt") -Value "branch-conf" -Encoding ASCII
    Invoke-Git $seed @('add', '-A'); Invoke-Git $seed @('commit', '-m', 'conflict'); Invoke-Git $seed @('push', 'origin', 'conflict')
    Invoke-Git $seed @('checkout', 'main')
    Set-Content -Path (Join-Path $seed "apps\web\conf.txt") -Value "main-conf" -Encoding ASCII
    Invoke-Git $seed @('add', '-A'); Invoke-Git $seed @('commit', '-m', 'mainconf'); Invoke-Git $seed @('push', 'origin', 'main')

    Invoke-Git $tmp @('clone', $remote, $co)
    Invoke-Git $co @('config', 'user.email', 'test@example.invalid')
    Invoke-Git $co @('config', 'user.name', 'land-test')

    # Untracked files in the "shared checkout".
    New-Item -ItemType Directory -Path (Join-Path $co "apps\web\evidence") -Force | Out-Null
    Set-Content -Path (Join-Path $co "apps\web\evidence\x.png") -Value "MY-UNTRACKED" -Encoding ASCII
    Set-Content -Path (Join-Path $co "keep.ndjson") -Value "LOG-DATA" -Encoding ASCII
    New-Item -ItemType Directory -Path (Join-Path $co "test-results\foo-deployed") -Force | Out-Null
    Set-Content -Path (Join-Path $co "test-results\foo-deployed\s.png") -Value "SHOT" -Encoding ASCII

    $env:PATH = "$bin;$env:PATH"
    Push-Location $co
    try {
        $headBefore = (& git rev-parse HEAD).Trim()

        # --- Scenario 1: untracked collision ---
        $out1 = & cmd /c "powershell -NoProfile -File `"$landScript`" -Branch collide 2>&1"
        $code1 = $LASTEXITCODE
        $text1 = $out1 -join "`n"
        Assert-True ($text1 -match 'phase=untracked-collision') "collision reported as phase=untracked-collision"
        Assert-True ($text1 -match 'apps/web/evidence/x\.png') "collision report names the colliding path"
        Assert-True ($code1 -ne 0) "collision run exits nonzero (exit=$code1)"
        Assert-True ((Get-Content (Join-Path $co "apps\web\evidence\x.png") -Raw).Trim() -eq 'MY-UNTRACKED') "colliding untracked file survives with original content"
        Assert-True (Test-Path (Join-Path $co "keep.ndjson")) "unrelated untracked log survives"
        Assert-True (Test-Path (Join-Path $co "test-results\foo-deployed\s.png")) "untracked deployed-evidence dir survives"
        Assert-True ((& git rev-parse HEAD).Trim() -eq $headBefore) "HEAD unchanged after collision refusal"

        # --- Scenario 2: real squash conflict ---
        $out2 = & cmd /c "powershell -NoProfile -File `"$landScript`" -Branch conflict 2>&1"
        $code2 = $LASTEXITCODE
        $text2 = $out2 -join "`n"
        Assert-True ($text2 -match 'phase=squash-conflict') "conflict reported as phase=squash-conflict"
        Assert-True ($text2 -match 'git_exit=1') "conflict report carries git's exit code"
        Assert-True ($text2 -match 'GIT-OUTPUT-BEGIN' -and $text2 -match 'GIT-OUTPUT-END') "conflict report carries GIT-OUTPUT block"
        Assert-True ($text2 -match 'CONFLICT \(content\)') "conflict report includes git's verbatim CONFLICT line"
        Assert-True ($code2 -ne 0) "conflict run exits nonzero (exit=$code2)"
        Assert-True ($text2 -match 'disappeared=0') "end-of-run tripwire reports zero untracked files disappeared"
        Assert-True ((Get-Content (Join-Path $co "keep.ndjson") -Raw).Trim() -eq 'LOG-DATA') "untracked log survives failed squash"
        Assert-True (Test-Path (Join-Path $co "test-results\foo-deployed\s.png")) "untracked deployed-evidence dir survives failed squash"
        Assert-True (@(& git status --porcelain --untracked-files=no).Count -eq 0) "tracked tree restored to HEAD after failed squash"
    } finally {
        Pop-Location
    }

    # --- Static check: no `git clean` invocation anywhere in land.ps1 ---
    $codeLines = Get-Content $landScript | Where-Object { $_ -match '^\s*git\s+clean\b' }
    Assert-True (@($codeLines).Count -eq 0) "land.ps1 contains no 'git clean' command line"

    Write-Host "ALL ASSERTIONS PASSED"
} finally {
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
