param([string]$ProdUrl = '')

$base = if ($ProdUrl) { $ProdUrl } else { 'http://localhost:3001' }
$routes = @('/','/landintel','/structura','/boq-pro','/promarket','/investflow','/communitybuild','/buildos')

foreach ($r in $routes) { 
    $c = & curl.exe -m 5 -s -o NUL -w '%{http_code}' "$base$r"
    Write-Host "$r -> $c"
}

& curl.exe -m 5 -s -I "$base/" | Select-String 'strict-transport-security|content-security-policy|referrer-policy|permissions-policy|x-content-type-options'
