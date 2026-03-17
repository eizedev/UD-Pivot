# Store the registered asset identifier in script scope so it can be reused by the component function
$Script:AssetId = $null

# Discover all JavaScript files within the module directory
$JavaScriptFiles = Get-ChildItem -Path $PSScriptRoot -Recurse -File -Filter '*.js'

# Register all discovered JavaScript assets with PowerShell Universal
foreach ($File in $JavaScriptFiles) {
    $RegisteredAsset = [UniversalDashboard.Services.AssetService]::Instance.RegisterAsset($File.FullName)

    # Capture the main bundle asset id used by the custom component
    if ($File.Name -match '^index\..+\.bundle\.js$') {
        $Script:AssetId = $RegisteredAsset
    }
}

function New-UDPivot {
    <#
.SYNOPSIS
Creates a PivotTable custom component for PowerShell Universal.

.DESCRIPTION
Creates a PowerShell Universal custom component based on react-pivottable.

The function returns the hashtable required by PowerShell Universal to render
the registered JavaScript component in the browser.

The JavaScript bundle must already be present in the module directory and must
have been registered successfully during module import.

.PARAMETER Id
Specifies the unique component identifier.

If not provided, a new GUID is generated automatically.

.PARAMETER Data
Specifies the input data for the pivot table.

This parameter accepts either:
- an array or collection of PowerShell objects
- a script block that returns an array or collection

The resolved data is passed to the React component as the data prop.

.PARAMETER Rows
Specifies the field names that should initially appear in the row area.

.PARAMETER Cols
Specifies the field names that should initially appear in the column area.

.PARAMETER Vals
Specifies the field names that should initially be used as aggregation values.

.PARAMETER AggregatorName
Specifies the initial aggregator name.

The default value is Count.

.PARAMETER RendererName
Specifies the initial renderer name.

The default value is Table.

.PARAMETER HiddenAttributes
Specifies attribute names that should be hidden from the UI.

.PARAMETER HiddenFromAggregators
Specifies attribute names that should be hidden from the aggregator argument dropdowns.

.PARAMETER HiddenFromDragDrop
Specifies attribute names that should be hidden from the drag and drop area.

.PARAMETER MenuLimit
Specifies the maximum number of values shown in the filter menu.

The default value is 500.

.PARAMETER UnusedOrientationCutoff
Specifies when the unused attributes area switches between horizontal and vertical layout.

The default value is 85.

.PARAMETER RowOrder
Specifies the row ordering mode.

Valid values are:
- key_a_to_z
- value_a_to_z
- value_z_to_a

The default value is key_a_to_z.

.PARAMETER ColOrder
Specifies the column ordering mode.

Valid values are:
- key_a_to_z
- value_a_to_z
- value_z_to_a

The default value is key_a_to_z.

.PARAMETER ValueFilter
Specifies predefined filter selections for the pivot table.

This parameter should be a hashtable or object whose keys are attribute names
and whose values are objects containing value-boolean pairs.

.EXAMPLE
New-UDPivot -Data $Data

Creates a pivot table using the provided data collection.

.EXAMPLE
New-UDPivot -Data $Data -Rows @('Team') -Cols @('Status') -Vals @('Count')

Creates a pivot table with predefined rows, columns and values.

.EXAMPLE
New-UDPivot -Data { Get-Process | Select-Object ProcessName, CPU, Id }

Creates a pivot table using data returned from a script block.

.EXAMPLE
New-UDPivot -Data $Data -HiddenAttributes @('InternalId') -MenuLimit 250

Creates a pivot table with selected attributes hidden from the UI and a reduced filter menu size.

.OUTPUTS
System.Collections.Hashtable

.NOTES
The component type name must match the name used in the JavaScript registration:
ud-pivot
#>
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
        [string]$RendererName = 'Table',

        [Parameter()]
        [string[]]$HiddenAttributes = @(),

        [Parameter()]
        [string[]]$HiddenFromAggregators = @(),

        [Parameter()]
        [string[]]$HiddenFromDragDrop = @(),

        [Parameter()]
        [int]$MenuLimit = 500,

        [Parameter()]
        [int]$UnusedOrientationCutoff = 85,

        [Parameter()]
        [ValidateSet('key_a_to_z', 'value_a_to_z', 'value_z_to_a')]
        [string]$RowOrder = 'key_a_to_z',

        [Parameter()]
        [ValidateSet('key_a_to_z', 'value_a_to_z', 'value_z_to_a')]
        [string]$ColOrder = 'key_a_to_z',

        [Parameter()]
        [object]$ValueFilter = @{}
    )

    # Ensure that the JavaScript asset was registered successfully during module import
    if (-not $Script:AssetId) {
        throw 'UniversalDashboard.Pivot JavaScript asset could not be found or registered.'
    }

    # Resolve script block input to an object array for backward compatibility
    $ResolvedData = if ($Data -is [scriptblock]) {
        [object[]](& $Data)
    }
    else {
        [object[]]$Data
    }

    # Return the hashtable consumed by PowerShell Universal for custom components
    @{
        assetId                 = $Script:AssetId
        isPlugin                = $true
        type                    = 'ud-pivot'
        id                      = $Id
        data                    = $ResolvedData
        rows                    = $Rows
        cols                    = $Cols
        vals                    = $Vals
        aggregatorName          = $AggregatorName
        rendererName            = $RendererName
        hiddenAttributes        = $HiddenAttributes
        hiddenFromAggregators   = $HiddenFromAggregators
        hiddenFromDragDrop      = $HiddenFromDragDrop
        menuLimit               = $MenuLimit
        unusedOrientationCutoff = $UnusedOrientationCutoff
        rowOrder                = $RowOrder
        colOrder                = $ColOrder
        valueFilter             = $ValueFilter
    }
}