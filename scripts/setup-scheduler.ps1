$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"C:\Users\user\ferrum_os\scripts\auto-log.ps1`""
$trigger = New-ScheduledTaskTrigger -Once (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 2)
Register-ScheduledTask -TaskName "Ferrum OS Logger" -Action $action -Trigger $trigger -Force
Write-Host "✅ Scheduler created (runs every 2 hours)" -ForegroundColor Green
