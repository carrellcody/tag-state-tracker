# Add success-rate trend charts

## Scope
- Create a reusable “Success Rate by Year” line chart matching the existing drawn-out-level chart.
- Plot `PS22Avg`, `PS23Avg`, `PS24Avg`, and `Percent Success` against 2022–2025.
- Display the chart to the right of “Drawn Out Level by Year” on expanded Deer, Elk, and Pronghorn draw rows.
- Stack the charts on narrow screens and keep them side by side at equal width on larger screens.

## Technical details
- Parse percentage values consistently whether the CSV stores decimals, whole percentages, or `%` text.
- Format the vertical axis and tooltip as percentages.
- Reuse the current chart dimensions, colors, typography, grid, line, and point styling.
- Verify the preview build and expanded-row layout.
