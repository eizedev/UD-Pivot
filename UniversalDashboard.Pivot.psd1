@{
    RootModule        = 'UniversalDashboard.Pivot.psm1'
    ModuleVersion     = '1.0.0'
    GUID              = '47cbc769-2a6f-469f-a2f8-2520b1e45bab'
    Author            = 'Eizedev'
    CompanyName       = 'Eizedev'
    Copyright         = '(c) 2026 Eizedev. All rights reserved.'
    Description       = 'Pivot component for PowerShell Universal. Create interactive pivot tables based on react-pivottable.'
    PowerShellVersion = '5.1'

    FunctionsToExport = @('New-UDPivot')
    CmdletsToExport   = @()
    VariablesToExport = @()
    AliasesToExport   = @()

    PrivateData       = @{
        PSData = @{
            Tags       = @(
                'PowerShellUniversal'
                'UniversalDashboard'
                'Pivot'
                'React'
                'Visualization'
            )
            LicenseUri = 'https://github.com/eizedev/ud-pivot/blob/master/LICENSE'
            ProjectUri = 'https://github.com/eizedev/ud-pivot'
        }
    }
}