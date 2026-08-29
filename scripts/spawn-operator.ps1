<#
NOTE: This script is DEPRECATED. Please use the Node.js version: scripts/spawn-operator.mjs
#>

# PowerShell script to spawn an operator task
# Reads the next OPEN operator task from WAVE_QUEUE.md
# Composes a prompt from the task description and the operator role card
# Launches the interpreter/agent-browser headless
# Logs PID and start time to AGENT_BOARD.md

param (
    [string]$WaveQueuePath = ".\docs\WAVE_QUEUE.md",
    [string]$AgentBoardPath = ".\docs\AGENT_BOARD.md",
    [string]$OperatorRoleCardPath = ".\docs\agents\OPERATOR.md", # Assuming a role card exists or will be created
    [switch]$DryRun = $false
)

# Function to read the next OPEN operator task
function Get-NextOpenOperatorTask {
    param ([string]$FilePath)

    $content = Get-Content $FilePath -Raw
    # Simple parsing, assumes standard markdown table format
    $lines = $content -split "`n"
    $headerIndex = -1
    $taskIndex = @{}

    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^.*\|.*Assigned To.*\|.*Status.*\|.*") {
            $headerIndex = $i
            break
        }
    }

    if ($headerIndex -eq -1) {
        Write-Host "Could not find table header in $FilePath"
        return $null
    }

    # Find column indices
    $headerLine = $lines[$headerIndex]
    $columns = $headerLine -split '\|' | ForEach-Object { $_.Trim() }
    $assignedToColIndex = -1
    $statusColIndex = -1
    $taskIdColIndex = -1
    $domainColIndex = -1 # New column for scope/description

    for ($j = 0; $j -lt $columns.Count; $j++) {
        if ($columns[$j] -eq "Assigned To") { $assignedToColIndex = $j }
        if ($columns[$j] -eq "Status") { $statusColIndex = $j }
        if ($columns[$j] -eq "Task ID") { $taskIdColIndex = $j }
        if ($columns[$j] -eq "J/Domain") { $domainColIndex = $j } # Assume this column holds scope info
    }

    # Fixed bug: use [Math]::Max with individual arguments, not an array
    $maxIndex = [Math]::Max([Math]::Max([Math]::Max($assignedToColIndex, $statusColIndex), $taskIdColIndex), $domainColIndex)

    if ($assignedToColIndex -eq -1 -or $statusColIndex -eq -1 -or $taskIdColIndex -eq -1 -or $domainColIndex -eq -1) {
        Write-Host "Could not find required columns in table header."
        return $null
    }

    # Iterate through data rows
    for ($i = $headerIndex + 2; $i -lt $lines.Count; $i++) { # +2 to skip header and separator line
        $line = $lines[$i]
        if ($line.Trim() -and $line.StartsWith("|")) {
            $cells = $line -split '\|' | ForEach-Object { $_.Trim() }
            # Ensure index is within bounds before accessing
            if ($cells.Count -gt $maxIndex) {
                $assignedTo = $cells[$assignedToColIndex]
                $status = $cells[$statusColIndex]
                $taskId = $cells[$taskIdColIndex]
                $taskDescription = $cells[$domainColIndex] # Use J/Domain column as proxy for description/scopes for now

                if ($status -eq "OPEN" -and $assignedTo -eq "Operator") {
                    Write-Host "Found next open operator task: $taskId with description: $taskDescription"
                    return @{ Id = $taskId; Description = $taskDescription }
                }
            }
        }
    }
    return $null
}

# Function to update AGENT_BOARD.md
function Update-AgentBoard {
    param (
        [string]$BoardPath,
        [string]$Handle,
        [string]$TaskId,
        [string]$Status,
        [string]$OpPid, # Renamed parameter
        [string]$Heartbeat,
        [string]$NextAction
    )

    $boardContent = Get-Content $BoardPath -Raw
    $newRow = "| AG-012 | $Handle | $TaskId | $Status | $Heartbeat | PID: $OpPid, $NextAction |"

    # Find the table body (after the header and separator)
    $lines = $boardContent -split "`n"
    $tableEndIndex = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -notmatch "^\s*\|\s*[-\|]+\s*$" -and $lines[$i] -match "^\s*\|\s*ID\s*\|") {
            # Found header, next non-separator line is the start of body
            $tableBodyStart = $i + 2 # Skip header and separator
            # Find the end of the table (first non-row line)
            for ($j = $tableBodyStart; $j -lt $lines.Count; $j++) {
                 if ($lines[$j] -notmatch "^\s*\|.*\|.*\|.*\|.*\|.*\|\s*$") {
                     $tableEndIndex = $j
                     break
                 }
            }
            if ($tableEndIndex -eq -1) { # If no end found, append to end of file/array
                $tableEndIndex = $lines.Count
            }
            break
        }
    }

    if ($tableEndIndex -ne -1) {
        $newLines = @()
        for ($i = 0; $i -lt $tableEndIndex; $i++) {
            $newLines += $lines[$i]
        }
        $newLines += $newRow
        for ($i = $tableEndIndex; $i -lt $lines.Count; $i++) {
            $newLines += $lines[$i]
        }
        $boardContent = $newLines -join "`n"
        Set-Content -Path $BoardPath -Value $boardContent
        Write-Host "Updated AGENT_BOARD.md for $Handle working on $TaskId."
    } else {
        Write-Host "Could not find table in $BoardPath to update."
    }
}


# --- Main Script Execution ---

Write-Host "Starting Operator Spawner..."

$taskInfo = Get-NextOpenOperatorTask -FilePath $WaveQueuePath

if (-not $taskInfo) {
    Write-Host "No OPEN operator tasks found in $WaveQueuePath. Exiting."
    exit 0
}

$nextTaskId = $taskInfo.Id
$taskDescription = $taskInfo.Description

Write-Host "Next task to process: $nextTaskId with description: $taskDescription"

# --- SCOPE ENFORCEMENT LOGIC ---
# This is a basic example. A full implementation would require a more sophisticated parser
# for the task description to extract specific files, domains, etc.
$scopeFiles = ""
$scopeDomains = ""
$scopeForbiddenOps = "delete, payment, email, prod_push"

# Example: parse description for keywords (this is a stub)
if ($taskDescription -match "QA") {
    $scopeFiles = "apps/web/, docs/"
    $scopeDomains = "localhost:5173, github.com"
}
if ($taskDescription -match "baseline") {
    $scopeFiles = "apps/web/__tests__/visual/"
    $scopeDomains = "localhost:5173"
}

$scopePrompt = @"
You are an AI operator agent. Your task is ID: $nextTaskId.
The task description is: $taskDescription.

You may ONLY touch the following files/directories: $scopeFiles.
You may ONLY visit the following domains/network locations: $scopeDomains.
You may NOT perform the following operations: $scopeForbiddenOps.
If any step of your plan requires you to violate these scope boundaries (e.g., access a disallowed file or domain, perform a forbidden operation),
STOP IMMEDIATELY and log a HUMAN-HOLD request. Do not attempt to proceed or find a workaround on your own.
"@

Write-Host "Generated scope-enforcing prompt for task $nextTaskId"

# Compose command to run the operator with the scope prompt
# Placeholder command, replace with actual interpreter/agent command
# This command should ideally accept the prompt and a scope/allowlist argument
$commandToRun = "echo '$scopePrompt'; echo 'Placeholder for Operator task $nextTaskId execution with scope enforcement.'; sleep 10"

# Print details for Dry Run
if ($DryRun) {
    Write-Host "DRY RUN MODE ENABLED."
    Write-Host "Scope Prompt:"
    Write-Host $scopePrompt
    Write-Host "Command to Run (in real run):"
    Write-Host $commandToRun
    Write-Host "Would attempt to launch with scope: Files=$scopeFiles, Domains=$scopeDomains, Forbidden=$scopeForbiddenOps"
    Write-Host "DRY RUN COMPLETE — nothing launched, nothing written"
    exit 0
}
else {
    # --- REAL RUN PATH ---
    # Start the process headless (background job in PowerShell)
    $job = Start-Job -ScriptBlock { param($cmd) Invoke-Expression $cmd } -ArgumentList $commandToRun

    $opPid = $job.Id # Renamed variable to $opPid as $PID is read-only
    $startTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
    $handle = "Operator"
    $status = "IN-PROGRESS"
    $nextAction = "Running task $nextTaskId with enforced scope"

    Write-Host "Launched operator process for task $nextTaskId with pseudo-PID $opPid."

    # Update the agent board
    Update-AgentBoard -BoardPath $AgentBoardPath -Handle $handle -TaskId $nextTaskId -Status $status -OpPid $opPid -Heartbeat $startTime -NextAction $nextAction

    Write-Host "Operator process for $nextTaskId initiated with scope enforcement."
}