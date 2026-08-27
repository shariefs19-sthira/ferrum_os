$files = @("docs\MASTER_PLAN.md", "docs\IDEA_LOG.md", "docs\AI_WORKFLOW.md", "docs\ACTIVITY_LOG.md", "docs\QUICK_START.md", "docs\PROMPT_MASTER.md")
Write-Host "🔍 Verifying Files..." -ForegroundColor Cyan
foreach ($f in $files) { if (Test-Path $f) { Write-Host "✅ $f" -ForegroundColor Green } else { Write-Host "❌ $f MISSING" -ForegroundColor Red } }
