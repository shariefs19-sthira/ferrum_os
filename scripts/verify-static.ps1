<#
verify-static.ps1 - grep-based guard for static-page constraints under
apps/web/app/resources/**, plus a template-skeleton check for blog articles
and checklists, plus a repo-wide tsc --noEmit. Exits non-zero and prints
offenders on any violation. No ESLint plugin dependency by design.
#>

$ErrorActionPreference = "Stop"

$root = "apps/web/app/resources"
$violations = @()

if (-not (Test-Path $root)) {
    throw "$root not found; run from repo root."
}

$resourceFiles = Get-ChildItem -Path $root -Recurse -Include *.tsx,*.ts -File

# 1. No "use client" under resources/**
foreach ($file in $resourceFiles) {
    $content = Get-Content -Raw -LiteralPath $file.FullName
    if ($content -match '(?m)^\s*["'']use client["'']') {
        $violations += "USE_CLIENT: $($file.FullName)"
    }
}

# 2. No third-party UI library imports under resources/**
# Allowed: relative imports, @/ internal aliases, react, react-dom, next, next/*.
$thirdPartyUiPatterns = @(
    '@radix-ui', '@mui', '@chakra-ui', 'antd', 'react-bootstrap',
    'bootstrap', '@headlessui', 'primereact', '@ant-design',
    'react-aria', '@mantine', 'semantic-ui-react', '@nextui-org',
    'daisyui', 'styled-components', '@emotion'
)
foreach ($file in $resourceFiles) {
    $lines = Get-Content -LiteralPath $file.FullName
    foreach ($line in $lines) {
        if ($line -match '^\s*import .* from\s+["'']([^"'']+)["'']') {
            $importPath = $Matches[1]
            foreach ($pattern in $thirdPartyUiPatterns) {
                if ($importPath -like "$pattern*") {
                    $violations += "THIRD_PARTY_UI_IMPORT ($importPath): $($file.FullName)"
                }
            }
        }
    }
}

function Test-SectionSkeleton {
    param(
        [string]$SectionRoot,
        [string]$SectionLabel,
        [int]$MinH1,
        [int]$MinH2,
        [string]$ExcludeDirName
    )

    $result = @()

    if (-not (Test-Path $SectionRoot)) {
        Write-Host "WARN: no $SectionLabel directory found at $SectionRoot; skipping skeleton check."
        return $result
    }

    $dirs = Get-ChildItem -Path $SectionRoot -Directory
    if ($ExcludeDirName) {
        $dirs = $dirs | Where-Object { $_.Name -ne $ExcludeDirName }
    }

    foreach ($dir in $dirs) {
        $pagePath = Join-Path $dir.FullName "page.tsx"
        if (-not (Test-Path $pagePath)) {
            $result += "MISSING_PAGE (no page.tsx matching $SectionLabel skeleton): $($dir.FullName)"
            continue
        }
        $pageContent = Get-Content -Raw -LiteralPath $pagePath
        $pageH1 = ([regex]::Matches($pageContent, '<h1')).Count
        $pageH2 = ([regex]::Matches($pageContent, '<h2')).Count

        # If <h2> is rendered from a mapped array (e.g. {sections.map(...) => <h2>{section.title}</h2>})
        # the literal source only has one <h2, even though several render at runtime. Fall back to
        # counting "title:" keys in the file as a proxy for section count in that case. This is a
        # heuristic, not a parser — a differently-shaped mapped skeleton can still slip past it.
        if ($pageContent -match '<h2[^>]*>\s*\{') {
            $mappedTitleCount = ([regex]::Matches($pageContent, '(?m)^\s*title:\s*[''"]')).Count
            if ($mappedTitleCount -gt $pageH2) {
                $pageH2 = $mappedTitleCount
            }
        }

        if ($pageH1 -lt $MinH1) {
            $result += "TEMPLATE_MISMATCH (h1 count $pageH1 < $SectionLabel floor $MinH1): $pagePath"
        }
        if ($pageH2 -lt $MinH2) {
            $result += "TEMPLATE_MISMATCH (h2 count $pageH2 < $SectionLabel floor $MinH2): $pagePath"
        }
    }

    return $result
}

# 3. Blog articles must match the _template skeleton (1x <h1, 3x <h2 minimum).
# Note: _template/page.tsx itself has 4x <h2 (3 body sections + Conclusion),
# but the established convention landed across WAVE-2 (see docs/WAVE_QUEUE.md,
# "h1+3 sections each") is h1 + 3 body <h2>s with no separate Conclusion
# heading. Enforcing the template's literal 4 would fail every already-landed
# article, so the floor here is the real convention, not the template file.
$blogTemplatePath = "$root/blog/_template/page.tsx"
if (Test-Path $blogTemplatePath) {
    $violations += Test-SectionSkeleton -SectionRoot "$root/blog" -SectionLabel "blog" -MinH1 1 -MinH2 3 -ExcludeDirName "_template"
} else {
    Write-Host "WARN: no blog _template found at $blogTemplatePath; skipping skeleton check."
}

# 4. Checklists must match the same h1+3-section floor established by
# resources/checklists/structural-punch-list (W2-168). There is no
# _template/ under checklists/ yet, so this floor is inferred from that
# landed page rather than read from a template file; if a checklists
# _template/ is added later, wire it in the same way the blog check is.
$violations += Test-SectionSkeleton -SectionRoot "$root/checklists" -SectionLabel "checklists" -MinH1 1 -MinH2 3 -ExcludeDirName "_template"

if ($violations.Count -gt 0) {
    Write-Host "Static-page constraint violations found:"
    $violations | ForEach-Object { Write-Host "  $_" }
    Write-Host "---"
    Write-Host "Total violations: $($violations.Count)"
    exit 1
}

Write-Host "No static-page constraint violations under $root."

Write-Host "Running repo-wide type-check: pnpm --filter ./apps/web exec tsc --noEmit"
pnpm --filter ./apps/web exec tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "tsc --noEmit failed."
    exit 1
}

Write-Host "verify-static.ps1 passed: no violations, type-check green."
exit 0
