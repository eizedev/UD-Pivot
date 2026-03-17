$Script:AssetId = $null

Get-ChildItem -Path $PSScriptRoot -Filter '*.js' | ForEach-Object {
    $Asset = [UniversalDashboard.Services.AssetService]::Instance.RegisterAsset($_.FullName)

    if ($_.Name -like 'index.*.bundle.js') {
        $Script:AssetId = $Asset
    }
}

function New-UDPivot {
    [CmdletBinding()]
    param(
        [Parameter()]
        [string]$Id = [Guid]::NewGuid().ToString(),

        [Parameter(Mandatory)]
        [object]$Data,

        [Parameter()]
        [string[]]$Rows = @(),

        [Parameter()]
        [string[]]$Cols = @(),

        [Parameter()]
        [string[]]$Vals = @(),

        [Parameter()]
        [string]$AggregatorName = 'Count',

        [Parameter()]
        [string]$RendererName = 'Table'
    )

    if (-not $Script:AssetId) {
        throw 'UniversalDashboard.Pivot JavaScript asset could not be found or registered.'
    }

    $ResolvedData = if ($Data -is [scriptblock]) {
        [object[]](& $Data)
    }
    else {
        [object[]]$Data
    }

    @{
        assetId        = $Script:AssetId
        isPlugin       = $true
        type           = 'ud-pivot'
        id             = $Id
        data           = $ResolvedData
        rows           = $Rows
        cols           = $Cols
        vals           = $Vals
        aggregatorName = $AggregatorName
        rendererName   = $RendererName
    }
}