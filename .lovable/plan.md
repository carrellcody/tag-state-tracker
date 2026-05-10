## Goal

Make the three Unit Information tables (`/Elk-Units`, `/Deer-Units`, `/Antelope-Units`) display the same columns, in the same format and styling, as their OTC counterparts (`/otc-elk`, `/otc-deer`, `/otc-antelope`). Filters stay unique to each page, and the OTC pages continue to filter to OTC units only.

## Scope

Edit only the three Unit table components:
- `src/components/tables/ElkUnitsTable.tsx`
- `src/components/tables/DeerUnitsTable.tsx`
- `src/components/tables/AntelopeUnitsTable.tsx`

No changes to OTC tables, page wrappers, routes, or filter logic on the unit pages.

## Column changes (match OTC layout)

Replace each unit table's `COLUMNS` list with the OTC visible-column set, and adopt the OTC two-row grouped header.

**Elk Units** — match `OTCElkTableNew`:
- Ungrouped (rowSpan=2): `Unit`, `Acres`, `Acres Public`, `DAU`
- Grouped under "DAU-Specific Statistics": `Population`, `DAUAnimalDensity` (Elk Density), `Bull/Cow ratio`, `BullDensity` (Normalized Bull Density (0-1) with `?` help), `Total_Harvest_estimate`, `Success_DAU`

**Deer Units** — match `OTCDeerTableNew`:
- Ungrouped: `Unit`, `Acres`, `Acres Public`, `DAU`
- Grouped: `Post Hunt Estimate`, `DAUAnimalDensity` (Deer Density), `Buck/ Doe ratio (per 100)`, `DAUBuckDensity` (Normalized Buck Density (0-1) with `?` help), `Total_Harvest_estimate`, `Success_DAU`

**Antelope Units** — match `OTCAntelopeTableNew`:
- Ungrouped: `Unit`, `Acres`, `Acres Public`, `DAU`
- Grouped: `Population`, `DAUAnimalDensity` (Pronghorn Density), `Buck/Doe Ratio`, `DAUBuckDensity` (Normalized Buck Density (0-1) with `?` help), `Total_Harvest_estimate`, `Success_DAU`

(Note: this drops the unit-table-only columns `percent_public`, `Herd Name`, and `DAU #` label variant. `percent_public` filtering still works because the data is on each row even though the column is hidden — matching the OTC pages exactly.)

## Cell formatting

Adopt OTC formatting:
- `Success_DAU`: render as `(value * 100).toFixed(1) + '%'` when numeric.
- All other cells: render raw value (no `toLocaleString`, no `toFixed(4)`), matching OTC behavior so the two views look identical for shared rows.

## Header rendering

Use the OTC two-row `<thead>` structure: first row has the ungrouped `<th rowSpan={2}>` cells plus a single `<th colSpan={6}>DAU-Specific Statistics</th>`; second row has the six grouped `<th>` cells. Sort indicators and `TableHeaderHelp` on the normalized density column behave identically to OTC.

## Filters (unchanged per page)

Keep each page's existing filter sidebar exactly as-is:
- Elk Units: Search Units, Min Public %, Min Bull:Cow, DAU multi-select
- Deer Units: Search Units, Min Public %, Min Buck:Doe, DAU multi-select
- Antelope Units: Search Units, Min Public %, Min Buck:Doe, DAU multi-select

No new filters; no removed filters; no OTC season filter on unit pages. Unit pages continue to show all units (not just OTC ones).

## OTC pages

Untouched. They continue to filter rows to those with a non-empty `OTCCat`.

## Out of scope

- CSV files, hooks, and routing
- OTC table components and pages
- Mobile filter behavior, persistence keys, pagination size
