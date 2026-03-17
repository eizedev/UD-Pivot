$OutputPath = Join-Path $PSScriptRoot 'output'
$PublicPath = Join-Path $PSScriptRoot 'public'

Task Build {
    Remove-Item -Path $OutputPath -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $PublicPath -Recurse -Force -ErrorAction SilentlyContinue

    Push-Location $PSScriptRoot
    try {
        npm install --legacy-peer-deps
        npm run build
    }
    finally {
        Pop-Location
    }

    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null

    Copy-Item -Path (Join-Path $PublicPath '*') -Destination $OutputPath -Recurse -Force
    Copy-Item -Path (Join-Path $PSScriptRoot 'UniversalDashboard.Pivot.psd1') -Destination $OutputPath -Force
    Copy-Item -Path (Join-Path $PSScriptRoot 'UniversalDashboard.Pivot.psm1') -Destination $OutputPath -Force
}

Task . Build