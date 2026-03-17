# UniversalDashboard.Pivot

> Currently under development or in the process of being set up...

A modern PowerShell Universal custom component based on
[`react-pivottable`](https://github.com/plotly/react-pivottable).

This module enables interactive pivot tables with drag & drop functionality directly inside PowerShell Universal dashboards.

---

## Features

- Interactive pivot table UI (drag & drop)
- Based on the latest `react-pivottable` (React 19 compatible)
- Works with PowerShell Universal (PSU)
- Supports:
  - Rows
  - Columns
  - Values
  - Aggregations
- Accepts PowerShell objects directly

---

## Background

This project is a **complete rewrite and modernization** of the original:

👉 https://github.com/psDevUK/UD-Pivot

The original module is based on an outdated version of Universal Dashboard and React.

This version:

- updates dependencies to modern React
- rebuilds the component using current PSU custom component standards
- ensures compatibility with current PSU versions (5.6.x+ / 2026.x)

---

## Installation

> For now, manual way

### Requirements

- Node.js (incl. npm)
- PowerShell Universal
- PowerShell (for Invoke-Build)

---

### Build the component

Clone the repository and run:

```
Invoke-Build
```

This will:

- install npm dependencies
- build the JavaScript bundle
- package the PowerShell module

The final module will be generated in:

```
/output/
```

---

### Option 1 – Manual (recommended for testing)

Copy the module from `output` folder into your PSU repository:

```
<PSU Repository>/Components/UniversalDashboard.Pivot/1.0.0
```

Ensure the folder contains:

```
index.<hash>.bundle.js
UniversalDashboard.Pivot.psd1
UniversalDashboard.Pivot.psm1
```

Restart PowerShell Universal.

---

### Option 2 – As PowerShell Module (future)

Planned: installation via `Modules` directory or PSGallery.

---

## Usage

### Example

```powershell
$Data = @(
    @{ Team = 'OPS'; Status = 'Open'; Priority = 'High'; Count = 5 }
    @{ Team = 'OPS'; Status = 'Closed'; Priority = 'Low'; Count = 2 }
    @{ Team = 'DEV'; Status = 'Open'; Priority = 'High'; Count = 8 }
    @{ Team = 'DEV'; Status = 'Closed'; Priority = 'Medium'; Count = 3 }
)

New-UDPivot `
    -Id 'pivot-demo' `
    -Data $Data `
    -Rows @('Team') `
    -Cols @('Status') `
    -Vals @('Count') `
    -AggregatorName 'Count' `
    -RendererName 'Table'
```

---

## Parameters

| Parameter        | Description                                  |
| ---------------- | -------------------------------------------- |
| `Data`           | Input data (array of objects or scriptblock) |
| `Rows`           | Row fields                                   |
| `Cols`           | Column fields                                |
| `Vals`           | Value fields                                 |
| `AggregatorName` | Aggregation function (e.g. Count, Sum)       |
| `RendererName`   | Renderer type (e.g. Table)                   |

---

## Known Limitations

- Only table renderer currently enabled
- Plotly charts not yet integrated
- Not all `react-pivottable` props exposed yet
- No powershell module will be created / published to gallery

---

## Roadmap

- [ ] Add support for additional PivotTableUI props
- [ ] Add Plotly renderers
- [ ] Improve styling / theming integration with PSU
- [ ] Publish as installable module
- [ ] Add full documentation

---

## Credits

- [`react-pivottable`](https://github.com/plotly/react-pivottable)
- [`PivotTable.js`](https://pivottable.js.org/)
- PowerShell Universal / Universal Dashboard ecosystem

---

## License

[MIT (same as react-pivottable)](LICENSE)