$OutputPath = Join-Path $PSScriptRoot 'output'
$PublicPath = Join-Path $PSScriptRoot 'public'
$ManifestPath = Join-Path $PSScriptRoot 'UniversalDashboard.Pivot.psd1'
$ModuleVersion = (Import-PowerShellDataFile -Path $ManifestPath).ModuleVersion.ToString()
$VersionedOutputPath = Join-Path $OutputPath $ModuleVersion

Task Build {
    # Remove previously generated module output
    Remove-Item -Path $OutputPath -Recurse -Force -ErrorAction SilentlyContinue

    # Remove previously generated JavaScript build artifacts
    Remove-Item -Path $PublicPath -Recurse -Force -ErrorAction SilentlyContinue

    # Switch to the project root for npm and build execution
    Push-Location $PSScriptRoot
    try {
        # Install JavaScript dependencies required for the component build
        npm install --legacy-peer-deps

        # Build the JavaScript bundle using the configured webpack pipeline
        npm run build
    }
    finally {
        # Restore the previous working directory
        Pop-Location
    }

    # Create the output directory for the packaged PSU component
    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null

    # Create the versioned output directory based on the module manifest version
    New-Item -Path $VersionedOutputPath -ItemType Directory -Force | Out-Null

    # Copy the generated JavaScript bundle files into the versioned output folder
    Copy-Item -Path (Join-Path $PublicPath '*') -Destination $VersionedOutputPath -Recurse -Force

    # Copy the PowerShell module manifest into the versioned output folder
    Copy-Item -Path $ManifestPath -Destination $VersionedOutputPath -Force

    # Copy the PowerShell module file into the versioned output folder
    Copy-Item -Path (Join-Path $PSScriptRoot 'UniversalDashboard.Pivot.psm1') -Destination $VersionedOutputPath -Force
}

Task . Build