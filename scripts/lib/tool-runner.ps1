<#
tool-runner.ps1 - reliable native-tool invocation for Windows PowerShell 5.1.
Dot-source it:   . "$PSScriptRoot\lib\tool-runner.ps1"

WHY THIS EXISTS (measured 2026-09-19, MASON-tooling)
  On this box `pnpm` resolves (Get-Command -CommandType Application) to THREE
  files in C:\Users\user\AppData\Roaming\npm: pnpm.cmd, pnpm.ps1 and an
  EXTENSIONLESS `pnpm` (a POSIX sh shim written by npm for Git Bash/WSL).
  A bare `Start-Process pnpm ...` picks the extensionless shim, hands it to
  CreateProcess, and fails with
      "%1 is not a valid Win32 application"
  (That is the redirected / -NoNewWindow path, UseShellExecute=false. Without
  redirection Start-Process instead shell-opens pnpm.ps1 in the .ps1 file
  association - observed as a Notepad window - and -Wait then hangs forever.)
  Direct invocation (`& pnpm --version`) works because the call operator goes
  through PowerShell command discovery (pnpm.cmd / pnpm.ps1), and
  `Start-Process <path>\pnpm.cmd` works because a real .cmd is given. So:

      NEVER write   Start-Process pnpm ...        (invalid on this box)
      NEVER accept the extensionless npm shim as "the tool"

  Use instead:
      Resolve-Tool <name>                 -> full path of a real .exe/.cmd/.bat/.com
      Invoke-Tool <name> <args...>        -> foreground; result object, never swallows the exit code
      Start-ToolProcess <name> <args...>  -> background; returns the System.Diagnostics.Process

CONTRACTS
  Resolve-Tool   Accepts only .exe/.cmd/.bat/.com; prefers .exe, then .cmd, then
                 .bat, then .com; within one extension the PATH order wins.
                 Throws (naming every candidate it saw) if nothing runnable exists.
  Invoke-Tool    Uses the call operator on the resolved path. Returns
                 [pscustomobject] Tool, Path, ExitCode, Seconds, OutputTail,
                 ArgumentList, WorkingDirectory. ExitCode comes straight from
                 $LASTEXITCODE (null after the call -> -1, never assumed 0).
                 Nonzero exit is RETURNED by default; add -ThrowOnError to throw.
                 stdout and stderr are merged (2>&1) and echoed live unless -Quiet.
                 Args: pass them positionally (`Invoke-Tool pnpm install --frozen-lockfile`)
                 or, when an arg is a short single-dash token that PowerShell could
                 read as a parameter prefix (e.g. node's -e), with -ArgumentList:
                 `Invoke-Tool node -ArgumentList '-e','process.exit(7)'`.
                 Args containing spaces are passed intact. Known PowerShell 5.1
                 limits: an EMPTY-string arg is dropped, and embedded double quotes
                 are mangled by the native-argument layer.
  Start-ToolProcess
                 Background start of the resolved real executable; a .cmd/.bat is
                 wrapped as `cmd.exe /d /s /c ""path" args"`. Args are quoted with
                 CommandLineToArgvW rules (Start-Process does NOT quote array
                 elements on 5.1). Optional -RedirectStandardOutput/-Error files.
                 Returns the Process with its handle cached, so .ExitCode is
                 populated after exit (5.1 returns $null otherwise).
#>

$script:ToolExtensionOrder = @('.exe', '.cmd', '.bat', '.com')

function Resolve-Tool {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true, Position = 0)][string]$Name)

    $found = @(Get-Command -Name $Name -CommandType Application -All -ErrorAction SilentlyContinue)
    $seen = @($found | ForEach-Object { $_.Source })

    foreach ($ext in $script:ToolExtensionOrder) {
        foreach ($c in $found) {
            $e = [System.IO.Path]::GetExtension($c.Source)
            if ($e -and $e.ToLowerInvariant() -eq $ext) { return $c.Source }
        }
    }

    if ($seen.Count -eq 0) {
        throw "Resolve-Tool: '$Name' was not found on PATH as an Application (.exe/.cmd/.bat/.com)."
    }
    throw ("Resolve-Tool: '$Name' resolved only to non-runnable file(s): " + ($seen -join '; ') +
        ". Extensionless shims (npm/pnpm POSIX shims) cannot be started with CreateProcess/Start-Process; " +
        "a real .exe/.cmd/.bat/.com is required.")
}

function ConvertTo-QuotedArg {
    # CommandLineToArgvW-compatible quoting of one argument.
    param([AllowEmptyString()][string]$Arg)
    if ($Arg.Length -gt 0 -and $Arg -notmatch '[\s"]') { return $Arg }
    $bs = [char]92
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('"')
    $n = 0
    foreach ($ch in $Arg.ToCharArray()) {
        if ($ch -eq $bs) { $n++; continue }
        if ($ch -eq '"') {
            [void]$sb.Append($bs, ($n * 2 + 1)); [void]$sb.Append('"'); $n = 0; continue
        }
        if ($n -gt 0) { [void]$sb.Append($bs, $n); $n = 0 }
        [void]$sb.Append($ch)
    }
    if ($n -gt 0) { [void]$sb.Append($bs, ($n * 2)) }
    [void]$sb.Append('"')
    return $sb.ToString()
}

function Invoke-Tool {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)][string]$Name,
        [Parameter(Position = 1, ValueFromRemainingArguments = $true)][string[]]$ArgumentList = @(),
        [string]$WorkingDirectory,
        [int]$TailLines = 40,
        [switch]$Quiet,
        [switch]$ThrowOnError
    )

    $exe = Resolve-Tool $Name
    $argv = @($ArgumentList | Where-Object { $null -ne $_ })
    if ($WorkingDirectory -and -not (Test-Path -LiteralPath $WorkingDirectory -PathType Container)) {
        throw "Invoke-Tool: working directory not found: $WorkingDirectory"
    }

    $tail = New-Object 'System.Collections.Generic.Queue[string]'
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'   # native stderr must not become a terminating error on 5.1
    $prevLoc = Get-Location
    $code = $null
    try {
        if ($WorkingDirectory) { Set-Location -LiteralPath $WorkingDirectory }
        $global:LASTEXITCODE = $null
        & $exe @argv 2>&1 | ForEach-Object {
            $line = if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.Exception.Message } else { "$_" }
            $tail.Enqueue($line)
            while ($tail.Count -gt $TailLines) { [void]$tail.Dequeue() }
            if (-not $Quiet) { Write-Host $line }
        }
        $code = $global:LASTEXITCODE
    }
    finally {
        Set-Location -LiteralPath $prevLoc.Path
        $ErrorActionPreference = $prevEap
    }
    $sw.Stop()
    if ($null -eq $code) { $code = -1 }   # never assume success

    $result = [pscustomobject]@{
        Tool             = $Name
        Path             = $exe
        ExitCode         = [int]$code
        Seconds          = [math]::Round($sw.Elapsed.TotalSeconds, 2)
        OutputTail       = (@($tail) -join "`n")
        ArgumentList     = $argv
        WorkingDirectory = $WorkingDirectory
    }
    if ($ThrowOnError -and $result.ExitCode -ne 0) {
        throw ("Invoke-Tool: '$Name' exited with code $($result.ExitCode) after $($result.Seconds)s. Output tail:`n" + $result.OutputTail)
    }
    return $result
}

function Start-ToolProcess {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)][string]$Name,
        [Parameter(Position = 1, ValueFromRemainingArguments = $true)][string[]]$ArgumentList = @(),
        [string]$WorkingDirectory,
        [string]$RedirectStandardOutput,
        [string]$RedirectStandardError,
        [switch]$Visible
    )

    $exe = Resolve-Tool $Name
    $argStr = (@($ArgumentList | Where-Object { $null -ne $_ } | ForEach-Object { ConvertTo-QuotedArg $_ }) -join ' ')
    $ext = [System.IO.Path]::GetExtension($exe).ToLowerInvariant()

    if ($ext -eq '.cmd' -or $ext -eq '.bat') {
        $file = if ($env:ComSpec) { $env:ComSpec } else { 'cmd.exe' }
        $inner = ('"' + $exe + '"') + $(if ($argStr) { ' ' + $argStr } else { '' })
        $startArgs = '/d /s /c "' + $inner + '"'
    }
    else {
        $file = $exe
        $startArgs = $argStr
    }

    $sp = @{ FilePath = $file; PassThru = $true; ErrorAction = 'Stop' }
    if ($startArgs) { $sp.ArgumentList = $startArgs }
    if ($WorkingDirectory) { $sp.WorkingDirectory = $WorkingDirectory }
    if ($RedirectStandardOutput) { $sp.RedirectStandardOutput = $RedirectStandardOutput }
    if ($RedirectStandardError) { $sp.RedirectStandardError = $RedirectStandardError }
    if (-not $Visible) { $sp.WindowStyle = 'Hidden' }

    $p = Start-Process @sp
    $null = $p.Handle   # cache the handle so ExitCode is readable after exit on 5.1
    return $p
}
