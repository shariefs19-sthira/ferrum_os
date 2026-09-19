<#
resource-gate.ps1 - named slot pools (file-lock semaphores) that cap how many
heavy jobs of one kind run at once on this box. Dot-source it:
    . "$PSScriptRoot\lib\resource-gate.ps1"

LAYOUT   <root>\<kind>\<n>.lock    OS-level lock, opened FileShare.None + DeleteOnClose
         <root>\<kind>\<n>.json    holder record: pid, label, kind, slot, started (UTC), host
         <root>\<kind>\queue\*.q   FIFO tickets (name = UTC ticks - pid - nonce)
  <root> = $env:FERRUM_SLOTS_DIR, default D:\ferrum_os.worktrees\.slots

WHY A SIDECAR .json: a handle opened FileShare.None blocks every other reader,
so the holder's PID/label/start time (also written into the lock stream itself)
are published in <n>.json for -Status and for stale detection.

SEMANTICS
  * Holding the lock handle IS holding the slot. If the holder process dies the
    OS closes the handle and the slot frees itself; DeleteOnClose removes the file.
  * STALE: a <n>.json (or leftover <n>.lock) whose lock is acquirable is stale.
    Enter-Gate reclaims it, reports the dead/alive PID it recorded, and overwrites it.
  * FIFO-ish: each waiter drops a ticket; only the first (free-slot-count)
    live tickets attempt acquisition. Tickets of dead PIDs are purged.
  * Waiting prints a 'waiting' line every -WaitLineSec; -TimeoutSec bounds the wait.
  * Release order: delete <n>.json, THEN close the handle (so a successor's
    record is never deleted by the previous holder).

CAPACITIES (per box, override with env FERRUM_SLOTS_<KIND>, e.g. FERRUM_SLOTS_BUILD=1)
  install=2  build=2 (next build / full tsc)  test=3 (vitest)
  browser=3 (playwright/chromium)  edge=4 (HTTP-only edge checks)
  A kind not in that table requires FERRUM_SLOTS_<KIND> to be set.
#>

$script:GateDefaults = @{ install = 2; build = 2; test = 3; browser = 3; edge = 4 }

function Get-GateRoot {
    if ($env:FERRUM_SLOTS_DIR) { return $env:FERRUM_SLOTS_DIR }
    return 'D:\ferrum_os.worktrees\.slots'
}

function Get-GateCapacity {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Kind)
    if ($Kind -notmatch '^[a-z][a-z0-9-]*$') { throw "Get-GateCapacity: invalid kind '$Kind' (lowercase letters, digits, '-')." }
    $envName = 'FERRUM_SLOTS_' + $Kind.ToUpperInvariant().Replace('-', '_')
    $raw = [Environment]::GetEnvironmentVariable($envName)
    if ($raw) {
        $n = 0
        if (-not [int]::TryParse($raw, [ref]$n) -or $n -lt 1) { throw "Get-GateCapacity: $envName='$raw' is not an integer >= 1." }
        return $n
    }
    if ($script:GateDefaults.ContainsKey($Kind)) { return [int]$script:GateDefaults[$Kind] }
    throw "Get-GateCapacity: unknown kind '$Kind' (known: $($script:GateDefaults.Keys -join ', ')); set $envName to define it."
}

function Test-PidAlive {
    param([int]$ProcessId)
    if ($ProcessId -le 0) { return $false }
    return [bool](Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)
}

function Open-SlotLock {
    # Returns an open FileStream (slot held) or $null when the slot is busy.
    param([Parameter(Mandatory = $true)][string]$Path)
    try {
        return [System.IO.FileStream]::new($Path, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite,
            [System.IO.FileShare]::None, 4096, [System.IO.FileOptions]::DeleteOnClose)
    }
    catch {
        $inner = $_.Exception
        if ($inner.InnerException) { $inner = $inner.InnerException }
        if ($inner -is [System.IO.IOException] -or $inner -is [System.UnauthorizedAccessException]) { return $null }
        throw
    }
}

function Test-SlotFree {
    # Non-destructive probe: is the slot's lock currently acquirable?
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $true }
    try {
        $fs = [System.IO.FileStream]::new($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
        $fs.Dispose()
        return $true
    }
    catch {
        $inner = $_.Exception
        if ($inner.InnerException) { $inner = $inner.InnerException }
        if ($inner -is [System.IO.FileNotFoundException] -or $inner -is [System.IO.DirectoryNotFoundException]) { return $true }
        return $false
    }
}

function Read-SlotInfo {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    for ($i = 0; $i -lt 3; $i++) {
        try {
            $txt = [System.IO.File]::ReadAllText($Path)
            if ($txt.Trim()) { return ($txt | ConvertFrom-Json) }
            return $null
        }
        catch { Start-Sleep -Milliseconds 50 }
    }
    return $null
}

function Get-AgeSeconds {
    param($Info)
    if (-not $Info -or -not $Info.started) { return $null }
    try {
        $t = [DateTime]::Parse([string]$Info.started, [System.Globalization.CultureInfo]::InvariantCulture,
            [System.Globalization.DateTimeStyles]::RoundtripKind).ToUniversalTime()
        return [int][math]::Round(([DateTime]::UtcNow - $t).TotalSeconds)
    }
    catch { return $null }
}

function Get-GateQueue {
    # Live tickets in FIFO order; tickets of dead PIDs are purged.
    param([Parameter(Mandatory = $true)][string]$QueueDir)
    if (-not (Test-Path -LiteralPath $QueueDir)) { return @() }
    $live = @()
    foreach ($f in @(Get-ChildItem -LiteralPath $QueueDir -Filter '*.q' -File -ErrorAction SilentlyContinue | Sort-Object Name)) {
        $parts = $f.BaseName.Split('-')
        $tpid = 0
        if ($parts.Count -ge 2) { [void][int]::TryParse($parts[1], [ref]$tpid) }
        if (Test-PidAlive $tpid) { $live += $f.FullName }
        else { Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue }
    }
    return $live
}

function Get-GateHolders {
    param([Parameter(Mandatory = $true)][string]$Kind)
    $dir = Join-Path (Get-GateRoot) $Kind
    $cap = Get-GateCapacity $Kind
    $out = @()
    for ($n = 1; $n -le $cap; $n++) {
        $lock = Join-Path $dir "$n.lock"
        $info = Read-SlotInfo (Join-Path $dir "$n.json")
        $free = Test-SlotFree $lock
        $state = 'free'
        if (-not $free) { $state = 'held' }
        elseif ($info) { $state = 'stale' }
        $out += [pscustomobject]@{
            Slot = $n; State = $state
            Pid = $(if ($info) { [int]$info.pid } else { $null })
            Label = $(if ($info) { [string]$info.label } else { $null })
            AgeSec = $(if ($info) { Get-AgeSeconds $info } else { $null })
            PidAlive = $(if ($info) { Test-PidAlive ([int]$info.pid) } else { $null })
        }
    }
    return $out
}

function Enter-Gate {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [string]$Label = 'unlabeled',
        [int]$TimeoutSec = 3600,
        [int]$PollMs = 500,
        [int]$WaitLineSec = 30,
        [switch]$Quiet
    )
    $cap = Get-GateCapacity $Kind
    $dir = Join-Path (Get-GateRoot) $Kind
    $qdir = Join-Path $dir 'queue'
    New-Item -ItemType Directory -Force -Path $qdir | Out-Null

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $nonce = [guid]::NewGuid().ToString('N').Substring(0, 8)
    $ticket = Join-Path $qdir ('{0:D20}-{1}-{2}.q' -f [DateTime]::UtcNow.Ticks, $PID, $nonce)
    Set-Content -LiteralPath $ticket -Value $Label -Encoding ASCII
    $lastLine = 0.0
    $rng = New-Object System.Random
    try {
        while ($true) {
            $queue = @(Get-GateQueue $qdir)
            $rank = [array]::IndexOf($queue, $ticket)
            if ($rank -lt 0) { Set-Content -LiteralPath $ticket -Value $Label -Encoding ASCII; $rank = $queue.Count }

            $free = 0
            for ($n = 1; $n -le $cap; $n++) { if (Test-SlotFree (Join-Path $dir "$n.lock")) { $free++ } }

            if ($rank -lt $free) {
                for ($n = 1; $n -le $cap; $n++) {
                    $lockPath = Join-Path $dir "$n.lock"
                    $stream = Open-SlotLock $lockPath
                    if ($null -eq $stream) { continue }
                    $infoPath = Join-Path $dir "$n.json"
                    $reclaimed = $null
                    $old = Read-SlotInfo $infoPath
                    if ($old) {
                        $alive = Test-PidAlive ([int]$old.pid)
                        $reclaimed = "slot $Kind/$n reclaimed from stale holder pid $($old.pid) '$($old.label)' age $(Get-AgeSeconds $old)s (pid " + $(if ($alive) { 'alive but lock free' } else { 'dead' }) + ')'
                    }
                    $rec = [ordered]@{
                        pid = $PID; label = $Label; kind = $Kind; slot = $n
                        started = [DateTime]::UtcNow.ToString('o'); host = $env:COMPUTERNAME
                    }
                    $json = ($rec | ConvertTo-Json -Compress)
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                    $stream.SetLength(0); $stream.Write($bytes, 0, $bytes.Length); $stream.Flush()
                    [System.IO.File]::WriteAllText($infoPath, $json)
                    if ($reclaimed -and -not $Quiet) { Write-Host "[gate] $reclaimed" }
                    return [pscustomobject]@{
                        Kind = $Kind; Slot = $n; Label = $Label; Capacity = $cap
                        WaitSeconds = [math]::Round($sw.Elapsed.TotalSeconds, 2)
                        Reclaimed = $reclaimed; LockPath = $lockPath; InfoPath = $infoPath; Stream = $stream
                    }
                }
            }

            if ($sw.Elapsed.TotalSeconds -ge $TimeoutSec) {
                throw "Enter-Gate: timed out after $TimeoutSec s waiting for a '$Kind' slot (capacity $cap, label '$Label')."
            }
            if (-not $Quiet -and ($sw.Elapsed.TotalSeconds - $lastLine) -ge $WaitLineSec) {
                $lastLine = $sw.Elapsed.TotalSeconds
                $held = @(Get-GateHolders $Kind | Where-Object { $_.State -eq 'held' } |
                    ForEach-Object { "slot$($_.Slot)=pid$($_.Pid) '$($_.Label)' $($_.AgeSec)s" })
                Write-Host ("[gate] waiting for '$Kind' slot: label '$Label', queue position $($rank + 1) of $($queue.Count), " +
                    "waited $([int]$sw.Elapsed.TotalSeconds)s, holders: " + $(if ($held.Count) { $held -join '; ' } else { 'none visible' }))
            }
            Start-Sleep -Milliseconds ($PollMs + $rng.Next(0, [math]::Max(1, [int]($PollMs / 2))))
        }
    }
    finally {
        Remove-Item -LiteralPath $ticket -Force -ErrorAction SilentlyContinue
    }
}

function Exit-Gate {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)]$Slot)
    if (-not $Slot) { return }
    try { Remove-Item -LiteralPath $Slot.InfoPath -Force -ErrorAction SilentlyContinue } catch { }   # before the handle closes
    try { if ($Slot.Stream) { $Slot.Stream.Dispose() } } catch { }
}

function Invoke-Gated {
    # Acquire, run the scriptblock (it receives the slot), ALWAYS release.
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [string]$Label = 'unlabeled',
        [Parameter(Mandatory = $true)][scriptblock]$ScriptBlock,
        [int]$TimeoutSec = 3600, [int]$PollMs = 500, [int]$WaitLineSec = 30, [switch]$Quiet
    )
    $slot = Enter-Gate -Kind $Kind -Label $Label -TimeoutSec $TimeoutSec -PollMs $PollMs -WaitLineSec $WaitLineSec -Quiet:$Quiet
    try { & $ScriptBlock $slot }
    finally { Exit-Gate $slot }
}

function Get-GateStatus {
    [CmdletBinding()]
    param()
    $root = Get-GateRoot
    $kinds = New-Object System.Collections.Generic.List[string]
    foreach ($k in ($script:GateDefaults.Keys | Sort-Object)) { $kinds.Add($k) }
    if (Test-Path -LiteralPath $root) {
        foreach ($d in @(Get-ChildItem -LiteralPath $root -Directory -ErrorAction SilentlyContinue)) {
            if (-not $kinds.Contains($d.Name) -and $d.Name -match '^[a-z][a-z0-9-]*$') {
                if ($script:GateDefaults.ContainsKey($d.Name) -or [Environment]::GetEnvironmentVariable('FERRUM_SLOTS_' + $d.Name.ToUpperInvariant().Replace('-', '_'))) { $kinds.Add($d.Name) }
            }
        }
    }
    foreach ($k in $kinds) {
        $cap = Get-GateCapacity $k
        $holders = @(Get-GateHolders $k)
        $qdir = Join-Path (Join-Path $root $k) 'queue'
        [pscustomobject]@{
            Kind = $k; Capacity = $cap
            Used = @($holders | Where-Object { $_.State -eq 'held' }).Count
            Stale = @($holders | Where-Object { $_.State -eq 'stale' }).Count
            Waiting = @(Get-GateQueue $qdir).Count
            Holders = $holders
        }
    }
}

function Get-MachineSnapshot {
    $cpu = $null; $freeMb = $null; $totMb = $null
    try {
        $cpu = [int](Get-CimInstance Win32_Processor -ErrorAction Stop | Measure-Object -Property LoadPercentage -Average).Average
    } catch { }
    try {
        $os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
        $freeMb = [int]($os.FreePhysicalMemory / 1024); $totMb = [int]($os.TotalVisibleMemorySize / 1024)
    } catch { }
    $disks = @{}
    foreach ($dl in 'C:', 'D:') {
        try {
            $d = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='$dl'" -ErrorAction Stop
            if ($d) { $disks[$dl] = [math]::Round($d.FreeSpace / 1GB, 1) }
        } catch { }
    }
    [pscustomobject]@{ CpuPercent = $cpu; FreeRamMB = $freeMb; TotalRamMB = $totMb; FreeDiskGB = $disks }
}

function Show-GateStatus {
    [CmdletBinding()]
    param()
    Write-Host "Slot root: $(Get-GateRoot)"
    foreach ($s in @(Get-GateStatus)) {
        Write-Host ("{0,-8} used {1}/{2}  waiting {3}  stale {4}" -f $s.Kind, $s.Used, $s.Capacity, $s.Waiting, $s.Stale)
        foreach ($h in @($s.Holders | Where-Object { $_.State -ne 'free' })) {
            Write-Host ("           slot {0} {1,-5} pid {2} ({3}) age {4}s  {5}" -f $h.Slot, $h.State.ToUpper(), $h.Pid,
                $(if ($h.PidAlive) { 'alive' } else { 'dead' }), $h.AgeSec, $h.Label)
        }
    }
    $m = Get-MachineSnapshot
    $disk = (@($m.FreeDiskGB.Keys | Sort-Object | ForEach-Object { "$_ $($m.FreeDiskGB[$_]) GB free" }) -join ', ')
    Write-Host ("Machine: CPU {0}%  free RAM {1} MB of {2} MB  disk: {3}" -f $m.CpuPercent, $m.FreeRamMB, $m.TotalRamMB, $disk)
}
