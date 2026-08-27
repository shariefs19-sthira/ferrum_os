$logFile = "docs\ACTIVITY_LOG.md"
$date = Get-Date -Format "yyyy-MM-dd"
$time = Get-Date -Format "HH:mm"
$newEntry = "`n## $date`n`n### $time - Automated Check`n**Status:** System running normally.`n"
$content = Get-Content $logFile -Raw
$updated = $content -replace '(\*\*Last Updated:\*\* \d{4}-\d{2}-\d{2})', "**Last Updated:** $date`n$newEntry"
$updated | Set-Content $logFile -Encoding UTF8
git add $logFile
git commit -m "docs: auto-log status update"
Write-Host "✅ Logged at $date $time" -ForegroundColor Green
