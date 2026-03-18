# Build & Development Guide

This document describes the current build and deployment workflow for `UniversalDashboard.Pivot`.

If you only need the quick path and already have Node.js, npm, PowerShell and PSU available, the short version in `README.md` is enough.

If you are setting this up on a fresh system or want the full process from source to working PSU component, follow the steps below.

---

👉 Also please check the official documentation about [Building Custom Components](https://docs.powershelluniversal.com/apps/components/custom-components/building-custom-components)

## Prerequisites

Make sure the following tools are installed and available in your shell:

- Node.js
- npm
- PowerShell
- PowerShell Universal

Recommended:

- Git
- Visual Studio Code

---

## Repository Structure

Important files and folders:

- `Components/`
  - React source files
- `public/`
  - generated JavaScript bundle output from webpack
- `output/`
  - packaged component output for PSU deployment
- `component.build.ps1`
  - PowerShell build orchestration
- `webpack.config.js`
  - JavaScript build configuration
- `UniversalDashboard.Pivot.psm1`
  - PowerShell module implementation
- `UniversalDashboard.Pivot.psd1`
  - PowerShell module manifest

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd UD-Pivot
```

---

## 2. Install Dependencies

Install all required npm packages:

```bash
npm install --legacy-peer-deps
```

Notes:

- `react-pivottable` is the core pivot component
- `react-plotly.js` and `plotly.js` are required for chart renderers
- webpack and babel are used to build the custom PSU component bundle

---

## 3. Build the JavaScript Bundle

Run the webpack build:

```bash
npm run build
```

This generates the bundled frontend assets in:

```
public/
```

Typical output:

- `index.<hash>.bundle.js`
- `index.<hash>.bundle.js.map`
- `index.<hash>.bundle.js.LICENSE.txt`

---

## 4. Build the PSU Component Package

Run the PowerShell build script:

```powershell
Invoke-Build
```

This step will:

- install npm dependencies
- run the webpack build
- read the module version from `UniversalDashboard.Pivot.psd1`
- create a versioned package folder under `output/`
- copy the bundle and PowerShell module files into the final package structure

Result:

```
output/<version>/
```

Typical contents:

- `index.<hash>.bundle.js`
- `index.<hash>.bundle.js.map`
- `index.<hash>.bundle.js.LICENSE.txt`
- `UniversalDashboard.Pivot.psm1`
- `UniversalDashboard.Pivot.psd1`

---

## 5. Deploy to PowerShell Universal

Copy the generated version folder into your PSU components path.

Current manual deployment layout:

```
<PSU Repository>/Components/UniversalDashboard.Pivot/<version>
```

Example:

```
.universal/Components/UniversalDashboard.Pivot/1.0.0
```

Important:

- remove old bundle files from the target folder before copying new ones
- keep only the current bundle version in the deployed component folder
- restart or reload PSU after deployment

---

## 6. Verify the Loaded Bundle

After deployment, verify that PSU is really loading the current bundle:

1. Open browser developer tools
2. Open the Network or Sources tab
3. Locate the loaded file:
   - `<hash>`
4. Compare the hash with the file currently deployed in your PSU component folder

This is important because stale bundle files can cause old behavior to remain visible even after rebuilds.

---

## 7. Import and Use the Component

Import the component module in your PSU app or page:

> It should be automatically imported if using the `Components` (or better) `Modules` folder inside your Repository.

```powershell
Import-Module UniversalDashboard.Pivot
```

Minimal example:

```powershell
$Data = @(
    @{ Team = 'OPS'; Status = 'Open'; Count = 5 }
    @{ Team = 'OPS'; Status = 'Closed'; Count = 2 }
    @{ Team = 'DEV'; Status = 'Open'; Count = 8 }
    @{ Team = 'DEV'; Status = 'Closed'; Count = 3 }
)

New-UDPivot -Id 'pivot-basic' -Data $Data
```

For more complete PSU usage examples, see [/examples/psu-test-page.ps1](/examples/psu-test-page.ps1)

---

## 8. Development Workflow

Typical local workflow during development:

1. Edit React code in `Components/`
2. Edit PowerShell wrapper in `UniversalDashboard.Pivot.psm1`
3. Run:

```powershell
Invoke-Build
```

4. Copy the new `output/<version>/` contents to PSU
5. Restart or reload PSU
6. Hard refresh the browser
7. Re-test the component

---

## Troubleshooting

### Changes are not visible

Possible causes:

- old bundle still exists in the PSU component folder
- browser cache still serves an older file
- PSU has not reloaded the component

Recommended actions:

- delete old deployed bundle files
- copy only the latest output
- restart PSU
- hard refresh browser with cache disabled

---

### Presets behave differently than manual drag & drop

This was caused by mismatches between PowerShell-provided preset names and the actual dataset keys and values.

The current implementation normalizes:

- attribute names
- attribute values
- value filters

based on the incoming dataset before passing them to `PivotTableUI`.

---

### Plotly renderers are missing

Make sure these packages are installed:

```bash
npm install --save react-plotly.js plotly.js
```

Then rebuild:

```powershell
Invoke-Build
```

---

### Bundle size is large

This is expected when Plotly renderers are enabled.

`plotly.js` adds several megabytes to the final bundle. This is currently accepted because functionality is prioritized over bundle size reduction.

---

### Source maps do not load in PSU

PSU may not always serve external source map files correctly through the asset endpoint.

For debugging, an inline source map setup can be used temporarily in `webpack.config.js`.

This is a debugging aid only and not required for production use.

---

## Current Scope

The current wrapper exposes the most relevant practical props for PSU usage, including:

- `Data`
- `Rows`
- `Cols`
- `Vals`
- `AggregatorName`
- `RendererName`
- `HiddenAttributes`
- `HiddenFromAggregators`
- `HiddenFromDragDrop`
- `MenuLimit`
- `UnusedOrientationCutoff`
- `RowOrder`
- `ColOrder`
- `ValueFilter`

Not all `react-pivottable` props are exposed yet. Advanced props such as custom `aggregators`, custom `renderers`, `sorters` and `derivedAttributes` are part of the underlying library but are not yet implemented as a full PowerShell API surface in this wrapper.

---