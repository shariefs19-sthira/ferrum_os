param([string]$ProdUrl = '')

$c = & curl.exe -m 3 -s -o NUL -w '%{http_code}' http://localhost:3001/
if ($c -ne '200') { Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Start-Process powershell -ArgumentList '-NoExit','-Command','cd D:\ferrum_os; pnpm --filter ./apps/web start -p 3001'; Start-Sleep -Seconds 10 }

$base = if ($ProdUrl) { $ProdUrl } else { 'http://localhost:3001' }
$routes = @('/','/landintel','/structura','/boq-pro','/promarket','/investflow','/communitybuild','/buildos')

foreach ($r in $routes) { 
    $c = & curl.exe -m 5 -s -o NUL -w '%{http_code}' "$base$r"
    Write-Host "$r -> $c"
}

& curl.exe -m 5 -s -I "$base/" | Select-String 'strict-transport-security|content-security-policy|referrer-policy|permissions-policy|x-content-type-options'