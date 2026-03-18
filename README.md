# UniversalDashboard.Pivot

A modern PowerShell Universal custom component based on
[`react-pivottable`](https://github.com/plotly/react-pivottable).

This module enables interactive pivot tables with drag & drop functionality directly inside PowerShell Universal dashboards.

![Showcase](docs/demo.gif)

---

## Features

- Interactive pivot table UI (drag & drop)
- Based on the latest `react-pivottable` (React 19 compatible)
- Works with PowerShell Universal (PSU)
- Minimal required input: `Data`
  - Backward compatibility with the old [`UD-Pivot`](https://github.com/psDevUK/UD-Pivot) version is guaranteed; only `-Data` is required
- Supports:
  - Rows
  - Columns
  - Values
  - Aggregations
  - Filtering
  - Sorting
  - **Plotly charts** (bar, line, pie, scatter, etc.)
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
- restores **full renderer support including Plotly charts**

---

## Installation

> For now, manual way

### Requirements

- Node.js (incl. npm)
- PowerShell Universal
- PowerShell (for Invoke-Build)

---

### Build the component

👉 For detailed setup steps (especially on fresh systems), see:
[docs/BUILD.md](docs/BUILD.md)

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
/output/<version>/
```

---

### Option 1 – Manual (recommended for testing)

Copy the module from `output` folder into your PSU repository:

```
<PSU Repository>/Components/UniversalDashboard.Pivot/<version>
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

Here is a basic example – more can be found in: 👉 [examples/psu-test-page.ps1](examples/psu-test-page.ps1).

Also check the example gifs/pictures in [docs/](docs/)

```powershell
$Data = @(
    @{ Team = 'OPS'; Status = 'Open'; Priority = 'High'; Count = 5 }
    @{ Team = 'OPS'; Status = 'Closed'; Priority = 'Low'; Count = 2 }
    @{ Team = 'DEV'; Status = 'Open'; Priority = 'High'; Count = 8 }
    @{ Team = 'DEV'; Status = 'Closed'; Priority = 'Medium'; Count = 3 }
)

New-UDPivot -Id 'pivot-demo' -Data $Data
```

---

## Parameters

### Required

| Parameter | Description                                  |
| --------- | -------------------------------------------- |
| `Data`    | Input data (array of objects or scriptblock) |

---

### Core

| Parameter        | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `Id`             | Component ID                                           |
| `Rows`           | Row fields                                             |
| `Cols`           | Column fields                                          |
| `Vals`           | Value fields                                           |
| `AggregatorName` | Aggregation function (e.g. Count, Sum)                 |
| `RendererName`   | Renderer type (e.g. Table, Bar Chart, Pie Chart, etc.) |

---

### UI / Behavior

| Parameter                 | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `HiddenAttributes`        | Hide attributes from UI                        |
| `HiddenFromAggregators`   | Hide attributes from aggregator dropdown       |
| `HiddenFromDragDrop`      | Hide attributes from drag & drop area          |
| `MenuLimit`               | Max values shown in filter menu (default: 500) |
| `UnusedOrientationCutoff` | Layout switch threshold (default: 85)          |

---

### Ordering

| Parameter  | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| `RowOrder` | Row sort order (`key_a_to_z`, `value_a_to_z`, `value_z_to_a`)    |
| `ColOrder` | Column sort order (`key_a_to_z`, `value_a_to_z`, `value_z_to_a`) |

---

### Filtering

| Parameter     | Description                     |
| ------------- | ------------------------------- |
| `ValueFilter` | Predefined filter configuration |

---

## Style

To suit my personal needs, I used CSS to give the Pivot component a different look and feel. You can see that in the screenshots. You can find the style i used it in [examples\style.css](examples\style.css)

---

## Notes

- Only `Data` is required; all other parameters are optional
- The component follows the behavior of `react-pivottable`
- For numeric aggregation (e.g. Sum), use a value field
- Plotly renderers are automatically available after build

---

## Known Limitations

- Not all `react-pivottable` props exposed yet
- No powershell module will be created / published to gallery (current state)

---

## Roadmap

- [ ] Add support for additional PivotTableUI props
- [ ] Reduce bundle size (lazy loading / external Plotly)

---

## Credits

- [`react-pivottable`](https://github.com/plotly/react-pivottable)
- [`PivotTable.js`](https://pivottable.js.org/)
- PowerShell Universal / Universal Dashboard ecosystem

---

## License

[MIT (same as react-pivottable)](LICENSE)
