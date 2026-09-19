<#
Tests for scripts/lib/tool-runner.ps1, scripts/lib/resource-gate.ps1 and
scripts/run-gated.ps1 (MASON-tooling, 2026-09-19). Plain PowerShell asserts,
no dependencies. Uses a throwaway slot root (FERRUM_SLOTS_DIR under $env:TEMP)
so the real D:\ferrum_os.worktrees\.slots pools are never touched.

Run:  powershell -NoProfile -File scripts\tests\tool-runner.test.ps1
Exit: 0 when every assertion passed, 1 otherwise. Last line = assertion counts.
#>

$ErrorActionPreference = 'Stop'
$scripts = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
. (Join-Path $scripts 'lib\tool-runner.ps1')
. (Join-Path $scripts 'lib\resource-gate.ps1')
$runGated = Join-Path $scripts 'run-gated.ps1'

$script:Pass = 0
$script:Fail = 0
function Assert-True([bool]$Cond, [string]$Msg) {
    if ($Cond) { $script:Pass++; Write-Host "ok: $Msg" }
    else { $script:Fail++; Write-Host "FAIL: $Msg" }
}
function Assert-Equal($Actual, $Expected, [string]$Msg) {
    Assert-True ("$Actual" -eq "$Expected") "$Msg (expected '$Expected', got '$Actual')"
}
function Assert-Throws([scriptblock]$Block, [string]$Pattern, [string]$Msg) {
    $threw = $false; $text = ''
    try { & $Block | Out-Null } catch { $threw = $true; $text = $_.Exception.Message }
    Assert-True ($threw -and $text -match $Pattern) "$Msg (threw=$threw, message='$text')"
}
function Run-Section([string]$Name, [scriptblock]$Body) {
    Write-Host "--- $Name"
    try { & $Body } catch { $script:Fail++; Write-Host "FAIL: section '$Name' threw: $($_.Exception.Message)" }
}

$tmp = Join-Path $env:TEMP ("tool-runner-test-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$oldSlotsDir = $env:FERRUM_SLOTS_DIR
$oldPath = $env:PATH
$oldEnvCaps = @{}
foreach ($k in 'INSTALL', 'BUILD', 'TEST', 'BROWSER', 'EDGE') { $oldEnvCaps[$k] = [Environment]::GetEnvironmentVariable("FERRUM_SLOTS_$k") }
$env:FERRUM_SLOTS_DIR = Join-Path $tmp 'slots'

# Run run-gated.ps1 in a child powershell; returns the Process (started).
function Start-RunGatedChild([string]$Kind, [string]$Label, [string]$ToolCmd, [string]$OutFile, [string]$ErrFile, [int]$WaitLineSec = 30, [int]$TimeoutSec = 3600) {
    $inner = "& '$runGated' -Kind $Kind -Label '$Label' -WaitLineSec $WaitLineSec -TimeoutSec $TimeoutSec -PollMs 200 -- $ToolCmd; exit `$LASTEXITCODE"
    return Start-ToolProcess powershell -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $inner) `
        -RedirectStandardOutput $OutFile -RedirectStandardError $ErrFile
}
function Wait-Until([scriptblock]$Cond, [int]$Sec) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $Sec) { if (& $Cond) { return $true }; Start-Sleep -Milliseconds 150 }
    return [bool](& $Cond)
}
function Get-GateFiles([string]$Kind) {
    $d = Join-Path $env:FERRUM_SLOTS_DIR $Kind
    if (-not (Test-Path -LiteralPath $d)) { return @() }
    return @(Get-ChildItem -LiteralPath $d -Recurse -File -ErrorAction SilentlyContinue)
}

try {
    Run-Section 'Resolve-Tool' {
        $p = Resolve-Tool pnpm
        Assert-True ($p -match '\.(cmd|exe)$') "Resolve-Tool pnpm returns a .cmd/.exe ($p)"
        Assert-True ((Test-Path -LiteralPath $p)) 'resolved pnpm path exists'
        Assert-True ([IO.Path]::GetExtension($p) -ne '') 'never the extensionless shim'
        Assert-True ((Resolve-Tool node) -match 'node\.exe$') 'Resolve-Tool node returns node.exe'
        Assert-Throws { Resolve-Tool 'no-such-tool-xyz-123' } 'no-such-tool-xyz-123' 'missing tool throws and names it'

        # Extensionless-only shim must be rejected with an error that names it.
        $shimDir = Join-Path $tmp 'shimonly'; New-Item -ItemType Directory -Force -Path $shimDir | Out-Null
        Set-Content -LiteralPath (Join-Path $shimDir 'onlyshim') -Value '#!/bin/sh' -Encoding ASCII
        $env:PATH = "$shimDir;$oldPath"
        try { Assert-Throws { Resolve-Tool onlyshim } 'onlyshim' 'extensionless-only tool throws and names what it found' }
        finally { $env:PATH = $oldPath }

        # Preference: .exe over .cmd in the same directory, and .cmd over the shim.
        $prefDir = Join-Path $tmp 'pref'; New-Item -ItemType Directory -Force -Path $prefDir | Out-Null
        Set-Content -LiteralPath (Join-Path $prefDir 'dual.cmd') -Value '@echo off' -Encoding ASCII
        Copy-Item -LiteralPath (Resolve-Tool node) -Destination (Join-Path $prefDir 'dual.exe')
        Set-Content -LiteralPath (Join-Path $prefDir 'dual') -Value '#!/bin/sh' -Encoding ASCII
        $env:PATH = "$prefDir;$oldPath"
        try { Assert-True ((Resolve-Tool dual) -match 'dual\.exe$') 'prefers .exe over .cmd and shim' }
        finally { $env:PATH = $oldPath }
    }

    Run-Section 'Invoke-Tool' {
        $r = Invoke-Tool pnpm --version -Quiet
        Assert-Equal $r.ExitCode 0 'Invoke-Tool pnpm --version exit 0'
        Assert-True ($r.OutputTail.Trim() -match '^\d+\.\d+\.\d+') "pnpm --version output looks like x.y.z ('$($r.OutputTail.Trim())')"
        Assert-True ($r.Seconds -ge 0) 'result carries Seconds'

        $r = Invoke-Tool node -ArgumentList '-e', 'process.exit(7)' -Quiet
        Assert-Equal $r.ExitCode 7 'failing command returns ExitCode 7 (not swallowed)'
        Assert-Throws { Invoke-Tool node -ArgumentList '-e', 'process.exit(7)' -Quiet -ThrowOnError } 'exited with code 7' '-ThrowOnError throws naming code 7'

        $r = Invoke-Tool node -ArgumentList '-e', 'console.error("to-stderr"); console.log("to-stdout")' -Quiet
        Assert-True ($r.OutputTail -match 'to-stderr' -and $r.OutputTail -match 'to-stdout') 'stderr and stdout both captured in OutputTail'

        $r = Invoke-Tool node -ArgumentList '-e', 'console.log(JSON.stringify(process.argv.slice(1)))', 'a b', 'x  y', 'C:\Program Files\z' -Quiet
        $got = @(($r.OutputTail | ConvertFrom-Json) | ForEach-Object { $_ })
        Assert-Equal ($got -join '|') 'a b|x  y|C:\Program Files\z' 'args with spaces round-trip intact through Invoke-Tool'

        $r = Invoke-Tool node -ArgumentList '-e', 'console.log(process.cwd())' -WorkingDirectory $tmp -Quiet
        Assert-Equal $r.OutputTail.Trim().ToLowerInvariant() $tmp.ToLowerInvariant() '-WorkingDirectory is honoured'

        $lines = (1..100 | ForEach-Object { "line$_" }) -join '\n'
        $r = Invoke-Tool node -ArgumentList '-e', "console.log('$lines')" -TailLines 5 -Quiet
        Assert-Equal @($r.OutputTail -split "`n").Count 5 'OutputTail is bounded by -TailLines'
        Assert-Throws { Invoke-Tool node -WorkingDirectory (Join-Path $tmp 'nope') -ArgumentList '-v' } 'working directory not found' 'missing working directory throws'
    }

    Run-Section 'Start-Process bug vs Start-ToolProcess' {
        # Documents the bug: bare Start-Process on the npm shim fails on this box.
        # Redirection forces CreateProcess (UseShellExecute=false), which is how agent
        # commands hit it; without redirection Start-Process would shell-open pnpm.ps1
        # in an editor window instead, which a test must never do (RULE 28).
        $bareFailed = $false; $msg = ''
        try { $null = Start-Process pnpm -ArgumentList '--version' -RedirectStandardOutput (Join-Path $tmp 'bare.out') -PassThru -ErrorAction Stop } catch { $bareFailed = $true; $msg = $_.Exception.Message }
        Assert-True $bareFailed "bare 'Start-Process pnpm' fails (documented bug): $msg"
        Assert-True ($msg -match 'not a valid Win32 application') 'failure message is the Win32 shim error'

        $out = Join-Path $tmp 'sp.out'; $err = Join-Path $tmp 'sp.err'
        $p = Start-ToolProcess pnpm --version -RedirectStandardOutput $out -RedirectStandardError $err
        $p.WaitForExit()
        Assert-Equal $p.ExitCode 0 'Start-ToolProcess pnpm --version exit 0 (ExitCode populated)'
        Assert-True ((Get-Content -Raw $out).Trim() -match '^\d+\.\d+\.\d+') 'Start-ToolProcess stdout redirect file holds the version'

        # .cmd wrapped through cmd.exe, args with spaces preserved.
        $cmdDir = Join-Path $tmp 'cmdtool'; New-Item -ItemType Directory -Force -Path $cmdDir | Out-Null
        Set-Content -LiteralPath (Join-Path $cmdDir 'argecho.cmd') -Value "@echo off`r`necho [%~1] [%~2] [%~3]" -Encoding ASCII
        $env:PATH = "$cmdDir;$oldPath"
        try {
            $out2 = Join-Path $tmp 'cmd.out'
            $p = Start-ToolProcess argecho -ArgumentList @('a b', 'c', 'd  e') -RedirectStandardOutput $out2 -RedirectStandardError (Join-Path $tmp 'cmd.err')
            $p.WaitForExit()
            Assert-Equal $p.ExitCode 0 'Start-ToolProcess on a .cmd exits 0'
            Assert-Equal (Get-Content -Raw $out2).Trim() '[a b] [c] [d  e]' 'args with spaces round-trip through cmd.exe /c wrapper'
            $r = Invoke-Tool argecho -ArgumentList @('p q', 'r') -Quiet
            Assert-Equal $r.OutputTail.Trim() '[p q] [r] []' 'args with spaces round-trip through Invoke-Tool on a .cmd'
        }
        finally { $env:PATH = $oldPath }

        $out3 = Join-Path $tmp 'bg.out'
        $p = Start-ToolProcess node -ArgumentList '-e', 'setTimeout(()=>process.exit(3),300)' -RedirectStandardOutput $out3 -RedirectStandardError (Join-Path $tmp 'bg.err')
        Assert-True (-not $p.HasExited) 'Start-ToolProcess returns immediately (background)'
        $p.WaitForExit()
        Assert-Equal $p.ExitCode 3 'background process exit code is readable'
    }

    Run-Section 'Gate capacities' {
        foreach ($k in 'INSTALL', 'BUILD', 'TEST', 'BROWSER', 'EDGE') { [Environment]::SetEnvironmentVariable("FERRUM_SLOTS_$k", $null) }
        Assert-Equal (Get-GateCapacity install) 2 'default install=2'
        Assert-Equal (Get-GateCapacity build) 2 'default build=2'
        Assert-Equal (Get-GateCapacity test) 3 'default test=3'
        Assert-Equal (Get-GateCapacity browser) 3 'default browser=3'
        Assert-Equal (Get-GateCapacity edge) 4 'default edge=4'
        $env:FERRUM_SLOTS_BUILD = '5'
        Assert-Equal (Get-GateCapacity build) 5 'FERRUM_SLOTS_BUILD=5 overrides the default'
        $env:FERRUM_SLOTS_BUILD = 'zero'
        Assert-Throws { Get-GateCapacity build } 'not an integer' 'invalid capacity env var throws'
        [Environment]::SetEnvironmentVariable('FERRUM_SLOTS_BUILD', $null)
        Assert-Throws { Get-GateCapacity bogus } 'unknown kind' 'unknown kind throws'
    }

    Run-Section 'run-gated exit codes and release' {
        $env:FERRUM_SLOTS_EDGE = '1'
        $o = Join-Path $tmp 'rg1.out'; $e = Join-Path $tmp 'rg1.err'
        $p = Start-RunGatedChild edge 'exit7' "node -e 'process.exit(7)'" $o $e
        $p.WaitForExit()
        Assert-Equal $p.ExitCode 7 'run-gated exits with the command exit code (7)'
        $txt = Get-Content -Raw $o
        Assert-True ($txt -match '\[gate-result\] kind=edge label=exit7 slot=1 exit=7') 'run-gated prints a machine-readable [gate-result] line'
        Assert-Equal @(Get-GateFiles edge | Where-Object { $_.Name -match '\.(lock|json)$' }).Count 0 'slot lock/holder files gone after a failing command'

        $p = Start-RunGatedChild edge 'ok' "node -e 'process.exit(0)'" $o $e
        $p.WaitForExit()
        Assert-Equal $p.ExitCode 0 'run-gated returns 0 on success'

        $p = Start-RunGatedChild edge 'missing' 'no-such-tool-xyz-123' $o $e
        $p.WaitForExit()
        Assert-Equal $p.ExitCode 127 'unresolvable tool exits 127'
        Assert-Equal @(Get-GateFiles edge | Where-Object { $_.Name -match '\.(lock|json)$' }).Count 0 'slot released after a tool that failed to start'

        $p = Start-RunGatedChild edge 'dashes' "node -e 'console.log(process.argv.slice(1).join(String.fromCharCode(124)))' -- --filter -t x" $o $e
        $p.WaitForExit()
        Assert-Equal $p.ExitCode 0 'command containing -e / -t / --filter passes through the -- terminator'
        Assert-True ((Get-Content -Raw $o) -match '--filter\|-t\|x') 'dash-prefixed command args arrive verbatim'

        # After all of the above the pool must be immediately usable again.
        $s = Enter-Gate -Kind edge -Label 'reacquire' -TimeoutSec 5 -PollMs 100 -Quiet
        Assert-True ($s.WaitSeconds -lt 3) 'slot immediately re-acquirable (capacity-1 pool) after failed runs'
        Exit-Gate $s
        [Environment]::SetEnvironmentVariable('FERRUM_SLOTS_EDGE', $null)
    }

    Run-Section 'concurrent run-gated waits then proceeds' {
        $env:FERRUM_SLOTS_EDGE = '1'
        $oa = Join-Path $tmp 'ca.out'; $ea = Join-Path $tmp 'ca.err'
        $ob = Join-Path $tmp 'cb.out'; $eb = Join-Path $tmp 'cb.err'
        $a = Start-RunGatedChild edge 'holder-A' "node -e 'setTimeout(()=>process.exit(0),6000)'" $oa $ea
        $held = Wait-Until { @(Get-GateFiles edge | Where-Object { $_.Name -eq '1.json' }).Count -eq 1 } 60
        Assert-True $held 'A acquired the only slot (holder record present)'
        $b = Start-RunGatedChild edge 'waiter-B' "node -e 'process.exit(0)'" $ob $eb 1
        $sawWaiting = Wait-Until { (Test-Path $ob) -and ((Get-Content -Raw $ob) -match "waiting for 'edge' slot") } 40
        Assert-True $sawWaiting 'B prints a periodic waiting line while the slot is held'
        Assert-True (-not $b.HasExited) 'B has not run while A holds the capacity-1 slot'
        $st = @(Get-GateStatus | Where-Object { $_.Kind -eq 'edge' })[0]
        Assert-True ($st.Used -eq 1 -and $st.Capacity -eq 1 -and $st.Waiting -eq 1) "status shows used 1/1 with 1 waiter (used=$($st.Used) cap=$($st.Capacity) waiting=$($st.Waiting))"
        Assert-True ($st.Holders[0].Label -eq 'holder-A' -and $st.Holders[0].PidAlive) 'status names the holder label and pid liveness'
        $a.WaitForExit(); $b.WaitForExit()
        Assert-Equal $a.ExitCode 0 'A exit 0'
        Assert-Equal $b.ExitCode 0 'B proceeded after release and exit 0'
        $bt = Get-Content -Raw $ob
        $m = [regex]::Match($bt, 'wait_s=([\d.]+)')
        Assert-True ($m.Success -and [double]$m.Groups[1].Value -ge 1.0) "B recorded a gate wait >= 1s (wait_s=$($m.Groups[1].Value))"
        Assert-Equal @(Get-GateFiles edge | Where-Object { $_.Name -match '\.(lock|json|q)$' }).Count 0 'no lock/holder/ticket files left after both finished'
        [Environment]::SetEnvironmentVariable('FERRUM_SLOTS_EDGE', $null)
    }

    Run-Section 'stale lock and ticket reclaim' {
        $env:FERRUM_SLOTS_EDGE = '1'
        $dead = Start-ToolProcess node -ArgumentList '-e', 'process.exit(0)'
        $dead.WaitForExit()
        $deadPid = $dead.Id
        Assert-True (-not (Test-PidAlive $deadPid)) "test PID $deadPid is dead"
        $dir = Join-Path $env:FERRUM_SLOTS_DIR 'edge'; $q = Join-Path $dir 'queue'
        New-Item -ItemType Directory -Force -Path $q | Out-Null
        $stale = @{ pid = $deadPid; label = 'ghost'; kind = 'edge'; slot = 1; started = ([DateTime]::UtcNow.AddMinutes(-30).ToString('o')); host = 'x' } | ConvertTo-Json -Compress
        [IO.File]::WriteAllText((Join-Path $dir '1.json'), $stale)
        [IO.File]::WriteAllText((Join-Path $dir '1.lock'), $stale)   # leftover lock file with no live handle
        $ghostTicket = Join-Path $q ('{0:D20}-{1}-deadbeef.q' -f 1, $deadPid)
        Set-Content -LiteralPath $ghostTicket -Value 'ghost' -Encoding ASCII

        $h = @(Get-GateHolders edge)[0]
        Assert-Equal $h.State 'stale' 'status classifies a dead-PID leftover as stale'
        $s = Enter-Gate -Kind edge -Label 'reclaimer' -TimeoutSec 10 -PollMs 100 -Quiet
        Assert-True ($s.Reclaimed -match "pid $deadPid" -and $s.Reclaimed -match 'dead') "stale slot reclaimed and reported ($($s.Reclaimed))"
        Assert-True ($s.WaitSeconds -lt 5) 'reclaim did not wait for the dead holder'
        Assert-True (-not (Test-Path -LiteralPath $ghostTicket)) 'dead-PID queue ticket purged'
        $now = Read-SlotInfo (Join-Path $dir '1.json')
        Assert-Equal $now.pid $PID 'holder record now names the live acquirer'
        Exit-Gate $s
        Assert-Equal @(Get-GateFiles edge | Where-Object { $_.Name -match '\.(lock|json|q)$' }).Count 0 'no lock/holder/ticket files after release'
        [Environment]::SetEnvironmentVariable('FERRUM_SLOTS_EDGE', $null)
    }

    Run-Section 'release after throw, timeout, status' {
        $env:FERRUM_SLOTS_EDGE = '1'
        Assert-Throws { Invoke-Gated -Kind edge -Label 'boom' -Quiet -ScriptBlock { throw 'boom-inside' } } 'boom-inside' 'Invoke-Gated propagates the throw'
        $s = Enter-Gate -Kind edge -Label 'after-throw' -TimeoutSec 3 -PollMs 100 -Quiet
        Assert-True ($s.WaitSeconds -lt 2) 'slot free again immediately after a throw inside the gated block'
        Exit-Gate $s

        $s = Enter-Gate -Kind edge -Label 'holder' -TimeoutSec 3 -PollMs 100 -Quiet
        Assert-Throws { Enter-Gate -Kind edge -Label 'timeouter' -TimeoutSec 1 -PollMs 100 -Quiet } 'timed out after 1 s' 'Enter-Gate on a full pool times out'
        $q = Join-Path (Join-Path $env:FERRUM_SLOTS_DIR 'edge') 'queue'
        Assert-Equal @(Get-ChildItem -LiteralPath $q -Filter '*.q' -ErrorAction SilentlyContinue).Count 0 'timed-out waiter removed its queue ticket'
        $st = @(Get-GateStatus | Where-Object { $_.Kind -eq 'edge' })[0]
        Assert-Equal $st.Used 1 'status shows the holder while held'
        Exit-Gate $s
        $st = @(Get-GateStatus | Where-Object { $_.Kind -eq 'edge' })[0]
        Assert-Equal $st.Used 0 'status shows 0 used after release'
        [Environment]::SetEnvironmentVariable('FERRUM_SLOTS_EDGE', $null)

        $o = Join-Path $tmp 'st.out'
        $p = Start-ToolProcess powershell -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', "& '$runGated' -Status") -RedirectStandardOutput $o -RedirectStandardError (Join-Path $tmp 'st.err')
        $p.WaitForExit()
        $txt = Get-Content -Raw $o
        Assert-Equal $p.ExitCode 0 'run-gated -Status exits 0'
        Assert-True ($txt -match 'install\s+used 0/2' -and $txt -match 'build\s+used 0/2' -and $txt -match 'test\s+used 0/3' -and $txt -match 'browser\s+used 0/3' -and $txt -match 'edge\s+used 0/4') '-Status lists all five pools with default capacities'
        Assert-True ($txt -match 'CPU' -and $txt -match 'free RAM' -and $txt -match 'C: [\d.]+ GB free' -and $txt -match 'D: [\d.]+ GB free') '-Status prints CPU, free RAM and C:/D: free disk'
    }
}
finally {
    $env:PATH = $oldPath
    $env:FERRUM_SLOTS_DIR = $oldSlotsDir
    foreach ($k in $oldEnvCaps.Keys) { [Environment]::SetEnvironmentVariable("FERRUM_SLOTS_$k", $oldEnvCaps[$k]) }
    Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

$total = $script:Pass + $script:Fail
Write-Host "ASSERTIONS: $total total, $($script:Pass) passed, $($script:Fail) failed"
if ($script:Fail -gt 0) { exit 1 }
exit 0
